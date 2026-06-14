import {
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'rapports' })
export class Rapport {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  titre: string;

  @Column({ type: 'varchar', length: 50, default: 'statistique' })
  type: string;

  @Column({ type: 'varchar', length: 50, default: 'mensuel' })
  periode: string;

  @Column({ type: 'date', nullable: true })
  date_debut: Date | null;

  @Column({ type: 'date', nullable: true })
  date_fin: Date | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  auteur: string | null;

  @Column({ type: 'varchar', length: 50, default: 'genere' })
  statut: string;

  @Column({ type: 'jsonb', default: {} })
  donnees: any;

  @CreateDateColumn()
  created_at: Date;
}
