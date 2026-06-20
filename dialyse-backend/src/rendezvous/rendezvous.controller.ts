import { Controller, Get, Post, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Rendez-vous du jour avec statut séance' })
  async aujourdhui(): Promise<RendezVous[]> {
    return this.rendezVousService.findAujourdhui();
  }

  @Get('necessitant-kit')
  @ApiOperation({ summary: 'RDV futurs nécessitant une prescription de kit' })
  async necessitantKit(): Promise<RendezVous[]> {
    return this.rendezVousService.findNecessitantKit();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un rendez-vous' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<RendezVous> {
    return this.rendezVousService.findById(id);
  }

  // ✅ Démarrer une séance
  @Post(':id/demarrer')
  @ApiOperation({ summary: 'Démarrer la séance — statut_seance = en_cours' })
  async demarrer(@Param('id', ParseIntPipe) id: number): Promise<RendezVous> {
    return this.rendezVousService.demarrer(id);
  }

  // ✅ Terminer une séance
  @Post(':id/terminer')
  @ApiOperation({ summary: 'Terminer la séance — statut_seance = terminé' })
  async terminer(@Param('id', ParseIntPipe) id: number): Promise<RendezVous> {
    return this.rendezVousService.terminer(id);
  }

  // ✅ Marquer absent
  @Post(':id/absent')
  @ApiOperation({ summary: 'Marquer patient absent — statut_seance = absent' })
  async absent(@Param('id', ParseIntPipe) id: number): Promise<RendezVous> {
    return this.rendezVousService.marquerAbsent(id);
  }

  @Post('creer')
  @ApiOperation({ summary: 'Créer un rendez-vous' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        patientId:  { type: 'number', example: 1 },
        date_heure: { type: 'string', example: '2026-05-20T08:30:00' },
        motif:      { type: 'string', example: 'Séance de dialyse' },
        statut:     { type: 'string', example: 'confirmé' },
        machine:    { type: 'string', example: 'Machine #02' },
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
