import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandeAvisController } from './demande-avis.controller';
import { DemandeAvisService } from './demande-avis.service';
import { DemandeAvis } from '../entities/demande-avis.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DemandeAvis]),
    NotificationsModule,
  ],
  controllers: [DemandeAvisController],
  providers: [DemandeAvisService],
  exports: [DemandeAvisService],
})
export class DemandeAvisModule {}
