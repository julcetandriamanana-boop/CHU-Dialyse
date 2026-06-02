'use client';

import { motion } from 'framer-motion';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SectionMedecinInner() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId') || '';
  const seanceNum = searchParams.get('seanceNum') || '1';

  return (
    <div className="min-h-screen bg-slate-50/70 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <span className="material-symbols-outlined text-white text-3xl">stethoscope</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">Section Médecin</h1>
          <p className="text-sm text-slate-400 mt-1">Vérification kit et conductivité & paramètres</p>

          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
            <span className="material-symbols-outlined text-blue-500 text-base">person</span>
            <span className="text-xs font-semibold text-blue-700">
              Patient #{patientId || '—'} · Séance N°{seanceNum}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm mb-4">
              <span className="material-symbols-outlined text-blue-600 text-2xl">vaccines</span>
            </div>
            <h2 className="text-lg font-black text-blue-800">Vérification Kit</h2>
            <p className="text-sm text-blue-600 mt-2">
              Ordonnance kit hémodialyse — 1ère séance et séances suivantes
            </p>
            <button
              onClick={() => {
                window.location.href = `/dialyses/verification-kit?patientId=${patientId}&seanceNum=${seanceNum}`;
              }}
              className="mt-5 w-full py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              Ouvrir
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 shadow-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm mb-4">
              <span className="material-symbols-outlined text-indigo-600 text-2xl">settings_input_component</span>
            </div>
            <h2 className="text-lg font-black text-indigo-800">Conductivité & Paramètres</h2>
            <p className="text-sm text-indigo-600 mt-2">
              Paramètres dialysat, UF, débits et prescription de séance
            </p>
            <button
              onClick={() => {
                window.location.href = `/dialyses/conductivite-params?patientId=${patientId}&seanceNum=${seanceNum}`;
              }}
              className="mt-5 w-full py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              Accéder
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <button
            onClick={() => { window.location.href = '/dashboard'; }}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Retour dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default function SectionMedecinPage() {
  return (
    <Suspense fallback={<div className="p-6">Chargement...</div>}>
      <SectionMedecinInner />
    </Suspense>
  );
}
