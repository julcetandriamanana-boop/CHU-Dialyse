'use client';

/**
 * Service client API Pharmacie CHU
 * URL: https://chupharmacie.onrender.com/api
 *
 * Permet à Dialyse d'envoyer des prescriptions kit à la pharmacie
 * et de récupérer les kits disponibles.
 */

const PHARMACIE_API = 'https://chupharmacie.onrender.com/api';
const DIALYSE_API   = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const MY_SERVICE_ID = process.env.NEXT_PUBLIC_DIALYSE_SERVICE_ID || 'd604bde1-c9dd-4284-a690-0c5ed9be6a37';
export const MY_CHU_ID     = process.env.NEXT_PUBLIC_DIALYSE_CHU_ID     || '1e5bbbb7-fa10-4d59-8848-2d0ce96a9394';

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════

export interface PharmacieKitItem {
  id: string;
  designation: string;
  quantiteDefaut: number;
  unite: string;
  kitId: string;
}

export interface PharmacieKit {
  id: string;
  nom: string;
  service: string;
  is_don: boolean;
  created_at: string;
  updated_at: string;
  service_id: string | null;
  items: PharmacieKitItem[];
}

export interface OrdonnanceArticle {
  designation: string;
  quantite: number;
  unite: string;
  statut_stock?: 'disponible' | 'stock_insuffisant' | 'rupture';
}

export interface OrdonnancePayload {
  patientId: string;
  patientNom: string;
  patientPrenom: string;
  patientSexe?: string;
  patientAge?: number;
  numeroDossier?: string;
  rendezVousId?: number;
  kitId: string;
  kitNom: string;
  typeKit: 'premiere' | 'suivante' | 'premier_soin';
  serviceDemandeur: string;
  emetteurId: number;
  emetteurNom: string;
  emetteurRole: string;
  articles: OrdonnanceArticle[];
  datePrescription: string;
  notes?: string;
}

// ═══════════════════════════════════════════════════
// API Pharmacie — Lecture des kits
// ═══════════════════════════════════════════════════

export async function fetchKitsPharmacie(): Promise<PharmacieKit[]> {
  try {
    const res = await fetch(`${PHARMACIE_API}/kits`);
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error('Erreur fetch kits pharmacie:', e);
    return [];
  }
}

export async function fetchKitById(kitId: string): Promise<PharmacieKit | null> {
  try {
    const res = await fetch(`${PHARMACIE_API}/kits/${kitId}`);
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error('Erreur fetch kit:', e);
    return null;
  }
}

export async function fetchKitItems(kitId: string): Promise<PharmacieKitItem[]> {
  try {
    const res = await fetch(`${PHARMACIE_API}/kits/${kitId}/items`);
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error('Erreur fetch items kit:', e);
    return [];
  }
}

// Récupère les 2 kits principaux : 1ère séance et séances suivantes
export async function fetchKitsHemodialyse(): Promise<{
  premiere: PharmacieKit | null;
  suivante: PharmacieKit | null;
  premierSoin: PharmacieKit | null;
}> {
  const kits = await fetchKitsPharmacie();
  const hemodialyse = kits.filter(k => k.service === 'HEMODIALYSE');

  const premiere    = hemodialyse.find(k => k.nom.toLowerCase().includes('1ère') || k.nom.toLowerCase().includes('1ere')) || null;
  const suivante    = hemodialyse.find(k => k.nom.toLowerCase().includes('prochaine') || k.nom.toLowerCase().includes('suivante')) || null;
  const premierSoin = hemodialyse.find(k => k.nom.toLowerCase().includes('1er soin') || k.nom.toLowerCase().includes('ordonnance')) || null;

  return { premiere, suivante, premierSoin };
}

// ═══════════════════════════════════════════════════
// Envoi prescription kit vers pharmacie
// ═══════════════════════════════════════════════════

/**
 * Envoie une ordonnance kit à la pharmacie via 2 actions:
 * 1. POST /api/prescriptions/dialyse/{id}/ordonnance (création ordonnance)
 * 2. POST /api/notifications/receive (notification pharmacie)
 */
export async function envoyerOrdonnanceKit(payload: OrdonnancePayload): Promise<{
  success: boolean;
  ordonnanceId?: string;
  message: string;
  details?: any;
}> {
  try {
    // ═══════════════════════════════════════════════════
    // 1. Créer l'ordonnance dans la pharmacie
    // ═══════════════════════════════════════════════════
    const ordonnanceBody = {
      patient: {
        id:       payload.patientId,
        nom:      payload.patientNom,
        prenom:   payload.patientPrenom,
        sexe:     payload.patientSexe,
        age:      payload.patientAge,
        dossier:  payload.numeroDossier,
      },
      kit: {
        id:   payload.kitId,
        nom:  payload.kitNom,
        type: payload.typeKit,
      },
      articles: payload.articles.map(a => ({
        designation: a.designation,
        quantite:    a.quantite,
        unite:       a.unite,
      })),
      emetteur: {
        id:   payload.emetteurId,
        nom:  payload.emetteurNom,
        role: payload.emetteurRole,
      },
      service_demandeur: payload.serviceDemandeur,
      service_id:        MY_SERVICE_ID,
      chu_id:            MY_CHU_ID,
      date_prescription: payload.datePrescription,
      notes:             payload.notes,
      rendez_vous_id:    payload.rendezVousId,
      statut:            'EN_ATTENTE_PREPARATION',
    };

    const ordonnanceRes = await fetch(
      `${PHARMACIE_API}/prescriptions/dialyse/${payload.patientId}/ordonnance`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(ordonnanceBody),
      },
    );

    let ordonnanceData: any = null;
    try { ordonnanceData = await ordonnanceRes.json(); } catch {}

    // ═══════════════════════════════════════════════════
    // 2. Envoyer notification à la pharmacie (signal)
    // ═══════════════════════════════════════════════════
    try {
      await fetch(`${PHARMACIE_API}/notifications/receive`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type:              'PRESCRIPTION_KIT',
          motif:             `Nouvelle ordonnance Kit Dialyse reçue - Patient: ${payload.patientPrenom} ${payload.patientNom} - Type: ${payload.kitNom}`,
          urgence:           3,
          sourceServiceId:   MY_SERVICE_ID,
          sourceServiceName: 'Dialyse CHU Andrainjato',
          targetServiceId:   '40c296da-d940-44d0-bcd8-9f0379ea5f04', // Service Pharmaceutique
          targetServiceName: 'Service Pharmaceutique',
          emitterId:         String(payload.emetteurId),
          emitterName:       payload.emetteurNom,
          patientId:         payload.patientId,
          sentAt:            new Date().toISOString(),
          channels:          ['WEB', 'SOUND'],
          payload: {
            ordonnance_id: ordonnanceData?.id || null,
            kit_id:        payload.kitId,
            kit_nom:       payload.kitNom,
            patient_nom:   `${payload.patientPrenom} ${payload.patientNom}`,
            articles:      payload.articles,
          },
        }),
      });
    } catch (notifErr) {
      console.warn('Notification pharmacie non envoyée:', notifErr);
    }

    // ═══════════════════════════════════════════════════
    // 3. Notification interne Dialyse (confirmation)
    // ═══════════════════════════════════════════════════
    try {
      await fetch(`${DIALYSE_API}/notifications`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:    'Ordonnance Kit envoyée',
          message:  `Kit "${payload.kitNom}" envoyé à la pharmacie pour ${payload.patientPrenom} ${payload.patientNom}`,
          type:     'success',
          category: 'pharmacie',
          icon:     'send',
          link:     '/dialyses',
          urgence:  2,
        }),
      });
    } catch {}

    // Enregistrer en base Dialyse (toujours, meme si pharmacie ne repond pas)
    try {
      const enregistrementRes = await fetch(`${DIALYSE_API}/prescription-kit-envoyee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id:              parseInt(payload.patientId),
          rendez_vous_id:          payload.rendezVousId || null,
          kit_id:                  payload.kitId,
          kit_nom:                 payload.kitNom,
          type_kit:                payload.typeKit,
          ordonnance_pharmacie_id: ordonnanceData?.id || ordonnanceData?.ordonnance_id || null,
          articles_count:          payload.articles.length,
          emetteur_id:             payload.emetteurId,
          emetteur_nom:            payload.emetteurNom,
          emetteur_role:           payload.emetteurRole,
          notes:                   payload.notes,
        }),
      });
      console.log('Enregistrement Dialyse status:', enregistrementRes.status);
    } catch (e) {
      console.warn('Erreur enregistrement local kit envoye:', e);
    }

    if (!ordonnanceRes.ok) {
      return {
        success: false,
        message: ordonnanceData?.message || `Erreur ${ordonnanceRes.status}`,
        details: ordonnanceData,
      };
    }

    return {
      success:      true,
      ordonnanceId: ordonnanceData?.id || ordonnanceData?.ordonnance_id,
      message:      'Ordonnance Kit Dialyse envoyée avec succès à la Pharmacie',
      details:      ordonnanceData,
    };
  } catch (err: any) {
    console.error('Erreur envoi ordonnance:', err);
    return {
      success: false,
      message: err?.message || 'Erreur réseau',
    };
  }
}

// ═══════════════════════════════════════════════════
// Récupérer ordonnances envoyées (historique)
// ═══════════════════════════════════════════════════

export async function fetchOrdonnancesPatient(patientId: string): Promise<any[]> {
  try {
    const res = await fetch(`${PHARMACIE_API}/prescriptions/dialyse/patient/${patientId}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchPrescriptionsDialyse(): Promise<any[]> {
  try {
    const res = await fetch(`${PHARMACIE_API}/prescriptions/dialyse`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// ═══════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════

export function getTypeKitFromKit(kit: PharmacieKit): 'premiere' | 'suivante' | 'premier_soin' {
  const n = kit.nom.toLowerCase();
  if (n.includes('1ère') || n.includes('1ere')) return 'premiere';
  if (n.includes('soin') || n.includes('ordonnance')) return 'premier_soin';
  return 'suivante';
}

export function calculerAge(dateNaissance?: string): number | null {
  if (!dateNaissance) return null;
  const t = new Date();
  const b = new Date(dateNaissance);
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return a;
}

// ═══════════════════════════════════════════════════
// Suivi prescription kit envoyée
// ═══════════════════════════════════════════════════

export interface KitEnvoye {
  id: number;
  patient_id: number;
  rendez_vous_id: number | null;
  kit_id: string;
  kit_nom: string;
  type_kit: string;
  ordonnance_pharmacie_id: string | null;
  articles_count: number;
  emetteur_id: number | null;
  emetteur_nom: string | null;
  emetteur_role: string | null;
  statut: string;
  date_envoi: string;
  notes: string | null;
  created_at: string;
}

export interface PatientKitStatus {
  count: number;
  dernier: string;
}

/**
 * Map patientId → { count, dernier date }
 */
export async function fetchPatientsKitStatus(): Promise<Record<number, PatientKitStatus>> {
  try {
    const res = await fetch(`${DIALYSE_API}/prescription-kit-envoyee/patients-status`);
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

/**
 * Liste des kits envoyés pour un patient
 */
export async function fetchKitsEnvoyesPatient(patientId: number): Promise<KitEnvoye[]> {
  try {
    const res = await fetch(`${DIALYSE_API}/prescription-kit-envoyee/patient/${patientId}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/**
 * Enregistrer un kit envoyé en base Dialyse
 */
export async function enregistrerKitEnvoye(data: {
  patient_id: number;
  rendez_vous_id?: number | null;
  kit_id: string;
  kit_nom: string;
  type_kit: string;
  ordonnance_pharmacie_id?: string | null;
  articles_count: number;
  emetteur_id?: number | null;
  emetteur_nom?: string | null;
  emetteur_role?: string | null;
  notes?: string | null;
}): Promise<KitEnvoye | null> {
  try {
    const res = await fetch(`${DIALYSE_API}/prescription-kit-envoyee`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}


// ═══════════════════════════════════════════════════
// Prescriptions cliniques (depuis Pharmacie)
// ═══════════════════════════════════════════════════

export interface PrescriptionClinique {
  id: string;
  patientId: string;        // numero_dossier ex: IP-2026-00001
  prescripteurId: string;
  urgence: string;          // 'Très Urgent' | 'Urgent' | 'Normal' | 'Programmé'
  alertes: string;
  renseignements: string;
  typeDialyse: string;
  remarques: string;
  statut: string;           // CREEE / VALIDEE / etc.
  statutSync: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Récupère toutes les prescriptions cliniques depuis la pharmacie
 */
export async function fetchPrescriptionsCliniques(): Promise<PrescriptionClinique[]> {
  try {
    const res = await fetch(`${PHARMACIE_API}/prescriptions/dialyse`);
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error('Erreur fetch prescriptions cliniques:', e);
    return [];
  }
}

/**
 * Récupère les prescriptions cliniques pour un patient (par numero_dossier)
 */
export async function fetchPrescriptionsCliniquesPatient(numeroDossier: string): Promise<PrescriptionClinique[]> {
  try {
    const res = await fetch(`${PHARMACIE_API}/prescriptions/dialyse/patient/${numeroDossier}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/**
 * Normalise le niveau d'urgence
 */
export function normaliserUrgence(urgence: string): 'tres_urgent' | 'urgent' | 'normal' | 'programme' {
  const u = (urgence || '').toLowerCase().trim();
  if (u.includes('très') || u.includes('tres') || u === 'tu' || u === 'critique') return 'tres_urgent';
  if (u.includes('urgent') || u === 'u') return 'urgent';
  if (u.includes('programm') || u === 'p') return 'programme';
  return 'normal';
}

/**
 * Couleurs urgence pour affichage
 */
export function urgenceColors(urgence: string): { bg: string; text: string; border: string; label: string } {
  const niveau = normaliserUrgence(urgence);
  const map = {
    tres_urgent: {
      bg: 'bg-gradient-to-r from-red-500 to-rose-600',
      text: 'text-white',
      border: 'border-red-600',
      label: 'TRÈS URGENT',
    },
    urgent: {
      bg: 'bg-gradient-to-r from-orange-500 to-amber-600',
      text: 'text-white',
      border: 'border-orange-600',
      label: 'URGENT',
    },
    normal: {
      bg: 'bg-gradient-to-r from-emerald-500 to-teal-600',
      text: 'text-white',
      border: 'border-emerald-600',
      label: 'NORMAL',
    },
    programme: {
      bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      text: 'text-white',
      border: 'border-blue-600',
      label: 'PROGRAMMÉ',
    },
  };
  return map[niveau];
}
