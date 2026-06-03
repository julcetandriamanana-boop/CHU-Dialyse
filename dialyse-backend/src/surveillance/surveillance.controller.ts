import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { SurveillanceService } from './surveillance.service';

@ApiTags('Surveillance Séance')
@Controller('surveillance')
export class SurveillanceController {
  constructor(private readonly service: SurveillanceService) {}

  @Get('seance/:rendezVousId')
  @ApiOperation({ summary: 'Récupérer la surveillance d\'un RDV' })
  async findByRendezVous(@Param('rendezVousId', ParseIntPipe) rendezVousId: number) {
    return this.service.findByRendezVous(rendezVousId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer surveillance par ID' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer ou mettre à jour la surveillance' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        rendez_vous_id:          { type: 'number', example: 20 },
        patient_id:              { type: 'number', example: 3 },
        orifice_catheter:        { type: 'string', example: 'Bon' },
        kt_v:                    { type: 'string', example: '1.4' },
        volume_sang_traite:      { type: 'string', example: '60 L' },
        delta_vs:                { type: 'string', example: '5%' },
        pru:                     { type: 'string', example: '70%' },
        recirculation:           { type: 'string', enum: ['BONNE', 'MOYENNE', 'MAUVAISE'] },
        temps_compression_veine: { type: 'string', example: '8 min' },
        piege_bulle:             { type: 'string', enum: ['propre', 'caillot'] },
        dealeur:                 { type: 'string', enum: ['propre', 'caillot'] },
        infirmier_nom:           { type: 'string', example: 'Harisoa M.' },
        lignes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              heure:               { type: 'string', example: '30 min' },
              ta:                  { type: 'string', example: '120/80' },
              pouls:               { type: 'string', example: '82' },
              debit_sang:          { type: 'string', example: '300' },
              pression_veineuse:   { type: 'string', example: '150' },
              pression_arterielle: { type: 'string', example: '-180' },
              uf_affiche:          { type: 'string', example: '500' },
              uf_obtenue:          { type: 'string', example: '480' },
              ptm:                 { type: 'string', example: '120' },
              incidents_cliniques: { type: 'string', example: 'RAS' },
            },
          },
        },
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
  @ApiOperation({ summary: 'Mettre à jour la surveillance' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.service.update(id, data);
  }
}
