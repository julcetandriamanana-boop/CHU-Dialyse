'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/* ─── Types ─────────────────────────────────────────────────────── */
type ViewMode = 'jour' | 'semaine' | 'mois' | 'programme';
type EventType = 'seance_hd' | 'controle' | 'consultation' | 'reunion' | 'autre';

interface CalEvent {
  id: number;
  patientNom: string;
  patientPrenom: string;
  medecin: string;
  poste: string;
  type: EventType;
  dateHeure: Date;
  dureeMin: number;
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
  motif: string;
}

interface PatientSuggestion { id: number; nom: string; prenom: string; }

interface NouveauRdvForm {
  patientId: number | null;
  patientNom: string;
  patientPrenom: string;
  poste: string;
  type: EventType;
  date: string;
  heure: string;
  duree: string;
  motif: string;
  medecin: string;
}

/* ─── Constantes ─────────────────────────────────────────────────── */
const EVENT_COLORS: Record<EventType, { bg: string; border: string; text: string; sub: string; dot: string }> = {
  seance_hd:    { bg: 'bg-blue-50',   border: 'border-l-blue-600',   text: 'text-blue-900',   sub: 'text-blue-600',   dot: 'bg-blue-600'   },
  controle:     { bg: 'bg-emerald-50',border: 'border-l-emerald-600',text: 'text-emerald-900',sub: 'text-emerald-600',dot: 'bg-emerald-600' },
  consultation: { bg: 'bg-amber-50',  border: 'border-l-amber-600',  text: 'text-amber-900',  sub: 'text-amber-600',  dot: 'bg-amber-600'  },
  reunion:      { bg: 'bg-purple-50', border: 'border-l-purple-600', text: 'text-purple-900', sub: 'text-purple-600', dot: 'bg-purple-600' },
  autre:        { bg: 'bg-slate-50',  border: 'border-l-slate-400',  text: 'text-slate-700',  sub: 'text-slate-500',  dot: 'bg-slate-400'  },
};

const EVENT_LABELS: Record<EventType, string> = {
  seance_hd: 'Séance HD', controle: 'Contrôle',
  consultation: 'Consultation', reunion: 'Réunion', autre: 'Autre',
};

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 07→19
const DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

/* ─── Helpers ────────────────────────────────────────────────────── */
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function minutesFromMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

const PX_PER_MIN = 48 / 60; // 48px par heure

/* ─── Données mock ───────────────────────────────────────────────── */
function getMockEvents(weekStart: Date): CalEvent[] {
  const d = (day: number, h: number, m = 0) => {
    const dt = addDays(weekStart, day);
    dt.setHours(h, m, 0, 0);
    return dt;
  };
  return [
    { id:1, patientNom:'Rakoto', patientPrenom:'Jean',  medecin:'Dr. Andrianjato', poste:'Poste 1', type:'seance_hd',    dateHeure:d(0,7),  dureeMin:240, statut:'planifie',  motif:'Hémodialyse' },
    { id:2, patientNom:'Rabe',   patientPrenom:'Marie', medecin:'Dr. Andrianjato', poste:'Poste 2', type:'seance_hd',    dateHeure:d(0,7),  dureeMin:240, statut:'planifie',  motif:'Hémodialyse' },
    { id:3, patientNom:'Mamy',   patientPrenom:'Aina',  medecin:'Dr. Rakoto',      poste:'',        type:'consultation', dateHeure:d(0,12), dureeMin:30,  statut:'planifie',  motif:'Consultation' },
    { id:4, patientNom:'Mamy',   patientPrenom:'Aina',  medecin:'Dr. Andrianjato', poste:'Poste 1', type:'seance_hd',    dateHeure:d(1,7),  dureeMin:240, statut:'en_cours',  motif:'Hémodialyse' },
    { id:5, patientNom:'Noro',   patientPrenom:'Jao',   medecin:'Dr. Andrianjato', poste:'Poste 2', type:'seance_hd',    dateHeure:d(1,7),  dureeMin:240, statut:'en_cours',  motif:'Hémodialyse' },
    { id:6, patientNom:'Fara',   patientPrenom:'Tiana', medecin:'Dr. Rakoto',      poste:'Poste 3', type:'seance_hd',    dateHeure:d(1,7),  dureeMin:240, statut:'en_cours',  motif:'Hémodialyse' },
    { id:7, patientNom:'Equipe', patientPrenom:'',      medecin:'Dr. Andrianjato', poste:'',        type:'reunion',      dateHeure:d(1,14), dureeMin:60,  statut:'planifie',  motif:'Réunion équipe' },
    { id:8, patientNom:'Haja',   patientPrenom:'Rivo',  medecin:'Dr. Andrianjato', poste:'Poste 1', type:'seance_hd',    dateHeure:d(2,7),  dureeMin:240, statut:'planifie',  motif:'Hémodialyse' },
    { id:9, patientNom:'Multi',  patientPrenom:'',      medecin:'Dr. Rakoto',      poste:'',        type:'controle',     dateHeure:d(2,11), dureeMin:120, statut:'planifie',  motif:'Contrôle biologique' },
    { id:10,patientNom:'Vola',   patientPrenom:'Miora', medecin:'Dr. Andrianjato', poste:'Poste 1', type:'seance_hd',    dateHeure:d(3,7),  dureeMin:240, statut:'planifie',  motif:'Hémodialyse' },
    { id:11,patientNom:'Tojo',   patientPrenom:'Ranto', medecin:'Dr. Rakoto',      poste:'Poste 2', type:'seance_hd',    dateHeure:d(3,7),  dureeMin:240, statut:'planifie',  motif:'Hémodialyse' },
    { id:12,patientNom:'Lala',   patientPrenom:'Soa',   medecin:'Dr. Andrianjato', poste:'Poste 4', type:'seance_hd',    dateHeure:d(4,7),  dureeMin:240, statut:'planifie',  motif:'Hémodialyse' },
    { id:13,patientNom:'Andry',  patientPrenom:'Paul',  medecin:'Dr. Rakoto',      poste:'Poste 3', type:'seance_hd',    dateHeure:d(4,14), dureeMin:240, statut:'planifie',  motif:'Hémodialyse' },
    { id:14,patientNom:'Laza',   patientPrenom:'Bako',  medecin:'Dr. Rakoto',      poste:'',        type:'consultation', dateHeure:d(4,11), dureeMin:30,  statut:'planifie',  motif:'Consultation post-séance' },
    { id:15,patientNom:'Rado',   patientPrenom:'Fy',    medecin:'Dr. Andrianjato', poste:'',        type:'controle',     dateHeure:d(5,8),  dureeMin:120, statut:'planifie',  motif:'Contrôle' },
  ];
}

/* ─── Composant modal nouveau RDV ────────────────────────────────── */
function NouveauRdvModal({ onClose, onSave }: { onClose: () => void; onSave: (f: NouveauRdvForm) => void }) {
  const [form, setForm] = useState<NouveauRdvForm>({
    patientId: null, patientNom: '', patientPrenom: '', poste: 'Poste 1',
    type: 'seance_hd', date: new Date().toISOString().split('T')[0],
    heure: '07:00', duree: '240', motif: 'Hémodialyse', medecin: 'Dr. Andrianjato',
  });
  const [suggestions, setSuggestions] = useState<PatientSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof NouveauRdvForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  /* Recherche patient dans l'API */
  const searchPatient = async (query: string) => {
    set('patientNom')(query);
    setForm(f => ({ ...f, patientId: null }));
    if (query.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    try {
      const res = await fetch(`${API_URL}/patients?search=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        const list: PatientSuggestion[] = (data.data || data || []).map((p: any) => ({
          id: p.id, nom: p.nom, prenom: p.prenom,
        }));
        setSuggestions(list);
        setShowSuggestions(list.length > 0);
      }
    } catch { setSuggestions([]); }
  };

  const selectPatient = (p: PatientSuggestion) => {
    setForm(f => ({ ...f, patientId: p.id, patientNom: p.nom, patientPrenom: p.prenom }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSave = async () => {
    if (!form.patientId) { setError('Sélectionnez un patient dans la liste'); return; }
    if (!form.date || !form.heure) { setError('Date et heure obligatoires'); return; }
    setSaving(true); setError('');
    try {
      const dateHeure = `${form.date}T${form.heure}:00`;
      const res = await fetch(`${API_URL}/rendezvous/creer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: form.patientId,
          date_heure: dateHeure,
          motif: form.motif || 'Séance de dialyse',
          statut: 'confirmé',
          creneau: form.type,
          machine: form.poste,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      onSave(form);
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        onClick={e => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">event_available</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Nouveau rendez-vous</p>
              <p className="text-[10px] text-slate-500">Service hémodialyse · CHU Andrainjato</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/60 rounded-xl transition-colors">
            <span className="material-symbols-outlined text-slate-400 text-lg">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Recherche patient */}
          <div className="relative">
            <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Patient {form.patientId && <span className="text-emerald-600 normal-case">✓ Sélectionné</span>}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par nom (ex: Rakoto)..."
                value={form.patientNom}
                onChange={e => searchPatient(e.target.value)}
                className={`w-full px-3 py-2 text-xs border rounded-lg bg-slate-50 focus:outline-none focus:bg-white transition-all
                  ${form.patientId ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-200 focus:border-blue-400'}`}
              />
              {form.patientId && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-500 text-sm">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                </span>
              )}
            </div>
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                {suggestions.map(p => (
                  <button key={p.id} onClick={() => selectPatient(p)}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 flex items-center gap-2 transition-colors border-b border-slate-50 last:border-b-0">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                      {p.prenom.charAt(0)}{p.nom.charAt(0)}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">{p.prenom} {p.nom}</span>
                      <span className="text-slate-400 ml-1">· ID #{p.id}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Type</label>
              <select value={form.type} onChange={e => set('type')(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 transition-all">
                {Object.entries(EVENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Poste</label>
              <select value={form.poste} onChange={e => set('poste')(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 transition-all">
                {['Poste 1','Poste 2','Poste 3','Poste 4','—'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => set('date')(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Heure</label>
              <input type="time" value={form.heure} onChange={e => set('heure')(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Durée (min)</label>
              <select value={form.duree} onChange={e => set('duree')(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 transition-all">
                {['30','60','90','120','180','240','300'].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Médecin</label>
            <select value={form.medecin} onChange={e => set('medecin')(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 transition-all">
              {['Dr. Andrianjato','Dr. Rakoto','Dr. Rabe'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Motif</label>
            <input type="text" value={form.motif} onChange={e => set('motif')(e.target.value)}
              placeholder="Motif du rendez-vous"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Annuler</button>
          {error && <p className="text-[10px] text-red-600 font-semibold">{error}</p>}
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed">
            {saving
              ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Enregistrement...</>
              : <><span className="material-symbols-outlined text-sm">save</span>Enregistrer</>
            }
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Mini calendrier ────────────────────────────────────────────── */
function MiniCalendar({ selected, onSelect }: { selected: Date; onSelect: (d: Date) => void }) {
  const [viewMonth, setViewMonth] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));
  const today = new Date();
  const weekStart = getMonday(selected);

  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const startDay = getMonday(firstDay);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) days.push(addDays(startDay, i));

  return (
    <div className="px-3 py-3 border-t border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-white/80">
          {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
        </span>
        <div className="flex gap-0.5">
          <button onClick={() => setViewMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="w-5 h-5 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors">
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button onClick={() => setViewMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="w-5 h-5 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['L','M','M','J','V','S','D'].map((d, i) => (
          <div key={i} className="text-center text-[8px] font-medium text-white/30 py-0.5">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, i) => {
          const isToday = isSameDay(day, today);
          const inRange = day >= weekStart && day < addDays(weekStart, 7);
          const otherMonth = day.getMonth() !== viewMonth.getMonth();
          return (
            <button key={i} onClick={() => onSelect(day)}
              className={`text-[9px] aspect-square rounded-full flex items-center justify-center transition-all
                ${isToday ? 'bg-blue-400 text-white font-semibold' :
                  inRange ? 'bg-white/20 text-white/90' :
                  otherMonth ? 'text-white/20' : 'text-white/55 hover:bg-white/10 hover:text-white/80'}`}>
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  PAGE PRINCIPALE                                                    */
/* ═══════════════════════════════════════════════════════════════════ */
export default function AgendaDialysePage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [viewMode, setViewMode] = useState<ViewMode>('semaine');
  const [showModal, setShowModal] = useState(false);
  const [filterPoste, setFilterPoste] = useState('Tous les postes');
  const [filterMedecin, setFilterMedecin] = useState('Tous les médecins');
  const [filterStatut, setFilterStatut] = useState('Tous les statuts');
  const [mesSeulement, setMesSeulement] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);
  const [events, setEvents] = useState<CalEvent[]>([]);

  const weekStart = getMonday(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    setEvents(getMockEvents(weekStart));
  }, [weekStart.toDateString()]);

  const weekLabel = (() => {
    const end = addDays(weekStart, 6);
    if (weekStart.getMonth() === end.getMonth())
      return `${weekStart.getDate()} – ${end.getDate()} ${MONTHS[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
    return `${weekStart.getDate()} ${MONTHS[weekStart.getMonth()]} – ${end.getDate()} ${MONTHS[end.getMonth()]} ${weekStart.getFullYear()}`;
  })();

  const filteredEvents = events.filter(e => {
    if (filterPoste !== 'Tous les postes' && e.poste !== filterPoste) return false;
    if (filterMedecin !== 'Tous les médecins' && e.medecin !== filterMedecin) return false;
    if (filterStatut !== 'Tous les statuts' && e.statut !== filterStatut.toLowerCase().replace('-','_')) return false;
    return true;
  });

  const eventsForDay = (day: Date) => filteredEvents.filter(e => isSameDay(e.dateHeure, day));

  /* Grouper les events simultanés pour les afficher côte à côte */
  const getEventColumns = (dayEvents: CalEvent[]) => {
    const sorted = [...dayEvents].sort((a, b) => a.dateHeure.getTime() - b.dateHeure.getTime());
    const columns: CalEvent[][] = [];
    for (const ev of sorted) {
      let placed = false;
      for (const col of columns) {
        const last = col[col.length - 1];
        const lastEnd = minutesFromMidnight(last.dateHeure) + last.dureeMin;
        if (minutesFromMidnight(ev.dateHeure) >= lastEnd) {
          col.push(ev); placed = true; break;
        }
      }
      if (!placed) columns.push([ev]);
    }
    return columns;
  };

  const loadEventsFromAPI = async () => {
    try {
      const res = await fetch(`${API_URL}/rendezvous`);
      if (res.ok) {
        const rdvs = await res.json();
        const mapped: CalEvent[] = rdvs.map((rdv: any) => ({
          id: rdv.id,
          patientNom: rdv.patient?.nom || '',
          patientPrenom: rdv.patient?.prenom || '',
          medecin: rdv.medecin ? `Dr. ${rdv.medecin.nom || ''}` : 'Dr. Andrianjato',
          poste: rdv.soso_kevitra_malalaka?.split('|')[1]?.trim() || '',
          type: (rdv.soso_kevitra_malalaka?.split('|')[0]?.trim() || 'seance_hd') as EventType,
          dateHeure: new Date(rdv.date_heure),
          dureeMin: 240,
          statut: rdv.statut === 'confirmé' ? 'planifie' : rdv.statut as any,
          motif: rdv.motif,
        }));
        setEvents([...getMockEvents(weekStart), ...mapped]);
      }
    } catch { /* garder les mock events */ }
  };

  const handleSave = (form: NouveauRdvForm) => {
    // Ajouter localement en attendant le rechargement
    const [h, m] = form.heure.split(':').map(Number);
    const dt = new Date(form.date);
    dt.setHours(h, m, 0, 0);
    const newEv: CalEvent = {
      id: Date.now(), patientNom: form.patientNom, patientPrenom: form.patientPrenom,
      medecin: form.medecin, poste: form.poste, type: form.type as EventType,
      dateHeure: dt, dureeMin: parseInt(form.duree),
      statut: 'planifie', motif: form.motif,
    };
    setEvents(prev => [...prev, newEv]);
    setShowModal(false);
    // Recharger depuis l'API pour synchroniser
    setTimeout(() => loadEventsFromAPI(), 500);
  };

  const postes = ['Tous les postes', 'Poste 1', 'Poste 2', 'Poste 3', 'Poste 4'];
  const medecins = ['Tous les médecins', 'Dr. Andrianjato', 'Dr. Rakoto', 'Dr. Rabe'];
  const statuts = ['Tous les statuts', 'Planifié', 'En cours', 'Terminé', 'Annulé'];

  const disponibles = 4 - new Set(filteredEvents.filter(e => isSameDay(e.dateHeure, today) && e.statut !== 'annule').map(e => e.poste).filter(Boolean)).size;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* ════════════════════════════════════════════
          CONTENU PRINCIPAL (sans sidebar — celle-ci
          est déjà dans le layout.tsx existant)
          ════════════════════════════════════════════ */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-white border-b border-slate-200/70 px-5 py-2.5 flex items-center gap-3 flex-shrink-0 flex-wrap">
          <h1 className="text-base font-bold font-manrope text-slate-800 mr-1">Agenda Dialyse</h1>

          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
            <span className="material-symbols-outlined text-sm">add</span>Nouveau RDV
          </button>

          <button onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700">
            Aujourd'hui
          </button>

          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentDate(d => addDays(d, -7))}
              className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-sm text-slate-500">chevron_left</span>
            </button>
            <button onClick={() => setCurrentDate(d => addDays(d, 7))}
              className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-sm text-slate-500">chevron_right</span>
            </button>
          </div>

          <span className="text-sm font-semibold text-slate-700">{weekLabel}</span>

          <div className="flex border border-slate-200 rounded-xl overflow-hidden ml-auto">
            {(['jour','semaine','mois','programme'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 text-xs font-semibold border-r border-slate-200 last:border-r-0 transition-all capitalize
                  ${viewMode === v ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          <button className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-sm text-slate-500">more_vert</span>
          </button>
          <button className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-sm text-slate-500">settings</span>
          </button>
        </div>

        {/* ── Corps calendrier + mini sidebar droite ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Grille calendrier */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

            {/* Jours header */}
            <div className="grid border-b border-slate-200 bg-white flex-shrink-0" style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}>
              <div className="border-r border-slate-100" />
              {weekDays.map((day, i) => {
                const isToday = isSameDay(day, today);
                const isWeekend = i >= 5;
                return (
                  <div key={i} className={`py-2 text-center border-r border-slate-100 last:border-r-0 ${isWeekend ? 'bg-slate-50/60' : ''}`}>
                    <p className={`text-[9px] font-semibold uppercase tracking-wider ${isWeekend ? 'text-slate-400' : 'text-slate-400'}`}>
                      {DAYS_SHORT[i]}
                    </p>
                    <div className={`text-sm font-bold mx-auto mt-0.5 w-7 h-7 flex items-center justify-center rounded-full
                      ${isToday ? 'bg-blue-600 text-white' : isWeekend ? 'text-slate-400' : 'text-slate-700'}`}>
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scroll area */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid" style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}>

                {/* Labels heures */}
                <div className="border-r border-slate-100">
                  {HOURS.map(h => (
                    <div key={h} className="h-12 flex items-start justify-end pr-2 pt-1">
                      <span className="text-[9px] text-slate-400 font-medium">{String(h).padStart(2,'0')}:00</span>
                    </div>
                  ))}
                </div>

                {/* Colonnes jours */}
                {weekDays.map((day, dayIdx) => {
                  const isToday = isSameDay(day, today);
                  const isWeekend = dayIdx >= 5;
                  const dayEvents = eventsForDay(day);
                  const columns = getEventColumns(dayEvents);
                  const totalCols = columns.length || 1;

                  // Heure actuelle
                  const nowMin = minutesFromMidnight(today);
                  const nowTop = (nowMin - 7 * 60) * PX_PER_MIN;

                  return (
                    <div key={dayIdx} className={`border-r border-slate-100 last:border-r-0 relative
                      ${isWeekend ? 'bg-slate-50/40' : isToday ? 'bg-blue-50/20' : 'bg-white'}`}
                      style={{ minHeight: `${13 * 48}px` }}>

                      {/* Lignes heures */}
                      {HOURS.map(h => (
                        <div key={h} className="h-12 border-b border-slate-100/70" />
                      ))}

                      {/* Ligne heure actuelle */}
                      {isToday && nowTop > 0 && nowTop < 13 * 48 && (
                        <div className="absolute left-0 right-0 z-10 flex items-center" style={{ top: `${nowTop}px` }}>
                          <div className="w-2 h-2 bg-blue-500 rounded-full -ml-1 flex-shrink-0" />
                          <div className="flex-1 h-px bg-blue-500" />
                        </div>
                      )}

                      {/* Events */}
                      {columns.map((col, colIdx) =>
                        col.map(ev => {
                          const c = EVENT_COLORS[ev.type];
                          const topMin = minutesFromMidnight(ev.dateHeure) - 7 * 60;
                          const topPx = topMin * PX_PER_MIN;
                          const heightPx = Math.max(ev.dureeMin * PX_PER_MIN, 20);
                          const width = `${(1 / totalCols) * 96}%`;
                          const left = `${(colIdx / totalCols) * 96 + 2}%`;

                          return (
                            <motion.div
                              key={ev.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: colIdx * 0.03 }}
                              onClick={() => setSelectedEvent(selectedEvent?.id === ev.id ? null : ev)}
                              className={`absolute rounded-lg border-l-[3px] px-1.5 py-1 cursor-pointer z-20 overflow-hidden
                                hover:brightness-95 transition-all ${c.bg} ${c.border}
                                ${selectedEvent?.id === ev.id ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                              style={{ top: `${topPx + 2}px`, height: `${heightPx - 4}px`, left, width }}
                            >
                              <p className={`text-[9px] font-bold leading-tight truncate ${c.text}`}>
                                {EVENT_LABELS[ev.type]}
                              </p>
                              {heightPx > 28 && (
                                <p className={`text-[8px] leading-tight truncate ${c.sub}`}>
                                  {ev.poste ? `${ev.poste} · ` : ''}{ev.patientNom} {ev.patientPrenom}
                                </p>
                              )}
                              {heightPx > 44 && (
                                <p className={`text-[8px] leading-tight truncate ${c.sub} opacity-80`}>
                                  {String(ev.dateHeure.getHours()).padStart(2,'0')}:{String(ev.dateHeure.getMinutes()).padStart(2,'0')}
                                  {' – '}{String(new Date(ev.dateHeure.getTime() + ev.dureeMin*60000).getHours()).padStart(2,'0')}:
                                  {String(new Date(ev.dateHeure.getTime() + ev.dureeMin*60000).getMinutes()).padStart(2,'0')}
                                </p>
                              )}
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Mini sidebar droite : calendrier + filtres ── */}
          <div className="w-52 flex-shrink-0 border-l border-slate-200 bg-white flex flex-col overflow-y-auto">

            {/* Mini calendrier */}
            <div className="p-3 border-b border-slate-100">
              <MiniCalendarLight selected={currentDate} onSelect={setCurrentDate} />
            </div>

            {/* Filtres */}
            <div className="p-3 flex-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Filtres</p>

              {[
                { label: 'Postes', val: filterPoste, set: setFilterPoste, opts: postes },
                { label: 'Médecins', val: filterMedecin, set: setFilterMedecin, opts: medecins },
                { label: 'Statuts', val: filterStatut, set: setFilterStatut, opts: statuts },
              ].map(f => (
                <div key={f.label} className="mb-2">
                  <label className="block text-[8px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{f.label}</label>
                  <select value={f.val} onChange={e => f.set(e.target.value)}
                    className="w-full px-2 py-1.5 text-[10px] border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 transition-all text-slate-700">
                    {f.opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}

              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input type="checkbox" checked={mesSeulement} onChange={e => setMesSeulement(e.target.checked)}
                  className="w-3 h-3 rounded" />
                <span className="text-[10px] text-slate-500">Mes RDV seulement</span>
              </label>
            </div>

            {/* Detail event sélectionné */}
            <AnimatePresence>
              {selectedEvent && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="border-t border-slate-100 p-3">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Détail RDV</p>
                  <div className={`p-2.5 rounded-xl ${EVENT_COLORS[selectedEvent.type].bg} border-l-4 ${EVENT_COLORS[selectedEvent.type].border}`}>
                    <p className={`text-xs font-bold ${EVENT_COLORS[selectedEvent.type].text}`}>
                      {EVENT_LABELS[selectedEvent.type]}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${EVENT_COLORS[selectedEvent.type].sub}`}>
                      {selectedEvent.patientPrenom} {selectedEvent.patientNom}
                    </p>
                    <div className="mt-2 space-y-1">
                      {[
                        { icon: 'schedule', val: `${String(selectedEvent.dateHeure.getHours()).padStart(2,'0')}:${String(selectedEvent.dateHeure.getMinutes()).padStart(2,'0')} · ${selectedEvent.dureeMin} min` },
                        { icon: 'person', val: selectedEvent.medecin },
                        { icon: 'chair', val: selectedEvent.poste || 'Sans poste' },
                      ].map(item => (
                        <div key={item.icon} className="flex items-center gap-1.5">
                          <span className={`material-symbols-outlined text-xs ${EVENT_COLORS[selectedEvent.type].sub}`}>{item.icon}</span>
                          <span className={`text-[10px] ${EVENT_COLORS[selectedEvent.type].sub}`}>{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setSelectedEvent(null)}
                    className="mt-2 w-full py-1.5 text-[10px] font-semibold text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                    Fermer
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="bg-white border-t border-slate-200 px-5 py-2 flex items-center gap-4 flex-shrink-0 flex-wrap">
          {Object.entries(EVENT_COLORS).map(([type, c]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${c.dot}`} />
              <span className="text-[10px] text-slate-500">{EVENT_LABELS[type as EventType]}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-[11px] text-slate-500">
              Postes disponibles : <span className="font-bold text-slate-700">{Math.max(disponibles, 0)}</span>
            </span>
            <button className="px-3 py-1.5 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-colors">
              Gérer les postes
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal nouveau RDV ── */}
      <AnimatePresence>
        {showModal && <NouveauRdvModal onClose={() => setShowModal(false)} onSave={handleSave} />}
      </AnimatePresence>
    </div>
  );
}

/* ─── Mini calendrier clair (panneau droit) ──────────────────────── */
function MiniCalendarLight({ selected, onSelect }: { selected: Date; onSelect: (d: Date) => void }) {
  const [viewMonth, setViewMonth] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));
  const today = new Date();
  const weekStart = getMonday(selected);

  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const startDay = getMonday(firstDay);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) days.push(addDays(startDay, i));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-slate-700">
          {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
        </span>
        <div className="flex gap-0.5">
          <button onClick={() => setViewMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button onClick={() => setViewMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['L','M','M','J','V','S','D'].map((d, i) => (
          <div key={i} className="text-center text-[8px] font-medium text-slate-400">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, i) => {
          const isToday = isSameDay(day, today);
          const inRange = day >= weekStart && day < addDays(weekStart, 7);
          const otherMonth = day.getMonth() !== viewMonth.getMonth();
          return (
            <button key={i} onClick={() => onSelect(day)}
              className={`text-[9px] aspect-square rounded-full flex items-center justify-center transition-all
                ${isToday ? 'bg-blue-600 text-white font-semibold' :
                  inRange ? 'bg-blue-100 text-blue-700 font-medium' :
                  otherMonth ? 'text-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}>
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
