import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MedecinService } from './medecin.service';
import { Medecin } from '../entities/medecin.entity';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('medecins')
export class MedecinController {
  constructor(private readonly medecinService: MedecinService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(): Promise<Medecin[]> {
    return this.medecinService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Medecin> {
    return this.medecinService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() data: Partial<Medecin>): Promise<Medecin> {
    return this.medecinService.create(data);
  }

  @Post('seed')
  async seed(): Promise<any> {
    return this.medecinService.seed();
  }
}
