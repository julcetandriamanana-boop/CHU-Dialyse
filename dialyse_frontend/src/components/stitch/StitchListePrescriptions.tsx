'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setPatientFromDB } from '@/src/stores/patient.store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PrescriptionDB {
  id: number;
  patient: { id: number; nom: string; prenom: string; telephone?: string };
  medecin?: { nom: string };
  date_prescription: string;
  medicament: string;
  dosage: string;
  frequence: string;
  workflow_statut: string;
}

export default function StitchListePrescriptions() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<PrescriptionDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [dossierOuvert, setDossierOuvert] = useState<number | null>(null);
  const [valideesCount, setValideesCount] = useState(0);

  useEffect(() => {
    loadPrescriptions();
    loadValideesCount();
  }, [filterStatus, dateStart, dateEnd]);

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (dateStart) params.append('startDate', dateStart);
      if (dateEnd) params.append('endDate', dateEnd);
      const url = `${API_URL}/prescriptions/en-attente?${params}`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setPrescriptions(data);
    } catch (err) { console.error('Erreur:', err); }
    setLoading(false);
  };

  const loadValideesCount = async () => {
    try {
      const res = await fetch(`${API_URL}/prescriptions/validees`);
      const data = await res.json();
      if (Array.isArray(data)) setValideesCount(data.length);
    } catch (err) {}
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePrendreRdv = (presc: PrescriptionDB) => {
    setPatientFromDB({ id: presc.patient.id, nom: presc.patient.nom, prenom: presc.patient.prenom, telephone: presc.patient.telephone });
    router.push('/rendez-vous');
  };

  const handleVoirDossier = (presc: PrescriptionDB) => {
    setExpandedId(null);
    setDossierOuvert(dossierOuvert === presc.patient.id ? null : presc.patient.id);
  };

  const stats = {
    total: prescriptions.length,
    urgence: prescriptions.filter(p => p.workflow_statut === 'actif').length,
    en_attente: prescriptions.filter(p => p.workflow_statut === 'brouillon').length,
    suspendu: prescriptions.filter(p => p.workflow_statut === 'suspendu').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="pt-6 pb-20 md:pb-8 px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto">
        
        <AnimatePresence>
          {notification && (
            <motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-4 left-1/2 z-50 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>{notification}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.nav initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-4">
          <span>Vitalis Core</span><span className="material-symbols-outlined text-sm">chevron_right</span><span className="text-blue-600 font-bold">Registre des Prescriptions</span>
        </motion.nav>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 font-manrope">Prescriptions</h1>
            <p className="text-slate-500 text-sm mt-1">Gérez et validez les protocoles cliniques. Prenez RDV pour valider une prescription.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {[
              { key: 'all', label: 'Toutes', value: stats.total, color: 'bg-slate-100 text-slate-700' },
              { key: 'actif', label: 'Urgences', value: stats.urgence, color: 'bg-red-50 text-red-700' },
              { key: 'brouillon', label: 'En attente', value: stats.en_attente, color: 'bg-amber-50 text-amber-700' },
              { key: 'suspendu', label: 'Suspendues', value: stats.suspendu, color: 'bg-purple-50 text-purple-700' },
              { key: 'validees', label: 'Validées', value: valideesCount, color: 'bg-emerald-50 text-emerald-700', link: '/dialyses/prescriptions-validees' },
            ].map((stat) => (
              <motion.button key={stat.key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => stat.link ? router.push(stat.link) : setFilterStatus(stat.key)} className={`${stat.color} rounded-2xl p-3 text-left transition-all cursor-pointer ${filterStatus === stat.key ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}>
                <p className="text-xl font-black">{stat.value}</p><p className="text-[10px] font-semibold opacity-70">{stat.label}</p>
              </motion.button>
            ))}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><span className="material-symbols-outlined text-sm">date_range</span>Filtre par dates :</span>
            <div className="flex items-center gap-2">
              <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer" />
              <span className="text-slate-400 text-xs">→</span>
              <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer" />
              {(dateStart || dateEnd) && (<motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => { setDateStart(''); setDateEnd(''); }} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 cursor-pointer"><span className="material-symbols-outlined text-sm">close</span></motion.button>)}
            </div>
            <span className="text-[10px] text-slate-400">{prescriptions.length} résultat{prescriptions.length > 1 ? 's' : ''}</span>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div><p className="text-slate-500">Chargement depuis MySQL...</p></div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {prescriptions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-12 text-center"><span className="material-symbols-outlined text-5xl text-slate-300 mb-4">inventory_2</span><h3 className="text-lg font-bold text-slate-500 mb-2">Aucune prescription trouvée</h3></div>
            ) : (
              prescriptions.map((presc, index) => (
                <motion.div key={presc.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className={`bg-white rounded-2xl border shadow-sm overflow-hidden group ${presc.workflow_statut === 'actif' ? 'border-red-200/60' : 'border-slate-200/60'}`}>
                  <div className="p-5 flex items-center gap-4 cursor-pointer hover:bg-slate-50/50" onClick={() => setExpandedId(expandedId === presc.id ? null : presc.id)}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${presc.workflow_statut === 'actif' ? 'bg-red-100 text-red-600' : presc.workflow_statut === 'brouillon' ? 'bg-amber-100 text-amber-600' : presc.workflow_statut === 'suspendu' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      <span className="material-symbols-outlined text-xl">{presc.workflow_statut === 'actif' ? 'emergency' : 'schedule'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${presc.workflow_statut === 'actif' ? 'bg-red-50 text-red-600' : presc.workflow_statut === 'brouillon' ? 'bg-amber-50 text-amber-600' : presc.workflow_statut === 'suspendu' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {presc.workflow_statut === 'actif' ? '⚠ Urgence' : presc.workflow_statut === 'brouillon' ? '⏳ En attente' : presc.workflow_statut}
                        </span>
                        <span className="text-[10px] text-slate-400">#{presc.id}</span>
                      </div>
                      <p className="font-bold text-sm text-slate-800">{presc.patient?.prenom} {presc.patient?.nom}</p>
                      <p className="text-[10px] text-slate-400">{presc.medicament} · {presc.dosage} · {new Date(presc.date_prescription).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === presc.id ? null : presc.id); }} className={`p-2 rounded-xl transition-all cursor-pointer ${expandedId === presc.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`} title="Voir détails"><span className="material-symbols-outlined text-lg">{expandedId === presc.id ? 'visibility_off' : 'visibility'}</span></motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); handleVoirDossier(presc); }} className="p-2 bg-slate-100 hover:bg-blue-50 rounded-xl transition-all cursor-pointer" title="Dossier patient (service externe)"><span className="material-symbols-outlined text-slate-500 hover:text-blue-600 text-lg">folder_open</span></motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); handlePrendreRdv(presc); }} className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${presc.workflow_statut === 'actif' ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'}`}><span className="material-symbols-outlined text-sm">event</span>Prendre RDV</motion.button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedId === presc.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-100">
                        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/50">
                          <div className="bg-white rounded-xl p-3 border border-slate-100"><p className="text-[9px] text-slate-400">Date prescription</p><p className="text-xs font-bold">{new Date(presc.date_prescription).toLocaleDateString('fr-FR')}</p></div>
                          <div className="bg-white rounded-xl p-3 border border-slate-100"><p className="text-[9px] text-slate-400">Médicament</p><p className="text-xs font-bold text-blue-600">{presc.medicament}</p></div>
                          <div className="bg-white rounded-xl p-3 border border-slate-100"><p className="text-[9px] text-slate-400">Dosage</p><p className="text-xs font-bold">{presc.dosage}</p></div>
                          <div className="bg-white rounded-xl p-3 border border-slate-100"><p className="text-[9px] text-slate-400">Fréquence</p><p className="text-xs font-bold">{presc.frequence}</p></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {/* DOSSIER PATIENT - Service externe, juste ouvrable */}
                  <AnimatePresence>
                    {dossierOuvert === presc.patient.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t-2 border-blue-200">
                        <div className="p-5 bg-gradient-to-r from-blue-50/50 to-white text-center">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-blue-800">Dossier patient - Service Clinique</h3>
                            <button onClick={() => setDossierOuvert(null)} className="p-1 text-slate-400 hover:text-red-500"><span className="material-symbols-outlined">close</span></button>
                          </div>
                          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-blue-600 text-4xl">folder_open</span>
                          </div>
                          <p className="text-sm font-bold text-blue-800">{presc.patient?.prenom} {presc.patient?.nom}</p>
                          <p className="text-xs text-blue-500 mt-1">Dossier externe - Clinique partenaire</p>
                          <p className="text-xs text-slate-400 mt-3">Les informations détaillées seront disponibles après synchronisation avec le service clinique.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
