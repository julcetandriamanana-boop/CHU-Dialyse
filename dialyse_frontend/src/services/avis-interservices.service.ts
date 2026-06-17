'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ─── Types ────────────────────────────────────────────────────

export interface DemandeAvis {
  id:                   number;
  patient:              { id: number; nom: string; prenom: string; [key: string]: any } | null;
  service_demandeur:    string | null;
  service_destinataire: string | null;
  motif:                string | null;
  description_cas:      string | null;
  statut:               string | null;
  priorite:             string | null;
  reponse:              string | null;
  repondu_par:          string | null;
  repondu_at:           string | null;
  date_envoi:           string | null;
  created_at:           string;
  updated_at:           string;
  is_archived:          boolean;
}

export interface AvisStats {
  total:        number;
  en_attente:   number;
  repondues:    number;
  taux_reponse: number;
}

// ─── Helpers ──────────────────────────────────────────────────

export function getNomPatient(avis: DemandeAvis): string {
  if (avis.patient) return `${avis.patient.prenom || ''} ${avis.patient.nom || ''}`.trim();
  return 'Patient inconnu';
}

export function getMotif(avis: DemandeAvis): string {
  return avis.motif || avis.description_cas || 'Motif non précisé';
}

export function getServiceDemandeur(avis: DemandeAvis): string {
  return avis.service_demandeur || 'Service non précisé';
}

export function isEnAttente(avis: DemandeAvis): boolean {
  return avis.statut === 'en_attente' || (!avis.reponse && avis.statut !== 'repondu');
}

export function getPrioriteConfig(p: string | null): { label: string; bg: string; text: string; border: string } {
  const map: Record<string, { label: string; bg: string; text: string; border: string }> = {
    critique: { label: 'Critique', bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-300'    },
    haute:    { label: 'Haute',    bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
    moyenne:  { label: 'Moyenne',  bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-300'  },
    basse:    { label: 'Basse',    bg: 'bg-slate-100',  text: 'text-slate-600',  border: 'border-slate-300'  },
  };
  return map[p || 'moyenne'] || map['moyenne'];
}

// ─── API ──────────────────────────────────────────────────────

async function get<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function post<T>(endpoint: string, body: unknown = {}): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function put<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export const AvisAPI = {
  // Demandes reçues par Dialyse
  getRecues: (opts?: {
    statut?: string;
    service_demandeur?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (opts?.statut) params.append('statut', opts.statut);
    if (opts?.service_demandeur) params.append('service_demandeur', opts.service_demandeur);
    if (opts?.search) params.append('search', opts.search);
    const q = params.toString();
    return get<DemandeAvis[]>(`/demandes-avis/recues${q ? '?' + q : ''}`);
  },

  // Stats
  getStats: () => get<AvisStats>('/demandes-avis/stats'),

  // Détail
  getById: (id: number) => get<DemandeAvis>(`/demandes-avis/${id}`),

  // Répondre
  repondre: (id: number, reponse: string, repondu_par: string) =>
    put<DemandeAvis>(`/demandes-avis/${id}/repondre`, { reponse, repondu_par }),

  // Créer (pour test)
  creer: (data: {
    patient_id?: number;
    service_demandeur: string;
    service_destinataire?: string;
    motif: string;
    priorite?: string;
  }) => post<DemandeAvis>('/demandes-avis', {
    ...data,
    service_destinataire: data.service_destinataire || 'Dialyse',
  }),
};
