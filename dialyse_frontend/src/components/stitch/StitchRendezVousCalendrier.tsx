'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentPatient, PatientData, setCurrentPatient } from '@/src/stores/patient.store';
import PatientSearchInput from '@/src/components/patient/PatientSearchInput';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function StitchRendezVousCalendrier() {
  const router = useRouter();
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [viewMode, setViewMode] = useState<'aujourdhui' | 'semaine' | 'mois'>('aujourdhui');
  const [currentMonth, setCurrentMonth] = useState(5);
  const [currentYear, setCurrentYear] = useState(2026);
  const [rendezVous, setRendezVous] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  
  const joursSemaine = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
  const aujourdHui = new Date().getDate();

  useEffect(() => {
    const current = getCurrentPatient();
    if (current.id) setSelectedPatient(current);
    loadRendezVous();
  }, []);

  const loadRendezVous = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/rendezvous`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const formatted = data.map((rdv: any) => ({
          id: rdv.id,
          heure: new Date(rdv.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          patient: `${rdv.patient?.prenom || ''} ${rdv.patient?.nom || ''}`,
          type: rdv.motif || 'Dialyse',
          poste: rdv.soso_kevitra_malalaka?.split('|')[1]?.trim() || '-',
          duree: '4h',
          status: rdv.statut === 'confirmé' ? 'confirmed' : 'pending',
          patientId: rdv.patient?.id,
          day: new Date(rdv.date_heure).getDate(),
          month: new Date(rdv.date_heure).getMonth() + 1,
          year: new Date(rdv.date_heure).getFullYear(),
          date: new Date(rdv.date_heure),
        }));
        setRendezVous(formatted);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const selectPatient = (patient: PatientData) => {
    setSelectedPatient(patient);
    setCurrentPatient(patient);
  };

  const goToNouveauRdv = (day?: number) => {
    if (selectedPatient) sessionStorage.setItem('selectedRdvDay', String(day || aujourdHui));
    router.push('/rendez-vous/nouveau');
  };

  const getDaysInMonth = (month: number, year: number) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => {
    const day = new Date(year, month - 1, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const totalDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  let filteredRDV = rendezVous.filter(r => r.month === currentMonth && r.year === currentYear);
  
  if (viewMode === 'aujourdhui') {
    filteredRDV = filteredRDV.filter(r => r.day === aujourdHui && r.month === 5);
  } else if (viewMode === 'semaine') {
    filteredRDV = filteredRDV.filter(r => r.day >= 12 && r.day <= 18);
  }
  
  if (dateStart) filteredRDV = filteredRDV.filter(r => r.date >= new Date(dateStart));
  if (dateEnd) filteredRDV = filteredRDV.filter(r => r.date <= new Date(dateEnd + 'T23:59:59'));

  // Patients avec RDV aujourd'hui (pour le dashboard)
  const rdvAujourdhui = rendezVous.filter(r => r.day === aujourdHui && r.month === 5 && r.year === 2026);

  const moisNoms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const changeMonth = (delta: number) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="pt-6 pb-20 md:pb-8 px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto">
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 font-manrope">Gestion des Rendez-vous</h1>
            <p className="text-slate-500 text-sm mt-1">{rendezVous.length} RDV depuis MySQL · {rdvAujourdhui.length} aujourd'hui</p>
          </div>
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
            {[
              { key: 'aujourdhui', label: "Aujourd'hui" },
              { key: 'semaine', label: 'Semaine' },
              { key: 'mois', label: 'Mois' },
            ].map((tab) => (
              <motion.button key={tab.key} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setViewMode(tab.key as any)} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${viewMode === tab.key ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                {tab.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Filtre intervalle dates */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><span className="material-symbols-outlined text-sm">date_range</span>Intervalle :</span>
            <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer" />
            <span className="text-slate-400 text-xs">→</span>
            <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer" />
            {(dateStart || dateEnd) && (
              <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => { setDateStart(''); setDateEnd(''); }} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 cursor-pointer">
                <span className="material-symbols-outlined text-sm">close</span>
              </motion.button>
            )}
            <span className="text-[10px] text-slate-400">{filteredRDV.length} résultat(s)</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
            
            {/* Calendrier mensuel */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-xl cursor-pointer">
                  <span className="material-symbols-outlined text-slate-600">chevron_left</span>
                </motion.button>
                <h2 className="text-lg font-black text-slate-800">{moisNoms[currentMonth - 1]} {currentYear}</h2>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-xl cursor-pointer">
                  <span className="material-symbols-outlined text-slate-600">chevron_right</span>
                </motion.button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-3">
                {joursSemaine.map(jour => (
                  <div key={jour} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-2">{jour}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {emptyDays.map(i => (<div key={`empty-${i}`} className="h-20 rounded-xl" />))}
                {totalDays.map(day => {
                  const rdvsDuJour = rendezVous.filter(r => r.day === day && r.month === currentMonth);
                  const isToday = day === aujourdHui && currentMonth === 5;
                  
                  return (
                    <motion.div
                      key={day}
                      whileHover={{ y: -2, boxShadow: '0 8px 25px -8px rgba(0,0,0,0.15)' }}
                      className={`relative h-20 rounded-xl p-1.5 cursor-pointer transition-all border group ${
                        isToday
                          ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20'
                          : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isToday ? 'text-white' : 'text-slate-600'}`}>{day}</span>
                        {/* Bouton + */}
                        <motion.button
                          whileHover={{ scale: 1.3 }}
                          whileTap={{ scale: 0.8 }}
                          onClick={(e) => { e.stopPropagation(); goToNouveauRdv(day); }}
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-md ${
                            isToday ? 'bg-white/30 text-white hover:bg-white/50' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                          }`}
                        >+</motion.button>
                      </div>
                      <div className="flex gap-0.5 mt-1 flex-wrap">
                        {rdvsDuJour.slice(0, 4).map((r, i) => (
                          <span key={i} className={`w-1.5 h-1.5 rounded-full ${r.status === 'confirmed' ? (isToday ? 'bg-white' : 'bg-emerald-500') : (isToday ? 'bg-white/60' : 'bg-amber-400')}`} />
                        ))}
                        {rdvsDuJour.length > 4 && (
                          <span className={`text-[7px] font-bold ${isToday ? 'text-white/80' : 'text-slate-400'}`}>+{rdvsDuJour.length - 4}</span>
                        )}
                      </div>
                      {rdvsDuJour.length > 0 && (
                        <span className={`absolute bottom-1 right-1 text-[8px] font-bold ${isToday ? 'text-white/80' : 'text-emerald-600'}`}>
                          {rdvsDuJour.length} RDV
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Liste des RDV filtrés */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500 text-lg">schedule</span>
                {viewMode === 'aujourdhui' ? `RDV d'aujourd'hui (${aujourdHui} Mai)` : viewMode === 'semaine' ? 'RDV de la semaine' : 'Tous les RDV'}
                <span className="text-[10px] text-slate-400 font-normal ml-2">({filteredRDV.length})</span>
              </h3>
              {loading ? (
                <div className="text-center py-8"><div className="animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto"></div></div>
              ) : filteredRDV.length === 0 ? (
                <p className="text-center text-slate-400 py-8">Aucun RDV trouvé</p>
              ) : (
                <div className="space-y-3">
                  {filteredRDV.map((rdv, index) => (
                    <motion.div
                      key={rdv.id || index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4, backgroundColor: rdv.patientId === selectedPatient?.id ? '#f0fdf4' : '#f8fafc' }}
                      className={`flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer group ${
                        rdv.patientId === selectedPatient?.id ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-100 hover:border-emerald-200'
                      }`}
                    >
                      <div className="w-14 text-center">
                        <span className="text-sm font-bold text-emerald-600">{rdv.heure}</span>
                        <p className="text-[9px] text-slate-400">{rdv.day}/{rdv.month}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{rdv.patient}</p>
                        <p className="text-xs text-slate-400">{rdv.type} · Poste {rdv.poste}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${rdv.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {rdv.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                        </span>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); goToNouveauRdv(rdv.day); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-emerald-50 rounded-lg cursor-pointer" title="Modifier">
                          <span className="material-symbols-outlined text-emerald-500 text-lg">edit</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Rechercher un patient</h3>
              <PatientSearchInput onPatientSelected={selectPatient} placeholder="ID ou nom..." />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Résumé</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Total RDV</span><span className="text-sm font-bold text-slate-800">{rendezVous.length}</span></div>
                <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Aujourd'hui</span><span className="text-sm font-bold text-emerald-600">{rdvAujourdhui.length}</span></div>
                <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Confirmés</span><span className="text-sm font-bold text-emerald-600">{filteredRDV.filter(r => r.status === 'confirmed').length}</span></div>
                <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Patients</span><span className="text-sm font-bold text-blue-600">{new Set(filteredRDV.map(r => r.patient)).size}</span></div>
                {selectedPatient && (
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100"><span className="text-xs text-slate-500">Patient</span><span className="text-sm font-bold text-emerald-600">{selectedPatient.prenoms} {selectedPatient.nom}</span></div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
