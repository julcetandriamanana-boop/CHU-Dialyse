'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentPatient, PatientData, setCurrentPatient } from '@/src/stores/patient.store';
import PatientSearchInput from '@/src/components/patient/PatientSearchInput';

const KITS = [
  { id: 'ordonnance-kit', titre: 'Ordonnance Kit Don Hémodialyse', description: 'Formulaire complet avec tableau des matériels', icon: 'receipt_long', couleur: 'from-blue-600 to-blue-700' },
  { id: 'checklist-kit', titre: 'Kit Hémodialyse Checklist', description: 'Checklist des matériels nécessaires', icon: 'checklist', couleur: 'from-emerald-600 to-emerald-700' },
  { id: 'conformance-kit', titre: 'Conformance Kit - Première Séance', description: 'Ordonnance avec 15 items pharmacie', icon: 'clinical_notes', couleur: 'from-purple-600 to-purple-700' },
  { id: 'fiche-surveillance', titre: 'Fiche de Surveillance', description: 'Tableau de surveillance 11 colonnes', icon: 'monitor_heart', couleur: 'from-red-600 to-red-700' },
];

export default function StitchNouvelleSeance() {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [typeDialyse, setTypeDialyse] = useState('Hémodialyse standard');
  const [poste, setPoste] = useState('Poste A-12');
  const [duree, setDuree] = useState('4h00');
  const [debit, setDebit] = useState('300');
  const [dialysat, setDialysat] = useState('Bicarbonate standard');
  const [showKits, setShowKits] = useState(false);
  const [selectedKit, setSelectedKit] = useState<string | null>(null);
  const [kitVu, setKitVu] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const current = getCurrentPatient();
    if (current.id) setPatient(current);
  }, []);

  const handlePatientSelected = (p: PatientData) => {
    setPatient(p);
    setCurrentPatient(p);
  };

  const demarrerSeance = () => {
    if (!patient?.id || !kitVu) return;

    const patientId = String(patient.id);
    const patientName = `${patient.prenoms} ${patient.nom}`;

    // Sauvegarder dans chu_seances_patient (utilisé par le Dashboard)
    const patientSeances = JSON.parse(localStorage.getItem('chu_seances_patient') || '{}');
    patientSeances[patientId] = {
      statut: 'en_cours',
      progression: 0,
      debut: new Date().toISOString(),
      patientName,
      type: typeDialyse,
      poste,
      duree,
    };
    localStorage.setItem('chu_seances_patient', JSON.stringify(patientSeances));

    // Mettre à jour les stats
    const stats = JSON.parse(localStorage.getItem('chu_seances_stats') || '{}');
    stats[patientId] = 'en_cours';
    localStorage.setItem('chu_seances_stats', JSON.stringify(stats));

    // Ajouter à l'historique
    const historiques = JSON.parse(localStorage.getItem('chu_seances_historique') || '[]');
    historiques.push({
      id: `SE-${Date.now()}`,
      patientId,
      patientName,
      type: typeDialyse,
      poste,
      duree,
      date: new Date().toISOString(),
      statut: 'en_cours',
    });
    localStorage.setItem('chu_seances_historique', JSON.stringify(historiques));

    router.push('/dashboard');
  };

  const sauvegarderBrouillon = () => {
    const brouillons = JSON.parse(localStorage.getItem('chu_seances_brouillons') || '[]');
    brouillons.push({ id: `BR-${Date.now()}`, patientId: patient?.id, patientName: patient ? `${patient.prenoms} ${patient.nom}` : '', type: typeDialyse, poste, duree, debit, dialysat, date: new Date().toISOString() });
    localStorage.setItem('chu_seances_brouillons', JSON.stringify(brouillons));
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="pt-6 pb-20 md:pb-8 px-4 md:px-6 lg:px-8 max-w-6xl mx-auto">
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-4"><span className="material-symbols-outlined text-sm mr-1">medical_services</span>Nouvelle Session</div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 font-manrope mb-2">Démarrer une nouvelle séance</h1>
          <p className="text-slate-500 text-sm">Paramètres cliniques pour initialiser la procédure de dialyse.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600"><span className="material-symbols-outlined">badge</span></div><h2 className="text-lg font-bold text-slate-800">Identification du Patient</h2></div>
              <PatientSearchInput onPatientSelected={handlePatientSelected} placeholder="Rechercher par ID patient..." />
              {patient && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[{ label: 'Âge', value: patient.age, icon: 'calendar_today' },{ label: 'Sexe', value: patient.sexe, icon: 'person' },{ label: 'Poids', value: `${patient.poids} kg`, icon: 'monitor_weight' },{ label: 'Gr. Sanguin', value: patient.groupeSanguin, icon: 'bloodtype' }].map(info => (<div key={info.label} className="bg-blue-50 rounded-xl p-3 text-center"><span className="material-symbols-outlined text-blue-400 text-sm">{info.icon}</span><p className="text-[10px] text-blue-500 mt-1">{info.label}</p><p className="text-sm font-bold text-blue-800">{info.value || '-'}</p></div>))}
                </motion.div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600"><span className="material-symbols-outlined">prescriptions</span></div><h2 className="text-lg font-bold text-slate-800">Vérification Kit {kitVu && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ml-2">✅ Vérifié</span>}</h2></div>
              {!showKits ? (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowKits(true)} className="w-full py-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-bold text-sm cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-purple-300"><span className="material-symbols-outlined text-lg">prescriptions</span>Voir les 4 kits disponibles</motion.button>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {KITS.map(kit => (
                      <motion.div key={kit.id} whileHover={{ y: -2 }} onClick={() => setSelectedKit(selectedKit === kit.id ? null : kit.id)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedKit === kit.id ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-slate-200 hover:border-purple-300'}`}><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kit.couleur} flex items-center justify-center text-white shadow-md`}><span className="material-symbols-outlined text-lg">{kit.icon}</span></div><div><p className="text-sm font-bold text-slate-800">{kit.titre}</p><p className="text-[10px] text-slate-400">{kit.description}</p></div>{selectedKit === kit.id && <span className="material-symbols-outlined text-purple-500 ml-auto">check_circle</span>}</div></motion.div>
                    ))}
                  </div>
                  {!kitVu ? (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setKitVu(true); setShowKits(false); }} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-lg cursor-pointer flex items-center justify-center gap-2"><span className="material-symbols-outlined text-lg">visibility</span>Kit vu - Je confirme avoir vérifié les kits</motion.button>
                  ) : (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center"><p className="text-sm font-bold text-emerald-700">✅ Kits vérifiés - Prêt à démarrer</p></div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600"><span className="material-symbols-outlined">tune</span></div><h2 className="text-lg font-bold text-slate-800">Paramètres de dialyse</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Type</label><select value={typeDialyse} onChange={(e) => setTypeDialyse(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none cursor-pointer"><option>Hémodialyse standard</option><option>Hémodiafiltration</option><option>Dialyse péritonéale</option></select></div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Poste</label><select value={poste} onChange={(e) => setPoste(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none cursor-pointer"><option>Poste A-12</option><option>Poste B-04</option><option>Poste C-01</option></select></div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Durée</label><select value={duree} onChange={(e) => setDuree(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none cursor-pointer"><option>3h00</option><option>3h30</option><option>4h00</option></select></div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Débit (ml/min)</label><input value={debit} onChange={(e) => setDebit(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none" type="text" /></div>
                <div className="md:col-span-2"><label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Dialysat</label><input value={dialysat} onChange={(e) => setDialysat(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none" type="text" /></div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Résumé</h2>
              <div className="space-y-3 mb-6">
                {[{ l: 'Patient', v: patient ? `${patient.prenoms} ${patient.nom}` : 'À sélectionner' },{ l: 'Type', v: typeDialyse },{ l: 'Poste', v: poste },{ l: 'Durée', v: duree },{ l: 'Débit', v: `${debit} ml/min` },{ l: 'Kit vérifié', v: kitVu ? '✅ Oui' : '❌ Non' }].map((item, i) => (<div key={i} className="flex justify-between py-2 border-b border-slate-50 last:border-none"><span className="text-xs text-slate-500">{item.l}</span><span className={`text-xs font-bold ${item.v === 'À sélectionner' || item.v === '❌ Non' ? 'text-red-400' : 'text-slate-700'}`}>{item.v}</span></div>))}
              </div>

              <motion.button whileHover={patient?.id && kitVu ? { scale: 1.02, boxShadow: '0 20px 40px -12px rgba(59,130,246,0.3)' } : {}} whileTap={patient?.id && kitVu ? { scale: 0.98 } : {}} onClick={demarrerSeance} disabled={!patient?.id || !kitVu} className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${patient?.id && kitVu ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}><span className="material-symbols-outlined text-lg">play_arrow</span>Démarrer la séance</motion.button>
              {patient?.id && !kitVu && <p className="text-[10px] text-amber-600 text-center mt-2">⚠ Kit obligatoire</p>}
              
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={sauvegarderBrouillon} className={`w-full py-3 mt-3 rounded-xl font-semibold text-sm transition-all border ${saved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200 cursor-pointer'}`}>{saved ? '✅ Brouillon sauvegardé' : 'Sauvegarder brouillon'}</motion.button>

              {patient?.antecedents && <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl"><p className="text-[10px] font-bold text-amber-700 uppercase">⚠ Antécédents</p><p className="text-xs text-amber-600 mt-1">{patient.antecedents}</p></div>}
              {patient?.allergie && <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl"><p className="text-[10px] font-bold text-red-700 uppercase">⚠ Allergie</p><p className="text-xs text-red-600 mt-1">{patient.allergie}</p></div>}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
