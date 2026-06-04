'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Patient { id: number; nom: string; prenom: string; }
interface RdvInfo { date_heure: string; statut_seance: string; }

interface LigneSurveillance {
  heure: string;
  ta: string;
  pouls: string;
  debit_sang: string;
  pression_veineuse: string;
  pression_arterielle: string;
  uf_affiche: string;
  uf_obtenue: string;
  ptm: string;
  incidents_cliniques: string;
  dialyseur_retourne: boolean;
  heure_retournement: string;
}

interface SurveillanceForm {
  orifice_catheter: string;
  kt_v: string;
  volume_sang_traite: string;
  delta_vs: string;
  pru: string;
  recirculation: string;
  temps_compression_veine: string;
  piege_bulle: string;
  dealeur: string;
  infirmier_nom: string;
  lignes: LigneSurveillance[];
}

const LIGNE_VIDE: LigneSurveillance = {
  heure: '30 min', ta: '', pouls: '', debit_sang: '',
  pression_veineuse: '', pression_arterielle: '',
  uf_affiche: '', uf_obtenue: '', ptm: '', incidents_cliniques: '',
  dialyseur_retourne: false, heure_retournement: '',
};

const DEFAULT_FORM: SurveillanceForm = {
  orifice_catheter: '', kt_v: '', volume_sang_traite: '', delta_vs: '', pru: '',
  recirculation: '', temps_compression_veine: '',
  piege_bulle: '', dealeur: '', infirmier_nom: '',
  lignes: Array.from({ length: 7 }, () => ({ ...LIGNE_VIDE })),
};

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

// ── Sons ───────────────────────────────────────
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
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch {}
}

function playBipUndo() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.setValueAtTime(400, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
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

function SurveillanceInner() {
  const searchParams = useSearchParams();
  const patientId    = searchParams.get('patientId');
  const rdvId        = searchParams.get('rendezVousId');
  const seanceNum    = searchParams.get('seanceNum') || '1';

  const [patient, setPatient]       = useState<Patient | null>(null);
  const [rdv, setRdv]               = useState<RdvInfo | null>(null);
  const [form, setForm]             = useState<SurveillanceForm>(DEFAULT_FORM);
  const [loading, setLoading]       = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
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

        const sRes = await fetch(`${API_URL}/surveillance/seance/${rdvId}`);
        if (sRes.ok) {
          const data = await sRes.json();
          if (data) {
            const lignesData: LigneSurveillance[] = Array.isArray(data.lignes) && data.lignes.length > 0
              ? data.lignes.map((l: any) => ({
                  heure:               l.heure || '30 min',
                  ta:                  l.ta || '',
                  pouls:               l.pouls || '',
                  debit_sang:          l.debit_sang || '',
                  pression_veineuse:   l.pression_veineuse || '',
                  pression_arterielle: l.pression_arterielle || '',
                  uf_affiche:          l.uf_affiche || '',
                  uf_obtenue:          l.uf_obtenue || '',
                  ptm:                 l.ptm || '',
                  incidents_cliniques: l.incidents_cliniques || '',
                  dialyseur_retourne:  l.dialyseur_retourne ?? false,
                  heure_retournement:  l.heure_retournement || '',
                }))
              : Array.from({ length: 7 }, () => ({ ...LIGNE_VIDE }));

            while (lignesData.length < 7) {
              lignesData.push({ ...LIGNE_VIDE });
            }

            setForm({
              orifice_catheter:        data.orifice_catheter || '',
              kt_v:                    data.kt_v || '',
              volume_sang_traite:      data.volume_sang_traite || '',
              delta_vs:                data.delta_vs || '',
              pru:                     data.pru || '',
              recirculation:           data.recirculation || '',
              temps_compression_veine: data.temps_compression_veine || '',
              piege_bulle:             data.piege_bulle || '',
              dealeur:                 data.dealeur || '',
              infirmier_nom:           data.infirmier_nom || '',
              lignes:                  lignesData,
            });
          }
        }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [patientId, rdvId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const set = (key: keyof SurveillanceForm) => (val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const updateLigne = (idx: number, field: keyof LigneSurveillance, val: any) => {
    setForm(f => ({
      ...f,
      lignes: f.lignes.map((l, i) => i === idx ? { ...l, [field]: val } : l),
    }));
  };

  // ✅ Toggle dialyseur retourné avec horodatage automatique + bip
  const toggleDialyseurRetourne = (idx: number) => {
    const ligne = form.lignes[idx];
    const nouveauStatut = !ligne.dialyseur_retourne;

    if (nouveauStatut) {
      const now = new Date();
      const heure = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setForm(f => ({
        ...f,
        lignes: f.lignes.map((l, i) => i === idx ? {
          ...l,
          dialyseur_retourne: true,
          heure_retournement: heure,
        } : l),
      }));
      playBipSuccess();
      showToast(`🔄 Dialyseur retourné à ${heure} (ligne ${idx + 1})`, 'success');
    } else {
      setForm(f => ({
        ...f,
        lignes: f.lignes.map((l, i) => i === idx ? {
          ...l,
          dialyseur_retourne: false,
          heure_retournement: '',
        } : l),
      }));
      playBipUndo();
    }
  };

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
      const res = await fetch(`${API_URL}/surveillance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSaveStatus('success');
        showToast('✅ Surveillance enregistrée', 'success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error('Erreur serveur');
      }
    } catch {
      setSaveStatus('error');
      showToast('❌ Erreur lors de l\'enregistrement', 'error');
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
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20 p-6 space-y-5 max-w-7xl mx-auto">

      {/* En-tête avec dégradé */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl shadow-indigo-200/40 p-5 flex items-center justify-between flex-wrap gap-3"
      >
        <div className="text-white">
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-wide flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">monitor_heart</span>
            Fiche de surveillance en hémodialyse
          </h1>
          <p className="text-xs md:text-sm text-blue-100 mt-1 font-semibold">
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

      {/* TABLEAU SURVEILLANCE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 150 }}
        className="bg-white rounded-2xl shadow-xl shadow-blue-100/40 border border-blue-100/50 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 border-b-2 border-indigo-200">
                <th className="px-2 py-3 text-[10px] font-black text-indigo-900 uppercase border-r border-indigo-200 w-16">HEURE</th>
                <th className="px-2 py-3 text-[10px] font-black text-indigo-900 uppercase border-r border-indigo-200 w-20">TA</th>
                <th className="px-2 py-3 text-[10px] font-black text-indigo-900 uppercase border-r border-indigo-200 w-16">POULS</th>
                <th className="px-2 py-3 text-[10px] font-black text-indigo-900 uppercase border-r border-indigo-200 w-20">DÉBIT SANG</th>
                <th className="px-2 py-3 text-[10px] font-black text-indigo-900 uppercase border-r border-indigo-200 w-20">PRESS. VEINEUSE</th>
                <th className="px-2 py-3 text-[10px] font-black text-indigo-900 uppercase border-r border-indigo-200 w-20">PRESS. ARTÉRIELLE</th>
                <th className="px-2 py-3 text-[10px] font-black text-indigo-900 uppercase border-r border-indigo-200 w-20">UF AFFICHÉ</th>
                <th className="px-2 py-3 text-[10px] font-black text-indigo-900 uppercase border-r border-indigo-200 w-20">UF OBTENUE</th>
                <th className="px-2 py-3 text-[10px] font-black text-indigo-900 uppercase border-r border-indigo-200 w-16">PTM</th>
                <th className="px-2 py-3 text-[10px] font-black text-indigo-900 uppercase">INCIDENTS CLINIQUES & TECHNIQUES</th>
                <th className="px-2 py-3 text-[10px] font-black text-indigo-900 uppercase w-32">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {form.lignes.map((ligne, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + idx * 0.05, type: 'spring', stiffness: 200 }}
                  className={`border-b border-slate-100 transition-all ${
                    ligne.dialyseur_retourne
                      ? 'bg-gradient-to-r from-emerald-50/60 to-teal-50/40'
                      : idx % 2 === 0 ? 'bg-slate-50/30 hover:bg-blue-50/40' : 'bg-white hover:bg-blue-50/40'
                  }`}
                >
                  <td className="border-r border-slate-200 p-0">
                    <input
                      type="text"
                      value={ligne.heure}
                      onChange={e => updateLigne(idx, 'heure', e.target.value)}
                      className="w-full px-2 py-2.5 text-center text-xs font-black text-indigo-700 bg-transparent focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-300 transition-all"
                    />
                  </td>
                  {(['ta','pouls','debit_sang','pression_veineuse','pression_arterielle','uf_affiche','uf_obtenue','ptm'] as (keyof LigneSurveillance)[]).map(field => (
                    <td key={field} className="border-r border-slate-200 p-0">
                      <input
                        type="text"
                        value={ligne[field] as string}
                        onChange={e => updateLigne(idx, field, e.target.value)}
                        className="w-full px-2 py-2.5 text-center text-xs font-semibold focus:outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-300 transition-all"
                      />
                    </td>
                  ))}
                  <td className="border-r border-slate-200 p-0">
                    <input
                      type="text"
                      value={ligne.incidents_cliniques}
                      onChange={e => updateLigne(idx, 'incidents_cliniques', e.target.value)}
                      placeholder={idx === 1 ? 'Ex : Retourner le dialyseur' : ''}
                      className="w-full px-2 py-2.5 text-xs focus:outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-300 placeholder-slate-300 transition-all"
                    />
                  </td>
                  {/* ✅ Bouton DIALYSEUR RETOURNÉ */}
                  <td className="p-1.5 text-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      animate={ligne.dialyseur_retourne ? {
                        boxShadow: [
                          '0 0 0 0 rgba(16, 185, 129, 0.4)',
                          '0 0 0 8px rgba(16, 185, 129, 0)',
                        ],
                      } : {}}
                      transition={{ duration: 1.5, repeat: ligne.dialyseur_retourne ? Infinity : 0 }}
                      onClick={() => toggleDialyseurRetourne(idx)}
                      className={`w-full px-2 py-1.5 text-[10px] font-black rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 ${
                        ligne.dialyseur_retourne
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200'
                          : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 hover:from-emerald-100 hover:to-teal-100 hover:text-emerald-700 border border-slate-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {ligne.dialyseur_retourne ? 'check_circle' : 'sync'}
                      </span>
                      {ligne.dialyseur_retourne ? `${ligne.heure_retournement} ✓` : 'Retourné'}
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* PARAMÈTRES TECHNIQUES */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg shadow-emerald-100/40 border border-emerald-100/50 p-5"
      >
        <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">tune</span>
          Paramètres techniques
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Orifice cathéter',         key: 'orifice_catheter',         ph: 'Bon' },
            { label: 'Volume sang total traité', key: 'volume_sang_traite',       ph: '60 L' },
            { label: 'KT/V',                     key: 'kt_v',                     ph: '1.4' },
            { label: 'ΔVS',                      key: 'delta_vs',                 ph: '5%' },
            { label: 'PRU',                      key: 'pru',                      ph: '70%' },
          ].map(f => (
            <motion.div key={f.key} whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
              <label className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5">
                {f.label}
              </label>
              <input
                type="text"
                placeholder={f.ph}
                value={(form as any)[f.key]}
                onChange={e => set(f.key as keyof SurveillanceForm)(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-semibold border-2 border-emerald-100 rounded-xl bg-emerald-50/30 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all"
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* RECIRCULATION CIRCUIT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg shadow-purple-100/40 border border-purple-100/50 p-5"
      >
        <h3 className="text-xs font-black text-purple-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">sync_alt</span>
          Recirculation circuit
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { val: 'BONNE',    grad: 'from-emerald-400 to-teal-500',   shadow: 'shadow-emerald-200', text: 'text-emerald-700' },
            { val: 'MOYENNE',  grad: 'from-amber-400 to-orange-500',   shadow: 'shadow-amber-200',   text: 'text-amber-700'   },
            { val: 'MAUVAISE', grad: 'from-red-400 to-rose-600',       shadow: 'shadow-red-200',     text: 'text-red-700'     },
          ].map(opt => (
            <motion.button
              key={opt.val}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => set('recirculation')(opt.val)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-center ${
                form.recirculation === opt.val
                  ? `bg-gradient-to-br ${opt.grad} text-white shadow-xl ${opt.shadow}`
                  : `bg-white border-slate-200 ${opt.text} hover:border-slate-400 shadow-sm`
              }`}
            >
              <p className="text-base font-black">{opt.val}</p>
            </motion.button>
          ))}
        </div>

        <div className="mt-5 pt-5 border-t border-purple-100">
          <label className="block text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">timer</span>
            Temps de compression Veine
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: '0-10 min',   grad: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-200', text: 'text-emerald-700' },
              { val: '10-20 min',  grad: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-200',   text: 'text-amber-700'   },
              { val: '+20 min',    grad: 'from-red-400 to-rose-600',     shadow: 'shadow-red-200',     text: 'text-red-700'     },
            ].map(opt => (
              <motion.button
                key={opt.val}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => set('temps_compression_veine')(opt.val)}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer text-center ${
                  form.temps_compression_veine === opt.val
                    ? `bg-gradient-to-br ${opt.grad} text-white shadow-lg ${opt.shadow}`
                    : `bg-white border-slate-200 ${opt.text} hover:border-slate-400 shadow-sm`
                }`}
              >
                <p className="text-sm font-black">{opt.val}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* PIÈGE & DEALEUR */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-lg shadow-rose-100/40 border border-rose-100/50 p-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {([
            { label: 'Piège à bulle', key: 'piege_bulle' as keyof SurveillanceForm },
            { label: 'Dealeur',       key: 'dealeur'     as keyof SurveillanceForm },
          ]).map(item => (
            <div key={item.key}>
              <label className="block text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-2">
                {item.label}
              </label>
              <div className="flex gap-2">
                {['propre', 'caillot'].map(opt => (
                  <motion.button
                    key={opt}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => set(item.key)(opt)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                      (form as any)[item.key] === opt
                        ? opt === 'propre'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-600 text-white shadow-md shadow-emerald-200'
                          : 'bg-gradient-to-r from-red-500 to-rose-600 border-red-600 text-white shadow-md shadow-red-200'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                    }`}
                  >
                    {(form as any)[item.key] === opt && '✓ '}{opt.toUpperCase()}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* INFIRMIER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="bg-white rounded-2xl shadow-lg shadow-indigo-100/40 border border-indigo-100/50 p-5"
      >
        <label className="block text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">person</span>
          Infirmier(e) en charge
        </label>
        <input
          type="text"
          placeholder="Ex : Harisoa M."
          value={form.infirmier_nom}
          onChange={e => set('infirmier_nom')(e.target.value)}
          className="w-full px-3 py-2.5 text-sm font-semibold border-2 border-indigo-100 rounded-xl bg-indigo-50/30 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all"
        />
      </motion.div>

      {/* ACTIONS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
            onClick={() => setForm({ ...DEFAULT_FORM, lignes: Array.from({ length: 7 }, () => ({ ...LIGNE_VIDE })) })}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-400 transition-all cursor-pointer"
          >
            Réinitialiser
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.print()}
            className="px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-md shadow-amber-200 hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
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
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-200'
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

export default function StitchSurveillance() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SurveillanceInner />
    </Suspense>
  );
}