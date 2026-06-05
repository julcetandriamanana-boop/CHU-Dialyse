'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { InfirmierProfil, getInfirmierActif } from '@/src/components/profil/InfirmierProfilModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Patient { id: number; nom: string; prenom: string; }
interface RdvInfo { date_heure: string; statut_seance: string; }

interface ConstantesForm {
  poids_avant: string;
  ta_avant: string;
  fc_avant: string;
  temp_avant: string;
  o2_avant: string;
  poids_apres: string;
  ta_apres: string;
  fc_apres: string;
  temp_apres: string;
  o2_apres: string;
  heparine: string;
  hbpm: string;
  dc: string;
  de: string;
  kt_artere: string;
  kt_veine: string;
  infirmier_nom: string;
}

const DEFAULT_FORM: ConstantesForm = {
  poids_avant: '', ta_avant: '', fc_avant: '', temp_avant: '', o2_avant: '',
  poids_apres: '', ta_apres: '', fc_apres: '', temp_apres: '', o2_apres: '',
  heparine: '', hbpm: '', dc: '', de: '', kt_artere: '', kt_veine: '',
  infirmier_nom: '',
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

function ConstantesInner() {
  const searchParams = useSearchParams();
  const patientId    = searchParams.get('patientId');
  const rdvId        = searchParams.get('rendezVousId');
  const seanceNum    = searchParams.get('seanceNum') || '1';

  const [patient, setPatient]       = useState<Patient | null>(null);
  const [rdv, setRdv]               = useState<RdvInfo | null>(null);
  const [form, setForm]             = useState<ConstantesForm>(DEFAULT_FORM);
  const [constantesId, setConstantesId] = useState<number | null>(null);
  const [loading, setLoading]       = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [infirmier, setInfirmier]   = useState<InfirmierProfil | null>(null);
  const [toast, setToast]           = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      if (patientId) {
        const r = await fetch(`${API_URL}/patients/${patientId}`);
        if (r.ok) setPatient(await r.json());
      }
      if (rdvId) {
        const rRes = await fetch(`${API_URL}/rendezvous/${rdvId}`);
        if (rRes.ok) setRdv(await rRes.json());

        const cRes = await fetch(`${API_URL}/constantes/seance/${rdvId}`);
        if (cRes.ok) {
          const data = await cRes.json();
          if (data) {
            setConstantesId(data.id);
            setForm({
              poids_avant:   data.poids_avant   || '',
              ta_avant:      data.ta_avant      || '',
              fc_avant:      data.fc_avant      || '',
              temp_avant:    data.temp_avant    || '',
              o2_avant:      data.o2_avant      || '',
              poids_apres:   data.poids_apres   || '',
              ta_apres:      data.ta_apres      || '',
              fc_apres:      data.fc_apres      || '',
              temp_apres:    data.temp_apres    || '',
              o2_apres:      data.o2_apres      || '',
              heparine:      data.heparine      || '',
              hbpm:          data.hbpm          || '',
              dc:            data.dc            || '',
              de:            data.de            || '',
              kt_artere:     data.kt_artere     || '',
              kt_veine:      data.kt_veine      || '',
              infirmier_nom: data.infirmier_nom || '',
            });
          }
        }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [patientId, rdvId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    const inf = getInfirmierActif();
    if (inf) {
      setInfirmier(inf);
      setForm(f => ({ ...f, infirmier_nom: f.infirmier_nom || inf.nom_complet }));
    }
  }, []);

  const set = (key: keyof ConstantesForm) => (val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!rdvId || !patientId) {
      showToast('Aucun patient ou rendez-vous lié', 'error');
      return;
    }
    setSaveStatus('saving');
    try {
      const body = {
        rendez_vous_id: parseInt(rdvId),
        patient_id:     parseInt(patientId),
        ...form,
      };
      const res = await fetch(`${API_URL}/constantes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setConstantesId(data.id);
        setSaveStatus('success');
        playBipSuccess();
        showToast('Constantes enregistrées avec succès', 'success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else { throw new Error('Erreur serveur'); }
    } catch {
      setSaveStatus('error');
      showToast('Erreur lors de l\'enregistrement', 'error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const goBack = () => {
    window.location.href = `/dialyses/section-paramedical?patientId=${patientId || ''}&rendezVousId=${rdvId || ''}&seanceNum=${seanceNum}`;
  };

  const formatHeureRdv = () => {
    if (!rdv?.date_heure) return '';
    const d = new Date(rdv.date_heure);
    const date = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const h = d.getHours();
    return `${date} - ${h < 12 ? 'Matin' : 'Après-midi'}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const constantesVitales = [
    { label: 'Poids',       key: 'poids', unit: 'kg',   icon: 'scale',         ph: '72.5',    grad: 'from-emerald-400 to-teal-500',  shadow: 'shadow-emerald-100', border: 'border-emerald-200', focus: 'focus:border-emerald-500 focus:ring-emerald-100' },
    { label: 'T.A.',        key: 'ta',    unit: 'mmHg', icon: 'favorite',      ph: '120/80',  grad: 'from-red-400 to-rose-500',      shadow: 'shadow-red-100',     border: 'border-red-200',     focus: 'focus:border-red-500 focus:ring-red-100' },
    { label: 'FC',          key: 'fc',    unit: 'bpm',  icon: 'monitor_heart', ph: '82',      grad: 'from-pink-400 to-rose-500',     shadow: 'shadow-pink-100',    border: 'border-pink-200',    focus: 'focus:border-pink-500 focus:ring-pink-100' },
    { label: 'Température', key: 'temp',  unit: '°C',   icon: 'thermostat',    ph: '36.7',    grad: 'from-amber-400 to-orange-500',  shadow: 'shadow-amber-100',   border: 'border-amber-200',   focus: 'focus:border-amber-500 focus:ring-amber-100' },
    { label: 'O₂',          key: 'o2',    unit: '%',    icon: 'air',           ph: '98',      grad: 'from-blue-400 to-cyan-500',     shadow: 'shadow-blue-100',    border: 'border-blue-200',    focus: 'focus:border-blue-500 focus:ring-blue-100' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-rose-50/20 p-6 space-y-5 max-w-5xl mx-auto">

      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-2xl shadow-xl shadow-amber-200/40 p-5 flex items-center justify-between flex-wrap gap-3"
      >
        <div className="text-white">
          <h1 className="text-xl md:text-2xl font-black flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">monitor_heart</span>
            Constantes Vitales
          </h1>
          <p className="text-xs md:text-sm text-amber-100 mt-1 font-semibold">
            {patient ? `${patient.prenom} ${patient.nom}` : '—'} · Séance N°{seanceNum} · {formatHeureRdv()}
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

      {/* Bandeau infirmier */}
      {infirmier && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-md shadow-emerald-100"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
            {infirmier.nom_complet.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-emerald-800">{infirmier.nom_complet}</p>
            <p className="text-[10px] text-emerald-600 font-semibold">
              {infirmier.matricule} · {infirmier.service_nom}
            </p>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">Profil actif</span>
        </motion.div>
      )}

      {!patientId && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg shadow-amber-100"
        >
          <span className="material-symbols-outlined text-amber-600 text-lg">warning</span>
          <span className="text-sm font-bold text-amber-800">
            Aucun patient lié — revenez depuis le tableau de bord
          </span>
        </motion.div>
      )}

      {/* TABLEAU CONSTANTES AVANT/APRÈS — cartes modernes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl shadow-amber-100/40 border border-amber-100/50 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 px-5 py-4">
          <h2 className="text-sm font-black text-amber-900 flex items-center gap-2 uppercase tracking-wider">
            <span className="material-symbols-outlined text-lg">monitor_heart</span>
            Constantes vitales — Avant / Après séance
          </h2>
        </div>

        <div className="p-5 space-y-3">
          {constantesVitales.map((row, idx) => (
            <motion.div
              key={row.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + idx * 0.06, type: 'spring', stiffness: 200 }}
              whileHover={{ y: -2 }}
              className={`grid grid-cols-12 gap-3 items-center p-3 rounded-xl border-2 ${row.border} bg-gradient-to-r from-white to-slate-50/50 transition-all`}
            >
              <div className="col-span-12 md:col-span-3 flex items-center gap-2">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${row.grad} flex items-center justify-center shadow-md ${row.shadow}`}>
                  <span className="material-symbols-outlined text-white text-lg">{row.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">{row.label}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">{row.unit}</p>
                </div>
              </div>

              <div className="col-span-6 md:col-span-4">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Avant</label>
                <input
                  type="text"
                  placeholder={row.ph}
                  value={(form as any)[`${row.key}_avant`]}
                  onChange={e => set(`${row.key}_avant` as keyof ConstantesForm)(e.target.value)}
                  className={`w-full px-3 py-2 text-sm text-center font-bold border-2 ${row.border} rounded-lg bg-white focus:outline-none ${row.focus} focus:ring-4 transition-all`}
                />
              </div>

              <div className="col-span-6 md:col-span-4">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Après</label>
                <input
                  type="text"
                  placeholder={row.ph}
                  value={(form as any)[`${row.key}_apres`]}
                  onChange={e => set(`${row.key}_apres` as keyof ConstantesForm)(e.target.value)}
                  className={`w-full px-3 py-2 text-sm text-center font-bold border-2 ${row.border} rounded-lg bg-white focus:outline-none ${row.focus} focus:ring-4 transition-all`}
                />
              </div>

              <div className="hidden md:flex col-span-1 justify-center">
                <span className="material-symbols-outlined text-slate-300 text-sm">trending_flat</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ANTICOAGULATION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-xl shadow-blue-100/40 border border-blue-100/50 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 px-5 py-4">
          <h2 className="text-sm font-black text-blue-900 flex items-center gap-2 uppercase tracking-wider">
            <span className="material-symbols-outlined text-lg">vaccines</span>
            Anticoagulation
          </h2>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Héparine',   key: 'heparine',  ph: '5000 UI', icon: 'medication',           grad: 'from-blue-400 to-indigo-500',   border: 'border-blue-200',    focus: 'focus:border-blue-500 focus:ring-blue-100' },
            { label: 'DC',         key: 'dc',        ph: '2.5',     icon: 'water_drop',           grad: 'from-cyan-400 to-blue-500',     border: 'border-cyan-200',    focus: 'focus:border-cyan-500 focus:ring-cyan-100' },
            { label: 'KT/Artère',  key: 'kt_artere', ph: 'OK',      icon: 'bloodtype',            grad: 'from-red-400 to-rose-500',      border: 'border-red-200',     focus: 'focus:border-red-500 focus:ring-red-100' },
            { label: 'HBPM',       key: 'hbpm',      ph: '4000 UI', icon: 'medication_liquid',    grad: 'from-indigo-400 to-purple-500', border: 'border-indigo-200',  focus: 'focus:border-indigo-500 focus:ring-indigo-100' },
            { label: 'DE',         key: 'de',        ph: '1.5',     icon: 'water_drop',           grad: 'from-purple-400 to-pink-500',   border: 'border-purple-200',  focus: 'focus:border-purple-500 focus:ring-purple-100' },
            { label: 'KT/Veine',   key: 'kt_veine',  ph: 'OK',      icon: 'bloodtype',            grad: 'from-pink-400 to-rose-500',     border: 'border-pink-200',    focus: 'focus:border-pink-500 focus:ring-pink-100' },
          ].map((f, idx) => (
            <motion.div
              key={f.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + idx * 0.05 }}
              whileHover={{ y: -3 }}
            >
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <span className={`material-symbols-outlined text-sm bg-gradient-to-br ${f.grad} bg-clip-text text-transparent`}>{f.icon}</span>
                {f.label}
              </label>
              <input
                type="text"
                placeholder={f.ph}
                value={(form as any)[f.key]}
                onChange={e => set(f.key as keyof ConstantesForm)(e.target.value)}
                className={`w-full px-3 py-2.5 text-sm font-semibold border-2 ${f.border} rounded-xl bg-white focus:outline-none ${f.focus} focus:ring-4 transition-all`}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* INFIRMIER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-lg shadow-emerald-100/40 border border-emerald-100/50 p-5"
      >
        <label className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">person</span>
          Infirmier(e) en charge
        </label>
        <input
          type="text"
          placeholder="Ex : Harisoa M."
          value={form.infirmier_nom}
          onChange={e => set('infirmier_nom')(e.target.value)}
          className="w-full px-3 py-2.5 text-sm font-semibold border-2 border-emerald-100 rounded-xl bg-emerald-50/30 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all"
        />
      </motion.div>

      {/* ACTIONS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
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
            onClick={() => setForm({ ...DEFAULT_FORM, infirmier_nom: infirmier?.nom_complet || '' })}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-400 transition-all cursor-pointer"
          >
            Réinitialiser
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
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-200'
            }`}
          >
            {saveStatus === 'saving'  && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saveStatus === 'success' && <span className="material-symbols-outlined text-base">check_circle</span>}
            {saveStatus === 'idle'    && <span className="material-symbols-outlined text-base">save</span>}
            {saveStatus === 'error'   && <span className="material-symbols-outlined text-base">error</span>}
            {saveStatus === 'saving'  ? 'Enregistrement...' :
             saveStatus === 'success' ? 'Enregistré ✓'      :
             saveStatus === 'error'   ? 'Réessayer'          :
             'Enregistrer'}
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}

export default function StitchConstantes() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConstantesInner />
    </Suspense>
  );
}