'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface InfirmierProfil {
  id: number;
  nom_complet: string;
  matricule: string | null;
  telephone: string | null;
  service_nom: string | null;
  service_id: string | null;
}

const STORAGE_KEY = 'chu_infirmier_actif';

// ── Helpers globaux ─────────────────────────
export function getInfirmierActif(): InfirmierProfil | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setInfirmierActif(infirmier: InfirmierProfil | null) {
  if (typeof window === 'undefined') return;
  if (infirmier) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(infirmier));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// ── Modal de sélection ─────────────────────
export default function InfirmierProfilModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (inf: InfirmierProfil) => void;
}) {
  const [infirmiers, setInfirmiers] = useState<InfirmierProfil[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [showCreer, setShowCreer]   = useState(false);
  const [newNom, setNewNom]         = useState('');
  const [newMatricule, setNewMatricule] = useState('');
  const [newTel, setNewTel]         = useState('');
  const [creating, setCreating]     = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`${API_URL}/infirmiers`)
      .then(r => r.json())
      .then(data => setInfirmiers(Array.isArray(data) ? data : []))
      .catch(() => setInfirmiers([]))
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = infirmiers.filter(i =>
    i.nom_complet.toLowerCase().includes(search.toLowerCase()) ||
    (i.matricule || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (inf: InfirmierProfil) => {
    setInfirmierActif(inf);
    onSelect(inf);
    onClose();
  };

  const handleCreer = async () => {
    if (!newNom.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/infirmiers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom_complet: newNom.trim(),
          matricule: newMatricule.trim() || null,
          telephone: newTel.trim() || null,
          service_nom: 'Dialyse',
        }),
      });
      if (res.ok) {
        const nouveau = await res.json();
        setInfirmierActif(nouveau);
        onSelect(nouveau);
        onClose();
      }
    } catch (e) { console.error(e); }
    setCreating(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <span className="material-symbols-outlined text-white text-3xl">badge</span>
              </div>
              <div className="flex-1 text-white">
                <h2 className="text-xl font-black">Sélection Infirmier(e)</h2>
                <p className="text-xs text-emerald-100 mt-0.5 font-semibold">
                  Choisissez votre profil pour commencer la session
                </p>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!showCreer ? (
              <>
                {/* Barre recherche */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou matricule..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm font-semibold border-2 border-emerald-100 rounded-xl bg-emerald-50/30 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all"
                  />
                </div>

                {/* Liste */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <span className="material-symbols-outlined text-5xl mb-3 block">person_search</span>
                    <p className="font-semibold">Aucun infirmier trouvé</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filtered.map((inf) => (
                      <motion.button
                        key={inf.id}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(inf)}
                        className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl hover:border-emerald-500 hover:shadow-lg shadow-emerald-100 transition-all cursor-pointer text-left group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200 group-hover:scale-110 transition-transform">
                            <span className="text-white font-black text-base">
                              {inf.nom_complet.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-emerald-800 truncate">{inf.nom_complet}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              {inf.matricule && (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                                  {inf.matricule}
                                </span>
                              )}
                              {inf.service_nom && (
                                <span className="text-[10px] text-slate-500 font-semibold">
                                  · {inf.service_nom}
                                </span>
                              )}
                            </div>
                            {inf.telephone && (
                              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">phone</span>
                                {inf.telephone}
                              </p>
                            )}
                          </div>
                          <span className="material-symbols-outlined text-emerald-400 group-hover:text-emerald-600 transition-colors">arrow_forward</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Bouton créer nouveau */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreer(true)}
                  className="w-full py-3 mt-2 text-sm font-bold text-emerald-700 bg-white border-2 border-dashed border-emerald-300 rounded-xl hover:bg-emerald-50 hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">person_add</span>
                  Créer un nouveau profil infirmier
                </motion.button>
              </>
            ) : (
              <>
                {/* Formulaire création */}
                <button
                  onClick={() => setShowCreer(false)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer mb-2"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Retour à la liste
                </button>

                <h3 className="text-sm font-black text-emerald-700">Créer un nouveau profil</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex : Harisoa Randriamampianina"
                      value={newNom}
                      onChange={e => setNewNom(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm font-semibold border-2 border-emerald-100 rounded-xl bg-emerald-50/30 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Matricule
                      </label>
                      <input
                        type="text"
                        placeholder="INF-XXX"
                        value={newMatricule}
                        onChange={e => setNewMatricule(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm font-semibold border-2 border-emerald-100 rounded-xl bg-emerald-50/30 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Téléphone
                      </label>
                      <input
                        type="text"
                        placeholder="034XXXXXXX"
                        value={newTel}
                        onChange={e => setNewTel(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm font-semibold border-2 border-emerald-100 rounded-xl bg-emerald-50/30 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreer}
                  disabled={!newNom.trim() || creating}
                  className="w-full py-3 text-sm font-black text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {creating
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <span className="material-symbols-outlined text-base">check_circle</span>
                  }
                  {creating ? 'Création...' : 'Créer et utiliser ce profil'}
                </motion.button>
              </>
            )}
          </div>

          {/* Footer info */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
            <p className="text-[10px] text-slate-500 text-center">
              💡 Votre profil sera mémorisé pour toutes vos saisies (constantes, surveillance, soins)
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}