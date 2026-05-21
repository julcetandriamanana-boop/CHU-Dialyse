import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { DemandeAvisService } from './demande-avis.service';
import { DemandeAvis } from '../entities/demande-avis.entity';

@ApiTags('Demandes d\'avis')
@Controller('demandes-avis')
export class DemandeAvisController {
  constructor(private readonly service: DemandeAvisService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les demandes d\'avis' })
  async findAll(@Query('priorite') priorite?: string): Promise<DemandeAvis[]> {
    return this.service.findAll(priorite);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une demande d\'avis' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        patient: { type: 'object', properties: { id: { type: 'number', example: 1 } } },
        description_cas: { type: 'string', example: 'Suspicion de complication rénale' },
        priorite: { type: 'string', example: 'haute' },
        date_envoi: { type: 'string', example: '2026-05-15T10:00:00' },
      },
    },
  })
  async create(@Body() data: Partial<DemandeAvis>): Promise<DemandeAvis> {
    return this.service.create(data);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Initialiser les demandes de démo' })
  async seed(): Promise<any> {
    return this.service.seed();
  }
}
