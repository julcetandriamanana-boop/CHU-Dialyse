'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function get<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${endpoint}`);
  return res.json();
}

async function post<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${endpoint}`);
  return res.json();
}

async function del(endpoint: string): Promise<void> {
  await fetch(`${API_URL}${endpoint}`, { method: 'DELETE' });
}

// ─── Types ───────────────────────────────────────────────────
export interface RapportSauvegarde {
  id: number;
  titre: string;
  type: string;
  periode: string;
  date_debut: string | null;
  date_fin: string | null;
  auteur: string | null;
  statut: string;
  donnees: any;
  created_at: string;
}

export interface FiltreDate {
  dateDebut?: string;
  dateFin?: string;
}

// ─── API Rapports ─────────────────────────────────────────────
export const RapportsAPI = {

  // Existants
  getStats: (f?: FiltreDate) => {
    const p = f?.dateDebut && f?.dateFin
      ? `?dateDebut=${f.dateDebut}&dateFin=${f.dateFin}`
      : '';
    return get<any>(`/rapports/stats${p}`);
  },

  getListe: () => get<RapportSauvegarde[]>('/rapports'),

  generer: (auteur: string, periode: string) =>
    post<RapportSauvegarde>('/rapports/generer', { auteur, periode }),

  supprimer: (id: number) => del(`/rapports/${id}`),

  // Rapport 1 - Activité dialyse
  getActiviteDialyse: (f?: FiltreDate) => {
    const p = buildParams(f);
    return get<any>(`/rapports/activite-dialyse${p}`);
  },

  // Rapport 2 - Médical patient
  getMedicalPatient: (patientId: number, f?: FiltreDate) => {
    const p = buildParams(f, `patientId=${patientId}`);
    return get<any>(`/rapports/medical-patient${p}`);
  },

  // Rapport 3 - Prescriptions
  getPrescriptions: (f?: FiltreDate) => {
    const p = buildParams(f);
    return get<any>(`/rapports/prescriptions${p}`);
  },

  // Rapport 4 - Kits consommation
  getKitsConsommation: (f?: FiltreDate) => {
    const p = buildParams(f);
    return get<any>(`/rapports/kits-consommation${p}`);
  },

  // Rapport 5 - RDV flux
  getRdvFlux: (f?: FiltreDate) => {
    const p = buildParams(f);
    return get<any>(`/rapports/rdv-flux${p}`);
  },

  // Rapport 6 - Surveillance critique
  getSurveillanceCritique: (f?: FiltreDate) => {
    const p = buildParams(f);
    return get<any>(`/rapports/surveillance-critique${p}`);
  },

  // Rapport 7 - Performance personnel
  getPerformancePersonnel: (f?: FiltreDate) => {
    const p = buildParams(f);
    return get<any>(`/rapports/performance-personnel${p}`);
  },
};

function buildParams(f?: FiltreDate, extra?: string): string {
  const parts: string[] = [];
  if (extra) parts.push(extra);
  if (f?.dateDebut) parts.push(`dateDebut=${f.dateDebut}`);
  if (f?.dateFin)   parts.push(`dateFin=${f.dateFin}`);
  return parts.length ? `?${parts.join('&')}` : '';
}
