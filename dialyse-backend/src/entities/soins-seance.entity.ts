import {
  Entity, Column, PrimaryGeneratedColumn,
  ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { RendezVous } from './rendez-vous.entity';

@Entity({ name: 'soins_seance' })
export class SoinsSeance {
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

  // Étape 1 — Accès vasculaire
  @Column({ type: 'varchar', length: 50, nullable: true })  acces_type: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) acces_fistule: string;
  @Column({ type: 'varchar', length: 50, nullable: true })  acces_thrill_bruit: string;
  @Column({ type: 'varchar', length: 30, nullable: true })  acces_rougeur: string;
  @Column({ type: 'varchar', length: 50, nullable: true })  acces_douleur: string;
  @Column({ type: 'varchar', length: 50, nullable: true })  acces_debit_sanguin: string;
  @Column({ type: 'text', nullable: true })                 acces_observation: string;

  // Étape 2 — Site ponction
  @Column({ type: 'varchar', length: 100, nullable: true }) ponction_antiseptique: string;
  @Column({ type: 'varchar', length: 30, nullable: true })  ponction_rougeur: string;
  @Column({ type: 'varchar', length: 30, nullable: true })  ponction_saignement: string;
  @Column({ type: 'varchar', length: 50, nullable: true })  ponction_douleur: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) ponction_site: string;
  @Column({ type: 'text', nullable: true })                 ponction_observation: string;

  // Étape 3 — Pansement post-dialyse
  @Column({ type: 'varchar', length: 30, nullable: true })  pansement_heure_retrait: string;
  @Column({ type: 'varchar', length: 30, nullable: true })  pansement_compression: string;
  @Column({ type: 'varchar', length: 30, nullable: true })  pansement_hemostase: string;
  @Column({ type: 'varchar', length: 30, nullable: true })  pansement_saignement_arrete: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) pansement_type: string;
  @Column({ type: 'text', nullable: true })                 pansement_observation: string;

  // Étape 4 — Validation
  @Column({ type: 'boolean', default: false })
  validation_infirmier: boolean;

  @Column({ type: 'boolean', default: false })
  validation_medecin: boolean;

  @Column({ type: 'timestamp', nullable: true })
  validation_date: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  infirmier_nom: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
