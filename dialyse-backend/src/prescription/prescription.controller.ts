import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { PrescriptionService } from './prescription.service';
import { Prescription } from '../entities/prescription.entity';

@ApiTags('Prescriptions')
@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les prescriptions' })
  async findAll(@Query('status') status?: string, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string): Promise<Prescription[]> {
    return this.prescriptionService.findAll({ status, startDate, endDate });
  }

  @Get('en-attente')
  @ApiOperation({ summary: 'Prescriptions en attente et urgentes' })
  async findEnAttente(): Promise<Prescription[]> {
    return this.prescriptionService.findEnAttente();
  }

  @Get('validees')
  @ApiOperation({ summary: 'Prescriptions validées' })
  async findValidees(): Promise<Prescription[]> {
    return this.prescriptionService.findValidees();
  }

  @Post()
  @ApiOperation({ summary: 'Créer une prescription' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        patient: { type: 'object', properties: { id: { type: 'number', example: 1 } } },
        medicament: { type: 'string', example: 'Paracétamol 500mg' },
        dosage: { type: 'string', example: '500 mg' },
        frequence: { type: 'string', example: '3x/jour' },
        date_prescription: { type: 'string', example: '2026-05-15' },
        workflow_statut: { type: 'string', example: 'actif' },
      },
    },
  })
  async create(@Body() prescription: Partial<Prescription>): Promise<Prescription> {
    return this.prescriptionService.create(prescription);
  }

  @Post('valider')
  @ApiOperation({ summary: 'Valider une prescription avec RDV' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        prescriptionId: { type: 'number', example: 1 },
      },
    },
  })
  async valider(@Body() data: { prescriptionId: number }): Promise<any> {
    return this.prescriptionService.valider(data.prescriptionId);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Initialiser les prescriptions de démo' })
  async seed(): Promise<any> {
    return this.prescriptionService.seed();
  }
}
