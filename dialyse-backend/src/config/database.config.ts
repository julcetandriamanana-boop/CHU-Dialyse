import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Configuration de la base de données pour TypeORM
export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql', // Type de base de données : MySQL
  host: 'localhost', // Adresse du serveur MySQL
  port: 3306, // Port par défaut de MySQL
  username: 'root', // Nom d'utilisateur MySQL
  password: 'julcet', // Mot de passe (vide dans ce cas)
  database: 'service_dialyse', // Nom de la base de données
  entities: [__dirname + '/../**/*.entity{.ts,.js}'], // Chemin vers les entités (fichiers .entity.ts)
  synchronize: true, // Synchronisation automatique des tables (utile en développement, à désactiver en production)
  logging: true, // Activer les logs SQL pour le débogage
};