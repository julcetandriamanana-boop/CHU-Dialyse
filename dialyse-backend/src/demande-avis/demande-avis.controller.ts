import {
  Controller, Get, Post, Put, Param,
  Body, Query, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { DemandeAvisService } from './demande-avis.service';

@ApiTags('Demandes d\'avis')
@Controller('demandes-avis')
export class DemandeAvisController {
  constructor(private readonly service: DemandeAvisService) {}

  // ─── GET toutes ───────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Lister toutes les demandes d\'avis' })
  @ApiQuery({ name: 'statut',               required: false })
  @ApiQuery({ name: 'priorite',             required: false })
  @ApiQuery({ name: 'service_demandeur',    required: false })
  @ApiQuery({ name: 'service_destinataire', required: false })
  @ApiQuery({ name: 'search',              required: false })
  async findAll(
    @Query('statut')               statut?:               string,
    @Query('priorite')             priorite?:             string,
    @Query('service_demandeur')    service_demandeur?:    string,
    @Query('service_destinataire') service_destinataire?: string,
    @Query('search')               search?:               string,
  ) {
    return this.service.findAll({
      statut, priorite, service_demandeur, service_destinataire, search,
    });
  }

  // ─── GET reçues par Dialyse ───────────────────────────────────
  @Get('recues')
  @ApiOperation({
    summary: 'Demandes reçues par le service Dialyse',
    description: 'Filtre automatiquement sur service_destinataire = Dialyse',
  })
  @ApiQuery({ name: 'statut',            required: false, example: 'en_attente' })
  @ApiQuery({ name: 'service_demandeur', required: false, example: 'Cardiologie' })
  @ApiQuery({ name: 'search',            required: false })
  async findRecues(
    @Query('statut')            statut?:            string,
    @Query('service_demandeur') service_demandeur?: string,
    @Query('search')            search?:            string,
  ) {
    return this.service.findRecuesParDialyse({ statut, service_demandeur, search });
  }

  // ─── GET statistiques ─────────────────────────────────────────
  @Get('stats')
  @ApiOperation({ summary: 'Statistiques demandes d\'avis Dialyse' })
  async getStats() {
    return this.service.getStats();
  }

  // ─── GET par ID ───────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une demande d\'avis' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  // ─── POST créer ───────────────────────────────────────────────
  @Post()
  @ApiOperation({ summary: 'Créer une demande d\'avis interservices' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['service_demandeur', 'service_destinataire', 'motif'],
      properties: {
        patient_id:           { type: 'number',  example: 1 },
        service_demandeur:    { type: 'string',  example: 'Cardiologie' },
        service_destinataire: { type: 'string',  example: 'Dialyse', default: 'Dialyse' },
        motif:                { type: 'string',  example: 'Patient avec insuffisance rénale terminale' },
        priorite:             { type: 'string',  example: 'haute', enum: ['basse', 'moyenne', 'haute', 'critique'] },
      },
    },
  })
  async create(@Body() body: {
    patient_id?:          number;
    service_demandeur:    string;
    service_destinataire: string;
    motif:                string;
    priorite?:            string;
  }) {
    return this.service.create(body);
  }

  // ─── PUT répondre ─────────────────────────────────────────────
  @Put(':id/repondre')
  @ApiOperation({ summary: 'Répondre à une demande d\'avis' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['reponse', 'repondu_par'],
      properties: {
        reponse:    { type: 'string', example: 'Recommandation: dialyse 3x/semaine' },
        repondu_par: { type: 'string', example: 'Dr. Andrianjato' },
      },
    },
  })
  async repondre(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reponse: string; repondu_par: string },
  ) {
    return this.service.repondre(id, body);
  }

  // ─── POST seed ────────────────────────────────────────────────
  @Post('seed')
  @ApiOperation({ summary: 'Créer des demandes de démo (Dialyse comme destinataire)' })
  async seed() {
    return this.service.seed();
  }
}
