import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'service' })
export class Service {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'varchar', length: 150, default: 'Service Hémodialyse' })
  nom: string;

  @Column({ type: 'varchar', length: 50, default: 'DIALYSE' })
  code: string;

  @Column({ type: 'varchar', length: 150, default: 'CHU Andrainjato' })
  hopital: string;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @CreateDateColumn()
  created_at: Date;
}
