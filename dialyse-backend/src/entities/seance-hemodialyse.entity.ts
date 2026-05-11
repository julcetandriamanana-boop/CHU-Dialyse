import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';

@Entity({ name: 'seance_hemodialyse' })
export class SeanceHemodialyse {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => Patient, (patient) => patient.seances, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'datetime' })
  date_debut: Date;

  @Column({ type: 'datetime' })
  date_fin: Date;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  poids_pre: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  poids_post: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  surveillance_flux: string;

  @Column({ type: 'text', nullable: true })
  observations: string;
}
