import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { PrescriptionKitEnvoyeeService } from './prescription-kit-envoyee.service';

@ApiTags('Prescription Kit Envoyée')
@Controller('prescription-kit-envoyee')
export class PrescriptionKitEnvoyeeController {
  constructor(private readonly service: PrescriptionKitEnvoyeeService) {}

  @Get()
  @ApiOperation({ summary: 'Liste de tous les kits envoyés' })
  async findAll() {
    return this.service.findAll();
  }

  @Get('patients-status')
  @ApiOperation({ summary: 'Map { patientId: { count, dernier } } pour patients ayant envoyé kit' })
  async getPatientsStatus() {
    return this.service.getPatientsAvecKitEnvoye();
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Kits envoyés pour un patient' })
  async findByPatient(@Param('patientId', ParseIntPipe) patientId: number) {
    return this.service.findByPatient(patientId);
  }

  @Post()
  @ApiOperation({ summary: 'Enregistrer un kit envoyé' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        patient_id:              { type: 'number', example: 3 },
        rendez_vous_id:          { type: 'number', example: 20 },
        kit_id:                  { type: 'string', example: 'eb459e8d-4f8b-4d13-bd4a-c2ce95b01362' },
        kit_nom:                 { type: 'string', example: 'Kit Hémodialyse (Don 1ère Séance)' },
        type_kit:                { type: 'string', example: 'premiere' },
        ordonnance_pharmacie_id: { type: 'string', example: 'ord-uuid' },
        articles_count:          { type: 'number', example: 20 },
        emetteur_id:             { type: 'number', example: 1 },
        emetteur_nom:            { type: 'string', example: 'Harisoa M.' },
        emetteur_role:           { type: 'string', example: 'infirmier' },
      },
    },
  })
  async create(@Body() data: any) {
    return this.service.create(data);
  }
}
