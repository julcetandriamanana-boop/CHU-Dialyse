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
};

const DEFAULT_FORM: SurveillanceForm = {
  orifice_catheter: '', kt_v: '', volume_sang_traite: '', delta_vs: '', pru: '',
  recirculation: '', temps_compression_veine: '',
  piege_bulle: '', dealeur: '', infirmier_nom: '',
  lignes: Array.from({ length: 7 }, () => ({ ...LIGNE_VIDE })),
};

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-white text-sm font-semibold ${
        type === 'success' ? 'bg-emerald-600' : 'bg-red-500'
      }`}
    >
      <span className="material-symbols-outlined text-lg">
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

  const updateLigne = (idx: number, field: keyof LigneSurveillance, val: string) => {
    setForm(f => ({
      ...f,
      lignes: f.lignes.map((l, i) => i === idx ? { ...l, [field]: val } : l),
    }));
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
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-5 max-w-6xl mx-auto">

      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-wide">
            Fiche de surveillance en hémodialyse
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {patient ? `${patient.prenom} ${patient.nom}` : '—'} · Séance N°{seanceNum} · {formatHeureRdv()}
          </p>
        </div>
        <button onClick={goBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Retour
        </button>
      </motion.div>

      {!patientId && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <span className="material-symbols-outlined text-amber-500 text-base">warning</span>
          <span className="text-xs font-semibold text-amber-700">
            Aucun patient lié — revenez depuis le tableau de bord
          </span>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-300">
                <th className="px-2 py-2 text-[10px] font-black text-slate-700 uppercase border-r border-slate-300 w-16">HEURE</th>
                <th className="px-2 py-2 text-[10px] font-black text-slate-700 uppercase border-r border-slate-300 w-20">TA</th>
                <th className="px-2 py-2 text-[10px] font-black text-slate-700 uppercase border-r border-slate-300 w-16">POULS</th>
                <th className="px-2 py-2 text-[10px] font-black text-slate-700 uppercase border-r border-slate-300 w-20">DÉBIT SANG</th>
                <th className="px-2 py-2 text-[10px] font-black text-slate-700 uppercase border-r border-slate-300 w-20">PRESSION VEINEUSE</th>
                <th className="px-2 py-2 text-[10px] font-black text-slate-700 uppercase border-r border-slate-300 w-20">PRESSION ARTÉRIELLE</th>
                <th className="px-2 py-2 text-[10px] font-black text-slate-700 uppercase border-r border-slate-300 w-20">UF AFFICHÉ</th>
                <th className="px-2 py-2 text-[10px] font-black text-slate-700 uppercase border-r border-slate-300 w-20">UF OBTENUE</th>
                <th className="px-2 py-2 text-[10px] font-black text-slate-700 uppercase border-r border-slate-300 w-16">PTM</th>
                <th className="px-2 py-2 text-[10px] font-black text-slate-700 uppercase">INCIDENTS CLINIQUES ET TECHNIQUES</th>
              </tr>
            </thead>
            <tbody>
              {form.lignes.map((ligne, idx) => (
                <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50/30">
                  <td className="border-r border-slate-200 p-0">
                    <input type="text" value={ligne.heure}
                      onChange={e => updateLigne(idx, 'heure', e.target.value)}
                      className="w-full px-2 py-2 text-center text-xs font-bold text-slate-700 bg-slate-50/50 focus:outline-none focus:bg-white" />
                  </td>
                  {(['ta','pouls','debit_sang','pression_veineuse','pression_arterielle','uf_affiche','uf_obtenue','ptm'] as (keyof LigneSurveillance)[]).map(field => (
                    <td key={field} className="border-r border-slate-200 p-0">
                      <input type="text" value={ligne[field]}
                        onChange={e => updateLigne(idx, field, e.target.value)}
                        className="w-full px-2 py-2 text-center text-xs focus:outline-none focus:bg-blue-50/30" />
                    </td>
                  ))}
                  <td className="p-0">
                    <input type="text" value={ligne.incidents_cliniques}
                      onChange={e => updateLigne(idx, 'incidents_cliniques', e.target.value)}
                      placeholder={idx === 1 ? 'Ex : Retourner le dialyseur' : ''}
                      className="w-full px-2 py-2 text-xs focus:outline-none focus:bg-blue-50/30 placeholder-slate-300" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Orifice cathéter',         key: 'orifice_catheter',         ph: 'Bon' },
            { label: 'Volume sang total traité', key: 'volume_sang_traite',       ph: '60 L' },
            { label: 'KT/V',                     key: 'kt_v',                     ph: '1.4' },
            { label: 'ΔVS',                      key: 'delta_vs',                 ph: '5%' },
            { label: 'PRU',                      key: 'pru',                      ph: '70%' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{f.label}</label>
              <input type="text" placeholder={f.ph}
                value={(form as any)[f.key]}
                onChange={e => set(f.key as keyof SurveillanceForm)(e.target.value)}
                className="w-full px-3 py-2 text-sm font-semibold border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all" />
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-5">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
          Recirculation circuit
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { val: 'BONNE',    color: 'emerald', sub: '0 – 10 min'  },
            { val: 'MOYENNE',  color: 'amber',   sub: '10 – 20 min' },
            { val: 'MAUVAISE', color: 'red',     sub: '+ 20 min'    },
          ].map(opt => (
            <button key={opt.val} onClick={() => set('recirculation')(opt.val)}
              className={`p-3 rounded-xl border-2 transition-all cursor-pointer text-center ${
                form.recirculation === opt.val
                  ? opt.color === 'emerald' ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : opt.color === 'amber'   ? 'border-amber-400 bg-amber-50 text-amber-700'
                  :                           'border-red-400 bg-red-50 text-red-700'
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
              }`}>
              <p className="text-sm font-black">{opt.val}</p>
              <p className="text-[10px] mt-0.5 opacity-70">{opt.sub}</p>
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Temps de compression Veine
          </label>
          <input type="text" placeholder="ex: 8 min"
            value={form.temps_compression_veine}
            onChange={e => set('temps_compression_veine')(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 text-sm font-semibold border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Piège à bulle
            </label>
            <div className="flex gap-2">
              {['propre', 'caillot'].map(opt => (
                <button key={opt} onClick={() => set('piege_bulle')(opt)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    form.piege_bulle === opt
                      ? opt === 'propre' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}>
                  {form.piege_bulle === opt && '✓ '}{opt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Dealeur
            </label>
            <div className="flex gap-2">
              {['propre', 'caillot'].map(opt => (
                <button key={opt} onClick={() => set('dealeur')(opt)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    form.dealeur === opt
                      ? opt === 'propre' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}>
                  {form.dealeur === opt && '✓ '}{opt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-5">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Infirmier(e) en charge
        </label>
        <input type="text" placeholder="Ex : Harisoa M."
          value={form.infirmier_nom}
          onChange={e => set('infirmier_nom')(e.target.value)}
          className="w-full px-3 py-2 text-sm font-semibold border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all" />
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
        className="flex items-center justify-between gap-3 pb-6 flex-wrap">
        <button onClick={goBack}
          className="px-5 py-2.5 text-sm font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Retour
        </button>

        <div className="flex gap-3">
          <button onClick={() => setForm({ ...DEFAULT_FORM, lignes: Array.from({ length: 7 }, () => ({ ...LIGNE_VIDE })) })}
            className="px-5 py-2.5 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
            Réinitialiser
          </button>
          <button onClick={() => window.print()}
            className="px-5 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">print</span>
            Imprimer
          </button>
          <button onClick={handleSave} disabled={saveStatus === 'saving' || saveStatus === 'success'}
            className={`px-6 py-2.5 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-70 ${
              saveStatus === 'success' ? 'bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}>
            {saveStatus === 'saving'  && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saveStatus === 'success' && <span className="material-symbols-outlined text-base">check_circle</span>}
            {saveStatus === 'idle'    && <span className="material-symbols-outlined text-base">save</span>}
            {saveStatus === 'error'   && <span className="material-symbols-outlined text-base">error</span>}
            {saveStatus === 'saving'  ? 'Enregistrement...' :
             saveStatus === 'success' ? 'Enregistré ✓'      :
             saveStatus === 'error'   ? 'Réessayer'          :
             'Enregistrer'}
          </button>
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
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SurveillanceInner />
    </Suspense>
  );
}