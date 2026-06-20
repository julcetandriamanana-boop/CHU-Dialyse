'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Patient {
  id: number;
  nom: string;
  prenom: string;
  age?: number;
  sexe?: string;
}

interface Constantes {
  ta_avant?: string;
  fc_avant?: string;
  o2_avant?: string;
  temp_avant?: string;
}

interface RdvInfo {
  date_heure: string;
  statut_seance: string;
}

interface CarteAction {
  icon: string;
  titre: string;
  desc: string;
  detail: string;
  btn: string;
  href: string;
  color: 'blue' | 'indigo' | 'violet';
}

const COLOR_MAP = {
  blue: {
    card:   'bg-gradient-to-br from-blue-50 to-blue-100/40 border-blue-200/70',
    icon:   'bg-white text-blue-600 shadow-blue-100',
    title:  'text-blue-900',
    desc:   'text-blue-600',
    detail: 'text-blue-500',
    btn:    'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
    badge:  'bg-blue-100 text-blue-700 border-blue-200',
  },
  indigo: {
    card:   'bg-gradient-to-br from-indigo-50 to-indigo-100/40 border-indigo-200/70',
    icon:   'bg-white text-indigo-600 shadow-indigo-100',
    title:  'text-indigo-900',
    desc:   'text-indigo-600',
    detail: 'text-indigo-500',
    btn:    'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200',
    badge:  'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
  violet: {
    card:   'bg-gradient-to-br from-violet-50 to-violet-100/40 border-violet-200/70',
    icon:   'bg-white text-violet-600 shadow-violet-100',
    title:  'text-violet-900',
    desc:   'text-violet-600',
    detail: 'text-violet-500',
    btn:    'bg-violet-600 hover:bg-violet-700 shadow-violet-200',
    badge:  'bg-violet-100 text-violet-700 border-violet-200',
  },
};

/* ── Carte de navigation ─────────────────────────────── */
function CarteNav({ carte, index }: { carte: CarteAction; index: number }) {
  const c = COLOR_MAP[carte.color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`rounded-2xl border p-6 shadow-sm hover:shadow-lg transition-all ${c.card}`}
    >
      {/* Icône + Titre */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${c.icon}`}>
          <span className="material-symbols-outlined text-2xl">{carte.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className={`text-base font-black leading-tight ${c.title}`}>{carte.titre}</h2>
          <p className={`text-xs mt-1 font-medium ${c.desc}`}>{carte.desc}</p>
        </div>
      </div>

      {/* Détail */}
      <p className={`text-[11px] mb-5 leading-relaxed ${c.detail}`}>{carte.detail}</p>

      {/* Bouton */}
      <button
        onClick={() => { window.location.href = carte.href; }}
        className={`w-full py-3 text-white text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md ${c.btn}`}
      >
        <span className="material-symbols-outlined text-base">open_in_new</span>
        {carte.btn}
      </button>
    </motion.div>
  );
}

/* ── Chip constante vitale ───────────────────────────── */
function ChipConstante({
  label, value, unit, color,
}: {
  label: string; value: string; unit: string;
  color: 'slate' | 'rose' | 'blue' | 'amber';
}) {
  const map = {
    slate: 'bg-slate-50 border-slate-200 text-slate-700 [&_p]:text-slate-400',
    rose:  'bg-rose-50  border-rose-200  text-rose-700  [&_p]:text-rose-400',
    blue:  'bg-blue-50  border-blue-200  text-blue-700  [&_p]:text-blue-400',
    amber: 'bg-amber-50 border-amber-200 text-amber-700 [&_p]:text-amber-400',
  };
  return (
    <div className={`rounded-xl px-3 py-2 text-center border min-w-[62px] ${map[color]}`}>
      <p className="text-[9px] font-bold uppercase tracking-wider">{label}</p>
      <p className="text-sm font-black mt-0.5">{value || '—'}</p>
      <p className="text-[8px]">{unit}</p>
    </div>
  );
}

/* ── Composant principal ─────────────────────────────── */
function SectionMedecinInner() {
  const searchParams   = useSearchParams();
  const patientId      = searchParams.get('patientId') || '';
  const rdvId          = searchParams.get('rendezVousId') || '';
  const seanceNum      = searchParams.get('seanceNum') || '1';

  const [patient,    setPatient]    = useState<Patient | null>(null);
  const [constantes, setConstantes] = useState<Constantes | null>(null);
  const [rdv,        setRdv]        = useState<RdvInfo | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [now,        setNow]        = useState(new Date());

  /* Horloge temps réel */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadAll = useCallback(async () => {
    try {
      if (patientId) {
        const r = await fetch(`${API_URL}/patients/${patientId}`);
        if (r.ok) setPatient(await r.json());
      }
      if (rdvId) {
        const [cRes, rRes] = await Promise.all([
          fetch(`${API_URL}/constantes/seance/${rdvId}`),
          fetch(`${API_URL}/rendezvous/${rdvId}`),
        ]);
        if (cRes.ok) setConstantes(await cRes.json());
        if (rRes.ok) setRdv(await rRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [patientId, rdvId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const urlSuffix = `?patientId=${patientId}&rendezVousId=${rdvId}&seanceNum=${seanceNum}`;

  const cartes: CarteAction[] = [
    {
      icon:   'settings_input_component',
      titre:  'Conductivité & Paramètres',
      desc:   'Prescription de la séance',
      detail: 'Réglage dialysat, UF, débits, durée et conductivité. Enregistrement de la prescription médicale.',
      btn:    'Accéder aux paramètres',
      href:   `/dialyses/conductivite-params${urlSuffix}`,
      color:  'indigo',
    },
  ];

  const formatDate = (d: Date) =>
    d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  const formatHeure = (d: Date) =>
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const nomPatient = patient
    ? `${patient.prenom} ${patient.nom}`
    : patientId ? `Patient #${patientId}` : null;

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-5 max-w-6xl mx-auto">

      {/* ── En-tête ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-5 flex items-center justify-between flex-wrap gap-4"
      >
        {/* Titre + horloge */}
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 flex-shrink-0">
            <span className="material-symbols-outlined text-white text-3xl">stethoscope</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 font-manrope">Section Médecin</h1>
            <p className="text-xs text-slate-400 mt-0.5">Espace médical · CHU Andrainjato</p>
            <p className="text-[10px] text-blue-500 font-semibold mt-1 capitalize">
              {formatDate(now)} &nbsp;·&nbsp;
              <span className="font-black tabular-nums">{formatHeure(now)}</span>
            </p>
          </div>
        </div>

        {/* Constantes vitales */}
        <div className="flex items-center gap-3 flex-wrap">
          <ChipConstante label="TA"     value={constantes?.ta_avant   || '—'} unit="mmHg" color="slate" />
          <ChipConstante label="Pouls"  value={constantes?.fc_avant   || '—'} unit="bpm"  color="rose"  />
          <ChipConstante label="SpO₂"   value={constantes?.o2_avant   || '—'} unit="%"    color="blue"  />
          <ChipConstante label="Temp."  value={constantes?.temp_avant || '—'} unit="°C"   color="amber" />
        </div>
      </motion.div>

      {/* ── Bandeau patient ─────────────────────────────────── */}
      <AnimatePresence>
        {(nomPatient || !patientId) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl px-5 py-3 flex items-center gap-3 border ${
              patientId
                ? 'bg-blue-50 border-blue-200'
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <span className={`material-symbols-outlined text-xl ${patientId ? 'text-blue-500' : 'text-amber-500'}`}>
              {patientId ? 'person' : 'warning'}
            </span>
            <div className="flex-1">
              {patientId ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-black text-blue-800">
                    {nomPatient}
                  </span>
                  <span className="text-xs text-blue-600 font-medium">
                    Séance N°{seanceNum}
                  </span>
                  {patient?.age && (
                    <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold border border-blue-200">
                      {patient.age} ans · {patient.sexe || '—'}
                    </span>
                  )}
                  {rdv && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      rdv.statut_seance === 'en_cours'
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {rdv.statut_seance === 'en_cours' ? '🟢 Séance en cours' : rdv.statut_seance}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm font-semibold text-amber-700">
                  Aucun patient sélectionné — revenez depuis le tableau de bord
                </span>
              )}
            </div>
            {loading && patientId && (
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Titre section cartes ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-3"
      >
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3">
          Actions médicales disponibles
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </motion.div>

      {/* ── 3 Cartes d'action ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {cartes.map((c, i) => (
          <CarteNav key={c.titre} carte={c} index={i} />
        ))}
      </div>

      {/* ── Bloc info workflow ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 shadow-lg shadow-blue-200/40"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white text-xl">route</span>
            </div>
            <div>
              <p className="text-white text-sm font-black">Flux recommandé de la séance</p>
              <p className="text-blue-100 text-xs mt-0.5">
                Suivez l'ordre pour une prise en charge optimale
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { step: '1', label: 'Vérif. Kit',      icon: 'vaccines'                 },
              { step: '2', label: 'Conductivité',    icon: 'settings_input_component' },
            ].map((s, i) => (
              <div key={s.step} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white/15 border border-white/25 rounded-xl px-3 py-2">
                  <span className="w-5 h-5 rounded-full bg-white text-blue-700 text-[10px] font-black flex items-center justify-center flex-shrink-0">
                    {s.step}
                  </span>
                  <span className="material-symbols-outlined text-white text-sm">{s.icon}</span>
                  <span className="text-white text-[11px] font-semibold">{s.label}</span>
                </div>
                {i < 1 && (
                  <span className="material-symbols-outlined text-white/40 text-base">arrow_forward</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Bouton retour ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center pb-4"
      >
        <button
          onClick={() => { window.location.href = '/dashboard'; }}
          className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer flex items-center gap-2 shadow-sm text-sm font-semibold"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Retour tableau de bord
        </button>
      </motion.div>

    </div>
  );
}

export default function StitchSectionMedecin() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SectionMedecinInner />
    </Suspense>
  );
}
