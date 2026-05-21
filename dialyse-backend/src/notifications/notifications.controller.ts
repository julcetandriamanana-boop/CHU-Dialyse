import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les notifications' })
  async findAll() { return this.service.findAll(); }

  @Get('unread-count')
  @ApiOperation({ summary: 'Nombre de notifications non lues' })
  async unreadCount() { return { count: await this.service.getUnreadCount() }; }

  @Post()
  @ApiOperation({ summary: 'Créer une notification' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Nouvelle alerte' },
        message: { type: 'string', example: 'Ceci est une notification de test' },
        type: { type: 'string', example: 'info' },
        category: { type: 'string', example: 'systeme' },
        link: { type: 'string', example: '/dashboard' },
        icon: { type: 'string', example: 'notifications' },
      },
    },
  })
  async create(@Body() data: any) { return this.service.create(data); }

  @Post(':id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  async markRead(@Param('id') id: number) { await this.service.markAsRead(id); return { ok: true }; }

  @Post('read-all')
  @ApiOperation({ summary: 'Tout marquer comme lu' })
  async markAllRead() { await this.service.markAllAsRead(); return { ok: true }; }

  @Post('seed')
  @ApiOperation({ summary: 'Initialiser les notifications de démo' })
  async seed() { return this.service.seed(); }
}
