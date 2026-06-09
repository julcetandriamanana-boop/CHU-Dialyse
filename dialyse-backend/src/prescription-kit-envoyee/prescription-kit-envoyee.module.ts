import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescriptionKitEnvoyee } from '../entities/prescription-kit-envoyee.entity';
import { PrescriptionKitEnvoyeeController } from './prescription-kit-envoyee.controller';
import { PrescriptionKitEnvoyeeService } from './prescription-kit-envoyee.service';

@Module({
  imports: [TypeOrmModule.forFeature([PrescriptionKitEnvoyee])],
  controllers: [PrescriptionKitEnvoyeeController],
  providers: [PrescriptionKitEnvoyeeService],
  exports: [PrescriptionKitEnvoyeeService],
})
export class PrescriptionKitEnvoyeeModule {}
