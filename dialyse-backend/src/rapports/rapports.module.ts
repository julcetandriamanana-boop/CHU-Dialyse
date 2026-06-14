import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entités existantes
import { Rapport }                from '../entities/rapport.entity';
import { Patient }                from '../entities/patient.entity';
import { Prescription }           from '../entities/prescription.entity';
import { RendezVous }             from '../entities/rendez-vous.entity';
import { PrescriptionKitEnvoyee } from '../entities/prescription-kit-envoyee.entity';
import { Notification }           from '../entities/notification.entity';

// Entités ajoutées pour rapports avancés
import { SeanceHemodialyse }      from '../entities/seance-hemodialyse.entity';
import { SurveillanceSeance }     from '../entities/surveillance-seance.entity';
import { SurveillanceLigne }      from '../entities/surveillance-ligne.entity';
import { SoinsSeance }            from '../entities/soins-seance.entity';
import { Medecin }                from '../entities/medecin.entity';
import { Infirmier }              from '../entities/infirmier.entity';

import { RapportsController }     from './rapports.controller';
import { RapportsService }        from './rapports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Existants
      Rapport,
      Patient,
      Prescription,
      RendezVous,
      PrescriptionKitEnvoyee,
      Notification,
      // Nouveaux
      SeanceHemodialyse,
      SurveillanceSeance,
      SurveillanceLigne,
      SoinsSeance,
      Medecin,
      Infirmier,
    ]),
  ],
  controllers: [RapportsController],
  providers:   [RapportsService],
  exports:     [RapportsService],
})
export class RapportsModule {}
