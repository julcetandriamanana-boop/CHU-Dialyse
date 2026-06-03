import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ConstantesService } from './constantes.service';

@ApiTags('Constantes Séance')
@Controller('constantes')
export class ConstantesController {
  constructor(private readonly service: ConstantesService) {}

  @Get('seance/:rendezVousId')
  @ApiOperation({ summary: 'Récupérer les constantes d\'un RDV' })
  async findByRendezVous(@Param('rendezVousId', ParseIntPipe) rendezVousId: number) {
    return this.service.findByRendezVous(rendezVousId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer constantes par ID' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer ou mettre à jour les constantes' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        rendez_vous_id: { type: 'number', example: 20 },
        patient_id:     { type: 'number', example: 3 },
        poids_avant:    { type: 'string', example: '72.5 kg' },
        ta_avant:       { type: 'string', example: '120/80' },
        fc_avant:       { type: 'string', example: '82' },
        temp_avant:     { type: 'string', example: '36.7' },
        o2_avant:       { type: 'string', example: '98%' },
        poids_apres:    { type: 'string', example: '70.1 kg' },
        ta_apres:       { type: 'string', example: '115/75' },
        fc_apres:       { type: 'string', example: '78' },
        temp_apres:     { type: 'string', example: '36.5' },
        o2_apres:       { type: 'string', example: '99%' },
        heparine:       { type: 'string', example: '5000 UI' },
        hbpm:           { type: 'string', example: '4000 UI' },
        dc:             { type: 'string', example: '2.5' },
        de:             { type: 'string', example: '1.5' },
        kt_artere:      { type: 'string', example: 'OK' },
        kt_veine:       { type: 'string', example: 'OK' },
        infirmier_nom:  { type: 'string', example: 'Harisoa M.' },
      },
    },
  })
  async create(@Body() data: any) {
    if (data.rendez_vous_id) {
      return this.service.upsertByRendezVous(data.rendez_vous_id, data);
    }
    return this.service.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour des constantes' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.service.update(id, data);
  }
}
