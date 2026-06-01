import {
  Controller, Get, Post, Delete,
  Param, Body, HttpCode, Res, Sse,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationsService } from './notifications.service';

const MY_SERVICE_ID = process.env.DIALYSE_SERVICE_ID || 'd604bde1-c9dd-4284-a690-0c5ed9be6a37';

// ✅ Subject global — émet chaque nouvelle notification en temps réel
export const notificationStream$ = new Subject<any>();

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  // ── SSE — Flux temps réel ──────────────────────────
  @Get('stream')
  @ApiOperation({ summary: 'SSE — Flux temps réel des notifications' })
  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return notificationStream$.pipe(
      map((notif) => ({
        data: JSON.stringify(notif),
        type: 'notification',
      } as MessageEvent)),
    );
  }

  // ── GET toutes ─────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les notifications' })
  async findAll() {
    return this.service.findAll();
  }

  @Get('unread')
  @ApiOperation({ summary: 'Notifications non lues' })
  async findUnread() {
    return this.service.findUnread();
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Nombre de notifications non lues' })
  async unreadCount() {
    return { count: await this.service.getUnreadCount() };
  }

  @Get('poll-external')
  @ApiOperation({ summary: 'Récupérer les nouvelles notifs du service externe' })
  async pollExternal() {
    const count = await this.service.pollExternalNotifications();
    return { synced: count, message: `${count} notification(s) récupérée(s)` };
  }

  // ── POST notification interne ──────────────────────
  @Post()
  @ApiOperation({ summary: 'Créer une notification interne' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'message'],
      properties: {
        title:    { type: 'string',  example: 'Urgence Dialyse' },
        message:  { type: 'string',  example: 'Le patient Rakoto Jean doit être pris en charge immédiatement.' },
        type:     { type: 'string',  example: 'error', enum: ['success', 'error', 'warning', 'info'] },
        category: { type: 'string',  example: 'medical_alert' },
        icon:     { type: 'string',  example: 'emergency' },
        link:     { type: 'string',  example: '/notifications' },
        urgence:  { type: 'number',  example: 5, minimum: 1, maximum: 5 },
      },
    },
  })
  async create(@Body() data: any) {
    const notif = await this.service.create({
      ...data,
      source:            'interne',
      target_service_id: MY_SERVICE_ID,
    });
    // ✅ Émettre en temps réel via SSE
    notificationStream$.next(notif);
    return notif;
  }

  // ── POST webhook externe ───────────────────────────
  @Post('receive')
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook — recevoir une notification externe' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['type', 'motif', 'sourceServiceId'],
      properties: {
        type:              { type: 'string',  example: 'MEDICAL_ALERT' },
        motif:             { type: 'string',  example: 'Patient en détresse' },
        urgence:           { type: 'number',  example: 2, minimum: 1, maximum: 5 },
        sourceServiceId:   { type: 'string',  example: 'service-accueil' },
        sourceServiceName: { type: 'string',  example: 'Accueil' },
        targetServiceId:   { type: 'string',  example: 'd604bde1-c9dd-4284-a690-0c5ed9be6a37' },
        targetServiceName: { type: 'string',  example: 'Service Hémodialyse' },
        emitterId:         { type: 'string',  example: 'user-123' },
        emitterName:       { type: 'string',  example: 'Dr. Martin' },
        recipientName:     { type: 'string',  example: 'Service Hémodialyse' },
        departmentSource:  { type: 'string',  example: 'CHU-Cardio' },
        departmentTarget:  { type: 'string',  example: 'Hémodialyse' },
        patientId:         { type: 'string',  example: 'patient-123' },
        sentAt:            { type: 'string',  example: '2026-05-26T12:45:00Z' },
        entiteRefType:     { type: 'string',  example: 'Ordonnance' },
        entiteRefId:       { type: 'string',  example: 'ord-978' },
        payload:           { type: 'object',  example: { message: 'Alerte critique' } },
        ringtone:          { type: 'string',  example: 'ping' },
        channels:          { type: 'array',   items: { type: 'string' }, example: ['SOUND', 'WEB'] },
      },
    },
  })
  async receive(@Body() payload: any) {
    const notif = await this.service.receiveFromExternalService(payload);
    if (!notif) {
      return { received: false, reason: 'Notification non destinée à ce service' };
    }
    // ✅ Émettre en temps réel via SSE
    notificationStream$.next(notif);
    return { received: true, id: notif.id };
  }

  @Post('send-external')
  @ApiOperation({ summary: 'Envoyer une notification vers un autre service' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        motif:            { type: 'string',  example: 'Séance dialyse terminée' },
        type:             { type: 'string',  example: 'SEANCE_TERMINEE' },
        targetServiceId:  { type: 'string',  example: 'service-cible-uuid' },
        targetServiceName:{ type: 'string',  example: 'Service Cible' },
        urgence:          { type: 'number',  example: 1 },
        patientId:        { type: 'string',  example: 'patient-001' },
        emitterName:      { type: 'string',  example: 'Dr. Andrianjato' },
      },
    },
  })
  async sendExternal(@Body() data: any) {
    return this.service.sendToExternalService(data);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  async markRead(@Param('id') id: number) {
    await this.service.markAsRead(id);
    return { ok: true };
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Tout marquer comme lu' })
  async markAllRead() {
    await this.service.markAllAsRead();
    return { ok: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une notification' })
  async delete(@Param('id') id: number) {
    await this.service.delete(id);
    return { ok: true };
  }

  @Post('seed')
  @ApiOperation({ summary: 'Initialiser les notifications de demo' })
  async seed() {
    return this.service.seed();
  }
}
