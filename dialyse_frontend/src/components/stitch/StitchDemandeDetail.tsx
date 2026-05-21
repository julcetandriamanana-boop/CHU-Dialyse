'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentPatient, PatientData, setCurrentPatient } from '@/src/stores/patient.store';
import PatientSearchInput from '@/src/components/patient/PatientSearchInput';

const VALIDATED_KEY = 'dialyse_validated_prescriptions';

export default function StitchDemandeDetail() {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [specialistComment, setSpecialistComment] = useState('');
  const [diagnostic, setDiagnostic] = useState('Oedème Cérébral Osmotique');
  const [priorite, setPriorite] = useState('critique');
  const [motif, setMotif] = useState('Suspicion de syndrome de déséquilibre de dialyse');
  const [submitted, setSubmitted] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [demandeId] = useState(`DA-${Date.now().toString().slice(-4)}`);

  useEffect(() => {
    const current = getCurrentPatient();
    if (current.id) setPatient(current);
  }, []);

  const handlePatientSelected = (p: PatientData) => {
    setPatient(p);
    setCurrentPatient(p);
  };

  const marquerTraitee = () => {
    const traitees = JSON.parse(localStorage.getItem('demandes_traitees') || '[]');
    traitees.push(demandeId);
    localStorage.setItem('demandes_traitees', JSON.stringify(traitees));
  };

  const accepterDemande = () => {
    if (!patient?.id) return;
    marquerTraitee();
    const saved = JSON.parse(localStorage.getItem(VALIDATED_KEY) || '[]');
    saved.unshift({
      id: `AVIS-${Date.now()}`,
      type: "demande d'avis",
      patientName: `${patient.prenoms} ${patient.nom}`,
      patientId: patient.id,
      validatedAt: new Date().toISOString(),
      details: { motif, diagnostic, priorite, commentaire: specialistComment || 'Avis validé' },
    });
    localStorage.setItem(VALIDATED_KEY, JSON.stringify(saved));
    setSubmitted(true);
    setTimeout(() => router.push('/demandes-avis'), 1500);
  };

  const refuserDemande = () => {
    if (!specialistComment.trim()) {
      alert('Avis obligatoire pour refuser !');
      return;
    }
    marquerTraitee();
    const saved = JSON.parse(localStorage.getItem(VALIDATED_KEY) || '[]');
    saved.unshift({
      id: `REFUS-${Date.now()}`,
      type: "demande d'avis refusée",
      patientName: patient ? `${patient.prenoms} ${patient.nom}` : 'Inconnu',
      patientId: patient?.id || '',
      validatedAt: new Date().toISOString(),
      details: { motif, raison: specialistComment, priorite },
    });
    localStorage.setItem(VALIDATED_KEY, JSON.stringify(saved));
    setRejected(true);
    setTimeout(() => router.push('/demandes-avis'), 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center bg-white rounded-2xl p-8 shadow-xl border border-emerald-200">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5 }} className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="material-symbols-outlined text-emerald-600 text-4xl">check_circle</span></motion.div>
          <h2 className="text-xl font-black text-slate-800 mb-2">Demande acceptée !</h2><p className="text-slate-500 text-sm">Redirection...</p>
        </motion.div>
      </div>
    );
  }

  if (rejected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center bg-white rounded-2xl p-8 shadow-xl border border-red-200">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="material-symbols-outlined text-red-600 text-4xl">cancel</span></div>
          <h2 className="text-xl font-black text-slate-800 mb-2">Demande refusée</h2><p className="text-slate-500 text-sm">Redirection...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="pt-6 pb-20 md:pb-8 px-4 md:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} onClick={() => router.push('/demandes-avis')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 group"><span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span><span className="text-sm font-semibold">Retour aux demandes</span></motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shadow-md"><span className="material-symbols-outlined text-red-600 text-2xl">emergency</span></div><div><h1 className="text-xl font-black text-slate-800">Demande d&apos;avis #{demandeId}</h1><p className="text-xs text-slate-400">Reçue le {new Date().toLocaleDateString('fr-FR')}</p></div></div><motion.span animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-xs font-bold uppercase border border-red-200">⚡ {priorite === 'critique' ? 'URGENT · STAT' : priorite.toUpperCase()}</motion.span></div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4"><span className="w-1.5 h-6 bg-blue-600 rounded-full"></span> Patient concerné</h2>
              <PatientSearchInput onPatientSelected={handlePatientSelected} placeholder="Cliquer pour sélectionner un patient..." />
              {patient && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[{ label: 'Nom', value: `${patient.prenoms} ${patient.nom}` },{ label: 'Âge', value: `${patient.age || '-'} ans` },{ label: 'Sexe', value: patient.sexe || '-' },{ label: 'Poids', value: patient.poids ? `${patient.poids} kg` : '-' },{ label: 'Gr. Sanguin', value: patient.groupeSanguin || '-' },{ label: 'Téléphone', value: patient.telephone || '-' },{ label: 'Néphrologue', value: patient.nephrologue || '-' },{ label: 'Allergie', value: patient.allergie || 'Aucune', alert: patient.allergie && patient.allergie !== 'Aucune' },].map(info => (<div key={info.label} className={`rounded-xl p-3 ${info.alert ? 'bg-red-50 border border-red-200' : 'bg-slate-50'}`}><p className={`text-[10px] ${info.alert ? 'text-red-500' : 'text-slate-400'}`}>{info.label}</p><p className={`text-xs font-bold ${info.alert ? 'text-red-700' : 'text-slate-700'}`}>{info.value}</p></div>))}
                </motion.div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4"><span className="w-1.5 h-6 bg-purple-600 rounded-full"></span> Détails cliniques</h2>
              <div className="space-y-4"><div><label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Motif</label><textarea value={motif} onChange={(e) => setMotif(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none resize-none" rows={2} /></div><div><label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Diagnostic</label><select value={diagnostic} onChange={(e) => setDiagnostic(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none cursor-pointer"><option>Oedème Cérébral Osmotique</option><option>Hyperkaliémie aiguë</option><option>Péricardite urémique</option><option>Hypotension intradialytique</option></select></div><div><label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Priorité</label><div className="flex gap-2">{['critique','haute','moyenne','basse'].map(p => (<motion.button key={p} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setPriorite(p)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${priorite === p ? (p==='critique'?'bg-red-600 text-white shadow-lg':p==='haute'?'bg-orange-600 text-white shadow-lg':'bg-blue-600 text-white shadow-lg') : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'}`}>{p.charAt(0).toUpperCase()+p.slice(1)}</motion.button>))}</div></div></div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4"><span className="w-1.5 h-6 bg-emerald-600 rounded-full"></span> Avis du spécialiste</h2>
              <textarea value={specialistComment} onChange={(e) => setSpecialistComment(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none resize-none mb-4" rows={4} placeholder="Votre avis médical..." />
              <div className="flex gap-3">
                <motion.button whileHover={patient?.id ? { scale: 1.02 } : {}} whileTap={patient?.id ? { scale: 0.98 } : {}} onClick={accepterDemande} disabled={!patient?.id} className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${patient?.id ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}><span className="material-symbols-outlined text-lg">check_circle</span>Accepter</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={refuserDemande} className="flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"><span className="material-symbols-outlined text-lg">cancel</span>Refuser</motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sticky top-24">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Actions</h3>
              <div className="space-y-2"><motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-slate-50 text-slate-600 hover:bg-slate-100 border cursor-pointer"><span className="material-symbols-outlined text-lg">chat</span>Demander précisions</motion.button><motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-slate-50 text-slate-600 hover:bg-slate-100 border cursor-pointer"><span className="material-symbols-outlined text-lg">schedule</span>Reporter</motion.button></div>
              {patient && (<div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100"><p className="text-[10px] font-bold text-blue-600 uppercase mb-2">Patient lié</p><p className="text-sm font-bold text-blue-800">{patient.prenoms} {patient.nom}</p><p className="text-xs text-blue-500">{patient.id} · {patient.age} ans</p></div>)}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
