'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

interface PopupState {
  visible: boolean;
  date: Date | null;
  heureDebut: string;
  heureFin: string;
  x: number;
  y: number;
}

type ViewMode = 'jour' | 'semaine' | 'mois' | 'programme';

const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const JOURS_COURTS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const HEURES_GRILLE = Array.from({ length: 13 }, (_, i) => i + 7);
const MACHINES = ['Machine 1', 'Machine 2', 'Machine 3'];
const CELL_H = 56;

function getTypeRDV(motif: string): RDVFormatted['type'] {
  const m = motif.toLowerCase();
  if (m.includes('dialyse') || m.includes('hémodialyse') || m.includes('seance') || m.includes('séance')) return 'seance';
  if (m.includes('contrôle') || m.includes('controle') || m.includes('bilan')) return 'controle';
  if (m.includes('consultation')) return 'consultation';
  if (m.includes('réunion') || m.includes('reunion')) return 'reunion';
  return 'autre';
}

const TYPE_STYLES: Record<RDVFormatted['type'], { bg: string; border: string; text: string; label: string }> = {
  seance:       { bg: 'bg-blue-50',    border: 'border-l-blue-500',    text: 'text-blue-800',    label: 'Séance HD'    },
  controle:     { bg: 'bg-emerald-50', border: 'border-l-emerald-500', text: 'text-emerald-800', label: 'Contrôle'     },
  consultation: { bg: 'bg-amber-50',   border: 'border-l-amber-500',   text: 'text-amber-800',   label: 'Consultation' },
  reunion:      { bg: 'bg-purple-50',  border: 'border-l-purple-500',  text: 'text-purple-800',  label: 'Réunion'      },
  autre:        { bg: 'bg-slate-50',   border: 'border-l-slate-400',   text: 'text-slate-700',   label: 'Autre'        },
};

function formatRDV(rdv: RDV): RDVFormatted | null {
  if (!rdv.patient) return null;
  const d = new Date(rdv.date_heure);
  const dEnd = new Date(d.getTime() + 4 * 3600000);
  const jourSemaine = d.getDay() === 0 ? 6 : d.getDay() - 1;
  return {
    id: rdv.id,
    patientId: rdv.patient.id,
    patientNom: rdv.patient.nom,
    patientPrenom: rdv.patient.prenom,
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

interface PatientSuggestion { id: number; nom: string; prenom: string; }

function NewRDVForm({ popup, onClose, onCreated, preselectedPatientId }: {
  popup: PopupState;
  onClose: () => void;
  onCreated: () => void;
  preselectedPatientId?: number | null;
}) {
  const [heureDebut, setHeureDebut]           = useState(popup.heureDebut);
  const [heureFin, setHeureFin]               = useState(popup.heureFin);
  const [motif, setMotif]                     = useState('Séance hémodialyse');
  const [machine, setMachine]                 = useState('Machine 1');
  const [saving, setSaving]                   = useState(false);
  const [error, setError]                     = useState('');
  const [success, setSuccess]                 = useState(false);
  const [search, setSearch]                   = useState('');
  const [suggestions, setSuggestions]         = useState<PatientSuggestion[]>([]);
  const [showSugg, setShowSugg]               = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientSuggestion | null>(null);
  const [numSeance, setNumSeance]             = useState<number | null>(null);
  const [loadingSeance, setLoadingSeance]     = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Pre-selectionner le patient si patientId passe en URL
  useEffect(() => {
    if (!preselectedPatientId) return;
    const loadPreselected = async () => {
      try {
        const res = await fetch(`${API_URL}/patients/${preselectedPatientId}`);
        if (res.ok) {
          const data = await res.json();
          const p: PatientSuggestion = {
            id: data.id,
            nom: data.nom,
            prenom: data.prenom,
          };
          setSearch(`${p.prenom} ${p.nom}`);
          selectPatient(p);
        }
      } catch {}
    };
    loadPreselected();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedPatientId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const searchPatient = async (val: string) => {
    setSearch(val);
    setSelectedPatient(null);
    setNumSeance(null);
    if (val.length < 2) { setSuggestions([]); setShowSugg(false); return; }
    try {
      const res = await fetch(`${API_URL}/patients?search=${encodeURIComponent(val)}`);
      if (res.ok) {
        const data = await res.json();
        const list: PatientSuggestion[] = (data.data || data || []).slice(0, 6).map((p: any) => ({
          id: p.id, nom: p.nom, prenom: p.prenom,
        }));
        setSuggestions(list);
        setShowSugg(list.length > 0);
      }
    } catch { setSuggestions([]); }
  };

  const selectPatient = async (p: PatientSuggestion) => {
    setSelectedPatient(p);
    setSearch(`${p.prenom} ${p.nom}`);
    setSuggestions([]);
    setShowSugg(false);
    setLoadingSeance(true);
    try {
      const res = await fetch(`${API_URL}/seances?patientId=${p.id}`);
      if (res.ok) {
        const data = await res.json();
        const count = Array.isArray(data) ? data.length : (data.data?.length ?? 0);
        setNumSeance(count + 1);
      } else {
        setNumSeance(1);
      }
    } catch { setNumSeance(1); }
    setLoadingSeance(false);
  };

  if (!popup.date) return null;

  const dateStr = popup.date.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  // ✅ CORRIGÉ : utilise /rendezvous/creer avec les bons champs
  const handleSubmit = async () => {
    if (!selectedPatient) { setError('Sélectionnez un patient'); return; }
    if (heureDebut >= heureFin) { setError("L'heure de fin doit être après le début"); return; }
    setSaving(true);
    setError('');
    try {
      const [h, m] = heureDebut.split(':').map(Number);
      const dateHeure = new Date(popup.date!);
      dateHeure.setHours(h, m, 0, 0);

      const body = {
        patientId:             selectedPatient.id,
        date_heure:            dateHeure.toISOString(),
        motif,
        statut:                'planifié',
        numero_seance:         numSeance ?? 1,
        machine,
        soso_kevitra_malalaka: `Séance #${numSeance ?? 1} | ${machine}`,
      };

      console.log('📤 Création RDV :', body);

      // ✅ Route correcte : /rendezvous/creer
      const res = await fetch(`${API_URL}/rendezvous/creer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const created = await res.json();
        console.log('✅ RDV créé :', created);
        setSuccess(true);
        setTimeout(() => { onCreated(); onClose(); }, 1200);
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('❌ Erreur backend :', errData);
        setError(errData?.message || `Erreur ${res.status}`);
      }
    } catch (e) {
      console.error('❌ Erreur réseau :', e);
      setError('Erreur réseau — vérifiez que le backend tourne sur le port 3001');
    }
    setSaving(false);
  };

  const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
  const winW = typeof window !== 'undefined' ? window.innerWidth  : 1200;
  const top  = Math.min(popup.y, winH - 520);
  const left = Math.min(popup.x, winW - 316);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.93, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.93, y: -6 }}
      transition={{ duration: 0.14 }}
      style={{ position: 'fixed', zIndex: 1000, top, left, width: 300 }}
      className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-visible"
    >
      <div className="bg-[#00509e] px-4 py-3 flex items-center justify-between rounded-t-2xl">
        <div>
          <p className="text-white text-[11px] opacity-75 capitalize mb-0.5">{dateStr}</p>
          <p className="text-white text-sm font-semibold">Nouveau rendez-vous</p>
        </div>
        <button onClick={onClose} className="text-white opacity-70 hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-white rounded-2xl flex flex-col items-center justify-center gap-3 z-10"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-emerald-600">check_circle</span>
            </div>
            <p className="text-sm font-semibold text-slate-700">RDV créé avec succès ✅</p>
            {numSeance && selectedPatient && (
              <p className="text-xs text-slate-400 text-center px-4">
                {selectedPatient.prenom} {selectedPatient.nom}<br/>
                Séance #{numSeance} · {machine}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 space-y-3">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Intervalle de temps</label>
          <div className="flex items-center gap-2">
            <input type="time" value={heureDebut} onChange={e => setHeureDebut(e.target.value)}
              className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:border-blue-400 text-slate-700" />
            <span className="text-slate-400 text-xs font-medium flex-shrink-0">→</span>
            <input type="time" value={heureFin} onChange={e => setHeureFin(e.target.value)}
              className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:border-blue-400 text-slate-700" />
          </div>
        </div>

        <div className="relative">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
            Patient
            {selectedPatient && <span className="text-emerald-500 normal-case font-normal ml-2">✓ Sélectionné</span>}
          </label>
          <div className="relative">
            <span className="material-symbols-outlined text-slate-400 text-sm absolute left-2.5 top-1/2 -translate-y-1/2">search</span>
            <input
              type="text"
              placeholder="Rechercher par nom..."
              value={search}
              onChange={e => searchPatient(e.target.value)}
              className={`w-full text-sm border rounded-lg pl-8 pr-3 py-2 focus:outline-none transition-all text-slate-700 placeholder-slate-300 ${
                selectedPatient ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-200 focus:border-blue-400'
              }`}
            />
          </div>
          {showSugg && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              {suggestions.map(p => (
                <button key={p.id} onClick={() => selectPatient(p)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 flex items-center gap-2 transition-colors border-b border-slate-50 last:border-b-0">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {p.prenom.charAt(0)}{p.nom.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{p.prenom} {p.nom}</p>
                    <p className="text-slate-400">ID #{p.id}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {selectedPatient && (
            <div className="mt-2 flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                {selectedPatient.prenom.charAt(0)}{selectedPatient.nom.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{selectedPatient.prenom} {selectedPatient.nom}</p>
                <p className="text-[10px] text-slate-400">ID #{selectedPatient.id}</p>
              </div>
              <div className={`flex-shrink-0 text-center px-2 py-1 rounded-lg border transition-all ${
                numSeance ? 'bg-blue-50 border-blue-200' : 'bg-slate-100 border-slate-200'
              }`}>
                <p className="text-[9px] text-slate-400">Séance</p>
                {loadingSeance
                  ? <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin block mx-auto" />
                  : <p className="text-sm font-bold text-[#00509e]">#{numSeance ?? '—'}</p>
                }
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Motif</label>
          <select value={motif} onChange={e => setMotif(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 text-slate-700 bg-white">
            <option>Séance hémodialyse</option>
            <option>Contrôle bilan</option>
            <option>Consultation</option>
            <option>Réunion</option>
            <option>Autre</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Machine</label>
          <div className="grid grid-cols-3 gap-1.5">
            {MACHINES.map(m => (
              <button key={m} onClick={() => setMachine(m)}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  machine === m
                    ? 'bg-blue-50 border-[#00509e] text-[#00509e]'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                }`}>{m}</button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <span className="material-symbols-outlined text-red-500 text-sm mt-0.5">error</span>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={onClose}
            className="flex-1 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={saving || success}
            className="flex-1 py-2 text-xs font-semibold text-white bg-[#00509e] rounded-xl hover:bg-[#003d7a] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1">
            {saving
              ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><span className="material-symbols-outlined text-sm">check</span>Créer</>
            }
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function StitchRendezVousCalendrierInner() {
  const now          = new Date();
  const searchParams = useSearchParams();
  const patientIdFromUrl = searchParams.get('patientId');

  const [rdvs, setRdvs]                 = useState<RDVFormatted[]>([]);
  const [loading, setLoading]           = useState(true);
  const [viewMode, setViewMode]         = useState<ViewMode>('semaine');
  const [currentDate, setCurrentDate]   = useState(new Date());
  const [filterPoste, setFilterPoste]   = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [mesSeulement, setMesSeulement] = useState(false);
  const [popup, setPopup] = useState<PopupState>({
    visible: false, date: null, heureDebut: '08:00', heureFin: '09:00', x: 0, y: 0,
  });

  // ✅ Charge tous les RDV depuis /rendezvous
  const loadRDV = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/rendezvous`);
      if (res.ok) {
        const data: RDV[] = await res.json();
        console.log(`✅ ${data.length} RDV chargés`);
        setRdvs(data.map(formatRDV).filter(Boolean) as RDVFormatted[]);
      } else {
        console.error('❌ Erreur chargement RDV :', res.status);
      }
    } catch (err) {
      console.error('❌ Erreur réseau :', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRDV();
    const interval = setInterval(loadRDV, 60000);
    return () => clearInterval(interval);
  }, [loadRDV]);

  const handleSlotClick = (e: React.MouseEvent, date: Date) => {
    if ((e.target as HTMLElement).closest('.rdv-card')) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const heureDecimale = 7 + relY / CELL_H;
    const h = Math.floor(heureDecimale);
    const m = Math.round((heureDecimale - h) * 60 / 30) * 30;
    const hDebut = `${String(h).padStart(2,'0')}:${String(m === 60 ? 0 : m).padStart(2,'0')}`;
    const hFinH  = m >= 30 ? h + 1 : h;
    const hFinM  = m >= 30 ? 0 : 30;
    const hFin   = `${String(hFinH).padStart(2,'0')}:${String(hFinM).padStart(2,'0')}`;
    setPopup({ visible: true, date, heureDebut: hDebut, heureFin: hFin, x: e.clientX + 12, y: e.clientY - 40 });
  };

  const navigate = (delta: number) => {
    const d = new Date(currentDate);
    if (viewMode === 'jour')         d.setDate(d.getDate() + delta);
    else if (viewMode === 'semaine') d.setDate(d.getDate() + delta * 7);
    else if (viewMode === 'mois')    d.setMonth(d.getMonth() + delta);
    setCurrentDate(d);
  };

  const getLundiSemaine = (d: Date) => {
    const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
    const lundi = new Date(d);
    lundi.setDate(d.getDate() - day);
    lundi.setHours(0,0,0,0);
    return lundi;
  };

  const lundi        = getLundiSemaine(currentDate);
  const joursSemaine = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lundi); d.setDate(lundi.getDate() + i); return d;
  });

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

  const rdvsFiltres = rdvs.filter(r => {
    if (filterPoste  && !r.poste.toLowerCase().includes(filterPoste.toLowerCase())) return false;
    if (filterStatut && r.statut !== filterStatut) return false;
    return true;
  });

  const getRdvJour = (jour: Date) =>
    rdvsFiltres.filter(r => r.jour===jour.getDate() && r.mois===jour.getMonth()+1 && r.annee===jour.getFullYear());

  const getRdvMois = (jour: number) =>
    rdvsFiltres.filter(r => r.jour===jour && r.mois===currentDate.getMonth()+1 && r.annee===currentDate.getFullYear());

  const premierJourMois  = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const decalage         = premierJourMois.getDay() === 0 ? 6 : premierJourMois.getDay() - 1;
  const nbJoursMois      = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0).getDate();

  const miniLundi = getLundiSemaine(currentDate);
  const miniJours = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(miniLundi); d.setDate(miniLundi.getDate()+i); return d;
  });

  const postesUtilises    = new Set(rdvsFiltres.filter(r => r.jour===now.getDate() && r.mois===now.getMonth()+1 && r.annee===now.getFullYear()).map(r => r.poste));
  const postesDisponibles = Math.max(0, 8 - postesUtilises.size);

  const getTop    = (h: string) => { const [hh,mm]=h.split(':').map(Number); return ((hh-7)+mm/60)*CELL_H; };
  const getHeight = (h1: string, h2: string) => {
    const [a,b]=h1.split(':').map(Number); const [c,d]=h2.split(':').map(Number);
    return Math.max(((c-a)+(d-b)/60)*CELL_H, 28);
  };
  const nowTop  = ((now.getHours()-7)+now.getMinutes()/60)*CELL_H;
  const isToday = (d: Date) => d.getDate()===now.getDate() && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <aside className="w-56 flex-shrink-0 border-r border-slate-200 flex flex-col bg-slate-50 overflow-y-auto">
        <div className="px-3 pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">{MOIS[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
            <div className="flex gap-1">
              <button onClick={() => navigate(-1)} className="p-0.5 hover:bg-slate-200 rounded text-slate-500 text-xs">‹</button>
              <button onClick={() => navigate(1)}  className="p-0.5 hover:bg-slate-200 rounded text-slate-500 text-xs">›</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {['L','M','M','J','V','S','D'].map((j,i) => (
              <div key={i} className="text-center text-[9px] font-semibold text-slate-400 py-1">{j}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: decalage }).map((_,i) => <div key={`e${i}`} />)}
            {Array.from({ length: nbJoursMois }, (_,i) => {
              const jour   = i+1;
              const isT    = jour===now.getDate() && currentDate.getMonth()===now.getMonth();
              const isSel  = miniJours.some(d => d.getDate()===jour && d.getMonth()===currentDate.getMonth());
              const hasRdv = rdvsFiltres.some(r => r.jour===jour && r.mois===currentDate.getMonth()+1);
              return (
                <button key={jour}
                  onClick={() => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), jour)); setViewMode('semaine'); }}
                  className={`text-center text-[10px] py-1 rounded-full transition-all relative ${
                    isT   ? 'bg-[#00509e] text-white font-bold' :
                    isSel ? 'bg-blue-100 text-blue-700 font-semibold' :
                    'text-slate-600 hover:bg-slate-200'
                  }`}>
                  {jour}
                  {hasRdv && !isT && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-3 mb-3 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2">
          <span className="material-symbols-outlined text-blue-400 text-base mt-0.5">touch_app</span>
          <p className="text-[10px] text-blue-600 leading-relaxed">Cliquez sur un créneau dans la grille pour créer un RDV</p>
        </div>

        <div className="px-3 pb-3 border-t border-slate-200 pt-3 space-y-2">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Filtres</p>
          <select value={filterPoste} onChange={e => setFilterPoste(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-400">
            <option value="">Tous les postes</option>
            {MACHINES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-400">
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

        <div className="px-3 pb-4 border-t border-slate-200 pt-3 space-y-1.5 mt-auto">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Légende</p>
          {Object.entries(TYPE_STYLES).map(([key,s]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm border-l-2 ${s.border} ${s.bg}`} />
              <span className="text-[10px] text-slate-600">{s.label}</span>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-3 px-5 py-3 border-b border-slate-200 bg-white flex-shrink-0">
          <button onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700">
            Aujourd'hui
          </button>
          <div className="flex gap-1">
            <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button onClick={() => navigate(1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
          <h1 className="text-base font-bold text-slate-800">{getTitreHeader()}</h1>
          {loading && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-2" />}
          <div className="ml-auto flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {(['jour','semaine','mois','programme'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  viewMode===v ? 'bg-white text-[#00509e] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}>
                {v.charAt(0).toUpperCase()+v.slice(1)}
              </button>
            ))}
          </div>
        </header>

        {viewMode === 'semaine' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="grid grid-cols-[52px_repeat(7,1fr)] border-b border-slate-200 bg-slate-50 flex-shrink-0">
              <div />
              {joursSemaine.map((jour,i) => {
                const today = isToday(jour);
                const nbRdv = getRdvJour(jour).length;
                return (
                  <div key={i} className="text-center py-2 border-l border-slate-200">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">{JOURS_COURTS[i]}</p>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-0.5 text-sm font-bold ${today?'bg-[#00509e] text-white':'text-slate-700'}`}>
                      {jour.getDate()}
                    </div>
                    {nbRdv>0 && <span className="text-[9px] text-blue-600 font-semibold">{nbRdv} RDV</span>}
                  </div>
                );
              })}
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-[52px_repeat(7,1fr)]" style={{ minHeight:`${CELL_H*13}px` }}>
                <div>
                  {HEURES_GRILLE.map(h => (
                    <div key={h} className="text-right pr-2 text-[10px] text-slate-400" style={{ height:`${CELL_H}px`, paddingTop:'2px' }}>{h}:00</div>
                  ))}
                </div>
                {joursSemaine.map((jour,di) => {
                  const rdvJour = getRdvJour(jour);
                  const today   = isToday(jour);
                  return (
                    <div key={di} className="relative border-l border-slate-200 cursor-crosshair group"
                      onClick={e => handleSlotClick(e, jour)}>
                      {HEURES_GRILLE.map(h => (
                        <div key={h} className="border-b border-slate-100 group-hover:border-blue-50 transition-colors" style={{ height:`${CELL_H}px` }} />
                      ))}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-start justify-end p-1">
                        <span className="text-[10px] text-blue-300 font-bold">+ RDV</span>
                      </div>
                      {today && nowTop>=0 && nowTop<=CELL_H*13 && (
                        <div className="absolute left-0 right-0 z-20 flex items-center pointer-events-none" style={{ top:`${nowTop}px` }}>
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5" />
                          <div className="flex-1 h-0.5 bg-red-500" />
                        </div>
                      )}
                      {rdvJour.map(rdv => {
                        const top    = getTop(rdv.heure);
                        const height = getHeight(rdv.heure, rdv.heureEnd);
                        const s      = TYPE_STYLES[rdv.type];
                        return (
                          <motion.div key={rdv.id}
                            initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                            style={{ top:`${top}px`, height:`${height}px`, left:'2px', right:'2px', position:'absolute', zIndex:10 }}
                            className={`rdv-card ${s.bg} border-l-[3px] ${s.border} rounded-r-lg px-2 py-1 overflow-hidden cursor-pointer hover:brightness-95 transition-all shadow-sm`}>
                            <p className={`text-[10px] font-bold ${s.text}`}>{rdv.heure}</p>
                            <p className={`text-[11px] font-semibold ${s.text} truncate`}>{rdv.patientPrenom} {rdv.patientNom}</p>
                            {height>40 && <p className={`text-[10px] ${s.text} opacity-70 truncate`}>{s.label} · {rdv.poste}</p>}
                          </motion.div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'jour' && (
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-[52px_1fr]" style={{ minHeight:`${CELL_H*13}px` }}>
              <div>
                {HEURES_GRILLE.map(h => (
                  <div key={h} className="text-right pr-2 text-[10px] text-slate-400" style={{ height:`${CELL_H}px`, paddingTop:'2px' }}>{h}:00</div>
                ))}
              </div>
              <div className="relative border-l border-slate-200 cursor-crosshair group"
                onClick={e => handleSlotClick(e, currentDate)}>
                {HEURES_GRILLE.map(h => (
                  <div key={h} className="border-b border-slate-100" style={{ height:`${CELL_H}px` }} />
                ))}
                {isToday(currentDate) && (
                  <div className="absolute left-0 right-0 z-20 flex items-center pointer-events-none" style={{ top:`${nowTop}px` }}>
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5" />
                    <div className="flex-1 h-0.5 bg-red-500" />
                  </div>
                )}
                {getRdvJour(currentDate).map(rdv => {
                  const top    = getTop(rdv.heure);
                  const height = getHeight(rdv.heure, rdv.heureEnd);
                  const s      = TYPE_STYLES[rdv.type];
                  return (
                    <motion.div key={rdv.id}
                      initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                      style={{ top:`${top}px`, height:`${height}px`, left:'4px', right:'4px', position:'absolute', zIndex:10 }}
                      className={`rdv-card ${s.bg} border-l-4 ${s.border} rounded-r-xl px-3 py-2 cursor-pointer hover:brightness-95 transition-all shadow-sm`}>
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

        {viewMode === 'mois' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(j => (
                <div key={j} className="text-center text-xs font-semibold text-slate-400 py-2">{j}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: decalage }).map((_,i) => <div key={`e${i}`} className="h-24 rounded-xl" />)}
              {Array.from({ length: nbJoursMois }, (_,i) => {
                const jour    = i+1;
                const rdvJour = getRdvMois(jour);
                const today   = jour===now.getDate() && currentDate.getMonth()===now.getMonth();
                return (
                  <div key={jour}
                    onClick={() => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), jour)); setViewMode('jour'); }}
                    className={`h-24 rounded-xl border p-1.5 cursor-pointer transition-all hover:shadow-md ${today?'border-blue-400 bg-blue-50':'border-slate-100 bg-white hover:border-blue-200'}`}>
                    <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${today?'bg-[#00509e] text-white':'text-slate-600'}`}>{jour}</div>
                    <div className="space-y-0.5 overflow-hidden">
                      {rdvJour.slice(0,3).map(rdv => {
                        const s = TYPE_STYLES[rdv.type];
                        return (
                          <div key={rdv.id} className={`${s.bg} border-l-4 ${s.border} rounded-r-lg px-2 py-1`}>
                            <p className={`text-[10px] font-bold ${s.text} truncate`}>{rdv.heure}</p>
                            <p className={`text-[11px] font-semibold ${s.text} truncate`}>{rdv.patientPrenom} {rdv.patientNom}</p>
                          </div>
                        );
                      })}
                      {rdvJour.length>3 && <p className="text-[9px] text-slate-400 pl-1">+{rdvJour.length-3} autres</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'programme' && (
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : rdvsFiltres.length===0 ? (
              <div className="text-center py-16 text-slate-400">
                <span className="material-symbols-outlined text-5xl mb-3 block">calendar_today</span>
                <p>Aucun rendez-vous trouvé</p>
              </div>
            ) : (
              <div className="space-y-2 max-w-2xl mx-auto">
                {rdvsFiltres.sort((a,b) => a.dateObj.getTime()-b.dateObj.getTime()).map((rdv,i) => {
                  const s = TYPE_STYLES[rdv.type];
                  return (
                    <motion.div key={rdv.id}
                      initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.03 }}
                      className={`flex items-center gap-4 p-3 rounded-xl border border-l-4 ${s.border} ${s.bg} hover:brightness-95 transition-all cursor-pointer`}>
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
                        rdv.statut==='confirmé' ? 'bg-emerald-100 text-emerald-700' :
                        rdv.statut==='planifié' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{rdv.statut}</span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <footer className="border-t border-slate-200 px-5 py-2.5 bg-slate-50 flex-shrink-0">
          <div className="flex flex-wrap gap-4">
            {Object.entries(TYPE_STYLES).map(([key, s]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm border-l-2 ${s.border} ${s.bg}`} />
                <span className="text-[10px] text-slate-500">{s.label}</span>
              </div>
            ))}
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {popup.visible && (
          <NewRDVForm
            popup={popup}
            onClose={() => setPopup(p => ({ ...p, visible: false }))}
            onCreated={loadRDV}
            preselectedPatientId={patientIdFromUrl ? parseInt(patientIdFromUrl) : null}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


export default function StitchRendezVousCalendrier() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <StitchRendezVousCalendrierInner />
    </Suspense>
  );
}