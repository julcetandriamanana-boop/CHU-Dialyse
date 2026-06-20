import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Index } from 'typeorm';
import { RendezVous } from './rendez-vous.entity';
import { Prescription } from './prescription.entity';

@Entity({ name: 'medecin' })
export class Medecin {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nom: string;

  @Column({ type: 'varchar', length: 100, comment: 'Ex: Neurologie' })
  specialite: string;

  @Index('uk_medecin_matricule')
  @Column({ type: 'varchar', length: 50, unique: true })
  matricule: string;

  @OneToMany(() => RendezVous, (rendezVous) => rendezVous.medecin)
  rendez_vous: RendezVous[];

  @OneToMany(() => Prescription, (prescription) => prescription.medecin)
  prescriptions: Prescription[];


}
