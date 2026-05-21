import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { RendezVousService } from './rendezvous.service';
import { RendezVous } from '../entities/rendez-vous.entity';

@ApiTags('Rendez-vous')
@Controller('rendezvous')
export class RendezVousController {
  constructor(private readonly rendezVousService: RendezVousService) {}

  @Get()
  async findAll(@Query('patientId') patientId?: number): Promise<RendezVous[]> {
    return this.rendezVousService.findAll(patientId);
  }

  @Get('aujourdhui')
  @ApiOperation({ summary: 'Rendez-vous du jour' })
  async aujourdhui(): Promise<RendezVous[]> {
    return this.rendezVousService.findAujourdhui();
  }

  @Post('creer')
  @ApiOperation({ summary: 'Créer un rendez-vous' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        patientId: { type: 'number', example: 1 },
        date_heure: { type: 'string', example: '2026-05-20T08:30:00' },
        motif: { type: 'string', example: 'Séance de dialyse' },
        statut: { type: 'string', example: 'confirmé' },
        creneau: { type: 'string', example: 'Matin' },
        machine: { type: 'string', example: 'Machine #02' },
      },
    },
  })
  async creer(@Body() data: any): Promise<RendezVous> {
    return this.rendezVousService.creer(data);
  }

  @Post()
  async create(@Body() data: Partial<RendezVous>): Promise<RendezVous> {
    return this.rendezVousService.create(data);
  }

  @Post('seed')
  async seed(): Promise<any> {
    return this.rendezVousService.seed();
  }
}
