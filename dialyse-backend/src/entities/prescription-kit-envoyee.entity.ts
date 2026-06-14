import {
  Entity, Column, PrimaryGeneratedColumn,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { RendezVous } from './rendez-vous.entity';

@Entity({ name: 'prescription_kit_envoyee' })
export class PrescriptionKitEnvoyee {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'int' })
  patient_id: number;

  @ManyToOne(() => RendezVous, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'rendez_vous_id' })
  rendez_vous: RendezVous;

  @Column({ type: 'int', nullable: true })
  rendez_vous_id: number | null;

  @Column({ type: 'varchar', length: 100 })
  kit_id: string;

  @Column({ type: 'varchar', length: 255 })
  kit_nom: string;

  @Column({ type: 'varchar', length: 50 })
  type_kit: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ordonnance_pharmacie_id: string | null;

  @Column({ type: 'int', default: 0 })
  articles_count: number;

  @Column({ type: 'int', nullable: true })
  emetteur_id: number | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  emetteur_nom: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  emetteur_role: string | null;

  @Column({ type: 'varchar', length: 50, default: 'envoyee' })
  statut: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date_envoi: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  created_at: Date;
}
