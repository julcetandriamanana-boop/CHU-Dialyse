'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface DemandeAvisDB {
  id: number;
  patient: { id: number; nom: string; prenom: string };
  description_cas: string;
  priorite: string;
  date_envoi: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function StitchDemandesAvis() {
  const router = useRouter();
  const [demandes, setDemandes] = useState<DemandeAvisDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadDemandes();
  }, [filter]);

  const loadDemandes = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/demandes-avis`;
      if (filter !== 'all') url += `?priorite=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        const traitees = JSON.parse(localStorage.getItem('demandes_traitees') || '[]');
        setDemandes(data.filter((d: DemandeAvisDB) => !traitees.includes(String(d.id))));
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const consulterDossier = (id: number) => {
    router.push(`/demandes-avis/detail?id=${id}`);
  };

  const nouvelleDemande = () => {
    router.push('/demandes-avis/nouveau');
  };

  const stats = {
    total: demandes.length,
    critique: demandes.filter(d => d.priorite === 'critique').length,
    haute: demandes.filter(d => d.priorite === 'haute').length,
    moyenne: demandes.filter(d => d.priorite === 'moyenne').length,
    basse: demandes.filter(d => d.priorite === 'basse').length,
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="pt-6 px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto w-full shrink-0">
        <motion.nav initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-4">
          <span>Espace Clinique</span><span className="material-symbols-outlined text-sm">chevron_right</span><span className="text-blue-600 font-bold">Demandes d'avis</span>
        </motion.nav>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div><h1 className="text-2xl md:text-3xl font-black text-slate-800 font-manrope">Demandes d'avis reçues</h1><p className="text-slate-500 text-sm mt-1">{demandes.length} demandes</p></div>
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setFilter(filter==='all'?'critique':filter==='critique'?'haute':filter==='haute'?'moyenne':'all')} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 shadow-sm">
              <span className="material-symbols-outlined text-lg">filter_list</span>{filter==='all'?'Filtrer':filter==='critique'?'Critiques':filter==='haute'?'Hautes':'Moyennes'}
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={nouvelleDemande} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/20">
              <span className="material-symbols-outlined text-lg">add</span>Nouvelle demande
            </motion.button>
          </div>
        </motion.div>
        <div className="flex gap-3 mb-4">
          {[{ key: 'all', label: 'Toutes', count: stats.total, color: 'bg-slate-100 text-slate-600' },{ key: 'critique', label: 'Critiques', count: stats.critique, color: 'bg-red-50 text-red-600' },{ key: 'haute', label: 'Hautes', count: stats.haute, color: 'bg-orange-50 text-orange-600' },{ key: 'moyenne', label: 'Moyennes', count: stats.moyenne, color: 'bg-blue-50 text-blue-600' }].map(item => (
            <motion.button key={item.key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFilter(item.key)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${item.color} ${filter===item.key?'ring-2 ring-offset-1 ring-blue-400':''}`}>{item.label} ({item.count})</motion.button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto w-full pb-8">
        {loading ? (
          <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div><p className="text-slate-500">Chargement...</p></div>
        ) : (
          <motion.div variants={{ animate: { transition: { staggerChildren: 0.1 } } }} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {demandes.map((demande) => (
              <motion.div key={demande.id} variants={fadeInUp} whileHover={{ y: -6, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)' }} onClick={() => consulterDossier(demande.id)} className={`relative overflow-hidden bg-white rounded-2xl border shadow-sm cursor-pointer transition-all ${demande.priorite==='critique'?'border-red-200/60 hover:border-red-300':demande.priorite==='haute'?'border-orange-200/60 hover:border-orange-300':demande.priorite==='basse'?'border-slate-200/60 hover:border-slate-300':'border-slate-200/60 hover:border-blue-200'}`}>
                {demande.priorite==='critique' && <div className="absolute top-0 right-0"><motion.div animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="bg-red-500 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">STAT</motion.div></div>}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">DA-00{demande.id}</span><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${demande.priorite==='critique'?'bg-red-50 text-red-600 border border-red-200':demande.priorite==='haute'?'bg-orange-50 text-orange-600 border border-orange-200':demande.priorite==='basse'?'bg-slate-100 text-slate-500 border border-slate-200':'bg-blue-50 text-blue-600 border border-blue-200'}`}>{demande.priorite}</span></div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-lg ${demande.priorite==='critique'?'bg-gradient-to-br from-red-500 to-red-600':demande.priorite==='haute'?'bg-gradient-to-br from-orange-500 to-orange-600':demande.priorite==='basse'?'bg-gradient-to-br from-slate-400 to-slate-500':'bg-gradient-to-br from-blue-500 to-blue-600'}`}>{demande.patient.prenom.charAt(0)}{demande.patient.nom.charAt(0)}</div>
                    <div><p className="font-bold text-sm text-slate-800">{demande.patient.prenom} {demande.patient.nom}</p><p className="text-[10px] text-slate-400">{new Date(demande.date_envoi).toLocaleDateString('fr-FR')}</p></div>
                  </div>
                  <p className="text-sm text-slate-600 font-medium mb-4">{demande.description_cas}</p>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={(e)=>{e.stopPropagation();consulterDossier(demande.id);}} className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${demande.priorite==='critique'?'bg-red-50 hover:bg-red-100 text-red-600':'bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600'}`}>Consulter le dossier</motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
