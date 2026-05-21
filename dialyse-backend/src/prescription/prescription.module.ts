import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescriptionController } from './prescription.controller';
import { PrescriptionService } from './prescription.service';
import { Prescription } from '../entities/prescription.entity';
import { PrescriptionStatusHistory } from '../entities/prescription-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prescription, PrescriptionStatusHistory])],
  controllers: [PrescriptionController],
  providers: [PrescriptionService],
})
export class PrescriptionModule {}
