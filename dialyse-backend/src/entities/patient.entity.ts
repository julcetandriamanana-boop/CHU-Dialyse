import {
  Entity, Column, PrimaryGeneratedColumn,
  OneToMany, ManyToOne, JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Prescription }      from './prescription.entity';
import { RendezVous }        from './rendez-vous.entity';
import { SeanceHemodialyse } from './seance-hemodialyse.entity';
import { Service }           from './service.entity';
import { DemandeAvis }       from './demande-avis.entity';

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
  dateNaissance: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telephone: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // ✅ Statut du traitement dialyse
  @Column({ type: 'varchar', length: 20, default: 'actif', nullable: true })
  traitement_statut: string;

  // ✅ Motif de clôture
  @Column({ type: 'varchar', length: 50, nullable: true })
  traitement_motif_cloture: string;

  // ✅ Date de clôture
  @Column({ type: 'timestamp', nullable: true })
  traitement_date_cloture: Date;

  // ✅ Notes de clôture
  @Column({ type: 'text', nullable: true })
  traitement_notes_cloture: string;

  @ManyToOne(() => Service, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ type: 'uuid', nullable: true, default: 'd604bde1-c9dd-4284-a690-0c5ed9be6a37' })
  service_id: string;

  @OneToMany(() => Prescription, (p) => p.patient)
  prescriptions: Prescription[];

  @OneToMany(() => RendezVous, (r) => r.patient)
  rendez_vous: RendezVous[];

  @OneToMany(() => SeanceHemodialyse, (s) => s.patient)
  seances: SeanceHemodialyse[];

  @OneToMany(() => DemandeAvis, (d) => d.patient)
  demandes_avis: DemandeAvis[];
}
