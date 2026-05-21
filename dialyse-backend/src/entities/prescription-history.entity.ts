import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Prescription } from './prescription.entity';

@Entity({ name: 'prescription_status_history' })
export class PrescriptionStatusHistory {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => Prescription, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prescription_id' })
  prescription: Prescription;

  @Column({ type: 'varchar', length: 30 })
  ancien_status: string;

  @Column({ type: 'varchar', length: 30 })
  nouveau_status: string;

  @Column({ type: 'int', nullable: true })
  changed_by: number;

  @CreateDateColumn()
  changed_at: Date;

  @Column({ type: 'text', nullable: true })
  motif: string;
}
