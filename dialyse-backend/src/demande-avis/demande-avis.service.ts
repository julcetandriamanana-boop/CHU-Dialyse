import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { DemandeAvis } from '../entities/demande-avis.entity';

@Injectable()
export class DemandeAvisService {
  constructor(
    @InjectRepository(DemandeAvis)
    private repo: Repository<DemandeAvis>,
  ) {}

  // ─── Lister toutes (avec filtres) ────────────────────────────
  async findAll(opts?: {
    priorite?:             string;
    statut?:               string;
    service_destinataire?: string;
    service_demandeur?:    string;
    search?:               string;
  }): Promise<DemandeAvis[]> {
    const where: any = {};
    if (opts?.priorite)             where.priorite             = opts.priorite;
    if (opts?.statut)               where.statut               = opts.statut;
    if (opts?.service_destinataire) where.service_destinataire = opts.service_destinataire;
    if (opts?.service_demandeur)    where.service_demandeur    = opts.service_demandeur;

    let results = await this.repo.find({
      where,
      relations: ['patient'],
      order: { created_at: 'DESC' },
    });

    // Filtre recherche
    if (opts?.search) {
      const s = opts.search.toLowerCase();
      results = results.filter(d =>
        (d.motif           || '').toLowerCase().includes(s) ||
        (d.description_cas || '').toLowerCase().includes(s) ||
        (d.patient?.nom    || '').toLowerCase().includes(s) ||
        (d.patient?.prenom || '').toLowerCase().includes(s) ||
        (d.service_demandeur || '').toLowerCase().includes(s)
      );
    }

    return results;
  }

  // ─── Demandes reçues par Dialyse ──────────────────────────────
  async findRecuesParDialyse(opts?: {
    statut?:            string;
    service_demandeur?: string;
    search?:            string;
  }): Promise<DemandeAvis[]> {
    return this.findAll({
      ...opts,
      service_destinataire: 'Dialyse',
    });
  }

  // ─── Trouver par ID ──────────────────────────────────────────
  async findById(id: number): Promise<DemandeAvis> {
    const d = await this.repo.findOne({ where: { id }, relations: ['patient'] });
    if (!d) throw new NotFoundException(`Demande d'avis #${id} introuvable`);
    return d;
  }

  // ─── Créer une demande ───────────────────────────────────────
  async create(data: {
    patient_id?:          number;
    service_demandeur:    string;
    service_destinataire: string;
    motif:                string;
    priorite?:            string;
    description_cas?:     string;
  }): Promise<DemandeAvis> {
    const demande = this.repo.create({
      patient:              data.patient_id ? { id: data.patient_id } as any : null,
      service_demandeur:    data.service_demandeur,
      service_destinataire: data.service_destinataire,
      motif:                data.motif,
      priorite:             data.priorite || 'moyenne',
      description_cas:      data.description_cas || data.motif,
      date_envoi:           new Date(),
      statut:               'en_attente',
    });
    return this.repo.save(demande);
  }

  // ─── Répondre à une demande ──────────────────────────────────
  async repondre(id: number, data: {
    reponse:    string;
    repondu_par: string;
  }): Promise<DemandeAvis> {
    const demande = await this.findById(id);
    await this.repo.update(id, {
      reponse:     data.reponse,
      repondu_par: data.repondu_par,
      repondu_at:  new Date(),
      statut:      'repondu',
    });
    return this.findById(id);
  }

  // ─── Statistiques ────────────────────────────────────────────
  async getStats(): Promise<any> {
    const [total, enAttente, repondues] = await Promise.all([
      this.repo.count({ where: { service_destinataire: 'Dialyse' } }),
      this.repo.count({ where: { service_destinataire: 'Dialyse', statut: 'en_attente' } }),
      this.repo.count({ where: { service_destinataire: 'Dialyse', statut: 'repondu' } }),
    ]);
    return {
      total,
      en_attente: enAttente,
      repondues,
      taux_reponse: total > 0 ? Math.round((repondues / total) * 100) : 0,
    };
  }

  // ─── Seed données de démo ────────────────────────────────────
  async seed(): Promise<any> {
    const count = await this.repo.count();
    if (count > 0) return { message: `${count} demandes existent déjà` };

    const demandes = [
      { patient_id: 1, service_demandeur: 'Cardiologie',  service_destinataire: 'Dialyse', motif: 'Patient avec insuffisance rénale terminale nécessitant bilan dialyse',         priorite: 'critique' },
      { patient_id: 2, service_demandeur: 'Pneumologie',  service_destinataire: 'Dialyse', motif: 'Avis néphrologique avant chirurgie thoracique programmée',                      priorite: 'haute'    },
      { patient_id: 3, service_demandeur: 'Chirurgie',    service_destinataire: 'Dialyse', motif: 'Évaluation fonction rénale pré-opératoire',                                    priorite: 'moyenne'  },
      { patient_id: 1, service_demandeur: 'Neurologie',   service_destinataire: 'Dialyse', motif: 'Hyperkaliémie sévère chez patient neurologique',                               priorite: 'critique' },
      { patient_id: 2, service_demandeur: 'Cardiologie',  service_destinataire: 'Dialyse', motif: 'Surveillance créatininémie sous IECA',                                          priorite: 'moyenne'  },
      { patient_id: 3, service_demandeur: 'Endocrinologie',service_destinataire:'Dialyse', motif: 'Néphropathie diabétique - avis dialyse',                                        priorite: 'haute'    },
      { patient_id: 1, service_demandeur: 'Urgences',     service_destinataire: 'Dialyse', motif: 'Anurie aiguë - indication épuration extra-rénale urgente',                     priorite: 'critique' },
      { patient_id: 2, service_demandeur: 'Médecine Int.',service_destinataire: 'Dialyse', motif: 'Péricardite urémique - avis dialyse urgente',                                   priorite: 'critique' },
    ];

    for (const d of demandes) {
      await this.create(d);
    }
    return { message: `${demandes.length} demandes d'avis créées` };
  }
}
