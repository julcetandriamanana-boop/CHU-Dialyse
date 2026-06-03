import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SoinsSeance } from '../entities/soins-seance.entity';
import { SoinsController } from './soins.controller';
import { SoinsService } from './soins.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SoinsSeance]),
    NotificationsModule,
  ],
  controllers: [SoinsController],
  providers: [SoinsService],
  exports: [SoinsService],
})
export class SoinsModule {}
