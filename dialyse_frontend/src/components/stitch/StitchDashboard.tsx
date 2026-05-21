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
        const couleurs = ['blue', 'orange', 'purple', 'emerald', 'pink'];
        const stats = JSON.parse(localStorage.getItem('chu_seances_stats') || '{}');
        const patientSeances = JSON.parse(localStorage.getItem('chu_seances_patient') || '{}');
        const patientsList: PatientSeance[] = (rdvs || []).map((rdv: any, i: number) => {
          const infos = rdv.soso_kevitra_malalaka || '';
          const machine = infos.includes('Machine') ? infos.split('|')[1]?.trim() || 'N/A' : 'N/A';
          const date = new Date(rdv.date_heure);
          const heure = `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
          const savedStat = stats[`rdv_${rdv.id}`];
          return {
            id: rdv.id, nom: rdv.patient.nom, prenom: rdv.patient.prenom,
            initiales: `${rdv.patient.prenom.charAt(0)}${rdv.patient.nom.charAt(0)}`,
            poste: machine, debut: heure,
            progression: savedStat?.statut === 'termine' ? 100 : savedStat?.progression || 0,
            statut: savedStat?.statut || 'en_attente',
            couleur: couleurs[i % couleurs.length],
            patientId: rdv.patient.id,
            seanceNum: patientSeances[String(rdv.patient.id)]?.seanceNum || 1,
          };
        });
        Object.entries(patientSeances).forEach(([key, val]: [string, any]) => {
          if (!patientsList.find(p => String(p.patientId) === key) && val.patientName) {
            patientsList.push({
              id: parseInt(key) || Date.now(), nom: val.patientName?.split(' ')[1] || '', prenom: val.patientName?.split(' ')[0] || '',
              initiales: (val.patientName || '??').split(' ').map((n: string) => n.charAt(0)).join(''),
              poste: val.poste || 'N/A',
              debut: val.debut ? new Date(val.debut).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }) : '--:--',
              progression: val.statut === 'termine' ? 100 : val.progression || 0,
              statut: val.statut || 'en_cours', couleur: 'blue',
              patientId: parseInt(key) || 0, seanceNum: val.seanceNum || 1,
            });
          }
        });
        setPatients(patientsList);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const total = patients.length;
  const fait = patients.filter(p => p.statut === 'termine').length;
  const enCours = patients.filter(p => p.statut === 'en_cours').length;
  const enAttente = patients.filter(p => p.statut === 'en_attente').length;

  const handleMarquerFait = (p: PatientSeance) => {
    const stats = JSON.parse(localStorage.getItem('chu_seances_stats') || '{}');
    stats[`rdv_${p.id}`] = { ...stats[`rdv_${p.id}`], statut: 'termine', progression: 100 };
    localStorage.setItem('chu_seances_stats', JSON.stringify(stats));
    loadPatients();
  };

  const handleDemarrer = (p: PatientSeance) => {
    const stats = JSON.parse(localStorage.getItem('chu_seances_stats') || '{}');
    stats[`rdv_${p.id}`] = { statut: 'en_cours', progression: 0, heureDebut: Date.now() };
    localStorage.setItem('chu_seances_stats', JSON.stringify(stats));
    window.location.href = '/dialyses/nouvelle-seance';
  };

  const openModal = (type: ModalType, patient: PatientSeance) => {
    setPatientSelectionne(patient);
    setModalOpen(type);
  };

  const closeModal = () => {
    setModalOpen(null);
    setPatientSelectionne(null);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 min-h-screen">
      <main className="min-h-screen">
        <div className="p-6 space-y-6">
          <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="text-2xl font-black font-manrope text-slate-800">
            Tableau de Bord <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-semibold align-middle">Temps réel</span>
          </motion.h2>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
              <span className="text-slate-500 text-xs font-semibold">Total aujourd&apos;hui</span>
              <div className="flex items-baseline gap-2"><span className="text-3xl font-black text-blue-600">{total}</span><span className="text-lg text-slate-300 font-bold">séances</span></div>
              <p className="text-[11px] text-slate-500 mt-1">{fait}/{total} terminée(s)</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
              <span className="text-slate-500 text-xs font-semibold">En cours</span>
              <div className="flex items-end justify-between"><span className="text-3xl font-black text-amber-600">{enCours}</span><span className="material-symbols-outlined text-amber-500/60 text-3xl">hourglass_top</span></div>
              <p className="text-[11px] text-slate-500 mt-1">{enAttente} en attente</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-rose-600 p-5 rounded-2xl shadow-md">
              <span className="text-red-100 text-xs font-semibold">Alertes critiques</span>
              <div className="flex items-end justify-between"><span className="text-3xl font-black text-white">02</span><span className="material-symbols-outlined text-white text-3xl">warning</span></div>
            </div>
          </motion.section>

          {/* Liste des dialyses */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-manrope text-slate-800">Liste des dialyses du jour</h2>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">{total} patient{total>1?'s':''}</span>
            </div>
            {loading ? (
              <div className="text-center py-8"><div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div></div>
            ) : patients.length === 0 ? (
              <div className="text-center py-8 text-slate-400"><span className="material-symbols-outlined text-4xl mb-2">event_busy</span><p>Aucun RDV aujourd&apos;hui</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead><tr className="text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100"><th className="pb-3 pl-2">Patient</th><th className="pb-3">Poste</th><th className="pb-3">Progression</th><th className="pb-3 text-center">Action</th><th className="pb-3 text-center">Statut</th><th className="pb-3 text-center">Accès</th></tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {patients.map((p, index) => (
                      <motion.tr key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ backgroundColor: '#f8fafc' }} className="group transition-colors">
                        <td className="py-4 pl-2"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${p.couleur}-500 to-${p.couleur}-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shrink-0`}>{p.initiales}</div><div><p className="font-bold text-sm text-slate-800">{p.prenom} {p.nom}</p><p className="text-[10px] text-slate-400">Séance {p.seanceNum}</p></div></div></td>
                        <td className="py-4"><span className="text-sm font-bold text-slate-700">{p.poste}</span></td>
                        <td className="py-4"><div className="max-w-[140px]"><div className="flex justify-between text-[10px] mb-1"><span className="text-slate-400">{p.debut}</span><span className="font-bold text-blue-600">{p.progression}%</span></div><div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${p.statut === 'termine' ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${p.progression}%` }} /></div></div></td>
                        <td className="py-4 text-center">
                          {p.statut === 'en_attente' ? (
                            <button onClick={() => handleDemarrer(p)} className="px-4 py-2 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 cursor-pointer">Démarrer</button>
                          ) : p.statut === 'en_cours' ? (
                            <button onClick={() => handleMarquerFait(p)} className="px-4 py-2 bg-emerald-600 text-white text-[11px] font-bold rounded-lg hover:bg-emerald-700 cursor-pointer">Fait</button>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600">✅ Fait</span>
                          )}
                        </td>
                        <td className="py-4 text-center"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.statut === 'termine' ? 'bg-emerald-50 text-emerald-600' : p.statut === 'en_cours' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>{p.statut === 'termine' ? 'Fait' : p.statut === 'en_cours' ? 'En cours' : 'En attente'}</span></td>
                        <td className="py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => openModal('medecin', p)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all cursor-pointer" title="Médecin"><span className="material-symbols-outlined text-lg">stethoscope</span></button>
                            <button onClick={() => openModal('paramedical', p)} className="p-2 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-all cursor-pointer" title="Paramédical"><span className="material-symbols-outlined text-lg">medical_services</span></button>
                            <button onClick={() => openModal('dossier', p)} className="p-2 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-purple-600 transition-all cursor-pointer" title="Dossier"><span className="material-symbols-outlined text-lg">folder_open</span></button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* MODAL OVERLAY */}
      <AnimatePresence>
        {modalOpen && patientSelectionne && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            {/* Backdrop blur */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className={`p-6 rounded-t-2xl flex items-center justify-between ${
                modalOpen === 'medecin' ? 'bg-gradient-to-r from-blue-50 to-blue-100' :
                modalOpen === 'paramedical' ? 'bg-gradient-to-r from-emerald-50 to-emerald-100' :
                'bg-gradient-to-r from-purple-50 to-purple-100'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    modalOpen === 'medecin' ? 'bg-blue-600' : modalOpen === 'paramedical' ? 'bg-emerald-600' : 'bg-purple-600'
                  }`}>
                    <span className="material-symbols-outlined text-white text-2xl">
                      {modalOpen === 'medecin' ? 'stethoscope' : modalOpen === 'paramedical' ? 'medical_services' : 'folder_open'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800">
                      {modalOpen === 'medecin' ? 'Section Médecin' : modalOpen === 'paramedical' ? 'Section Paramédical' : 'Dossier Patient'}
                    </h2>
                    <p className="text-sm text-slate-500">{patientSelectionne.prenom} {patientSelectionne.nom} · Séance {patientSelectionne.seanceNum} · Poste {patientSelectionne.poste}</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-white/50 rounded-xl transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-slate-500 text-xl">close</span>
                </button>
              </div>

              {/* Contenu selon le type */}
              <div className="p-6">
                {modalOpen === 'medecin' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-md transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-blue-600 text-2xl mb-2">prescriptions</span>
                      <p className="text-sm font-bold text-blue-800 mb-1">Prescription</p>
                      <p className="text-xs text-blue-500 mb-4">Gérer les prescriptions du patient</p>
                      <button onClick={() => window.location.href='/dialyses'} className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 cursor-pointer">Accéder</button>
                    </div>
                    <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-md transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-blue-600 text-2xl mb-2">verified</span>
                      <p className="text-sm font-bold text-blue-800 mb-1">Validation</p>
                      <p className="text-xs text-blue-500 mb-4">Valider protocoles et ordonnances</p>
                      <button onClick={() => window.location.href='/dialyses/prescriptions-validees'} className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 cursor-pointer">Valider</button>
                    </div>
                    <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-md transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-blue-600 text-2xl mb-2">edit_note</span>
                      <p className="text-sm font-bold text-blue-800 mb-1">Observations</p>
                      <p className="text-xs text-blue-500 mb-4">Notes et observations médicales</p>
                      <button onClick={() => window.location.href='/demandes-avis'} className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 cursor-pointer">Consulter</button>
                    </div>
                  </div>
                )}

                {modalOpen === 'paramedical' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 hover:shadow-md transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-emerald-600 text-2xl mb-2">monitor_heart</span>
                      <p className="text-sm font-bold text-emerald-800 mb-1">Constantes</p>
                      <p className="text-xs text-emerald-500 mb-4">Relevé des constantes vitales</p>
                      <button onClick={() => window.location.href='/dialyses/fiche-surveillance'} className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 cursor-pointer">Saisir</button>
                    </div>
                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 hover:shadow-md transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-emerald-600 text-2xl mb-2">visibility</span>
                      <p className="text-sm font-bold text-emerald-800 mb-1">Surveillance</p>
                      <p className="text-xs text-emerald-500 mb-4">Fiche de surveillance dialyse</p>
                      <button onClick={() => window.location.href='/dialyses/fiche-surveillance'} className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 cursor-pointer">Ouvrir</button>
                    </div>
                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 hover:shadow-md transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-emerald-600 text-2xl mb-2">healing</span>
                      <p className="text-sm font-bold text-emerald-800 mb-1">Soins</p>
                      <p className="text-xs text-emerald-500 mb-4">Soins infirmiers et pansements</p>
                      <button className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 cursor-pointer">Noter</button>
                    </div>
                  </div>
                )}

                {modalOpen === 'dossier' && (
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      {[{ l: 'Patient', v: `${patientSelectionne.prenom} ${patientSelectionne.nom}` },{ l: 'Poste', v: patientSelectionne.poste },{ l: 'Début', v: patientSelectionne.debut },{ l: 'Progression', v: `${patientSelectionne.progression}%` },{ l: 'Statut', v: patientSelectionne.statut === 'termine' ? 'Fait' : patientSelectionne.statut === 'en_cours' ? 'En cours' : 'En attente' },{ l: 'Séance', v: `N°${patientSelectionne.seanceNum}` },{ l: 'ID', v: `#${patientSelectionne.patientId}` },{ l: 'Médecin', v: 'Dr. Andrianjato' }].map(i => (<div key={i.l} className="bg-purple-50 rounded-xl p-3 border border-purple-100"><p className="text-[10px] text-purple-400 uppercase">{i.l}</p><p className="text-sm font-bold text-purple-800">{i.v}</p></div>))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 hover:shadow-md transition-all cursor-pointer">
                        <span className="material-symbols-outlined text-purple-600 text-2xl mb-2">history</span>
                        <p className="text-sm font-bold text-purple-800 mb-1">Historique</p>
                        <p className="text-xs text-purple-500 mb-4">Historique des séances et prescriptions</p>
                        <button className="w-full py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 cursor-pointer">Voir</button>
                      </div>
                      <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 hover:shadow-md transition-all cursor-pointer">
                        <span className="material-symbols-outlined text-purple-600 text-2xl mb-2">biotech</span>
                        <p className="text-sm font-bold text-purple-800 mb-1">Examens</p>
                        <p className="text-xs text-purple-500 mb-4">Résultats d&apos;examens biologiques</p>
                        <button className="w-full py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 cursor-pointer">Consulter</button>
                      </div>
                      <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 hover:shadow-md transition-all cursor-pointer">
                        <span className="material-symbols-outlined text-purple-600 text-2xl mb-2">description</span>
                        <p className="text-sm font-bold text-purple-800 mb-1">Documents</p>
                        <p className="text-xs text-purple-500 mb-4">Ordonnances, certificats, CR</p>
                        <button className="w-full py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 cursor-pointer">Accéder</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
