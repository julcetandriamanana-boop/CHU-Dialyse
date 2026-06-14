import {
  Controller, Get, Post, Delete,
  Param, Body, Query, ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiQuery, ApiBody, ApiParam,
} from '@nestjs/swagger';
import { RapportsService } from './rapports.service';

@ApiTags('Rapports')
@Controller('rapports')
export class RapportsController {
  constructor(private readonly service: RapportsService) {}

  // ============================================================
  // ENDPOINTS EXISTANTS CONSERVÉS
  // ============================================================

  @Get()
  @ApiOperation({ summary: 'Liste de tous les rapports sauvegardés' })
  async findAll() {
    return this.service.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques globales en temps réel' })
  @ApiQuery({ name: 'dateDebut', required: false, example: '2024-01-01' })
  @ApiQuery({ name: 'dateFin',   required: false, example: '2024-12-31' })
  async getStats(
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin')   dateFin?: string,
  ) {
    return this.service.getStatsGlobales(dateDebut, dateFin);
  }

  @Post('generer')
  @ApiOperation({ summary: 'Générer un rapport statistique global' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        auteur:  { type: 'string', example: 'Dr. Andrianjato' },
        periode: { type: 'string', example: 'mensuel',
          enum: ['journalier', 'hebdomadaire', 'mensuel', 'trimestriel'] },
      },
    },
  })
  async generer(@Body() data: { auteur?: string; periode?: string }) {
    return this.service.genererRapport(data?.auteur, data?.periode);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un rapport' })
  @ApiParam({ name: 'id', type: Number })
  async supprimer(@Param('id', ParseIntPipe) id: number) {
    await this.service.supprimer(id);
    return { ok: true, message: `Rapport #${id} supprimé` };
  }

  // ============================================================
  // RAPPORT 1 — ACTIVITÉ DIALYSE GLOBALE
  // ============================================================

  @Get('activite-dialyse')
  @ApiOperation({
    summary:     'Rapport activité dialyse globale',
    description: 'Séances, RDV, patients, taux de réalisation, machines utilisées',
  })
  @ApiQuery({ name: 'dateDebut', required: false, example: '2024-01-01' })
  @ApiQuery({ name: 'dateFin',   required: false, example: '2024-12-31' })
  @ApiQuery({ name: 'auteur',    required: false, example: 'Dr. Martin' })
  async activiteDialyse(
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin')   dateFin?: string,
    @Query('auteur')    auteur?: string,
  ) {
    return this.service.getRapportActiviteDialyse(dateDebut, dateFin, auteur);
  }

  // ============================================================
  // RAPPORT 2 — MÉDICAL PATIENT
  // ============================================================

  @Get('medical-patient')
  @ApiOperation({
    summary:     'Rapport médical complet d\'un patient',
    description: 'Historique séances, évolution poids, Kt/V, incidents, risques, prescriptions, soins',
  })
  @ApiQuery({ name: 'patientId', required: true,  example: 1 })
  @ApiQuery({ name: 'dateDebut', required: false,  example: '2024-01-01' })
  @ApiQuery({ name: 'dateFin',   required: false,  example: '2024-12-31' })
  @ApiQuery({ name: 'auteur',    required: false,  example: 'Dr. Martin' })
  async medicalPatient(
    @Query('patientId', ParseIntPipe) patientId: number,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin')   dateFin?: string,
    @Query('auteur')    auteur?: string,
  ) {
    return this.service.getRapportMedicalPatient(patientId, dateDebut, dateFin, auteur);
  }

  // ============================================================
  // RAPPORT 3 — PRESCRIPTIONS
  // ============================================================

  @Get('prescriptions')
  @ApiOperation({
    summary:     'Rapport prescriptions',
    description: 'Validation, délais, top médicaments, performance par médecin',
  })
  @ApiQuery({ name: 'dateDebut', required: false, example: '2024-01-01' })
  @ApiQuery({ name: 'dateFin',   required: false, example: '2024-12-31' })
  @ApiQuery({ name: 'auteur',    required: false, example: 'Dr. Martin' })
  async prescriptions(
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin')   dateFin?: string,
    @Query('auteur')    auteur?: string,
  ) {
    return this.service.getRapportPrescriptions(dateDebut, dateFin, auteur);
  }

  // ============================================================
  // RAPPORT 4 — KITS ET CONSOMMATION
  // ============================================================

  @Get('kits-consommation')
  @ApiOperation({
    summary:     'Rapport kits et consommation matériel',
    description: 'Types kits, articles consommés, top patients, évolution mensuelle',
  })
  @ApiQuery({ name: 'dateDebut', required: false, example: '2024-01-01' })
  @ApiQuery({ name: 'dateFin',   required: false, example: '2024-12-31' })
  @ApiQuery({ name: 'auteur',    required: false, example: 'Dr. Martin' })
  async kitsConsommation(
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin')   dateFin?: string,
    @Query('auteur')    auteur?: string,
  ) {
    return this.service.getRapportKitsConsommation(dateDebut, dateFin, auteur);
  }

  // ============================================================
  // RAPPORT 5 — RDV ET FLUX PATIENTS
  // ============================================================

  @Get('rdv-flux')
  @ApiOperation({
    summary:     'Rapport RDV et flux patients',
    description: 'Présence, absences, annulations, charge médecins, flux horaire',
  })
  @ApiQuery({ name: 'dateDebut', required: false, example: '2024-01-01' })
  @ApiQuery({ name: 'dateFin',   required: false, example: '2024-12-31' })
  @ApiQuery({ name: 'auteur',    required: false, example: 'Dr. Martin' })
  async rdvFlux(
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin')   dateFin?: string,
    @Query('auteur')    auteur?: string,
  ) {
    return this.service.getRapportRdvFlux(dateDebut, dateFin, auteur);
  }

  // ============================================================
  // RAPPORT 6 — SURVEILLANCE CRITIQUE
  // ============================================================

  @Get('surveillance-critique')
  @ApiOperation({
    summary:     'Rapport surveillance critique',
    description: 'Incidents, alertes, patients à risque, performance infirmiers',
  })
  @ApiQuery({ name: 'dateDebut', required: false, example: '2024-01-01' })
  @ApiQuery({ name: 'dateFin',   required: false, example: '2024-12-31' })
  @ApiQuery({ name: 'auteur',    required: false, example: 'Dr. Martin' })
  async surveillanceCritique(
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin')   dateFin?: string,
    @Query('auteur')    auteur?: string,
  ) {
    return this.service.getRapportSurveillanceCritique(dateDebut, dateFin, auteur);
  }

  // ============================================================
  // RAPPORT 7 — PERFORMANCE PERSONNEL
  // ============================================================

  @Get('performance-personnel')
  @ApiOperation({
    summary:     'Rapport performance personnel',
    description: 'Charge infirmiers, médecins, taux validation soins, prescriptions',
  })
  @ApiQuery({ name: 'dateDebut', required: false, example: '2024-01-01' })
  @ApiQuery({ name: 'dateFin',   required: false, example: '2024-12-31' })
  @ApiQuery({ name: 'auteur',    required: false, example: 'Dr. Martin' })
  async performancePersonnel(
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin')   dateFin?: string,
    @Query('auteur')    auteur?: string,
  ) {
    return this.service.getRapportPerformancePersonnel(dateDebut, dateFin, auteur);
  }

  // ============================================================
  // ENDPOINT DÉTAIL RAPPORT SAUVEGARDÉ
  // ============================================================

  @Get(':id')
  @ApiOperation({ summary: 'Détails d\'un rapport sauvegardé par ID' })
  @ApiParam({ name: 'id', type: Number })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }
}
