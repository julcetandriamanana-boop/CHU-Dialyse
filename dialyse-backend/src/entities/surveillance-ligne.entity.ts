import {
  Entity, Column, PrimaryGeneratedColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { SurveillanceSeance } from './surveillance-seance.entity';

@Entity({ name: 'surveillance_ligne' })
export class SurveillanceLigne {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => SurveillanceSeance, (s) => s.lignes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'surveillance_seance_id' })
  surveillance: SurveillanceSeance;

  @Column({ type: 'int', nullable: true })
  surveillance_seance_id: number;

  @Column({ type: 'int', nullable: true })
  ordre: number;

  @Column({ type: 'varchar', length: 30, nullable: true })  heure: string;
  @Column({ type: 'varchar', length: 30, nullable: true })  ta: string;
  @Column({ type: 'varchar', length: 30, nullable: true })  pouls: string;
  @Column({ type: 'varchar', length: 30, nullable: true })  debit_sang: string;
  @Column({ type: 'varchar', length: 30, nullable: true })  pression_veineuse: string;
  @Column({ type: 'varchar', length: 30, nullable: true })  pression_arterielle: string;
  @Column({ type: 'varchar', length: 30, nullable: true })  uf_affiche: string;
  @Column({ type: 'varchar', length: 30, nullable: true })  uf_obtenue: string;
  @Column({ type: 'varchar', length: 30, nullable: true })  ptm: string;
  @Column({ type: 'text', nullable: true })                 incidents_cliniques: string;
}
