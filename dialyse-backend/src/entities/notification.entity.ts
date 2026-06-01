import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  // ── Champs internes existants ──────────────────
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: ['success', 'error', 'warning', 'info'],
    default: 'info',
  })
  type: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  link: string;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  // ── Champs service externe ─────────────────────
  @Column({ type: 'varchar', length: 255, nullable: true })
  external_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  source_service_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  source_service_name: string;

  @Column({
    type: 'varchar', length: 255, nullable: true,
    default: 'd604bde1-c9dd-4284-a690-0c5ed9be6a37',
  })
  target_service_id: string;

  @Column({
    type: 'varchar', length: 255, nullable: true,
    default: '1e5bbbb7-fa10-4d59-8848-2d0ce96a9394',
  })
  chu_id: string;

  @Column({ type: 'int', default: 1 })
  urgence: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emitter_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  patient_ref_id: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: any;

  @Column({ type: 'simple-array', nullable: true })
  channels: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  ringtone: string;

  @Column({ type: 'timestamp', nullable: true })
  sent_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  read_at: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  entite_ref_type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  entite_ref_id: string;

  @Column({ type: 'varchar', length: 50, default: 'interne' })
  source: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
