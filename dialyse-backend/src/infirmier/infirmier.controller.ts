import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { InfirmierService } from './infirmier.service';
import { Infirmier } from '../entities/infirmier.entity';

@ApiTags('Infirmiers')
@Controller('infirmiers')
export class InfirmierController {
  constructor(private readonly service: InfirmierService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des infirmiers actifs' })
  async findAll(): Promise<Infirmier[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails d\'un infirmier' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Infirmier> {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel infirmier' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['nom_complet'],
      properties: {
        nom_complet: { type: 'string', example: 'Harisoa M.' },
        matricule:   { type: 'string', example: 'INF-001' },
        telephone:   { type: 'string', example: '0341111111' },
        email:       { type: 'string', example: 'harisoa@chu.mg' },
        service_nom: { type: 'string', example: 'Dialyse' },
      },
    },
  })
  async create(@Body() data: Partial<Infirmier>): Promise<Infirmier> {
    return this.service.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un infirmier' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: Partial<Infirmier>): Promise<Infirmier> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Désactiver un infirmier' })
  async desactiver(@Param('id', ParseIntPipe) id: number): Promise<Infirmier> {
    return this.service.desactiver(id);
  }
}
