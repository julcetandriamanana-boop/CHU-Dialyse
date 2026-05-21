import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { Medecin } from './medecin.entity';

@Entity({ name: 'rendez_vous' })
export class RendezVous {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => Patient, (patient) => patient.rendez_vous, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Medecin, (medecin) => medecin.rendez_vous, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'medecin_id' })
  medecin: Medecin;

  @Column({ type: 'timestamp' })
  date_heure: Date;

  @Column({ type: 'varchar', length: 255 })
  motif: string;

  @Column({ type: 'varchar', length: 20, default: 'planifié' })
  statut: string;

  @Column({ type: 'text', nullable: true })
  soso_kevitra_malalaka: string;
}
