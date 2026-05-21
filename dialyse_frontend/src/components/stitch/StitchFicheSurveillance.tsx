'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getCurrentPatient, PatientData, setCurrentPatient } from '@/src/stores/patient.store';
import PatientSearchInput from '@/src/components/patient/PatientSearchInput';

const SURVEILLANCE_COLS = ['HUF', 'T.A.', 'POULS', 'DÉBIT SANG', 'PRESSION VEINEUSE', 'PRESSION ARTÉRIELLE', 'UF AFFICHÉE', 'UF OBTENUE', 'PTM', 'INDICATIONS CLINIQUES', 'T° CATH.MU'];

export default function StitchFicheSurveillance() {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [seanceNo, setSeanceNo] = useState('');
  const [infirmiere, setInfirmiere] = useState('');
  const [surveillance, setSurveillance] = useState<string[][]>(Array.from({ length: 7 }, () => Array(SURVEILLANCE_COLS.length).fill('')));
  const [avant, setAvant] = useState({ poids: '', ta: '', fc: '', temperature: '', o2: '' });
  const [apres, setApres] = useState({ poids: '', ta: '', fc: '', temperature: '', o2: '' });
  const [signature1, setSignature1] = useState('');
  const [signature2, setSignature2] = useState('');
  const [signature3, setSignature3] = useState('');

  useEffect(() => {
    const current = getCurrentPatient();
    if (current.id) { setPatient(current); setInfirmiere(current.infirmiere || ''); }
  }, []);

  const handlePatientSelected = (p: PatientData) => { setPatient(p); setCurrentPatient(p); setInfirmiere(p.infirmiere || ''); };
  const updateSurveillance = (row: number, col: number, value: string) => { const s = [...surveillance]; s[row][col] = value; setSurveillance(s); };
  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        <div className="fixed bottom-4 right-4 z-50 no-print">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePrint} className="px-6 py-3.5 rounded-full shadow-xl font-bold text-sm flex items-center gap-3 bg-blue-600 text-white border-2 border-blue-400 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-xl">print</span>Imprimer la fiche
          </motion.button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl border border-slate-200/60 p-6 md:p-12">
          
          <div className="flex flex-col items-center mb-6 border-b-2 border-blue-600 pb-4">
            <div className="w-full flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center"><span className="material-symbols-outlined text-3xl text-blue-600">local_hospital</span></div>
                <div className="text-xs font-bold text-slate-700 leading-tight uppercase">Centre Hospitalier Universitaire<br/>Andrainjato Fianarantsoa</div>
              </div>
              <div className="text-right text-[10px] text-slate-400 font-medium">Réf: CLIN-HEMO-042<br/>Version: 2023.1</div>
            </div>
            <h1 className="text-2xl font-extrabold text-blue-700 tracking-wider uppercase">Fiche de Surveillance - Hémodialyse</h1>
          </div>

          <div className="mb-6 no-print"><PatientSearchInput onPatientSelected={handlePatientSelected} /></div>

          <div className="grid grid-cols-12 gap-y-4 gap-x-6 mb-8 text-sm p-4 rounded-lg border border-slate-200 shadow-sm bg-slate-50/50">
            <div className="col-span-6 flex items-baseline border-b border-dotted border-slate-300 pb-1"><label className="font-bold mr-2 whitespace-nowrap text-slate-600">Nom :</label><input className="w-full border-none p-0 bg-transparent focus:ring-0 text-slate-700 py-1 outline-none" value={patient?.nom || ''} readOnly /></div>
            <div className="col-span-6 flex items-baseline border-b border-dotted border-slate-300 pb-1"><label className="font-bold mr-2 whitespace-nowrap text-slate-600">Prénoms :</label><input className="w-full border-none p-0 bg-transparent focus:ring-0 text-slate-700 py-1 outline-none" value={patient?.prenoms || ''} readOnly /></div>
            <div className="col-span-2 flex items-baseline border-b border-dotted border-slate-300 pb-1"><label className="font-bold mr-2 text-slate-600">Âge :</label><input className="w-full border-none p-0 bg-transparent focus:ring-0 text-slate-700 py-1 outline-none" value={patient?.age || ''} readOnly /></div>
            <div className="col-span-3 flex items-center gap-4"><span className="font-bold text-slate-600">Sexe :</span><label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="sexe" className="w-4 h-4 text-blue-600" checked={patient?.sexe === 'M'} readOnly /><span className="text-xs font-medium">M</span></label><label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="sexe" className="w-4 h-4 text-blue-600" checked={patient?.sexe === 'F'} readOnly /><span className="text-xs font-medium">F</span></label></div>
            <div className="col-span-7 flex items-baseline border-b border-dotted border-slate-300 pb-1"><label className="font-bold mr-2 text-slate-600">Tél :</label><input className="w-full border-none p-0 bg-transparent focus:ring-0 text-slate-700 py-1 outline-none" value={patient?.telephone || ''} readOnly /></div>
            <div className="col-span-4 flex items-baseline border-b border-dotted border-slate-300 pb-1"><label className="font-bold mr-2 text-slate-600">DATE :</label><input className="w-full border-none p-0 bg-transparent focus:ring-0 text-slate-700 py-1 outline-none" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="col-span-3 flex items-baseline border-b border-dotted border-slate-300 pb-1"><label className="font-bold mr-2 text-slate-600">SÉANCE N° :</label><input className="w-full border-none p-0 bg-transparent focus:ring-0 text-slate-700 py-1 outline-none" value={seanceNo} onChange={(e) => setSeanceNo(e.target.value)} /></div>
            <div className="col-span-5 flex items-baseline border-b border-dotted border-slate-300 pb-1"><label className="font-bold mr-2 text-slate-600">INFIRMIÈRE :</label><input className="w-full border-none p-0 bg-transparent focus:ring-0 text-slate-700 py-1 outline-none" value={infirmiere} onChange={(e) => setInfirmiere(e.target.value)} /></div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            {['AVANT', 'APRÈS'].map((titre, idx) => (
              <div key={titre} className={`border-l-4 ${idx === 0 ? 'border-blue-600' : 'border-slate-300'} pl-4`}>
                <h3 className="font-black text-sm uppercase mb-3 tracking-tighter text-blue-700">{titre}</h3>
                <div className="space-y-3 text-xs">
                  {['Poids', 'T.A.', 'FC', 'Température', 'O₂'].map((label) => {
                    const data = idx === 0 ? avant : apres;
                    const setData = idx === 0 ? setAvant : setApres;
                    const key = label.toLowerCase().replace('.','').replace('₂','2').replace('é','e') as keyof typeof avant;
                    return (
                      <div key={label} className="flex items-baseline border-b border-dotted border-slate-300 pb-0.5"><span className="w-24 font-bold text-slate-600">{label} :</span><input className="w-full border-none p-0 bg-transparent focus:ring-0 h-4 text-slate-700 outline-none" value={data[key]} onChange={(e) => setData({...data, [key]: e.target.value})} /></div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-8">
            <h3 className="border-l-4 border-blue-600 pl-4 font-black text-sm uppercase mb-3 tracking-tighter text-blue-700">SURVEILLANCE DE LA DIALYSE</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-center text-[10px]">
                <thead><tr>{SURVEILLANCE_COLS.map(col => <th key={col} className="bg-blue-600 text-white font-bold uppercase py-2 px-1 border border-blue-400 text-[9px]">{col}</th>)}</tr></thead>
                <tbody>
                  {surveillance.map((row, r) => (
                    <tr key={r}>{row.map((cell, c) => <td key={c} className="border border-slate-300 p-0 h-8"><input className="w-full h-full border-none text-center text-[10px] bg-transparent outline-none focus:bg-blue-50" value={cell} onChange={(e) => updateSurveillance(r, c, e.target.value)} /></td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-auto pt-8 border-t border-slate-200">
            {['Le Prescripteur', 'Le Prescripteur', 'Le Dispensateur / Infirmier'].map((titre, i) => (
              <div key={i} className="text-center flex flex-col gap-1">
                <input className="w-full border-b border-dotted border-slate-300 text-center text-[10px] italic bg-transparent p-1 outline-none" placeholder="Nom et Prénom" value={[signature1, signature2, signature3][i]} onChange={(e) => [setSignature1, setSignature2, setSignature3][i](e.target.value)} />
                <div className="border-t-2 border-slate-800 pt-2 text-[10px] font-black uppercase tracking-widest text-slate-600">{titre}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
