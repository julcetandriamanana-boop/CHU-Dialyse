import { normaliserStatut } from './utils/normalise-statut';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull, Not } from 'typeorm';

// Entités
import { Rapport }                from '../entities/rapport.entity';
import { Patient }                from '../entities/patient.entity';
import { Prescription }           from '../entities/prescription.entity';
import { RendezVous }             from '../entities/rendez-vous.entity';
import { PrescriptionKitEnvoyee } from '../entities/prescription-kit-envoyee.entity';
import { Notification }           from '../entities/notification.entity';
import { SeanceHemodialyse }      from '../entities/seance-hemodialyse.entity';
import { SurveillanceSeance }     from '../entities/surveillance-seance.entity';
import { SurveillanceLigne }      from '../entities/surveillance-ligne.entity';
import { SoinsSeance }            from '../entities/soins-seance.entity';
import { Medecin }                from '../entities/medecin.entity';
import { Infirmier }              from '../entities/infirmier.entity';

// Interfaces KPI
import {
  KpiActiviteDialyse,
  KpiMedicalPatient,
  KpiPrescriptions,
  KpiKitsConsommation,
  KpiRdvFlux,
  KpiSurveillanceCritique,
  KpiPerformancePersonnel,
  MetaRapport,
} from './interfaces/kpi.interfaces';

@Injectable()
export class RapportsService {

  constructor(
    @InjectRepository(Rapport)                private rapportRepo:       Repository<Rapport>,
    @InjectRepository(Patient)                private patientRepo:       Repository<Patient>,
    @InjectRepository(Prescription)           private prescRepo:         Repository<Prescription>,
    @InjectRepository(RendezVous)             private rdvRepo:           Repository<RendezVous>,
    @InjectRepository(PrescriptionKitEnvoyee) private kitRepo:           Repository<PrescriptionKitEnvoyee>,
    @InjectRepository(Notification)           private notifRepo:         Repository<Notification>,
    @InjectRepository(SeanceHemodialyse)      private seanceRepo:        Repository<SeanceHemodialyse>,
    @InjectRepository(SurveillanceSeance)     private surveillanceRepo:  Repository<SurveillanceSeance>,
    @InjectRepository(SurveillanceLigne)      private ligneRepo:         Repository<SurveillanceLigne>,
    @InjectRepository(SoinsSeance)            private soinsRepo:         Repository<SoinsSeance>,
    @InjectRepository(Medecin)                private medecinRepo:       Repository<Medecin>,
    @InjectRepository(Infirmier)              private infirmierRepo:     Repository<Infirmier>,
  ) {}

  // ============================================================
  // UTILITAIRES PRIVÉS
  // ============================================================

  private buildDateFilter(dateDebut?: string, dateFin?: string) {
    if (!dateDebut || !dateFin) return null;
    const debut = new Date(dateDebut);
    const fin   = new Date(dateFin);
    fin.setHours(23, 59, 59, 999);
    return { debut, fin };
  }

  private buildMeta(dateDebut?: string, dateFin?: string): MetaRapport {
    return {
      genereLe: new Date().toISOString(),
      periode: {
        debut: dateDebut || null,
        fin:   dateFin   || null,
      },
    };
  }

  private calculerNiveau(score: number): 'faible' | 'modere' | 'eleve' | 'critique' {
    if (score <= 1) return 'faible';
    if (score <= 3) return 'modere';
    if (score <= 6) return 'eleve';
    return 'critique';
  }

  private arrondir(val: number, decimales = 2): number {
    return Math.round(val * 10 ** decimales) / 10 ** decimales;
  }

  private async sauvegarderRapport(
    titre: string,
    type: string,
    donnees: any,
    dateDebut?: string,
    dateFin?: string,
    auteur = 'Système',
  ): Promise<Rapport> {
    const rapport = this.rapportRepo.create({
      titre,
      type,
      periode: dateDebut ? 'personnalise' : 'global',
      date_debut: dateDebut ? new Date(dateDebut) : null,
      date_fin:   dateFin   ? new Date(dateFin)   : null,
      auteur,
      statut: 'genere',
      donnees,
    });
    return this.rapportRepo.save(rapport);
  }

  // ============================================================
  // MÉTHODES EXISTANTES CONSERVÉES
  // ============================================================

  async findAll(): Promise<Rapport[]> {
    return this.rapportRepo.find({ order: { created_at: 'DESC' } });
  }

  async findById(id: number): Promise<Rapport | null> {
    return this.rapportRepo.findOne({ where: { id } });
  }

  async supprimer(id: number): Promise<void> {
    await this.rapportRepo.delete(id);
  }

  async getStatsGlobales(dateDebut?: string, dateFin?: string): Promise<any> {
    const now          = new Date();
    const today        = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const demain       = new Date(today.getTime() + 86400000);
    const debutSemaine = new Date(today);
    debutSemaine.setDate(today.getDate() - today.getDay() + 1);
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

    const filtreDebut = dateDebut ? new Date(dateDebut) : null;
    const filtreFin   = dateFin   ? new Date(dateFin)   : null;

    const [
      totalPatients, totalPrescriptions, totalRdv, totalKitsEnvoyes,
      patientsActifs, rdvAujourdhui, kitsAujourdhui,
      prescSemaine, rdvSemaine, kitsMois, rdvMois, allPatients,
    ] = await Promise.all([
      this.patientRepo.count(),
      this.prescRepo.count(),
      this.rdvRepo.count(),
      this.kitRepo.count(),
      this.patientRepo.count({ where: { traitement_statut: 'actif' } }),
      this.rdvRepo.count({ where: { date_heure: Between(today, demain) } }),
      this.kitRepo.count({ where: { date_envoi: Between(today, demain) } }),
      this.prescRepo.count({ where: { date_prescription: Between(debutSemaine, demain) } }),
      this.rdvRepo.count({ where: { date_heure: Between(debutSemaine, demain) } }),
      this.kitRepo.count({ where: { date_envoi: Between(debutMois, demain) } }),
      this.rdvRepo.count({ where: { date_heure: Between(debutMois, demain) } }),
      this.patientRepo.find({ select: ['id', 'dateNaissance'] }),
    ]);

    const ageStats = { '0-18': 0, '19-30': 0, '31-45': 0, '46-60': 0, '61-75': 0, '76+': 0 };
    for (const p of allPatients) {
      if (!p.dateNaissance) continue;
      const birth = new Date(p.dateNaissance);
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
      if (age <= 18) ageStats['0-18']++;
      else if (age <= 30) ageStats['19-30']++;
      else if (age <= 45) ageStats['31-45']++;
      else if (age <= 60) ageStats['46-60']++;
      else if (age <= 75) ageStats['61-75']++;
      else ageStats['76+']++;
    }

    let intervalle: any = null;
    if (filtreDebut && filtreFin) {
      const finJour = new Date(filtreFin.getTime() + 86400000);
      const [prescI, rdvI, kitsI] = await Promise.all([
        this.prescRepo.count({ where: { date_prescription: Between(filtreDebut, finJour) } }),
        this.rdvRepo.count({ where: { date_heure: Between(filtreDebut, finJour) } }),
        this.kitRepo.count({ where: { date_envoi: Between(filtreDebut, finJour) } }),
      ]);
      intervalle = { debut: dateDebut, fin: dateFin, prescriptions: prescI, rendezVous: rdvI, kitsEnvoyes: kitsI };
    }

    return {
      global: { patients: totalPatients, patientsActifs, prescriptions: totalPrescriptions, rendezVous: totalRdv, kitsEnvoyes: totalKitsEnvoyes },
      aujourdhui: { rendezVous: rdvAujourdhui, kitsEnvoyes: kitsAujourdhui },
      semaine: { prescriptions: prescSemaine, rendezVous: rdvSemaine },
      mois: { kitsEnvoyes: kitsMois, rendezVous: rdvMois },
      parAge: ageStats,
      intervalle,
      genereLe: new Date().toISOString(),
    };
  }

  async genererRapport(auteur?: string, periode?: string): Promise<Rapport> {
    const stats        = await this.getStatsGlobales();
    const now          = new Date();
    const periodeLabel = periode || 'mensuel';
    const mois         = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const rapport      = this.rapportRepo.create({
      titre:      `Rapport ${periodeLabel} - ${mois}`,
      type:       'statistique',
      periode:    periodeLabel,
      date_debut: new Date(now.getFullYear(), now.getMonth(), 1),
      date_fin:   now,
      auteur:     auteur || 'Systeme',
      statut:     'genere',
      donnees:    stats,
    });
    return this.rapportRepo.save(rapport);
  }

  // ============================================================
  // RAPPORT 1 — ACTIVITÉ DIALYSE GLOBALE
  // ============================================================

  async getRapportActiviteDialyse(
    dateDebut?: string,
    dateFin?: string,
    auteur = 'Système',
  ): Promise<{ rapport: Rapport; kpi: KpiActiviteDialyse }> {

    const filtre = this.buildDateFilter(dateDebut, dateFin);

    // Requête séances
    const qbSeance = this.seanceRepo.createQueryBuilder('s');
    if (filtre) qbSeance.where('s.date_debut BETWEEN :debut AND :fin', { debut: filtre.debut, fin: filtre.fin });
    const seances = await qbSeance.getMany();

    // Calculs séances
    const totalSeances = seances.length;
    const poidsPreSum  = seances.reduce((acc, s) => acc + Number(s.poids_pre  ?? 0), 0);
    const poidsPostSum = seances.reduce((acc, s) => acc + Number(s.poids_post ?? 0), 0);
    const poidsMoyenPre  = totalSeances ? this.arrondir(poidsPreSum  / totalSeances) : 0;
    const poidsMoyenPost = totalSeances ? this.arrondir(poidsPostSum / totalSeances) : 0;

    // Jours uniques pour moyenne/jour
    const joursUniques = new Set(seances.map(s => new Date(s.date_debut).toDateString())).size;
    const moyenneParJour = joursUniques ? this.arrondir(totalSeances / joursUniques) : 0;

    // Requête RDV
    const qbRdv = this.rdvRepo.createQueryBuilder('r');
    if (filtre) qbRdv.where('r.date_heure BETWEEN :debut AND :fin', { debut: filtre.debut, fin: filtre.fin });
    const rdvList = await qbRdv.getMany();

    // Grouper par statut RDV
    const parStatutRdv: Record<string, number> = {};
    const parStatutSeance: Record<string, number> = {};
    const parMachine: Record<string, number> = {};
    for (const r of rdvList) {
      const st  = normaliserStatut(r.statut);
      const ss  = normaliserStatut(r.statut_seance);
      const mac = r.machine       || 'non_definie';
      parStatutRdv[st]      = (parStatutRdv[st]      || 0) + 1;
      parStatutSeance[ss]   = (parStatutSeance[ss]   || 0) + 1;
      parMachine[mac]       = (parMachine[mac]       || 0) + 1;
    }

    const totalRdv     = rdvList.length;
    const termines     = parStatutSeance['terminé'] || 0;
    const tauxRealisation = totalRdv ? this.arrondir((termines / totalRdv) * 100) : 0;

    // Patients
    const [totalPatients, patientsActifs, patientsSuspendus, patientsTermines] = await Promise.all([
      this.patientRepo.count(),
      this.patientRepo.count({ where: { traitement_statut: 'actif' } }),
      this.patientRepo.count({ where: { traitement_statut: 'suspendu' } }),
      this.patientRepo.count({ where: { traitement_statut: 'terminé' } }),
    ]);

    const kpi: KpiActiviteDialyse = {
      meta: this.buildMeta(dateDebut, dateFin),
      seances: {
        total:              totalSeances,
        moyenne_par_jour:   moyenneParJour,
        poids_moyen_pre:    poidsMoyenPre,
        poids_moyen_post:   poidsMoyenPost,
        perte_poids_moyenne: this.arrondir(poidsMoyenPre - poidsMoyenPost),
      },
      rendezVous: {
        total:                totalRdv,
        par_statut:           parStatutRdv,
        par_statut_seance:    parStatutSeance,
        taux_realisation_pct: tauxRealisation,
        par_machine:          parMachine,
      },
      patients: {
        total:      totalPatients,
        actifs:     patientsActifs,
        suspendus:  patientsSuspendus,
        termines:   patientsTermines,
      },
    };

    const rapport = await this.sauvegarderRapport(
      `Rapport Activité Dialyse${dateDebut ? ' - ' + dateDebut + ' au ' + dateFin : ''}`,
      'activite_dialyse', kpi, dateDebut, dateFin, auteur,
    );

    return { rapport, kpi };
  }

  // ============================================================
  // RAPPORT 2 — MÉDICAL PATIENT
  // ============================================================

  async getRapportMedicalPatient(
    patientId: number,
    dateDebut?: string,
    dateFin?: string,
    auteur = 'Système',
  ): Promise<{ rapport: Rapport; kpi: KpiMedicalPatient }> {

    const patient = await this.patientRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException(`Patient #${patientId} introuvable`);

    const filtre = this.buildDateFilter(dateDebut, dateFin);

    // Séances du patient
    const qbS = this.seanceRepo.createQueryBuilder('s').where('s.patient_id = :pid', { pid: patientId });
    if (filtre) qbS.andWhere('s.date_debut BETWEEN :debut AND :fin', { debut: filtre.debut, fin: filtre.fin });
    const seances = await qbS.getMany();

    const totalSeances   = seances.length;
    const poidsPreSum    = seances.reduce((a, s) => a + Number(s.poids_pre  ?? 0), 0);
    const poidsPostSum   = seances.reduce((a, s) => a + Number(s.poids_post ?? 0), 0);
    const poidsMoyenPre  = totalSeances ? this.arrondir(poidsPreSum  / totalSeances) : 0;
    const poidsMoyenPost = totalSeances ? this.arrondir(poidsPostSum / totalSeances) : 0;

    const historique = seances.map(s => ({
      date_debut:  s.date_debut,
      date_fin:    s.date_fin,
      poids_pre:   Number(s.poids_pre),
      poids_post:  Number(s.poids_post),
      perte_poids: this.arrondir(Number(s.poids_pre) - Number(s.poids_post)),
    }));

    // Surveillances du patient
    const qbSurv = this.surveillanceRepo
      .createQueryBuilder('sv')
      .leftJoinAndSelect('sv.lignes', 'l')
      .where('sv.patient_id = :pid', { pid: patientId });
    if (filtre) qbSurv.andWhere('sv.created_at BETWEEN :debut AND :fin', { debut: filtre.debut, fin: filtre.fin });
    const surveillances = await qbSurv.getMany();

    const totalSurv = surveillances.length;
    let ktVSum = 0; let ktVCount = 0;
    let incidentsCount = 0;
    let recirculationMauvaise = 0;
    let piegeBulleCaillot = 0;

    for (const sv of surveillances) {
      if (sv.kt_v) { const v = parseFloat(sv.kt_v); if (!isNaN(v)) { ktVSum += v; ktVCount++; } }
      if (sv.recirculation === 'MAUVAISE') recirculationMauvaise++;
      if (sv.piege_bulle   === 'caillot')  piegeBulleCaillot++;
      for (const l of (sv.lignes || [])) {
        if (l.incidents_cliniques && l.incidents_cliniques.trim()) incidentsCount++;
      }
    }

    const ktVMoyen       = ktVCount ? this.arrondir(ktVSum / ktVCount) : null;
    const tauxIncident   = totalSurv ? this.arrondir((incidentsCount / totalSurv) * 100) : 0;

    // Prescriptions
    const prescriptions  = await this.prescRepo.find({ where: { patient: { id: patientId } } });
    const parStatutPresc: Record<string, number> = {};
    for (const p of prescriptions) {
      const st = p.workflow_statut || 'inconnu';
      parStatutPresc[st] = (parStatutPresc[st] || 0) + 1;
    }
    const prescActives = prescriptions.filter(p => p.workflow_statut === 'valide').length;

    // Soins
    const soins = await this.soinsRepo.find({ where: { patient_id: patientId } });
    const accesTypes: Record<string, number> = {};
    let valideInfirmier = 0; let valideMedecin = 0;
    for (const s of soins) {
      if (s.validation_infirmier) valideInfirmier++;
      if (s.validation_medecin)   valideMedecin++;
      const at = s.acces_type || 'inconnu';
      accesTypes[at] = (accesTypes[at] || 0) + 1;
    }

    // Score risque
    const facteurs: string[] = [];
    let score = 0;
    if (incidentsCount > 2)          { score += 3; facteurs.push(`${incidentsCount} incidents détectés`); }
    if (recirculationMauvaise > 1)   { score += 2; facteurs.push('Recirculation mauvaise répétée'); }
    if (piegeBulleCaillot > 0)       { score += 2; facteurs.push('Piège à bulles caillot détecté'); }
    if (ktVMoyen !== null && ktVMoyen < 1.2) { score += 2; facteurs.push(`Kt/V insuffisant (${ktVMoyen})`); }
    if (prescActives === 0)          { score += 1; facteurs.push('Aucune prescription active'); }

    const kpi: KpiMedicalPatient = {
      meta: this.buildMeta(dateDebut, dateFin),
      patient: {
        id:                patient.id,
        nom:               patient.nom,
        prenom:            patient.prenom,
        dateNaissance:     patient.dateNaissance,
        traitement_statut: patient.traitement_statut,
      },
      seances: { total: totalSeances, historique, poids_moyen_pre: poidsMoyenPre, poids_moyen_post: poidsMoyenPost },
      surveillance: {
        total_surveillances:    totalSurv,
        kt_v_moyen:             ktVMoyen,
        incidents_detectes:     incidentsCount,
        taux_incident_pct:      tauxIncident,
        recirculation_mauvaise: recirculationMauvaise,
        piege_bulle_caillot:    piegeBulleCaillot,
      },
      prescriptions: { total: prescriptions.length, actives: prescActives, par_statut: parStatutPresc },
      soins: {
        total:              soins.length,
        valides_infirmier:  valideInfirmier,
        valides_medecin:    valideMedecin,
        acces_types:        accesTypes,
      },
      risque: { score, niveau: this.calculerNiveau(score), facteurs },
    };

    const rapport = await this.sauvegarderRapport(
      `Rapport Médical - ${patient.nom} ${patient.prenom}`,
      'medical_patient', kpi, dateDebut, dateFin, auteur,
    );

    return { rapport, kpi };
  }

  // ============================================================
  // RAPPORT 3 — PRESCRIPTIONS
  // ============================================================

  async getRapportPrescriptions(
    dateDebut?: string,
    dateFin?: string,
    auteur = 'Système',
  ): Promise<{ rapport: Rapport; kpi: KpiPrescriptions }> {

    const filtre = this.buildDateFilter(dateDebut, dateFin);

    const qb = this.prescRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.medecin', 'm');
    if (filtre) qb.where('p.date_prescription BETWEEN :debut AND :fin', { debut: filtre.debut, fin: filtre.fin });

    const prescriptions = await qb.getMany();
    const total         = prescriptions.length;

    // Par statut
    const parStatut: Record<string, number> = {};
    let totalDelaiHeures = 0; let countDelai = 0;

    for (const p of prescriptions) {
      const st = p.workflow_statut || 'inconnu';
      parStatut[st] = (parStatut[st] || 0) + 1;
      if (p.validated_at && p.date_prescription) {
        const debut = new Date(p.date_prescription).getTime();
        const fin   = new Date(p.validated_at).getTime();
        const diff  = (fin - debut) / 3600000;
        if (diff >= 0) { totalDelaiHeures += diff; countDelai++; }
      }
    }

    const valides       = parStatut['valide']    || 0;
    const enAttente     = parStatut['brouillon'] || 0;
    const tauxValidation = total ? this.arrondir((valides / total) * 100) : 0;
    const delaiMoyen    = countDelai ? this.arrondir(totalDelaiHeures / countDelai) : null;

    // Top médicaments
    const medicMap: Record<string, number> = {};
    for (const p of prescriptions) {
      const m = p.medicament || 'inconnu';
      medicMap[m] = (medicMap[m] || 0) + 1;
    }
    const topMedicaments = Object.entries(medicMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([medicament, count]) => ({ medicament, count }));

    // Par médecin
    const medecinMap: Record<string, { total: number; validees: number }> = {};
    for (const p of prescriptions) {
      const nom = p.medecin ? p.medecin.nom : 'Non assigné';
      if (!medecinMap[nom]) medecinMap[nom] = { total: 0, validees: 0 };
      medecinMap[nom].total++;
      if (p.workflow_statut === 'valide') medecinMap[nom].validees++;
    }
    const parMedecin = Object.entries(medecinMap)
      .map(([medecin, stats]) => ({ medecin, ...stats }))
      .sort((a, b) => b.total - a.total);

    const kpi: KpiPrescriptions = {
      meta: this.buildMeta(dateDebut, dateFin),
      global: {
        total,
        taux_validation_pct:            tauxValidation,
        delai_moyen_validation_heures:  delaiMoyen,
        en_attente:                     enAttente,
      },
      par_statut:     parStatut,
      top_medicaments: topMedicaments,
      par_medecin:    parMedecin,
    };

    const rapport = await this.sauvegarderRapport(
      `Rapport Prescriptions${dateDebut ? ' - ' + dateDebut + ' au ' + dateFin : ''}`,
      'prescriptions', kpi, dateDebut, dateFin, auteur,
    );

    return { rapport, kpi };
  }

  // ============================================================
  // RAPPORT 4 — KITS ET CONSOMMATION
  // ============================================================

  async getRapportKitsConsommation(
    dateDebut?: string,
    dateFin?: string,
    auteur = 'Système',
  ): Promise<{ rapport: Rapport; kpi: KpiKitsConsommation }> {

    const filtre = this.buildDateFilter(dateDebut, dateFin);

    const qb = this.kitRepo
      .createQueryBuilder('k')
      .leftJoinAndSelect('k.patient', 'p');
    if (filtre) qb.where('k.date_envoi BETWEEN :debut AND :fin', { debut: filtre.debut, fin: filtre.fin });

    const kits        = await qb.getMany();
    const totalKits   = kits.length;
    const totalArticles = kits.reduce((a, k) => a + (k.articles_count || 0), 0);
    const moyenneArticles = totalKits ? this.arrondir(totalArticles / totalKits) : 0;

    // Par type kit
    const parTypeKit: Record<string, number> = {};
    // Par statut
    const parStatut: Record<string, number> = {};
    // Par patient
    const patientMap: Record<string, { patient: string; kits: number; articles: number }> = {};
    // Evolution mensuelle
    const mensuelMap: Record<string, { kits: number; articles: number }> = {};

    for (const k of kits) {
      const type   = k.type_kit || 'inconnu';
      const statut = k.statut   || 'inconnu';
      parTypeKit[type]   = (parTypeKit[type]   || 0) + 1;
      parStatut[statut]  = (parStatut[statut]  || 0) + 1;

      // Patient
      const patNom = k.patient ? `${k.patient.nom} ${k.patient.prenom}` : `Patient #${k.patient_id}`;
      if (!patientMap[patNom]) patientMap[patNom] = { patient: patNom, kits: 0, articles: 0 };
      patientMap[patNom].kits++;
      patientMap[patNom].articles += k.articles_count || 0;

      // Mensuel
      const mois = new Date(k.date_envoi).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      if (!mensuelMap[mois]) mensuelMap[mois] = { kits: 0, articles: 0 };
      mensuelMap[mois].kits++;
      mensuelMap[mois].articles += k.articles_count || 0;
    }

    const topPatients = Object.values(patientMap)
      .sort((a, b) => b.kits - a.kits)
      .slice(0, 10);

    const evolutionMensuelle = Object.entries(mensuelMap)
      .map(([mois, stats]) => ({ mois, ...stats }));

    const kpi: KpiKitsConsommation = {
      meta: this.buildMeta(dateDebut, dateFin),
      global: { total_kits: totalKits, total_articles: totalArticles, moyenne_articles_par_kit: moyenneArticles },
      par_type_kit:        parTypeKit,
      par_statut:          parStatut,
      top_patients:        topPatients,
      evolution_mensuelle: evolutionMensuelle,
    };

    const rapport = await this.sauvegarderRapport(
      `Rapport Kits & Consommation${dateDebut ? ' - ' + dateDebut + ' au ' + dateFin : ''}`,
      'kits_consommation', kpi, dateDebut, dateFin, auteur,
    );

    return { rapport, kpi };
  }

  // ============================================================
  // RAPPORT 5 — RDV ET FLUX PATIENTS
  // ============================================================

  async getRapportRdvFlux(
    dateDebut?: string,
    dateFin?: string,
    auteur = 'Système',
  ): Promise<{ rapport: Rapport; kpi: KpiRdvFlux }> {

    const filtre = this.buildDateFilter(dateDebut, dateFin);

    const qb = this.rdvRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.medecin', 'm');
    if (filtre) qb.where('r.date_heure BETWEEN :debut AND :fin', { debut: filtre.debut, fin: filtre.fin });

    const rdvList  = await qb.getMany();
    const totalRdv = rdvList.length;

    const parStatutRdv: Record<string, number>    = {};
    const parStatutSeance: Record<string, number> = {};
    const parMachine: Record<string, number>      = {};
    const fluxHoraire: Record<string, number>     = {};
    const medecinMap: Record<string, number>      = {};
    let totalDureeMin = 0; let countDuree = 0;

    for (const r of rdvList) {
      // Statuts
      const st  = normaliserStatut(r.statut);
      const ss  = normaliserStatut(r.statut_seance);
      parStatutRdv[st]   = (parStatutRdv[st]   || 0) + 1;
      parStatutSeance[ss]= (parStatutSeance[ss] || 0) + 1;

      // Machine
      const mac = r.machine || 'non_definie';
      parMachine[mac] = (parMachine[mac] || 0) + 1;

      // Flux horaire
      const heure = `${new Date(r.date_heure).getHours()}h`;
      fluxHoraire[heure] = (fluxHoraire[heure] || 0) + 1;

      // Médecin
      const nomMed = r.medecin ? r.medecin.nom : 'Non assigné';
      medecinMap[nomMed] = (medecinMap[nomMed] || 0) + 1;

      // Durée réelle
      if (r.heure_debut_reelle && r.heure_fin_reelle) {
        const diff = (new Date(r.heure_fin_reelle).getTime() - new Date(r.heure_debut_reelle).getTime()) / 60000;
        if (diff > 0) { totalDureeMin += diff; countDuree++; }
      }
    }

    const presents  = parStatutSeance['terminé']    || 0;
    const absents   = parStatutSeance['absent']      || 0;
    const annules   = parStatutRdv['annulé']         || 0;
    const tauxPresence     = totalRdv ? this.arrondir((presents / totalRdv) * 100) : 0;
    const tauxAbsenteisme  = totalRdv ? this.arrondir((absents  / totalRdv) * 100) : 0;
    const tauxAnnulation   = totalRdv ? this.arrondir((annules  / totalRdv) * 100) : 0;
    const dureeMoyenne     = countDuree ? this.arrondir(totalDureeMin / countDuree) : null;

    const chargeMedecin = Object.entries(medecinMap).map(([medecin, total]) => ({
      medecin,
      total,
      charges_pct: totalRdv ? this.arrondir((total / totalRdv) * 100) : 0,
    })).sort((a, b) => b.total - a.total);

    const kpi: KpiRdvFlux = {
      meta: this.buildMeta(dateDebut, dateFin),
      global: {
        total_rdv:                      totalRdv,
        taux_presence_pct:              tauxPresence,
        taux_absenteisme_pct:           tauxAbsenteisme,
        taux_annulation_pct:            tauxAnnulation,
        duree_moyenne_seance_minutes:   dureeMoyenne,
      },
      par_statut_rdv:    parStatutRdv,
      par_statut_seance: parStatutSeance,
      charge_par_medecin: chargeMedecin,
      par_machine:        parMachine,
      flux_horaire:       fluxHoraire,
    };

    const rapport = await this.sauvegarderRapport(
      `Rapport RDV & Flux Patients${dateDebut ? ' - ' + dateDebut + ' au ' + dateFin : ''}`,
      'rdv_flux', kpi, dateDebut, dateFin, auteur,
    );

    return { rapport, kpi };
  }

  // ============================================================
  // RAPPORT 6 — SURVEILLANCE CRITIQUE
  // ============================================================

  async getRapportSurveillanceCritique(
    dateDebut?: string,
    dateFin?: string,
    auteur = 'Système',
  ): Promise<{ rapport: Rapport; kpi: KpiSurveillanceCritique }> {

    const filtre = this.buildDateFilter(dateDebut, dateFin);

    const qb = this.surveillanceRepo
      .createQueryBuilder('sv')
      .leftJoinAndSelect('sv.lignes', 'l')
      .leftJoinAndSelect('sv.rendez_vous', 'r')
      .leftJoinAndSelect('sv.patient', 'p');
    if (filtre) qb.where('sv.created_at BETWEEN :debut AND :fin', { debut: filtre.debut, fin: filtre.fin });

    const surveillances     = await qb.getMany();
    const totalSurveillances = surveillances.length;
    let totalLignes = 0; let incidentsDetectes = 0;
    let recirculationMauvaise = 0; let piegeBulleCaillot = 0;
    let dealeurCaillot = 0; let ktVInsuffisant = 0;

    const infirmierMap: Record<string, { surveillances: number; incidents: number }> = {};
    const patientIncidents: Record<number, { nom: string; incidents: number }> = {};

    for (const sv of surveillances) {
      totalLignes += (sv.lignes || []).length;
      if (sv.recirculation === 'MAUVAISE') recirculationMauvaise++;
      if (sv.piege_bulle   === 'caillot')  piegeBulleCaillot++;
      if (sv.dealeur       === 'caillot')  dealeurCaillot++;
      if (sv.kt_v) { const v = parseFloat(sv.kt_v); if (!isNaN(v) && v < 1.2) ktVInsuffisant++; }

      // Infirmier
      const inf = sv.infirmier_nom || 'Non assigné';
      if (!infirmierMap[inf]) infirmierMap[inf] = { surveillances: 0, incidents: 0 };
      infirmierMap[inf].surveillances++;

      // Incidents par ligne
      let incidentsSv = 0;
      for (const l of (sv.lignes || [])) {
        if (l.incidents_cliniques && l.incidents_cliniques.trim()) {
          incidentsDetectes++;
          incidentsSv++;
        }
      }
      infirmierMap[inf].incidents += incidentsSv;

      // Patient incidents
      if (sv.patient_id) {
        if (!patientIncidents[sv.patient_id]) {
          const nomPat = sv.patient ? `${sv.patient.nom} ${sv.patient.prenom}` : `Patient #${sv.patient_id}`;
          patientIncidents[sv.patient_id] = { nom: nomPat, incidents: 0 };
        }
        patientIncidents[sv.patient_id].incidents += incidentsSv;
      }
    }

    const tauxIncident = totalSurveillances
      ? this.arrondir((incidentsDetectes / totalSurveillances) * 100) : 0;

    const patientsARisque = Object.entries(patientIncidents)
      .filter(([, v]) => v.incidents >= 2)
      .map(([pid, v]) => ({
        patient_id:  Number(pid),
        patient_nom: v.nom,
        nb_incidents: v.incidents,
        niveau:      this.calculerNiveau(v.incidents),
      }))
      .sort((a, b) => b.nb_incidents - a.nb_incidents)
      .slice(0, 20);

    const parInfirmier = Object.entries(infirmierMap)
      .map(([infirmier, stats]) => ({ infirmier, ...stats }))
      .sort((a, b) => b.surveillances - a.surveillances);

    const kpi: KpiSurveillanceCritique = {
      meta: this.buildMeta(dateDebut, dateFin),
      global: {
        total_surveillances: totalSurveillances,
        total_lignes:        totalLignes,
        incidents_detectes:  incidentsDetectes,
        taux_incident_pct:   tauxIncident,
      },
      alertes: {
        recirculation_mauvaise: recirculationMauvaise,
        piege_bulle_caillot:    piegeBulleCaillot,
        dealeur_caillot:        dealeurCaillot,
        kt_v_insuffisant:       ktVInsuffisant,
      },
      patients_a_risque: patientsARisque,
      par_infirmier:     parInfirmier,
    };

    const rapport = await this.sauvegarderRapport(
      `Rapport Surveillance Critique${dateDebut ? ' - ' + dateDebut + ' au ' + dateFin : ''}`,
      'surveillance_critique', kpi, dateDebut, dateFin, auteur,
    );

    return { rapport, kpi };
  }

  // ============================================================
  // RAPPORT 7 — PERFORMANCE PERSONNEL
  // ============================================================

  async getRapportPerformancePersonnel(
    dateDebut?: string,
    dateFin?: string,
    auteur = 'Système',
  ): Promise<{ rapport: Rapport; kpi: KpiPerformancePersonnel }> {

    const filtre = this.buildDateFilter(dateDebut, dateFin);

    // Soins
    const qbSoins = this.soinsRepo.createQueryBuilder('s');
    if (filtre) qbSoins.where('s.created_at BETWEEN :debut AND :fin', { debut: filtre.debut, fin: filtre.fin });
    const soins = await qbSoins.getMany();

    // Surveillances
    const qbSurv = this.surveillanceRepo.createQueryBuilder('sv');
    if (filtre) qbSurv.where('sv.created_at BETWEEN :debut AND :fin', { debut: filtre.debut, fin: filtre.fin });
    const surveillances = await qbSurv.getMany();

    // Performance infirmiers
    const infirmierPerf: Record<string, {
      surveillances: number; soins: number; validations_soins: number;
    }> = {};

    for (const sv of surveillances) {
      const inf = sv.infirmier_nom || 'Non assigné';
      if (!infirmierPerf[inf]) infirmierPerf[inf] = { surveillances: 0, soins: 0, validations_soins: 0 };
      infirmierPerf[inf].surveillances++;
    }

    for (const s of soins) {
      const inf = s.infirmier_nom || 'Non assigné';
      if (!infirmierPerf[inf]) infirmierPerf[inf] = { surveillances: 0, soins: 0, validations_soins: 0 };
      infirmierPerf[inf].soins++;
      if (s.validation_infirmier) infirmierPerf[inf].validations_soins++;
    }

    const totalSoins        = soins.length;
    const totalValidsSoins  = soins.filter(s => s.validation_infirmier).length;
    const tauxValidSoinsGlobal = totalSoins ? this.arrondir((totalValidsSoins / totalSoins) * 100) : 0;

    const performanceInfirmiers = Object.entries(infirmierPerf).map(([nom, stats]) => ({
      nom,
      ...stats,
      taux_validation_pct: stats.soins ? this.arrondir((stats.validations_soins / stats.soins) * 100) : 0,
    })).sort((a, b) => b.surveillances - a.surveillances);

    const totalInfirmiersActifs = new Set(
      [...surveillances.map(s => s.infirmier_nom), ...soins.map(s => s.infirmier_nom)]
        .filter(Boolean)
    ).size;

    // Médecins
    const qbMed = this.medecinRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.rendez_vous', 'r')
      .leftJoinAndSelect('m.prescriptions', 'p');
    const medecins = await qbMed.getMany();

    const performanceMedecins = medecins.map(m => {
      let rdvTotal = m.rendez_vous?.length || 0;
      let prescTotal = m.prescriptions?.length || 0;
      let prescValidees = (m.prescriptions || []).filter(p => p.workflow_statut === 'valide').length;

      if (filtre) {
        rdvTotal    = (m.rendez_vous   || []).filter(r => {
          const d = new Date(r.date_heure);
          return d >= filtre.debut && d <= filtre.fin;
        }).length;
        prescTotal  = (m.prescriptions || []).filter(p => {
          const d = new Date(p.date_prescription);
          return d >= filtre.debut && d <= filtre.fin;
        }).length;
        prescValidees = (m.prescriptions || []).filter(p => {
          const d = new Date(p.date_prescription);
          return d >= filtre.debut && d <= filtre.fin && p.workflow_statut === 'valide';
        }).length;
      }

      return {
        nom:                  m.nom,
        specialite:           m.specialite,
        rdv_total:            rdvTotal,
        prescriptions_total:  prescTotal,
        prescriptions_validees: prescValidees,
      };
    }).sort((a, b) => b.rdv_total - a.rdv_total);

    const nbInfirmiers = performanceInfirmiers.length || 1;
    const nbMedecins   = performanceMedecins.length   || 1;
    const totalRdvAll  = performanceMedecins.reduce((a, m) => a + m.rdv_total, 0);

    const kpi: KpiPerformancePersonnel = {
      meta: this.buildMeta(dateDebut, dateFin),
      infirmiers: {
        total_actifs:  totalInfirmiersActifs,
        performance:   performanceInfirmiers,
      },
      medecins: {
        total:       medecins.length,
        performance: performanceMedecins,
      },
      global: {
        taux_validation_soins_global_pct: tauxValidSoinsGlobal,
        charge_moyenne_infirmier:         this.arrondir(surveillances.length / nbInfirmiers),
        charge_moyenne_medecin:           this.arrondir(totalRdvAll / nbMedecins),
      },
    };

    const rapport = await this.sauvegarderRapport(
      `Rapport Performance Personnel${dateDebut ? ' - ' + dateDebut + ' au ' + dateFin : ''}`,
      'performance_personnel', kpi, dateDebut, dateFin, auteur,
    );

    return { rapport, kpi };
  }
}
