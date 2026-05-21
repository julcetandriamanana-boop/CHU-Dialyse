'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getCurrentPatient, PatientData, setCurrentPatient } from '@/src/stores/patient.store';
import PatientSearchInput from '@/src/components/patient/PatientSearchInput';

const CHECKLIST_ITEMS = [
  { nom: 'SSI 0.9% 500 ml', qte: '06 FLACONS' },
  { nom: 'Oxigen solution 500 ml', qte: '01 FLACON' },
  { nom: 'Securifix 10 X 25', qte: '02' },
  { nom: 'Calot chirurgical', qte: '06' },
  { nom: 'Cathéter double voie pour dialyse 20 cm / 15', qte: '01' },
  { nom: 'Solucart 750g', qte: '01' },
  { nom: 'Rasoirs (épiceries)', qte: '02' },
];

export default function StitchListeMateriels() {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [temoinNom, setTemoinNom] = useState('');
  const [temoinRelation, setTemoinRelation] = useState('');
  const [medecinNom, setMedecinNom] = useState('');
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const current = getCurrentPatient();
    if (current.id) setPatient(current);
  }, []);

  const handlePatientSelected = (p: PatientData) => {
    setPatient(p);
    setCurrentPatient(p);
  };

  const toggleCheck = (index: number) => {
    setCheckedItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="pt-6 px-4 md:px-6 lg:px-8 max-w-4xl mx-auto pb-8">
        
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden mb-6">
          <div className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="material-symbols-outlined text-white text-xl">local_hospital</span>
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-blue-700 tracking-tight uppercase">CHU ANDRAINJATO</h1>
                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Clinical Precision System</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-500">KIT HÉMODIALYSE</div>
              <div className="text-2xl font-black text-slate-200">FORM-02</div>
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-6 no-print">
          <div>
            <h2 className="text-xl font-black text-slate-800 font-manrope">Kit Hémodialyse Checklist</h2>
            <p className="text-sm text-slate-500">FORM-02 · {checkedCount}/{CHECKLIST_ITEMS.length} vérifiés</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => window.print()} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-lg">print</span>
            Imprimer
          </motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="p-6 md:p-10 space-y-8">
            
            <section className="max-w-3xl">
              <PatientSearchInput onPatientSelected={handlePatientSelected} placeholder="Rechercher patient..." />
              {patient && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label className="text-slate-700 font-medium whitespace-nowrap">Nom du signataire :</label>
                    <input className="flex-grow border-0 border-b border-slate-300 focus:ring-0 focus:border-blue-500 py-1 px-0 text-slate-700 outline-none" value={`${patient.prenoms} ${patient.nom}`} onChange={(e) => setTemoinNom(e.target.value)} type="text" />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label className="text-slate-700 font-medium whitespace-nowrap">Relation (Parent, ami, garant) :</label>
                    <input className="flex-grow border-0 border-b border-slate-300 focus:ring-0 focus:border-blue-500 py-1 px-0 text-slate-700 outline-none" value={temoinRelation} onChange={(e) => setTemoinRelation(e.target.value)} type="text" />
                  </div>
                </motion.div>
              )}
            </section>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                <h2 className="text-2xl font-extrabold text-slate-800 font-manrope">NY ILAINA (MATÉRIELS NÉCESSAIRES)</h2>
              </div>
              
              <div className="space-y-2">
                {CHECKLIST_ITEMS.map((item, index) => (
                  <label key={index} className="flex items-center p-4 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-200">
                    <div className="relative flex items-center">
                      <input className="peer w-6 h-6 rounded-lg border-2 border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" type="checkbox" checked={!!checkedItems[index]} onChange={() => toggleCheck(index)} />
                      <div className={`absolute inset-0 pointer-events-none flex items-center justify-center text-white ${checkedItems[index] ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="material-symbols-outlined text-sm font-bold bg-blue-600 rounded-md w-5 h-5 flex items-center justify-center">check</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-grow flex justify-between items-center">
                      <span className={`font-semibold text-slate-700 text-lg transition-all ${checkedItems[index] ? 'opacity-40 line-through' : ''}`}>{item.nom}</span>
                      <span className="bg-slate-100 px-4 py-1.5 rounded-full text-sm font-bold font-mono text-slate-500">{item.qte}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-6 bg-slate-50 rounded-xl p-4">
                <div className="flex justify-between text-xs text-slate-500 mb-2"><span>Progression</span><span className="font-bold">{checkedCount}/{CHECKLIST_ITEMS.length}</span></div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(checkedCount / CHECKLIST_ITEMS.length) * 100}%` }} className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" />
                </div>
              </div>
            </section>

            <div className="border-t border-slate-200 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                <div className="w-full md:w-1/2 space-y-4">
                  <label className="text-slate-800 font-extrabold uppercase text-xs tracking-widest">Signature Témoin</label>
                  <div className="h-24 w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 text-sm italic">{temoinNom || 'Sonia eto'}</div>
                  <input className="w-full border-0 border-b border-slate-300 focus:ring-0 focus:border-blue-500 py-1 px-0 text-center outline-none" value={temoinNom} onChange={(e) => setTemoinNom(e.target.value)} />
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                  <label className="text-slate-800 font-extrabold uppercase text-xs tracking-widest">Visa Médical</label>
                  <div className="h-24 w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 text-sm italic">{medecinNom || 'Tombokase sy Sonia'}</div>
                  <input className="w-full border-0 border-b border-slate-300 focus:ring-0 focus:border-blue-500 py-1 px-0 text-center outline-none" value={medecinNom} onChange={(e) => setMedecinNom(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
