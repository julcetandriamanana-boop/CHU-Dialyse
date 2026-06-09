'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ModalPrescriptionKit from '@/src/components/dialyses/ModalPrescriptionKit';
import {
  fetchPatientsKitStatus,
  fetchKitsEnvoyesPatient,
  fetchPrescriptionsCliniques,
  urgenceColors,
  PatientKitStatus,
  KitEnvoye,
  PrescriptionClinique,
} from '@/src/services/pharmacie.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PrescriptionDB {
  id: number;
  patient: {
    id: number;
    nom: string;
    prenom: string;
    telephone?: string;
    dateNaissance?: string;
    numero_dossier?: string;
    external_patient_id?: string;
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
  derniereDate: string;
}

export default function StitchListePrescriptions() {
  const router = useRouter();
  const [prescriptions, setPrescriptions]   = useState<PrescriptionDB[]>([]);
  const [loading, setLoading]               = useState(true);
  const [dateStart, setDateStart]           = useState('');
  const [dateEnd, setDateEnd]               = useState('');
  const [search, setSearch]                 = useState('');
  const [expandedId, setExpandedId]         = useState<number | null>(null);
  const [modalPatient, setModalPatient]     = useState<PrescriptionDB['patient'] | null>(null);
  const [modalRdvId, setModalRdvId]         = useState<number | undefined>(undefined);

  // Statut kits envoyés par patient
  const [kitsStatus, setKitsStatus]         = useState<Record<number, PatientKitStatus>>({});
  const [prescCliniques, setPrescCliniques] = useState<PrescriptionClinique[]>([]);
  const [detailsKits, setDetailsKits]       = useState<Record<number, KitEnvoye[]>>({});
  const [openDetails, setOpenDetails]       = useState<number | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateStart) params.append('startDate', dateStart);
      if (dateEnd) params.append('endDate', dateEnd);
      const [resPresc, status, cliniques] = await Promise.all([
        fetch(`${API_URL}/prescriptions/validees?${params}`).then(r => r.json()).catch(() => []),
        fetchPatientsKitStatus(),
        fetchPrescriptionsCliniques(),
      ]);
      if (Array.isArray(resPresc)) setPrescriptions(resPresc);
      setKitsStatus(status);
      setPrescCliniques(cliniques);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [dateStart, dateEnd]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const loadDetailsPatient = async (patientId: number) => {
    if (detailsKits[patientId]) return;
    const data = await fetchKitsEnvoyesPatient(patientId);
    setDetailsKits(prev => ({ ...prev, [patientId]: data }));
  };

  const handleVoirDetails = async (patientId: number) => {
    if (openDetails === patientId) {
      setOpenDetails(null);
    } else {
      await loadDetailsPatient(patientId);
      setOpenDetails(patientId);
    }
  };

  const handleModalClose = async () => {
    setModalPatient(null);
    setModalRdvId(undefined);
    // Recharger les statuts après fermeture (au cas où kit envoyé)
    const status = await fetchPatientsKitStatus();
    setKitsStatus(status);
  };

  // Grouper prescriptions par patient
  const patientsGroupes: PatientGroupe[] = prescriptions
    .filter(p => p.patient)
    .reduce((acc: PatientGroupe[], presc) => {
      const exist = acc.find(g => g.patient.id === presc.patient.id);
      if (exist) {
        exist.prescriptions.push(presc);
        if (new Date(presc.date_prescription) > new Date(exist.derniereDate)) {
          exist.derniereDate = presc.date_prescription;
        }
      } else {
        acc.push({
          patient: presc.patient,
          prescriptions: [presc],
          derniereDate: presc.date_prescription,
        });
      }
      return acc;
    }, [])
    .filter(g => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        g.patient.nom.toLowerCase().includes(q) ||
        g.patient.prenom.toLowerCase().includes(q) ||
        String(g.patient.id).includes(q)
      );
    })
    .sort((a, b) => new Date(b.derniereDate).getTime() - new Date(a.derniereDate).getTime());

  const totalPatients      = patientsGroupes.length;
  const totalPrescriptions = prescriptions.length;
  const totalKitsEnvoyes   = Object.keys(kitsStatus).length;

  // Trouve la prescription clinique pour un patient (via numero_dossier)
  const findPrescriptionClinique = (numeroDossier?: string, externalId?: string): PrescriptionClinique | null => {
    // Matcher par external_patient_id OU par numero_dossier
    let matchs = prescCliniques.filter(p =>
      (externalId && p.patientId === externalId) ||
      (numeroDossier && p.patientId === numeroDossier)
    );
    if (matchs.length === 0) return null;
    // Retourner la plus récente
    return matchs.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  };

  const formatDateEnvoi = (d: string) => {
    const date = new Date(d);
    return `${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/30">
      <div className="pt-6 pb-20 md:pb-8 px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto">

        <motion.nav initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-4">
          <span>Vitalis Core</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-blue-600 font-bold">Service Dialyse</span>
        </motion.nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl shadow-blue-200/40 p-5 mb-6 flex items-center justify-between flex-wrap gap-4"
        >
          <div className="text-white">
            <h1 className="text-xl md:text-2xl font-black flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl">water_drop</span>
              Service Dialyse
            </h1>
            <p className="text-xs md:text-sm text-blue-100 mt-1 font-semibold">
              Prescriptions validées avec RDV confirmé · Envoi vers Pharmacie
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <p className="text-[10px] text-blue-100 font-semibold uppercase">Patients</p>
              <p className="text-xl font-black text-white">{totalPatients}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <p className="text-[10px] text-blue-100 font-semibold uppercase">Prescriptions</p>
              <p className="text-xl font-black text-white">{totalPrescriptions}</p>
            </div>
            <div className="bg-emerald-400/30 backdrop-blur-sm rounded-xl px-4 py-2 border border-emerald-300/40">
              <p className="text-[10px] text-emerald-100 font-semibold uppercase">Kits Envoyés</p>
              <p className="text-xl font-black text-white">{totalKitsEnvoyes}</p>
            </div>
          </div>
        </motion.div>

        {/* Info workflow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-3"
        >
          <span className="material-symbols-outlined text-emerald-600 text-xl">verified</span>
          <div className="flex-1">
            <p className="text-sm font-black text-emerald-800">Workflow validé</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Service Clinique → Prescription validée → RDV validé → <strong>Service Dialyse</strong> → Pharmacie
            </p>
          </div>
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 mb-6 flex items-center gap-3 flex-wrap"
        >
          <div className="flex-1 min-w-[250px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              type="text"
              placeholder="Rechercher patient (nom, prénom, ID)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-sm font-semibold border-2 border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">date_range</span>Dates :
            </span>
            <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)}
              className="bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:bg-white outline-none cursor-pointer font-semibold" />
            <span className="text-slate-400 text-xs">→</span>
            <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)}
              className="bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:bg-white outline-none cursor-pointer font-semibold" />
            {(dateStart || dateEnd) && (
              <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }}
                onClick={() => { setDateStart(''); setDateEnd(''); }}
                className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 cursor-pointer">
                <span className="material-symbols-outlined text-sm">close</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Liste */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-500 font-semibold">Chargement des prescriptions validées...</p>
          </div>
        ) : patientsGroupes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">inventory_2</span>
            <h3 className="text-lg font-bold text-slate-500 mb-2">Aucune prescription validée</h3>
            <p className="text-xs text-slate-400">
              Les prescriptions validées par le service clinique apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {patientsGroupes.map((groupe, index) => {
              const { patient, prescriptions: pp, derniereDate } = groupe;
              const isExpanded     = expandedId === patient.id;
              const isOpenDetails  = openDetails === patient.id;
              const kitInfo        = kitsStatus[patient.id];
              const clinique     = findPrescriptionClinique(patient.numero_dossier, patient.external_patient_id);
              const urgColors    = clinique ? urgenceColors(clinique.urgence) : null;
              const kitEnvoye      = !!kitInfo;
              const detailsList    = detailsKits[patient.id] || [];

              return (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
                    clinique && urgColors ? `${urgColors.border}/50 border-l-4` : kitEnvoye ? 'border-emerald-300/70 bg-gradient-to-r from-emerald-50/40 to-white' : 'border-emerald-200/60'
                  }`}
                >
                  <div className="p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md ${
                      kitEnvoye
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200'
                        : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200'
                    }`}>
                      <span className="text-base font-black">
                        {patient.prenom.charAt(0)}{patient.nom.charAt(0)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Validé
                        </span>
                        <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                          RDV OK
                        </span>
                        {/* Badge urgence clinique */}
                        {clinique && urgColors && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 ${urgColors.bg} ${urgColors.text}`}
                          >
                            <span className="material-symbols-outlined text-[10px]">warning</span>
                            {urgColors.label}
                          </motion.span>
                        )}
                        {/* Badge type dialyse */}
                        {clinique?.typeDialyse && (
                          <span className="text-[10px] font-bold bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full border border-cyan-200">
                            {clinique.typeDialyse}
                          </span>
                        )}
                        {kitEnvoye && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-[10px] font-black bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-2 py-0.5 rounded-full shadow-md shadow-emerald-200 flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[12px]">local_pharmacy</span>
                            KIT ENVOYÉ ({kitInfo.count})
                          </motion.span>
                        )}
                        <span className="text-[10px] text-slate-400">#{patient.id}</span>
                      </div>
                      <p className="font-black text-sm text-slate-800">
                        {patient.prenom} {patient.nom}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {pp.length} prescription(s) · Dernière : {new Date(derniereDate).toLocaleDateString('fr-FR')}
                      </p>
                      {/* Infos cliniques */}
                      {clinique?.alertes && (
                        <p className="text-[10px] text-red-600 font-bold mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">emergency</span>
                          Alerte : {clinique.alertes}
                        </p>
                      )}
                      {clinique?.renseignements && (
                        <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">description</span>
                          {clinique.renseignements}
                        </p>
                      )}
                      {clinique?.remarques && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5">
                          "{clinique.remarques}"
                        </p>
                      )}
                      {kitEnvoye && (
                        <p className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">schedule</span>
                          Envoyé le {formatDateEnvoi(kitInfo.dernier)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setExpandedId(isExpanded ? null : patient.id)}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          isExpanded
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                        title="Prescriptions"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {isExpanded ? 'visibility_off' : 'visibility'}
                        </span>
                      </motion.button>

                      {kitEnvoye ? (
                        // Bouton "Voir Détails" (lecture seule)
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleVoirDetails(patient.id)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-[11px] font-black hover:shadow-lg shadow-md shadow-emerald-200 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isOpenDetails ? 'expand_less' : 'visibility'}
                          </span>
                          Voir Détails
                        </motion.button>
                      ) : (
                        // Bouton "Prescription Kit"
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => { setModalPatient(patient); setModalRdvId(undefined); }}
                          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-xl text-[11px] font-black hover:shadow-lg shadow-md shadow-violet-200 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">prescriptions</span>
                          Prescription Kit
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Détails kits envoyés */}
                  <AnimatePresence>
                    {isOpenDetails && kitEnvoye && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t-2 border-emerald-200 bg-gradient-to-r from-emerald-50/50 to-teal-50/30"
                      >
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                              <span className="material-symbols-outlined text-base">local_pharmacy</span>
                              Historique kits envoyés ({detailsList.length})
                            </p>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => { setModalPatient(patient); setModalRdvId(undefined); }}
                              className="px-3 py-1.5 bg-white border-2 border-violet-300 text-violet-700 rounded-lg text-[10px] font-black hover:bg-violet-50 cursor-pointer transition-all flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-sm">add</span>
                              Nouveau Kit
                            </motion.button>
                          </div>
                          <div className="space-y-2">
                            {detailsList.map(k => (
                              <div key={k.id} className="bg-white rounded-xl p-3 border border-emerald-100 flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                  k.type_kit === 'premiere' ? 'bg-blue-100 text-blue-600' :
                                  k.type_kit === 'suivante' ? 'bg-emerald-100 text-emerald-600' :
                                  'bg-amber-100 text-amber-600'
                                }`}>
                                  <span className="material-symbols-outlined text-base">
                                    {k.type_kit === 'premiere' ? 'vaccines' :
                                     k.type_kit === 'suivante' ? 'autorenew' : 'medical_services'}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-black text-slate-800 truncate">{k.kit_nom}</p>
                                  <p className="text-[10px] text-slate-500 mt-0.5">
                                    {k.articles_count} articles · Par {k.emetteur_nom || 'Anonyme'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-bold text-emerald-700">
                                    {formatDateEnvoi(k.date_envoi)}
                                  </p>
                                  <p className="text-[9px] text-slate-400 font-semibold uppercase">{k.statut}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Détails prescriptions */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t-2 border-blue-100 bg-gradient-to-r from-blue-50/30 to-indigo-50/30"
                      >
                        <div className="p-5">
                          <p className="text-[10px] font-black text-blue-700 uppercase tracking-wider mb-3">
                            📋 Prescriptions validées ({pp.length})
                          </p>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-blue-200 text-slate-500">
                                  <th className="text-left py-2 px-2 font-bold">Date</th>
                                  <th className="text-left py-2 px-2 font-bold">Médicament</th>
                                  <th className="text-left py-2 px-2 font-bold">Dosage</th>
                                  <th className="text-left py-2 px-2 font-bold">Fréquence</th>
                                  <th className="text-left py-2 px-2 font-bold">Statut</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pp.map((p, i) => (
                                  <tr key={i} className="border-b border-blue-50 hover:bg-blue-50/40">
                                    <td className="py-2 px-2">{new Date(p.date_prescription).toLocaleDateString('fr-FR')}</td>
                                    <td className="py-2 px-2 font-bold text-blue-700">{p.medicament}</td>
                                    <td className="py-2 px-2">{p.dosage}</td>
                                    <td className="py-2 px-2">{p.frequence}</td>
                                    <td className="py-2 px-2">
                                      <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                                        ✓ Validée
                                      </span>
                                    </td>
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
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Prescription Kit */}
      <ModalPrescriptionKit
        open={!!modalPatient}
        patient={modalPatient}
        rendezVousId={modalRdvId}
        onClose={handleModalClose}
      />
    </div>
  );
}