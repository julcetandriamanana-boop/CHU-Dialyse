import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, IsNull, Not } from 'typeorm';

import { Patient }                from '../entities/patient.entity';
import { RendezVous }             from '../entities/rendez-vous.entity';
import { Prescription }           from '../entities/prescription.entity';
import { PrescriptionKitEnvoyee } from '../entities/prescription-kit-envoyee.entity';
import { SeanceHemodialyse }      from '../entities/seance-hemodialyse.entity';
import { SoinsSeance }            from '../entities/soins-seance.entity';
import { SurveillanceSeance }     from '../entities/surveillance-seance.entity';
import { DemandeAvis }            from '../entities/demande-avis.entity';

import { ArchiveActionDto }  from './dto/archive-action.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { ArchiveQueryDto }   from './dto/archive-query.dto';

// ─── Types ────────────────────────────────────────────────────
export type ModuleArchive =
  | 'patients'
  | 'rendezvous'
  | 'prescriptions'
  | 'kits'
  | 'seances'
  | 'soins'
  | 'surveillance'
  | 'demandes-avis';

export interface ArchiveItem {
  module:       ModuleArchive;
  id:           number;
  label:        string;
  description:  string;
  is_archived:  boolean;
  archived_at:  Date | null;
  archived_by:  string | null;
  archive_motif: string | null;
  donnees:      Record<string, any>;
}

export interface PaginatedArchives {
  data:        ArchiveItem[];
  total:       number;
  page:        number;
  limit:       number;
  totalPages:  number;
}

export interface ArchiveStats {
  total: number;
  par_module: Record<ModuleArchive, number>;
  par_mois: Array<{ mois: string; count: number }>;
  derniere_archive: Date | null;
  genereLe: string;
}

export interface TimelineEvent {
  type:     string;
  date:     Date | null;
  titre:    string;
  details:  string;
  icon:     string;
  couleur:  string;
}

export interface HistoriquePatient {
  patient: Patient;
  resume: {
    rendezvous:    number;
    prescriptions: number;
    kits:          number;
    seances:       number;
    soins:         number;
    surveillance:  number;
    demandes_avis: number;
  };
  timeline: TimelineEvent[];
}

@Injectable()
export class ArchiveService {

  constructor(
    @InjectRepository(Patient)                private patientRepo:    Repository<Patient>,
    @InjectRepository(RendezVous)             private rdvRepo:        Repository<RendezVous>,
    @InjectRepository(Prescription)           private prescRepo:      Repository<Prescription>,
    @InjectRepository(PrescriptionKitEnvoyee) private kitRepo:        Repository<PrescriptionKitEnvoyee>,
    @InjectRepository(SeanceHemodialyse)      private seanceRepo:     Repository<SeanceHemodialyse>,
    @InjectRepository(SoinsSeance)            private soinsRepo:      Repository<SoinsSeance>,
    @InjectRepository(SurveillanceSeance)     private survRepo:       Repository<SurveillanceSeance>,
    @InjectRepository(DemandeAvis)            private demandeRepo:    Repository<DemandeAvis>,
    private notifService:                     NotificationsService,
  ) {}

  // ─── NOTIFICATIONS ARCHIVAGE ──────────────────────────────────

  private async envoyerNotifArchivage(
    module: ModuleArchive,
    id: number,
    label: string,
    motif: string,
    archivedBy: string,
  ): Promise<void> {
    try {
      await this.notifService.create({
        title:    `🗄️ Archivage - ${module}`,
        message:  `${label} archivé · Motif: ${motif} · Par: ${archivedBy}`,
        type:     'warning',
        category: 'ARCHIVE',
        icon:     'archive',
        is_read:  false,
        patient_ref_id: module === 'patients' ? String(id) : undefined,
        emitter_name:   archivedBy,
      });
    } catch (e) {
      console.warn('[ArchiveService] Notification archivage échouée:', e?.message);
    }
  }

  private async envoyerNotifRestauration(
    module: ModuleArchive,
    id: number,
    label: string,
  ): Promise<void> {
    try {
      await this.notifService.create({
        title:    `✅ Restauration - ${module}`,
        message:  `${label} restauré avec succès`,
        type:     'success',
        category: 'ARCHIVE',
        icon:     'restore',
        is_read:  false,
        patient_ref_id: module === 'patients' ? String(id) : undefined,
      });
    } catch (e) {
      console.warn('[ArchiveService] Notification restauration échouée:', e?.message);
    }
  }

  // ─── UTILITAIRES PRIVÉS ───────────────────────────────────────

  private getRepo(module: ModuleArchive): Repository<any> {
    const map: Record<ModuleArchive, Repository<any>> = {
      'patients':     this.patientRepo,
      'rendezvous':   this.rdvRepo,
      'prescriptions': this.prescRepo,
      'kits':         this.kitRepo,
      'seances':      this.seanceRepo,
      'soins':        this.soinsRepo,
      'surveillance': this.survRepo,
      'demandes-avis': this.demandeRepo,
    };
    return map[module];
  }

  private buildLabel(module: ModuleArchive, item: any): string {
    switch (module) {
      case 'patients':
        return `${item.nom || ''} ${item.prenom || ''}`.trim();
      case 'rendezvous':
        return `RDV #${item.id} - ${item.motif || ''}`;
      case 'prescriptions':
        return `Prescription #${item.id} - ${item.medicament || ''}`;
      case 'kits':
        return `Kit #${item.id} - ${item.kit_nom || ''}`;
      case 'seances':
        return `Séance #${item.id}`;
      case 'soins':
        return `Soins #${item.id}`;
      case 'surveillance':
        return `Surveillance #${item.id}`;
      case 'demandes-avis':
        return `Demande d'avis #${item.id}`;
      default:
        return `#${item.id}`;
    }
  }

  private buildDescription(module: ModuleArchive, item: any): string {
    switch (module) {
      case 'patients':
        return `Patient - Statut: ${item.traitement_statut || '-'}`;
      case 'rendezvous':
        return `${item.date_heure ? new Date(item.date_heure).toLocaleDateString('fr-FR') : '-'} - ${item.statut || '-'}`;
      case 'prescriptions':
        return `${item.dosage || '-'} - ${item.frequence || '-'}`;
      case 'kits':
        return `Type: ${item.type_kit || '-'} - ${item.articles_count || 0} articles`;
      case 'seances':
        return `${item.date_debut ? new Date(item.date_debut).toLocaleDateString('fr-FR') : '-'} - Poids: ${item.poids_pre || '-'}kg → ${item.poids_post || '-'}kg`;
      case 'soins':
        return `Accès: ${item.acces_type || '-'} - Validé: ${item.validation_infirmier ? 'Oui' : 'Non'}`;
      case 'surveillance':
        return `Kt/V: ${item.kt_v || '-'} - Recirculation: ${item.recirculation || '-'}`;
      case 'demandes-avis':
        return `Priorité: ${item.priorite || '-'} - ${item.date_envoi ? new Date(item.date_envoi).toLocaleDateString('fr-FR') : '-'}`;
      default:
        return '';
    }
  }

  private toArchiveItem(module: ModuleArchive, item: any): ArchiveItem {
    return {
      module,
      id:           item.id,
      label:        this.buildLabel(module, item),
      description:  this.buildDescription(module, item),
      is_archived:  item.is_archived,
      archived_at:  item.archived_at,
      archived_by:  item.archived_by,
      archive_motif: item.archive_motif,
      donnees:      item,
    };
  }

  private buildDateFilter(dateDebut?: string, dateFin?: string) {
    if (!dateDebut || !dateFin) return null;
    const debut = new Date(dateDebut);
    const fin   = new Date(dateFin);
    fin.setHours(23, 59, 59, 999);
    return { debut, fin };
  }

  // ─── LISTER ARCHIVES ──────────────────────────────────────────

  async listerTout(query: ArchiveQueryDto): Promise<PaginatedArchives> {
    const page  = Math.max(1, parseInt(query.page  || '1'));
    const limit = Math.min(50, Math.max(10, parseInt(query.limit || '20')));
    const filtre = this.buildDateFilter(query.dateDebut, query.dateFin);

    const modules: ModuleArchive[] = [
      'patients', 'rendezvous', 'prescriptions', 'kits',
      'seances', 'soins', 'surveillance', 'demandes-avis',
    ];

    const allItems: ArchiveItem[] = [];

    for (const module of modules) {
      const repo = this.getRepo(module);
      const where: any = { is_archived: true };
      if (filtre) where.archived_at = Between(filtre.debut, filtre.fin);

      const items = await repo.find({ where, relations: this.getRelations(module) });

      for (const item of items) {
        const archiveItem = this.toArchiveItem(module, item);
        if (query.search) {
          const s = query.search.toLowerCase();
          if (
            !archiveItem.label.toLowerCase().includes(s) &&
            !archiveItem.description.toLowerCase().includes(s) &&
            !(archiveItem.archive_motif || '').toLowerCase().includes(s) &&
            !(archiveItem.archived_by || '').toLowerCase().includes(s)
          ) continue;
        }
        allItems.push(archiveItem);
      }
    }

    // Trier par archived_at DESC
    allItems.sort((a, b) => {
      const da = a.archived_at ? new Date(a.archived_at).getTime() : 0;
      const db = b.archived_at ? new Date(b.archived_at).getTime() : 0;
      return db - da;
    });

    const total      = allItems.length;
    const totalPages = Math.ceil(total / limit);
    const start      = (page - 1) * limit;
    const data       = allItems.slice(start, start + limit);

    return { data, total, page, limit, totalPages };
  }

  async listerParModule(module: ModuleArchive, query: ArchiveQueryDto): Promise<PaginatedArchives> {
    const page   = Math.max(1, parseInt(query.page  || '1'));
    const limit  = Math.min(50, Math.max(10, parseInt(query.limit || '20')));
    const repo   = this.getRepo(module);
    const filtre = this.buildDateFilter(query.dateDebut, query.dateFin);

    const where: any = { is_archived: true };
    if (filtre) where.archived_at = Between(filtre.debut, filtre.fin);

    const items = await repo.find({ where, relations: this.getRelations(module) });

    let filtered = items.map((item: any) => this.toArchiveItem(module, item));

    if (query.search) {
      const s = query.search.toLowerCase();
      filtered = filtered.filter((item: ArchiveItem) =>
        item.label.toLowerCase().includes(s) ||
        item.description.toLowerCase().includes(s) ||
        (item.archive_motif || '').toLowerCase().includes(s) ||
        (item.archived_by || '').toLowerCase().includes(s)
      );
    }

    filtered.sort((a: ArchiveItem, b: ArchiveItem) => {
      const da = a.archived_at ? new Date(a.archived_at).getTime() : 0;
      const db = b.archived_at ? new Date(b.archived_at).getTime() : 0;
      return db - da;
    });

    const total      = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start      = (page - 1) * limit;
    const data       = filtered.slice(start, start + limit);

    return { data, total, page, limit, totalPages };
  }

  // ─── ARCHIVER ─────────────────────────────────────────────────

  async archiver(
    module: ModuleArchive,
    id: number,
    dto: ArchiveActionDto,
  ): Promise<{ ok: boolean; message: string; cascade?: Record<string, number> }> {
    const repo = this.getRepo(module);
    const item = await repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`${module} #${id} introuvable`);
    if (item.is_archived) throw new BadRequestException(`${module} #${id} est déjà archivé`);

    const archiveData = {
      is_archived:   true,
      archived_at:   new Date(),
      archived_by:   dto.archived_by,
      archive_motif: dto.motif,
    };

    await repo.update(id, archiveData);

    // Cascade si patient
    let cascade: Record<string, number> | undefined;
    if (module === 'patients') {
      cascade = await this.archiverCascadePatient(id, dto);
    }

    // ✅ Notification archivage
    const labelItem = this.buildLabel(module, item);
    await this.envoyerNotifArchivage(module, id, labelItem, dto.motif, dto.archived_by);

    return {
      ok: true,
      message: `${module} #${id} archivé avec succès`,
      cascade,
    };
  }

  private async archiverCascadePatient(
    patientId: number,
    dto: ArchiveActionDto,
  ): Promise<Record<string, number>> {
    const archiveData = {
      is_archived:   true,
      archived_at:   new Date(),
      archived_by:   dto.archived_by,
      archive_motif: `Archivé avec le patient #${patientId} - ${dto.motif}`,
    };

    const [rdvs, prescs, kits, seances, soins, survs, demandes] = await Promise.all([
      this.rdvRepo.find({ where: { patient: { id: patientId }, is_archived: false } }),
      this.prescRepo.find({ where: { patient: { id: patientId }, is_archived: false } }),
      this.kitRepo.find({ where: { patient_id: patientId, is_archived: false } }),
      this.seanceRepo.find({ where: { patient: { id: patientId }, is_archived: false } }),
      this.soinsRepo.find({ where: { patient_id: patientId, is_archived: false } }),
      this.survRepo.find({ where: { patient_id: patientId, is_archived: false } }),
      this.demandeRepo.find({ where: { patient: { id: patientId }, is_archived: false } }),
    ]);

    await Promise.all([
      rdvs.length     ? this.rdvRepo.update(rdvs.map(r => r.id), archiveData)       : null,
      prescs.length   ? this.prescRepo.update(prescs.map(p => p.id), archiveData)   : null,
      kits.length     ? this.kitRepo.update(kits.map(k => k.id), archiveData)       : null,
      seances.length  ? this.seanceRepo.update(seances.map(s => s.id), archiveData) : null,
      soins.length    ? this.soinsRepo.update(soins.map(s => s.id), archiveData)    : null,
      survs.length    ? this.survRepo.update(survs.map(s => s.id), archiveData)     : null,
      demandes.length ? this.demandeRepo.update(demandes.map(d => d.id), archiveData) : null,
    ]);

    return {
      rendezvous_archives:     rdvs.length,
      prescriptions_archivees: prescs.length,
      kits_archives:           kits.length,
      seances_archivees:       seances.length,
      soins_archives:          soins.length,
      surveillance_archivees:  survs.length,
      demandes_archivees:      demandes.length,
    };
  }

  // ─── RESTAURER ────────────────────────────────────────────────

  async restaurer(
    module: ModuleArchive,
    id: number,
  ): Promise<{ ok: boolean; message: string; cascade?: Record<string, number> }> {
    const repo = this.getRepo(module);
    const item = await repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`${module} #${id} introuvable`);
    if (!item.is_archived) throw new BadRequestException(`${module} #${id} n'est pas archivé`);

    await repo.update(id, {
      is_archived:   false,
      archived_at:   null,
      archived_by:   null,
      archive_motif: null,
    });

    let cascade: Record<string, number> | undefined;
    if (module === 'patients') {
      cascade = await this.restaurerCascadePatient(id);
    }

    // ✅ Notification restauration
    const labelItemRestored = this.buildLabel(module, item);
    await this.envoyerNotifRestauration(module, id, labelItemRestored);

    return {
      ok: true,
      message: `${module} #${id} restauré avec succès`,
      cascade,
    };
  }

  private async restaurerCascadePatient(patientId: number): Promise<Record<string, number>> {
    const restoreData = {
      is_archived:   false,
      archived_at:   null,
      archived_by:   null,
      archive_motif: null,
    };

    const motifCascade = `Archivé avec le patient #${patientId}`;

    const [rdvs, prescs, kits, seances, soins, survs, demandes] = await Promise.all([
      this.rdvRepo.find({ where: { patient: { id: patientId }, is_archived: true } }),
      this.prescRepo.find({ where: { patient: { id: patientId }, is_archived: true } }),
      this.kitRepo.find({ where: { patient_id: patientId, is_archived: true } }),
      this.seanceRepo.find({ where: { patient: { id: patientId }, is_archived: true } }),
      this.soinsRepo.find({ where: { patient_id: patientId, is_archived: true } }),
      this.survRepo.find({ where: { patient_id: patientId, is_archived: true } }),
      this.demandeRepo.find({ where: { patient: { id: patientId }, is_archived: true } }),
    ]);

    // Restaurer uniquement ceux archivés par cascade
    const rdvsCascade     = rdvs.filter(r => (r.archive_motif || '').includes(motifCascade));
    const prescsCascade   = prescs.filter(p => (p.archive_motif || '').includes(motifCascade));
    const kitsCascade     = kits.filter(k => (k.archive_motif || '').includes(motifCascade));
    const seancesCascade  = seances.filter(s => (s.archive_motif || '').includes(motifCascade));
    const soinsCascade    = soins.filter(s => (s.archive_motif || '').includes(motifCascade));
    const survsCascade    = survs.filter(s => (s.archive_motif || '').includes(motifCascade));
    const demandesCascade = demandes.filter(d => (d.archive_motif || '').includes(motifCascade));

    await Promise.all([
      rdvsCascade.length     ? this.rdvRepo.update(rdvsCascade.map(r => r.id), restoreData)         : null,
      prescsCascade.length   ? this.prescRepo.update(prescsCascade.map(p => p.id), restoreData)     : null,
      kitsCascade.length     ? this.kitRepo.update(kitsCascade.map(k => k.id), restoreData)         : null,
      seancesCascade.length  ? this.seanceRepo.update(seancesCascade.map(s => s.id), restoreData)   : null,
      soinsCascade.length    ? this.soinsRepo.update(soinsCascade.map(s => s.id), restoreData)      : null,
      survsCascade.length    ? this.survRepo.update(survsCascade.map(s => s.id), restoreData)       : null,
      demandesCascade.length ? this.demandeRepo.update(demandesCascade.map(d => d.id), restoreData) : null,
    ]);

    return {
      rendezvous_restaures:    rdvsCascade.length,
      prescriptions_restaurees: prescsCascade.length,
      kits_restaures:          kitsCascade.length,
      seances_restaurees:      seancesCascade.length,
      soins_restaures:         soinsCascade.length,
      surveillance_restaurees: survsCascade.length,
      demandes_restaurees:     demandesCascade.length,
    };
  }

  // ─── STATISTIQUES ─────────────────────────────────────────────

  async getStatistiques(): Promise<ArchiveStats> {
    const modules: ModuleArchive[] = [
      'patients', 'rendezvous', 'prescriptions', 'kits',
      'seances', 'soins', 'surveillance', 'demandes-avis',
    ];

    const counts = await Promise.all(
      modules.map(m => this.getRepo(m).count({ where: { is_archived: true } }))
    );

    const par_module = modules.reduce((acc, m, i) => {
      acc[m] = counts[i];
      return acc;
    }, {} as Record<ModuleArchive, number>);

    const total = counts.reduce((a, b) => a + b, 0);

    // Calculer par mois
    const allArchived: { archived_at: Date }[] = [];
    for (const module of modules) {
      const items = await this.getRepo(module).find({
        where: { is_archived: true },
        select: ['archived_at'],
      });
      allArchived.push(...items.filter((i: any) => i.archived_at));
    }

    const moisMap: Record<string, number> = {};
    let derniereArchive: Date | null = null;

    for (const item of allArchived) {
      if (!item.archived_at) continue;
      const d    = new Date(item.archived_at);
      const mois = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      moisMap[mois] = (moisMap[mois] || 0) + 1;
      if (!derniereArchive || d > derniereArchive) derniereArchive = d;
    }

    const par_mois = Object.entries(moisMap)
      .map(([mois, count]) => ({ mois, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);

    return {
      total,
      par_module,
      par_mois,
      derniere_archive: derniereArchive,
      genereLe: new Date().toISOString(),
    };
  }

  // ─── HISTORIQUE COMPLET PATIENT ───────────────────────────────

  async getHistoriquePatient(patientId: number): Promise<HistoriquePatient> {
    const patient = await this.patientRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException(`Patient #${patientId} introuvable`);

    // Récupérer toutes les données du patient (archivées ou non)
    const [rdvs, prescs, kits, seances, soins, survs, demandes] = await Promise.all([
      this.rdvRepo.find({ where: { patient: { id: patientId } }, order: { date_heure: 'DESC' }, take: 50 }),
      this.prescRepo.find({ where: { patient: { id: patientId } }, order: { date_prescription: 'DESC' }, take: 20 }),
      this.kitRepo.find({ where: { patient_id: patientId } }),
      this.seanceRepo.find({ where: { patient: { id: patientId } } }),
      this.soinsRepo.find({ where: { patient_id: patientId } }),
      this.survRepo.find({ where: { patient_id: patientId } }),
      this.demandeRepo.find({ where: { patient: { id: patientId } }, relations: ['emetteur', 'destinataire'] }),
    ]);

    // Résumé
    const resume = {
      rendezvous:    rdvs.length,
      prescriptions: prescs.length,
      kits:          kits.length,
      seances:       seances.length,
      soins:         soins.length,
      surveillance:  survs.length,
      demandes_avis: demandes.length,
    };

    // Timeline
    const timeline: TimelineEvent[] = [];

    // Archivage patient
    if (patient.is_archived && patient.archived_at) {
      timeline.push({
        type:    'archivage',
        date:    patient.archived_at,
        titre:   'Patient archivé',
        details: `Par: ${patient.archived_by || '-'} - Motif: ${patient.archive_motif || '-'}`,
        icon:    'archive',
        couleur: 'red',
      });
    }

    // RDV
    for (const rdv of rdvs) {
      timeline.push({
        type:    'rendezvous',
        date:    rdv.date_heure,
        titre:   `RDV - ${rdv.motif || ''}`,
        details: `Statut: ${rdv.statut || '-'} | Machine: ${rdv.machine || 'Non définie'}`,
        icon:    'event',
        couleur: 'blue',
      });
    }

    // Prescriptions
    for (const p of prescs) {
      timeline.push({
        type:    'prescription',
        date:    new Date(p.date_prescription),
        titre:   `Prescription: ${p.medicament}`,
        details: `Dosage: ${p.dosage} | Statut: ${p.workflow_statut}`,
        icon:    'prescriptions',
        couleur: 'violet',
      });
    }

    // Kits
    for (const k of kits) {
      timeline.push({
        type:    'kit',
        date:    k.date_envoi,
        titre:   `Kit envoyé: ${k.kit_nom}`,
        details: `Type: ${k.type_kit} | ${k.articles_count} articles`,
        icon:    'inventory_2',
        couleur: 'amber',
      });
    }

    // Séances
    for (const s of seances) {
      timeline.push({
        type:    'seance',
        date:    s.date_debut,
        titre:   `Séance d'hémodialyse`,
        details: `Poids: ${s.poids_pre}kg → ${s.poids_post}kg (${(Number(s.poids_pre) - Number(s.poids_post)).toFixed(1)}kg)`,
        icon:    'vaccine',
        couleur: 'emerald',
      });
    }

    // Soins
    for (const s of soins) {
      timeline.push({
        type:    'soins',
        date:    s.created_at,
        titre:   `Soins: ${s.acces_type || 'Accès vasculaire'}`,
        details: `Validé infirmier: ${s.validation_infirmier ? 'Oui ✅' : 'Non'} | Validé médecin: ${s.validation_medecin ? 'Oui ✅' : 'Non'}`,
        icon:    'healing',
        couleur: 'cyan',
      });
    }

    // Surveillance
    for (const s of survs) {
      timeline.push({
        type:    'surveillance',
        date:    s.created_at,
        titre:   'Surveillance séance',
        details: `Kt/V: ${s.kt_v || '-'} | Recirculation: ${s.recirculation || '-'}`,
        icon:    'monitor_heart',
        couleur: 'blue',
      });
    }

    // Demandes d'avis
    for (const d of demandes) {
      timeline.push({
        type:    'demande_avis',
        date:    d.date_envoi,
        titre:   `Demande d'avis`,
        details: `${d.emetteur?.nom || '-'} → ${d.destinataire?.nom || '-'} | Priorité: ${d.priorite}`,
        icon:    'question_answer',
        couleur: 'orange',
      });
    }

    // Création patient (approximée)
    timeline.push({
      type:    'creation',
      date:    new Date(0), // sera trié en dernier
      titre:   'Patient créé dans le système',
      details: `Service: Néphrologie`,
      icon:    'person_add',
      couleur: 'slate',
    });

    // Trier par date DESC
    timeline.sort((a, b) => {
      const db = b.date ? new Date(b.date).getTime() : 0;
      const da = a.date ? new Date(a.date).getTime() : 0;
      return db - da;
    });

    return { patient, resume, timeline };
  }

  // ─── TOUS LES PATIENTS (pour select historique) ───────────────

  async getTousPatients(): Promise<Patient[]> {
    return this.patientRepo.find({
      select: ['id', 'nom', 'prenom', 'is_archived'],
      order: { nom: 'ASC' },
    });
  }

  // ─── RELATIONS PAR MODULE ─────────────────────────────────────

  private getRelations(module: ModuleArchive): string[] {
    switch (module) {
      case 'patients':      return [];
      case 'rendezvous':    return ['patient', 'medecin'];
      case 'prescriptions': return ['patient', 'medecin'];
      case 'kits':          return ['patient'];
      case 'seances':       return ['patient'];
      case 'soins':         return ['patient'];
      case 'surveillance':  return ['patient'];
      case 'demandes-avis': return ['patient', 'emetteur', 'destinataire'];
      default:              return [];
    }
  }
}
