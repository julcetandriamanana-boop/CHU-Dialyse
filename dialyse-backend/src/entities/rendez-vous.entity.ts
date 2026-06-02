import {
  Entity, Column, PrimaryGeneratedColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Medecin } from './medecin.entity';

export type StatutRdv     = 'planifié' | 'confirmé' | 'annulé';
export type StatutSeance  = 'en_attente' | 'en_cours' | 'terminé' | 'absent';

@Entity({ name: 'rendez_vous' })
export class RendezVous {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => Patient, (p) => p.rendez_vous, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Medecin, (m) => m.rendez_vous, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'medecin_id' })
  medecin: Medecin;

  @Column({ type: 'timestamp' })
  date_heure: Date;

  @Column({ type: 'varchar', length: 255 })
  motif: string;

  @Column({ type: 'varchar', length: 20, default: 'planifié' })
  statut: string;

  @Column({ type: 'int', nullable: true })
  numero_seance: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  machine: string;

  @Column({ type: 'text', nullable: true })
  soso_kevitra_malalaka: string;

  // ✅ Nouveaux champs séance
  @Column({ type: 'varchar', length: 20, default: 'en_attente', nullable: true })
  statut_seance: string;

  @Column({ type: 'timestamp', nullable: true })
  heure_debut_reelle: Date;

  @Column({ type: 'timestamp', nullable: true })
  heure_fin_reelle: Date;
}
