import {
  Entity, Column, PrimaryGeneratedColumn,
  ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Medecin } from './medecin.entity';

@Entity({ name: 'demande_avis' })
export class DemandeAvis {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => Patient, (patient) => patient.demandes_avis, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient | null;

  // ✅ Compatibilité ancien modèle médecin → médecin
  @ManyToOne(() => Medecin, (medecin) => medecin.demandes_emises, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'medecin_emetteur_id' })
  emetteur: Medecin | null;

  @ManyToOne(() => Medecin, (medecin) => medecin.demandes_recues, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'medecin_destinataire_id' })
  destinataire: Medecin | null;

  // ✅ Nouveau modèle interservices
  @Column({ type: 'varchar', length: 100, nullable: true })
  service_demandeur: string | null;

  @Column({ type: 'varchar', length: 100, default: 'Dialyse', nullable: true })
  service_destinataire: string | null;

  @Column({ type: 'text', nullable: true })
  motif: string | null;

  @Column({ type: 'varchar', length: 20, default: 'en_attente', nullable: true })
  statut: string | null; // en_attente | repondu

  @Column({ type: 'text', nullable: true })
  reponse: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  repondu_par: string | null;

  @Column({ type: 'timestamp', nullable: true })
  repondu_at: Date | null;

  // ✅ Anciens champs conservés pour compatibilité
  @Column({ type: 'text', nullable: true })
  description_cas: string | null;

  @Column({ type: 'varchar', length: 20, default: 'moyenne', nullable: true })
  priorite: string | null;

  @Column({ type: 'timestamp', nullable: true })
  date_envoi: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ✅ Archive
  @Column({ type: 'boolean', default: false })
  is_archived: boolean;

  @Column({ type: 'timestamp', nullable: true })
  archived_at: Date | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  archived_by: string | null;

  @Column({ type: 'text', nullable: true })
  archive_motif: string | null;
}
