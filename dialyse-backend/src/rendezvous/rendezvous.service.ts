import { Injectable, NotFoundException } from '@nestjs/common';
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

  // ── Lecture ───────────────────────────────────
  async findAll(patientId?: number): Promise<RendezVous[]> {
    const where: any = {};
    if (patientId) where.patient = { id: patientId };
    const data = await this.repo.find({
      where,
      relations: ['patient', 'medecin'],
      order: { date_heure: 'DESC' },
    });
    return data.filter((r) => !!r.patient);
  }

  async findAujourdhui(): Promise<RendezVous[]> {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const end   = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    const data  = await this.repo.find({
      where: { date_heure: Between(start, end) },
      relations: ['patient', 'medecin'],
      order: { date_heure: 'ASC' },
    });
    return data.filter((r) => !!r.patient);
  }

  async findById(id: number): Promise<RendezVous> {
    const rdv = await this.repo.findOne({
      where: { id },
      relations: ['patient', 'medecin'],
    });
    if (!rdv) throw new NotFoundException(`Rendez-vous #${id} introuvable`);
    return rdv;
  }

  // ── Actions séance ────────────────────────────
  async demarrer(id: number): Promise<RendezVous> {
    const rdv = await this.findById(id);
    if (!rdv) throw new NotFoundException();

    await this.repo.update(id, {
      statut_seance:      'en_cours',
      heure_debut_reelle: new Date(),
    });

    return this.findById(id);
  }

  async terminer(id: number): Promise<RendezVous> {
    const rdv = await this.findById(id);
    if (!rdv) throw new NotFoundException();

    await this.repo.update(id, {
      statut_seance:    'terminé',
      heure_fin_reelle: new Date(),
      statut:           'confirmé',
    });

    return this.findById(id);
  }

  async marquerAbsent(id: number): Promise<RendezVous> {
    const rdv = await this.findById(id);
    if (!rdv) throw new NotFoundException();

    await this.repo.update(id, {
      statut_seance: 'absent',
      statut:        'annulé',
    });

    return this.findById(id);
  }

  // ── Création ──────────────────────────────────
  async creer(data: any): Promise<RendezVous> {
    const saved = await this.repo.save(this.repo.create({
      patient:               { id: data.patientId },
      date_heure:            new Date(data.date_heure),
      motif:                 data.motif || 'Séance de dialyse',
      statut:                data.statut || 'planifié',
      statut_seance:         'en_attente',
      numero_seance:         data.numero_seance ?? null,
      machine:               data.machine ?? null,
      soso_kevitra_malalaka: data.soso_kevitra_malalaka ?? null,
    }));

    const rdv = await this.repo.findOne({
      where: { id: saved.id },
      relations: ['patient', 'medecin'],
    });

    const prescription = await this.prescRepo.findOne({
      where: { patient: { id: data.patientId }, workflow_statut: 'actif' },
      order: { date_prescription: 'DESC' },
    });
    if (prescription) {
      await this.prescRepo.update(prescription.id, { workflow_statut: 'terminé' });
    }

    return rdv!;
  }

  async create(data: Partial<RendezVous>): Promise<RendezVous> {
    return this.repo.save(this.repo.create(data));
  }

  async seed(): Promise<any> {
    return { message: 'OK' };
  }
}
