import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SeanceService } from './seance.service';
import { SeanceHemodialyse } from '../entities/seance-hemodialyse.entity';

@Controller('seances')
export class SeanceController {
  constructor(private readonly service: SeanceService) {}

  @Get()
  async findAll(@Query('patientId') patientId?: number): Promise<SeanceHemodialyse[]> {
    return this.service.findAll(patientId);
  }

  @Get('aujourdhui')
  async getAujourdHui(): Promise<{ total: number; seances: SeanceHemodialyse[] }> {
    return this.service.getAujourdHui();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<SeanceHemodialyse> {
    return this.service.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() data: { patientId: number; date_debut: string; date_fin: string; poids_pre: number; poids_post: number; observations?: string }): Promise<SeanceHemodialyse> {
    return this.service.create(data);
  }

  @Post('seed')
  async seed(): Promise<any> {
    return this.service.seed();
  }
}
