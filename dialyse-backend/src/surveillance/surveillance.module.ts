import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveillanceSeance } from '../entities/surveillance-seance.entity';
import { SurveillanceLigne } from '../entities/surveillance-ligne.entity';
import { SurveillanceController } from './surveillance.controller';
import { SurveillanceService } from './surveillance.service';

@Module({
  imports: [TypeOrmModule.forFeature([SurveillanceSeance, SurveillanceLigne])],
  controllers: [SurveillanceController],
  providers: [SurveillanceService],
  exports: [SurveillanceService],
})
export class SurveillanceModule {}
