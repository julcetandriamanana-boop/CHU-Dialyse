import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: ['success', 'error', 'warning', 'info'], default: 'info' })
  type: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string; // 'prescription', 'rdv', 'demande_avis', 'systeme'

  @Column({ type: 'varchar', length: 255, nullable: true })
  link: string; // URL ou route à ouvrir au clic

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon: string;

  @Column({ type: 'json', nullable: true })
  metadata: any; // données supplémentaires

  @CreateDateColumn()
  created_at: Date;
}
