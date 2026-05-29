'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/* ─── Types ─────────────────────────────────────────────────────── */
interface RDV {
  id: number;
  patient: { id: number; nom: string; prenom: string } | null;
  medecin: { id: number; nom: string; prenom: string } | null;
  date_heure: string;
  motif: string;
  statut: string;
  soso_kevitra_malalaka: string;
}

interface RDVFormatted {
  id: number;
  patientId: number;
  patientNom: string;
  patientPrenom: string;
  initiales: string;
  heure: string;
  heureEnd: string;
  dateObj: Date;
  jour: number;
  mois: number;
  annee: number;
  jourSemaine: number;
  motif: string;
  statut: string;
  poste: string;
  type: 'seance' | 'controle' | 'consultation' | 'reunion' | 'autre';
}

type ViewMode = 'jour' | 'semaine' | 'mois' | 'programme';

/* ─── Helpers ───────────────────────────────────────────────────── */
const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const JOURS_COURTS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const HEURES_GRILLE = Array.from({ length: 13 }, (_, i) => i + 7); // 7h → 19h

function getTypeRDV(motif: string): RDVFormatted['type'] {
  const m = motif.toLowerCase();
  if (m.includes('dialyse') || m.includes('hémodialyse') || m.includes('seance') || m.includes('séance')) return 'seance';
  if (m.includes('contrôle') || m.includes('controle') || m.includes('bilan')) return 'controle';
  if (m.includes('consultation')) return 'consultation';
  if (m.includes('réunion') || m.includes('reunion')) return 'reunion';
  return 'autre';
}

const TYPE_STYLES: Record<RDVFormatted['type'], { bg: string; border: string; text: string; label: string }> = {
  seance:       { bg: 'bg-blue-50',   border: 'border-l-blue-500',   text: 'text-blue-800',   label: 'Séance HD'    },
  controle:     { bg: 'bg-emerald-50',border: 'border-l-emerald-500',text: 'text-emerald-800',label: 'Contrôle'     },
  consultation: { bg: 'bg-amber-50',  border: 'border-l-amber-500',  text: 'text-amber-800',  label: 'Consultation' },
  reunion:      { bg: 'bg-purple-50', border: 'border-l-purple-500', text: 'text-purple-800', label: 'Réunion'      },
  autre:        { bg: 'bg-slate-50',  border: 'border-l-slate-400',  text: 'text-slate-700',  label: 'Autre'        },
};

function formatRDV(rdv: RDV): RDVFormatted | null {
  if (!rdv.patient) return null;
  const d = new Date(rdv.date_heure);
  const dEnd = new Date(d.getTime() + 4 * 3600000);
  const jourSemaine = d.getDay() === 0 ? 6 : d.getDay() - 1; // 0=Lun, 6=Dim
  return {
    id: rdv.id,
    patientId: rdv.patient.id,
    patientNom: rdv.patient.nom,
    patientPrenom: rdv.patient.prenom,
    initiales: `${rdv.patient.prenom.charAt(0)}${rdv.patient.nom.charAt(0)}`,
    heure: `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`,
    heureEnd: `${String(dEnd.getHours()).padStart(2,'0')}:${String(dEnd.getMinutes()).padStart(2,'0')}`,
    dateObj: d,
    jour: d.getDate(),
    mois: d.getMonth() + 1,
    annee: d.getFullYear(),
    jourSemaine,
    motif: rdv.motif,
    statut: rdv.statut,
    poste: rdv.soso_kevitra_malalaka?.split('|')[1]?.trim() || '-',
    type: getTypeRDV(rdv.motif),
  };
}

/* ─── Composant carte événement ─────────────────────────────────── */
function EvtCard({ rdv, compact = false }: { rdv: RDVFormatted; compact?: boolean }) {
  const s = TYPE_STYLES[rdv.type];
  return (
    <div className={`${s.bg} border-l-4 ${s.border} rounded-r-lg px-2 py-1.5 overflow-hidden cursor-pointer hover:brightness-95 transition-all`}>
      <p className={`text-[10px] font-bold ${s.text} truncate`}>{rdv.heure} – {rdv.heureEnd}</p>
      <p className={`text-[11px] font-semibold ${s.text} truncate`}>{rdv.patientPrenom} {rdv.patientNom}</p>
      {!compact && <p className={`text-[10px] ${s.text} opacity-70 truncate`}>{s.label} · {rdv.poste}</p>}
    </div>
  );
}

/* ─── Composant principal ───────────────────────────────────────── */
export default function StitchRendezVousCalendrier() {
  const router = useRouter();
  const now = new Date();

  const [rdvs, setRdvs] = useState<RDVFormatted[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('semaine');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterPoste, setFilterPoste] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [mesSeulement, setMesSeulement] = useState(false);

  /* ── Chargement RDV ── */
  const loadRDV = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/rendezvous`);
      if (res.ok) {
        const data: RDV[] = await res.json();
        const formatted = data.map(formatRDV).filter(Boolean) as RDVFormatted[];
        setRdvs(formatted);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRDV();
    const interval = setInterval(loadRDV, 60000);
    return () => clearInterval(interval);
  }, [loadRDV]);

  /* ── Navigation ── */
  const navigate = (delta: number) => {
    const d = new Date(currentDate);
    if (viewMode === 'jour') d.setDate(d.getDate() + delta);
    else if (viewMode === 'semaine') d.setDate(d.getDate() + delta * 7);
    else if (viewMode === 'mois') d.setMonth(d.getMonth() + delta);
    setCurrentDate(d);
  };

  /* ── Calculs semaine ── */
  const getLundiSemaine = (d: Date) => {
    const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
    const lundi = new Date(d);
    lundi.setDate(d.getDate() - day);
    lundi.setHours(0,0,0,0);
    return lundi;
  };

  const lundi = getLundiSemaine(currentDate);
  const joursSemaine = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lundi);
    d.setDate(lundi.getDate() + i);
    return d;
  });

  /* ── Titre header ── */
  const getTitreHeader = () => {
    if (viewMode === 'semaine') {
      const dim = joursSemaine[6];
      if (lundi.getMonth() === dim.getMonth())
        return `${lundi.getDate()} – ${dim.getDate()} ${MOIS[lundi.getMonth()]} ${lundi.getFullYear()}`;
      return `${lundi.getDate()} ${MOIS[lundi.getMonth()]} – ${dim.getDate()} ${MOIS[dim.getMonth()]} ${lundi.getFullYear()}`;
    }
    if (viewMode === 'jour') return `${currentDate.getDate()} ${MOIS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    return `${MOIS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  /* ── Filtres ── */
  const rdvsFiltres = rdvs.filter(r => {
    if (filterPoste && !r.poste.toLowerCase().includes(filterPoste.toLowerCase())) return false;
    if (filterStatut && r.statut !== filterStatut) return false;
    return true;
  });

  /* ── RDV pour grille semaine ── */
  const getRdvJour = (jour: Date) =>
    rdvsFiltres.filter(r =>
      r.jour === jour.getDate() && r.mois === jour.getMonth() + 1 && r.annee === jour.getFullYear()
    );

  /* ── RDV pour vue mois ── */
  const getRdvMois = (jour: number) =>
    rdvsFiltres.filter(r => r.jour === jour && r.mois === currentDate.getMonth() + 1 && r.annee === currentDate.getFullYear());

  /* ── Mini calendrier ── */
  const miniLundi = getLundiSemaine(currentDate);
  const miniJours = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(miniLundi);
    d.setDate(miniLundi.getDate() + i);
    return d;
  });

  const premierJourMois = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const decalage = premierJourMois.getDay() === 0 ? 6 : premierJourMois.getDay() - 1;
  const nbJoursMois = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  /* ── Postes disponibles ── */
  const postesUtilises = new Set(rdvsFiltres.filter(r =>
    r.jour === now.getDate() && r.mois === now.getMonth() + 1 && r.annee === now.getFullYear()
  ).map(r => r.poste));
  const postesDisponibles = Math.max(0, 8 - postesUtilises.size);

  /* ── Hauteur cellule (56px par heure) ── */
  const CELL_H = 56;
  const getTop = (heure: string) => {
    const [h, m] = heure.split(':').map(Number);
    return ((h - 7) + m / 60) * CELL_H;
  };
  const getHeight = (heure: string, heureEnd: string) => {
    const [h1, m1] = heure.split(':').map(Number);
    const [h2, m2] = heureEnd.split(':').map(Number);
    return Math.max(((h2 - h1) + (m2 - m1) / 60) * CELL_H, 28);
  };
  const nowTop = ((now.getHours() - 7) + now.getMinutes() / 60) * CELL_H;
  const isToday = (d: Date) => d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();

  return (
    <div className="flex h-screen overflow-hidden bg-white">

      {/* ══ SIDEBAR MINI ══ */}
      <aside className="w-56 flex-shrink-0 border-r border-slate-200 flex flex-col bg-slate-50 overflow-y-auto">

        {/* Bouton nouveau RDV */}
        <div className="p-4">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/rendez-vous/nouveau')}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#00509e] text-white text-sm font-semibold rounded-xl shadow-md hover:bg-[#003d7a] transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Nouveau RDV
          </motion.button>
        </div>

        {/* Mini calendrier */}
        <div className="px-3 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">{MOIS[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
            <div className="flex gap-1">
              <button onClick={() => navigate(-1)} className="p-0.5 hover:bg-slate-200 rounded text-slate-500 text-xs">‹</button>
              <button onClick={() => navigate(1)}  className="p-0.5 hover:bg-slate-200 rounded text-slate-500 text-xs">›</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {['L','M','M','J','V','S','D'].map((j, i) => (
              <div key={i} className="text-center text-[9px] font-semibold text-slate-400 py-1">{j}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: decalage }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: nbJoursMois }, (_, i) => {
              const jour = i + 1;
              const isT = jour === now.getDate() && currentDate.getMonth() === now.getMonth();
              const isSel = miniJours.some(d => d.getDate() === jour && d.getMonth() === currentDate.getMonth());
              const hasRdv = rdvsFiltres.some(r => r.jour === jour && r.mois === currentDate.getMonth() + 1);
              return (
                <button
                  key={jour}
                  onClick={() => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), jour)); setViewMode('semaine'); }}
                  className={`text-center text-[10px] py-1 rounded-full transition-all relative ${
                    isT ? 'bg-[#00509e] text-white font-bold' :
                    isSel ? 'bg-blue-100 text-blue-700 font-semibold' :
                    'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {jour}
                  {hasRdv && !isT && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtres */}
        <div className="px-3 pb-3 border-t border-slate-200 pt-3 space-y-2">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Filtres</p>
          <select
            value={filterPoste} onChange={e => setFilterPoste(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-400"
          >
            <option value="">Tous les postes</option>
            <option value="M01">Poste M01</option>
            <option value="M02">Poste M02</option>
            <option value="M03">Poste M03</option>
            <option value="Machine 1">Machine 1</option>
            <option value="Machine 2">Machine 2</option>
          </select>
          <select
            value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-400"
          >
            <option value="">Tous les statuts</option>
            <option value="confirmé">Confirmé</option>
            <option value="planifié">Planifié</option>
            <option value="annulé">Annulé</option>
          </select>
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input type="checkbox" checked={mesSeulement} onChange={e => setMesSeulement(e.target.checked)} className="accent-[#00509e]" />
            Mes RDV seulement
          </label>
        </div>

        {/* Légende */}
        <div className="px-3 pb-4 border-t border-slate-200 pt-3 space-y-1.5 mt-auto">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Légende</p>
          {Object.entries(TYPE_STYLES).map(([key, s]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm border-l-2 ${s.border} ${s.bg}`} />
              <span className="text-[10px] text-slate-600">{s.label}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ══ ZONE PRINCIPALE ══ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <header className="flex items-center gap-3 px-5 py-3 border-b border-slate-200 bg-white flex-shrink-0">
          <button
            onClick={() => { setCurrentDate(new Date()); }}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
          >
            Aujourd'hui
          </button>
          <div className="flex gap-1">
            <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button onClick={() => navigate(1)}  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
          <h1 className="text-base font-bold text-slate-800">{getTitreHeader()}</h1>

          {loading && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-2" />}

          <div className="ml-auto flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {(['jour','semaine','mois','programme'] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${
                  viewMode === v ? 'bg-white text-[#00509e] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500">
            <span className="material-symbols-outlined text-lg">settings</span>
          </button>
        </header>

        {/* ── Vue Semaine ── */}
        {viewMode === 'semaine' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* En-têtes jours */}
            <div className="grid grid-cols-[52px_repeat(7,1fr)] border-b border-slate-200 bg-slate-50 flex-shrink-0">
              <div />
              {joursSemaine.map((jour, i) => {
                const today = isToday(jour);
                const nbRdv = getRdvJour(jour).length;
                return (
                  <div key={i} className="text-center py-2 border-l border-slate-200">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">{JOURS_COURTS[i]}</p>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-0.5 text-sm font-bold ${
                      today ? 'bg-[#00509e] text-white' : 'text-slate-700'
                    }`}>
                      {jour.getDate()}
                    </div>
                    {nbRdv > 0 && (
                      <span className="text-[9px] text-blue-600 font-semibold">{nbRdv} RDV</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Grille horaire */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-[52px_repeat(7,1fr)]" style={{ minHeight: `${CELL_H * 13}px` }}>
                {/* Colonne heures */}
                <div>
                  {HEURES_GRILLE.map(h => (
                    <div key={h} className="text-right pr-2 text-[10px] text-slate-400" style={{ height: `${CELL_H}px`, paddingTop: '2px' }}>
                      {h}:00
                    </div>
                  ))}
                </div>

                {/* Colonnes jours */}
                {joursSemaine.map((jour, di) => {
                  const rdvJour = getRdvJour(jour);
                  const today = isToday(jour);
                  return (
                    <div key={di} className="relative border-l border-slate-200">
                      {/* Lignes heures */}
                      {HEURES_GRILLE.map(h => (
                        <div key={h} className="border-b border-slate-100" style={{ height: `${CELL_H}px` }} />
                      ))}

                      {/* Ligne heure actuelle */}
                      {today && nowTop >= 0 && nowTop <= CELL_H * 13 && (
                        <div className="absolute left-0 right-0 z-20 flex items-center" style={{ top: `${nowTop}px` }}>
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5" />
                          <div className="flex-1 h-0.5 bg-red-500" />
                        </div>
                      )}

                      {/* Événements */}
                      {rdvJour.map((rdv, ri) => {
                        const top = getTop(rdv.heure);
                        const height = getHeight(rdv.heure, rdv.heureEnd);
                        const s = TYPE_STYLES[rdv.type];
                        return (
                          <motion.div
                            key={rdv.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ top: `${top}px`, height: `${height}px`, left: '2px', right: '2px', position: 'absolute', zIndex: 10 }}
                            className={`${s.bg} border-l-[3px] ${s.border} rounded-r-lg px-2 py-1 overflow-hidden cursor-pointer hover:brightness-95 transition-all shadow-sm`}
                          >
                            <p className={`text-[10px] font-bold ${s.text}`}>{rdv.heure}</p>
                            <p className={`text-[11px] font-semibold ${s.text} truncate`}>{rdv.patientPrenom} {rdv.patientNom}</p>
                            {height > 40 && <p className={`text-[10px] ${s.text} opacity-70 truncate`}>{s.label} · {rdv.poste}</p>}
                          </motion.div>
                        );
                      })}

                      {/* Slot vide si aucun RDV */}
                      {rdvJour.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-[9px] text-slate-300 rotate-90 whitespace-nowrap">Aucune séance</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Vue Jour ── */}
        {viewMode === 'jour' && (
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-[52px_1fr]" style={{ minHeight: `${CELL_H * 13}px` }}>
              <div>
                {HEURES_GRILLE.map(h => (
                  <div key={h} className="text-right pr-2 text-[10px] text-slate-400" style={{ height: `${CELL_H}px`, paddingTop: '2px' }}>{h}:00</div>
                ))}
              </div>
              <div className="relative border-l border-slate-200">
                {HEURES_GRILLE.map(h => (
                  <div key={h} className="border-b border-slate-100" style={{ height: `${CELL_H}px` }} />
                ))}
                {isToday(currentDate) && (
                  <div className="absolute left-0 right-0 z-20 flex items-center" style={{ top: `${nowTop}px` }}>
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5" />
                    <div className="flex-1 h-0.5 bg-red-500" />
                  </div>
                )}
                {getRdvJour(currentDate).map(rdv => {
                  const top = getTop(rdv.heure);
                  const height = getHeight(rdv.heure, rdv.heureEnd);
                  const s = TYPE_STYLES[rdv.type];
                  return (
                    <motion.div
                      key={rdv.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ top: `${top}px`, height: `${height}px`, left: '4px', right: '4px', position: 'absolute', zIndex: 10 }}
                      className={`${s.bg} border-l-4 ${s.border} rounded-r-xl px-3 py-2 cursor-pointer hover:brightness-95 transition-all shadow-sm`}
                    >
                      <p className={`text-xs font-bold ${s.text}`}>{rdv.heure} – {rdv.heureEnd}</p>
                      <p className={`text-sm font-semibold ${s.text}`}>{rdv.patientPrenom} {rdv.patientNom}</p>
                      <p className={`text-xs ${s.text} opacity-70`}>{s.label} · {rdv.poste}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Vue Mois ── */}
        {viewMode === 'mois' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(j => (
                <div key={j} className="text-center text-xs font-semibold text-slate-400 py-2">{j}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: decalage }).map((_, i) => <div key={`e${i}`} className="h-24 rounded-xl" />)}
              {Array.from({ length: nbJoursMois }, (_, i) => {
                const jour = i + 1;
                const rdvJour = getRdvMois(jour);
                const today = jour === now.getDate() && currentDate.getMonth() === now.getMonth();
                return (
                  <div
                    key={jour}
                    onClick={() => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), jour)); setViewMode('jour'); }}
                    className={`h-24 rounded-xl border p-1.5 cursor-pointer transition-all hover:shadow-md ${
                      today ? 'border-blue-400 bg-blue-50' : 'border-slate-100 bg-white hover:border-blue-200'
                    }`}
                  >
                    <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                      today ? 'bg-[#00509e] text-white' : 'text-slate-600'
                    }`}>{jour}</div>
                    <div className="space-y-0.5 overflow-hidden">
                      {rdvJour.slice(0, 3).map(rdv => (
                        <EvtCard key={rdv.id} rdv={rdv} compact />
                      ))}
                      {rdvJour.length > 3 && (
                        <p className="text-[9px] text-slate-400 pl-1">+{rdvJour.length - 3} autres</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Vue Programme ── */}
        {viewMode === 'programme' && (
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : rdvsFiltres.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <span className="material-symbols-outlined text-5xl mb-3 block">calendar_today</span>
                <p>Aucun rendez-vous trouvé</p>
              </div>
            ) : (
              <div className="space-y-2 max-w-2xl mx-auto">
                {rdvsFiltres
                  .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
                  .map((rdv, i) => {
                    const s = TYPE_STYLES[rdv.type];
                    return (
                      <motion.div
                        key={rdv.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`flex items-center gap-4 p-3 rounded-xl border border-l-4 ${s.border} ${s.bg} hover:brightness-95 transition-all cursor-pointer`}
                      >
                        <div className="text-center w-14 flex-shrink-0">
                          <p className="text-xs font-bold text-slate-600">{rdv.jour}/{rdv.mois}</p>
                          <p className={`text-sm font-black ${s.text}`}>{rdv.heure}</p>
                        </div>
                        <div className={`w-0.5 h-10 rounded-full ${s.border.replace('border-l-','bg-')}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${s.text}`}>{rdv.patientPrenom} {rdv.patientNom}</p>
                          <p className={`text-xs ${s.text} opacity-70`}>{s.label} · {rdv.poste}</p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                          rdv.statut === 'confirmé' ? 'bg-emerald-100 text-emerald-700' :
                          rdv.statut === 'planifié' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>{rdv.statut}</span>
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <footer className="border-t border-slate-200 px-5 py-2.5 flex items-center gap-6 bg-slate-50 flex-shrink-0">
          <div className="flex gap-4">
            {Object.entries(TYPE_STYLES).map(([key, s]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm border-l-2 ${s.border} ${s.bg}`} />
                <span className="text-[10px] text-slate-500">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-4 text-xs text-slate-500">
            <span>Postes disponibles : <strong className="text-slate-700">{postesDisponibles}</strong></span>
            <span>Total RDV : <strong className="text-slate-700">{rdvsFiltres.length}</strong></span>
            <button
              onClick={loadRDV}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Actualiser
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
