'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArchiveAPI, ArchiveItem, ArchiveStats, HistoriquePatient,
  PatientSimple, ModuleArchive, MODULE_CONFIG, TIMELINE_CONFIG,
} from '@/src/services/archive.service';
import { exportPdfHistoriquePatient } from '@/src/services/pdf.service';

// ─── Types locaux ─────────────────────────────────────────────
type TabId = 'tous' | ModuleArchive | 'historique';

interface ModalArchive {
  type:   'archiver' | 'restaurer';
  module: ModuleArchive;
  id:     number;
  label:  string;
}

// ─── Composants réutilisables ─────────────────────────────────

function Toast({ message, type = 'success' }: { message: string; type?: 'success' | 'error' }) {
  const cfg = type === 'success'
    ? { bg: 'from-emerald-500 to-teal-600', icon: 'check_circle', shadow: 'shadow-emerald-200' }
    : { bg: 'from-red-500 to-rose-600',     icon: 'error',         shadow: 'shadow-red-200'    };
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.8 }}
      animate={{ opacity: 1, y: 0,  scale: 1   }}
      exit={{    opacity: 0, y: 60, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`fixed bottom-6 right-6 z-50 px-5 py-3 bg-gradient-to-r ${cfg.bg} text-white rounded-2xl shadow-2xl ${cfg.shadow} text-sm font-bold flex items-center gap-2`}
    >
      <span className="material-symbols-outlined text-lg">{cfg.icon}</span>
      {message}
    </motion.div>
  );
}

function ModuleBadge({ module }: { module: ModuleArchive }) {
  const cfg = MODULE_CONFIG[module];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.badge} border-current/20`}>
      <span className="material-symbols-outlined text-sm">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function StatCard({ label, value, icon, gradient, shadow }: {
  label: string; value: number; icon: string; gradient: string; shadow: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0,  scale: 1   }}
      whileHover={{ y: -3, scale: 1.02 }}
      className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
    >
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md ${shadow} mb-2`}>
        <span className="material-symbols-outlined text-white text-base">{icon}</span>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-[10px] text-white/70 font-semibold uppercase mt-0.5">{label}</p>
    </motion.div>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-16 text-center text-slate-400"
    >
      <span className="material-symbols-outlined text-6xl mb-3 block opacity-30">{icon}</span>
      <p className="font-bold text-lg text-slate-600">{title}</p>
      {subtitle && <p className="text-xs mt-1">{subtitle}</p>}
    </motion.div>
  );
}


// ─── Modal Confirmation ───────────────────────────────────────

function ModalConfirmation({ modal, onConfirm, onCancel, loading }: {
  modal:     ModalArchive;
  onConfirm: (motif: string, archivedBy: string) => void;
  onCancel:  () => void;
  loading:   boolean;
}) {
  const [motif, setMotif]           = useState('');
  const [archivedBy, setArchivedBy] = useState('');
  const isArchiver = modal.type === 'archiver';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1,   opacity: 1, y: 0  }}
        exit={{    scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {/* Icône */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
          isArchiver
            ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-200'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200'
        }`}>
          <span className="material-symbols-outlined text-white text-2xl">
            {isArchiver ? 'archive' : 'restore'}
          </span>
        </div>

        <h2 className="text-xl font-black text-slate-800 text-center mb-1">
          {isArchiver ? 'Archiver cet élément ?' : 'Restaurer cet élément ?'}
        </h2>
        <p className="text-sm text-slate-500 text-center mb-5 font-semibold">{modal.label}</p>

        {isArchiver && (
          <>
            {modal.module === 'patients' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                <p className="text-xs font-bold text-amber-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  Archivage en cascade : RDV, prescriptions, kits, séances et soins associés seront aussi archivés.
                </p>
              </div>
            )}

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs font-black text-slate-700 uppercase block mb-1">
                  Motif d'archivage *
                </label>
                <textarea
                  value={motif}
                  onChange={e => setMotif(e.target.value)}
                  placeholder="Ex: Fin de protocole dialyse..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-700 uppercase block mb-1">
                  Archivé par *
                </label>
                <input
                  value={archivedBy}
                  onChange={e => setArchivedBy(e.target.value)}
                  placeholder="Ex: Dr. Andrianjato..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>
          </>
        )}

        {!isArchiver && modal.module === 'patients' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-5">
            <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">info</span>
              Restauration en cascade : les données archivées avec ce patient seront aussi restaurées.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all cursor-pointer"
          >
            Annuler
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isArchiver && (!motif.trim() || !archivedBy.trim()) || loading}
            onClick={() => onConfirm(motif, archivedBy)}
            className={`flex-1 px-4 py-3 text-white rounded-xl text-sm font-black shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isArchiver
                ? 'bg-gradient-to-r from-red-600 to-rose-600 shadow-red-200'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-200'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                En cours...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  {isArchiver ? 'archive' : 'restore'}
                </span>
                {isArchiver ? 'Confirmer archivage' : 'Confirmer restauration'}
              </span>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Composant Principal ──────────────────────────────────────

export default function StitchArchives() {
  const [activeTab, setActiveTab]   = useState<TabId>('tous');
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast]           = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [modal, setModal]           = useState<ModalArchive | null>(null);

  // Data
  const [stats, setStats]           = useState<ArchiveStats | null>(null);
  const [archives, setArchives]     = useState<{ data: ArchiveItem[]; total: number; totalPages: number }>({ data: [], total: 0, totalPages: 0 });
  const [patients, setPatients]     = useState<PatientSimple[]>([]);
  const [historique, setHistorique] = useState<HistoriquePatient | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  // Filtres
  const [search, setSearch]         = useState('');
  const [dateDebut, setDateDebut]   = useState('');
  const [dateFin, setDateFin]       = useState('');
  const [page, setPage]             = useState(1);
  const [limit, setLimit]           = useState(20);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Chargement initial
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [s, p] = await Promise.all([
          ArchiveAPI.getStats().catch(() => null),
          ArchiveAPI.getPatients().catch(() => []),
        ]);
        setStats(s);
        setPatients(p);
        if (p.length > 0) setSelectedPatientId(p[0].id);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    init();
  }, []);

  // Chargement archives selon onglet
  const loadArchives = useCallback(async () => {
    if (activeTab === 'historique') return;
    try {
      const q = { search: search || undefined, dateDebut: dateDebut || undefined, dateFin: dateFin || undefined, page, limit };
      const res = activeTab === 'tous'
        ? await ArchiveAPI.listerTout(q)
        : await ArchiveAPI.listerParModule(activeTab as ModuleArchive, q);
      setArchives({ data: res.data, total: res.total, totalPages: res.totalPages });
    } catch (e) {
      console.error(e);
      showToast('Erreur chargement archives', 'error');
    }
  }, [activeTab, search, dateDebut, dateFin, page, limit, showToast]);

  useEffect(() => {
    if (!loading) loadArchives();
  }, [loading, loadArchives]);

  // Chargement historique
  useEffect(() => {
    if (activeTab !== 'historique' || !selectedPatientId) return;
    const load = async () => {
      try {
        const h = await ArchiveAPI.getHistorique(selectedPatientId);
        setHistorique(h);
      } catch (e) {
        console.error(e);
        showToast('Erreur chargement historique', 'error');
      }
    };
    load();
  }, [activeTab, selectedPatientId, showToast]);

  // Actions archiver/restaurer
  const handleConfirmAction = useCallback(async (motif: string, archivedBy: string) => {
    if (!modal) return;
    setActionLoading(true);
    try {
      let res: any;
      if (modal.type === 'archiver') {
        res = await ArchiveAPI.archiver(modal.module, modal.id, motif, archivedBy);
      } else {
        res = await ArchiveAPI.restaurer(modal.module, modal.id);
      }
      showToast(res.message);
      setModal(null);
      // Rafraîchir stats + liste
      const [s] = await Promise.all([
        ArchiveAPI.getStats().catch(() => stats),
        loadArchives(),
      ]);
      setStats(s);
    } catch (e: any) {
      showToast(e?.message || 'Erreur', 'error');
    }
    setActionLoading(false);
  }, [modal, stats, loadArchives, showToast]);

  const tabs = useMemo(() => [
    { id: 'tous'         as TabId, label: 'Tous',          icon: 'folder_open',     count: stats?.total || 0 },
    { id: 'patients'     as TabId, label: 'Patients',       icon: 'person',          count: stats?.par_module?.patients || 0 },
    { id: 'rendezvous'   as TabId, label: 'RDV',            icon: 'event',           count: stats?.par_module?.rendezvous || 0 },
    { id: 'prescriptions'as TabId, label: 'Prescriptions',  icon: 'prescriptions',   count: stats?.par_module?.prescriptions || 0 },
    { id: 'kits'         as TabId, label: 'Kits',           icon: 'inventory_2',     count: stats?.par_module?.kits || 0 },
    { id: 'seances'      as TabId, label: 'Séances',        icon: 'vaccine',         count: stats?.par_module?.seances || 0 },
    { id: 'soins'        as TabId, label: 'Soins',          icon: 'healing',         count: stats?.par_module?.soins || 0 },
    { id: 'surveillance' as TabId, label: 'Surveillance',   icon: 'monitor_heart',   count: stats?.par_module?.surveillance || 0 },
    { id: 'demandes-avis'as TabId, label: 'Demandes',       icon: 'question_answer', count: stats?.par_module?.['demandes-avis'] || 0 },
    { id: 'historique'   as TabId, label: 'Historique',     icon: 'history',         count: null },
  ], [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-600">Chargement des archives...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6 space-y-5 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-gradient-to-r from-slate-700 via-slate-800 to-indigo-900 rounded-2xl shadow-xl p-5"
      >
        <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
          <div className="text-white">
            <h1 className="text-xl md:text-2xl font-black flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl">archive</span>
              Archives Médicales
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 font-semibold">
              Service Hémodialyse - CHU Andrainjato · Soft Delete Médical
            </p>
          </div>
          {stats?.derniere_archive && (
            <div className="bg-white/10 rounded-xl px-4 py-2 text-white text-xs font-bold">
              <span className="material-symbols-outlined text-sm mr-1">schedule</span>
              Dernière archive: {new Date(stats.derniere_archive).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <StatCard label="Total"        value={stats?.total || 0}                           icon="folder_open"     gradient="from-slate-500 to-slate-700"   shadow="shadow-slate-300" />
          <StatCard label="Patients"     value={stats?.par_module?.patients || 0}            icon="person"          gradient="from-blue-500 to-indigo-600"   shadow="shadow-blue-200" />
          <StatCard label="RDV"          value={stats?.par_module?.rendezvous || 0}          icon="event"           gradient="from-emerald-500 to-teal-600"  shadow="shadow-emerald-200" />
          <StatCard label="Prescriptions"value={stats?.par_module?.prescriptions || 0}       icon="prescriptions"   gradient="from-violet-500 to-purple-600" shadow="shadow-violet-200" />
          <StatCard label="Kits"         value={stats?.par_module?.kits || 0}                icon="inventory_2"     gradient="from-pink-500 to-rose-600"     shadow="shadow-pink-200" />
          <StatCard label="Séances"      value={stats?.par_module?.seances || 0}             icon="vaccine"         gradient="from-amber-500 to-orange-600"  shadow="shadow-amber-200" />
          <StatCard label="Soins"        value={stats?.par_module?.soins || 0}               icon="healing"         gradient="from-cyan-500 to-blue-600"     shadow="shadow-cyan-200" />
          <StatCard label="Surveillance" value={stats?.par_module?.surveillance || 0}        icon="monitor_heart"   gradient="from-red-500 to-rose-600"      shadow="shadow-red-200" />
        </div>
      </motion.div>

      {/* ── Tabs ── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-2 overflow-x-auto"
      >
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab, i) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.04 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-slate-700 to-indigo-800 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
              {tab.count !== null && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Filtres (pas sur historique) ── */}
      {activeTab !== 'historique' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 space-y-3"
        >
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-48 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Rechercher par nom, motif, archivé par..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <input
              type="date"
              value={dateDebut}
              onChange={e => { setDateDebut(e.target.value); setPage(1); }}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              type="date"
              value={dateFin}
              onChange={e => { setDateFin(e.target.value); setPage(1); }}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {(search || dateDebut || dateFin) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setSearch(''); setDateDebut(''); setDateFin(''); setPage(1); }}
                className="px-3 py-2.5 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-all cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                Réinit.
              </motion.button>
            )}
          </div>

          {/* Pagination taille */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Afficher :</span>
            {[10, 20, 25, 50].map(n => (
              <motion.button
                key={n}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setLimit(n); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  limit === n
                    ? 'bg-gradient-to-r from-slate-700 to-indigo-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {n}
              </motion.button>
            ))}
            <span className="text-xs text-slate-400 font-semibold">par page</span>
          </div>
        </motion.div>
      )}

      {/* ── Contenu principal ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'historique' ? (
            <VueHistorique
              patients={patients}
              selectedId={selectedPatientId}
              setSelectedId={setSelectedPatientId}
              historique={historique}
              onArchiver={(module, id, label) => setModal({ type: 'archiver', module, id, label })}
              onRestaurer={(module, id, label) => setModal({ type: 'restaurer', module, id, label })}
            />
          ) : (
            <VueArchives
              archives={archives.data}
              total={archives.total}
              totalPages={archives.totalPages}
              page={page}
              limit={limit}
              onPageChange={setPage}
              onArchiver={(module, id, label) => setModal({ type: 'archiver', module, id, label })}
              onRestaurer={(module, id, label) => setModal({ type: 'restaurer', module, id, label })}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modal && (
          <ModalConfirmation
            modal={modal}
            onConfirm={handleConfirmAction}
            onCancel={() => setModal(null)}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}


// ─── Vue Archives (liste + pagination) ────────────────────────

function VueArchives({ archives, total, totalPages, page, limit, onPageChange, onArchiver, onRestaurer }: {
  archives:     ArchiveItem[];
  total:        number;
  totalPages:   number;
  page:         number;
  limit:        number;
  onPageChange: (p: number) => void;
  onArchiver:   (module: ModuleArchive, id: number, label: string) => void;
  onRestaurer:  (module: ModuleArchive, id: number, label: string) => void;
}) {
  if (archives.length === 0) {
    return <EmptyState icon="archive" title="Aucune archive trouvée" subtitle="Modifiez les filtres ou archivez des éléments" />;
  }

  return (
    <div className="space-y-4">
      {/* Résumé */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold text-slate-500">
          Affichant <span className="text-slate-800">{(page - 1) * limit + 1}-{Math.min(page * limit, total)}</span> sur <span className="text-slate-800">{total}</span> archives
        </p>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {archives.map((item, i) => {
          const cfg = MODULE_CONFIG[item.module];
          return (
            <motion.div
              key={`${item.module}-${item.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -2 }}
              className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${cfg.border}`}
            >
              <div className="p-4 flex items-start gap-4">
                {/* Icône module */}
                <div className={`w-11 h-11 rounded-xl ${cfg.bg} ${cfg.border} border flex items-center justify-center shrink-0 mt-0.5`}>
                  <span className={`material-symbols-outlined text-lg ${cfg.color}`}>{cfg.icon}</span>
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-black text-slate-800 truncate">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                    </div>
                    <ModuleBadge module={item.module} />
                  </div>

                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                    {item.archived_at && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        {new Date(item.archived_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    {item.archived_by && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">person</span>
                        {item.archived_by}
                      </span>
                    )}
                    {item.archive_motif && (
                      <span className="flex items-center gap-1 italic">
                        <span className="material-symbols-outlined text-sm">chat_bubble</span>
                        {item.archive_motif}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onRestaurer(item.module, item.id, item.label)}
                    className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-xs font-black shadow-sm shadow-emerald-200 hover:shadow-md cursor-pointer flex items-center gap-1"
                    title="Restaurer"
                  >
                    <span className="material-symbols-outlined text-sm">restore</span>
                    <span className="hidden sm:inline">Restaurer</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 pt-2"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </motion.button>

          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let p: number;
            if (totalPages <= 7) p = i + 1;
            else if (page <= 4) p = i + 1;
            else if (page >= totalPages - 3) p = totalPages - 6 + i;
            else p = page - 3 + i;
            return (
              <motion.button
                key={p}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(p)}
                className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  p === page
                    ? 'bg-gradient-to-r from-slate-700 to-indigo-800 text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p}
              </motion.button>
            );
          })}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </motion.button>

          <span className="text-xs text-slate-400 font-bold ml-2">
            Page {page}/{totalPages}
          </span>
        </motion.div>
      )}
    </div>
  );
}

// ─── Vue Historique Patient ────────────────────────────────────

function VueHistorique({ patients, selectedId, setSelectedId, historique, onArchiver, onRestaurer }: {
  patients:      PatientSimple[];
  selectedId:    number | null;
  setSelectedId: (id: number) => void;
  historique:    HistoriquePatient | null;
  onArchiver:    (module: ModuleArchive, id: number, label: string) => void;
  onRestaurer:   (module: ModuleArchive, id: number, label: string) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Sélection patient */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4">
        <label className="text-xs font-black text-slate-700 uppercase block mb-2">
          Sélectionner un patient
        </label>
        <select
          value={selectedId || ''}
          onChange={e => setSelectedId(Number(e.target.value))}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {patients.map(p => (
            <option key={p.id} value={p.id}>
              {p.nom} {p.prenom}{p.is_archived ? ' 🗄️ (archivé)' : ''}
            </option>
          ))}
        </select>
      </div>

      {!historique ? (
        <EmptyState icon="history" title="Chargement de l'historique..." />
      ) : (
        <>
          {/* Identité patient */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl shadow-lg p-4 text-white ${
              historique.patient.is_archived
                ? 'bg-gradient-to-r from-slate-600 to-slate-800'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">person</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-black">{historique.patient.nom} {historique.patient.prenom}</h2>
                <p className="text-xs text-white/80 font-semibold">
                  {historique.patient.dateNaissance
                    ? `${new Date().getFullYear() - new Date(historique.patient.dateNaissance).getFullYear()} ans`
                    : '-'
                  }
                  {historique.patient.numero_dossier ? ` · Dossier: ${historique.patient.numero_dossier}` : ''}
                  {' · Statut: '}{historique.patient.traitement_statut || '-'}
                </p>
              </div>
              {historique.patient.is_archived && (
                <div className="bg-red-500/80 rounded-xl px-3 py-1.5">
                  <span className="text-xs font-black flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">archive</span>
                    Archivé
                  </span>
                </div>
              )}
            </div>

            {historique.patient.is_archived && (
              <div className="bg-white/10 rounded-xl p-3 text-xs font-semibold space-y-1">
                <p>📅 Archivé le: {historique.patient.archived_at ? new Date(historique.patient.archived_at).toLocaleString('fr-FR') : '-'}</p>
                <p>👤 Par: {historique.patient.archived_by || '-'}</p>
                <p>💬 Motif: {historique.patient.archive_motif || '-'}</p>
              </div>
            )}
          </motion.div>

          {/* Résumé activité */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { l: 'RDV',           v: historique.resume.rendezvous,    icon: 'event',           g: 'from-blue-500 to-indigo-600'   },
              { l: 'Prescriptions', v: historique.resume.prescriptions,  icon: 'prescriptions',   g: 'from-violet-500 to-purple-600' },
              { l: 'Kits',          v: historique.resume.kits,           icon: 'inventory_2',     g: 'from-pink-500 to-rose-600'     },
              { l: 'Séances',       v: historique.resume.seances,        icon: 'vaccine',         g: 'from-amber-500 to-orange-600'  },
              { l: 'Soins',         v: historique.resume.soins,          icon: 'healing',         g: 'from-cyan-500 to-blue-600'     },
              { l: 'Surveillance',  v: historique.resume.surveillance,   icon: 'monitor_heart',   g: 'from-red-500 to-rose-600'      },
            ].map((item, i) => (
              <motion.div
                key={item.l}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0,  scale: 1   }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-3 text-center"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.g} flex items-center justify-center mx-auto mb-2`}>
                  <span className="material-symbols-outlined text-white text-sm">{item.icon}</span>
                </div>
                <p className="text-xl font-black text-slate-800">{item.v}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase">{item.l}</p>
              </motion.div>
            ))}
          </div>

          {/* Actions patient */}
          <div className="flex gap-3 flex-wrap">
            {historique.patient.is_archived ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onRestaurer('patients', historique.patient.id, `${historique.patient.nom} ${historique.patient.prenom}`)}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">restore</span>
                Restaurer ce patient
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onArchiver('patients', historique.patient.id, `${historique.patient.nom} ${historique.patient.prenom}`)}
                className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">archive</span>
                Archiver ce patient
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => exportPdfHistoriquePatient(historique)}
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
              Exporter PDF
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              Imprimer
            </motion.button>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
            <h3 className="text-sm font-black text-slate-800 mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-500">timeline</span>
              Chronologie complète ({historique.timeline.length} événements)
            </h3>

            <div className="relative">
              {/* Ligne verticale */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-200 to-transparent" />

              <div className="space-y-4">
                {historique.timeline.map((event, i) => {
                  const cfg = TIMELINE_CONFIG[event.type] || TIMELINE_CONFIG['creation'];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex gap-4 relative"
                    >
                      {/* Dot */}
                      <div className={`w-10 h-10 rounded-full ${cfg.bg} ${cfg.border} border-2 flex items-center justify-center shrink-0 z-10`}>
                        <span className={`material-symbols-outlined text-sm ${cfg.couleur}`}>{cfg.icon}</span>
                      </div>

                      {/* Contenu */}
                      <div className={`flex-1 ${cfg.bg} ${cfg.border} border rounded-xl p-3 mb-1`}>
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <p className={`text-sm font-black ${cfg.couleur}`}>{event.titre}</p>
                          <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap">
                            {event.date && new Date(event.date).getFullYear() > 1970
                              ? new Date(event.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                              : 'Date inconnue'
                            }
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium">{event.details}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
