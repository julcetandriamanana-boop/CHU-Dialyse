import {
  Entity, Column, PrimaryGeneratedColumn,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { RendezVous } from './rendez-vous.entity';

@Entity({ name: 'constantes_seance' })
export class ConstantesSeance {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => RendezVous, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'rendez_vous_id' })
  rendez_vous: RendezVous;

  @Column({ type: 'int', nullable: true })
  rendez_vous_id: number;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'int', nullable: true })
  patient_id: number;

  // ── AVANT séance ──────────────────
  @Column({ type: 'varchar', length: 20, nullable: true })  poids_avant: string;
  @Column({ type: 'varchar', length: 20, nullable: true })  ta_avant: string;
  @Column({ type: 'varchar', length: 20, nullable: true })  fc_avant: string;
  @Column({ type: 'varchar', length: 20, nullable: true })  temp_avant: string;
  @Column({ type: 'varchar', length: 20, nullable: true })  o2_avant: string;

  // ── APRÈS séance ──────────────────
  @Column({ type: 'varchar', length: 20, nullable: true })  poids_apres: string;
  @Column({ type: 'varchar', length: 20, nullable: true })  ta_apres: string;
  @Column({ type: 'varchar', length: 20, nullable: true })  fc_apres: string;
  @Column({ type: 'varchar', length: 20, nullable: true })  temp_apres: string;
  @Column({ type: 'varchar', length: 20, nullable: true })  o2_apres: string;

  // ── Anticoagulation ───────────────
  @Column({ type: 'varchar', length: 50, nullable: true })  heparine: string;
  @Column({ type: 'varchar', length: 50, nullable: true })  hbpm: string;
  @Column({ type: 'varchar', length: 50, nullable: true })  dc: string;
  @Column({ type: 'varchar', length: 50, nullable: true })  de: string;
  @Column({ type: 'varchar', length: 50, nullable: true })  kt_artere: string;
  @Column({ type: 'varchar', length: 50, nullable: true })  kt_veine: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  infirmier_nom: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
