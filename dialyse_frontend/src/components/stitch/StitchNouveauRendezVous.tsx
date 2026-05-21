'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentPatient, PatientData, setCurrentPatient, setPatientFromDB } from '@/src/stores/patient.store';
import PatientSearchInput from '@/src/components/patient/PatientSearchInput';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const JOURS = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const MACHINES = ['Machine #01', 'Machine #02', 'Machine #03'];

const ALL_SLOTS = [
  { time: '07:00 - 08:00', period: 'Matin' }, { time: '08:00 - 09:00', period: 'Matin' },
  { time: '09:00 - 10:00', period: 'Matin' }, { time: '10:00 - 11:00', period: 'Matin' },
  { time: '11:30 - 12:30', period: 'Midi' }, { time: '12:30 - 13:30', period: 'Midi' },
  { time: '13:30 - 14:30', period: 'Midi' },
  { time: '14:00 - 15:00', period: 'Après-midi' }, { time: '15:00 - 16:00', period: 'Après-midi' },
  { time: '16:00 - 17:00', period: 'Après-midi' },
  { time: '17:00 - 18:00', period: 'Soir' }, { time: '18:00 - 19:00', period: 'Soir' },
  { time: '19:00 - 20:00', period: 'Soir' }, { time: '20:00 - 21:00', period: 'Soir' },
];

export default function StitchNouveauRendezVous() {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [selectedDay, setSelectedDay] = useState(13);
  const [selectedSlot, setSelectedSlot] = useState('07:00 - 08:00');
  const [selectedMachine, setSelectedMachine] = useState('Machine #02');
  const [notification, setNotification] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [rdvExistants, setRdvExistants] = useState<any[]>([]);
  
  const aujourdHui = new Date();
  const [moisAffiche, setMoisAffiche] = useState(aujourdHui.getMonth());
  const [anneeAffiche, setAnneeAffiche] = useState(aujourdHui.getFullYear());

  useEffect(() => {
    const current = getCurrentPatient();
    if (current.id) setPatient(current);
    const savedDay = sessionStorage.getItem('selectedRdvDay');
    if (savedDay) { setSelectedDay(parseInt(savedDay)); sessionStorage.removeItem('selectedRdvDay'); }
    loadRdvs();
  }, []);

  const loadRdvs = async () => {
    try { const res = await fetch(`${API_URL}/rendezvous`); setRdvExistants(await res.json()); } catch {}
  };

  const handleMoisPrecedent = () => {
    if (moisAffiche === 0) { setMoisAffiche(11); setAnneeAffiche(anneeAffiche - 1); }
    else setMoisAffiche(moisAffiche - 1);
  };

  const handleMoisSuivant = () => {
    if (moisAffiche === 11) { setMoisAffiche(0); setAnneeAffiche(anneeAffiche + 1); }
    else setMoisAffiche(moisAffiche + 1);
  };

  const nbJours = new Date(anneeAffiche, moisAffiche + 1, 0).getDate();
  const premierJour = new Date(anneeAffiche, moisAffiche, 1).getDay();
  const joursCalendrier: (number | null)[] = [];
  for (let i = 0; i < premierJour; i++) joursCalendrier.push(null);
  for (let i = 1; i <= nbJours; i++) joursCalendrier.push(i);
  while (joursCalendrier.length < 42) joursCalendrier.push(null);

  const estAujourdHui = (jour: number) => 
    jour === aujourdHui.getDate() && moisAffiche === aujourdHui.getMonth() && anneeAffiche === aujourdHui.getFullYear();

  const slotsWithAvailability = useMemo(() => {
    return ALL_SLOTS.map(slot => {
      const occupes = rdvExistants.filter((rdv: any) => {
        const rdvDate = new Date(rdv.date_heure);
        return rdvDate.getDate() === selectedDay && rdvDate.getMonth() === moisAffiche && rdv.soso_kevitra_malalaka?.includes(slot.time);
      });
      return { ...slot, occupe: occupes.length > 0, nbOccupes: occupes.length };
    });
  }, [selectedDay, moisAffiche, rdvExistants]);

  const slotSelectionne = slotsWithAvailability.find(s => s.time === selectedSlot);
  const periodes = ['Matin', 'Midi', 'Après-midi', 'Soir'];

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePatientSelected = (p: PatientData) => { setPatient(p); setCurrentPatient(p); };

  const handleValidate = async () => {
    if (!patient?.id) { showNotification('Veuillez sélectionner un patient'); return; }
    if (slotSelectionne?.occupe) { showNotification('Ce créneau est déjà occupé'); return; }
    
    setSaving(true);
    try {
      const patientDbId = parseInt(patient.id.replace('DX-', '')) || 1;
      const moisStr = String(moisAffiche + 1).padStart(2, '0');
      const jourStr = String(selectedDay).padStart(2, '0');
      const dateHeure = `${anneeAffiche}-${moisStr}-${jourStr}T${selectedSlot.split(' - ')[0]}:00`;
      
      // 1. Créer le RDV dans MySQL
      await fetch(`${API_URL}/rendezvous/creer`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patientDbId, date_heure: dateHeure, motif: 'Séance de dialyse', statut: 'confirmé', creneau: selectedSlot, machine: selectedMachine }),
      });

      // 2. Sauvegarder le patient dans le store pour la page prescriptions
      setPatientFromDB({ id: patientDbId, nom: patient.nom, prenom: patient.prenoms });
      
      // 3. Sauvegarder les infos du RDV pour le contexte
      sessionStorage.setItem('rdvInfo', JSON.stringify({
        date: `${selectedDay} ${MOIS[moisAffiche]} ${anneeAffiche}`,
        creneau: selectedSlot,
        machine: selectedMachine,
      }));
      
      showNotification(`✅ RDV créé ! Redirection vers les prescriptions...`);
      
      // 4. Rediriger vers les prescriptions pour que le médecin fasse le kit
      setTimeout(() => router.push('/dialyses'), 1500);
      
    } catch (err) { showNotification('❌ Erreur'); }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="pt-6 pb-20 md:pb-8 px-4 md:px-6 lg:px-8 max-w-6xl mx-auto">
        <AnimatePresence>
          {notification && (
            <motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-4 left-1/2 z-50 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>{notification}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.nav initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-4">
          <span>Espace Clinique</span><span className="material-symbols-outlined text-sm">chevron_right</span><span className="text-blue-600 font-bold">Nouveau Rendez-vous</span>
        </motion.nav>

        <div className="flex flex-col lg:flex-row gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:w-80 space-y-6 shrink-0">
            
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">person_search</span>Patient
              </h3>
              <PatientSearchInput onPatientSelected={handlePatientSelected} placeholder="Nom ou dossier..." />
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <motion.button whileHover={{ scale: 1.1, rotate: -8 }} whileTap={{ scale: 0.9 }} onClick={handleMoisPrecedent} className="p-1.5 hover:bg-blue-50 rounded-lg cursor-pointer">
                  <span className="material-symbols-outlined text-slate-400 text-lg">chevron_left</span>
                </motion.button>
                <motion.div key={`${moisAffiche}-${anneeAffiche}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, type: "spring" }} className="text-center">
                  <h3 className="text-sm font-extrabold text-slate-800">{MOIS[moisAffiche]}</h3>
                  <p className="text-[10px] text-slate-400 font-medium">{anneeAffiche}</p>
                </motion.div>
                <motion.button whileHover={{ scale: 1.1, rotate: 8 }} whileTap={{ scale: 0.9 }} onClick={handleMoisSuivant} className="p-1.5 hover:bg-blue-50 rounded-lg cursor-pointer">
                  <span className="material-symbols-outlined text-slate-400 text-lg">chevron_right</span>
                </motion.button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {JOURS.map((j, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="text-[9px] font-bold text-slate-400">{j}</motion.div>
                ))}
              </div>

              <motion.div className="grid grid-cols-7 gap-1 text-center" variants={{ animate: { transition: { staggerChildren: 0.02 } } }} initial="initial" animate="animate">
                {joursCalendrier.map((jour, i) => {
                  if (!jour) return <div key={`empty-${i}`} className="h-8" />;
                  const isSelected = selectedDay === jour && moisAffiche === aujourdHui.getMonth();
                  const isToday = estAujourdHui(jour);
                  const isPast = jour < aujourdHui.getDate() && moisAffiche === aujourdHui.getMonth();
                  
                  return (
                    <motion.button key={`${jour}-${i}`} variants={{ initial: { opacity: 0, scale: 0.7, rotateX: -30 }, animate: { opacity: 1, scale: 1, rotateX: 0 } }}
                      whileHover={!isPast ? { scale: 1.2, y: -3, boxShadow: '0 8px 20px -8px rgba(59,130,246,0.3)' } : {}}
                      whileTap={!isPast ? { scale: 0.85 } : {}}
                      onClick={() => !isPast && setSelectedDay(jour)}
                      className={`relative h-8 flex items-center justify-center text-[11px] font-bold rounded-xl transition-all ${
                        isPast ? 'text-slate-300 cursor-default' :
                        isSelected ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-110 z-10 cursor-pointer' : 
                        isToday ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-md shadow-amber-500/20 cursor-pointer' :
                        'text-slate-600 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 cursor-pointer'
                      }`}>
                      <span className="relative z-10">{jour}</span>
                    </motion.button>
                  );
                })}
              </motion.div>

              <motion.div key={`resume-${selectedDay}`} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-2">
                <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.5, delay: 0.3 }} className="material-symbols-outlined text-blue-500 text-sm">event</motion.span>
                <span className="text-xs font-bold text-slate-600"><span className="text-blue-600">{selectedDay} {MOIS[moisAffiche]} {anneeAffiche}</span></span>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 space-y-6">
            
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Créneaux horaires - {selectedDay} {MOIS[moisAffiche]}</h3>
              {periodes.map(periode => {
                const slotsPeriode = slotsWithAvailability.filter(s => s.period === periode);
                const nbLibres = slotsPeriode.filter(s => !s.occupe).length;
                const nbTotal = slotsPeriode.length;
                return (
                  <div key={periode} className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">{periode}</span>
                      <motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${nbLibres === 0 ? 'bg-red-50 text-red-500' : nbLibres <= 2 ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>{nbLibres === 0 ? 'Complet' : `${nbLibres}/${nbTotal}`}</motion.span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {slotsPeriode.map((slot) => (
                        <motion.button key={slot.time} whileHover={!slot.occupe ? { scale: 1.05, y: -2 } : {}} whileTap={!slot.occupe ? { scale: 0.95 } : {}}
                          onClick={() => !slot.occupe && setSelectedSlot(slot.time)} disabled={slot.occupe}
                          className={`p-2 rounded-xl text-[10px] font-bold transition-all ${slot.occupe ? 'bg-red-50/50 text-red-300 cursor-not-allowed line-through border border-red-100' :
                            selectedSlot === slot.time ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 cursor-pointer' :
                            'bg-slate-50 text-slate-500 hover:bg-white hover:shadow-md hover:border-blue-300 border border-transparent cursor-pointer'}`}>
                          <span className="text-[9px] opacity-70">{slot.time.split(' - ')[0]}</span><br/><span>{slot.time.split(' - ')[1]}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-blue-500">precision_manufacturing</span>Machine</h3>
              <div className="grid grid-cols-3 gap-4">
                {MACHINES.map((m, i) => (
                  <motion.button key={i} whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedMachine(m)}
                    className={`p-5 rounded-2xl flex flex-col items-center gap-3 transition-all cursor-pointer ${selectedMachine === m ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/30' : 'bg-slate-50 border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg'}`}>
                    <motion.span animate={selectedMachine === m ? { rotate: [0, 10, -10, 0] } : {}} transition={{ duration: 2, repeat: Infinity }}
                      className={`material-symbols-outlined text-3xl ${selectedMachine === m ? 'text-white' : 'text-slate-400'}`}>precision_manufacturing</motion.span>
                    <span className={`text-xs font-extrabold ${selectedMachine === m ? 'text-white' : 'text-slate-500'}`}>{m.replace('Machine #', 'Poste ')}</span>
                    <span className={`text-[9px] font-medium ${selectedMachine === m ? 'text-blue-100' : 'text-slate-400'}`}>{i === 0 ? 'Disponible' : i === 1 ? 'Préféré' : 'Disponible'}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.div animate={{ scale: [1, 1.01, 1] }} transition={{ duration: 3, repeat: Infinity }}
              className={`rounded-2xl p-5 ${slotSelectionne?.occupe ? 'bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200'}`}>
              <div className="flex items-center gap-3">
                <motion.span animate={slotSelectionne?.occupe ? { rotate: [0, 10, -10, 0] } : { scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}
                  className={`material-symbols-outlined text-xl ${slotSelectionne?.occupe ? 'text-red-500' : 'text-blue-500'}`}>{slotSelectionne?.occupe ? 'error' : 'check_circle'}</motion.span>
                <div className={`text-xs font-bold ${slotSelectionne?.occupe ? 'text-red-700' : 'text-blue-700'}`}>
                  {slotSelectionne?.occupe ? '⚠ Ce créneau est déjà occupé' :
                    <>Séance <span className="text-blue-500">{selectedSlot}</span> · <span className="text-blue-500">{selectedMachine.replace('Machine #', 'Poste ')}</span> · <span className="text-blue-500">{selectedDay} {MOIS[moisAffiche]}</span></>}
                </div>
              </div>
            </motion.div>

            <div className="flex gap-4">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => router.push('/rendez-vous')} className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 cursor-pointer">Annuler</motion.button>
              <motion.button whileHover={!slotSelectionne?.occupe ? { scale: 1.02, boxShadow: '0 20px 40px -12px rgba(59,130,246,0.4)' } : {}} whileTap={{ scale: 0.98 }} onClick={handleValidate} disabled={saving || slotSelectionne?.occupe}
                className={`flex-1 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${saving || slotSelectionne?.occupe ? 'bg-slate-300 text-white cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-blue-500/30'}`}>
                <motion.span animate={!slotSelectionne?.occupe ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity }} className="material-symbols-outlined text-lg">{saving ? 'hourglass_top' : 'check_circle'}</motion.span>
                {saving ? 'Sauvegarde...' : 'Valider le Rendez-vous'}
              </motion.button>
            </div>

            {/* Message explicatif */}
            <p className="text-[10px] text-slate-400 text-center">
              Après validation du RDV, vous serez redirigé vers les prescriptions pour créer le kit du patient.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
