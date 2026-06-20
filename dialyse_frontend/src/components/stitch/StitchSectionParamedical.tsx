'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { InfirmierProfil, getInfirmierActif } from '@/src/components/profil/InfirmierProfilModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Patient { id: number; nom: string; prenom: string; }
interface Constantes { ta_avant?: string; fc_avant?: string; o2_avant?: string; temp_avant?: string; }
interface RdvInfo { date_heure: string; statut_seance: string; }

function SectionParamedicalInner() {
  const searchParams = useSearchParams();
  const patientId    = searchParams.get('patientId');
  const rdvId        = searchParams.get('rendezVousId');
  const seanceNum    = searchParams.get('seanceNum') || '1';

  const [patient, setPatient]       = useState<Patient | null>(null);
  const [constantes, setConstantes] = useState<Constantes | null>(null);
  const [rdv, setRdv]               = useState<RdvInfo | null>(null);
  const [infirmier, setInfirmier]             = useState<InfirmierProfil | null>(null);
  const [showDropdown, setShowDropdown]       = useState(false);

  const loadAll = useCallback(async () => {
    try {
      if (patientId) {
        const r = await fetch(`${API_URL}/patients/${patientId}`);
        if (r.ok) setPatient(await r.json());
      }
      if (rdvId) {
        const [cRes, rRes] = await Promise.all([
          fetch(`${API_URL}/constantes/seance/${rdvId}`),
          fetch(`${API_URL}/rendezvous/${rdvId}`),
        ]);
        if (cRes.ok) setConstantes(await cRes.json());
        if (rRes.ok) setRdv(await rRes.json());
      }
    } catch (e) { console.error(e); }
  }, [patientId, rdvId]);

  const urlSuffix = `?patientId=${patientId || ''}&rendezVousId=${rdvId || ''}&seanceNum=${seanceNum}`;

  const cartesNav = [
    {
      icon: 'monitor_heart',
      titre: 'Constantes',
      desc: 'Relevé des constantes vitales',
      btn: 'Saisir',
      href: `/dialyses/constantes${urlSuffix}`,
    },
    {
      icon: 'visibility',
      titre: 'Surveillance',
      desc: 'Fiche de surveillance dialyse',
      btn: 'Ouvrir',
      href: `/dialyses/surveillance${urlSuffix}`,
    },
    {
      icon: 'medical_services',
      titre: 'Soins',
      desc: 'Soins infirmiers et pansements',
      btn: 'Accéder',
      href: `/dialyses/soins${urlSuffix}`,
    },
    {
      icon: 'vaccines',
      titre: 'Vérification Kit',
      desc: 'Contrôle matériel et cathéter',
      btn: 'Vérifier',
      href: `/dialyses/verification-kit${urlSuffix}`,
    },
  ];

  const formatHeureRdv = () => {
    if (!rdv?.date_heure) return '';
    const d = new Date(rdv.date_heure);
    const date = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const h = d.getHours();
    return `${date} - ${h < 12 ? 'Matin' : 'Après-midi'}`;
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-5 max-w-7xl mx-auto">

      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-5 flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <h1 className="text-xl font-black text-slate-800">Section Paramédical</h1>
            <p className="text-xs text-slate-400">Espace infirmier(e)</p>
          </div>

          {rdv && (
            <div className="border-l border-slate-200 pl-6">
              <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">check_circle</span>
                Séance {rdv.statut_seance === 'en_cours' ? 'en cours' : rdv.statut_seance}
              </p>
              <p className="text-xs font-bold text-slate-700 mt-1">
                Patient : {patient ? `${patient.prenom} ${patient.nom}` : '—'}
              </p>
              <p className="text-[10px] text-slate-500">Séance : {formatHeureRdv()}</p>
            </div>
          )}
        </div>

        {/* Constantes vitales en direct */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-50 rounded-xl px-3 py-2 text-center border border-slate-200 min-w-[60px]">
            <p className="text-[9px] font-bold text-slate-400 uppercase">TA</p>
            <p className="text-sm font-black text-slate-700">{constantes?.ta_avant || '—'}</p>
            <p className="text-[8px] text-slate-400">mmHg</p>
          </div>
          <div className="bg-rose-50 rounded-xl px-3 py-2 text-center border border-rose-200 min-w-[60px]">
            <p className="text-[9px] font-bold text-rose-500 uppercase">Pouls</p>
            <p className="text-sm font-black text-rose-700">{constantes?.fc_avant || '—'}</p>
            <p className="text-[8px] text-rose-400">bpm</p>
          </div>
          <div className="bg-blue-50 rounded-xl px-3 py-2 text-center border border-blue-200 min-w-[60px]">
            <p className="text-[9px] font-bold text-blue-500 uppercase">SpO₂</p>
            <p className="text-sm font-black text-blue-700">{constantes?.o2_avant || '—'}</p>
            <p className="text-[8px] text-blue-400">%</p>
          </div>
          <div className="bg-amber-50 rounded-xl px-3 py-2 text-center border border-amber-200 min-w-[60px]">
            <p className="text-[9px] font-bold text-amber-500 uppercase">Temp.</p>
            <p className="text-sm font-black text-amber-700">{constantes?.temp_avant || '—'}</p>
            <p className="text-[8px] text-amber-400">°C</p>
          </div>

          {/* Profil Infirmier */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowDropdown(o => !o)}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl hover:border-emerald-400 transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-[10px]">
                {infirmier ? infirmier.nom_complet.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?'}
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-emerald-700 leading-tight">
                  {infirmier ? infirmier.nom_complet : 'Non connecté'}
                </p>
                {infirmier?.matricule && (
                  <p className="text-[9px] text-emerald-500 leading-tight">{infirmier.matricule}</p>
                )}
              </div>
              <span className="material-symbols-outlined text-emerald-500 text-base">expand_more</span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                <button
                  onClick={() => { setShowProfilModal(true); setShowDropdown(false); }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base text-emerald-600">switch_account</span>
                  Changer d'infirmier
                </button>
                <button
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer border-t border-slate-100"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  Déconnexion
                </button>
              </div>
            )}
          </div>

          {/* Bouton Imprimer */}
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ml-2"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            Imprimer
          </button>
        </div>
      </motion.div>

      {/* 3 cartes de navigation */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {cartesNav.map((c) => (
          <div
            key={c.titre}
            className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-emerald-600 text-2xl">{c.icon}</span>
              <p className="text-base font-bold text-slate-800">{c.titre}</p>
            </div>
            <p className="text-xs text-slate-500 mb-4">{c.desc}</p>
            <button
              onClick={() => { window.location.href = c.href; }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
            >
              {c.btn}
            </button>
          </div>
        ))}
      </motion.div>

      {/* Bouton retour */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => { window.location.href = '/dashboard'; }}
          className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Retour tableau de bord
        </button>
      </div>
    </div>
  );
}

export default function StitchSectionParamedical() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SectionParamedicalInner />
    </Suspense>
  );
}