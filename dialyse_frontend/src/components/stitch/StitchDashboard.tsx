'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PatientSeance {
  id: number;
  nom: string;
  prenom: string;
  initiales: string;
  poste: string;
  debut: string;
  progression: number;
  statut: 'en_cours' | 'en_attente' | 'termine';
  couleur: string;
  patientId: number;
  seanceNum: number;
}

type ModalType = 'medecin' | 'paramedical' | 'dossier' | null;

/* ── Couleurs avatar par index ── */
const AVATAR_COLORS = [
  { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  { bg: 'bg-emerald-100',text: 'text-emerald-700' },
  { bg: 'bg-amber-100',  text: 'text-amber-700'   },
  { bg: 'bg-purple-100', text: 'text-purple-700'  },
  { bg: 'bg-rose-100',   text: 'text-rose-700'    },
  { bg: 'bg-cyan-100',   text: 'text-cyan-700'    },
];

/* ── Badge statut ── */
function StatutBadge({ statut }: { statut: PatientSeance['statut'] }) {
  if (statut === 'termine')   return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Terminé</span>;
  if (statut === 'en_cours')  return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">En cours</span>;
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">En attente</span>;
}

/* ── Barre de progression ── */
function ProgressBar({ value, statut }: { value: number; statut: PatientSeance['statut'] }) {
  const color = statut === 'termine' ? 'bg-emerald-500' : statut === 'en_cours' ? 'bg-blue-500' : 'bg-slate-300';
  return (
    <div className="w-24">
      <div className="flex justify-between text-[9px] mb-1">
        <span className="text-slate-400 font-medium">{value}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

/* ── Modal section ── */
function SectionModal({
  open, type, patient, onClose,
}: {
  open: boolean;
  type: ModalType;
  patient: PatientSeance | null;
  onClose: () => void;
}) {
  if (!open || !patient || !type) return null;

  const config = {
    medecin:     { label: 'Section Médecin',    icon: 'stethoscope',       from: 'from-blue-50',    to: 'to-blue-100',    iconBg: 'bg-blue-600',    accent: 'blue'    },
    paramedical: { label: 'Section Paramédical', icon: 'medical_services',  from: 'from-emerald-50', to: 'to-emerald-100', iconBg: 'bg-emerald-600', accent: 'emerald' },
    dossier:     { label: 'Dossier Patient',     icon: 'folder_open',       from: 'from-purple-50',  to: 'to-purple-100',  iconBg: 'bg-purple-600',  accent: 'purple'  },
  }[type];

  const medecinCards = [
    { icon: 'vaccines',                 title: 'Vérification Kit',          desc: 'Ordonnance kit hémodialyse — 1ère séance et suivantes', btn: 'Ouvrir',   href: `/dialyses/verification-kit?patientId=${patient.patientId}&seanceNum=${patient.seanceNum}`,   color: 'blue' },
    { icon: 'settings_input_component', title: 'Conductivité & Paramètres', desc: 'Paramètres dialysat, UF, débits et prescription séance', btn: 'Accéder', href: `/dialyses/conductivite-params?patientId=${patient.patientId}&seanceNum=${patient.seanceNum}`, color: 'blue' },
  ];

  const paraCards = [
    { icon: 'monitor_heart', title: 'Constantes',   desc: 'Relevé des constantes vitales',   btn: 'Saisir',  href: '/dialyses/fiche-surveillance', color: 'emerald' },
    { icon: 'visibility',    title: 'Surveillance', desc: 'Fiche de surveillance dialyse',   btn: 'Ouvrir',  href: '/dialyses/fiche-surveillance', color: 'emerald' },
    { icon: 'healing',       title: 'Soins',        desc: 'Soins infirmiers et pansements',  btn: 'Noter',   href: '#',                            color: 'emerald' },
  ];

  const dossierMeta = [
    { l: 'Patient',     v: `${patient.prenom} ${patient.nom}` },
    { l: 'Poste',       v: patient.poste },
    { l: 'Début',       v: patient.debut },
    { l: 'Progression', v: `${patient.progression}%` },
    { l: 'Statut',      v: patient.statut === 'termine' ? 'Terminé' : patient.statut === 'en_cours' ? 'En cours' : 'En attente' },
    { l: 'Séance',      v: `N°${patient.seanceNum}` },
    { l: 'ID',          v: `#${patient.patientId}` },
    { l: 'Médecin',     v: 'Dr. Andrianjato' },
  ];

  const dossierCards = [
    { icon: 'history',     title: 'Historique', desc: 'Historique des séances', btn: 'Voir',      href: '#', color: 'purple' },
    { icon: 'biotech',     title: 'Examens',    desc: 'Résultats biologiques',  btn: 'Consulter', href: '#', color: 'purple' },
    { icon: 'description', title: 'Documents',  desc: 'Ordonnances, CR',        btn: 'Accéder',   href: '#', color: 'purple' },
  ];

  const renderCards = (cards: typeof medecinCards, accentColor: string) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {cards.map((c) => (
        <div key={c.title} className={`p-4 bg-${accentColor}-50 rounded-xl border border-${accentColor}-100 hover:shadow-md transition-all cursor-pointer`}>
          <span className={`material-symbols-outlined text-${accentColor}-600 text-2xl mb-2`}>{c.icon}</span>
          <p className={`text-sm font-bold text-${accentColor}-800 mb-1`}>{c.title}</p>
          <p className={`text-xs text-${accentColor}-500 mb-3`}>{c.desc}</p>
          <button
            onClick={() => { if (c.href !== '#') window.location.href = c.href; }}
            className={`w-full py-1.5 bg-${accentColor}-600 text-white text-xs font-bold rounded-lg hover:bg-${accentColor}-700 cursor-pointer transition-colors`}
          >
            {c.btn}
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[82vh] overflow-y-auto"
          >
            {/* Header modal */}
            <div className={`p-5 rounded-t-2xl flex items-center justify-between bg-gradient-to-r ${config.from} ${config.to}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center shadow-sm`}>
                  <span className="material-symbols-outlined text-white text-xl">{config.icon}</span>
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800">{config.label}</h2>
                  <p className="text-xs text-slate-500">{patient.prenom} {patient.nom} · Séance {patient.seanceNum} · Poste {patient.poste}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-white/50 rounded-xl transition-all cursor-pointer">
                <span className="material-symbols-outlined text-slate-500 text-lg">close</span>
              </button>
            </div>

            {/* Contenu modal */}
            <div className="p-5">
              {type === 'medecin'     && renderCards(medecinCards, 'blue')}
              {type === 'paramedical' && renderCards(paraCards, 'emerald')}
              {type === 'dossier'     && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    {dossierMeta.map((m) => (
                      <div key={m.l} className="bg-purple-50 rounded-xl p-2.5 border border-purple-100">
                        <p className="text-[9px] text-purple-400 uppercase tracking-wide">{m.l}</p>
                        <p className="text-xs font-bold text-purple-800 mt-0.5">{m.v}</p>
                      </div>
                    ))}
                  </div>
                  {renderCards(dossierCards, 'purple')}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  COMPOSANT PRINCIPAL                                                */
/* ═══════════════════════════════════════════════════════════════════ */
export default function StitchDashboard() {
  const [patients, setPatients] = useState<PatientSeance[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [patientSelectionne, setPatientSelectionne] = useState<PatientSeance | null>(null);

  useEffect(() => {
    loadPatients();
    const interval = setInterval(loadPatients, 30000);
    return () => clearInterval(interval);
  }, []);

    const loadPatients = async () => {
    try {
      const res = await fetch(`${API_URL}/rendezvous/aujourdhui`);
      if (res.ok) {
        const rdvs = await res.json();
        const now = new Date();
        const aujourdHui = now.toISOString().split('T')[0];
        const rdvAujourdhui = (rdvs || []).filter((rdv: any) => {
          if (!rdv.patient) return false;
          const dateRdv = new Date(rdv.date_heure).toISOString().split('T')[0];
          return dateRdv === aujourdHui;
        });
        const stats = JSON.parse(localStorage.getItem('chu_seances_stats') || '{}');
        const patientSeances = JSON.parse(localStorage.getItem('chu_seances_patient') || '{}');
        const list: PatientSeance[] = rdvAujourdhui.map((rdv: any, i: number) => {
          const infos = rdv.soso_kevitra_malalaka || '';
          const machine = infos.includes('|') ? infos.split('|')[1]?.trim() || 'N/A' : infos || 'N/A';
          const date = new Date(rdv.date_heure);
          const heure = `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
          const saved = stats[`rdv_${rdv.id}`];
          const couleurs = ['blue','orange','purple','emerald','pink'];
          return {
            id: rdv.id, nom: rdv.patient.nom, prenom: rdv.patient.prenom,
            initiales: `${rdv.patient.prenom.charAt(0)}${rdv.patient.nom.charAt(0)}`,
            poste: machine, debut: heure,
            progression: saved?.statut === 'termine' ? 100 : saved?.progression || 0,
            statut: saved?.statut || 'en_attente',
            couleur: couleurs[i % couleurs.length],
            patientId: rdv.patient.id,
            seanceNum: patientSeances[String(rdv.patient.id)]?.seanceNum || 1,
          };
        });
        setPatients(list);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const total    = patients.length;
  const fait     = patients.filter(p => p.statut === 'termine').length;
  const enCours  = patients.filter(p => p.statut === 'en_cours').length;
  const enAttente = patients.filter(p => p.statut === 'en_attente').length;
  const pct      = total > 0 ? Math.round((fait / total) * 100) : 0;

  const handleDemarrer = (p: PatientSeance) => {
    const stats = JSON.parse(localStorage.getItem('chu_seances_stats') || '{}');
    stats[`rdv_${p.id}`] = { statut: 'en_cours', progression: 0, heureDebut: Date.now() };
    localStorage.setItem('chu_seances_stats', JSON.stringify(stats));
    window.location.href = '/dialyses/nouvelle-seance';
  };

  const handleMarquerFait = (p: PatientSeance) => {
    const stats = JSON.parse(localStorage.getItem('chu_seances_stats') || '{}');
    stats[`rdv_${p.id}`] = { ...stats[`rdv_${p.id}`], statut: 'termine', progression: 100 };
    localStorage.setItem('chu_seances_stats', JSON.stringify(stats));
    loadPatients();
  };

  const openModal = (type: ModalType, patient: PatientSeance) => {
    setPatientSelectionne(patient);
    setModalOpen(type);
  };

  /* ── KPI cards data ── */
  const kpiCards = [
    {
      label: 'Total du jour', value: total, sub: `${fait}/${total} terminée(s)`,
      iconName: 'groups', iconBg: 'bg-blue-100', iconColor: 'text-blue-600',
      barColor: 'bg-blue-500', barPct: total > 0 ? 100 : 0, valueColor: 'text-slate-800',
    },
    {
      label: 'En cours', value: enCours, sub: `${enAttente} en attente`,
      iconName: 'hourglass_top', iconBg: 'bg-amber-100', iconColor: 'text-amber-600',
      barColor: 'bg-amber-400', barPct: total > 0 ? Math.round((enCours / total) * 100) : 0, valueColor: 'text-amber-600',
    },
    {
      label: 'Terminées', value: fait, sub: `${pct}% du programme`,
      iconName: 'check_circle', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',
      barColor: 'bg-emerald-500', barPct: pct, valueColor: 'text-emerald-600',
    },
    {
      label: 'Alertes critiques', value: 2, sub: 'Intervention requise',
      iconName: 'warning', iconBg: 'bg-red-100', iconColor: 'text-red-600',
      barColor: 'bg-red-500', barPct: 17, valueColor: 'text-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">

        {/* ── Titre ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-black font-manrope text-slate-800">
              Tableau de Bord
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">Service de dialyse · Temps réel</p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            En direct
          </span>
        </motion.div>

        {/* ── KPI Cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {kpiCards.map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{k.label}</span>
                <div className={`w-8 h-8 rounded-xl ${k.iconBg} flex items-center justify-center`}>
                  <span className={`material-symbols-outlined text-lg ${k.iconColor}`}>{k.iconName}</span>
                </div>
              </div>
              <p className={`text-3xl font-black ${k.valueColor}`}>{k.value}</p>
              <p className="text-[10px] text-slate-400 mt-1">{k.sub}</p>
              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${k.barPct}%` }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${k.barColor}`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Tableau dialyses ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden"
        >
          {/* Header tableau */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold font-manrope text-slate-800">Dialyses du jour</h2>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
              {total} patient{total > 1 ? 's' : ''}
            </span>
          </div>

          {/* Contenu tableau */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-3 block text-slate-300">event_busy</span>
              <p className="text-sm font-medium">Aucun rendez-vous aujourd&apos;hui</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {['Patient', 'Poste', 'Début', 'Progression', 'Action', 'Statut', 'Médecin', 'Paramédical', 'Dossier'].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {patients.map((p, index) => {
                    const ac = AVATAR_COLORS[index % AVATAR_COLORS.length];
                    const isAlerte = p.statut === 'en_cours' && p.progression < 20 && index === 3; // simuler alerte
                    return (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className={`group transition-colors hover:bg-slate-50/80 ${isAlerte ? 'bg-red-50/40' : ''}`}
                      >
                        {/* Patient */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-xl ${ac.bg} ${ac.text} flex items-center justify-center font-bold text-xs flex-shrink-0`}>
                              {p.initiales}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{p.prenom} {p.nom}</p>
                              <p className="text-[9px] text-slate-400">Séance {p.seanceNum}</p>
                            </div>
                          </div>
                        </td>

                        {/* Poste */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{p.poste}</span>
                        </td>

                        {/* Début */}
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-500 font-medium">{p.debut}</span>
                        </td>

                        {/* Progression */}
                        <td className="px-4 py-3">
                          <ProgressBar value={p.progression} statut={p.statut} />
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3">
                          {p.statut === 'en_attente' ? (
                            <button
                              onClick={() => handleDemarrer(p)}
                              className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                            >
                              Démarrer
                            </button>
                          ) : p.statut === 'en_cours' ? (
                            <button
                              onClick={() => handleMarquerFait(p)}
                              className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                            >
                              Fait ✓
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">check_circle</span> Terminé
                            </span>
                          )}
                        </td>

                        {/* Statut */}
                        <td className="px-4 py-3">
                          <StatutBadge statut={p.statut} />
                        </td>

                        {/* ── Médecin ── */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => openModal('medecin', p)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <span className="material-symbols-outlined text-[14px]">stethoscope</span>
                            Médecin
                          </button>
                        </td>

                        {/* ── Paramédical ── */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => openModal('paramedical', p)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-lg hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <span className="material-symbols-outlined text-[14px]">medical_services</span>
                            Paramédical
                          </button>
                        </td>

                        {/* ── Dossier ── */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => openModal('dossier', p)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 text-purple-700 text-[10px] font-semibold rounded-lg hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <span className="material-symbols-outlined text-[14px]">folder_open</span>
                            Dossier
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Modal ── */}
      <SectionModal
        open={modalOpen !== null}
        type={modalOpen}
        patient={patientSelectionne}
        onClose={() => { setModalOpen(null); setPatientSelectionne(null); }}
      />
    </div>
  );
}
