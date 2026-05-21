'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getCurrentPatient, PatientData, setCurrentPatient } from '@/src/stores/patient.store';
import PatientSearchInput from '@/src/components/patient/PatientSearchInput';

const KIT_ITEMS = [
  { nom: 'SSI 0.9% 500 ml', qte: '6 flacons', prix: '', montant: '' },
  { nom: 'Oxigen solution 500 ml', qte: '1 flacon', prix: '', montant: '' },
  { nom: 'Securifix 10 X 25', qte: '2 unités', prix: '', montant: '' },
  { nom: 'Compresses stériles 40×40', qte: '10 unités', prix: '', montant: '' },
  { nom: 'Gants stériles taille 7.5', qte: '2 paires', prix: '', montant: '' },
  { nom: 'Aiguille de fistule 15G', qte: '2', prix: '', montant: '' },
  { nom: 'Prolongateur 15 cm', qte: '2', prix: '', montant: '' },
  { nom: 'Seringue 20 cc', qte: '3', prix: '', montant: '' },
  { nom: 'Antiseptique cutané', qte: '1 flacon', prix: '', montant: '' },
  { nom: 'Sparadrap 2.5 cm', qte: '1 rouleau', prix: '', montant: '' },
];

export default function StitchOrdonnanceKit() {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [service, setService] = useState('HEMODIALYSE');
  const [unite, setUnite] = useState('');
  const [adresse, setAdresse] = useState('');
  const [directeurNote, setDirecteurNote] = useState('');
  const [prescripteurNote, setPrescripteurNote] = useState('');
  const [dispensateurNote, setDispensateurNote] = useState('');

  useEffect(() => {
    const current = getCurrentPatient();
    if (current.id) {
      setPatient(current);
      setAdresse(current.adresse || '');
    }
  }, []);

  const handlePatientSelected = (p: PatientData) => {
    setPatient(p);
    setCurrentPatient(p);
    setAdresse(p.adresse || '');
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50/30 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-6 no-print">
          <div>
            <h1 className="text-2xl font-black text-slate-800 font-manrope">Ordonnance Kit Hémodialyse</h1>
            <p className="text-sm text-slate-500">Formulaire médical officiel</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePrint} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-lg">print</span>
            Imprimer
          </motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl border border-slate-200/60 p-8 md:p-12 min-h-[800px]">
          
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 pb-6 border-b-4 border-slate-800">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="w-20 h-20 border-2 border-slate-200 rounded-lg overflow-hidden flex items-center justify-center bg-white shrink-0">
                <span className="material-symbols-outlined text-4xl text-blue-600">local_hospital</span>
              </div>
              <div>
                <p className="font-extrabold text-sm uppercase tracking-tight text-slate-800">CHU ANDRAINJATO</p>
                <p className="text-[10px] text-slate-500 font-medium">Service d&apos;Hémodialyse</p>
                <p className="text-[10px] text-slate-400 font-medium italic">Fianarantsoa, Madagascar</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-700 uppercase">Document Vitalis v2.4</p>
              <p className="text-[10px] text-slate-400">Ref: KIT-HEMO-2026</p>
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-widest text-center text-blue-800 mb-6 font-manrope">
            ORDONNANCE KIT DON HÉMODIALYSE
          </h2>
          <div className="border-t-2 border-slate-800 mb-8"></div>

          <div className="mb-6 no-print">
            <PatientSearchInput onPatientSelected={handlePatientSelected} placeholder="Rechercher patient par ID..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-sm">
            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nom et Prénom</label>
              <input className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none" value={patient ? `${patient.prenoms} ${patient.nom}` : ''} placeholder="Saisir le nom complet..." readOnly />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Âge</label>
              <input className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 font-semibold text-slate-800" value={patient?.age || ''} readOnly />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Sexe</label>
              <input className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 font-semibold text-slate-800" value={patient?.sexe || ''} readOnly />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Poids (kg)</label>
              <input className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 font-semibold text-slate-800" value={patient?.poids || ''} onChange={(e) => { if(patient) setPatient({...patient, poids: e.target.value}); }} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Adresse</label>
              <input className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 font-semibold text-slate-800" value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="Adresse de résidence..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Service</label>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-700 bg-blue-50 px-3 py-2 rounded-lg text-sm">{service}</span>
                <input className="flex-1 border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 font-semibold text-slate-800" value={unite} onChange={(e) => setUnite(e.target.value)} placeholder="Unité / Salle" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Date</label>
              <input className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 font-semibold text-slate-800" value={date} onChange={(e) => setDate(e.target.value)} type="date" />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold italic text-lg text-slate-600 mb-4">
              1- PHARMACIE : <span className="font-normal text-sm opacity-75 uppercase not-italic">Rayer les mentions inutiles</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-blue-800">
                    <th className="w-1/2 font-extrabold text-center py-3 border-2 border-slate-300 uppercase text-xs">DÉSIGNATION</th>
                    <th className="w-24 font-extrabold text-center py-3 border-2 border-slate-300 uppercase text-xs">QTÉ</th>
                    <th className="font-extrabold text-center py-3 border-2 border-slate-300 uppercase text-xs">PRIX UNITAIRE</th>
                    <th className="font-extrabold text-center py-3 border-2 border-slate-300 uppercase text-xs">MONTANT</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-sm">
                  {KIT_ITEMS.map((item, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-3 border-2 border-slate-200 font-sans font-medium text-slate-700">{item.nom}</td>
                      <td className="border-2 border-slate-200"><input className="w-full text-center font-bold bg-blue-50/50 border border-blue-100 rounded-lg py-1.5 text-blue-700 outline-none" type="text" defaultValue={item.qte} /></td>
                      <td className="border-2 border-slate-200"><input className="w-full text-center bg-transparent rounded-lg py-1.5 outline-none" placeholder="0.00" type="text" /></td>
                      <td className="border-2 border-slate-200"><input className="w-full text-center bg-transparent rounded-lg py-1.5 outline-none" placeholder="0.00" type="text" /></td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-blue-50">
                    <td colSpan={2} className="p-3 border-2 border-slate-300 text-left uppercase font-sans tracking-widest text-blue-800 text-xs">TOTAL GÉNÉRAL</td>
                    <td className="border-2 border-slate-300"></td>
                    <td className="border-2 border-slate-300 pr-4"><div className="flex items-center justify-end"><input className="w-full text-right font-bold bg-transparent rounded-lg py-1.5 outline-none" placeholder="0.00" type="text" /><span className="ml-2 font-sans text-xs text-slate-500">Ar</span></div></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 text-center">
            <div><div className="border-t-2 border-slate-800 mb-4 mx-4"></div><p className="text-[11px] font-extrabold uppercase text-slate-700">LE DIRECTEUR<br/>D&apos;ÉTABLISSEMENT</p><textarea className="w-full h-24 border border-dashed border-slate-300 bg-slate-50 rounded-lg resize-none p-3 text-xs mt-2 outline-none" placeholder="Annotations..." value={directeurNote} onChange={(e) => setDirecteurNote(e.target.value)} /></div>
            <div><div className="border-t-2 border-slate-800 mb-4 mx-4"></div><p className="text-[11px] font-extrabold uppercase text-slate-700">LE PRESCRIPTEUR</p><textarea className="w-full h-24 border border-dashed border-slate-300 bg-slate-50 rounded-lg resize-none p-3 text-xs mt-2 outline-none" placeholder="Signature..." value={prescripteurNote} onChange={(e) => setPrescripteurNote(e.target.value)} /></div>
            <div><div className="border-t-2 border-slate-800 mb-4 mx-4"></div><p className="text-[11px] font-extrabold uppercase text-slate-700">LE DISPENSATEUR</p><textarea className="w-full h-24 border border-dashed border-slate-300 bg-slate-50 rounded-lg resize-none p-3 text-xs mt-2 outline-none" placeholder="Validation..." value={dispensateurNote} onChange={(e) => setDispensateurNote(e.target.value)} /></div>
          </div>

          <div className="border-t-2 border-slate-800 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-xs space-y-1.5 text-slate-600">
                <p className="font-extrabold text-slate-800 mb-2 uppercase tracking-wide text-sm">Remarques :</p>
                <p className="flex gap-2 items-start"><span className="text-blue-600 font-bold">✓</span> À renouveler à chaque séance d&apos;hémodialyse.</p>
                <p className="flex gap-2 items-start"><span className="text-blue-600 font-bold">✓</span> Dialyseur (F7 pour enfant / petit poids - F8 pour adulte).</p>
                <p className="flex gap-2 items-start"><span className="text-blue-600 font-bold">✓</span> Vérifier les dates de péremption avant délivrance.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
