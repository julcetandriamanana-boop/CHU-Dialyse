import {
  Entity, Column, PrimaryGeneratedColumn,
  OneToMany, ManyToOne, JoinColumn,
} from 'typeorm';
import { Prescription }      from './prescription.entity';
import { RendezVous }        from './rendez-vous.entity';
import { SeanceHemodialyse } from './seance-hemodialyse.entity';
import { Service }           from './service.entity';

export type TraitementStatut = 'actif' | 'suspendu' | 'terminé';

export const MOTIFS_CLOTURE = [
  'amelioration_clinique',
  'fin_protocole',
  'transfert_centre',
  'decision_medicale',
  'greffe_renale',
  'autre',
] as const;

export type MotifCloture = typeof MOTIFS_CLOTURE[number];

export const MOTIFS_CLOTURE_LABELS: Record<MotifCloture, string> = {
  amelioration_clinique: 'Amélioration clinique',
  fin_protocole:         'Fin de protocole',
  transfert_centre:      'Transfert vers un autre centre',
  decision_medicale:     'Décision médicale',
  greffe_renale:         'Greffe rénale',
  autre:                 'Autre',
};

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nom: string;

  @Column({ type: 'varchar', length: 100 })
  prenom: string;

  @Column({ type: 'date', nullable: true })
  dateNaissance: Date | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telephone: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  numero_dossier: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  external_patient_id: string | null;

  @Column({ type: 'varchar', length: 20, default: 'actif', nullable: true })
  traitement_statut: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  traitement_motif_cloture: string | null;

  @Column({ type: 'timestamp', nullable: true })
  traitement_date_cloture: Date | null;

  @Column({ type: 'text', nullable: true })
  traitement_notes_cloture: string | null;

  @ManyToOne(() => Service, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ type: 'uuid', nullable: true, default: 'd604bde1-c9dd-4284-a690-0c5ed9be6a37' })
  service_id: string | null;

  // ✅ Champs Archive
  @Column({ type: 'boolean', default: false })
  is_archived: boolean;

  @Column({ type: 'timestamp', nullable: true })
  archived_at: Date | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  archived_by: string | null;

  @Column({ type: 'text', nullable: true })
  archive_motif: string | null;

  @OneToMany(() => Prescription, (p) => p.patient)
  prescriptions: Prescription[];

  @OneToMany(() => RendezVous, (r) => r.patient)
  rendez_vous: RendezVous[];

  @OneToMany(() => SeanceHemodialyse, (s) => s.patient)
  seances: SeanceHemodialyse[];

}
