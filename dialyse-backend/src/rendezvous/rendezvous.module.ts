import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RendezVousController } from './rendezvous.controller';
import { RendezVousService } from './rendezvous.service';
import { RendezVous } from '../entities/rendez-vous.entity';
import { Prescription } from '../entities/prescription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RendezVous, Prescription])],
  controllers: [RendezVousController],
  providers: [RendezVousService],
})
export class RendezVousModule {}
