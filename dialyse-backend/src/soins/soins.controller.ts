import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { SoinsService } from './soins.service';

@ApiTags('Soins Séance')
@Controller('soins')
export class SoinsController {
  constructor(private readonly service: SoinsService) {}

  @Get('seance/:rendezVousId')
  @ApiOperation({ summary: 'Récupérer les soins d\'un RDV' })
  async findByRendezVous(@Param('rendezVousId', ParseIntPipe) rendezVousId: number) {
    return this.service.findByRendezVous(rendezVousId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer soins par ID' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer ou mettre à jour les soins' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        rendez_vous_id:               { type: 'number', example: 20 },
        patient_id:                   { type: 'number', example: 3 },

        acces_type:                   { type: 'string', example: 'FAV' },
        acces_fistule:                { type: 'string', example: 'Bras gauche' },
        acces_thrill_bruit:           { type: 'string', example: 'Présent' },
        acces_rougeur:                { type: 'string', example: 'Non' },
        acces_douleur:                { type: 'string', example: 'Aucune' },
        acces_debit_sanguin:          { type: 'string', example: 'Bon' },
        acces_observation:            { type: 'string', example: 'Accès en bon état' },

        ponction_antiseptique:        { type: 'string', example: 'Chlorhexidine' },
        ponction_rougeur:             { type: 'string', example: 'Non' },
        ponction_saignement:          { type: 'string', example: 'Non' },
        ponction_douleur:             { type: 'string', example: 'Faible' },
        ponction_site:                { type: 'string', example: 'Site propre' },
        ponction_observation:         { type: 'string', example: 'Site propre et sec' },

        pansement_heure_retrait:      { type: 'string', example: '14:45' },
        pansement_compression:        { type: 'string', example: 'Oui' },
        pansement_hemostase:          { type: 'string', example: '8 min' },
        pansement_saignement_arrete:  { type: 'string', example: 'Oui' },
        pansement_type:               { type: 'string', example: 'Compresse stérile' },
        pansement_observation:        { type: 'string', example: 'Normal' },

        infirmier_nom:                { type: 'string', example: 'Harisoa M.' },
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
  @ApiOperation({ summary: 'Mettre à jour les soins' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Post(':id/valider')
  @ApiOperation({ summary: 'Validation infirmier — notifie médecin automatiquement' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        infirmier_nom: { type: 'string', example: 'Harisoa M.' },
      },
    },
  })
  async valider(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.service.validerSoins(id, body?.infirmier_nom);
  }

  @Post(':id/valider-medecin')
  @ApiOperation({ summary: 'Validation médecin' })
  async validerMedecin(@Param('id', ParseIntPipe) id: number) {
    return this.service.validerMedecin(id);
  }
}
