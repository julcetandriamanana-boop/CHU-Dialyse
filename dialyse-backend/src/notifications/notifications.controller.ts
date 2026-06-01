import {
  Controller, Get, Post, Delete,
  Param, Body, Query, Headers, HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

const MY_SERVICE_ID = process.env.DIALYSE_SERVICE_ID || 'd604bde1-c9dd-4284-a690-0c5ed9be6a37';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  // ── GET toutes les notifications ───────────────
  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les notifications' })
  async findAll() {
    return this.service.findAll();
  }

  // ── GET non lues ───────────────────────────────
  @Get('unread')
  @ApiOperation({ summary: 'Notifications non lues' })
  async findUnread() {
    return this.service.findUnread();
  }

  // ── GET compteur non lues ──────────────────────
  @Get('unread-count')
  @ApiOperation({ summary: 'Nombre de notifications non lues' })
  async unreadCount() {
    return { count: await this.service.getUnreadCount() };
  }

  // ── GET polling externe ────────────────────────
  @Get('poll-external')
  @ApiOperation({ summary: 'Récupérer les nouvelles notifs du service externe' })
  async pollExternal() {
    const count = await this.service.pollExternalNotifications();
    return { synced: count, message: `${count} notification(s) récupérée(s)` };
  }

  // ── POST recevoir depuis service externe ───────
  @Post('receive')
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook — recevoir une notification externe' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type:            { type: 'string', example: 'MEDICAL_ALERT' },
        motif:           { type: 'string', example: 'Patient en détresse' },
        urgence:         { type: 'number', example: 4 },
        sourceServiceId: { type: 'string' },
        targetServiceId: { type: 'string', example: 'd604bde1-c9dd-4284-a690-0c5ed9be6a37' },
      },
    },
  })
  async receive(@Body() payload: any) {
    const notif = await this.service.receiveFromExternalService(payload);
    if (!notif) {
      return { received: false, reason: 'Notification non destinée à ce service' };
    }
    return { received: true, id: notif.id };
  }

  // ── POST envoyer vers service externe ──────────
  @Post('send-external')
  @ApiOperation({ summary: 'Envoyer une notification vers un autre service' })
  async sendExternal(@Body() data: any) {
    return this.service.sendToExternalService(data);
  }

  // ── POST créer notification interne ───────────
  @Post()
  @ApiOperation({ summary: 'Créer une notification interne' })
  async create(@Body() data: any) {
    return this.service.create({
      ...data,
      source:           'interne',
      target_service_id: MY_SERVICE_ID,
    });
  }

  // ── POST marquer lu ────────────────────────────
  @Post(':id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  async markRead(@Param('id') id: number) {
    await this.service.markAsRead(id);
    return { ok: true };
  }

  // ── POST tout marquer lu ───────────────────────
  @Post('read-all')
  @ApiOperation({ summary: 'Tout marquer comme lu' })
  async markAllRead() {
    await this.service.markAllAsRead();
    return { ok: true };
  }

  // ── DELETE supprimer ───────────────────────────
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une notification' })
  async delete(@Param('id') id: number) {
    await this.service.delete(id);
    return { ok: true };
  }

  // ── POST seed ──────────────────────────────────
  @Post('seed')
  @ApiOperation({ summary: 'Initialiser les notifications de démo' })
  async seed() {
    return this.service.seed();
  }
}
