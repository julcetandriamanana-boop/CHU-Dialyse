import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedecinController } from './medecin.controller';
import { MedecinService } from './medecin.service';
import { Medecin } from '../entities/medecin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medecin])],
  controllers: [MedecinController],
  providers: [MedecinService],
})
export class MedecinModule {}
