import { Module }           from '@nestjs/common';
import { TypeOrmModule }    from '@nestjs/typeorm';

import { Patient }                from '../entities/patient.entity';
import { RendezVous }             from '../entities/rendez-vous.entity';
import { Prescription }           from '../entities/prescription.entity';
import { PrescriptionKitEnvoyee } from '../entities/prescription-kit-envoyee.entity';
import { SeanceHemodialyse }      from '../entities/seance-hemodialyse.entity';
import { SoinsSeance }            from '../entities/soins-seance.entity';
import { SurveillanceSeance }     from '../entities/surveillance-seance.entity';
import { DemandeAvis }            from '../entities/demande-avis.entity';
import { Notification }           from '../entities/notification.entity';

import { NotificationsModule }   from '../notifications/notifications.module';
import { ArchiveController }     from './archive.controller';
import { ArchiveService }        from './archive.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      RendezVous,
      Prescription,
      PrescriptionKitEnvoyee,
      SeanceHemodialyse,
      SoinsSeance,
      SurveillanceSeance,
      DemandeAvis,
      Notification,
    ]),
    NotificationsModule,
  ],
  controllers: [ArchiveController],
  providers:   [ArchiveService],
  exports:     [ArchiveService],
})
export class ArchiveModule {}
