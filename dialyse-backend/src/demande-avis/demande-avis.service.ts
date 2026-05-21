import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DemandeAvis } from '../entities/demande-avis.entity';

@Injectable()
export class DemandeAvisService {
  constructor(
    @InjectRepository(DemandeAvis)
    private repo: Repository<DemandeAvis>,
  ) {}

  async findAll(priorite?: string): Promise<DemandeAvis[]> {
    const where: any = {};
    if (priorite) where.priorite = priorite;
    return this.repo.find({ where, relations: ['patient'], order: { date_envoi: 'DESC' } });
  }

  async create(data: Partial<DemandeAvis>): Promise<DemandeAvis> {
    return this.repo.save(this.repo.create(data));
  }

  async seed(): Promise<any> {
    const count = await this.repo.count();
    if (count > 0) return { message: `${count} demandes existent déjà` };

    const demandes = [
      { patient: { id: 1 }, description_cas: 'Hyperkaliémie aiguë', priorite: 'critique', date_envoi: new Date('2026-05-12') },
      { patient: { id: 2 }, description_cas: 'Avis pré-greffe', priorite: 'moyenne', date_envoi: new Date('2026-05-13') },
      { patient: { id: 3 }, description_cas: 'Péricardite urémique', priorite: 'critique', date_envoi: new Date('2026-05-12') },
      { patient: { id: 1 }, description_cas: 'Suivi fistule', priorite: 'moyenne', date_envoi: new Date('2026-05-14') },
      { patient: { id: 2 }, description_cas: 'Consultation routine', priorite: 'basse', date_envoi: new Date('2026-05-20') },
      { patient: { id: 3 }, description_cas: 'Ajustement traitement', priorite: 'moyenne', date_envoi: new Date('2026-05-15') },
      { patient: { id: 1 }, description_cas: 'Anurie aiguë', priorite: 'critique', date_envoi: new Date('2026-05-12') },
      { patient: { id: 2 }, description_cas: 'Bilan annuel', priorite: 'basse', date_envoi: new Date('2026-05-25') },
      { patient: { id: 3 }, description_cas: 'Déséquilibre électrolytique', priorite: 'moyenne', date_envoi: new Date('2026-05-16') },
      { patient: { id: 1 }, description_cas: 'Hypotension sévère', priorite: 'haute', date_envoi: new Date('2026-05-12') },
      { patient: { id: 2 }, description_cas: 'Suivi post-greffe', priorite: 'moyenne', date_envoi: new Date('2026-05-18') },
      { patient: { id: 3 }, description_cas: 'Consultation diététique', priorite: 'basse', date_envoi: new Date('2026-05-28') },
    ];

    for (const d of demandes) {
      await this.repo.save(this.repo.create(d));
    }
    return { message: '12 demandes d\'avis créées' };
  }
}
