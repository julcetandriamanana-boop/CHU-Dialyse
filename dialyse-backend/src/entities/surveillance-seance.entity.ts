import {
  Entity, Column, PrimaryGeneratedColumn,
  ManyToOne, OneToMany, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { RendezVous } from './rendez-vous.entity';
import { SurveillanceLigne } from './surveillance-ligne.entity';

@Entity({ name: 'surveillance_seance' })
export class SurveillanceSeance {
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

  @Column({ type: 'varchar', length: 100, nullable: true })  orifice_catheter: string;
  @Column({ type: 'varchar', length: 50, nullable: true })   kt_v: string;
  @Column({ type: 'varchar', length: 50, nullable: true })   volume_sang_traite: string;
  @Column({ type: 'varchar', length: 50, nullable: true })   delta_vs: string;
  @Column({ type: 'varchar', length: 50, nullable: true })   pru: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  recirculation: string; // BONNE / MOYENNE / MAUVAISE

  @Column({ type: 'varchar', length: 20, nullable: true })
  temps_compression_veine: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  piege_bulle: string; // propre / caillot

  @Column({ type: 'varchar', length: 20, nullable: true })
  dealeur: string; // propre / caillot

  @Column({ type: 'varchar', length: 100, nullable: true })
  infirmier_nom: string;

  @OneToMany(() => SurveillanceLigne, (l) => l.surveillance, { cascade: true })
  lignes: SurveillanceLigne[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
