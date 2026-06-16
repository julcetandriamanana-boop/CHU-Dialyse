import {
  Entity, Column, PrimaryGeneratedColumn,
  ManyToOne, JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Medecin } from './medecin.entity';

@Entity({ name: 'demande_avis' })
export class DemandeAvis {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => Patient, (patient) => patient.demandes_avis, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Medecin, (medecin) => medecin.demandes_emises, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'medecin_emetteur_id' })
  emetteur: Medecin;

  @ManyToOne(() => Medecin, (medecin) => medecin.demandes_recues, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'medecin_destinataire_id' })
  destinataire: Medecin;

  @Column({ type: 'timestamp' })
  date_envoi: Date;

  @Column({ type: 'text' })
  description_cas: string;

  @Column({ type: 'varchar', length: 20, default: 'moyenne' })
  priorite: string;

  @CreateDateColumn()
  created_at: Date;

  // ✅ Champs Archive
  @Column({ type: 'boolean', default: false })
  is_archived: boolean;

  @Column({ type: 'timestamp', nullable: true })
  archived_at: Date | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  archived_by: string | null;

  @Column({ type: 'text', nullable: true })
  archive_motif: string | null;
}
