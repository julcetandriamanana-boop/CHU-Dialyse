import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeanceController } from './seance.controller';
import { SeanceService } from './seance.service';
import { SeanceHemodialyse } from '../entities/seance-hemodialyse.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SeanceHemodialyse])],
  controllers: [SeanceController],
  providers: [SeanceService],
})
export class SeanceModule {}
