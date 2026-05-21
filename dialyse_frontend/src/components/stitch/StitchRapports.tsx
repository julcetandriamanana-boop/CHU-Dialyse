'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const RAPPORTS_INITIAUX = [
  {
    id: 1,
    titre: 'Rapport mensuel - Mai 2026',
    type: 'Statistique',
    date: '12/05/2026',
    statut: 'Généré',
    taille: '2.4 MB',
    auteur: 'Dr. Andrianjato',
    description: 'Récapitulatif mensuel des séances de dialyse',
    contenu: {
      seances: 380,
      patients: 78,
      nouvelles: 5,
      urgences: 12,
    },
  },
  {
    id: 2,
    titre: 'Bilan trimestriel Q1 2026',
    type: 'Analyse',
    date: '01/04/2026',
    statut: 'Validé',
    taille: '5.1 MB',
    auteur: 'Dr. Rakoto',
    description: 'Analyse complète du premier trimestre',
    contenu: {
      seances: 1140,
      patients: 85,
      nouvelles: 15,
      urgences: 34,
    },
  },
  {
    id: 3,
    titre: 'Rapport de conformité',
    type: 'Réglementaire',
    date: '15/03/2026',
    statut: 'En attente',
    taille: '1.8 MB',
    auteur: 'Dr. Rabary',
    description: 'Vérification des normes et protocoles',
    contenu: {
      conformite: '92%',
      ecarts: 3,
      actions: 8,
    },
  },
  {
    id: 4,
    titre: 'Statistiques patients - Avril 2026',
    type: 'Statistique',
    date: '28/02/2026',
    statut: 'Généré',
    taille: '3.2 MB',
    auteur: 'Dr. Andrianjato',
    description: 'Statistiques détaillées par patient',
    contenu: {
      seances: 420,
      patients: 82,
      nouvelles: 7,
      urgences: 9,
    },
  },
  {
    id: 5,
    titre: 'Rapport d\'activité - Mars 2026',
    type: 'Statistique',
    date: '31/03/2026',
    statut: 'Généré',
    taille: '2.9 MB',
    auteur: 'Dr. Rakoto',
    description: 'Activité mensuelle du service',
    contenu: {
      seances: 395,
      patients: 80,
      nouvelles: 4,
      urgences: 11,
    },
  },
  {
    id: 6,
    titre: 'Audit qualité - Février 2026',
    type: 'Réglementaire',
    date: '20/02/2026',
    statut: 'Validé',
    taille: '4.5 MB',
    auteur: 'Dr. Rabary',
    description: 'Audit qualité semestriel',
    contenu: {
      conformite: '96%',
      ecarts: 1,
      actions: 3,
    },
  },
  {
    id: 7,
    titre: 'Rapport épidémiologique',
    type: 'Analyse',
    date: '10/01/2026',
    statut: 'Validé',
    taille: '6.3 MB',
    auteur: 'Dr. Andrianjato',
    description: 'Analyse épidémiologique annuelle',
    contenu: {
      seances: 4560,
      patients: 90,
      nouvelles: 22,
      urgences: 45,
    },
  },
  {
    id: 8,
    titre: 'Rapport maintenance machines',
    type: 'Technique',
    date: '05/05/2026',
    statut: 'En attente',
    taille: '1.2 MB',
    auteur: 'Tech. Rasoa',
    description: 'État des machines de dialyse',
    contenu: {
      machines: 8,
      operationnelles: 7,
      maintenance: 1,
    },
  },
];

export default function StitchRapports() {
  const [rapports] = useState(RAPPORTS_INITIAUX);
  const [selectedRapport, setSelectedRapport] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredRapports = rapports.filter(r => {
    const matchSearch = r.titre.toLowerCase().includes(search.toLowerCase()) ||
                        r.auteur.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || r.type === filterType;
    return matchSearch && matchType;
  });

  const types = ['all', ...new Set(rapports.map(r => r.type))];

  const stats = {
    total: rapports.length,
    generes: rapports.filter(r => r.statut === 'Généré').length,
    valides: rapports.filter(r => r.statut === 'Validé').length,
    enAttente: rapports.filter(r => r.statut === 'En attente').length,
  };

  const handleView = (id: number) => {
    setSelectedRapport(selectedRapport === id ? null : id);
  };

  const handleDownload = (rapport: typeof RAPPORTS_INITIAUX[0]) => {
    const dataStr = JSON.stringify(rapport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rapport.titre.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification(`📥 ${rapport.titre} téléchargé !`);
  };

  const handlePrint = (rapport: typeof RAPPORTS_INITIAUX[0]) => {
    window.print();
    showNotification(`🖨 Impression de ${rapport.titre}`);
  };

  const handleGenerer = () => {
    showNotification('📊 Nouveau rapport en cours de génération...');
    setTimeout(() => showNotification('✅ Rapport généré avec succès !'), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="pt-6 pb-20 md:pb-8 px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto">
        
        <AnimatePresence>
          {notification && (
            <motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-4 left-1/2 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.nav initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-4">
          <span>Espace Clinique</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-slate-600 font-bold">Rapports</span>
        </motion.nav>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 font-manrope">Rapports</h1>
            <p className="text-slate-500 text-sm mt-1">{rapports.length} rapports disponibles</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleGenerer} className="px-5 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-lg">add</span>
            Générer un rapport
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, icon: 'description', color: 'from-slate-500 to-slate-600' },
            { label: 'Générés', value: stats.generes, icon: 'check_circle', color: 'from-emerald-500 to-emerald-600' },
            { label: 'Validés', value: stats.valides, icon: 'verified', color: 'from-blue-500 to-blue-600' },
            { label: 'En attente', value: stats.enAttente, icon: 'schedule', color: 'from-amber-500 to-amber-600' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                <span className="material-symbols-outlined text-xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">{stat.label}</p>
                <p className="text-2xl font-black text-slate-800">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filtres */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
            </div>
            <div className="flex items-center gap-2">
              {types.map(type => (
                <motion.button key={type} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFilterType(type)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterType === type ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>
                  {type === 'all' ? 'Tous' : type}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Liste des rapports */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="text-left py-4 pl-6">Titre</th>
                  <th className="text-left py-4">Type</th>
                  <th className="text-left py-4">Auteur</th>
                  <th className="text-left py-4">Date</th>
                  <th className="text-center py-4">Statut</th>
                  <th className="text-center py-4">Taille</th>
                  <th className="text-right py-4 pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRapports.map((rapport, index) => (
                  <motion.tr
                    key={rapport.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: '#f8fafc' }}
                    className="group cursor-pointer transition-colors"
                    onClick={() => handleView(rapport.id)}
                  >
                    <td className="py-4 pl-6">
                      <div>
                        <p className="font-bold text-sm text-slate-800">{rapport.titre}</p>
                        <p className="text-[10px] text-slate-400">{rapport.description}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-xs text-slate-600">{rapport.type}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-xs text-slate-600">{rapport.auteur}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-xs text-slate-500">{rapport.date}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        rapport.statut === 'Généré' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        rapport.statut === 'Validé' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                        'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {rapport.statut}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="text-xs text-slate-500">{rapport.taille}</span>
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleView(rapport.id); }} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer" title="Voir détails">
                          <span className="material-symbols-outlined text-slate-500 text-lg">{selectedRapport === rapport.id ? 'visibility_off' : 'visibility'}</span>
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleDownload(rapport); }} className="p-2 hover:bg-blue-50 rounded-lg cursor-pointer" title="Télécharger">
                          <span className="material-symbols-outlined text-blue-500 text-lg">download</span>
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handlePrint(rapport); }} className="p-2 hover:bg-emerald-50 rounded-lg cursor-pointer" title="Imprimer">
                          <span className="material-symbols-outlined text-emerald-500 text-lg">print</span>
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Détails expandable */}
          <AnimatePresence>
            {selectedRapport && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t-2 border-blue-100">
                {(() => {
                  const rapport = rapports.find(r => r.id === selectedRapport);
                  if (!rapport) return null;
                  return (
                    <div className="p-6 bg-gradient-to-r from-blue-50/50 to-white">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-slate-800">{rapport.titre}</h3>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedRapport(null)} className="p-1 text-slate-400 hover:text-red-500 cursor-pointer">
                          <span className="material-symbols-outlined">close</span>
                        </motion.button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(rapport.contenu).map(([key, value]) => (
                          <div key={key} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                            <p className="text-[10px] text-slate-400 uppercase font-semibold">{key}</p>
                            <p className="text-xl font-black text-slate-800">{value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-3 mt-4">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleDownload(rapport)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">download</span> Télécharger
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handlePrint(rapport)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">print</span> Imprimer
                        </motion.button>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
