'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-3 pb-2 border-b-2 border-blue-100">
      {children}
    </p>
  );
}

function Field({ label, children, className = '' }: {
  label: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder = '', type = 'text', step, isDefault = false }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; step?: string; isDefault?: boolean;
}) {
  return (
    <input type={type} step={step} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className={`w-full px-3 py-2 text-xs font-semibold border rounded-lg transition-all focus:outline-none focus:bg-white ${
        isDefault
          ? 'bg-blue-50 border-blue-200 text-blue-700 focus:border-blue-500'
          : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-400'
      }`} />
  );
}

function ParamRow({ label, unit, value, onChange, placeholder, type = 'number', step, isDefault = false }: {
  label: string; unit: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; step?: string; isDefault?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="flex-1 text-xs text-slate-600 font-medium">{label}</span>
      <div className="relative w-24">
        <input type={type} step={step} value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          className={`w-full px-2 py-1.5 text-xs font-bold text-right border rounded-lg transition-all focus:outline-none focus:bg-white ${
            isDefault
              ? 'bg-blue-50 border-blue-200 text-blue-700 focus:border-blue-500'
              : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-blue-400'
          }`} />
        {isDefault && (
          <span className="absolute -top-1.5 -right-1.5 text-[7px] font-bold bg-blue-500 text-white px-1 py-0.5 rounded-full">déf.</span>
        )}
      </div>
      <span className="text-[10px] text-slate-400 w-14 flex-shrink-0">{unit}</span>
    </div>
  );
}

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-white text-sm font-semibold ${
        type === 'success' ? 'bg-emerald-600' : 'bg-red-500'
      }`}>
      <span className="material-symbols-outlined text-lg">
        {type === 'success' ? 'check_circle' : 'error'}
      </span>
      {msg}
    </motion.div>
  );
}

function ConductiviteInner() {
  const searchParams   = useSearchParams();
  const patientIdParam = searchParams.get('patientId');
  const seanceNumParam = searchParams.get('seanceNum');

  const [form, setForm] = useState<ParamsForm>({
    ...DEFAULT_FORM,
    seanceNum: seanceNumParam || '',
    date: new Date().toISOString().split('T')[0],
  });

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const set = (key: keyof ParamsForm) => (val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ✅ Enregistrer prescription conductivité dans BD
  const handleSave = async () => {
    if (!patientIdParam) {
      showToast('⚠️ Aucun patient lié — revenez depuis le tableau de bord', 'error');
      return;
    }

    setSaveStatus('saving');

    const prescription = {
      patient:           { id: parseInt(patientIdParam) },
      medicament:        `Conductivité séance N°${form.seanceNum || seanceNumParam || '?'} — ${form.dialyseur || 'Dialyseur N/A'}`,
      dosage:            `Na:${form.na || '—'} Bicar:${form.bicar || '—'} K:${form.k} Ca:${form.ca} T°:${form.tempDialysat}°C Débit:${form.debitDialysat}ml/min`,
      frequence:         `Séance HD — Générateur ${form.generateur || 'N/A'} — Poste ${form.poste || 'N/A'}`,
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
        showToast('✅ Paramètres de conductivité enregistrés', 'success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error('Erreur serveur');
      }
    } catch {
      setSaveStatus('error');
      showToast('❌ Erreur — réessayez', 'error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-5 max-w-5xl mx-auto">

      {/* ── En-tête ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black font-manrope text-slate-800">Conductivité & Paramètres</h1>
          <p className="text-sm text-slate-400 mt-0.5">Prescription médicale de la séance · CHU Andrainjato</p>
        </div>
        <button onClick={() => window.history.back()}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-lg">arrow_back</span>Retour
        </button>
      </motion.div>

      {/* ── Bandeau patient ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className={`rounded-xl px-4 py-2.5 flex items-center gap-3 border ${
          patientIdParam ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'
        }`}>
        <span className={`material-symbols-outlined text-base ${patientIdParam ? 'text-blue-500' : 'text-amber-500'}`}>
          {patientIdParam ? 'person' : 'warning'}
        </span>
        <span className={`text-xs font-semibold ${patientIdParam ? 'text-blue-700' : 'text-amber-700'}`}>
          {patientIdParam
            ? `Patient ID #${patientIdParam} · Séance N°${seanceNumParam || '?'}`
            : 'Aucun patient lié — revenez depuis le tableau de bord'
          }
        </span>
      </motion.div>

      {/* ── Légende ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
        <span className="material-symbols-outlined text-base">info</span>
        <span>Les champs en <strong>bleu</strong> sont pré-remplis avec les valeurs standard.</span>
      </motion.div>

      {/* ── Bloc 1 : Identification ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5">
        <SectionTitle>Identification Patient & Matériel</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Nom & Prénoms" className="col-span-2 md:col-span-1">
            <TextInput value={form.nom} onChange={set('nom')} placeholder="Rakoto Jean" />
          </Field>
          <Field label="Séance N°">
            <TextInput value={form.seanceNum} onChange={set('seanceNum')} placeholder="1" type="number" />
          </Field>
          <Field label="Date">
            <TextInput value={form.date} onChange={set('date')} type="date" />
          </Field>
          <Field label="Générateur">
            <TextInput value={form.generateur} onChange={set('generateur')} placeholder="Fresenius 5008" />
          </Field>
          <Field label="Poste N°">
            <TextInput value={form.poste} onChange={set('poste')} placeholder="M-03" />
          </Field>
          <Field label="Dialyseur (F R. n°)">
            <TextInput value={form.dialyseur} onChange={set('dialyseur')} placeholder="F7" />
          </Field>
        </div>
      </motion.div>

      {/* ── Bloc 2 : Accès vasculaire ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5">
        <SectionTitle>Accès Vasculaire</SectionTitle>
        <div className="flex gap-4 flex-wrap">
          <Field label="FAV / Aiguille" className="flex-1 min-w-32">
            <TextInput value={form.fav} onChange={set('fav')} placeholder="ex: 15G" />
          </Field>
          <div className="flex-2 min-w-48">
            <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Type d'accès</label>
            <div className="flex gap-2">
              {([
                { val: 'simple',    label: 'Cathéter simple'    },
                { val: 'tunnelise', label: 'Cathéter tunnélisé' },
              ] as { val: 'simple' | 'tunnelise'; label: string }[]).map(opt => (
                <button key={opt.val}
                  onClick={() => setForm(f => ({ ...f, typeAcces: opt.val }))}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    form.typeAcces === opt.val
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}>
                  {form.typeAcces === opt.val ? '☑' : '☐'} {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Bloc 3 : Désinfection ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5">
        <SectionTitle>Mode de Désinfection</SectionTitle>
        <div className="flex gap-3">
          {([
            { val: 'acide',    label: 'Acide citrique / Chaleur', icon: 'thermostat' },
            { val: 'chimique', label: 'Désinfection chimique',     icon: 'science'    },
          ] as { val: 'acide' | 'chimique'; label: string; icon: string }[]).map(opt => (
            <button key={opt.val}
              onClick={() => setForm(f => ({ ...f, desinfection: opt.val }))}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                form.desinfection === opt.val
                  ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
              }`}>
              <span className="material-symbols-outlined text-base">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Bloc 4 : Paramètres ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <SectionTitle>Dialysat — Conductivité Programmée</SectionTitle>
            <ParamRow label="Na (sodium)"    unit="mmol/L" value={form.na}           onChange={set('na')}           placeholder="138" step="0.1" />
            <ParamRow label="Bicar"          unit="mmol/L" value={form.bicar}         onChange={set('bicar')}         placeholder="32"  step="0.1" />
            <ParamRow label="Profil Na"      unit=""       value={form.profilNa}      onChange={set('profilNa')}      type="text" placeholder="—" />
            <ParamRow label="Profil UF"      unit=""       value={form.profilUF}      onChange={set('profilUF')}      type="text" placeholder="—" />
            <div className="my-3 border-t border-dashed border-slate-100" />
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Valeurs standard</p>
            <ParamRow label="K (potassium)"  unit="mmol/L" value={form.k}            onChange={set('k')}            step="0.1" isDefault />
            <ParamRow label="Ca (calcium)"   unit="mmol/L" value={form.ca}           onChange={set('ca')}           step="0.1" isDefault />
            <ParamRow label="T° dialysat"    unit="°C"     value={form.tempDialysat} onChange={set('tempDialysat')} step="0.1" isDefault />
            <ParamRow label="Débit dialysat" unit="ml/min" value={form.debitDialysat}onChange={set('debitDialysat')}step="10"  isDefault />
          </div>
          <div>
            <SectionTitle>Séance & Ultrafiltration</SectionTitle>
            <ParamRow label="Débit pompe sang"    unit="ml/min" value={form.debitPompe}    onChange={set('debitPompe')}    placeholder="250" step="10" />
            <ParamRow label="Durée prescrite"     unit="h"      value={form.dureePrescrite} onChange={set('dureePrescrite')} type="text" placeholder="4h00" />
            <ParamRow label="Durée réalisée"      unit="h"      value={form.dureeRealisee}  onChange={set('dureeRealisee')}  type="text" placeholder="—" />
            <ParamRow label="Heure début HD"      unit=""       value={form.heureDebut}     onChange={set('heureDebut')}     type="time" />
            <ParamRow label="Heure fin HD"        unit=""       value={form.heureFin}       onChange={set('heureFin')}       type="time" />
            <div className="my-3 border-t border-dashed border-slate-100" />
            <ParamRow label="Poids sec"           unit="kg"     value={form.poidsSec}       onChange={set('poidsSec')}       placeholder="65.0" step="0.1" />
            <ParamRow label="Poids à perdre (UF)" unit="kg"     value={form.poidsAPerdre}   onChange={set('poidsAPerdre')}   placeholder="2.5"  step="0.1" />
            <ParamRow label="UF/heure max"        unit="kg/h"   value={form.ufHeureMax}     onChange={set('ufHeureMax')}     placeholder="1.0"  step="0.1" />
            <ParamRow label="UF total obtenu"     unit="kg"     value={form.ufTotalObtenu}  onChange={set('ufTotalObtenu')}  placeholder="—"    step="0.1" />
          </div>
        </div>
      </motion.div>

      {/* ── Bloc 5 : Bilan ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5">
        <SectionTitle>Bilan</SectionTitle>
        <textarea value={form.bilan} onChange={e => set('bilan')(e.target.value)}
          placeholder="Observations médicales, incidents de séance, tolérance du patient..." rows={4}
          className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-y" />
      </motion.div>

      {/* ── Actions ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="flex items-center justify-end gap-3 pb-6">
        <button onClick={() => setForm({ ...DEFAULT_FORM, date: new Date().toISOString().split('T')[0] })}
          className="px-5 py-2.5 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
          Réinitialiser
        </button>
        <button onClick={() => window.print()}
          className="px-5 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer">
          <span className="material-symbols-outlined text-base">print</span>Imprimer
        </button>

        {/* ✅ Bouton Enregistrer fonctionnel */}
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving' || saveStatus === 'success'}
          className={`px-6 py-2.5 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-70 ${
            saveStatus === 'success'
              ? 'bg-emerald-600'
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
          }`}>
          {saveStatus === 'saving' && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {saveStatus === 'success' && <span className="material-symbols-outlined text-base">check_circle</span>}
          {saveStatus === 'idle'    && <span className="material-symbols-outlined text-base">save</span>}
          {saveStatus === 'error'   && <span className="material-symbols-outlined text-base">error</span>}
          {saveStatus === 'saving'  ? 'Enregistrement...' :
           saveStatus === 'success' ? 'Enregistré ✓'     :
           saveStatus === 'error'   ? 'Réessayer'         :
           'Enregistrer la prescription'}
        </button>
      </motion.div>

      {/* ── Toast ── */}
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
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConductiviteInner />
    </Suspense>
  );
}
