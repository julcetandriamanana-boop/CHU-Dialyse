import {
  Entity, Column, PrimaryGeneratedColumn,
  ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';

@Entity({ name: 'seance_hemodialyse' })
export class SeanceHemodialyse {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => Patient, (patient) => patient.seances, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'timestamp' })
  date_debut: Date;

  @Column({ type: 'timestamp' })
  date_fin: Date;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  poids_pre: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  poids_post: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  surveillance_flux: string;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

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
