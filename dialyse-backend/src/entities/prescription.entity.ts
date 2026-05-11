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

  @Column({
    type: 'enum',
    enum: ['brouillon', 'actif', 'suspendu', 'terminé', 'annulé'],
    default: 'brouillon',
  })
  workflow_statut: string;
}
