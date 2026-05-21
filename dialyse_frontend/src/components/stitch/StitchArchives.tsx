'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';

const ARCHIVES = [
  { id: 'ARC-001', mois: 'Mai 2026', annee: '2026', moisNum: 5, dossiers: 142, seances: 380, patients: 78, type: 'Mensuel', statut: 'Complet', service: 'Néphrologie', responsable: 'Dr. Andrianjato', dateDebut: '2026-05-01', dateFin: '2026-05-31',
    patientsList: ['Elena Ross', 'Marcus Jensen', 'Hélène Bernard', 'Sophie Martin', 'Pierre Durant', 'Anne Laurent', 'Luc Bernard', 'Claire Dubois'] },
  { id: 'ARC-002', mois: 'Avril 2026', annee: '2026', moisNum: 4, dossiers: 156, seances: 420, patients: 85, type: 'Mensuel', statut: 'Complet', service: 'Néphrologie', responsable: 'Dr. Rakoto', dateDebut: '2026-04-01', dateFin: '2026-04-30',
    patientsList: ['Elena Ross', 'Marcus Jensen', 'Hélène Bernard', 'Robert N.', 'Marie T.', 'Jean F.', 'Julie K.', 'Paul M.', 'Sandra W.'] },
  { id: 'ARC-003', mois: 'Mars 2026', annee: '2026', moisNum: 3, dossiers: 128, seances: 350, patients: 72, type: 'Mensuel', statut: 'Complet', service: 'Néphrologie', responsable: 'Dr. Andrianjato', dateDebut: '2026-03-01', dateFin: '2026-03-31',
    patientsList: ['Elena Ross', 'Hélène Bernard', 'Sophie Martin', 'Pierre Durant'] },
  { id: 'ARC-004', mois: 'Février 2026', annee: '2026', moisNum: 2, dossiers: 165, seances: 445, patients: 90, type: 'Mensuel', statut: 'Complet', service: 'Néphrologie', responsable: 'Dr. Rabary', dateDebut: '2026-02-01', dateFin: '2026-02-28',
    patientsList: ['Marcus Jensen', 'Luc Bernard', 'Claire Dubois', 'Anne Laurent'] },
  { id: 'ARC-005', mois: 'Janvier 2026', annee: '2026', moisNum: 1, dossiers: 138, seances: 370, patients: 75, type: 'Mensuel', statut: 'Complet', service: 'Néphrologie', responsable: 'Dr. Andrianjato', dateDebut: '2026-01-01', dateFin: '2026-01-31',
    patientsList: ['Elena Ross', 'Hélène Bernard', 'Robert N.', 'Marie T.'] },
  { id: 'ARC-006', mois: 'Décembre 2025', annee: '2025', moisNum: 12, dossiers: 145, seances: 390, patients: 80, type: 'Mensuel', statut: 'Complet', service: 'Néphrologie', responsable: 'Dr. Rakoto', dateDebut: '2025-12-01', dateFin: '2025-12-31',
    patientsList: ['Jean F.', 'Julie K.', 'Paul M.', 'Sandra W.'] },
  { id: 'ARC-007', mois: 'Novembre 2025', annee: '2025', moisNum: 11, dossiers: 152, seances: 410, patients: 83, type: 'Mensuel', statut: 'Complet', service: 'Néphrologie', responsable: 'Dr. Andrianjato', dateDebut: '2025-11-01', dateFin: '2025-11-30',
    patientsList: ['Elena Ross', 'Marcus Jensen', 'Sophie Martin'] },
  { id: 'ARC-008', mois: 'Octobre 2025', annee: '2025', moisNum: 10, dossiers: 133, seances: 360, patients: 70, type: 'Mensuel', statut: 'Complet', service: 'Néphrologie', responsable: 'Dr. Rabary', dateDebut: '2025-10-01', dateFin: '2025-10-31',
    patientsList: ['Pierre Durant', 'Anne Laurent', 'Luc Bernard'] },
  { id: 'ARC-009', mois: 'Septembre 2025', annee: '2025', moisNum: 9, dossiers: 148, seances: 400, patients: 82, type: 'Mensuel', statut: 'Complet', service: 'Néphrologie', responsable: 'Dr. Andrianjato', dateDebut: '2025-09-01', dateFin: '2025-09-30',
    patientsList: ['Elena Ross', 'Hélène Bernard', 'Claire Dubois', 'Robert N.'] },
  { id: 'ARC-010', mois: 'Août 2025', annee: '2025', moisNum: 8, dossiers: 140, seances: 385, patients: 77, type: 'Mensuel', statut: 'Complet', service: 'Néphrologie', responsable: 'Dr. Rakoto', dateDebut: '2025-08-01', dateFin: '2025-08-31',
    patientsList: ['Marcus Jensen', 'Marie T.', 'Jean F.'] },
  { id: 'ARC-011', mois: 'Juillet 2025', annee: '2025', moisNum: 7, dossiers: 135, seances: 375, patients: 73, type: 'Mensuel', statut: 'Complet', service: 'Néphrologie', responsable: 'Dr. Andrianjato', dateDebut: '2025-07-01', dateFin: '2025-07-31',
    patientsList: ['Julie K.', 'Paul M.', 'Sandra W.'] },
  { id: 'ARC-012', mois: 'Juin 2025', annee: '2025', moisNum: 6, dossiers: 155, seances: 430, patients: 88, type: 'Mensuel', statut: 'Complet', service: 'Néphrologie', responsable: 'Dr. Rabary', dateDebut: '2025-06-01', dateFin: '2025-06-30',
    patientsList: ['Elena Ross', 'Sophie Martin', 'Pierre Durant', 'Anne Laurent'] },
];

export default function StitchArchives() {
  const [search, setSearch] = useState('');
  const [selectedArchive, setSelectedArchive] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredArchives = useMemo(() => {
    let result = ARCHIVES;

    if (filterYear !== 'all') {
      result = result.filter(a => a.annee === filterYear);
    }

    if (dateStart) {
      result = result.filter(a => a.dateFin >= dateStart);
    }
    if (dateEnd) {
      result = result.filter(a => a.dateDebut <= dateEnd);
    }

    // Recherche dans TOUS les champs + patients
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(a => {
        const matchMain = (
          a.mois.toLowerCase().includes(q) ||
          a.annee.includes(q) ||
          String(a.dossiers).includes(q) ||
          String(a.seances).includes(q) ||
          String(a.patients).includes(q) ||
          a.type.toLowerCase().includes(q) ||
          a.statut.toLowerCase().includes(q) ||
          a.service.toLowerCase().includes(q) ||
          a.responsable.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          (q.startsWith('>') && !isNaN(parseInt(q.slice(1))) && a.seances > parseInt(q.slice(1))) ||
          (q.startsWith('<') && !isNaN(parseInt(q.slice(1))) && a.seances < parseInt(q.slice(1)))
        );
        // Recherche dans la liste des patients
        const matchPatients = a.patientsList.some(p => p.toLowerCase().includes(q));
        return matchMain || matchPatients;
      });
    }

    return result;
  }, [search, filterYear, dateStart, dateEnd]);

  const years = ['all', ...new Set(ARCHIVES.map(a => a.annee))];

  const statsFiltered = {
    dossiers: filteredArchives.reduce((s, a) => s + a.dossiers, 0),
    seances: filteredArchives.reduce((s, a) => s + a.seances, 0),
    patients: filteredArchives.reduce((s, a) => s + a.patients, 0),
  };

  const statsGlobal = {
    totalDossiers: ARCHIVES.reduce((s, a) => s + a.dossiers, 0),
    totalSeances: ARCHIVES.reduce((s, a) => s + a.seances, 0),
    totalPatients: ARCHIVES.reduce((s, a) => s + a.patients, 0),
    nbMois: ARCHIVES.length,
  };

  const handleDownload = (archive: typeof ARCHIVES[0]) => {
    const dataStr = JSON.stringify(archive, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archive_${archive.mois.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification(`📥 Archive ${archive.mois} téléchargée !`);
  };

  const handleExportAll = () => {
    const dataStr = JSON.stringify(filteredArchives, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archives_${filterYear !== 'all' ? filterYear : 'tout'}_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification(`📥 ${filteredArchives.length} archives exportées !`);
  };

  // Patients mis en évidence dans la recherche
  const highlightedPatients = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase().trim();
    const allPatients = new Set<string>();
    filteredArchives.forEach(a => a.patientsList.forEach(p => {
      if (p.toLowerCase().includes(q)) allPatients.add(p);
    }));
    return Array.from(allPatients);
  }, [search, filteredArchives]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="pt-6 pb-20 md:pb-8 px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto">
        
        <AnimatePresence>
          {notification && (
            <motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-4 left-1/2 z-50 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.nav initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-4">
          <span>Espace Clinique</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-slate-600 font-bold">Archives</span>
        </motion.nav>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 font-manrope">Archives</h1>
            <p className="text-slate-500 text-sm mt-1">
              {filteredArchives.length} résultat{filteredArchives.length !== 1 ? 's' : ''} 
              {(dateStart || dateEnd) && <span className="text-blue-600 font-semibold"> du {dateStart || '...'} au {dateEnd || '...'}</span>}
              {search && <span className="text-blue-600 font-semibold"> pour &quot;{search}&quot;</span>}
              {highlightedPatients.length > 0 && (
                <span className="text-emerald-600 font-semibold"> · {highlightedPatients.length} patient{highlightedPatients.length > 1 ? 's' : ''} trouvé{highlightedPatients.length > 1 ? 's' : ''}</span>
              )}
            </p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleExportAll} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 shadow-sm cursor-pointer flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">download</span>
            Exporter ({filteredArchives.length})
          </motion.button>
        </motion.div>

        {/* Stats globales */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Dossiers', value: statsGlobal.totalDossiers.toLocaleString(), icon: 'folder', color: 'from-blue-500 to-blue-600' },
            { label: 'Total Séances', value: statsGlobal.totalSeances.toLocaleString(), icon: 'monitor_heart', color: 'from-emerald-500 to-emerald-600' },
            { label: 'Patients Suivis', value: statsGlobal.totalPatients, icon: 'groups', color: 'from-purple-500 to-purple-600' },
            { label: 'Mois Archivés', value: statsGlobal.nbMois, icon: 'calendar_month', color: 'from-amber-500 to-amber-600' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                <span className="material-symbols-outlined text-xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-slate-800">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Patients trouvés (si recherche par patient) */}
        <AnimatePresence>
          {highlightedPatients.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <p className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">person_search</span>
                Patients trouvés dans les archives :
              </p>
              <div className="flex flex-wrap gap-2">
                {highlightedPatients.map(patient => (
                  <motion.span
                    key={patient}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-3 py-1.5 bg-white border border-emerald-200 rounded-full text-[10px] font-bold text-emerald-700 shadow-sm"
                  >
                    {patient}
                    <span className="ml-1 text-emerald-400">
                      ({filteredArchives.filter(a => a.patientsList.includes(patient)).length} mois)
                    </span>
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filtres */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 mb-6 space-y-4">
          
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par mois, année, dossiers, séances, patient, responsable..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
              {search && (
                <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 cursor-pointer">
                  <span className="material-symbols-outlined text-sm">close</span>
                </motion.button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Année :</span>
              {years.map(year => (
                <motion.button key={year} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFilterYear(year)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterYear === year ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>
                  {year === 'all' ? 'Toutes' : year}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Intervalle de dates */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">date_range</span>
              Intervalle :
            </span>
            <div className="flex items-center gap-2">
              <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer" />
              <span className="text-slate-400 text-xs font-bold">→</span>
              <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer" />
              {(dateStart || dateEnd) && (
                <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => { setDateStart(''); setDateEnd(''); }} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 cursor-pointer">
                  <span className="material-symbols-outlined text-sm">close</span>
                </motion.button>
              )}
            </div>
            {(dateStart || dateEnd) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-1.5">
                <span className="text-[10px] font-bold text-blue-700">{statsFiltered.dossiers} dossiers · {statsFiltered.seances} séances · {statsFiltered.patients} patients</span>
              </motion.div>
            )}
          </div>

          {/* Tags rapides */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400">Rapide :</span>
            {['Elena Ross', 'Marcus Jensen', 'Hélène Bernard', 'Mensuel', 'Dr. Andrianjato', '>400'].map(tag => (
              <motion.button key={tag} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSearch(search === tag ? '' : tag)} className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${search === tag ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-400' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                {tag}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Liste des archives */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="text-left py-4 pl-6">Période</th>
                  <th className="text-center py-4">Dossiers</th>
                  <th className="text-center py-4">Séances</th>
                  <th className="text-center py-4">Patients</th>
                  <th className="text-center py-4">Responsable</th>
                  <th className="text-center py-4">Intervalle</th>
                  <th className="text-center py-4">Statut</th>
                  <th className="text-right py-4 pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredArchives.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
                    Aucun résultat trouvé
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setSearch(''); setDateStart(''); setDateEnd(''); setFilterYear('all'); }} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer block mx-auto">
                      Réinitialiser les filtres
                    </motion.button>
                  </td></tr>
                ) : (
                  filteredArchives.map((archive, index) => (
                    <motion.tr key={archive.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }} whileHover={{ backgroundColor: '#f8fafc' }} className="group cursor-pointer transition-colors" onClick={() => setSelectedArchive(selectedArchive === archive.id ? null : archive.id)}>
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all">
                            <span className="material-symbols-outlined text-slate-500 group-hover:text-blue-600 transition-colors">calendar_month</span>
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-800">{archive.mois}</p>
                            <p className="text-[10px] text-slate-400">{archive.type} · {archive.service}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-center"><span className="text-sm font-bold text-blue-600">{archive.dossiers}</span></td>
                      <td className="py-4 text-center"><span className="text-sm font-bold text-emerald-600">{archive.seances}</span></td>
                      <td className="py-4 text-center">
                        <span className="text-sm font-bold text-purple-600">{archive.patients}</span>
                        <p className="text-[9px] text-slate-400 truncate max-w-[120px]">{archive.patientsList.slice(0, 3).join(', ')}{archive.patientsList.length > 3 ? '...' : ''}</p>
                      </td>
                      <td className="py-4 text-center"><span className="text-xs text-slate-600">{archive.responsable}</span></td>
                      <td className="py-4 text-center"><span className="text-[10px] text-slate-500">{new Date(archive.dateDebut).toLocaleDateString('fr-FR')} → {new Date(archive.dateFin).toLocaleDateString('fr-FR')}</span></td>
                      <td className="py-4 text-center"><span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">{archive.statut}</span></td>
                      <td className="py-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); setSelectedArchive(selectedArchive === archive.id ? null : archive.id); }} className="p-2 hover:bg-blue-50 rounded-lg cursor-pointer">
                            <span className="material-symbols-outlined text-blue-500 text-lg">{selectedArchive === archive.id ? 'visibility_off' : 'visibility'}</span>
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleDownload(archive); }} className="p-2 hover:bg-emerald-50 rounded-lg cursor-pointer">
                            <span className="material-symbols-outlined text-emerald-500 text-lg">download</span>
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Détails expandable avec liste des patients */}
          <AnimatePresence>
            {selectedArchive && (() => {
              const archive = ARCHIVES.find(a => a.id === selectedArchive);
              if (!archive) return null;
              return (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t-2 border-blue-100">
                  <div className="p-6 bg-gradient-to-r from-blue-50/50 to-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black text-slate-800">{archive.mois} - Détails</h3>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedArchive(null)} className="p-1 text-slate-400 hover:text-red-500 cursor-pointer">
                        <span className="material-symbols-outlined">close</span>
                      </motion.button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {Object.entries({ Dossiers: archive.dossiers, Séances: archive.seances, Patients: archive.patients, Responsable: archive.responsable, Type: archive.type, Service: archive.service, Statut: archive.statut, 'Date début': new Date(archive.dateDebut).toLocaleDateString('fr-FR'), 'Date fin': new Date(archive.dateFin).toLocaleDateString('fr-FR') }).map(([key, value]) => (
                        <div key={key} className="bg-white rounded-xl p-3 border border-slate-100">
                          <p className="text-[10px] text-slate-400 uppercase">{key}</p>
                          <p className="text-sm font-bold text-slate-700">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white rounded-xl border border-slate-100 p-4">
                      <p className="text-xs font-bold text-slate-700 mb-2">👥 Patients suivis ({archive.patientsList.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {archive.patientsList.map(patient => (
                          <span key={patient} className={`px-3 py-1.5 rounded-full text-[10px] font-bold border ${search && patient.toLowerCase().includes(search.toLowerCase()) ? 'bg-emerald-100 text-emerald-700 border-emerald-300 ring-2 ring-emerald-400' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                            {patient}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          {/* Pagination */}
          <div className="p-4 flex items-center justify-between border-t border-slate-100">
            <span className="text-[10px] text-slate-400">{filteredArchives.length} résultat{filteredArchives.length !== 1 ? 's' : ''}</span>
            <div className="flex items-center gap-2">
              <motion.button whileHover={{ x: -3 }} className="w-8 h-8 rounded-lg bg-white text-slate-400 hover:bg-slate-50 border border-slate-200 flex items-center justify-center cursor-pointer">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </motion.button>
              {[1, 2].map(page => (
                <motion.button key={page} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${page === 1 ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}>
                  {page}
                </motion.button>
              ))}
              <motion.button whileHover={{ x: 3 }} className="w-8 h-8 rounded-lg bg-white text-slate-400 hover:bg-slate-50 border border-slate-200 flex items-center justify-center cursor-pointer">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
