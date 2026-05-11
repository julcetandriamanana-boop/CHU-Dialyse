import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import du module TypeORM pour la gestion de la base de données
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config'; // Import de la configuration de la base de données
import { PatientModule } from './patient/patient.module'; // Import du module Patient

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig), // Configuration de TypeORM avec les options définies dans database.config.ts
    PatientModule, // Module pour gérer les patients
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
