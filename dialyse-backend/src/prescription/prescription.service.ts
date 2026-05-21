import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, Between, Not, In } from 'typeorm';
import { Prescription } from '../entities/prescription.entity';

@Injectable()
export class PrescriptionService {
  constructor(@InjectRepository(Prescription) private repo: Repository<Prescription>) {}

  async findAll(filters?: any): Promise<Prescription[]> {
    const where: any = {};
    if (filters?.status && filters.status !== 'all') where.workflow_statut = filters.status;
    if (filters?.startDate && filters?.endDate) where.date_prescription = Between(new Date(filters.startDate), new Date(filters.endDate));
    else if (filters?.startDate) where.date_prescription = MoreThanOrEqual(new Date(filters.startDate));
    else if (filters?.endDate) where.date_prescription = LessThanOrEqual(new Date(filters.endDate));
    return this.repo.find({ where, relations: ['patient', 'medecin'], order: { date_prescription: 'DESC' } });
  }

  async findEnAttente(): Promise<Prescription[]> {
    return this.repo.find({
      where: { workflow_statut: Not(In(['terminé', 'annulé'])) },
      relations: ['patient', 'medecin'],
      order: { date_prescription: 'DESC' },
    });
  }

  async findValidees(): Promise<Prescription[]> {
    return this.repo.find({ where: { workflow_statut: 'terminé' }, relations: ['patient', 'medecin'], order: { date_prescription: 'DESC' } });
  }

  async create(data: Partial<Prescription>): Promise<Prescription> {
    return this.repo.save(this.repo.create(data));
  }

  async valider(id: number): Promise<any> {
    await this.repo.update(id, { workflow_statut: 'terminé' });
    return { success: true };
  }

  async seed(): Promise<any> {
    return { message: 'OK' };
  }
}
