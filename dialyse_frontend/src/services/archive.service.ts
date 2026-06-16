'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function get<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${endpoint}`);
  return res.json();
}

async function post<T>(endpoint: string, body: unknown = {}): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${endpoint}`);
  return res.json();
}

// ─── Types ────────────────────────────────────────────────────

export type ModuleArchive =
  | 'patients' | 'rendezvous' | 'prescriptions' | 'kits'
  | 'seances'  | 'soins'      | 'surveillance'   | 'demandes-avis';

export interface ArchiveItem {
  module:        ModuleArchive;
  id:            number;
  label:         string;
  description:   string;
  is_archived:   boolean;
  archived_at:   string | null;
  archived_by:   string | null;
  archive_motif: string | null;
  donnees:       Record<string, any>;
}

export interface PaginatedArchives {
  data:       ArchiveItem[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export interface ArchiveStats {
  total:            number;
  par_module:       Record<ModuleArchive, number>;
  par_mois:         Array<{ mois: string; count: number }>;
  derniere_archive: string | null;
  genereLe:         string;
}

export interface TimelineEvent {
  type:    string;
  date:    string;
  titre:   string;
  details: string;
  icon:    string;
  couleur: string;
}

export interface HistoriquePatient {
  patient: Record<string, any>;
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

export interface PatientSimple {
  id:          number;
  nom:         string;
  prenom:      string;
  is_archived: boolean;
}

export interface ArchiveQuery {
  search?:    string;
  dateDebut?: string;
  dateFin?:   string;
  page?:      number;
  limit?:     number;
}

// ─── API Archive ──────────────────────────────────────────────

export const ArchiveAPI = {

  // Lister tout
  listerTout: (q: ArchiveQuery = {}) => {
    const p = buildParams(q);
    return get<PaginatedArchives>(`/archives${p}`);
  },

  // Lister par module
  listerParModule: (module: ModuleArchive, q: ArchiveQuery = {}) => {
    const p = buildParams(q);
    return get<PaginatedArchives>(`/archives/${module}${p}`);
  },

  // Statistiques
  getStats: () => get<ArchiveStats>('/archives/statistiques'),

  // Liste patients pour select
  getPatients: () => get<PatientSimple[]>('/archives/patients-liste'),

  // Historique complet patient
  getHistorique: (patientId: number) =>
    get<HistoriquePatient>(`/archives/patient/${patientId}/historique`),

  // Archiver
  archiver: (module: ModuleArchive, id: number, motif: string, archived_by: string) =>
    post<{ ok: boolean; message: string; cascade?: Record<string, number> }>(
      `/archives/${module}/${id}/archiver`,
      { motif, archived_by },
    ),

  // Restaurer
  restaurer: (module: ModuleArchive, id: number) =>
    post<{ ok: boolean; message: string; cascade?: Record<string, number> }>(
      `/archives/${module}/${id}/restaurer`,
      {},
    ),
};

// ─── Utilitaire ───────────────────────────────────────────────

function buildParams(q: ArchiveQuery): string {
  const parts: string[] = [];
  if (q.search)    parts.push(`search=${encodeURIComponent(q.search)}`);
  if (q.dateDebut) parts.push(`dateDebut=${q.dateDebut}`);
  if (q.dateFin)   parts.push(`dateFin=${q.dateFin}`);
  if (q.page)      parts.push(`page=${q.page}`);
  if (q.limit)     parts.push(`limit=${q.limit}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

// ─── Couleurs et icônes par module ───────────────────────────

export const MODULE_CONFIG: Record<ModuleArchive, {
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  badge: string;
}> = {
  'patients':     { label: 'Patient',       icon: 'person',           color: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700'    },
  'rendezvous':   { label: 'RDV',           icon: 'event',            color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
  'prescriptions':{ label: 'Prescription',  icon: 'prescriptions',    color: 'text-violet-600', bg: 'bg-violet-50',  border: 'border-violet-200',  badge: 'bg-violet-100 text-violet-700'  },
  'kits':         { label: 'Kit',           icon: 'inventory_2',      color: 'text-pink-600',   bg: 'bg-pink-50',    border: 'border-pink-200',    badge: 'bg-pink-100 text-pink-700'    },
  'seances':      { label: 'Séance',        icon: 'vaccine',          color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200',   badge: 'bg-amber-100 text-amber-700'  },
  'soins':        { label: 'Soins',         icon: 'healing',          color: 'text-cyan-600',   bg: 'bg-cyan-50',    border: 'border-cyan-200',    badge: 'bg-cyan-100 text-cyan-700'    },
  'surveillance': { label: 'Surveillance',  icon: 'monitor_heart',    color: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-200',     badge: 'bg-red-100 text-red-700'      },
  'demandes-avis':{ label: "Demande d'avis",icon: 'question_answer',  color: 'text-orange-600', bg: 'bg-orange-50',  border: 'border-orange-200',  badge: 'bg-orange-100 text-orange-700'},
};

export const TIMELINE_CONFIG: Record<string, {
  icon: string; couleur: string; bg: string; border: string;
}> = {
  archivage:    { icon: 'archive',         couleur: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-200'    },
  restauration: { icon: 'restore',         couleur: 'text-green-600',  bg: 'bg-green-50',   border: 'border-green-200'  },
  rendezvous:   { icon: 'event',           couleur: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-200'   },
  prescription: { icon: 'prescriptions',   couleur: 'text-violet-600', bg: 'bg-violet-50',  border: 'border-violet-200' },
  kit:          { icon: 'inventory_2',     couleur: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200'  },
  seance:       { icon: 'vaccine',         couleur: 'text-emerald-600',bg: 'bg-emerald-50', border: 'border-emerald-200'},
  soins:        { icon: 'healing',         couleur: 'text-cyan-600',   bg: 'bg-cyan-50',    border: 'border-cyan-200'   },
  surveillance: { icon: 'monitor_heart',   couleur: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-200'   },
  demande_avis: { icon: 'question_answer', couleur: 'text-orange-600', bg: 'bg-orange-50',  border: 'border-orange-200' },
  creation:     { icon: 'person_add',      couleur: 'text-slate-600',  bg: 'bg-slate-50',   border: 'border-slate-200'  },
};
