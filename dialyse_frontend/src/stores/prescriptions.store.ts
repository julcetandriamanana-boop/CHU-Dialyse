'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type PrescriptionStatus = 'en_attente' | 'urgence' | 'validee';

export interface Prescription {
  id: number;
  patientName: string;
  patientId: string;
  type: string;
  motif: string;
  priorite: string;
  status: PrescriptionStatus;
  date: string;
  service: string;
  nephrologue: string;
  rdvDate?: string;
  validatedAt?: string;
}

export async function getPendingAndUrgent(): Promise<Prescription[]> {
  const res = await fetch(`${API_URL}/prescriptions/en-attente`);
  const data = await res.json();
  return data.map((p: any) => ({
    id: p.id,
    patientName: `${p.patient?.prenom || ''} ${p.patient?.nom || ''}`,
    patientId: `DX-${p.patient?.id || '0000'}`,
    type: 'Prescription',
    motif: p.medicament,
    priorite: p.workflow_statut === 'actif' ? 'Urgent' : 'Normal',
    status: p.workflow_statut === 'actif' ? 'urgence' : p.workflow_statut === 'brouillon' ? 'en_attente' : 'validee',
    date: p.date_prescription,
    service: 'Néphrologie',
    nephrologue: p.medecin?.nom || 'Dr. Andrianjato',
  }));
}

export async function getValidated(): Promise<Prescription[]> {
  const res = await fetch(`${API_URL}/prescriptions/validees`);
  const data = await res.json();
  return data.map((p: any) => ({
    id: p.id,
    patientName: `${p.patient?.prenom || ''} ${p.patient?.nom || ''}`,
    patientId: `DX-${p.patient?.id || '0000'}`,
    type: 'Prescription',
    motif: p.medicament,
    priorite: 'Normal',
    status: 'validee',
    date: p.date_prescription,
    service: 'Néphrologie',
    nephrologue: p.medecin?.nom || '',
    validatedAt: p.date_prescription,
  }));
}

export async function validerPrescription(prescriptionId: number, rdvInfo: { date: string; creneau: string; machine: string }) {
  await fetch(`${API_URL}/prescriptions/valider`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prescriptionId, ...rdvInfo }),
  });
  // Créer aussi le RDV dans la table rendez_vous
  const presc = await fetch(`${API_URL}/prescriptions/${prescriptionId}`).then(r => r.json());
  if (presc.patient?.id) {
    await fetch(`${API_URL}/rendezvous/creer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: presc.patient.id,
        date_heure: `${rdvInfo.date}T08:00:00`,
        motif: presc.medicament || 'Séance dialyse',
        creneau: rdvInfo.creneau,
        machine: rdvInfo.machine,
      }),
    });
  }
}

export async function saveValidatedPrescription(prescription: any) {
  await fetch(`${API_URL}/prescriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patient: { id: parseInt(prescription.patientId?.replace('DX-', '') || '1') },
      medicament: prescription.details?.diagnostic || prescription.details?.motif || 'Prescription',
      dosage: 'Standard',
      frequence: 'Selon protocole',
      workflow_statut: 'terminé',
      date_prescription: new Date().toISOString().split('T')[0],
    }),
  });
}

export function getPrescriptions(): any[] {
  return [];
}
