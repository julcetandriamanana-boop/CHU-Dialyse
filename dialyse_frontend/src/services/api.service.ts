'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

// Patients
export const PatientAPI = {
  getAll: () => fetchAPI<any[]>('/patients'),
  getById: (id: number) => fetchAPI<any>(`/patients/${id}`),
  create: (data: any) => fetchAPI<any>('/patients', { method: 'POST', body: JSON.stringify(data) }),
  test: () => fetchAPI<string>('/patients/test'),
};

// Prescriptions
export const PrescriptionAPI = {
  getAll: (params?: string) => fetchAPI<any[]>(`/prescriptions${params ? `?${params}` : ''}`),
  getEnAttente: () => fetchAPI<any[]>('/prescriptions/en-attente'),
  getValidees: () => fetchAPI<any[]>('/prescriptions/validees'),
  valider: (data: any) => fetchAPI<any>('/prescriptions/valider', { method: 'POST', body: JSON.stringify(data) }),
  create: (data: any) => fetchAPI<any>('/prescriptions', { method: 'POST', body: JSON.stringify(data) }),
};

// Rendez-vous
export const RendezVousAPI = {
  getAll: () => fetchAPI<any[]>('/rendezvous'),
  creer: (data: any) => fetchAPI<any>('/rendezvous/creer', { method: 'POST', body: JSON.stringify(data) }),
};

// Ordonnances
export const OrdonnanceAPI = {
  getAll: () => fetchAPI<any[]>('/ordonnances'),
  getByPatient: (patientId: string) => fetchAPI<any[]>(`/ordonnances/${patientId}`),
  creer: (data: any) => fetchAPI<any>('/ordonnances/creer', { method: 'POST', body: JSON.stringify(data) }),
};

// Surveillance
export const SurveillanceAPI = {
  getAll: () => fetchAPI<any[]>('/surveillance'),
  enregistrer: (data: any) => fetchAPI<any>('/surveillance/enregistrer', { method: 'POST', body: JSON.stringify(data) }),
};
