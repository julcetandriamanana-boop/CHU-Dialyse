import { Controller, Get, Post, Body } from '@nestjs/common';
import { PatientService } from './patient.service';
import { Patient } from '../entities/patient.entity';

@Controller('patients') // Route de base pour les patients
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  // Route GET /patients pour obtenir tous les patients
  @Get()
  async findAll(): Promise<Patient[]> {
    return this.patientService.findAll();
  }

  // Route POST /patients pour créer un nouveau patient
  @Post()
  async create(@Body() patient: Partial<Patient>): Promise<Patient> {
    return this.patientService.create(patient);
  }

  // Route GET /patients/test pour tester la connexion à la base de données
  @Get('test')
  async testConnection(): Promise<string> {
    return this.patientService.testConnection();
  }
}