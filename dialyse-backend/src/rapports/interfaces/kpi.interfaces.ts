// ============================================================
// KPI INTERFACES - Rapports Avancés CHU Dialyse
// ============================================================

// ─── COMMUN ─────────────────────────────────────────────────
export interface FiltreDate {
  dateDebut?: string;
  dateFin?: string;
}

export interface MetaRapport {
  genereLe: string;
  periode: { debut: string | null; fin: string | null };
}

// ─── RAPPORT 1 : ACTIVITÉ DIALYSE GLOBALE ───────────────────
export interface KpiActiviteDialyse {
  meta: MetaRapport;
  seances: {
    total: number;
    moyenne_par_jour: number;
    poids_moyen_pre: number;
    poids_moyen_post: number;
    perte_poids_moyenne: number;
  };
  rendezVous: {
    total: number;
    par_statut: Record<string, number>;
    par_statut_seance: Record<string, number>;
    taux_realisation_pct: number;
    par_machine: Record<string, number>;
  };
  patients: {
    total: number;
    actifs: number;
    suspendus: number;
    termines: number;
  };
}

// ─── RAPPORT 2 : MÉDICAL PATIENT ────────────────────────────
export interface KpiMedicalPatient {
  meta: MetaRapport;
  patient: {
    id: number;
    nom: string;
    prenom: string;
    dateNaissance: Date | null;
    traitement_statut: string | null;
  };
  seances: {
    total: number;
    historique: Array<{
      date_debut: Date;
      date_fin: Date;
      poids_pre: number;
      poids_post: number;
      perte_poids: number;
    }>;
    poids_moyen_pre: number;
    poids_moyen_post: number;
  };
  surveillance: {
    total_surveillances: number;
    kt_v_moyen: number | null;
    incidents_detectes: number;
    taux_incident_pct: number;
    recirculation_mauvaise: number;
    piege_bulle_caillot: number;
  };
  prescriptions: {
    total: number;
    actives: number;
    par_statut: Record<string, number>;
  };
  soins: {
    total: number;
    valides_infirmier: number;
    valides_medecin: number;
    acces_types: Record<string, number>;
  };
  risque: {
    score: number;
    niveau: 'faible' | 'modere' | 'eleve' | 'critique';
    facteurs: string[];
  };
}

// ─── RAPPORT 3 : PRESCRIPTIONS ──────────────────────────────
export interface KpiPrescriptions {
  meta: MetaRapport;
  global: {
    total: number;
    taux_validation_pct: number;
    delai_moyen_validation_heures: number | null;
    en_attente: number;
  };
  par_statut: Record<string, number>;
  top_medicaments: Array<{ medicament: string; count: number }>;
  par_medecin: Array<{ medecin: string; total: number; validees: number }>;
}

// ─── RAPPORT 4 : KITS ET CONSOMMATION ───────────────────────
export interface KpiKitsConsommation {
  meta: MetaRapport;
  global: {
    total_kits: number;
    total_articles: number;
    moyenne_articles_par_kit: number;
  };
  par_type_kit: Record<string, number>;
  par_statut: Record<string, number>;
  top_patients: Array<{ patient: string; kits: number; articles: number }>;
  evolution_mensuelle: Array<{ mois: string; kits: number; articles: number }>;
}

// ─── RAPPORT 5 : RDV ET FLUX PATIENTS ───────────────────────
export interface KpiRdvFlux {
  meta: MetaRapport;
  global: {
    total_rdv: number;
    taux_presence_pct: number;
    taux_absenteisme_pct: number;
    taux_annulation_pct: number;
    duree_moyenne_seance_minutes: number | null;
  };
  par_statut_rdv: Record<string, number>;
  par_statut_seance: Record<string, number>;
  charge_par_medecin: Array<{ medecin: string; total: number; charges_pct: number }>;
  par_machine: Record<string, number>;
  flux_horaire: Record<string, number>;
}

// ─── RAPPORT 6 : SURVEILLANCE CRITIQUE ──────────────────────
export interface KpiSurveillanceCritique {
  meta: MetaRapport;
  global: {
    total_surveillances: number;
    total_lignes: number;
    incidents_detectes: number;
    taux_incident_pct: number;
  };
  alertes: {
    recirculation_mauvaise: number;
    piege_bulle_caillot: number;
    dealeur_caillot: number;
    kt_v_insuffisant: number;
  };
  patients_a_risque: Array<{
    patient_id: number;
    patient_nom: string;
    nb_incidents: number;
    niveau: string;
  }>;
  par_infirmier: Array<{ infirmier: string; surveillances: number; incidents: number }>;
}

// ─── RAPPORT 7 : PERFORMANCE PERSONNEL ──────────────────────
export interface KpiPerformancePersonnel {
  meta: MetaRapport;
  infirmiers: {
    total_actifs: number;
    performance: Array<{
      nom: string;
      surveillances: number;
      soins: number;
      validations_soins: number;
      taux_validation_pct: number;
    }>;
  };
  medecins: {
    total: number;
    performance: Array<{
      nom: string;
      specialite: string;
      rdv_total: number;
      prescriptions_total: number;
      prescriptions_validees: number;
    }>;
  };
  global: {
    taux_validation_soins_global_pct: number;
    charge_moyenne_infirmier: number;
    charge_moyenne_medecin: number;
  };
}
