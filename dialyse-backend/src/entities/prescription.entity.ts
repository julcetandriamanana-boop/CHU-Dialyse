import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { Medecin } from './medecin.entity';

@Entity({ name: 'prescription' })
export class Prescription {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => Patient, (patient) => patient.prescriptions, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Medecin, (medecin) => medecin.prescriptions, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'medecin_id' })
  medecin: Medecin;

  @Column({ type: 'date' })
  date_prescription: Date;

  @Column({ type: 'varchar', length: 150 })
  medicament: string;

  @Column({ type: 'varchar', length: 80 })
  dosage: string;

  @Column({ type: 'varchar', length: 80 })
  frequence: string;

  @Column({ type: 'varchar', length: 20, default: 'brouillon' })
  workflow_statut: string;

  @Column({ type: 'timestamp', nullable: true })
  validated_at: Date;

  @Column({ type: 'int', nullable: true })
  validated_by: number;

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
