import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';

import { PatientModule }              from './patient/patient.module';
import { PrescriptionModule }         from './prescription/prescription.module';
import { RendezVousModule }           from './rendezvous/rendezvous.module';
import { NotificationsModule }        from './notifications/notifications.module';
import { SeanceModule }               from './seance/seance.module';
import { MedecinModule }              from './medecin/medecin.module';
import { ConstantesModule }           from './constantes/constantes.module';
import { SurveillanceModule }         from './surveillance/surveillance.module';
import { SoinsModule }                from './soins/soins.module';
import { PrescriptionKitEnvoyeeModule } from './prescription-kit-envoyee/prescription-kit-envoyee.module';
import { RapportsModule }             from './rapports/rapports.module';
import { InfirmierModule }            from './infirmier/infirmier.module';
import { ArchiveModule }              from './archive/archive.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    PatientModule,
    PrescriptionModule,
    RendezVousModule,
    NotificationsModule,
    MedecinModule,
    SeanceModule,
    ConstantesModule,
    SurveillanceModule,
    SoinsModule,
    PrescriptionKitEnvoyeeModule,
    RapportsModule,
    InfirmierModule,
    ArchiveModule,
  ],
  controllers: [AppController],
  providers:   [AppService],
})
export class AppModule {}
