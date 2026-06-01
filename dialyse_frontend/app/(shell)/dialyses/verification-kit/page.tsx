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

const KIT_PREMIERE: KitItem[] = [
  { name: 'Acide non glucosé 10l',                 qty: 1,          prixUnit: '', montant: '' },
  { name: 'Bétadine jaune',                         qty: 1,          prixUnit: '', montant: '' },
  { name: 'Bétadine rouge',                         qty: 1,          prixUnit: '', montant: '' },
  { name: 'Héparine ou Lovenox',                    qty: 2,          prixUnit: '', montant: '' },
  { name: 'Lidocaïne 2%',                           qty: 2,          prixUnit: '', montant: '' },
  { name: 'Compresse stérile 40X40',                qty: '6 boîtes', prixUnit: '', montant: '' },
  { name: 'Fil à peau',                             qty: 1,          prixUnit: '', montant: '' },
  { name: "Gant d'examen non stérile",              qty: 6,          prixUnit: '', montant: '' },
  { name: 'Gant stérile 7',                         qty: 6,          prixUnit: '', montant: '' },
  { name: 'Ligne artério-veineuse',                 qty: 1,          prixUnit: '', montant: '' },
  { name: 'Masque chirurgical',                     qty: 6,          prixUnit: '', montant: '' },
  { name: 'Rein artificiel (Dialyseur) F6/F7/F8',  qty: 1,          prixUnit: '', montant: '' },
  { name: 'Seringue 10cc',                          qty: 6,          prixUnit: '', montant: '' },
  { name: 'Seringue 20cc',                          qty: 6,          prixUnit: '', montant: '' },
  { name: 'Seringue 5cc',                           qty: 6,          prixUnit: '', montant: '' },
  { name: 'SSI 9‰',                                qty: 1,          prixUnit: '', montant: '' },
  { name: 'Cathéter double voie',                   qty: 1,          prixUnit: '', montant: '' },
  { name: 'Dakin',                                  qty: 1,          prixUnit: '', montant: '' },
  { name: 'Perfuseur',                              qty: 1,          prixUnit: '', montant: '' },
  { name: 'Solucart 750g',                          qty: 1,          prixUnit: '', montant: '' },
];

const KIT_SUIVANTE: KitItem[] = [
  { name: 'Acide non glucosé',                      qty: 1,          prixUnit: '', montant: '' },
  { name: 'Lovenox 4000 UI',                        qty: 3,          prixUnit: '', montant: '' },
  { name: 'Compresse stérile 40X40',                qty: '2 boîtes', prixUnit: '', montant: '' },
  { name: "Gant d'examen non stérile",              qty: 6,          prixUnit: '', montant: '' },
  { name: 'Gant stérile 7/0',                       qty: 6,          prixUnit: '', montant: '' },
  { name: 'Masque chirurgicale',                    qty: 6,          prixUnit: '', montant: '' },
  { name: 'Rein artificiel (Dialyseur) F7/F8',      qty: 1,          prixUnit: '', montant: '' },
  { name: 'Seringue 10cc',                          qty: 6,          prixUnit: '', montant: '' },
  { name: 'Seringue 20cc',                          qty: 6,          prixUnit: '', montant: '' },
  { name: 'Seringue 5cc',                           qty: 6,          prixUnit: '', montant: '' },
  { name: 'SSI 500ml',                              qty: 4,          prixUnit: '', montant: '' },
  { name: 'Ligne artério-veineuse',                 qty: 1,          prixUnit: '', montant: '' },
  { name: 'Solucart',                               qty: 1,          prixUnit: '', montant: '' },
  { name: 'Dakin',                                  qty: 1,          prixUnit: '', montant: '' },
  { name: 'Perfuseur',                              qty: 1,          prixUnit: '', montant: '' },
];

const KIT_SOIN: KitItem[] = [
  { name: 'SSI 500 ml',                             qty: '06 flacons', prixUnit: '', montant: '' },
  { name: 'Dakin 125ml',                            qty: '01',          prixUnit: '', montant: '' },
  { name: 'Sécurifixe 10x25cm',                     qty: '02',          prixUnit: '', montant: '' },
  { name: 'Calot chirurgical',                      qty: '06',          prixUnit: '', montant: '' },
  { name: 'Cathéter double voie pour dialyse',      qty: '01',          prixUnit: '', montant: '' },
  { name: 'Solucart 750g',                          qty: '01',          prixUnit: '', montant: '' },
  { name: 'Rasoirs (épicerie)',                     qty: '01',          prixUnit: '', montant: '' },
  { name: 'Perfuseurs',                             qty: '01',          prixUnit: '', montant: '' },
];

function KitTable({ rows, onChange }: {
  rows: KitItem[];
  onChange: (idx: number, field: keyof KitItem, val: string) => void;
}) {
  const total = rows.reduce((acc, r) => acc + (parseFloat(r.montant) || 0), 0);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Désignation</th>
            <th className="px-3 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-24">Quantité</th>
            <th className="px-3 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-32">Prix unit. (Ar)</th>
            <th className="px-3 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-32">Montant (Ar)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row, i) => (
            <motion.tr key={i}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.025 }}
              className="hover:bg-slate-50/60 transition-colors">
              <td className="px-4 py-2.5 text-xs font-medium text-slate-700">{row.name}</td>
              <td className="px-3 py-2.5">
                <input type="text" value={row.qty}
                  onChange={e => onChange(i, 'qty', e.target.value)}
                  className="w-full px-2 py-1.5 text-xs font-semibold text-center border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
              </td>
              <td className="px-3 py-2.5">
                <input type="number" value={row.prixUnit} placeholder="0"
                  onChange={e => {
                    onChange(i, 'prixUnit', e.target.value);
                    const qty = parseFloat(String(row.qty)) || 0;
                    const pu  = parseFloat(e.target.value) || 0;
                    onChange(i, 'montant', String(qty * pu));
                  }}
                  className="w-full px-2 py-1.5 text-xs font-semibold text-right border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
              </td>
              <td className="px-3 py-2.5">
                <input type="number" value={row.montant} placeholder="0"
                  onChange={e => onChange(i, 'montant', e.target.value)}
                  className="w-full px-2 py-1.5 text-xs font-semibold text-right border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
              </td>
            </motion.tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-200 bg-slate-50">
            <td colSpan={3} className="px-4 py-3 text-xs font-bold text-slate-600 text-right uppercase tracking-wide">Total</td>
            <td className="px-3 py-3">
              <span className="text-sm font-black text-blue-700">{total.toLocaleString('fr-MG')} Ar</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function SectionCard({ icon, title, sub, iconBg, children }: {
  icon: string; title: string; sub: string;
  iconBg: string; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
      <div className={`px-5 py-4 border-b border-slate-100 flex items-center gap-3 ${iconBg}`}>
        <div className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-xl text-slate-600">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
        </div>
      </div>
      <div>{children}</div>
    </motion.div>
  );
}

/* ─── Composant principal ─── */
function VerificationKitInner() {
  const searchParams   = useSearchParams();
  const patientIdParam = searchParams.get('patientId');
  const seanceNumRaw   = searchParams.get('seanceNum');
  const seanceNum      = parseInt(seanceNumRaw || '1');

  // ✅ CORRIGÉ : le toggle est libre, initialisé une seule fois depuis l'URL
  const [seanceType, setSeanceType] = useState<SeanceType>(
    seanceNum > 1 ? 'suivante' : 'premiere'
  );

  const [patient, setPatient] = useState({
    nom: '', age: '', sexe: 'M', adresse: '', service: 'Hémodialyse', date: '',
  });

  const [rows1,    setRows1]    = useState<KitItem[]>(KIT_PREMIERE.map(i => ({ ...i })));
  const [rows2,    setRows2]    = useState<KitItem[]>(KIT_SUIVANTE.map(i => ({ ...i })));
  const [rowsSoin, setRowsSoin] = useState<KitItem[]>(KIT_SOIN.map(i => ({ ...i })));

  // ✅ Charger infos patient depuis API si patientId fourni
  useEffect(() => {
    if (!patientIdParam) return;
    fetch(`${API_URL}/patients/${patientIdParam}`)
      .then(r => r.json())
      .then(data => {
        if (data?.nom) {
          setPatient(p => ({
            ...p,
            nom:     `${data.prenom || ''} ${data.nom || ''}`.trim(),
            age:     data.age || '',
            adresse: data.adresse || '',
            date:    new Date().toISOString().split('T')[0],
          }));
        }
      })
      .catch(() => {});
  }, [patientIdParam]);

  const updateRow = (
    setter: React.Dispatch<React.SetStateAction<KitItem[]>>,
    idx: number, field: keyof KitItem, val: string,
  ) => setter(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r));

  const isPremiereSeance = seanceType === 'premiere';
  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-6 max-w-5xl mx-auto">

      {/* ── En-tête ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black font-manrope text-slate-800">Vérification Kit</h1>
          <p className="text-sm text-slate-400 mt-0.5">Ordonnance hémodialyse · CHU Andrainjato</p>
        </div>
        <button onClick={() => window.history.back()}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-lg">arrow_back</span>Retour
        </button>
      </motion.div>

      {/* ── Info patient si chargé ── */}
      {patientIdParam && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-500 text-base">person</span>
          <span className="text-xs font-semibold text-blue-700">
            Patient ID #{patientIdParam} · Séance N°{seanceNum}
          </span>
        </motion.div>
      )}

      {/* ── Toggle 1ère / suivante ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl border border-slate-200/70 shadow-sm px-5 py-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 text-xl">info</span>
          <span className="text-sm font-semibold text-slate-700">Type de séance :</span>
        </div>

        {/* ✅ Toggle libre — l'utilisateur peut changer manuellement */}
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {(['premiere', 'suivante'] as SeanceType[]).map(t => (
            <button key={t}
              onClick={() => setSeanceType(t)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                seanceType === t
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}>
              {t === 'premiere' ? '1ère séance' : 'Séances suivantes'}
            </button>
          ))}
        </div>

        <span className={`ml-auto px-3 py-1 rounded-full text-[10px] font-bold border ${
          isPremiereSeance
            ? 'bg-blue-50 text-blue-700 border-blue-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {isPremiereSeance ? '🔵 1ère séance active' : '🟢 Séances suivantes actives'}
        </span>
      </motion.div>

      {/* ── Info patient (formulaire) ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5">
        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 pb-2 border-b border-blue-50">
          Informations Patient
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Nom & Prénoms',         key: 'nom',     type: 'text',   placeholder: 'Rakoto Jean'    },
            { label: 'Âge',                   key: 'age',     type: 'number', placeholder: '45'             },
            { label: 'Adresse',               key: 'adresse', type: 'text',   placeholder: 'Fianarantsoa'   },
            { label: 'Service',               key: 'service', type: 'text',   placeholder: 'Hémodialyse'    },
            { label: "Date de l'ordonnance",  key: 'date',    type: 'date',   placeholder: ''               },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder}
                value={(patient as any)[f.key]}
                onChange={e => setPatient(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
            </div>
          ))}
          <div>
            <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Sexe</label>
            <div className="flex gap-2">
              {['M', 'F'].map(s => (
                <button key={s} onClick={() => setPatient(p => ({ ...p, sexe: s }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    patient.sexe === s
                      ? s === 'M' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-pink-50 border-pink-300 text-pink-700'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── ✅ Kit 1ère séance ── */}
      <AnimatePresence mode="wait">
        {isPremiereSeance && (
          <motion.div key="premiere"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            <SectionCard icon="vaccines" title="Kit Hémodialyse — 1ère Séance"
              sub="Ordonnance complète · Nouveau patient"
              iconBg="bg-gradient-to-r from-blue-50 to-blue-100/50">
              <KitTable rows={rows1} onChange={(i, f, v) => updateRow(setRows1, i, f, v)} />
              <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
                <button onClick={() => setRows1(KIT_PREMIERE.map(i => ({ ...i })))}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer">
                  Réinitialiser
                </button>
                <button onClick={handlePrint}
                  className="px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">print</span>Imprimer
                </button>
                <button className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">save</span>Enregistrer
                </button>
              </div>
            </SectionCard>
          </motion.div>
        )}

        {/* ── ✅ Kit séances suivantes ── */}
        {!isPremiereSeance && (
          <motion.div key="suivante"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            <SectionCard icon="autorenew" title="Kit Hémodialyse — Séances Suivantes"
              sub="Ordonnance renouvellement"
              iconBg="bg-gradient-to-r from-emerald-50 to-emerald-100/50">
              <KitTable rows={rows2} onChange={(i, f, v) => updateRow(setRows2, i, f, v)} />
              <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
                <button onClick={() => setRows2(KIT_SUIVANTE.map(i => ({ ...i })))}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer">
                  Réinitialiser
                </button>
                <button onClick={handlePrint}
                  className="px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">print</span>Imprimer
                </button>
                <button className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">save</span>Enregistrer
                </button>
              </div>
            </SectionCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Ordonnance 1er soin — uniquement 1ère séance ── */}
      <AnimatePresence>
        {isPremiereSeance && (
          <motion.div key="soin"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            <SectionCard icon="medical_services"
              title="Ordonnance Kit 1er Soin — Service Hémodialyse"
              sub="Matériel de soin cathéter"
              iconBg="bg-gradient-to-r from-amber-50 to-amber-100/50">
              <KitTable rows={rowsSoin} onChange={(i, f, v) => updateRow(setRowsSoin, i, f, v)} />
              <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
                <button onClick={handlePrint}
                  className="px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">print</span>Imprimer
                </button>
                <button className="px-4 py-2 text-xs font-bold text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">save</span>Enregistrer
                </button>
              </div>
            </SectionCard>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function VerificationKitPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerificationKitInner />
    </Suspense>
  );
}
