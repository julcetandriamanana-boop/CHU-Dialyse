'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { InfirmierProfil, getInfirmierActif } from '@/src/components/profil/InfirmierProfilModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Patient { id: number; nom: string; prenom: string; }
interface RdvInfo { date_heure: string; statut_seance: string; }

interface SoinsForm {
  acces_type: string;
  acces_fistule: string;
  acces_thrill_bruit: string;
  acces_rougeur: string;
  acces_douleur: string;
  acces_debit_sanguin: string;
  acces_observation: string;

  ponction_antiseptique: string;
  ponction_rougeur: string;
  ponction_saignement: string;
  ponction_douleur: string;
  ponction_site: string;
  ponction_observation: string;

  pansement_heure_retrait: string;
  pansement_compression: string;
  pansement_hemostase: string;
  pansement_saignement_arrete: string;
  pansement_type: string;
  pansement_observation: string;

  validation_infirmier: boolean;
  validation_medecin: boolean;
  infirmier_nom: string;
}

const DEFAULT_FORM: SoinsForm = {
  acces_type: '', acces_fistule: '', acces_thrill_bruit: '', acces_rougeur: '',
  acces_douleur: '', acces_debit_sanguin: '', acces_observation: '',
  ponction_antiseptique: '', ponction_rougeur: '', ponction_saignement: '',
  ponction_douleur: '', ponction_site: '', ponction_observation: '',
  pansement_heure_retrait: '', pansement_compression: '', pansement_hemostase: '',
  pansement_saignement_arrete: '', pansement_type: '', pansement_observation: '',
  validation_infirmier: false, validation_medecin: false, infirmier_nom: '',
};

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';
type EtapeNum = 1 | 2 | 3 | 4;

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

// Composant bouton de sélection (radio visuel)
function RadioButton({
  options, value, onChange, color = 'emerald',
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  color?: 'emerald' | 'blue' | 'amber' | 'red';
}) {
  const colorMap = {
    emerald: { active: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200 border-emerald-600', text: 'text-emerald-700' },
    blue:    { active: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200 border-blue-600', text: 'text-blue-700' },
    amber:   { active: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-200 border-amber-600', text: 'text-amber-700' },
    red:     { active: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md shadow-red-200 border-red-600', text: 'text-red-700' },
  }[color];
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(opt => (
        <motion.button
          key={opt}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer ${
            value === opt
              ? colorMap.active
              : `bg-white border-slate-200 ${colorMap.text} hover:border-slate-400`
          }`}
        >
          {value === opt && '✓ '}{opt}
        </motion.button>
      ))}
    </div>
  );
}

function SoinsInner() {
  const searchParams = useSearchParams();
  const patientId    = searchParams.get('patientId');
  const rdvId        = searchParams.get('rendezVousId');
  const seanceNum    = searchParams.get('seanceNum') || '1';

  const [patient, setPatient]       = useState<Patient | null>(null);
  const [rdv, setRdv]               = useState<RdvInfo | null>(null);
  const [form, setForm]             = useState<SoinsForm>(DEFAULT_FORM);
  const [soinsId, setSoinsId]       = useState<number | null>(null);
  const [loading, setLoading]       = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [etape, setEtape]           = useState<EtapeNum>(1);
  const [toast, setToast]           = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [infirmier, setInfirmier] = useState<InfirmierProfil | null>(null);

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

        const sRes = await fetch(`${API_URL}/soins/seance/${rdvId}`);
        if (sRes.ok) {
          const data = await sRes.json();
          if (data) {
            setSoinsId(data.id);
            setForm({
              acces_type:                   data.acces_type || '',
              acces_fistule:                data.acces_fistule || '',
              acces_thrill_bruit:           data.acces_thrill_bruit || '',
              acces_rougeur:                data.acces_rougeur || '',
              acces_douleur:                data.acces_douleur || '',
              acces_debit_sanguin:          data.acces_debit_sanguin || '',
              acces_observation:            data.acces_observation || '',
              ponction_antiseptique:        data.ponction_antiseptique || '',
              ponction_rougeur:             data.ponction_rougeur || '',
              ponction_saignement:          data.ponction_saignement || '',
              ponction_douleur:             data.ponction_douleur || '',
              ponction_site:                data.ponction_site || '',
              ponction_observation:         data.ponction_observation || '',
              pansement_heure_retrait:      data.pansement_heure_retrait || '',
              pansement_compression:        data.pansement_compression || '',
              pansement_hemostase:          data.pansement_hemostase || '',
              pansement_saignement_arrete:  data.pansement_saignement_arrete || '',
              pansement_type:               data.pansement_type || '',
              pansement_observation:        data.pansement_observation || '',
              validation_infirmier:         data.validation_infirmier ?? false,
              validation_medecin:           data.validation_medecin ?? false,
              infirmier_nom:                data.infirmier_nom || '',
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
      setForm(f => ({ ...f, infirmier_nom: inf.nom_complet }));
    }
  }, []);

  const set = (key: keyof SoinsForm) => (val: any) =>
    setForm(f => ({ ...f, [key]: val }));

  const handleSave = async (showMsg = true) => {
    if (!rdvId || !patientId) {
      showToast('Aucun patient ou rendez-vous lié', 'error');
      return null;
    }
    setSaveStatus('saving');
    try {
      const body = {
        rendez_vous_id: parseInt(rdvId),
        patient_id:     parseInt(patientId),
        ...form,
      };
      const res = await fetch(`${API_URL}/soins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setSoinsId(data.id);
        setSaveStatus('success');
        if (showMsg) showToast('✅ Soins enregistrés', 'success');
        setTimeout(() => setSaveStatus('idle'), 2500);
        return data;
      } else {
        throw new Error('Erreur serveur');
      }
    } catch {
      setSaveStatus('error');
      showToast('❌ Erreur lors de l\'enregistrement', 'error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return null;
    }
  };

  // Valider final → notifie médecin
  const handleValiderFinal = async () => {
    const saved = await handleSave(false);
    if (!saved) return;
    try {
      const res = await fetch(`${API_URL}/soins/${saved.id}/valider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ infirmier_nom: form.infirmier_nom || 'Infirmier(e)' }),
      });
      if (res.ok) {
        const updated = await res.json();
        setForm(f => ({ ...f, validation_infirmier: true }));
        playBipSuccess();
        showToast('✅ Soins validés — notification envoyée au médecin', 'success');
      }
    } catch {
      showToast('❌ Erreur validation', 'error');
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

  // Statut complétude de chaque étape
  const etape1Done = !!form.acces_type;
  const etape2Done = !!form.ponction_antiseptique;
  const etape3Done = !!form.pansement_heure_retrait;
  const etape4Done = form.validation_infirmier;

  const onglets = [
    { num: 1 as EtapeNum, titre: 'Accès vasculaire',  icon: 'bloodtype',        grad: 'from-blue-500 to-indigo-600',    ring: 'ring-blue-300',    done: etape1Done },
    { num: 2 as EtapeNum, titre: 'Site ponction',     icon: 'sanitizer',        grad: 'from-emerald-500 to-teal-600',   ring: 'ring-emerald-300', done: etape2Done },
    { num: 3 as EtapeNum, titre: 'Pansement',         icon: 'healing',          grad: 'from-amber-500 to-orange-600',   ring: 'ring-amber-300',   done: etape3Done },
    { num: 4 as EtapeNum, titre: 'Validation',        icon: 'verified',         grad: 'from-violet-500 to-purple-600',  ring: 'ring-violet-300',  done: etape4Done },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 p-6 space-y-5 max-w-6xl mx-auto">

      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl shadow-xl shadow-emerald-200/40 p-5 flex items-center justify-between flex-wrap gap-3"
      >
        <div className="text-white">
          <h1 className="text-xl md:text-2xl font-black flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">medical_services</span>
            Soins infirmiers et pansements
          </h1>
          <p className="text-xs md:text-sm text-emerald-100 mt-1 font-semibold">
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

      {/* ONGLETS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg shadow-emerald-100/40 border border-emerald-100/50 p-3"
      >
        <div className="grid grid-cols-4 gap-2">
          {onglets.map((o) => (
            <motion.button
              key={o.num}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setEtape(o.num)}
              className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer ${
                etape === o.num
                  ? `bg-gradient-to-br ${o.grad} text-white shadow-xl ring-4 ${o.ring} border-transparent`
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 justify-center">
                <span className={`material-symbols-outlined text-lg ${etape === o.num ? 'text-white' : ''}`}>
                  {o.done && etape !== o.num ? 'check_circle' : o.icon}
                </span>
                <div className="text-left">
                  <p className="text-[9px] font-bold opacity-70">ÉTAPE {o.num}</p>
                  <p className="text-xs font-black leading-tight">{o.titre}</p>
                </div>
              </div>
              {o.done && etape !== o.num && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-white" />
              )}
            </motion.button>
          ))}
        </div>

        {/* Barre progression */}
        <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((etape - 1) / 3) * 100}%` }}
            transition={{ type: 'spring', stiffness: 150 }}
            className={`h-full rounded-full bg-gradient-to-r ${onglets[etape - 1].grad}`}
          />
        </div>
      </motion.div>

      {/* CONTENU ONGLETS */}
      <AnimatePresence mode="wait">
        <motion.div
          key={etape}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="bg-white rounded-2xl shadow-lg shadow-slate-100/40 border border-slate-100/50 p-6"
        >
          {/* ÉTAPE 1 — Accès vasculaire */}
          {etape === 1 && (
            <div className="space-y-5">
              <h2 className="text-base font-black text-blue-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">bloodtype</span>
                Accès vasculaire
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Type accès</label>
                  <RadioButton options={['FAV', 'Cathéter']} value={form.acces_type} onChange={set('acces_type')} color="blue" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Fistule</label>
                  <RadioButton options={['Bras gauche', 'Bras droit']} value={form.acces_fistule} onChange={set('acces_fistule')} color="blue" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Thrill / Bruit</label>
                  <RadioButton options={['Présent', 'Absent']} value={form.acces_thrill_bruit} onChange={set('acces_thrill_bruit')} color="emerald" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Rougeur</label>
                  <RadioButton options={['Oui', 'Non']} value={form.acces_rougeur} onChange={set('acces_rougeur')} color="amber" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Douleur</label>
                  <RadioButton options={['Aucune', 'Légère', 'Modérée', 'Forte']} value={form.acces_douleur} onChange={set('acces_douleur')} color="red" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Débit sanguin</label>
                  <RadioButton options={['Bon', 'Moyen', 'Mauvais']} value={form.acces_debit_sanguin} onChange={set('acces_debit_sanguin')} color="emerald" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Observation</label>
                <textarea
                  value={form.acces_observation}
                  onChange={e => set('acces_observation')(e.target.value)}
                  rows={3}
                  placeholder="Accès en bon état..."
                  className="w-full px-3 py-2 text-sm border-2 border-blue-100 rounded-xl bg-blue-50/30 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* ÉTAPE 2 — Site ponction */}
          {etape === 2 && (
            <div className="space-y-5">
              <h2 className="text-base font-black text-emerald-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">sanitizer</span>
                Site ponction
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Antiseptique utilisé</label>
                  <input
                    type="text"
                    placeholder="Ex : Chlorhexidine"
                    value={form.ponction_antiseptique}
                    onChange={e => set('ponction_antiseptique')(e.target.value)}
                    className="w-full px-3 py-2 text-sm border-2 border-emerald-100 rounded-xl bg-emerald-50/30 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">État du site</label>
                  <input
                    type="text"
                    placeholder="Ex : Propre et sec"
                    value={form.ponction_site}
                    onChange={e => set('ponction_site')(e.target.value)}
                    className="w-full px-3 py-2 text-sm border-2 border-emerald-100 rounded-xl bg-emerald-50/30 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Rougeur</label>
                  <RadioButton options={['Oui', 'Non']} value={form.ponction_rougeur} onChange={set('ponction_rougeur')} color="amber" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Saignement</label>
                  <RadioButton options={['Oui', 'Non']} value={form.ponction_saignement} onChange={set('ponction_saignement')} color="red" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Douleur</label>
                  <RadioButton options={['Aucune', 'Légère', 'Modérée', 'Forte']} value={form.ponction_douleur} onChange={set('ponction_douleur')} color="red" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Observation</label>
                <textarea
                  value={form.ponction_observation}
                  onChange={e => set('ponction_observation')(e.target.value)}
                  rows={3}
                  placeholder="Site propre et sec..."
                  className="w-full px-3 py-2 text-sm border-2 border-emerald-100 rounded-xl bg-emerald-50/30 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* ÉTAPE 3 — Pansement */}
          {etape === 3 && (
            <div className="space-y-5">
              <h2 className="text-base font-black text-amber-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">healing</span>
                Pansement post-dialyse
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Heure retrait aiguille</label>
                  <input
                    type="time"
                    value={form.pansement_heure_retrait}
                    onChange={e => set('pansement_heure_retrait')(e.target.value)}
                    className="w-full px-3 py-2 text-sm border-2 border-amber-100 rounded-xl bg-amber-50/30 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Hémostase (temps)</label>
                  <input
                    type="text"
                    placeholder="Ex : 8 min"
                    value={form.pansement_hemostase}
                    onChange={e => set('pansement_hemostase')(e.target.value)}
                    className="w-full px-3 py-2 text-sm border-2 border-amber-100 rounded-xl bg-amber-50/30 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Compression effectuée</label>
                  <RadioButton options={['Oui', 'Non']} value={form.pansement_compression} onChange={set('pansement_compression')} color="emerald" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Saignement arrêté</label>
                  <RadioButton options={['Oui', 'Non']} value={form.pansement_saignement_arrete} onChange={set('pansement_saignement_arrete')} color="emerald" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type pansement</label>
                  <input
                    type="text"
                    placeholder="Ex : Compresse stérile"
                    value={form.pansement_type}
                    onChange={e => set('pansement_type')(e.target.value)}
                    className="w-full px-3 py-2 text-sm border-2 border-amber-100 rounded-xl bg-amber-50/30 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Observation</label>
                <textarea
                  value={form.pansement_observation}
                  onChange={e => set('pansement_observation')(e.target.value)}
                  rows={3}
                  placeholder="Pansement bien fait..."
                  className="w-full px-3 py-2 text-sm border-2 border-amber-100 rounded-xl bg-amber-50/30 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* ÉTAPE 4 — Validation */}
          {etape === 4 && (
            <div className="space-y-5">
              <h2 className="text-base font-black text-violet-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">verified</span>
                Validation & Historique
              </h2>

              {/* Récap des 3 étapes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { titre: 'Accès vasculaire', done: etape1Done, color: 'blue',    bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700' },
                  { titre: 'Site ponction',    done: etape2Done, color: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
                  { titre: 'Pansement',        done: etape3Done, color: 'amber',   bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700' },
                ].map((s, i) => (
                  <div key={i} className={`${s.bg} ${s.border} border-2 rounded-xl p-3 flex items-center gap-2`}>
                    <span className={`material-symbols-outlined ${s.text} text-2xl`}>
                      {s.done ? 'check_circle' : 'pending'}
                    </span>
                    <div>
                      <p className={`text-[10px] font-bold ${s.text} opacity-70 uppercase`}>Étape {i + 1}</p>
                      <p className={`text-xs font-black ${s.text}`}>{s.titre}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{s.done ? '✓ Complété' : 'En attente'}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Infirmier nom */}
              <div>
                <label className="block text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">person</span>
                  Infirmier(e) en charge
                </label>
                <input
                  type="text"
                  placeholder="Ex : Harisoa M."
                  value={form.infirmier_nom}
                  onChange={e => set('infirmier_nom')(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm font-semibold border-2 border-violet-100 rounded-xl bg-violet-50/30 focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100 transition-all"
                />
              </div>

              {/* Statuts validation */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-xl border-2 ${form.validation_infirmier ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Validation infirmier</p>
                  <p className={`text-sm font-black mt-1 flex items-center gap-1 ${form.validation_infirmier ? 'text-emerald-700' : 'text-slate-400'}`}>
                    <span className="material-symbols-outlined text-base">
                      {form.validation_infirmier ? 'check_circle' : 'pending'}
                    </span>
                    {form.validation_infirmier ? 'Validé' : 'En attente'}
                  </p>
                </div>
                <div className={`p-4 rounded-xl border-2 ${form.validation_medecin ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Validation médecin</p>
                  <p className={`text-sm font-black mt-1 flex items-center gap-1 ${form.validation_medecin ? 'text-emerald-700' : 'text-slate-400'}`}>
                    <span className="material-symbols-outlined text-base">
                      {form.validation_medecin ? 'check_circle' : 'pending'}
                    </span>
                    {form.validation_medecin ? 'Validé' : 'En attente'}
                  </p>
                </div>
              </div>

              {/* Bouton validation finale */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleValiderFinal}
                disabled={form.validation_infirmier}
                animate={!form.validation_infirmier ? {
                  boxShadow: [
                    '0 0 0 0 rgba(16, 185, 129, 0.4)',
                    '0 0 0 12px rgba(16, 185, 129, 0)',
                  ],
                } : {}}
                transition={{ duration: 1.5, repeat: form.validation_infirmier ? 0 : Infinity }}
                className={`w-full py-4 text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  form.validation_infirmier
                    ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-200 hover:shadow-2xl'
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {form.validation_infirmier ? 'check_circle' : 'verified'}
                </span>
                {form.validation_infirmier ? 'Soins validés — médecin notifié ✓' : 'Valider tous les soins'}
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* NAVIGATION ENTRE ONGLETS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between gap-3 pb-6 flex-wrap"
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setEtape((Math.max(1, etape - 1)) as EtapeNum)}
          disabled={etape === 1}
          className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Précédent
        </motion.button>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSave(true)}
            disabled={saveStatus === 'saving'}
            className={`px-5 py-2.5 text-xs font-black text-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-70 shadow-lg ${
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

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setEtape((Math.min(4, etape + 1)) as EtapeNum)}
          disabled={etape === 4}
          className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-md shadow-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2"
        >
          Suivant
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}

export default function StitchSoins() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SoinsInner />
    </Suspense>
  );
}