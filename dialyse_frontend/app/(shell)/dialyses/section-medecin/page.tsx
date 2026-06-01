'use client';

import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function SectionMedecinInner() {
  const router         = useRouter();
  const searchParams   = useSearchParams();
  const patientIdParam = searchParams.get('patientId');
  const seanceNum      = searchParams.get('seanceNum') || '1';
  const patientNom     = searchParams.get('nom') || '';

  const cards = [
    {
      icon:        'vaccines',
      title:       'Vérification Kit',
      desc:        'Ordonnance kit hémodialyse — 1ère séance et séances suivantes',
      btn:         'Ouvrir',
      color:       'blue',
      href:        `/dialyses/verification-kit?patientId=${patientIdParam}&seanceNum=${seanceNum}`,
      bg:          'bg-blue-50',
      border:      'border-blue-100',
      iconColor:   'text-blue-600',
      titleColor:  'text-blue-800',
      descColor:   'text-blue-500',
      btnClass:    'bg-blue-600 hover:bg-blue-700',
    },
    {
      icon:        'settings_input_component',
      title:       'Conductivité & Paramètres',
      desc:        'Paramètres dialysat, UF, débits et prescription de la séance',
      btn:         'Accéder',
      color:       'indigo',
      href:        `/dialyses/conductivite-params?patientId=${patientIdParam}&seanceNum=${seanceNum}`,
      bg:          'bg-indigo-50',
      border:      'border-indigo-100',
      iconColor:   'text-indigo-600',
      titleColor:  'text-indigo-800',
      descColor:   'text-indigo-500',
      btnClass:    'bg-indigo-600 hover:bg-indigo-700',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">

        {/* ── En-tête ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Icône section médecin */}
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <span className="material-symbols-outlined text-white text-3xl">stethoscope</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 font-manrope">Section Médecin</h1>
          <p className="text-sm text-slate-400 mt-1">CHU Andrainjato · Service Hémodialyse</p>

          {/* Bandeau patient */}
          {patientIdParam && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl"
            >
              <span className="material-symbols-outlined text-blue-500 text-base">person</span>
              <span className="text-xs font-semibold text-blue-700">
                {patientNom ? patientNom : `Patient ID #${patientIdParam}`}
                {` · Séance N°${seanceNum}`}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* ── 2 cartes ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
              className={`${card.bg} border ${card.border} rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg transition-all`}
            >
              {/* Icône */}
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <span className={`material-symbols-outlined text-2xl ${card.iconColor}`}>{card.icon}</span>
              </div>

              {/* Texte */}
              <div className="flex-1">
                <p className={`text-base font-black ${card.titleColor} mb-1`}>{card.title}</p>
                <p className={`text-xs ${card.descColor} leading-relaxed`}>{card.desc}</p>
              </div>

              {/* Bouton */}
              <button
                onClick={() => router.push(card.href)}
                className={`w-full py-3 ${card.btnClass} text-white text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm`}
              >
                <span className="material-symbols-outlined text-base">open_in_new</span>
                {card.btn}
              </button>
            </motion.div>
          ))}
        </div>

        {/* ── Bouton retour tableau de bord ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="flex justify-center pt-2"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-all cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Retour au tableau de bord
          </button>
        </motion.div>

      </div>
    </div>
  );
}

export default function SectionMedecinPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SectionMedecinInner />
    </Suspense>
  );
}
