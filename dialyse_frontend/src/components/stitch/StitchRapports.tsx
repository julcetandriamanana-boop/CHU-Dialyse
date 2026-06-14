'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { RapportsAPI, FiltreDate, RapportSauvegarde } from '@/src/services/rapports.service';
import { PatientAPI } from '@/src/services/api.service';
import { getCurrentUser, canDeleteRapports, canModifyRapports } from '@/src/stores/auth.store';

// ─── Types ────────────────────────────────────────────────────
type Tab = 'global' | 'activite' | 'medical' | 'prescriptions' | 'kits' | 'rdv' | 'surveillance' | 'performance';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: string;
  gradient: string;
  shadow: string;
  delay?: number;
}

interface Patient {
  id: number;
  nom: string;
  prenom: string;
}

// ─── Composants réutilisables ─────────────────────────────────

function KPICard({ label, value, icon, gradient, shadow, delay = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 15 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm hover:shadow-xl transition-all cursor-pointer"
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md ${shadow} mb-3`}>
        <span className="material-symbols-outlined text-white text-lg">{icon}</span>
      </div>
      <p className="text-2xl font-black text-slate-800">{value}</p>
      <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">{label}</p>
    </motion.div>
  );
}

function Toast({ message, type = 'success' }: { message: string; type?: 'success' | 'error' }) {
  const config = type === 'success'
    ? { bg: 'from-emerald-500 to-teal-600', icon: 'check_circle', shadow: 'shadow-emerald-200' }
    : { bg: 'from-red-500 to-rose-600', icon: 'error', shadow: 'shadow-red-200' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 60, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`fixed bottom-6 right-6 z-50 px-5 py-3 bg-gradient-to-r ${config.bg} text-white rounded-2xl shadow-2xl ${config.shadow} text-sm font-bold flex items-center gap-2`}
    >
      <span className="material-symbols-outlined text-lg">{config.icon}</span>
      {message}
    </motion.div>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-12 text-center text-slate-400"
    >
      <span className="material-symbols-outlined text-6xl mb-3 block opacity-30">{icon}</span>
      <p className="font-bold text-lg">{title}</p>
      {subtitle && <p className="text-xs mt-1">{subtitle}</p>}
    </motion.div>
  );
}

function SectionTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-black text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-2">
      <span className="material-symbols-outlined text-base">{icon}</span>
      {children}
    </h3>
  );
}

// ─── Composant Principal ──────────────────────────────────────

export default function StitchRapports() {
  // 🔐 Permissions
  const currentUser = getCurrentUser();
  const canDelete = canDeleteRapports();
  const canModify = canModifyRapports();

  const [activeTab, setActiveTab] = useState<Tab>('global');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [filtre, setFiltre] = useState<FiltreDate>({});
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  // Data par onglet
  const [statsGlobal, setStatsGlobal] = useState<any>(null);
  const [dataActivite, setDataActivite] = useState<any>(null);
  const [dataMedical, setDataMedical] = useState<any>(null);
  const [dataPrescriptions, setDataPrescriptions] = useState<any>(null);
  const [dataKits, setDataKits] = useState<any>(null);
  const [dataRdv, setDataRdv] = useState<any>(null);
  const [dataSurveillance, setDataSurveillance] = useState<any>(null);
  const [dataPerformance, setDataPerformance] = useState<any>(null);
  const [rapportsSauvegardes, setRapportsSauvegardes] = useState<RapportSauvegarde[]>([]);
  const [expandedRapport, setExpandedRapport] = useState<number | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Chargement initial
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        const [stats, liste, pats] = await Promise.all([
          RapportsAPI.getStats().catch(() => null),
          RapportsAPI.getListe().catch(() => []),
          PatientAPI.getAll().catch(() => []),
        ]);
        setStatsGlobal(stats);
        setRapportsSauvegardes(liste);
        setPatients(pats);
        if (pats.length > 0) setSelectedPatientId(pats[0].id);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    loadInitial();
  }, []);

  // Chargement data selon onglet actif
  useEffect(() => {
    const loadTabData = async () => {
      try {
        if (activeTab === 'activite' && !dataActivite) {
          const res = await RapportsAPI.getActiviteDialyse(filtre);
          setDataActivite(res);
        } else if (activeTab === 'medical' && !dataMedical && selectedPatientId) {
          const res = await RapportsAPI.getMedicalPatient(selectedPatientId, filtre);
          setDataMedical(res);
        } else if (activeTab === 'prescriptions' && !dataPrescriptions) {
          const res = await RapportsAPI.getPrescriptions(filtre);
          setDataPrescriptions(res);
        } else if (activeTab === 'kits' && !dataKits) {
          const res = await RapportsAPI.getKitsConsommation(filtre);
          setDataKits(res);
        } else if (activeTab === 'rdv' && !dataRdv) {
          const res = await RapportsAPI.getRdvFlux(filtre);
          setDataRdv(res);
        } else if (activeTab === 'surveillance' && !dataSurveillance) {
          const res = await RapportsAPI.getSurveillanceCritique(filtre);
          setDataSurveillance(res);
        } else if (activeTab === 'performance' && !dataPerformance) {
          const res = await RapportsAPI.getPerformancePersonnel(filtre);
          setDataPerformance(res);
        }
      } catch (e) {
        console.error(e);
        showToast('Erreur de chargement', 'error');
      }
    };
    if (!loading) loadTabData();
  }, [activeTab, loading, filtre, selectedPatientId, dataActivite, dataMedical, dataPrescriptions, dataKits, dataRdv, dataSurveillance, dataPerformance, showToast]);

  const handleGenerateReport = async (periode: string) => {
    if (!canModify) {
      showToast('Vous n\'avez pas la permission de générer des rapports', 'error');
      return;
    }
    try {
      await RapportsAPI.generer('Service Dialyse', periode);
      showToast('Rapport généré avec succès');
      const liste = await RapportsAPI.getListe();
      setRapportsSauvegardes(liste);
    } catch {
      showToast('Erreur génération rapport', 'error');
    }
  };

  const handleDeleteReport = async (id: number) => {
    if (!canDelete) {
      showToast('Seul un administrateur peut supprimer des rapports', 'error');
      return;
    }
    try {
      await RapportsAPI.supprimer(id);
      showToast('Rapport supprimé');
      setRapportsSauvegardes(prev => prev.filter(r => r.id !== id));
    } catch {
      showToast('Erreur suppression', 'error');
    }
  };

  const handlePrintReport = (rapport: RapportSauvegarde) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const d = rapport.donnees;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${rapport.titre}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; }
          .header { text-align: center; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { font-size: 24px; font-weight: 900; color: #4f46e5; }
          .header p { font-size: 12px; color: #64748b; margin-top: 8px; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 11px; }
          .meta div { background: #f1f5f9; padding: 10px 15px; border-radius: 8px; }
          .section { margin-bottom: 25px; }
          .section h2 { font-size: 14px; font-weight: 800; color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; text-transform: uppercase; }
          .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; }
          .card .label { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 700; }
          .card .value { font-size: 24px; font-weight: 900; color: #0f172a; margin-top: 5px; }
          .footer { margin-top: 40px; border-top: 2px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 10px; color: #94a3b8; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CHU ANDRAINJATO - Service Hémodialyse</h1>
          <h2>${rapport.titre}</h2>
          <p>Généré le ${new Date(rapport.created_at).toLocaleString('fr-FR')} par ${rapport.auteur || 'Système'}</p>
        </div>
        <div class="meta">
          <div>Période : <strong>${rapport.periode}</strong></div>
          <div>Statut : <strong>${rapport.statut}</strong></div>
        </div>
        <div class="section">
          <h2>Données</h2>
          <pre style="background: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 11px; overflow: auto;">${JSON.stringify(d, null, 2)}</pre>
        </div>
        <div class="footer">
          <p>CHU Andrainjato - Service Hémodialyse - Document confidentiel</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  const tabs = useMemo(() => [
    { id: 'global' as Tab, label: 'Vue Globale', icon: 'dashboard' },
    { id: 'activite' as Tab, label: 'Activité', icon: 'monitoring' },
    { id: 'medical' as Tab, label: 'Médical', icon: 'health_and_safety' },
    { id: 'prescriptions' as Tab, label: 'Prescriptions', icon: 'prescriptions' },
    { id: 'kits' as Tab, label: 'Kits', icon: 'inventory_2' },
    { id: 'rdv' as Tab, label: 'RDV & Flux', icon: 'event' },
    { id: 'surveillance' as Tab, label: 'Surveillance', icon: 'emergency' },
    { id: 'performance' as Tab, label: 'Performance', icon: 'leaderboard' },
  ], []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-600">Chargement des rapports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/20 p-6 space-y-5 max-w-7xl mx-auto">

      {/* Header avec affichage utilisateur */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl shadow-indigo-200/40 p-5 flex items-center justify-between flex-wrap gap-3"
      >
        <div className="text-white">
          <h1 className="text-xl md:text-2xl font-black flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">analytics</span>
            Rapports & Statistiques
          </h1>
          <p className="text-xs md:text-sm text-indigo-100 mt-1 font-semibold">
            Service Hémodialyse - CHU Andrainjato | Utilisateur: {currentUser.nom} ({currentUser.role})
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {canModify && ['journalier', 'hebdomadaire', 'mensuel'].map(p => (
            <motion.button
              key={p}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleGenerateReport(p)}
              className="px-3 py-2 bg-white/15 backdrop-blur-sm text-white text-[10px] font-black rounded-xl hover:bg-white/25 transition-all border border-white/20 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add_chart</span>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </motion.button>
          ))}
          {!canModify && (
            <div className="px-3 py-2 bg-white/15 backdrop-blur-sm text-white text-[10px] font-black rounded-xl border border-white/20 opacity-50 cursor-not-allowed" title="Seul un admin peut générer">
              <span className="material-symbols-outlined text-sm inline mr-1">lock</span>
              Génération réservée aux admins
            </div>
          )}
        </div>
      </motion.div>

      {/* Tabs Navigation */}
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
              transition={{ delay: 0.15 + i * 0.05 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              {tab.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Contenu dynamique selon onglet */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'global' && <TabGlobal stats={statsGlobal} rapports={rapportsSauvegardes} onPrint={handlePrintReport} onDelete={handleDeleteReport} expanded={expandedRapport} setExpanded={setExpandedRapport} canDelete={canDelete} canModify={canModify} />}
          {activeTab === 'activite' && <TabActivite data={dataActivite} />}
          {activeTab === 'medical' && <TabMedical data={dataMedical} patients={patients} selectedId={selectedPatientId} setSelectedId={setSelectedPatientId} />}
          {activeTab === 'prescriptions' && <TabPrescriptions data={dataPrescriptions} />}
          {activeTab === 'kits' && <TabKits data={dataKits} />}
          {activeTab === 'rdv' && <TabRdv data={dataRdv} />}
          {activeTab === 'surveillance' && <TabSurveillance data={dataSurveillance} />}
          {activeTab === 'performance' && <TabPerformance data={dataPerformance} />}
        </motion.div>
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}


// ─── Onglet 1 : Vue Globale (MODIFIÉE) ───────────────────────

function TabGlobal({ stats, rapports, onPrint, onDelete, expanded, setExpanded, canDelete, canModify }: any) {
  if (!stats) return <EmptyState icon="dashboard" title="Chargement des statistiques..." />;

  const kpis = [
    { label: 'Patients', value: stats.global?.patients || 0, icon: 'groups', gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-200' },
    { label: 'Actifs', value: stats.global?.patientsActifs || 0, icon: 'person', gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-200' },
    { label: 'Prescriptions', value: stats.global?.prescriptions || 0, icon: 'prescriptions', gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-200' },
    { label: 'RDV', value: stats.global?.rendezVous || 0, icon: 'event', gradient: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-200' },
    { label: 'Kits', value: stats.global?.kitsEnvoyes || 0, icon: 'local_pharmacy', gradient: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-200' },
    { label: 'Notifications', value: stats.global?.notifications || 0, icon: 'notifications', gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-200' },
  ];

  return (
    <div className="space-y-5">
      <SectionTitle icon="query_stats">KPI Globaux</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k, i) => <KPICard key={k.label} {...k} delay={i * 0.05} />)}
      </div>

      <SectionTitle icon="calendar_today">Activité par période</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Aujourd'hui", items: [{ l: 'RDV', v: stats.aujourdhui?.rendezVous || 0 }, { l: 'Kits', v: stats.aujourdhui?.kitsEnvoyes || 0 }] },
          { label: 'Cette semaine', items: [{ l: 'Presc', v: stats.semaine?.prescriptions || 0 }, { l: 'RDV', v: stats.semaine?.rendezVous || 0 }] },
          { label: 'Ce mois', items: [{ l: 'Kits', v: stats.mois?.kitsEnvoyes || 0 }, { l: 'RDV', v: stats.mois?.rendezVous || 0 }] },
        ].map((p, i) => (
          <motion.div
            key={p.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4"
          >
            <p className="text-xs font-black text-indigo-700 uppercase mb-3">{p.label}</p>
            <div className="grid grid-cols-2 gap-3">
              {p.items.map(it => (
                <div key={it.l} className="bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-xl p-3 border border-indigo-100">
                  <p className="text-xl font-black text-slate-800">{it.v}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">{it.l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <SectionTitle icon="description">Rapports sauvegardés ({rapports.length})</SectionTitle>
      {rapports.length === 0 ? (
        <EmptyState icon="description" title="Aucun rapport sauvegardé" subtitle="Générez un rapport ci-dessus" />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm divide-y divide-slate-50">
          {rapports.map((r: RapportSauvegarde, i: number) => {
            const isOpen = expanded === r.id;
            return (
              <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                <div
                  className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50/50 cursor-pointer transition-colors"
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shrink-0">
                    <span className="material-symbols-outlined text-lg">analytics</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800 truncate">{r.titre}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {r.auteur} - {new Date(r.created_at).toLocaleString('fr-FR')} - {r.periode}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    r.statut === 'genere' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {r.statut}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <motion.button 
                      whileHover={{ scale: 1.1 }} 
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); onPrint(r); }}
                      className="p-2 hover:bg-blue-50 rounded-lg cursor-pointer" 
                      title="Imprimer"
                    >
                      <span className="material-symbols-outlined text-blue-500 text-lg">print</span>
                    </motion.button>

                    {canDelete ? (
                      <motion.button 
                        whileHover={{ scale: 1.1 }} 
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); onDelete(r.id); }}
                        className="p-2 hover:bg-red-50 rounded-lg cursor-pointer" 
                        title="Supprimer (Admin)"
                      >
                        <span className="material-symbols-outlined text-red-400 text-lg">delete</span>
                      </motion.button>
                    ) : (
                      <div 
                        className="p-2 rounded-lg opacity-30 cursor-not-allowed" 
                        title="Seul un admin peut supprimer"
                      >
                        <span className="material-symbols-outlined text-red-400 text-lg">lock</span>
                      </div>
                    )}

                    <span className="material-symbols-outlined text-slate-400">
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-indigo-100 bg-gradient-to-r from-indigo-50/30 to-purple-50/20"
                    >
                      <div className="p-5">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                          {r.donnees?.global && Object.entries(r.donnees.global).map(([key, val]) => (
                            <div key={key} className="bg-white rounded-xl p-3 border border-indigo-100 shadow-sm">
                              <p className="text-[9px] text-indigo-400 uppercase font-bold">{key.replace(/([A-Z])/g, ' $1')}</p>
                              <p className="text-lg font-black text-indigo-800 mt-0.5">{String(val)}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-3 mt-4 flex-wrap">
                          <motion.button 
                            whileHover={{ scale: 1.03 }} 
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onPrint(r)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-black shadow-md shadow-blue-200 hover:shadow-lg cursor-pointer flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-sm">print</span>
                            Imprimer le rapport
                          </motion.button>

                          {canDelete && (
                            <motion.button 
                              whileHover={{ scale: 1.03 }} 
                              whileTap={{ scale: 0.97 }}
                              onClick={() => onDelete(r.id)}
                              className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-xs font-black shadow-md shadow-red-200 hover:shadow-lg cursor-pointer flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                              Supprimer (Admin)
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Onglet 2 : Activité Dialyse ──────────────────────────────

function TabActivite({ data }: any) {
  if (!data) return <EmptyState icon="monitoring" title="Chargement activité dialyse..." />;
  const kpi = data.kpi;

  return (
    <div className="space-y-5">
      <SectionTitle icon="medical_services">Séances d'hémodialyse</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Total" value={kpi.seances?.total || 0} icon="vaccine" gradient="from-blue-500 to-indigo-600" shadow="shadow-blue-200" />
        <KPICard label="Moy/jour" value={kpi.seances?.moyenne_par_jour || 0} icon="event_repeat" gradient="from-emerald-500 to-teal-600" shadow="shadow-emerald-200" />
        <KPICard label="Poids pré" value={`${kpi.seances?.poids_moyen_pre || 0}kg`} icon="monitor_weight" gradient="from-violet-500 to-purple-600" shadow="shadow-violet-200" />
        <KPICard label="Perte moy" value={`${kpi.seances?.perte_poids_moyenne || 0}kg`} icon="trending_down" gradient="from-pink-500 to-rose-600" shadow="shadow-pink-200" />
      </div>

      <SectionTitle icon="event">Rendez-vous ({kpi.rendezVous?.total || 0})</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4">
          <p className="text-xs font-black text-indigo-700 uppercase mb-3">Par statut</p>
          <div className="space-y-2">
            {Object.entries(kpi.rendezVous?.par_statut || {}).map(([st, count]: any) => (
              <div key={st} className="flex justify-between items-center bg-slate-50 rounded-lg px-3 py-2">
                <span className="text-xs font-bold text-slate-700 capitalize">{st}</span>
                <span className="text-sm font-black text-indigo-600">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4">
          <p className="text-xs font-black text-indigo-700 uppercase mb-3">Par machine</p>
          <div className="space-y-2">
            {Object.entries(kpi.rendezVous?.par_machine || {}).map(([mac, count]: any) => (
              <div key={mac} className="flex justify-between items-center bg-slate-50 rounded-lg px-3 py-2">
                <span className="text-xs font-bold text-slate-700">{mac}</span>
                <span className="text-sm font-black text-indigo-600">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-4">
        <p className="text-xs font-black text-indigo-700 uppercase mb-2">Taux de réalisation</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white rounded-full h-4 overflow-hidden border border-indigo-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${kpi.rendezVous?.taux_realisation_pct || 0}%` }}
              transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
            />
          </div>
          <span className="text-2xl font-black text-indigo-600">{kpi.rendezVous?.taux_realisation_pct || 0}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── Onglet 3 : Médical Patient ───────────────────────────────

function TabMedical({ data, patients, selectedId, setSelectedId }: any) {
  if (!data) return <EmptyState icon="health_and_safety" title="Sélectionnez un patient" subtitle="Choisissez un patient dans la liste ci-dessous" />;
  const kpi = data.kpi;

  const niveauColors: Record<string, string> = {
    faible: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    modere: 'bg-amber-100 text-amber-700 border-amber-300',
    eleve: 'bg-orange-100 text-orange-700 border-orange-300',
    critique: 'bg-red-100 text-red-700 border-red-300',
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4">
        <label className="text-xs font-black text-indigo-700 uppercase mb-2 block">Sélection patient</label>
        <select
          value={selectedId || ''}
          onChange={(e) => setSelectedId(Number(e.target.value))}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {patients.map((p: Patient) => (
            <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>
          ))}
        </select>
      </div>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">person</span>
          </div>
          <div>
            <h3 className="text-lg font-black">{kpi.patient?.nom} {kpi.patient?.prenom}</h3>
            <p className="text-xs text-indigo-100">
              {kpi.patient?.dateNaissance ? `${new Date().getFullYear() - new Date(kpi.patient.dateNaissance).getFullYear()} ans` : '-'} • {kpi.patient?.traitement_statut || 'Inconnu'}
            </p>
          </div>
        </div>
      </div>

      <SectionTitle icon="vaccine">Séances</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Total" value={kpi.seances?.total || 0} icon="event" gradient="from-blue-500 to-indigo-600" shadow="shadow-blue-200" />
        <KPICard label="Poids pré" value={`${kpi.seances?.poids_moyen_pre || 0}kg`} icon="monitor_weight" gradient="from-emerald-500 to-teal-600" shadow="shadow-emerald-200" />
        <KPICard label="Poids post" value={`${kpi.seances?.poids_moyen_post || 0}kg`} icon="monitor_weight" gradient="from-violet-500 to-purple-600" shadow="shadow-violet-200" />
      </div>

      <SectionTitle icon="monitor_heart">Surveillance</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KPICard label="Surveillances" value={kpi.surveillance?.total_surveillances || 0} icon="stethoscope" gradient="from-cyan-500 to-blue-600" shadow="shadow-cyan-200" />
        <KPICard label="Kt/V moyen" value={kpi.surveillance?.kt_v_moyen || '-'} icon="analytics" gradient="from-pink-500 to-rose-600" shadow="shadow-pink-200" />
        <KPICard label="Incidents" value={kpi.surveillance?.incidents_detectes || 0} icon="emergency" gradient="from-red-500 to-rose-600" shadow="shadow-red-200" />
      </div>

      <SectionTitle icon="warning">Risque patient</SectionTitle>
      <div className={`rounded-2xl border-2 p-4 ${niveauColors[kpi.risque?.niveau || 'faible']}`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="material-symbols-outlined text-3xl">crisis_alert</span>
          <div>
            <p className="text-sm font-black uppercase">Score : {kpi.risque?.score || 0}</p>
            <p className="text-xs font-bold">Niveau : {kpi.risque?.niveau || 'faible'}</p>
          </div>
        </div>
        {kpi.risque?.facteurs && kpi.risque.facteurs.length > 0 && (
          <ul className="space-y-1 text-xs">
            {kpi.risque.facteurs.map((f: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sm mt-0.5">circle</span>
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Onglet 4 : Prescriptions ─────────────────────────────────

function TabPrescriptions({ data }: any) {
  if (!data) return <EmptyState icon="prescriptions" title="Chargement prescriptions..." />;
  const kpi = data.kpi;

  return (
    <div className="space-y-5">
      <SectionTitle icon="analytics">Global</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Total" value={kpi.global?.total || 0} icon="prescriptions" gradient="from-blue-500 to-indigo-600" shadow="shadow-blue-200" />
        <KPICard label="Taux validation" value={`${kpi.global?.taux_validation_pct || 0}%`} icon="check_circle" gradient="from-emerald-500 to-teal-600" shadow="shadow-emerald-200" />
        <KPICard label="Délai moyen" value={kpi.global?.delai_moyen_validation_heures ? `${kpi.global.delai_moyen_validation_heures.toFixed(1)}h` : '-'} icon="schedule" gradient="from-violet-500 to-purple-600" shadow="shadow-violet-200" />
        <KPICard label="En attente" value={kpi.global?.en_attente || 0} icon="pending" gradient="from-amber-500 to-orange-600" shadow="shadow-amber-200" />
      </div>

      <SectionTitle icon="medication">Top médicaments</SectionTitle>
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4">
        {kpi.top_medicaments && kpi.top_medicaments.length > 0 ? (
          <div className="space-y-2">
            {kpi.top_medicaments.map((m: any, i: number) => (
              <motion.div
                key={m.medicament}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3 hover:bg-indigo-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-black flex items-center justify-center">{i + 1}</span>
                  <span className="text-sm font-bold text-slate-700">{m.medicament}</span>
                </div>
                <span className="text-lg font-black text-indigo-600">{m.count}</span>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-400 text-sm py-4">Aucun médicament</p>
        )}
      </div>

      <SectionTitle icon="person">Par médecin</SectionTitle>
      <div className="space-y-3">
        {kpi.par_medecin && kpi.par_medecin.length > 0 ? (
          kpi.par_medecin.map((m: any, i: number) => (
            <motion.div
              key={m.medecin}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-sm font-black text-slate-800">{m.medecin}</p>
                <p className="text-xs text-slate-400">Total : {m.total} | Validées : {m.validees}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-indigo-600">{m.total}</p>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-slate-400 text-sm py-4">Aucune donnée médecin</p>
        )}
      </div>
    </div>
  );
}

// ─── Onglet 5 : Kits & Consommation ───────────────────────────

function TabKits({ data }: any) {
  if (!data) return <EmptyState icon="inventory_2" title="Chargement kits..." />;
  const kpi = data.kpi;

  return (
    <div className="space-y-5">
      <SectionTitle icon="inventory">Global</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KPICard label="Kits" value={kpi.global?.total_kits || 0} icon="inventory_2" gradient="from-blue-500 to-indigo-600" shadow="shadow-blue-200" />
        <KPICard label="Articles" value={kpi.global?.total_articles || 0} icon="checklist" gradient="from-emerald-500 to-teal-600" shadow="shadow-emerald-200" />
        <KPICard label="Moy/kit" value={kpi.global?.moyenne_articles_par_kit?.toFixed(2) || 0} icon="straighten" gradient="from-violet-500 to-purple-600" shadow="shadow-violet-200" />
      </div>

      <SectionTitle icon="group">Top patients</SectionTitle>
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4">
        {kpi.top_patients && kpi.top_patients.length > 0 ? (
          <div className="space-y-3">
            {kpi.top_patients.map((p: any, i: number) => (
              <motion.div
                key={p.patient}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-700">{p.patient}</span>
                  <span className="text-xs font-bold text-indigo-600">{p.kits} kits ({p.articles} art.)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(p.articles / (kpi.global?.total_articles || 1)) * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-400 text-sm py-4">Aucune donnée patient</p>
        )}
      </div>

      <SectionTitle icon="trending_up">Évolution mensuelle</SectionTitle>
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4">
        {kpi.evolution_mensuelle && kpi.evolution_mensuelle.length > 0 ? (
          <div className="space-y-2">
            {kpi.evolution_mensuelle.map((m: any, i: number) => (
              <div key={m.mois} className="flex justify-between items-center bg-slate-50 rounded-lg px-4 py-3">
                <span className="text-sm font-bold text-slate-700">{m.mois}</span>
                <span className="text-xs text-indigo-600 font-bold">{m.kits} kits • {m.articles} art.</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-400 text-sm py-4">Aucune donnée mensuelle</p>
        )}
      </div>
    </div>
  );
}

// ─── Onglet 6 : RDV & Flux ────────────────────────────────────

function TabRdv({ data }: any) {
  if (!data) return <EmptyState icon="event" title="Chargement RDV..." />;
  const kpi = data.kpi;

  return (
    <div className="space-y-5">
      <SectionTitle icon="insights">Global</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPICard label="Total RDV" value={kpi.global?.total_rdv || 0} icon="event" gradient="from-blue-500 to-indigo-600" shadow="shadow-blue-200" delay={0} />
        <KPICard label="Présence" value={`${kpi.global?.taux_presence_pct || 0}%`} icon="check_circle" gradient="from-emerald-500 to-teal-600" shadow="shadow-emerald-200" delay={0.05} />
        <KPICard label="Absent" value={`${kpi.global?.taux_absenteisme_pct || 0}%`} icon="person_off" gradient="from-red-500 to-rose-600" shadow="shadow-red-200" delay={0.1} />
        <KPICard label="Annulé" value={`${kpi.global?.taux_annulation_pct || 0}%`} icon="cancel" gradient="from-amber-500 to-orange-600" shadow="shadow-amber-200" delay={0.15} />
        <KPICard label="Durée moy" value={kpi.global?.duree_moyenne_seance_minutes ? `${Math.round(kpi.global.duree_moyenne_seance_minutes)}min` : '-'} icon="schedule" gradient="from-violet-500 to-purple-600" shadow="shadow-violet-200" delay={0.2} />
      </div>

      <SectionTitle icon="access_time">Flux horaire</SectionTitle>
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4">
        {kpi.flux_horaire && Object.keys(kpi.flux_horaire).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(kpi.flux_horaire)
              .sort((a: any, b: any) => parseInt(a[0]) - parseInt(b[0]))
              .map(([h, count]: any, i) => {
                const maxCount = Math.max(...(Object.values(kpi.flux_horaire) as number[]));
                const pct = (count / maxCount) * 100;
                return (
                  <motion.div
                    key={h}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-xs font-bold text-slate-600 w-12">{h}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.3 + i * 0.03, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-end pr-2"
                      >
                        <span className="text-[10px] font-black text-white">{count}</span>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        ) : (
          <p className="text-center text-slate-400 text-sm py-4">Aucune donnée horaire</p>
        )}
      </div>
    </div>
  );
}

// ─── Onglet 7 : Surveillance Critique ─────────────────────────

function TabSurveillance({ data }: any) {
  if (!data) return <EmptyState icon="emergency" title="Chargement surveillance..." />;
  const kpi = data.kpi;

  return (
    <div className="space-y-5">
      <SectionTitle icon="monitoring">Global</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Surveillances" value={kpi.global?.total_surveillances || 0} icon="stethoscope" gradient="from-blue-500 to-indigo-600" shadow="shadow-blue-200" />
        <KPICard label="Lignes" value={kpi.global?.total_lignes || 0} icon="grid_on" gradient="from-emerald-500 to-teal-600" shadow="shadow-emerald-200" />
        <KPICard label="Incidents" value={kpi.global?.incidents_detectes || 0} icon="emergency" gradient="from-red-500 to-rose-600" shadow="shadow-red-200" />
        <KPICard label="Taux" value={`${kpi.global?.taux_incident_pct || 0}%`} icon="percent" gradient="from-amber-500 to-orange-600" shadow="shadow-amber-200" />
      </div>

      <SectionTitle icon="warning">Alertes</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Recirculation', value: kpi.alertes?.recirculation_mauvaise || 0, icon: 'cyclone', color: kpi.alertes?.recirculation_mauvaise > 0 ? 'from-red-500 to-rose-600' : 'from-slate-400 to-slate-500' },
          { label: 'Piège bulle', value: kpi.alertes?.piege_bulle_caillot || 0, icon: 'bubble_chart', color: kpi.alertes?.piege_bulle_caillot > 0 ? 'from-orange-500 to-red-600' : 'from-slate-400 to-slate-500' },
          { label: 'Dealeur', value: kpi.alertes?.dealeur_caillot || 0, icon: 'science', color: kpi.alertes?.dealeur_caillot > 0 ? 'from-amber-500 to-orange-600' : 'from-slate-400 to-slate-500' },
          { label: 'Kt/V faible', value: kpi.alertes?.kt_v_insuffisant || 0, icon: 'analytics', color: kpi.alertes?.kt_v_insuffisant > 0 ? 'from-yellow-500 to-amber-600' : 'from-slate-400 to-slate-500' },
        ].map((a, i) => (
          <motion.div
            key={a.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-gradient-to-br ${a.color} rounded-2xl p-4 text-white shadow-lg`}
          >
            <span className="material-symbols-outlined text-3xl block mb-2">{a.icon}</span>
            <p className="text-2xl font-black">{a.value}</p>
            <p className="text-xs font-bold opacity-90">{a.label}</p>
          </motion.div>
        ))}
      </div>

      <SectionTitle icon="crisis_alert">Patients à risque</SectionTitle>
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4">
        {kpi.patients_a_risque && kpi.patients_a_risque.length > 0 ? (
          <div className="space-y-2">
            {kpi.patients_a_risque.map((p: any, i: number) => (
              <motion.div
                key={p.patient_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex justify-between items-center bg-red-50 border border-red-200 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-sm font-black text-red-800">{p.patient_nom}</p>
                  <p className="text-xs text-red-600">{p.nb_incidents} incidents • {p.niveau}</p>
                </div>
                <span className="material-symbols-outlined text-red-500 text-2xl">warning</span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-5xl text-emerald-400 mb-2 block">check_circle</span>
            <p className="text-sm font-bold text-slate-600">Aucun patient à risque détecté</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Onglet 8 : Performance Personnel ─────────────────────────

function TabPerformance({ data }: any) {
  if (!data) return <EmptyState icon="leaderboard" title="Chargement performance..." />;
  const kpi = data.kpi;

  return (
    <div className="space-y-5">
      <SectionTitle icon="analytics">Global</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <KPICard label="Taux validation" value={`${kpi.global?.taux_validation_soins_global_pct || 0}%`} icon="task_alt" gradient="from-emerald-500 to-teal-600" shadow="shadow-emerald-200" />
        <KPICard label="Charge infirmier" value={kpi.global?.charge_moyenne_infirmier?.toFixed(1) || 0} icon="local_hospital" gradient="from-blue-500 to-indigo-600" shadow="shadow-blue-200" />
        <KPICard label="Charge médecin" value={kpi.global?.charge_moyenne_medecin?.toFixed(1) || 0} icon="medical_services" gradient="from-violet-500 to-purple-600" shadow="shadow-violet-200" />
      </div>

      <SectionTitle icon="local_hospital">Infirmiers ({kpi.infirmiers?.total_actifs || 0})</SectionTitle>
      <div className="space-y-3">
        {kpi.infirmiers?.performance && kpi.infirmiers.performance.length > 0 ? (
          kpi.infirmiers.performance.map((inf: any, i: number) => (
            <motion.div
              key={inf.nom}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-lg">badge</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{inf.nom}</p>
                    <p className="text-xs text-slate-400">Taux validation : {inf.taux_validation_pct}%</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${inf.taux_validation_pct === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {inf.taux_validation_pct}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-lg font-black text-indigo-600">{inf.surveillances}</p>
                  <p className="text-[9px] text-slate-400 font-bold">Surveill.</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-lg font-black text-indigo-600">{inf.soins}</p>
                  <p className="text-[9px] text-slate-400 font-bold">Soins</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-lg font-black text-indigo-600">{inf.validations_soins}</p>
                  <p className="text-[9px] text-slate-400 font-bold">Validés</p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-slate-400 text-sm py-4">Aucune donnée infirmier</p>
        )}
      </div>

      <SectionTitle icon="medical_services">Médecins ({kpi.medecins?.total || 0})</SectionTitle>
      <div className="space-y-3">
        {kpi.medecins?.performance && kpi.medecins.performance.length > 0 ? (
          kpi.medecins.performance.map((med: any, i: number) => (
            <motion.div
              key={med.nom}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-lg">stethoscope</span>
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">{med.nom}</p>
                  <p className="text-xs text-slate-400">{med.specialite}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-lg font-black text-purple-600">{med.rdv_total}</p>
                  <p className="text-[9px] text-slate-400 font-bold">RDV</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-lg font-black text-purple-600">{med.prescriptions_total}</p>
                  <p className="text-[9px] text-slate-400 font-bold">Presc.</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-lg font-black text-purple-600">{med.prescriptions_validees}</p>
                  <p className="text-[9px] text-slate-400 font-bold">Validées</p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-slate-400 text-sm py-4">Aucune donnée médecin</p>
        )}
      </div>
    </div>
  );
}
