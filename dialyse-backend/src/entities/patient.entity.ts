import {
  Entity, Column, PrimaryGeneratedColumn,
  OneToMany, ManyToOne, JoinColumn,
} from 'typeorm';
import { Prescription }       from './prescription.entity';
import { RendezVous }         from './rendez-vous.entity';
import { SeanceHemodialyse }  from './seance-hemodialyse.entity';
import { Service }            from './service.entity';
import { DemandeAvis }        from './demande-avis.entity';

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
