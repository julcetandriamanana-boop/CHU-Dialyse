import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { DemandeAvis } from './demande-avis.entity';
import { Prescription } from './prescription.entity';
import { RendezVous } from './rendez-vous.entity';
import { SeanceHemodialyse } from './seance-hemodialyse.entity';

// Entité représentant un patient dans la base de données
@Entity('patients') // Nom de la table dans la base de données
export class Patient {
  @PrimaryGeneratedColumn() // Clé primaire auto-générée
  id: number;

  @Column({ type: 'varchar', length: 100 }) // Colonne pour le nom du patient
  nom: string;

  @Column({ type: 'varchar', length: 100 }) // Colonne pour le prénom du patient
  prenom: string;

  @Column({ type: 'date' }) // Colonne pour la date de naissance
  dateNaissance: Date;

  @Column({ type: 'varchar', length: 15, nullable: true }) // Colonne pour le numéro de téléphone (optionnel)
  telephone: string;

  @Column({ type: 'text', nullable: true }) // Colonne pour les notes médicales (optionnel)
  notes: string;

  @OneToMany(() => DemandeAvis, (demandeAvis) => demandeAvis.patient)
  demandes_avis: DemandeAvis[];

  @OneToMany(() => Prescription, (prescription) => prescription.patient)
  prescriptions: Prescription[];

  @OneToMany(() => RendezVous, (rendezVous) => rendezVous.patient)
  rendez_vous: RendezVous[];

  @OneToMany(() => SeanceHemodialyse, (seance) => seance.patient)
  seances: SeanceHemodialyse[];
}