import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { Patient } from '../entities/patient.entity';

@ApiTags('Patients')
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les patients' })
  async findAll(): Promise<Patient[]> {
    return this.patientService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau patient' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['nom', 'prenom', 'dateNaissance'],
      properties: {
        nom: { type: 'string', example: 'Dupont' },
        prenom: { type: 'string', example: 'Jean' },
        dateNaissance: { type: 'string', example: '1975-06-15' },
        telephone: { type: 'string', example: '0341122334' },
        notes: { type: 'string', example: 'Patient diabétique' },
      },
    },
  })
  async create(@Body() patient: Partial<Patient>): Promise<Patient> {
    return this.patientService.create(patient);
  }

  @Get('test')
  @ApiOperation({ summary: 'Tester la connexion à la base de données' })
  async testConnection(): Promise<string> {
    return this.patientService.testConnection();
  }

  @Post('seed')
  @ApiOperation({ summary: 'Initialiser les patients de démo' })
  async seed(): Promise<any> {
    return this.patientService.seed();
  }
}
