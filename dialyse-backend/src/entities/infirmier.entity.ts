import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'infirmiers' })
export class Infirmier {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 150 })
  nom_complet: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  matricule: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telephone: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ type: 'uuid', nullable: true, default: 'd604bde1-c9dd-4284-a690-0c5ed9be6a37' })
  service_id: string | null;

  @Column({ type: 'varchar', length: 100, default: 'Dialyse', nullable: true })
  service_nom: string | null;

  @Column({ type: 'boolean', default: true, nullable: true })
  actif: boolean | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
