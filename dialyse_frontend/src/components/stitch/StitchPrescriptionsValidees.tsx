'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StitchOrdonnanceKit from './StitchOrdonnanceKit';
import StitchListeMateriels from './StitchListeMateriels';
import StitchConformanceKit from './StitchConformanceKit';
import StitchFicheSurveillance from './StitchFicheSurveillance';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const KITS = [
  { id: 'ordonnance-kit', titre: 'Ordonnance Kit Don Hémodialyse', description: 'Formulaire complet avec tableau des matériels, prix et signatures', icon: 'receipt_long', couleur: 'from-blue-600 to-blue-700', composant: StitchOrdonnanceKit },
  { id: 'checklist-kit', titre: 'Kit Hémodialyse Checklist (NY ILAINA)', description: 'Checklist des matériels nécessaires avec signatures témoin et médecin', icon: 'checklist', couleur: 'from-emerald-600 to-emerald-700', composant: StitchListeMateriels },
  { id: 'conformance-kit', titre: 'Conformance Kit - Première Séance', description: 'Ordonnance première séance avec 15 items pharmacie', icon: 'clinical_notes', couleur: 'from-purple-600 to-purple-700', composant: StitchConformanceKit },
  { id: 'fiche-surveillance', titre: 'Fiche de Surveillance - Hémodialyse', description: 'Tableau de surveillance 11 colonnes avec paramètres techniques', icon: 'monitor_heart', couleur: 'from-red-600 to-red-700', composant: StitchFicheSurveillance },
];

export default function StitchPrescriptionsValidees() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKits, setShowKits] = useState<number | null>(null);
  const [selectedKit, setSelectedKit] = useState<string | null>(null);
  const [dossierOuvert, setDossierOuvert] = useState<number | null>(null);
  const [kitsValides, setKitsValides] = useState<Record<number, Record<string, string>>>({});
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/prescriptions/validees`);
        const data = await res.json();
        if (Array.isArray(data)) setPrescriptions(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const notif = (m: string) => { setNotification(m); setTimeout(() => setNotification(null), 3000); };

  const patientsUniques = prescriptions.reduce((acc: any[], presc: any) => {
    const exist = acc.find(x => x.patient.id === presc.patient.id);
    if (exist) exist.prescriptions.push(presc);
    else acc.push({ patient: presc.patient, prescriptions: [presc] });
    return acc;
  }, []);

  const age = (d: string) => {
    if (!d) return '-';
    const t = new Date(), b = new Date(d);
    let a = t.getFullYear() - b.getFullYear();
    const m = t.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
    return `${a} ans`;
  };

  const validerKit = (patientId: number, patientName: string, kitId: string) => {
    setKitsValides(p => ({ ...p, [patientId]: { ...(p[patientId] || {}), [kitId]: new Date().toLocaleDateString('fr-FR') } }));
    notif(`✅ Kit validé pour ${patientName} !`);
    setSelectedKit(null);
    setShowKits(null);
  };

  const totalKitsValides = Object.values(kitsValides).reduce((sum: number, kits: any) => sum + Object.keys(kits).length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="pt-6 pb-20 md:pb-8 px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto">
        <AnimatePresence>{notification && (<motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-4 left-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span>{notification}</motion.div>)}</AnimatePresence>

        <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-4"><span>Espace Clinique</span><span className="material-symbols-outlined text-sm">chevron_right</span><span className="text-emerald-600 font-bold">Prescriptions Validées</span></nav>

        <div className="flex flex-col lg:flex-row gap-6 mb-6"><div className="flex-1"><h1 className="text-2xl md:text-3xl font-black text-slate-800 font-manrope">Prescriptions Validées</h1><p className="text-slate-500 text-sm mt-1">{prescriptions.length} prescriptions · {patientsUniques.length} patients · {totalKitsValides} kits validés</p></div></div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-emerald-50 rounded-2xl p-4 text-emerald-700"><span className="material-symbols-outlined text-xl">check_circle</span><p className="text-xl font-black">{prescriptions.length}</p><p className="text-[10px]">Prescriptions</p></div>
          <div className="bg-blue-50 rounded-2xl p-4 text-blue-700"><span className="material-symbols-outlined text-xl">groups</span><p className="text-xl font-black">{patientsUniques.length}</p><p className="text-[10px]">Patients</p></div>
          <div className="bg-purple-50 rounded-2xl p-4 text-purple-700"><span className="material-symbols-outlined text-xl">prescriptions</span><p className="text-xl font-black">{totalKitsValides}</p><p className="text-[10px]">Kits validés</p></div>
          <div className="bg-amber-50 rounded-2xl p-4 text-amber-700"><span className="material-symbols-outlined text-xl">inventory_2</span><p className="text-xl font-black">4</p><p className="text-[10px]">Interfaces kit</p></div>
        </div>

        {loading ? (<div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div><p>Chargement MySQL...</p></div>) : patientsUniques.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center"><span className="material-symbols-outlined text-5xl text-slate-300 mb-4">inventory_2</span><h3 className="text-lg font-bold text-slate-500 mb-2">Aucune prescription validée</h3><button onClick={() => router.push('/dialyses')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm cursor-pointer">Voir prescriptions en attente</button></div>
        ) : (
          <div className="space-y-3">
            {patientsUniques.map(({ patient, prescriptions: pp }: any) => {
              const patientKits = kitsValides[patient.id] || {};
              return (
                <div key={patient.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shrink-0 shadow-lg"><span className="material-symbols-outlined text-xl">verified</span></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">Validé</span><span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">RDV OK</span>{Object.keys(patientKits).length > 0 && <span className="text-[10px] font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{Object.keys(patientKits).length} kit(s) ✓</span>}</div>
                      <p className="font-bold text-sm text-slate-800">{patient.prenom} {patient.nom}</p>
                      <p className="text-[10px] text-slate-400">#{patient.id} · {pp.length} prescription(s) · {age(patient.dateNaissance)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => setDossierOuvert(dossierOuvert === patient.id ? null : patient.id)} className={`p-2 rounded-xl transition-all cursor-pointer ${dossierOuvert === patient.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}><span className="material-symbols-outlined text-lg">{dossierOuvert === patient.id ? 'folder_open' : 'folder'}</span></button>
                      <button onClick={() => { setShowKits(showKits === patient.id ? null : patient.id); setSelectedKit(null); }} className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${showKits === patient.id ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}><span className="material-symbols-outlined text-sm">{showKits === patient.id ? 'expand_less' : 'prescriptions'}</span>Prescrire Kit</button>
                      <button onClick={() => notif('RDV confirmé')} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-xl text-[10px] font-bold cursor-pointer">RDV</button>
                    </div>
                  </div>

                  {/* DOSSIER */}
                  <AnimatePresence>{dossierOuvert === patient.id && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t-2 border-blue-200"><div className="p-5 bg-gradient-to-r from-blue-50/50 to-white"><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-black text-blue-800">📂 Dossier {patient.prenom} {patient.nom}</h3><button onClick={() => setDossierOuvert(null)} className="p-1 text-slate-400 hover:text-red-500"><span className="material-symbols-outlined">close</span></button></div><div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">{[{ l: 'Nom', v: `${patient.prenom} ${patient.nom}` },{ l: 'ID', v: `#${patient.id}` },{ l: 'Âge', v: age(patient.dateNaissance) },{ l: 'Né(e) le', v: patient.dateNaissance ? new Date(patient.dateNaissance).toLocaleDateString('fr-FR') : '-' },{ l: 'Tél', v: patient.telephone || '-' },{ l: 'Notes', v: patient.notes || '-' },{ l: 'Prescriptions', v: `${pp.length} validée(s)` },{ l: 'Dernière', v: pp[0] ? new Date(pp[0].date_prescription).toLocaleDateString('fr-FR') : '-' }].map(i => (<div key={i.l} className="bg-white rounded-xl p-3 border border-blue-100"><p className="text-[10px] text-blue-400 uppercase">{i.l}</p><p className="text-sm font-bold text-blue-800">{i.v}</p></div>))}</div><div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-xs font-bold text-slate-700 mb-3">📋 Prescriptions ({pp.length})</p><table className="w-full text-xs"><thead><tr className="text-slate-400 border-b"><th className="text-left py-2">Date</th><th className="text-left py-2">Médicament</th><th className="text-left py-2">Dosage</th><th className="text-left py-2">Fréquence</th></tr></thead><tbody>{pp.map((p: any, i: number) => (<tr key={i} className="hover:bg-slate-50"><td className="py-2">{new Date(p.date_prescription).toLocaleDateString('fr-FR')}</td><td className="py-2 font-bold">{p.medicament}</td><td className="py-2">{p.dosage}</td><td className="py-2">{p.frequence}</td></tr>))}</tbody></table></div></div></motion.div>)}</AnimatePresence>

                  {/* 4 INTERFACES KIT COMPLÈTES */}
                  <AnimatePresence>{showKits === patient.id && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t-2 border-purple-200"><div className="p-5"><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-black text-purple-800">🧪 Kits - {patient.prenom} {patient.nom}</h3><button onClick={() => { setShowKits(null); setSelectedKit(null); }} className="p-1 text-slate-400 hover:text-red-500"><span className="material-symbols-outlined">close</span></button></div>
                    {!selectedKit ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{KITS.map(kit => (<div key={kit.id} onClick={() => setSelectedKit(kit.id)} className="bg-white rounded-2xl border-2 border-slate-200 hover:border-purple-300 cursor-pointer transition-all p-5 group"><div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kit.couleur} flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-110 transition-transform`}><span className="material-symbols-outlined text-xl">{kit.icon}</span></div><h4 className="font-extrabold text-slate-800 text-sm mb-1">{kit.titre}</h4><p className="text-xs text-slate-500">{kit.description}</p>{patientKits[kit.id] && <p className="text-[10px] text-emerald-600 font-bold mt-2">✅ Validé le {patientKits[kit.id]}</p>}<p className="text-xs text-purple-500 font-bold mt-3 flex items-center gap-1"><span className="material-symbols-outlined text-sm">touch_app</span> Cliquer pour ouvrir</p></div>))}</div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-3 mb-4"><button onClick={() => setSelectedKit(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"><span className="material-symbols-outlined text-sm">arrow_back</span> Retour</button><span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">{KITS.find(k => k.id === selectedKit)?.titre}</span></div>
                        {/* INTERFACE KIT COMPLÈTE */}
                        <div className="border-2 border-purple-200 rounded-2xl overflow-hidden shadow-xl">
                          {selectedKit === 'ordonnance-kit' && <StitchOrdonnanceKit />}
                          {selectedKit === 'checklist-kit' && <StitchListeMateriels />}
                          {selectedKit === 'conformance-kit' && <StitchConformanceKit />}
                          {selectedKit === 'fiche-surveillance' && <StitchFicheSurveillance />}
                        </div>
                        {/* BOUTON VALIDER EN BAS */}
                        <div className="mt-4 flex justify-center"><button onClick={() => validerKit(patient.id, `${patient.prenom} ${patient.nom}`, selectedKit!)} className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-2"><span className="material-symbols-outlined text-lg">check_circle</span> Valider ce kit</button></div>
                      </div>
                    )}
                  </div></motion.div>)}</AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
