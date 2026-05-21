import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandeAvisController } from './demande-avis.controller';
import { DemandeAvisService } from './demande-avis.service';
import { DemandeAvis } from '../entities/demande-avis.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DemandeAvis])],
  controllers: [DemandeAvisController],
  providers: [DemandeAvisService],
})
export class DemandeAvisModule {}
