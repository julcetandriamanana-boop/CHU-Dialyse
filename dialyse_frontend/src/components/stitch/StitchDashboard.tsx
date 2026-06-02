'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

const API_URL         = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const DUREE_SEANCE_MS = 4 * 60 * 60 * 1000;

type StatutSeance   = 'en_attente' | 'en_cours' | 'terminé' | 'absent';
type TraitementStat = 'actif' | 'suspendu' | 'terminé';
type AlerteType     = 'retard' | 'bientot' | 'normal';
type ModalType      = 'medecin' | 'paramedical' | 'dossier' | null;

interface PatientSeance {
  id: number;
  nom: string;
  prenom: string;
  initiales: string;
  poste: string;
  debut: string;
  debutTimestamp: number;
  heureDebutReelle: number | null;
  progression: number;
  statut: StatutSeance;
  traitementStatut: TraitementStat;
  alerte: AlerteType;
  patientId: number;
  seanceNum: number;
}

// Motifs de clôture
const MOTIFS = [
  { value: 'amelioration_clinique', label: 'Amélioration clinique',          icon: 'health_and_safety' },
  { value: 'fin_protocole',         label: 'Fin de protocole',               icon: 'task_alt'          },
  { value: 'transfert_centre',      label: 'Transfert vers un autre centre', icon: 'transfer_within_a_station' },
  { value: 'decision_medicale',     label: 'Décision médicale',              icon: 'stethoscope'       },
  { value: 'greffe_renale',         label: 'Greffe rénale',                  icon: 'favorite'          },
  { value: 'autre',                 label: 'Autre',                          icon: 'more_horiz'        },
];

const AVATAR_COLORS = [
  { bg: 'bg-blue-100',    text: 'text-blue-700'    },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-amber-100',   text: 'text-amber-700'   },
  { bg: 'bg-purple-100',  text: 'text-purple-700'  },
  { bg: 'bg-rose-100',    text: 'text-rose-700'    },
  { bg: 'bg-cyan-100',    text: 'text-cyan-700'    },
];

function calculerProgression(statut: StatutSeance, heureDebutReelle: number | null): number {
  if (statut === 'terminé')    return 100;
  if (statut === 'absent')     return 0;
  if (statut === 'en_attente') return 0;
  if (statut === 'en_cours') {
    if (!heureDebutReelle) return 5;
    const pct = Math.round(((Date.now() - heureDebutReelle) / DUREE_SEANCE_MS) * 100);
    return Math.min(95, Math.max(5, pct));
  }
  return 0;
}

function calculerAlerte(debutTimestamp: number, statut: StatutSeance): AlerteType {
  if (statut === 'terminé' || statut === 'absent') return 'normal';
  const diff    = debutTimestamp - Date.now();
  const diffMin = diff / 60000;
  if (statut === 'en_attente' && diff < 0) return 'retard';
  if (diffMin >= 0 && diffMin <= 30)        return 'bientot';
  return 'normal';
}

function StatutBadge({ statut }: { statut: StatutSeance }) {
  const map = {
    terminé:    { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Terminé'    },
    en_cours:   { bg: 'bg-blue-50',    text: 'text-blue-700',    label: 'En cours'   },
    en_attente: { bg: 'bg-slate-100',  text: 'text-slate-500',   label: 'En attente' },
    absent:     { bg: 'bg-red-50',     text: 'text-red-600',     label: 'Absent'     },
  };
  const s = map[statut] || map.en_attente;
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${s.bg} ${s.text}`}>{s.label}</span>;
}

function ProgressBar({ value, statut }: { value: number; statut: StatutSeance }) {
  const color = statut === 'terminé' ? 'bg-emerald-500' : statut === 'en_cours' ? 'bg-blue-500' : statut === 'absent' ? 'bg-red-300' : 'bg-slate-300';
  return (
    <div className="w-24">
      <div className="text-[9px] mb-1 text-slate-400 font-medium">{value}%</div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div animate={{ width: `${value}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} className={`h-full rounded-full ${color}`} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MODAL CONFIRMATION APRÈS "FAIT ✓"
══════════════════════════════════════════════ */
function ModalConfirmationFin({
  patient,
  onPrendreRdv,
  onCloturer,
  onSuspendre,
  onFermer,
}: {
  patient: PatientSeance;
  onPrendreRdv:  () => void;
  onCloturer:    (motif: string, notes: string) => void;
  onSuspendre:   (motif: string, notes: string) => void;
  onFermer:      () => void;
}) {
  const [etape, setEtape]         = useState<'choix' | 'cloturer' | 'suspendre'>('choix');
  const [motif, setMotif]         = useState('');
  const [notes, setNotes]         = useState('');
  const [loading, setLoading]     = useState(false);

  const handleConfirmerCloture = async () => {
    if (!motif) return;
    setLoading(true);
    await onCloturer(motif, notes);
    setLoading(false);
  };

  const handleConfirmerSuspension = async () => {
    if (!motif) return;
    setLoading(true);
    await onSuspendre(motif, notes);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onFermer}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        onClick={e => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-white text-2xl">check_circle</span>
          </div>
          <div>
            <h2 className="text-base font-black text-slate-800">Séance terminée ✓</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {patient.prenom} {patient.nom} · Séance N°{patient.seanceNum} · {patient.poste}
            </p>
          </div>
          <button onClick={onFermer} className="ml-auto p-1.5 hover:bg-white/50 rounded-xl cursor-pointer">
            <span className="material-symbols-outlined text-slate-400 text-lg">close</span>
          </button>
        </div>

        {/* ── ÉTAPE 1 : Choix ── */}
        {etape === 'choix' && (
          <div className="p-6 space-y-3">
            <p className="text-sm font-semibold text-slate-700 mb-4">
              Que souhaitez-vous faire ensuite pour ce patient ?
            </p>

            {/* Option 1 — Prendre RDV */}
            <button
              onClick={onPrendreRdv}
              className="w-full flex items-center gap-4 p-4 bg-violet-50 border border-violet-200 rounded-2xl hover:bg-violet-100 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-white text-lg">event_available</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-violet-800">Prendre RDV suivant</p>
                <p className="text-xs text-violet-600 mt-0.5">Le patient continue son protocole de dialyse</p>
              </div>
              <span className="material-symbols-outlined text-violet-400 text-lg ml-auto">chevron_right</span>
            </button>

            {/* Option 2 — Clôturer */}
            <button
              onClick={() => setEtape('cloturer')}
              className="w-full flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-600 group-hover:bg-red-600 flex items-center justify-center flex-shrink-0 shadow-sm transition-colors group-hover:scale-105">
                <span className="material-symbols-outlined text-white text-lg">flag</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-700 group-hover:text-red-700 transition-colors">Clôturer le traitement</p>
                <p className="text-xs text-slate-500 group-hover:text-red-500 transition-colors mt-0.5">Le patient ne nécessite plus de dialyse</p>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-lg ml-auto">chevron_right</span>
            </button>

            {/* Option 3 — Suspendre */}
            <button
              onClick={() => setEtape('suspendre')}
              className="w-full flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl hover:bg-amber-100 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-white text-lg">pause_circle</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-amber-800">Suspendre le traitement</p>
                <p className="text-xs text-amber-600 mt-0.5">Pause temporaire — reprise possible</p>
              </div>
              <span className="material-symbols-outlined text-amber-400 text-lg ml-auto">chevron_right</span>
            </button>
          </div>
        )}

        {/* ── ÉTAPE 2 : Formulaire Clôture ── */}
        {etape === 'cloturer' && (
          <div className="p-6 space-y-4">
            <button onClick={() => setEtape('choix')} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer mb-2">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Retour
            </button>

            <div>
              <p className="text-sm font-bold text-slate-800 mb-1">
                🏁 Clôturer le traitement de {patient.prenom} {patient.nom}
              </p>
              <p className="text-xs text-slate-500">
                Cette action marque la fin définitive de la prise en charge dialyse.
              </p>
            </div>

            {/* Motif */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Motif de clôture <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MOTIFS.map(m => (
                  <button key={m.value} onClick={() => setMotif(m.value)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      motif === m.value
                        ? 'bg-red-50 border-red-400 text-red-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}>
                    <span className={`material-symbols-outlined text-base ${motif === m.value ? 'text-red-600' : 'text-slate-400'}`}>
                      {m.icon}
                    </span>
                    <span className="text-xs font-semibold leading-tight">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Notes / Observations (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Ex : Amélioration significative de la fonction rénale depuis 3 mois..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-red-400 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setEtape('choix')}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                Annuler
              </button>
              <button
                onClick={handleConfirmerCloture}
                disabled={!motif || loading}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><span className="material-symbols-outlined text-sm">flag</span>Confirmer la clôture</>
                }
              </button>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 3 : Formulaire Suspension ── */}
        {etape === 'suspendre' && (
          <div className="p-6 space-y-4">
            <button onClick={() => setEtape('choix')} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer mb-2">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Retour
            </button>

            <div>
              <p className="text-sm font-bold text-slate-800 mb-1">
                ⏸ Suspendre le traitement de {patient.prenom} {patient.nom}
              </p>
              <p className="text-xs text-slate-500">
                Le traitement sera mis en pause. Il pourra être réactivé ultérieurement.
              </p>
            </div>

            {/* Motif */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Motif de suspension <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MOTIFS.map(m => (
                  <button key={m.value} onClick={() => setMotif(m.value)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      motif === m.value
                        ? 'bg-amber-50 border-amber-400 text-amber-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}>
                    <span className={`material-symbols-outlined text-base ${motif === m.value ? 'text-amber-600' : 'text-slate-400'}`}>
                      {m.icon}
                    </span>
                    <span className="text-xs font-semibold leading-tight">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Notes / Observations (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Ex : Suspension temporaire suite à une hospitalisation..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-amber-400 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setEtape('choix')}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                Annuler
              </button>
              <button
                onClick={handleConfirmerSuspension}
                disabled={!motif || loading}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-amber-500 rounded-xl hover:bg-amber-600 disabled:opacity-50 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><span className="material-symbols-outlined text-sm">pause_circle</span>Confirmer la suspension</>
                }
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   MODAL MÉDECIN / PARAMÉDICAL / DOSSIER
══════════════════════════════════════════════ */
function SectionModal({ open, type, patient, onClose }: {
  open: boolean; type: ModalType; patient: PatientSeance | null; onClose: () => void;
}) {
  if (!open || !patient || !type) return null;

  const config = {
    medecin:     { label: 'Section Médecin',    icon: 'stethoscope',      from: 'from-blue-50',    to: 'to-blue-100',    iconBg: 'bg-blue-600'    },
    paramedical: { label: 'Section Paramédical', icon: 'medical_services', from: 'from-emerald-50', to: 'to-emerald-100', iconBg: 'bg-emerald-600' },
    dossier:     { label: 'Dossier Patient',     icon: 'folder_open',      from: 'from-purple-50',  to: 'to-purple-100',  iconBg: 'bg-purple-600'  },
  }[type];

  const medecinCards = [
    { icon: 'vaccines',                 title: 'Vérification Kit',          desc: 'Ordonnance kit hémodialyse', btn: 'Ouvrir',   href: `/dialyses/verification-kit?patientId=${patient.patientId}&seanceNum=${patient.seanceNum}`,   color: 'blue' },
    { icon: 'settings_input_component', title: 'Conductivité & Paramètres', desc: 'Paramètres dialysat et UF',  btn: 'Accéder', href: `/dialyses/conductivite-params?patientId=${patient.patientId}&seanceNum=${patient.seanceNum}`, color: 'blue' },
  ];
  const paraCards = [
    { icon: 'monitor_heart', title: 'Constantes',   desc: 'Relevé des constantes vitales', btn: 'Saisir', href: '/dialyses/fiche-surveillance', color: 'emerald' },
    { icon: 'visibility',    title: 'Surveillance', desc: 'Fiche de surveillance dialyse', btn: 'Ouvrir', href: '/dialyses/fiche-surveillance', color: 'emerald' },
    { icon: 'healing',       title: 'Soins',        desc: 'Soins infirmiers',              btn: 'Noter',  href: '#',                            color: 'emerald' },
  ];
  const dossierMeta = [
    { l: 'Patient',     v: `${patient.prenom} ${patient.nom}` },
    { l: 'Poste',       v: patient.poste },
    { l: 'Début',       v: patient.debut },
    { l: 'Progression', v: `${patient.progression}%` },
    { l: 'Statut',      v: patient.statut },
    { l: 'Traitement',  v: patient.traitementStatut },
    { l: 'Séance',      v: `N°${patient.seanceNum}` },
    { l: 'ID',          v: `#${patient.patientId}` },
  ];
  const dossierCards = [
    { icon: 'history',     title: 'Historique', desc: 'Historique des séances', btn: 'Voir',      href: '#', color: 'purple' },
    { icon: 'biotech',     title: 'Examens',    desc: 'Résultats biologiques',  btn: 'Consulter', href: '#', color: 'purple' },
    { icon: 'description', title: 'Documents',  desc: 'Ordonnances, CR',        btn: 'Accéder',   href: '#', color: 'purple' },
  ];

  const renderCards = (cards: typeof medecinCards, accent: string) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {cards.map(c => (
        <div key={c.title} className={`p-4 bg-${accent}-50 rounded-xl border border-${accent}-100 hover:shadow-md transition-all`}>
          <span className={`material-symbols-outlined text-${accent}-600 text-2xl mb-2`}>{c.icon}</span>
          <p className={`text-sm font-bold text-${accent}-800 mb-1`}>{c.title}</p>
          <p className={`text-xs text-${accent}-500 mb-3`}>{c.desc}</p>
          <button onClick={() => { if (c.href !== '#') window.location.href = c.href; }}
            className={`w-full py-1.5 bg-${accent}-600 text-white text-xs font-bold rounded-lg hover:bg-${accent}-700 cursor-pointer transition-colors`}>
            {c.btn}
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={e => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[82vh] overflow-y-auto"
          >
            <div className={`p-5 rounded-t-2xl flex items-center justify-between bg-gradient-to-r ${config.from} ${config.to}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center shadow-sm`}>
                  <span className="material-symbols-outlined text-white text-xl">{config.icon}</span>
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800">{config.label}</h2>
                  <p className="text-xs text-slate-500">{patient.prenom} {patient.nom} · Séance {patient.seanceNum} · {patient.poste}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-white/50 rounded-xl cursor-pointer">
                <span className="material-symbols-outlined text-slate-500 text-lg">close</span>
              </button>
            </div>
            <div className="p-5">
              {type === 'medecin'     && renderCards(medecinCards, 'blue')}
              {type === 'paramedical' && renderCards(paraCards,    'emerald')}
              {type === 'dossier'     && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    {dossierMeta.map(m => (
                      <div key={m.l} className="bg-purple-50 rounded-xl p-2.5 border border-purple-100">
                        <p className="text-[9px] text-purple-400 uppercase tracking-wide">{m.l}</p>
                        <p className="text-xs font-bold text-purple-800 mt-0.5">{m.v}</p>
                      </div>
                    ))}
                  </div>
                  {renderCards(dossierCards, 'purple')}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════ */
export default function StitchDashboard() {
  const router = useRouter();

  const [patients, setPatients]                       = useState<PatientSeance[]>([]);
  const [loading, setLoading]                         = useState(true);
  const [actionLoading, setActionLoading]             = useState<number | null>(null);
  const [modalOpen, setModalOpen]                     = useState<ModalType>(null);
  const [patientSelectionne, setPatientSelectionne]   = useState<PatientSeance | null>(null);
  const [confirmFin, setConfirmFin]                   = useState<PatientSeance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Chargement ──────────────────────────────
  const loadPatients = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/rendezvous/aujourdhui`);
      if (!res.ok) { setPatients([]); return; }

      const rdvs: any[] = await res.json();
      const rdvValides   = rdvs.filter(r => !!r.patient);

      const patientSeances = JSON.parse(localStorage.getItem('chu_seances_patient') || '{}');

      const list: PatientSeance[] = rdvValides.map((rdv, i) => {
        const infos           = rdv.soso_kevitra_malalaka || '';
        const machine         = infos.includes('|') ? infos.split('|')[1]?.trim() || 'N/A' : infos || 'N/A';
        const dateRdv         = new Date(rdv.date_heure);
        const heure           = `${String(dateRdv.getHours()).padStart(2,'0')}:${String(dateRdv.getMinutes()).padStart(2,'0')}`;
        const timestamp       = dateRdv.getTime();
        const statut: StatutSeance       = (rdv.statut_seance as StatutSeance) || 'en_attente';
        const traitementStatut: TraitementStat = (rdv.patient?.traitement_statut as TraitementStat) || 'actif';
        const heureDebutReelle = rdv.heure_debut_reelle ? new Date(rdv.heure_debut_reelle).getTime() : null;
        const progression     = calculerProgression(statut, heureDebutReelle);
        const alerte          = calculerAlerte(timestamp, statut);

        return {
          id: rdv.id, nom: rdv.patient.nom, prenom: rdv.patient.prenom,
          initiales: `${rdv.patient.prenom.charAt(0)}${rdv.patient.nom.charAt(0)}`,
          poste: machine, debut: heure, debutTimestamp: timestamp,
          heureDebutReelle, progression, statut, traitementStatut, alerte,
          patientId: rdv.patient.id,
          seanceNum: patientSeances[String(rdv.patient.id)]?.seanceNum || 1,
        };
      });

      list.sort((a, b) => a.debutTimestamp - b.debutTimestamp);
      setPatients(list);
    } catch (err) {
      console.error(err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
    intervalRef.current = setInterval(loadPatients, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [loadPatients]);

  useEffect(() => {
    let es: EventSource | null = null;
    const connect = () => {
      try {
        es = new EventSource(`${API_URL}/notifications/stream`);
        es.addEventListener('notification', () => loadPatients());
        es.onerror = () => { es?.close(); setTimeout(connect, 5000); };
      } catch {}
    };
    connect();
    return () => es?.close();
  }, [loadPatients]);

  // ── Actions ─────────────────────────────────
  const handleDemarrer = useCallback(async (p: PatientSeance) => {
    setActionLoading(p.id);
    try {
      await fetch(`${API_URL}/rendezvous/${p.id}/demarrer`, { method: 'POST' });
      await loadPatients();
      // ✅ Reste sur le dashboard — pas de redirection
    } finally { setActionLoading(null); }
  }, [loadPatients]);

  // Terminer → ouvre modal de confirmation
  const handleTerminer = useCallback(async (p: PatientSeance) => {
    setActionLoading(p.id);
    try {
      await fetch(`${API_URL}/rendezvous/${p.id}/terminer`, { method: 'POST' });
      await loadPatients();
      setConfirmFin(p);
    } finally { setActionLoading(null); }
  }, [loadPatients]);

  const handleAbsent = useCallback(async (p: PatientSeance) => {
    setActionLoading(p.id);
    try {
      await fetch(`${API_URL}/rendezvous/${p.id}/absent`, { method: 'POST' });
      await loadPatients();
    } finally { setActionLoading(null); }
  }, [loadPatients]);

  // Prendre RDV — redirige avec patientId
  const handlePrendreRdv = useCallback((p: PatientSeance) => {
    setConfirmFin(null);
    router.push(`/rendez-vous?patientId=${p.patientId}`);
  }, [router]);

  // Clôturer traitement
  const handleCloturer = useCallback(async (motif: string, notes: string) => {
    if (!confirmFin) return;
    await fetch(`${API_URL}/patients/${confirmFin.patientId}/cloturer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motif, notes }),
    });
    await loadPatients();
    setConfirmFin(null);
  }, [confirmFin, loadPatients]);

  // Suspendre traitement
  const handleSuspendre = useCallback(async (motif: string, notes: string) => {
    if (!confirmFin) return;
    await fetch(`${API_URL}/patients/${confirmFin.patientId}/suspendre`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motif, notes }),
    });
    await loadPatients();
    setConfirmFin(null);
  }, [confirmFin, loadPatients]);

  const openModal = useCallback((type: ModalType, p: PatientSeance) => {
    setPatientSelectionne(p);
    setModalOpen(type);
  }, []);

  // ── KPI ─────────────────────────────────────
  const total    = patients.length;
  const fait     = patients.filter(p => p.statut === 'terminé').length;
  const enCours  = patients.filter(p => p.statut === 'en_cours').length;
  const absent   = patients.filter(p => p.statut === 'absent').length;
  const enRetard = patients.filter(p => p.alerte === 'retard').length;
  const pct      = total > 0 ? Math.round((fait / total) * 100) : 0;

  const kpiCards = [
    { label: 'Total du jour',       value: total,           sub: `${fait}/${total} terminée(s)`,    iconName: 'groups',        iconBg: 'bg-blue-100',    iconColor: 'text-blue-600',    barColor: 'bg-blue-500',    barPct: 100,                                                                    valueColor: 'text-slate-800' },
    { label: 'En cours',            value: enCours,         sub: `${total-fait-absent} actifs`,     iconName: 'hourglass_top', iconBg: 'bg-amber-100',   iconColor: 'text-amber-600',   barColor: 'bg-amber-400',   barPct: total>0?Math.round((enCours/total)*100):0,                              valueColor: 'text-amber-600' },
    { label: 'Terminées',           value: fait,            sub: `${pct}% du programme`,            iconName: 'check_circle',  iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', barColor: 'bg-emerald-500', barPct: pct,                                                                    valueColor: 'text-emerald-600' },
    { label: 'Retard / Absents',    value: enRetard+absent, sub: `${enRetard} retard · ${absent} absent`, iconName: 'warning', iconBg: 'bg-red-100',   iconColor: 'text-red-600',     barColor: 'bg-red-500',     barPct: total>0?Math.round(((enRetard+absent)/total)*100):0, valueColor: (enRetard+absent)>0?'text-red-600':'text-slate-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">

        {/* Titre */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black font-manrope text-slate-800">Tableau de Bord</h1>
            <p className="text-sm text-slate-400 mt-0.5">Service de dialyse · Temps réel</p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            En direct
          </span>
        </motion.div>

        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((k, i) => (
            <motion.div key={k.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{k.label}</span>
                <div className={`w-8 h-8 rounded-xl ${k.iconBg} flex items-center justify-center`}>
                  <span className={`material-symbols-outlined text-lg ${k.iconColor}`}>{k.iconName}</span>
                </div>
              </div>
              <p className={`text-3xl font-black ${k.valueColor}`}>{k.value}</p>
              <p className="text-[10px] text-slate-400 mt-1">{k.sub}</p>
              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${k.barPct}%` }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${k.barColor}`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tableau */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold font-manrope text-slate-800">Dialyses du jour</h2>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
              {total} patient{total > 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-3 block text-slate-300">event_busy</span>
              <p className="text-sm font-medium">Aucune séance de dialyse programmée aujourd&apos;hui.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {['Patient','Poste','Début','Progression','Action','Statut','Médecin','Paramédical','Dossier'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {patients.map((p, index) => {
                    const ac        = AVATAR_COLORS[index % AVATAR_COLORS.length];
                    const isLoading = actionLoading === p.id;

                    // Fond de ligne selon alerte et statut
                    const rowBg =
                      p.statut === 'absent'  ? 'bg-slate-50/50 opacity-70' :
                      p.statut === 'terminé' && p.traitementStatut === 'terminé' ? 'bg-slate-50/30' :
                      p.alerte === 'retard'  ? 'bg-red-50/50'   :
                      p.alerte === 'bientot' ? 'bg-amber-50/40' :
                      '';

                    return (
                      <motion.tr key={p.id}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className={`group transition-colors hover:bg-slate-50/80 ${rowBg}`}
                      >
                        {/* Patient */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-xl ${ac.bg} ${ac.text} flex items-center justify-center font-bold text-xs flex-shrink-0 ${p.statut === 'absent' ? 'opacity-50' : ''}`}>
                              {p.initiales}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs font-bold text-slate-800">{p.prenom} {p.nom}</p>
                                {p.alerte === 'retard' && p.statut === 'en_attente' && (
                                  <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black bg-red-100 text-red-600 border border-red-200">EN RETARD</span>
                                )}
                                {p.alerte === 'bientot' && (
                                  <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black bg-amber-100 text-amber-600 border border-amber-200">BIENTÔT</span>
                                )}
                                {p.statut === 'absent' && (
                                  <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black bg-slate-100 text-slate-500 border border-slate-200">ABSENT</span>
                                )}
                                {p.traitementStatut === 'terminé' && (
                                  <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black bg-slate-100 text-slate-500 border border-slate-200">🏁 FIN TRAITEMENT</span>
                                )}
                                {p.traitementStatut === 'suspendu' && (
                                  <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black bg-amber-100 text-amber-600 border border-amber-200">⏸ SUSPENDU</span>
                                )}
                              </div>
                              <p className="text-[9px] text-slate-400">Séance {p.seanceNum}</p>
                            </div>
                          </div>
                        </td>

                        {/* Poste */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{p.poste}</span>
                        </td>

                        {/* Début */}
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium ${p.alerte === 'retard' && p.statut === 'en_attente' ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                            {p.debut}
                          </span>
                        </td>

                        {/* Progression */}
                        <td className="px-4 py-3">
                          <ProgressBar value={p.progression} statut={p.statut} />
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3">
                          {isLoading ? (
                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          ) : p.statut === 'en_attente' ? (
                            <div className="flex flex-col gap-1">
                              <button onClick={() => handleDemarrer(p)}
                                className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                                Démarrer
                              </button>
                              {p.alerte === 'retard' && (
                                <button onClick={() => handleAbsent(p)}
                                  className="px-3 py-1.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-slate-300 transition-colors cursor-pointer whitespace-nowrap">
                                  Absent
                                </button>
                              )}
                            </div>
                          ) : p.statut === 'en_cours' ? (
                            <button onClick={() => handleTerminer(p)}
                              className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer">
                              Fait ✓
                            </button>
                          ) : p.statut === 'terminé' ? (
                            p.traitementStatut === 'actif' ? (
                              // ✅ Traitement actif → Prendre RDV
                              <div className="flex flex-col gap-1">
                                <button onClick={() => handlePrendreRdv(p)}
                                  className="px-3 py-1.5 bg-violet-600 text-white text-[10px] font-bold rounded-lg hover:bg-violet-700 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[11px]">event_available</span>
                                  Prendre RDV
                                </button>
                                <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[10px]">check_circle</span>Terminé
                                </span>
                              </div>
                            ) : p.traitementStatut === 'terminé' ? (
                              // ✅ Traitement terminé → badge fin de traitement
                              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">flag</span>
                                Fin traitement
                              </span>
                            ) : (
                              // Suspendu
                              <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">pause_circle</span>
                                Suspendu
                              </span>
                            )
                          ) : (
                            <span className="text-[10px] text-slate-400">—</span>
                          )}
                        </td>

                        {/* Statut */}
                        <td className="px-4 py-3"><StatutBadge statut={p.statut} /></td>

                        {/* Médecin */}
                        <td className="px-4 py-3">
                          <button onClick={() => openModal('medecin', p)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer whitespace-nowrap">
                            <span className="material-symbols-outlined text-[14px]">stethoscope</span>Médecin
                          </button>
                        </td>

                        {/* Paramédical */}
                        <td className="px-4 py-3">
                          <button onClick={() => openModal('paramedical', p)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-lg hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer whitespace-nowrap">
                            <span className="material-symbols-outlined text-[14px]">medical_services</span>Paramédical
                          </button>
                        </td>

                        {/* Dossier */}
                        <td className="px-4 py-3">
                          <button onClick={() => openModal('dossier', p)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 text-purple-700 text-[10px] font-semibold rounded-lg hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer whitespace-nowrap">
                            <span className="material-symbols-outlined text-[14px]">folder_open</span>Dossier
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal section médecin/para/dossier */}
      <SectionModal
        open={modalOpen !== null}
        type={modalOpen}
        patient={patientSelectionne}
        onClose={() => { setModalOpen(null); setPatientSelectionne(null); }}
      />

      {/* ✅ Modal confirmation fin de séance */}
      <AnimatePresence>
        {confirmFin && (
          <ModalConfirmationFin
            patient={confirmFin}
            onPrendreRdv={() => handlePrendreRdv(confirmFin)}
            onCloturer={handleCloturer}
            onSuspendre={handleSuspendre}
            onFermer={() => setConfirmFin(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
