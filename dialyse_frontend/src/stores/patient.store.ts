'use client';

const PATIENT_STORAGE_KEY = 'chu_dialyse_current_patient';

export interface PatientData {
  id: string;
  nom: string;
  prenoms: string;
  age: string;
  sexe: 'M' | 'F' | '';
  telephone: string;
  adresse: string;
  service: string;
  poids: string;
  dateNaissance: string;
  groupeSanguin: string;
  antecedents: string;
  allergie: string;
  nephrologue: string;
  infirmiere: string;
  dernierSeance: string;
  prochaineSeance: string;
}

const defaultPatient: PatientData = {
  id: '', nom: '', prenoms: '', age: '', sexe: '', telephone: '',
  adresse: '', service: '', poids: '', dateNaissance: '', groupeSanguin: '',
  antecedents: '', allergie: '', nephrologue: '', infirmiere: '',
  dernierSeance: '', prochaineSeance: '',
};

export function getCurrentPatient(): PatientData {
  if (typeof window === 'undefined') return { ...defaultPatient };
  const stored = localStorage.getItem(PATIENT_STORAGE_KEY);
  return stored ? { ...defaultPatient, ...JSON.parse(stored) } : { ...defaultPatient };
}

export function setCurrentPatient(patient: Partial<PatientData>) {
  if (typeof window === 'undefined') return;
  const current = getCurrentPatient();
  const updated = { ...current, ...patient };
  localStorage.setItem(PATIENT_STORAGE_KEY, JSON.stringify(updated));
}

export function setPatientFromDB(patient: { id: number; nom: string; prenom: string; telephone?: string }) {
  setCurrentPatient({
    id: `DX-${String(patient.id).padStart(4, '0')}`,
    nom: patient.nom,
    prenoms: patient.prenom,
    telephone: patient.telephone || '',
  });
}

export function clearCurrentPatient() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PATIENT_STORAGE_KEY);
}

export async function fetchPatientsFromDB() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const res = await fetch(`${API_URL}/patients`);
  return res.json();
}
