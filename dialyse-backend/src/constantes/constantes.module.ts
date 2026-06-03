import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstantesSeance } from '../entities/constantes-seance.entity';
import { ConstantesController } from './constantes.controller';
import { ConstantesService } from './constantes.service';

@Module({
  imports: [TypeOrmModule.forFeature([ConstantesSeance])],
  controllers: [ConstantesController],
  providers: [ConstantesService],
  exports: [ConstantesService],
})
export class ConstantesModule {}
