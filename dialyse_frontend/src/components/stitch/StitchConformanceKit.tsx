'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getCurrentPatient, PatientData, setCurrentPatient } from '@/src/stores/patient.store';
import PatientSearchInput from '@/src/components/patient/PatientSearchInput';

const PHARMACIE_ITEMS = [
  { nom: 'Eau non glucose 5L ou 10L', qte: '1' }, { nom: 'Bétadine jaune 125ml', qte: '1' },
  { nom: 'Bétadine rouge 125ml', qte: '1' }, { nom: 'Lovenox - 6.000 USI', qte: '1' },
  { nom: 'Lidocaïne 2% inj', qte: '1' }, { nom: 'Compresse stérile 40×40', qte: '1' },
  { nom: 'Fil à peau 3,0', qte: '1' }, { nom: "Gant d'examen non stérile", qte: '1' },
  { nom: 'Gant stérile 7', qte: '1' }, { nom: 'Ligne artério-veineuse', qte: '1' },
  { nom: 'Masque chirurgical', qte: '1' }, { nom: 'Rein artificiel (Dialyseur) F6/F7/F8/F10', qte: '1' },
  { nom: 'Seringue 10cc', qte: '1' }, { nom: 'Seringue 20cc', qte: '1' },
  { nom: 'Seringue 5cc', qte: '1' },
];

export default function StitchConformanceKit() {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [adresse, setAdresse] = useState('');
  const [service, setService] = useState('Hémodialyse');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const current = getCurrentPatient();
    if (current.id) { setPatient(current); setAdresse(current.adresse || ''); }
  }, []);

  const handlePatientSelected = (p: PatientData) => { setPatient(p); setCurrentPatient(p); setAdresse(p.adresse || ''); };
  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-6 no-print">
          <div>
            <h1 className="text-2xl font-black text-slate-800 font-manrope">Ordonnance Kit - Première Séance</h1>
            <p className="text-sm text-slate-500">Conformance Kit Hémodialyse · CHU Andrainjato</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePrint} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-lg">print</span>Imprimer
          </motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl border border-slate-200/60 p-6 md:p-10 lg:p-16 min-h-[800px]">
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b-4 border-slate-800">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-16 h-16 border-2 border-slate-200 rounded-lg overflow-hidden flex items-center justify-center mr-4 bg-white">
                <span className="material-symbols-outlined text-3xl text-blue-600">local_hospital</span>
              </div>
              <div><p className="font-extrabold text-sm uppercase tracking-wider text-slate-800">CHU Andrainjato</p><p className="text-[10px] uppercase text-slate-500">Service d&apos;Hémodialyse</p></div>
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold uppercase tracking-widest text-center md:text-right text-blue-700">ORDONNANCE KIT : PREMIÈRE SÉANCE D&apos;HÉMODIALYSE</h2>
          </div>

          <div className="mb-6 no-print"><PatientSearchInput onPatientSelected={handlePatientSelected} /></div>

          <div className="space-y-6 mb-10">
            <div className="flex items-end"><span className="font-bold whitespace-nowrap text-sm uppercase text-slate-600">Nom et Prénom :</span><input className="flex-grow ml-2 border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 font-semibold text-slate-800" value={patient ? `${patient.prenoms} ${patient.nom}` : ''} readOnly /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-end"><span className="font-bold whitespace-nowrap text-sm uppercase text-slate-600">Âge :</span><input className="flex-grow ml-2 border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 font-semibold" value={patient?.age || ''} readOnly /></div>
              <div className="flex items-end"><span className="font-bold whitespace-nowrap text-sm uppercase text-slate-600">Sexe :</span><input className="flex-grow ml-2 border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 font-semibold" value={patient?.sexe || ''} readOnly /></div>
              <div className="flex items-end"><span className="font-bold whitespace-nowrap text-sm uppercase text-slate-600">Poids (kg) :</span><input className="flex-grow ml-2 border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 font-semibold" value={patient?.poids || ''} onChange={(e) => { if(patient) setPatient({...patient, poids: e.target.value}); }} /></div>
            </div>
            <div className="flex items-end"><span className="font-bold whitespace-nowrap text-sm uppercase text-slate-600">Adresse :</span><input className="flex-grow ml-2 border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5" value={adresse} onChange={(e) => setAdresse(e.target.value)} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-end"><span className="font-bold whitespace-nowrap text-sm uppercase text-slate-600">Service :</span><input className="flex-grow ml-2 border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5" value={service} onChange={(e) => setService(e.target.value)} /></div>
              <div className="flex items-end"><span className="font-bold whitespace-nowrap text-sm uppercase text-slate-600">Date :</span><input className="flex-grow ml-2 border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5" value={date} onChange={(e) => setDate(e.target.value)} type="date" /></div>
            </div>
          </div>

          <div className="mb-12">
            <h3 className="font-bold italic mb-4 text-lg text-slate-600">1- PHARMACIE : <span className="font-normal text-sm opacity-75 uppercase not-italic">Rayer les mentions inutiles</span></h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm uppercase border-collapse">
                <thead><tr className="bg-slate-100 text-blue-800"><th className="w-1/2 font-extrabold text-center py-3 border-2 border-slate-300 text-xs">DÉSIGNATION</th><th className="w-24 font-extrabold text-center py-3 border-2 border-slate-300 text-xs">QTÉ</th><th className="font-extrabold text-center py-3 border-2 border-slate-300 text-xs">PRIX UNITAIRE</th><th className="font-extrabold text-center py-3 border-2 border-slate-300 text-xs">MONTANT</th></tr></thead>
                <tbody>
                  {PHARMACIE_ITEMS.map((item, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                      <td className="pl-4 py-2 border-2 border-slate-200 text-slate-700 normal-case font-medium">{item.nom}</td>
                      <td className="text-center font-bold border-2 border-slate-200"><input className="w-full text-center font-bold bg-blue-50/50 border border-blue-100 rounded-lg py-1.5 text-blue-700 outline-none" type="text" defaultValue={item.qte} /></td>
                      <td className="border-2 border-slate-200"><input className="w-full text-right bg-transparent rounded-lg py-1.5 outline-none" type="text" /></td>
                      <td className="border-2 border-slate-200"><input className="w-full text-right bg-transparent rounded-lg py-1.5 outline-none" type="text" /></td>
                    </tr>
                  ))}
                  <tr className="bg-blue-100 text-blue-900 font-extrabold">
                    <td className="text-left px-4 py-3 border-2 border-slate-300">TOTAL</td><td className="text-center py-3 border-2 border-slate-300">15</td>
                    <td className="border-2 border-slate-300"><input className="w-full text-right font-extrabold bg-transparent rounded-lg py-1.5 outline-none" type="text" /></td>
                    <td className="border-2 border-slate-300"><input className="w-full text-right font-extrabold bg-transparent rounded-lg py-1.5 outline-none" type="text" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-auto pt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center text-xs font-bold uppercase tracking-widest text-slate-700">
              <div className="flex flex-col items-center"><div className="w-full border-t-2 border-slate-800 mb-4"></div><span>LE DIRECTEUR D&apos;ÉTABLISSEMENT</span></div>
              <div className="flex flex-col items-center"><div className="w-full border-t-2 border-slate-800 mb-4"></div><span>LE PRESCRIPTEUR</span></div>
              <div className="flex flex-col items-center"><div className="w-full border-t-2 border-slate-800 mb-4"></div><span>LE DISPENSATEUR</span></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
