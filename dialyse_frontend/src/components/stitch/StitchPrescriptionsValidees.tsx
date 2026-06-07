'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PrescriptionDB {
  id: number;
  patient: {
    id: number;
    nom: string;
    prenom: string;
    telephone?: string;
    dateNaissance?: string;
    notes?: string;
  };
  medecin?: { nom: string };
  date_prescription: string;
  medicament: string;
  dosage: string;
  frequence: string;
  workflow_statut: string;
}

interface PatientGroupe {
  patient: PrescriptionDB['patient'];
  prescriptions: PrescriptionDB[];
}

export default function StitchPrescriptionsValidees() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<PrescriptionDB[]>([]);
  const [loading, setLoading]             = useState(true);
  const [dossierOuvert, setDossierOuvert] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/prescriptions/validees`);
        const data = await res.json();
        if (Array.isArray(data)) setPrescriptions(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const patientsUniques: PatientGroupe[] = prescriptions
    .filter(p => p.patient)
    .reduce((acc: PatientGroupe[], presc) => {
      const exist = acc.find(x => x.patient.id === presc.patient.id);
      if (exist) exist.prescriptions.push(presc);
      else acc.push({ patient: presc.patient, prescriptions: [presc] });
      return acc;
    }, []);

  const age = (d?: string) => {
    if (!d) return '-';
    const t = new Date(), b = new Date(d);
    let a = t.getFullYear() - b.getFullYear();
    const m = t.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
    return `${a} ans`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/30">
      <div className="pt-6 pb-20 md:pb-8 px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto">

        {/* Breadcrumb */}
        <motion.nav initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-4">
          <span>Vitalis Core</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-emerald-600 font-bold">Prescriptions Validées</span>
        </motion.nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl shadow-xl shadow-emerald-200/40 p-5 mb-6 flex items-center justify-between flex-wrap gap-4"
        >
          <div className="text-white">
            <h1 className="text-xl md:text-2xl font-black flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl">verified</span>
              Prescriptions Validées
            </h1>
            <p className="text-xs md:text-sm text-emerald-100 mt-1 font-semibold">
              Historique des prescriptions cliniques validées
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <p className="text-[10px] text-emerald-100 font-semibold uppercase">Patients</p>
              <p className="text-xl font-black text-white">{patientsUniques.length}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <p className="text-[10px] text-emerald-100 font-semibold uppercase">Prescriptions</p>
              <p className="text-xl font-black text-white">{prescriptions.length}</p>
            </div>
          </div>
        </motion.div>

        {/* Info Service Dialyse */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-violet-50 to-pink-50 border-2 border-violet-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-3"
        >
          <span className="material-symbols-outlined text-violet-600 text-xl">info</span>
          <div className="flex-1">
            <p className="text-sm font-black text-violet-800">Service Dialyse</p>
            <p className="text-xs text-violet-600 mt-0.5">
              Pour envoyer une <strong>prescription kit</strong> à la pharmacie, allez sur la page Service Dialyse.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/dialyses')}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white text-xs font-black rounded-xl shadow-md shadow-violet-200 hover:shadow-lg cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
            Aller à Dialyse
          </motion.button>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-500 font-semibold">Chargement...</p>
          </div>
        ) : patientsUniques.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">inventory_2</span>
            <h3 className="text-lg font-bold text-slate-500 mb-2">Aucune prescription validée</h3>
            <button onClick={() => router.push('/dialyses')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm cursor-pointer">
              Voir Service Dialyse
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {patientsUniques.map(({ patient, prescriptions: pp }) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl border border-emerald-200/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-200">
                    <span className="material-symbols-outlined text-xl">verified</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Validé
                      </span>
                      <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                        RDV OK
                      </span>
                    </div>
                    <p className="font-black text-sm text-slate-800">{patient.prenom} {patient.nom}</p>
                    <p className="text-[10px] text-slate-400">
                      #{patient.id} · {pp.length} prescription(s) · {age(patient.dateNaissance)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDossierOuvert(dossierOuvert === patient.id ? null : patient.id)}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        dossierOuvert === patient.id
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {dossierOuvert === patient.id ? 'folder_open' : 'folder'}
                      </span>
                    </motion.button>
                  </div>
                </div>

                {/* Dossier déplié */}
                <AnimatePresence>
                  {dossierOuvert === patient.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t-2 border-blue-200"
                    >
                      <div className="p-5 bg-gradient-to-r from-blue-50/50 to-white">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-black text-blue-800">
                            📂 Dossier {patient.prenom} {patient.nom}
                          </h3>
                          <button onClick={() => setDossierOuvert(null)}
                            className="p-1 text-slate-400 hover:text-red-500">
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          {[
                            { l: 'Nom complet', v: `${patient.prenom} ${patient.nom}` },
                            { l: 'ID', v: `#${patient.id}` },
                            { l: 'Âge', v: age(patient.dateNaissance) },
                            { l: 'Né(e) le', v: patient.dateNaissance ? new Date(patient.dateNaissance).toLocaleDateString('fr-FR') : '-' },
                            { l: 'Téléphone', v: patient.telephone || '-' },
                            { l: 'Notes', v: patient.notes || '-' },
                            { l: 'Prescriptions', v: `${pp.length} validée(s)` },
                            { l: 'Dernière', v: pp[0] ? new Date(pp[0].date_prescription).toLocaleDateString('fr-FR') : '-' },
                          ].map(i => (
                            <div key={i.l} className="bg-white rounded-xl p-3 border border-blue-100">
                              <p className="text-[10px] text-blue-400 uppercase font-bold">{i.l}</p>
                              <p className="text-sm font-bold text-blue-800 mt-0.5">{i.v}</p>
                            </div>
                          ))}
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                          <p className="text-xs font-bold text-slate-700 mb-3">
                            📋 Prescriptions ({pp.length})
                          </p>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-slate-400 border-b">
                                <th className="text-left py-2">Date</th>
                                <th className="text-left py-2">Médicament</th>
                                <th className="text-left py-2">Dosage</th>
                                <th className="text-left py-2">Fréquence</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pp.map((p, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                  <td className="py-2">{new Date(p.date_prescription).toLocaleDateString('fr-FR')}</td>
                                  <td className="py-2 font-bold">{p.medicament}</td>
                                  <td className="py-2">{p.dosage}</td>
                                  <td className="py-2">{p.frequence}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}