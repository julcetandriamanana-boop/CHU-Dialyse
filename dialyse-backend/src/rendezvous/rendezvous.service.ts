import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { RendezVous } from '../entities/rendez-vous.entity';
import { Prescription } from '../entities/prescription.entity';

@Injectable()
export class RendezVousService {
  constructor(
    @InjectRepository(RendezVous) private repo: Repository<RendezVous>,
    @InjectRepository(Prescription) private prescRepo: Repository<Prescription>,
  ) {}

  async findAll(patientId?: number): Promise<RendezVous[]> {
    const where: any = {};
    if (patientId) where.patient = { id: patientId };
    return this.repo.find({ where, relations: ['patient', 'medecin'], order: { date_heure: 'DESC' } });
  }

  async findAujourdhui(): Promise<RendezVous[]> {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    return this.repo.find({
      where: { date_heure: Between(start, end) },
      relations: ['patient', 'medecin'],
      order: { date_heure: 'ASC' },
    });
  }

  async creer(data: any): Promise<RendezVous> {
    const rdv = await this.repo.save(this.repo.create({
      patient: { id: data.patientId },
      date_heure: new Date(data.date_heure),
      motif: data.motif || 'Séance de dialyse',
      statut: data.statut || 'confirmé',
      soso_kevitra_malalaka: `${data.creneau || ''} | ${data.machine || ''}`,
    }));

    const prescription = await this.prescRepo.findOne({
      where: { patient: { id: data.patientId }, workflow_statut: 'actif' },
      order: { date_prescription: 'DESC' },
    });
    if (prescription) {
      await this.prescRepo.update(prescription.id, { workflow_statut: 'terminé' });
    }

    return rdv;
  }

  async create(data: Partial<RendezVous>): Promise<RendezVous> {
    return this.repo.save(this.repo.create(data));
  }

  async seed(): Promise<any> {
    return { message: 'OK' };
  }
}
