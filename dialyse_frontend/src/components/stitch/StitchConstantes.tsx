'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

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
  const [toast, setToast]           = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Charger patient + RDV + constantes existantes
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

        // Charger constantes existantes
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
        showToast('✅ Constantes enregistrées', 'success');
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
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-5 max-w-4xl mx-auto">

      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-2xl font-black text-slate-800">CONSTANTES</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {patient ? `${patient.prenom} ${patient.nom}` : '—'} · Séance N°{seanceNum} · {formatHeureRdv()}
          </p>
        </div>
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Retour
        </button>
      </motion.div>

      {/* Bandeau patient */}
      {!patientId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <span className="material-symbols-outlined text-amber-500 text-base">warning</span>
          <span className="text-xs font-semibold text-amber-700">
            Aucun patient lié — revenez depuis le tableau de bord
          </span>
        </motion.div>
      )}

      {/* ── TABLEAU CONSTANTES AVANT/APRÈS ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden"
      >
        <div className="bg-amber-50 border-b border-amber-100 px-5 py-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-600 text-lg">monitor_heart</span>
          <h2 className="text-sm font-black text-slate-800">Constantes vitales</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-amber-50/60 border-b border-amber-100">
                <th className="px-4 py-3 text-xs font-bold text-slate-600 text-left w-1/3"></th>
                <th className="px-4 py-3 text-xs font-bold text-slate-700 text-center">AVANT</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-700 text-center">APRÈS</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-400 text-center w-20">Unité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { label: 'Poids',       key: 'poids', unit: 'kg',   ph: '72.5' },
                { label: 'T.A.',        key: 'ta',    unit: 'mmHg', ph: '120/80' },
                { label: 'FC',          key: 'fc',    unit: 'bpm',  ph: '82' },
                { label: 'Température', key: 'temp',  unit: '°C',   ph: '36.7' },
                { label: 'O₂',          key: 'o2',    unit: '%',    ph: '98' },
              ].map(row => (
                <tr key={row.key} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2.5 text-sm font-bold text-slate-700">{row.label} :</td>
                  <td className="px-4 py-2.5">
                    <input
                      type="text"
                      placeholder={row.ph}
                      value={(form as any)[`${row.key}_avant`]}
                      onChange={e => set(`${row.key}_avant` as keyof ConstantesForm)(e.target.value)}
                      className="w-full px-3 py-2 text-sm text-center font-semibold border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="text"
                      placeholder={row.ph}
                      value={(form as any)[`${row.key}_apres`]}
                      onChange={e => set(`${row.key}_apres` as keyof ConstantesForm)(e.target.value)}
                      className="w-full px-3 py-2 text-sm text-center font-semibold border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                    />
                  </td>
                  <td className="px-4 py-2.5 text-center text-[10px] text-slate-400 font-medium">{row.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── ANTICOAGULATION ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden"
      >
        <div className="bg-blue-50 border-b border-blue-100 px-5 py-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 text-lg">vaccines</span>
          <h2 className="text-sm font-black text-slate-800">ANTICOAGULATION</h2>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Héparine',   key: 'heparine',  ph: '5000 UI' },
            { label: 'DC',         key: 'dc',        ph: '2.5' },
            { label: 'KT/Artère',  key: 'kt_artere', ph: 'OK' },
            { label: 'HBPM',       key: 'hbpm',      ph: '4000 UI' },
            { label: 'DE',         key: 'de',        ph: '1.5' },
            { label: 'KT/Veine',   key: 'kt_veine',  ph: 'OK' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {f.label}
              </label>
              <input
                type="text"
                placeholder={f.ph}
                value={(form as any)[f.key]}
                onChange={e => set(f.key as keyof ConstantesForm)(e.target.value)}
                className="w-full px-3 py-2 text-sm font-semibold border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── INFIRMIER ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-5"
      >
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Infirmier(e) en charge
        </label>
        <input
          type="text"
          placeholder="Ex : Harisoa M."
          value={form.infirmier_nom}
          onChange={e => set('infirmier_nom')(e.target.value)}
          className="w-full px-3 py-2 text-sm font-semibold border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all"
        />
      </motion.div>

      {/* ── Actions ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between gap-3 pb-6 flex-wrap"
      >
        <button
          onClick={goBack}
          className="px-5 py-2.5 text-sm font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Retour
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => setForm({ ...DEFAULT_FORM })}
            className="px-5 py-2.5 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Réinitialiser
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">print</span>
            Imprimer
          </button>
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving' || saveStatus === 'success'}
            className={`px-6 py-2.5 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-70 ${
              saveStatus === 'success' ? 'bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700'
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
          </button>
        </div>
      </motion.div>

      {/* Toast */}
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
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConstantesInner />
    </Suspense>
  );
}