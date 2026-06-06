'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Patient { id: number; nom: string; prenom: string; }
interface RdvInfo { date_heure: string; }

interface ParamsForm {
  nom: string; seanceNum: string; date: string;
  generateur: string; poste: string; dialyseur: string;
  fav: string; typeAcces: 'simple' | 'tunnelise';
  desinfection: 'acide' | 'chimique';
  na: string; bicar: string; profilNa: string; profilUF: string;
  k: string; ca: string; tempDialysat: string; debitDialysat: string;
  debitPompe: string; dureePrescrite: string; dureeRealisee: string;
  heureDebut: string; heureFin: string; poidsSec: string;
  poidsAPerdre: string; ufHeureMax: string; ufTotalObtenu: string;
  bilan: string;
}

const DEFAULT_FORM: ParamsForm = {
  nom: '', seanceNum: '', date: '',
  generateur: '', poste: '', dialyseur: '',
  fav: '', typeAcces: 'simple',
  desinfection: 'acide',
  na: '', bicar: '', profilNa: '', profilUF: '',
  k: '2', ca: '1.5', tempDialysat: '36.5', debitDialysat: '300',
  debitPompe: '', dureePrescrite: '', dureeRealisee: '',
  heureDebut: '', heureFin: '', poidsSec: '',
  poidsAPerdre: '', ufHeureMax: '', ufTotalObtenu: '',
  bilan: '',
};

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

function playBipSuccess() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 60, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-white text-sm font-bold ${
        type === 'success'
          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-200'
          : 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-200'
      }`}
    >
      <span className="material-symbols-outlined text-xl">
        {type === 'success' ? 'check_circle' : 'error'}
      </span>
      {msg}
    </motion.div>
  );
}

function ParamRow({ label, unit, value, onChange, placeholder, type = 'number', step, isDefault = false, accent = 'violet' }: {
  label: string; unit: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  type?: string; step?: string; isDefault?: boolean;
  accent?: 'violet' | 'pink' | 'cyan' | 'amber';
}) {
  const accentMap = {
    violet: { border: 'border-violet-200', focus: 'focus:border-violet-500 focus:ring-violet-100', text: 'text-violet-700' },
    pink:   { border: 'border-pink-200',   focus: 'focus:border-pink-500 focus:ring-pink-100',     text: 'text-pink-700'   },
    cyan:   { border: 'border-cyan-200',   focus: 'focus:border-cyan-500 focus:ring-cyan-100',     text: 'text-cyan-700'   },
    amber:  { border: 'border-amber-200',  focus: 'focus:border-amber-500 focus:ring-amber-100',   text: 'text-amber-700'  },
  }[accent];

  return (
    <motion.div whileHover={{ x: 2 }} className="flex items-center gap-2 mb-2">
      <span className="flex-1 text-xs text-slate-600 font-semibold">{label}</span>
      <div className="relative w-28">
        <input type={type} step={step} value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          className={`w-full px-2 py-1.5 text-xs font-black text-right border-2 rounded-lg bg-white focus:outline-none focus:ring-4 transition-all ${
            isDefault ? 'bg-violet-50/30 border-violet-300' : accentMap.border
          } ${accentMap.focus} ${accentMap.text}`} />
        {isDefault && (
          <span className="absolute -top-1.5 -right-1.5 text-[7px] font-black bg-gradient-to-r from-violet-500 to-purple-600 text-white px-1.5 py-0.5 rounded-full shadow-sm">def</span>
        )}
      </div>
      <span className="text-[10px] text-slate-400 w-14 flex-shrink-0 font-semibold">{unit}</span>
    </motion.div>
  );
}


function ConductiviteInner() {
  const searchParams   = useSearchParams();
  const patientIdParam = searchParams.get('patientId');
  const seanceNumParam = searchParams.get('seanceNum');
  const rdvId          = searchParams.get('rendezVousId');

  const [form, setForm] = useState<ParamsForm>({
    ...DEFAULT_FORM,
    seanceNum: seanceNumParam || '',
    date: new Date().toISOString().split('T')[0],
  });

  const [patient, setPatient]       = useState<Patient | null>(null);
  const [rdv, setRdv]               = useState<RdvInfo | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [toast, setToast]           = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAll = useCallback(async () => {
    try {
      if (patientIdParam) {
        const r = await fetch(`${API_URL}/patients/${patientIdParam}`);
        if (r.ok) {
          const data = await r.json();
          setPatient(data);
          setForm(f => ({ ...f, nom: f.nom || `${data.prenom || ''} ${data.nom || ''}`.trim() }));
        }
      }
      if (rdvId) {
        const r = await fetch(`${API_URL}/rendezvous/${rdvId}`);
        if (r.ok) setRdv(await r.json());
      }
    } catch (e) { console.error(e); }
  }, [patientIdParam, rdvId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const set = (key: keyof ParamsForm) => (val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const goBack = () => {
    window.location.href = `/dialyses/section-medecin?patientId=${patientIdParam || ''}&rendezVousId=${rdvId || ''}&seanceNum=${seanceNumParam || '1'}`;
  };

  const handleSave = async () => {
    if (!patientIdParam) {
      showToast('Aucun patient lie - revenez depuis section medecin', 'error');
      return;
    }
    setSaveStatus('saving');
    const prescription = {
      patient:           { id: parseInt(patientIdParam) },
      medicament:        `Conductivite seance N${form.seanceNum || seanceNumParam || '?'} - ${form.dialyseur || 'Dialyseur N/A'}`,
      dosage:            `Na:${form.na || '-'} Bicar:${form.bicar || '-'} K:${form.k} Ca:${form.ca} T:${form.tempDialysat}C Debit:${form.debitDialysat}ml/min`,
      frequence:         `Seance HD - Generateur ${form.generateur || 'N/A'} - Poste ${form.poste || 'N/A'}`,
      date_prescription: form.date || new Date().toISOString().split('T')[0],
      workflow_statut:   'actif',
    };
    try {
      const res = await fetch(`${API_URL}/prescriptions`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(prescription),
      });
      if (res.ok) {
        setSaveStatus('success');
        playBipSuccess();
        showToast('Parametres de conductivite enregistres', 'success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else { throw new Error(); }
    } catch {
      setSaveStatus('error');
      showToast('Erreur - reessayez', 'error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const formatHeureRdv = () => {
    if (!rdv?.date_heure) return '';
    const d = new Date(rdv.date_heure);
    const date = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const h = d.getHours();
    return `${date} - ${h < 12 ? 'Matin' : 'Apres-midi'}`;
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/30 via-purple-50/20 to-pink-50/20 p-6 space-y-5 max-w-6xl mx-auto">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl shadow-violet-200/40 p-5 flex items-center justify-between flex-wrap gap-3"
      >
        <div className="text-white">
          <h1 className="text-xl md:text-2xl font-black flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">settings_input_component</span>
            Conductivite & Parametres
          </h1>
          <p className="text-xs md:text-sm text-violet-100 mt-1 font-semibold">
            Prescription medicale de la seance - CHU Andrainjato
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={goBack}
          className="flex items-center gap-1.5 px-4 py-2 bg-white/15 backdrop-blur-sm text-white text-sm font-bold rounded-xl hover:bg-white/25 transition-all cursor-pointer border border-white/20"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Retour
        </motion.button>
      </motion.div>

      {/* BANDEAU PATIENT */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-xl px-4 py-3 flex items-center gap-3 border-2 ${
          patientIdParam
            ? 'bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200'
            : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300'
        }`}
      >
        <span className={`material-symbols-outlined text-lg ${patientIdParam ? 'text-violet-500' : 'text-amber-500'}`}>
          {patientIdParam ? 'person' : 'warning'}
        </span>
        <span className={`text-sm font-bold ${patientIdParam ? 'text-violet-800' : 'text-amber-800'}`}>
          {patientIdParam
            ? `Patient ID #${patientIdParam}${patient ? ' - ' + patient.prenom + ' ' + patient.nom : ''} - Seance N${seanceNumParam || '?'}${rdv ? ' - ' + formatHeureRdv() : ''}`
            : 'Aucun patient lie - revenez depuis section medecin'
          }
        </span>
      </motion.div>

      {/* LEGENDE */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-200 rounded-xl px-4 py-2.5 flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-violet-600 text-base">info</span>
        <span className="text-xs text-violet-700 font-semibold">
          Les champs avec badge <strong className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-1.5 py-0.5 rounded-full text-[8px]">def</strong> sont pre-remplis avec les valeurs standard.
        </span>
      </motion.div>

      {/* BLOC 1 - IDENTIFICATION */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl shadow-lg shadow-violet-100/40 border border-violet-100/50 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-violet-100 via-purple-100 to-pink-100 px-5 py-3">
          <h2 className="text-xs font-black text-violet-900 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-base">badge</span>
            Identification Patient & Materiel
          </h2>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Nom & Prenoms',    key: 'nom',        type: 'text',   ph: 'Rakoto Jean'     },
            { label: 'Seance N',         key: 'seanceNum',  type: 'number', ph: '1'               },
            { label: 'Date',             key: 'date',       type: 'date',   ph: ''                },
            { label: 'Generateur',       key: 'generateur', type: 'text',   ph: 'Fresenius 5008'  },
            { label: 'Poste N',          key: 'poste',      type: 'text',   ph: 'M-03'            },
            { label: 'Dialyseur (F R)',  key: 'dialyseur',  type: 'text',   ph: 'F7'              },
          ].map(f => (
            <motion.div key={f.key} whileHover={{ y: -2 }}>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{f.label}</label>
              <input type={f.type} placeholder={f.ph}
                value={(form as any)[f.key]}
                onChange={e => set(f.key as keyof ParamsForm)(e.target.value)}
                className="w-full px-3 py-2 text-sm font-semibold border-2 border-violet-100 rounded-xl bg-violet-50/30 focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100 transition-all" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* BLOC 2 - ACCES VASCULAIRE */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg shadow-pink-100/40 border border-pink-100/50 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-pink-100 via-rose-100 to-red-100 px-5 py-3">
          <h2 className="text-xs font-black text-pink-900 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-base">bloodtype</span>
            Acces Vasculaire
          </h2>
        </div>
        <div className="p-5 flex gap-4 flex-wrap">
          <div className="flex-1 min-w-40">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">FAV / Aiguille</label>
            <input type="text" placeholder="ex: 15G"
              value={form.fav}
              onChange={e => set('fav')(e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold border-2 border-pink-100 rounded-xl bg-pink-50/30 focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-100 transition-all" />
          </div>
          <div className="flex-2 min-w-64">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type d'acces</label>
            <div className="flex gap-2">
              {([
                { val: 'simple',    label: 'Catheter simple'    },
                { val: 'tunnelise', label: 'Catheter tunnelise' },
              ] as { val: 'simple' | 'tunnelise'; label: string }[]).map(opt => (
                <motion.button key={opt.val}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setForm(f => ({ ...f, typeAcces: opt.val }))}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                    form.typeAcces === opt.val
                      ? 'bg-gradient-to-r from-pink-500 to-rose-600 border-pink-600 text-white shadow-md shadow-pink-200'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                  }`}>
                  {form.typeAcces === opt.val ? '✓ ' : ''}{opt.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>


      {/* BLOC 3 - DESINFECTION */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl shadow-lg shadow-amber-100/40 border border-amber-100/50 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-red-100 px-5 py-3">
          <h2 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-base">cleaning_services</span>
            Mode de Desinfection
          </h2>
        </div>
        <div className="p-5 flex gap-3">
          {([
            { val: 'acide',    label: 'Acide citrique / Chaleur', icon: 'thermostat', grad: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-200', border: 'border-amber-600' },
            { val: 'chimique', label: 'Desinfection chimique',     icon: 'science',    grad: 'from-blue-500 to-indigo-600',  shadow: 'shadow-blue-200',  border: 'border-blue-600'  },
          ] as { val: 'acide' | 'chimique'; label: string; icon: string; grad: string; shadow: string; border: string }[]).map(opt => (
            <motion.button key={opt.val}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setForm(f => ({ ...f, desinfection: opt.val }))}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-black border-2 transition-all cursor-pointer ${
                form.desinfection === opt.val
                  ? `bg-gradient-to-r ${opt.grad} ${opt.border} text-white shadow-lg ${opt.shadow}`
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
              }`}>
              <span className="material-symbols-outlined text-lg">{opt.icon}</span>
              {opt.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* BLOC 4 - PARAMETRES (2 colonnes) */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-xl shadow-violet-100/40 border border-violet-100/50 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-violet-100 via-purple-100 to-fuchsia-100 px-5 py-3">
          <h2 className="text-xs font-black text-violet-900 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-base">tune</span>
            Parametres Techniques
          </h2>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Colonne Dialysat */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-violet-700 uppercase tracking-widest pb-2 border-b-2 border-violet-100 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">water_drop</span>
              Dialysat - Conductivite Programmee
            </h3>
            <ParamRow label="Na (sodium)"      unit="mmol/L" value={form.na}           onChange={set('na')}           placeholder="138" step="0.1" accent="violet" />
            <ParamRow label="Bicar"            unit="mmol/L" value={form.bicar}        onChange={set('bicar')}        placeholder="32"  step="0.1" accent="violet" />
            <ParamRow label="Profil Na"        unit=""       value={form.profilNa}     onChange={set('profilNa')}     type="text" placeholder="-" accent="violet" />
            <ParamRow label="Profil UF"        unit=""       value={form.profilUF}     onChange={set('profilUF')}     type="text" placeholder="-" accent="violet" />

            <div className="my-3 border-t border-dashed border-violet-200" />
            <p className="text-[9px] font-black text-violet-500 uppercase tracking-widest mb-2">Valeurs standard</p>

            <ParamRow label="K (potassium)"    unit="mmol/L" value={form.k}            onChange={set('k')}            step="0.1" isDefault accent="violet" />
            <ParamRow label="Ca (calcium)"     unit="mmol/L" value={form.ca}           onChange={set('ca')}           step="0.1" isDefault accent="violet" />
            <ParamRow label="T dialysat"       unit="C"      value={form.tempDialysat} onChange={set('tempDialysat')} step="0.1" isDefault accent="violet" />
            <ParamRow label="Debit dialysat"   unit="ml/min" value={form.debitDialysat}onChange={set('debitDialysat')}step="10"  isDefault accent="violet" />
          </div>

          {/* Colonne Seance & UF */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-pink-700 uppercase tracking-widest pb-2 border-b-2 border-pink-100 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">monitor_heart</span>
              Seance & Ultrafiltration
            </h3>
            <ParamRow label="Debit pompe sang"   unit="ml/min" value={form.debitPompe}    onChange={set('debitPompe')}    placeholder="250" step="10" accent="pink" />
            <ParamRow label="Duree prescrite"    unit="h"      value={form.dureePrescrite} onChange={set('dureePrescrite')} type="text" placeholder="4h00" accent="pink" />
            <ParamRow label="Duree realisee"     unit="h"      value={form.dureeRealisee}  onChange={set('dureeRealisee')}  type="text" placeholder="-"    accent="pink" />
            <ParamRow label="Heure debut HD"     unit=""       value={form.heureDebut}     onChange={set('heureDebut')}     type="time" accent="pink" />
            <ParamRow label="Heure fin HD"       unit=""       value={form.heureFin}       onChange={set('heureFin')}       type="time" accent="pink" />

            <div className="my-3 border-t border-dashed border-pink-200" />

            <ParamRow label="Poids sec"          unit="kg"     value={form.poidsSec}       onChange={set('poidsSec')}       placeholder="65.0" step="0.1" accent="pink" />
            <ParamRow label="Poids a perdre"     unit="kg"     value={form.poidsAPerdre}   onChange={set('poidsAPerdre')}   placeholder="2.5"  step="0.1" accent="pink" />
            <ParamRow label="UF/heure max"       unit="kg/h"   value={form.ufHeureMax}     onChange={set('ufHeureMax')}     placeholder="1.0"  step="0.1" accent="pink" />
            <ParamRow label="UF total obtenu"    unit="kg"     value={form.ufTotalObtenu}  onChange={set('ufTotalObtenu')}  placeholder="-"    step="0.1" accent="pink" />
          </div>
        </div>
      </motion.div>


      {/* BLOC 5 - BILAN */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg shadow-cyan-100/40 border border-cyan-100/50 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-cyan-100 via-sky-100 to-blue-100 px-5 py-3">
          <h2 className="text-xs font-black text-cyan-900 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-base">edit_note</span>
            Bilan
          </h2>
        </div>
        <div className="p-5">
          <textarea
            value={form.bilan}
            onChange={e => set('bilan')(e.target.value)}
            placeholder="Observations medicales, incidents de seance, tolerance du patient..."
            rows={4}
            className="w-full px-3 py-2.5 text-sm border-2 border-cyan-100 rounded-xl bg-cyan-50/30 focus:outline-none focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100 transition-all resize-y font-medium"
          />
        </div>
      </motion.div>

      {/* ACTIONS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-between gap-3 pb-6 flex-wrap"
      >
        <motion.button
          whileHover={{ scale: 1.03, x: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={goBack}
          className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Retour
        </motion.button>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setForm({ ...DEFAULT_FORM, date: new Date().toISOString().split('T')[0] })}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-400 transition-all cursor-pointer"
          >
            Reinitialiser
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.print()}
            className="px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md shadow-blue-200 hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">print</span>
            Imprimer
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={saveStatus === 'saving' || saveStatus === 'success'}
            className={`px-6 py-2.5 text-xs font-black text-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-70 shadow-lg ${
              saveStatus === 'success'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-200'
                : 'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 shadow-violet-200'
            }`}
          >
            {saveStatus === 'saving'  && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saveStatus === 'success' && <span className="material-symbols-outlined text-base">check_circle</span>}
            {saveStatus === 'idle'    && <span className="material-symbols-outlined text-base">save</span>}
            {saveStatus === 'error'   && <span className="material-symbols-outlined text-base">error</span>}
            {saveStatus === 'saving'  ? 'Enregistrement...' :
             saveStatus === 'success' ? 'Enregistre' :
             saveStatus === 'error'   ? 'Reessayer' :
             'Enregistrer la prescription'}
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </AnimatePresence>

    </div>
  );
}

export default function ConductiviteParamsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConductiviteInner />
    </Suspense>
  );
}
