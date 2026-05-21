import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  MEDECIN = 'medecin',
  INFIRMIER = 'infirmier',
  SECRETAIRE = 'secretaire',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  nom: string;

  @Column({ type: 'varchar', length: 100 })
  prenom: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.SECRETAIRE })
  role: UserRole;

  @Column({ type: 'varchar', length: 50, nullable: true })
  matricule: string;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
