import { Controller, Get, Post, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { Patient } from '../entities/patient.entity';

@ApiTags('Patients')
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les patients' })
  @ApiQuery({ name: 'search', required: false })
  async findAll(@Query('search') search?: string): Promise<Patient[]> {
    return this.patientService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un patient par ID' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Patient> {
    return this.patientService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau patient' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['nom', 'prenom'],
      properties: {
        nom:           { type: 'string', example: 'Dupont' },
        prenom:        { type: 'string', example: 'Jean' },
        dateNaissance: { type: 'string', example: '1975-06-15' },
        telephone:     { type: 'string', example: '0341122334' },
        notes:         { type: 'string', example: 'Patient diabétique' },
      },
    },
  })
  async create(@Body() patient: Partial<Patient>): Promise<Patient> {
    return this.patientService.create(patient);
  }

  // ✅ Clôturer le traitement
  @Post(':id/cloturer')
  @ApiOperation({ summary: 'Clôturer le traitement dialyse du patient' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['motif'],
      properties: {
        motif: {
          type: 'string',
          enum: [
            'amelioration_clinique',
            'fin_protocole',
            'transfert_centre',
            'decision_medicale',
            'greffe_renale',
            'autre',
          ],
          example: 'amelioration_clinique',
        },
        notes: {
          type: 'string',
          example: 'Le patient ne nécessite plus de dialyse suite à amélioration.',
        },
      },
    },
  })
  async cloturer(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { motif: string; notes?: string },
  ): Promise<Patient> {
    return this.patientService.cloturerTraitement(id, body.motif, body.notes);
  }

  // ✅ Suspendre le traitement
  @Post(':id/suspendre')
  @ApiOperation({ summary: 'Suspendre le traitement dialyse du patient' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['motif'],
      properties: {
        motif: { type: 'string', example: 'decision_medicale' },
        notes: { type: 'string', example: 'Suspension temporaire.' },
      },
    },
  })
  async suspendre(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { motif: string; notes?: string },
  ): Promise<Patient> {
    return this.patientService.suspendrePTraitement(id, body.motif, body.notes);
  }

  // ✅ Réactiver le traitement
  @Post(':id/reactiver')
  @ApiOperation({ summary: 'Réactiver le traitement dialyse du patient' })
  async reactiver(@Param('id', ParseIntPipe) id: number): Promise<Patient> {
    return this.patientService.reactiverTraitement(id);
  }

  @Get('test')
  @ApiOperation({ summary: 'Tester la connexion DB' })
  async testConnection(): Promise<string> {
    return this.patientService.testConnection();
  }

  @Post('seed')
  @ApiOperation({ summary: 'Initialiser les patients de démo' })
  async seed(): Promise<any> {
    return this.patientService.seed();
  }
}
