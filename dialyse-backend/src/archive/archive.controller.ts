import {
  Controller, Get, Post, Param, Body, Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ArchiveService, ModuleArchive } from './archive.service';
import { ArchiveActionDto }              from './dto/archive-action.dto';
import { ArchiveQueryDto }               from './dto/archive-query.dto';

const MODULES_VALIDES: ModuleArchive[] = [
  'patients', 'rendezvous', 'prescriptions', 'kits',
  'seances', 'soins', 'surveillance', 'demandes-avis',
];

@ApiTags('Archives')
@Controller('archives')
export class ArchiveController {
  constructor(private readonly service: ArchiveService) {}

  // ─── GET /archives ────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Lister toutes les archives (tous modules confondus)' })
  @ApiQuery({ name: 'search',    required: false, example: 'Ross' })
  @ApiQuery({ name: 'dateDebut', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'dateFin',   required: false, example: '2026-12-31' })
  @ApiQuery({ name: 'page',      required: false, example: '1' })
  @ApiQuery({ name: 'limit',     required: false, example: '20', description: '10, 20, 25 ou 50' })
  async listerTout(@Query() query: ArchiveQueryDto) {
    return this.service.listerTout(query);
  }

  // ─── GET /archives/statistiques ───────────────────────────────
  @Get('statistiques')
  @ApiOperation({ summary: 'Statistiques globales des archives' })
  async getStatistiques() {
    return this.service.getStatistiques();
  }

  // ─── GET /archives/patients-liste ─────────────────────────────
  @Get('patients-liste')
  @ApiOperation({ summary: 'Liste tous les patients (archivés ou non) pour le select historique' })
  async getTousPatients() {
    return this.service.getTousPatients();
  }

  // ─── GET /archives/patient/:patientId/historique ──────────────
  @Get('patient/:patientId/historique')
  @ApiOperation({ summary: 'Historique complet chronologique d\'un patient' })
  @ApiParam({ name: 'patientId', type: Number, example: 1 })
  async getHistoriquePatient(@Param('patientId', ParseIntPipe) patientId: number) {
    return this.service.getHistoriquePatient(patientId);
  }

  // ─── GET /archives/:module ────────────────────────────────────
  @Get(':module')
  @ApiOperation({ summary: 'Lister les archives d\'un module spécifique' })
  @ApiParam({
    name: 'module',
    enum: ['patients', 'rendezvous', 'prescriptions', 'kits', 'seances', 'soins', 'surveillance', 'demandes-avis'],
    example: 'patients',
  })
  @ApiQuery({ name: 'search',    required: false })
  @ApiQuery({ name: 'dateDebut', required: false })
  @ApiQuery({ name: 'dateFin',   required: false })
  @ApiQuery({ name: 'page',      required: false })
  @ApiQuery({ name: 'limit',     required: false })
  async listerParModule(
    @Param('module') module: string,
    @Query() query: ArchiveQueryDto,
  ) {
    if (!MODULES_VALIDES.includes(module as ModuleArchive)) {
      return { error: `Module invalide. Valeurs acceptées: ${MODULES_VALIDES.join(', ')}` };
    }
    return this.service.listerParModule(module as ModuleArchive, query);
  }

  // ─── POST /archives/:module/:id/archiver ──────────────────────
  @Post(':module/:id/archiver')
  @ApiOperation({ summary: 'Archiver un élément (soft delete médical)' })
  @ApiParam({ name: 'module', example: 'patients' })
  @ApiParam({ name: 'id',     type: Number, example: 1 })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['motif', 'archived_by'],
      properties: {
        motif:       { type: 'string', example: 'Fin de protocole dialyse' },
        archived_by: { type: 'string', example: 'Dr. Andrianjato' },
      },
    },
  })
  async archiver(
    @Param('module') module: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ArchiveActionDto,
  ) {
    if (!MODULES_VALIDES.includes(module as ModuleArchive)) {
      return { error: `Module invalide: ${module}` };
    }
    return this.service.archiver(module as ModuleArchive, id, dto);
  }

  // ─── POST /archives/:module/:id/restaurer ─────────────────────
  @Post(':module/:id/restaurer')
  @ApiOperation({ summary: 'Restaurer un élément archivé' })
  @ApiParam({ name: 'module', example: 'patients' })
  @ApiParam({ name: 'id',     type: Number, example: 1 })
  async restaurer(
    @Param('module') module: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!MODULES_VALIDES.includes(module as ModuleArchive)) {
      return { error: `Module invalide: ${module}` };
    }
    return this.service.restaurer(module as ModuleArchive, id);
  }
}
