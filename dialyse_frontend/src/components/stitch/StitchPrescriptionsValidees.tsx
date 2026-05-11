'use client';

import { useState } from "react";

const VALIDATED_PRESCRIPTIONS_STORAGE_KEY = "dialyse_validated_prescriptions";

type ValidatedPrescription = {
  id: string;
  type: string;
  patientName: string;
  patientId: string;
  validatedAt: string;
  details: Record<string, string>;
};

function formatValidatedAt(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function StitchPrescriptionsValidees() {
  const [validatedPrescriptions] = useState<ValidatedPrescription[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    return JSON.parse(
      window.localStorage.getItem(VALIDATED_PRESCRIPTIONS_STORAGE_KEY) || "[]"
    ) as ValidatedPrescription[];
  });

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary-fixed-dim">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 h-16 shadow-xl shadow-blue-900/5">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <img alt="CHU Andrainjato Logo" className="h-10 w-auto" src="https://lh3.googleusercontent.com/aida/ADBb0uiGy8ScMjL6ZLQy7_SbLYlroJWfo78U1O4eeUMeLWpk2HKguGLGHHLChg1RlUhL5-GvJCkZZWJlDOGm1m0pJ-0gDFnkYrfag2UyCyUZclqEkh1ioIClAiyD5we9kq9xabonQTSOjhWFFTLF14LONOkKdpIjyyRMSMn5HDfVRrU4TD8nV9Gf9r_hXLUjFBYdKhV4HZwBuWMJuGmxbqw6ceHnNcWyCNRuN-PilD2vmd6ZIvO5-zBnWKhp-bAtrIxsE3YijfC_SbrT5A" />
            <span className="text-xl font-black tracking-tighter text-blue-800 dark:text-blue-300">Vitalis Core</span>
          </div>
          <div className="hidden md:flex gap-6">
            <span className="text-slate-500 dark:text-slate-400 font-medium font-inter text-sm hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer px-2 py-1 rounded"><br /></span>
            <span className="text-blue-700 dark:text-blue-400 font-bold border-b-2 border-blue-600 font-inter text-sm px-2 py-1">Validations</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium font-inter text-sm hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer px-2 py-1 rounded"><br /></span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-blue-50/50 transition-colors text-slate-500">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 rounded-full hover:bg-blue-50/50 transition-colors text-slate-500">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="h-8 w-8 rounded-full bg-surface-container-highest overflow-hidden">
            <img alt="Medical Staff Profile" className="w-full h-full object-cover" data-alt="Close-up portrait of a professional medical doctor in clinical attire with soft neutral clinic background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrTFECXijGZzesVvZ8fJKmJ-F0g81xdBZ3uoBAn3RY31S1HRpwQmTTHosaPPDJ7iAWp4q60MDCJ3vjZQ7BBdUOcZEOGFOLBqBDCqfDUT5h2OJ-2lPFVQqeQ1JfBPJ58yumM-U9AUTNm93mMeakdlxBEl5v7hhaFhKy4rPKI23Hui_dbZ5_aVqImS5FxYHx6J4Zu2pc7LG_EACEewyY1rQxWq1c2KleN4w5j1VlmUKy-EUGfdtx9o2tIbn45EJeYJ8YbGODIJEJ4CpQ" />
          </div>
        </div>
      </nav>
      <div className="flex pt-16 min-h-[1024px]">
        {/* SideNavBar */}
        {/* Main Content Area */}
        <main className="flex-1 p-8 bg-background">
          <header className="mb-10 max-w-6xl mx-auto">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="font-display font-extrabold text-4xl text-on-surface tracking-tight mb-2">Prescriptions Validées</h1>
                <p className="text-secondary font-medium">Patients prêts pour l'admission et la séance de dialyse.</p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="bg-surface-container px-4 py-2 rounded-lg flex items-center gap-3 text-sm font-medium text-on-surface-variant">
                  <span className="material-symbols-outlined text-lg">calendar_today</span>
                  Aujourd'hui, 24 Mai 2024
                </div>
              </div>
            </div>
          </header>
          <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
            {/* Stats Row (Bento Style) */}
            <div className="col-span-12 lg:col-span-4 bg-surface-container-low p-6 rounded-xl border-none">
              <p className="text-sm font-semibold text-secondary mb-1">Prêts pour séance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-primary">12</span>
                <span className="text-sm text-on-surface-variant font-medium">Patients</span>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4 bg-surface-container-low p-6 rounded-xl border-none">
              <p className="text-sm font-semibold text-secondary mb-1">Kits Logistiques</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-secondary">100%</span>
                <span className="text-sm text-on-surface-variant font-medium">Opérationnel</span>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4 bg-primary-container/10 p-6 rounded-xl border-none border-l-4 border-primary">
              <p className="text-sm font-semibold text-primary mb-1">Prochaine Urgence</p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-on-surface">M. Durand Antoine</span>
                <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">14:30</span>
              </div>
            </div>
            {/* Main Patients List (Glassmorphism & Asymmetric Layout) */}
            <div className="col-span-12 space-y-4">
              {validatedPrescriptions.map((prescription) => (
                <div key={prescription.id} className="bg-primary-container/10 p-6 rounded-xl shadow-sm border border-primary/20 flex items-center gap-6 hover:bg-primary-container/20 transition-colors group">
                  <div className="w-12 h-12 rounded-lg bg-primary text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: '"FILL" 1'}}>verified</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-on-surface">{prescription.patientName}</h3>
                    <p className="text-sm text-secondary font-mono">ID: {prescription.patientId}</p>
                  </div>
                  <div className="flex-1 px-4">
                    <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-1">ValidÃ© le</p>
                    <p className="text-sm font-medium text-on-surface">{formatValidatedAt(prescription.validatedAt)}</p>
                    <p className="text-xs text-secondary uppercase tracking-widest mt-2">Origine : <span className="text-on-surface font-semibold">{prescription.type}</span></p>
                  </div>
                  <div className="flex-[1.4] px-4 text-sm text-on-surface-variant">
                    {Object.entries(prescription.details).map(([label, value]) => (
                      <p key={label} className="mb-1">
                        <span className="font-bold capitalize text-on-surface">{label}:</span> {value}
                      </p>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-[10px] rounded-full uppercase tracking-tighter">NOUVEAU</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary font-bold text-[10px] rounded-full uppercase tracking-tighter">RDV OK</span>
                  </div>
                </div>
              ))}
              {/* Patient Row 1 */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-none flex items-center gap-6 hover:bg-surface-container-high transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: '"FILL" 1'}}>person</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-on-surface">Jean-Pierre Dubois</h3>
                  <p className="text-sm text-secondary font-mono">ID: #DX-99283</p>
                </div>
                <div className="flex-1 px-4">
                  <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-1">Validé le</p>
                  <p className="text-sm font-medium text-on-surface">23/05/2024 à 16:45</p>
                  <p className="text-xs text-secondary uppercase tracking-widest mt-2">Séances : <span className="text-on-surface font-semibold">3</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary font-bold text-[10px] rounded-full uppercase tracking-tighter">RDV OK</span>
                </div>
                <div className="flex gap-2 ml-4">
                  <button className="prescription-kit-trigger primary-gradient text-white px-5 py-2 rounded-md font-bold text-sm shadow-md transition-all active:scale-95">Prescription Kit</button>
                  <button className="bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-md font-bold text-sm hover:bg-surface-variant transition-all">Voir détails</button>
                </div>
              </div>
              {/* Patient Row 2 */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-none flex items-center gap-6 hover:bg-surface-container-high transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: '"FILL" 1'}}>person</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-on-surface">Marie-Claire Lefebvre</h3>
                  <p className="text-sm text-secondary font-mono">ID: #DX-88120</p>
                </div>
                <div className="flex-1 px-4">
                  <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-1">Validé le</p>
                  <p className="text-sm font-medium text-on-surface">24/05/2024 à 08:30</p>
                  <p className="text-xs text-secondary uppercase tracking-widest mt-2">Séances : <span className="text-on-surface font-semibold">2</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary font-bold text-[10px] rounded-full uppercase tracking-tighter">RDV OK</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-[10px] rounded-full uppercase tracking-tighter">KITS OK</span>
                </div>
                <div className="flex gap-2 ml-4">
                  <button className="bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-md font-bold text-sm hover:bg-surface-variant transition-all">Voir détails</button>
                </div>
              </div>
              {/* Patient Row 3 */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-none flex items-center gap-6 hover:bg-surface-container-high transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: '"FILL" 1'}}>person</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-on-surface">Antoine Durand</h3>
                  <p className="text-sm text-secondary font-mono">ID: #DX-90041</p>
                </div>
                <div className="flex-1 px-4">
                  <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-1">Validé le</p>
                  <p className="text-sm font-medium text-on-surface">24/05/2024 à 09:15</p>
                  <p className="text-xs text-secondary uppercase tracking-widest mt-2">Séances : <span className="text-on-surface font-semibold">5</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary font-bold text-[10px] rounded-full uppercase tracking-tighter">RDV OK</span>
                </div>
                <div className="flex gap-2 ml-4">
                  <button className="prescription-kit-trigger primary-gradient text-white px-5 py-2 rounded-md font-bold text-sm shadow-md transition-all active:scale-95">Prescription Kit</button>
                  <button className="bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-md font-bold text-sm hover:bg-surface-variant transition-all">Voir détails</button>
                </div>
              </div>
              {/* Empty State / Anchor for expansion */}
              <div className="col-span-12 py-10 flex flex-col items-center justify-center text-center opacity-40">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-3xl">clinical_notes</span>
                </div>
                <p className="font-medium text-sm">Fin de la liste pour cette unité</p>
              </div>
            </div>
          </div>
        </main>
      </div>{/* Prescription Kit Modal */}
      <div id="prescriptionKitModal" className="fixed inset-0 z-50 hidden items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-[0.2em]">Prescription Kit</p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Choisir une interface</h2>
            </div>
            <button id="closePrescriptionKitModal" className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <a href="/dialyses/fiche-surveillance" target="_blank" className="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/50">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500 mb-3">Fiche séance</p>
              <h3 className="text-lg font-semibold text-slate-900">Fiche de surveillance hémodialyse</h3>
              <p className="mt-3 text-sm text-slate-600">Accéder à la fiche de surveillance de la séance.</p>
            </a>
            <a href="/dialyses/ordonnance" target="_blank" className="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/50">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500 mb-3">Ordonnance</p>
              <h3 className="text-lg font-semibold text-slate-900">Ordonnance kit dialyse</h3>
              <p className="mt-3 text-sm text-slate-600">Voir et imprimer l'ordonnance du kit hémodialyse.</p>
            </a>
            <a href="/dialyses/conformance-kit" target="_blank" className="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/50">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500 mb-3">Numérisation</p>
              <h3 className="text-lg font-semibold text-slate-900">Conformance kit séance</h3>
              <p className="mt-3 text-sm text-slate-600">Ouvrir l'interface de numérisation plein écran.</p>
            </a>
            <a href="/dialyses/materiels" target="_blank" className="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/50">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500 mb-3">Matériel</p>
              <h3 className="text-lg font-semibold text-slate-900">Liste matériel interactif</h3>
              <p className="mt-3 text-sm text-slate-600">Consulter la liste des matériels nécessaires en plein écran.</p>
            </a>
          </div>
        </div>
      </div>
      {/* Contextual FAB (Hidden on this specific view as per rules if deemed too transactional, but kept as a subtle anchor for 'Nouvel Appareil' or similar if needed) */}
    </div>
    
  );
}
