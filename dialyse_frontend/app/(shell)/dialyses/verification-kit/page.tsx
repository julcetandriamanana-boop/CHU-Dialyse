'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface KitItem {
  name: string;
  qty: string | number;
  prixUnit: string;
  montant: string;
}

type SeanceType = 'premiere' | 'suivante';
type SectionStatus = 'idle' | 'saving' | 'vu';

const KIT_PREMIERE: KitItem[] = [
  { name: 'Acide non glucose 10l', qty: 1, prixUnit: '', montant: '' },
  { name: 'Betadine jaune', qty: 1, prixUnit: '', montant: '' },
  { name: 'Betadine rouge', qty: 1, prixUnit: '', montant: '' },
  { name: 'Heparine ou Lovenox', qty: 2, prixUnit: '', montant: '' },
  { name: 'Lidocaine 2%', qty: 2, prixUnit: '', montant: '' },
  { name: 'Compresse sterile 40X40', qty: '6 boites', prixUnit: '', montant: '' },
  { name: 'Fil a peau', qty: 1, prixUnit: '', montant: '' },
  { name: "Gant d'examen non sterile", qty: 6, prixUnit: '', montant: '' },
  { name: 'Gant sterile 7', qty: 6, prixUnit: '', montant: '' },
  { name: 'Ligne artero-veineuse', qty: 1, prixUnit: '', montant: '' },
  { name: 'Masque chirurgical', qty: 6, prixUnit: '', montant: '' },
  { name: 'Rein artificiel (Dialyseur) F6/F7/F8', qty: 1, prixUnit: '', montant: '' },
  { name: 'Seringue 10cc', qty: 6, prixUnit: '', montant: '' },
  { name: 'Seringue 20cc', qty: 6, prixUnit: '', montant: '' },
  { name: 'Seringue 5cc', qty: 6, prixUnit: '', montant: '' },
  { name: 'SSI 9 pour mille', qty: 1, prixUnit: '', montant: '' },
  { name: 'Catheter double voie', qty: 1, prixUnit: '', montant: '' },
  { name: 'Dakin', qty: 1, prixUnit: '', montant: '' },
  { name: 'Perfuseur', qty: 1, prixUnit: '', montant: '' },
  { name: 'Solucart 750g', qty: 1, prixUnit: '', montant: '' },
];

const KIT_SUIVANTE: KitItem[] = [
  { name: 'Acide non glucose', qty: 1, prixUnit: '', montant: '' },
  { name: 'Lovenox 4000 UI', qty: 3, prixUnit: '', montant: '' },
  { name: 'Compresse sterile 40X40', qty: '2 boites', prixUnit: '', montant: '' },
  { name: "Gant d'examen non sterile", qty: 6, prixUnit: '', montant: '' },
  { name: 'Gant sterile 7/0', qty: 6, prixUnit: '', montant: '' },
  { name: 'Masque chirurgicale', qty: 6, prixUnit: '', montant: '' },
  { name: 'Rein artificiel (Dialyseur) F7/F8', qty: 1, prixUnit: '', montant: '' },
  { name: 'Seringue 10cc', qty: 6, prixUnit: '', montant: '' },
  { name: 'Seringue 20cc', qty: 6, prixUnit: '', montant: '' },
  { name: 'Seringue 5cc', qty: 6, prixUnit: '', montant: '' },
  { name: 'SSI 500ml', qty: 4, prixUnit: '', montant: '' },
  { name: 'Ligne artero-veineuse', qty: 1, prixUnit: '', montant: '' },
  { name: 'Solucart', qty: 1, prixUnit: '', montant: '' },
  { name: 'Dakin', qty: 1, prixUnit: '', montant: '' },
  { name: 'Perfuseur', qty: 1, prixUnit: '', montant: '' },
];

const KIT_SOIN: KitItem[] = [
  { name: 'SSI 500 ml', qty: '06 flacons', prixUnit: '', montant: '' },
  { name: 'Dakin 125ml', qty: '01', prixUnit: '', montant: '' },
  { name: 'Securifixe 10x25cm', qty: '02', prixUnit: '', montant: '' },
  { name: 'Calot chirurgical', qty: '06', prixUnit: '', montant: '' },
  { name: 'Catheter double voie pour dialyse', qty: '01', prixUnit: '', montant: '' },
  { name: 'Solucart 750g', qty: '01', prixUnit: '', montant: '' },
  { name: 'Rasoirs (epicerie)', qty: '01', prixUnit: '', montant: '' },
  { name: 'Perfuseurs', qty: '01', prixUnit: '', montant: '' },
];

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


function KitTable({ rows, onChange }: {
  rows: KitItem[];
  onChange: (idx: number, field: keyof KitItem, val: string) => void;
}) {
  const total = rows.reduce((acc, r) => acc + (parseFloat(r.montant) || 0), 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-cyan-100 via-blue-100 to-indigo-100 border-b-2 border-blue-200">
            <th className="px-4 py-3 text-[10px] font-black text-blue-900 uppercase tracking-wider text-left">Designation</th>
            <th className="px-3 py-3 text-[10px] font-black text-blue-900 uppercase tracking-wider w-24 text-center">Quantite</th>
            <th className="px-3 py-3 text-[10px] font-black text-blue-900 uppercase tracking-wider w-32 text-center">Prix unit. (Ar)</th>
            <th className="px-3 py-3 text-[10px] font-black text-blue-900 uppercase tracking-wider w-32 text-center">Montant (Ar)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <motion.tr key={i}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.025, type: 'spring', stiffness: 200 }}
              className={`border-b border-slate-100 hover:bg-blue-50/40 transition-colors ${i % 2 === 0 ? 'bg-slate-50/30' : 'bg-white'}`}>
              <td className="px-4 py-2.5 text-xs font-semibold text-slate-700">{row.name}</td>
              <td className="px-3 py-2.5">
                <input type="text" value={row.qty}
                  onChange={e => onChange(i, 'qty', e.target.value)}
                  className="w-full px-2 py-1.5 text-xs font-bold text-center border-2 border-cyan-100 rounded-lg bg-cyan-50/30 focus:outline-none focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 transition-all" />
              </td>
              <td className="px-3 py-2.5">
                <input type="number" value={row.prixUnit} placeholder="0"
                  onChange={e => {
                    onChange(i, 'prixUnit', e.target.value);
                    const qty = parseFloat(String(row.qty)) || 0;
                    const pu  = parseFloat(e.target.value) || 0;
                    onChange(i, 'montant', String(qty * pu));
                  }}
                  className="w-full px-2 py-1.5 text-xs font-semibold text-right border-2 border-blue-100 rounded-lg bg-blue-50/30 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all" />
              </td>
              <td className="px-3 py-2.5">
                <input type="number" value={row.montant} placeholder="0"
                  onChange={e => onChange(i, 'montant', e.target.value)}
                  className="w-full px-2 py-1.5 text-xs font-semibold text-right border-2 border-indigo-100 rounded-lg bg-indigo-50/30 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all" />
              </td>
            </motion.tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-blue-300 bg-gradient-to-r from-cyan-50 to-blue-50">
            <td colSpan={3} className="px-4 py-3 text-xs font-black text-blue-700 text-right uppercase tracking-wider">Total</td>
            <td className="px-3 py-3 text-right">
              <span className="text-sm font-black text-blue-700 bg-white px-3 py-1 rounded-lg border-2 border-blue-300 shadow-sm">
                {total.toLocaleString('fr-MG')} Ar
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function VuCard({ title, onReopen }: { title: string; onReopen: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-300 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-lg shadow-emerald-100/50"
    >
      <motion.div
        animate={{ boxShadow: ['0 0 0 0 rgba(16,185,129,0.4)', '0 0 0 12px rgba(16,185,129,0)'] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200 flex-shrink-0"
      >
        <span className="material-symbols-outlined text-white text-xl">check_circle</span>
      </motion.div>
      <div className="flex-1">
        <p className="text-sm font-black text-emerald-800">{title}</p>
        <p className="text-[10px] text-emerald-600 mt-0.5 font-semibold">Enregistre en base de donnees</p>
      </div>
      <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black rounded-full shadow-md shadow-emerald-200">VU</span>
      <button onClick={onReopen}
        className="text-emerald-600 hover:text-emerald-800 p-1.5 hover:bg-emerald-100 rounded-lg cursor-pointer transition-colors"
        title="Rouvrir">
        <span className="material-symbols-outlined text-base">expand_more</span>
      </button>
    </motion.div>
  );
}


function KitSection({ icon, title, sub, gradient, accent, rows, onChangeRow, onReset, status, onVu }: {
  icon: string;
  title: string;
  sub: string;
  gradient: string;
  accent: 'blue' | 'emerald' | 'amber';
  rows: KitItem[];
  onChangeRow: (i: number, f: keyof KitItem, v: string) => void;
  onReset: () => void;
  status: SectionStatus;
  onVu: () => void;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (status === 'vu') setOpen(false);
  }, [status]);

  const btnGrad = {
    blue:    'from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-blue-200',
    emerald: 'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-200',
    amber:   'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-200',
  }[accent];

  if (status === 'vu' && !open) {
    return <VuCard title={title} onReopen={() => setOpen(true)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="bg-white rounded-2xl shadow-xl shadow-blue-100/40 border border-blue-100/50 overflow-hidden"
    >
      <div className={`bg-gradient-to-r ${gradient} px-5 py-4 flex items-center gap-3`}>
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
          <span className="material-symbols-outlined text-white text-xl">{icon}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-black text-white">{title}</p>
          <p className="text-[10px] text-white/80 mt-0.5 font-semibold">{sub}</p>
        </div>
        {status === 'vu' && (
          <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-black rounded-full border border-white/30">VU</span>
        )}
        <button onClick={() => setOpen(o => !o)}
          className="p-1.5 hover:bg-white/20 rounded-lg cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-white text-lg">
            {open ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <KitTable rows={rows} onChange={onChangeRow} />
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/50">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onReset}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-400 transition-all cursor-pointer"
              >
                Reinitialiser
              </motion.button>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-bold text-cyan-700 bg-cyan-50 border-2 border-cyan-200 rounded-xl hover:bg-cyan-100 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  Imprimer
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onVu}
                  disabled={status === 'saving'}
                  className={`px-5 py-2 text-xs font-black text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-60 bg-gradient-to-r ${btnGrad}`}
                >
                  {status === 'saving' ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      Vu
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
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


function VerificationKitInner() {
  const searchParams   = useSearchParams();
  const patientIdParam = searchParams.get('patientId');
  const seanceNumRaw   = searchParams.get('seanceNum');
  const seanceNum      = parseInt(seanceNumRaw || '1');
  const rdvId          = searchParams.get('rendezVousId');

  const [seanceType, setSeanceType] = useState<SeanceType>(seanceNum > 1 ? 'suivante' : 'premiere');

  const [patient, setPatient] = useState({
    nom: '', age: '', sexe: 'M', adresse: '',
    service: 'Hemodialyse',
    date: new Date().toISOString().split('T')[0],
  });

  const [rows1, setRows1]       = useState<KitItem[]>(KIT_PREMIERE.map((i) => ({ ...i })));
  const [rows2, setRows2]       = useState<KitItem[]>(KIT_SUIVANTE.map((i) => ({ ...i })));
  const [rowsSoin, setRowsSoin] = useState<KitItem[]>(KIT_SOIN.map((i) => ({ ...i })));

  const [status1, setStatus1]       = useState<SectionStatus>('idle');
  const [status2, setStatus2]       = useState<SectionStatus>('idle');
  const [statusSoin, setStatusSoin] = useState<SectionStatus>('idle');

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!patientIdParam) return;
    fetch(`${API_URL}/patients/${patientIdParam}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.nom) {
          setPatient((p) => ({
            ...p,
            nom: `${data.prenom || ''} ${data.nom || ''}`.trim(),
            age: data.age || '',
            adresse: data.adresse || '',
          }));
        }
      })
      .catch(() => {});
  }, [patientIdParam]);

  const goBack = () => {
    window.location.href = `/dialyses/section-medecin?patientId=${patientIdParam || ''}&rendezVousId=${rdvId || ''}&seanceNum=${seanceNum}`;
  };

  const updateRow = (
    setter: React.Dispatch<React.SetStateAction<KitItem[]>>,
    idx: number,
    field: keyof KitItem,
    val: string,
  ) => {
    setter((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));
  };

  const handleVu = async (
    rows: KitItem[],
    kitLabel: string,
    setStatus: React.Dispatch<React.SetStateAction<SectionStatus>>,
  ) => {
    if (!patientIdParam) {
      showToast('Aucun patient lie', 'error');
      return;
    }
    setStatus('saving');
    try {
      const promises = rows
        .filter((r) => r.name && String(r.qty).trim() !== '')
        .map((row) =>
          fetch(`${API_URL}/prescriptions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              patient: { id: parseInt(patientIdParam) },
              medicament: row.name,
              dosage: String(row.qty),
              frequence: kitLabel,
              date_prescription: patient.date || new Date().toISOString().split('T')[0],
              workflow_statut: 'actif',
            }),
          }),
        );
      const results = await Promise.all(promises);
      if (!results.every((r) => r.ok)) throw new Error('Erreur');
      setStatus('vu');
      playBipSuccess();
      showToast(`Kit "${kitLabel}" enregistre`, 'success');
    } catch {
      setStatus('idle');
      showToast("Erreur enregistrement", 'error');
    }
  };

  const isPremiereSeance = seanceType === 'premiere';
  const allVu = isPremiereSeance
    ? status1 === 'vu' && statusSoin === 'vu'
    : status2 === 'vu';


  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50/30 via-blue-50/20 to-indigo-50/20 p-6 space-y-5 max-w-6xl mx-auto">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 rounded-2xl shadow-xl shadow-blue-200/40 p-5 flex items-center justify-between flex-wrap gap-3"
      >
        <div className="text-white">
          <h1 className="text-xl md:text-2xl font-black flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">vaccines</span>
            Verification Kit
          </h1>
          <p className="text-xs md:text-sm text-blue-100 mt-1 font-semibold">
            Ordonnance hemodialyse - CHU Andrainjato
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
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
            : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300'
        }`}
      >
        <span className={`material-symbols-outlined text-lg ${patientIdParam ? 'text-blue-500' : 'text-amber-500'}`}>
          {patientIdParam ? 'person' : 'warning'}
        </span>
        <span className={`text-sm font-bold ${patientIdParam ? 'text-blue-800' : 'text-amber-800'}`}>
          {patientIdParam
            ? `Patient ID #${patientIdParam}${patient.nom ? ' - ' + patient.nom : ''} - Seance N${seanceNum}`
            : 'Aucun patient lie - revenez depuis les choix medecin'
          }
        </span>
      </motion.div>

      {/* TOGGLE TYPE SEANCE */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl shadow-lg shadow-cyan-100/40 border border-cyan-100/50 p-4 flex items-center gap-4 flex-wrap"
      >
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-200">
            <span className="material-symbols-outlined text-white text-lg">tune</span>
          </div>
          <span className="text-sm font-bold text-slate-700">Type de seance :</span>
        </div>

        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {(['premiere', 'suivante'] as SeanceType[]).map(t => (
            <motion.button
              key={t}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSeanceType(t)}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                seanceType === t
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'premiere' ? '1ere seance' : 'Seances suivantes'}
            </motion.button>
          ))}
        </div>

        <span className={`ml-auto px-3 py-1.5 rounded-full text-[10px] font-black border-2 ${
          isPremiereSeance
            ? 'bg-blue-50 text-blue-700 border-blue-300'
            : 'bg-emerald-50 text-emerald-700 border-emerald-300'
        }`}>
          {isPremiereSeance ? '1ERE SEANCE ACTIVE' : 'SEANCES SUIVANTES ACTIVES'}
        </span>
      </motion.div>

      {/* INFOS PATIENT */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg shadow-blue-100/40 border border-blue-100/50 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 px-5 py-3">
          <h2 className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-base">badge</span>
            Informations Patient
          </h2>
        </div>

        <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Nom et Prenoms',   key: 'nom',     type: 'text',   ph: 'Rakoto Jean'   },
            { label: 'Age',              key: 'age',     type: 'number', ph: '45'            },
            { label: 'Adresse',          key: 'adresse', type: 'text',   ph: 'Fianarantsoa'  },
            { label: 'Service',          key: 'service', type: 'text',   ph: 'Hemodialyse'   },
            { label: "Date ordonnance",  key: 'date',    type: 'date',   ph: ''              },
          ].map(f => (
            <motion.div key={f.key} whileHover={{ y: -2 }}>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{f.label}</label>
              <input type={f.type} placeholder={f.ph}
                value={(patient as any)[f.key]}
                onChange={e => setPatient(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-3 py-2 text-sm font-semibold border-2 border-blue-100 rounded-xl bg-blue-50/30 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all" />
            </motion.div>
          ))}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sexe</label>
            <div className="flex gap-2">
              {['M', 'F'].map(s => (
                <motion.button key={s}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPatient(p => ({ ...p, sexe: s }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-black border-2 transition-all cursor-pointer ${
                    patient.sexe === s
                      ? s === 'M'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 border-blue-600 text-white shadow-md shadow-blue-200'
                        : 'bg-gradient-to-r from-pink-500 to-rose-600 border-pink-600 text-white shadow-md shadow-pink-200'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                  }`}>
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>


      {/* SECTIONS KITS */}
      <AnimatePresence mode="wait">
        {isPremiereSeance && (
          <motion.div key="premiere" className="space-y-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}>

            <KitSection
              icon="vaccines"
              title="Kit Hemodialyse - 1ere Seance"
              sub="Ordonnance complete - Nouveau patient"
              gradient="from-blue-500 via-indigo-500 to-purple-600"
              accent="blue"
              rows={rows1}
              onChangeRow={(i, f, v) => updateRow(setRows1, i, f, v)}
              onReset={() => setRows1(KIT_PREMIERE.map(i => ({ ...i })))}
              status={status1}
              onVu={() => handleVu(rows1, '1ere seance hemodialyse', setStatus1)}
            />

            <KitSection
              icon="medical_services"
              title="Ordonnance Kit 1er Soin - Service Hemodialyse"
              sub="Materiel de soin catheter"
              gradient="from-amber-500 via-orange-500 to-red-500"
              accent="amber"
              rows={rowsSoin}
              onChangeRow={(i, f, v) => updateRow(setRowsSoin, i, f, v)}
              onReset={() => setRowsSoin(KIT_SOIN.map(i => ({ ...i })))}
              status={statusSoin}
              onVu={() => handleVu(rowsSoin, 'Kit 1er soin catheter', setStatusSoin)}
            />
          </motion.div>
        )}

        {!isPremiereSeance && (
          <motion.div key="suivante"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}>

            <KitSection
              icon="autorenew"
              title="Kit Hemodialyse - Seances Suivantes"
              sub="Ordonnance renouvellement"
              gradient="from-emerald-500 via-teal-500 to-cyan-600"
              accent="emerald"
              rows={rows2}
              onChangeRow={(i, f, v) => updateRow(setRows2, i, f, v)}
              onReset={() => setRows2(KIT_SUIVANTE.map(i => ({ ...i })))}
              status={status2}
              onVu={() => handleVu(rows2, 'Seances suivantes hemodialyse', setStatus2)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* BANNIERE SUCCES */}
      <AnimatePresence>
        {allVu && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl p-5 shadow-xl shadow-emerald-200/40"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.6, repeat: 2 }}
                  className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30"
                >
                  <span className="material-symbols-outlined text-white text-2xl">task_alt</span>
                </motion.div>
                <div>
                  <p className="text-white text-sm font-black">Kits verifies avec succes</p>
                  <p className="text-emerald-100 text-xs mt-0.5 font-semibold">
                    Tous les kits ont ete enregistres
                  </p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    window.location.href = `/dialyses/conductivite-params?patientId=${patientIdParam || ''}&rendezVousId=${rdvId || ''}&seanceNum=${seanceNum}`;
                  }}
                  className="px-4 py-2.5 bg-white/20 text-white text-xs font-black rounded-xl hover:bg-white/30 transition-all cursor-pointer flex items-center gap-2 border border-white/30 backdrop-blur-sm"
                >
                  <span className="material-symbols-outlined text-base">settings</span>
                  Conductivite
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goBack}
                  className="px-5 py-2.5 bg-white text-emerald-700 text-xs font-black rounded-xl hover:bg-emerald-50 transition-all cursor-pointer flex items-center gap-2 shadow-md"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Retour aux choix medecin
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}

export default function VerificationKitPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerificationKitInner />
    </Suspense>
  );
}
