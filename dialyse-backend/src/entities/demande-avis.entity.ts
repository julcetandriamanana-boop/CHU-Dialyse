import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
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

  @Column({ type: 'datetime' })
  date_envoi: Date;

  @Column({ type: 'text' })
  description_cas: string;

  @Column({
    type: 'enum',
    enum: ['basse', 'moyenne', 'haute', 'critique'],
    default: 'moyenne',
  })
  priorite: string;
}
