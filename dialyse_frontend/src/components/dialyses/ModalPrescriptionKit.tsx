'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import {
  fetchKitsHemodialyse,
  envoyerOrdonnanceKit,
  calculerAge,
  PharmacieKit,
  PharmacieKitItem,
  OrdonnanceArticle,
} from '@/src/services/pharmacie.service';
import { InfirmierProfil, getInfirmierActif } from '@/src/components/profil/InfirmierProfilModal';

interface Patient {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance?: string;
  telephone?: string;
}

interface Props {
  open: boolean;
  patient: Patient | null;
  rendezVousId?: number;
  onClose: () => void;
}

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';
type KitType = 'premiere' | 'suivante' | 'premier_soin';

function playBipSuccess() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

export default function ModalPrescriptionKit({ open, patient, rendezVousId, onClose }: Props) {
  const [kits, setKits] = useState<{
    premiere: PharmacieKit | null;
    suivante: PharmacieKit | null;
    premierSoin: PharmacieKit | null;
  }>({ premiere: null, suivante: null, premierSoin: null });

  const [itemsPremiere, setItemsPremiere]       = useState<Array<{ item: PharmacieKitItem; quantite: number }>>([]);
  const [itemsSuivante, setItemsSuivante]       = useState<Array<{ item: PharmacieKitItem; quantite: number }>>([]);
  const [itemsPremierSoin, setItemsPremierSoin] = useState<Array<{ item: PharmacieKitItem; quantite: number }>>([]);

  const [openPremiere, setOpenPremiere]         = useState(true);
  const [openSuivante, setOpenSuivante]         = useState(false);
  const [openPremierSoin, setOpenPremierSoin]   = useState(false);

  const [loading, setLoading]                   = useState(true);

  const [savePremiere, setSavePremiere]         = useState<SaveStatus>('idle');
  const [saveSuivante, setSaveSuivante]         = useState<SaveStatus>('idle');
  const [savePremierSoin, setSavePremierSoin]   = useState<SaveStatus>('idle');
  const [saveTous, setSaveTous]                 = useState<SaveStatus>('idle');

  const [showConfirm, setShowConfirm]           = useState<KitType | 'tous' | null>(null);
  const [includePremierSoin, setIncludePremierSoin] = useState(true);

  const [infirmier, setInfirmier]               = useState<InfirmierProfil | null>(null);
  const [toast, setToast]                       = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadKits = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchKitsHemodialyse();
      setKits(data);
      if (data.premiere)    setItemsPremiere(data.premiere.items.map(i => ({ item: i, quantite: i.quantiteDefaut })));
      if (data.suivante)    setItemsSuivante(data.suivante.items.map(i => ({ item: i, quantite: i.quantiteDefaut })));
      if (data.premierSoin) setItemsPremierSoin(data.premierSoin.items.map(i => ({ item: i, quantite: i.quantiteDefaut })));
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) {
      loadKits();
      setInfirmier(getInfirmierActif());
    }
  }, [open, loadKits]);

  const updateQuantite = (type: KitType, idx: number, qty: number) => {
    if (type === 'premiere')          setItemsPremiere(prev => prev.map((it, i) => i === idx ? { ...it, quantite: qty } : it));
    else if (type === 'suivante')     setItemsSuivante(prev => prev.map((it, i) => i === idx ? { ...it, quantite: qty } : it));
    else if (type === 'premier_soin') setItemsPremierSoin(prev => prev.map((it, i) => i === idx ? { ...it, quantite: qty } : it));
  };

  const envoyerKitUnique = async (type: KitType) => {
    const config = {
      premiere:     { kit: kits.premiere,    items: itemsPremiere,    setStatus: setSavePremiere },
      suivante:     { kit: kits.suivante,    items: itemsSuivante,    setStatus: setSaveSuivante },
      premier_soin: { kit: kits.premierSoin, items: itemsPremierSoin, setStatus: setSavePremierSoin },
    }[type];

    if (!patient || !config.kit) { showToast('Donnees manquantes', 'error'); return false; }

    config.setStatus('saving');

    const articles: OrdonnanceArticle[] = config.items.map(it => ({
      designation: it.item.designation,
      quantite:    it.quantite,
      unite:       it.item.unite,
    }));

    const result = await envoyerOrdonnanceKit({
      patientId:        String(patient.id),
      patientNom:       patient.nom,
      patientPrenom:    patient.prenom,
      patientAge:       calculerAge(patient.dateNaissance) || undefined,
      rendezVousId,
      kitId:            config.kit.id,
      kitNom:           config.kit.nom,
      typeKit:          type,
      serviceDemandeur: 'Dialyse',
      emetteurId:       infirmier?.id || 0,
      emetteurNom:      infirmier?.nom_complet || 'Non identifie',
      emetteurRole:     'infirmier',
      articles,
      datePrescription: new Date().toISOString(),
      notes:            type === 'premier_soin' ? 'Kit 1er Soin - Achat patient' : undefined,
    });

    if (result.success) {
      config.setStatus('success');
      setTimeout(() => config.setStatus('idle'), 3000);
      return true;
    } else {
      config.setStatus('error');
      setTimeout(() => config.setStatus('idle'), 3000);
      return false;
    }
  };

  const handleEnvoyerUnique = async (type: KitType) => {
    setShowConfirm(null);
    const ok = await envoyerKitUnique(type);
    if (ok) {
      playBipSuccess();
      showToast('Ordonnance envoyee a la Pharmacie', 'success');
    } else {
      showToast('Erreur lors de l envoi', 'error');
    }
  };

  const handleEnvoyerTous = async () => {
    setShowConfirm(null);
    setSaveTous('saving');

    const results: boolean[] = [];

    // Toujours envoyer les 2 kits don
    results.push(await envoyerKitUnique('premiere'));
    results.push(await envoyerKitUnique('suivante'));

    // Optionnel: kit 1er soin
    if (includePremierSoin && kits.premierSoin) {
      results.push(await envoyerKitUnique('premier_soin'));
    }

    const allOk = results.every(r => r);
    if (allOk) {
      setSaveTous('success');
      playBipSuccess();
      const count = includePremierSoin && kits.premierSoin ? 3 : 2;
      showToast(`${count} kit(s) envoye(s) a la Pharmacie avec succes`, 'success');
    } else {
      setSaveTous('error');
      showToast('Certains kits n ont pas pu etre envoyes', 'error');
    }
    setTimeout(() => setSaveTous('idle'), 3000);
  };


  // Helper render accordeon kit
  const renderKitAccordion = (
    type: KitType,
    kit: PharmacieKit | null,
    items: Array<{ item: PharmacieKitItem; quantite: number }>,
    isOpen: boolean,
    setIsOpen: (v: boolean) => void,
    saveStatus: SaveStatus,
    colorClasses: {
      border: string;
      shadow: string;
      gradient: string;
      btnText: string;
      itemBg: string;
      itemBorder: string;
      itemHover: string;
      iconColor: string;
      btnBg: string;
    },
    icon: string,
    badge?: string,
  ) => {
    if (!kit) return null;
    return (
      <div className={`bg-white rounded-2xl border-2 ${colorClasses.border} ${colorClasses.shadow} overflow-hidden`}>
        <div className={`bg-gradient-to-r ${colorClasses.gradient} px-5 py-4 flex items-center gap-3`}>
          <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-3 flex-1 cursor-pointer text-left">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <span className="material-symbols-outlined text-white text-xl">{icon}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-white">{kit.nom}</p>
                {badge && (
                  <span className="text-[9px] font-black bg-white/25 text-white px-2 py-0.5 rounded-full border border-white/30">
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-white/80 mt-0.5 font-semibold">{items.length} articles</p>
            </div>
            <span className="material-symbols-outlined text-white text-2xl">
              {isOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); setShowConfirm(type); }}
            disabled={saveStatus === 'saving' || saveStatus === 'success'}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-60 ${
              saveStatus === 'success'
                ? 'bg-gradient-to-r from-emerald-700 to-teal-800 text-white'
                : `bg-white ${colorClasses.btnText} hover:bg-slate-50 shadow-white/30`
            }`}
          >
            {saveStatus === 'saving' && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
            {saveStatus === 'success' && <span className="material-symbols-outlined text-sm">check_circle</span>}
            {saveStatus === 'idle' && <span className="material-symbols-outlined text-sm">send</span>}
            {saveStatus === 'saving' ? 'Envoi...' : saveStatus === 'success' ? 'Envoye' : saveStatus === 'error' ? 'Reessayer' : 'Envoyer'}
          </motion.button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                {items.map((it, i) => (
                  <motion.div
                    key={it.item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`flex items-center gap-2 p-2 rounded-lg border ${colorClasses.itemBorder} ${colorClasses.itemBg} ${colorClasses.itemHover} transition-colors`}
                  >
                    <span className={`material-symbols-outlined ${colorClasses.iconColor} text-sm`}>medication</span>
                    <span className="text-xs font-semibold text-slate-700 flex-1 truncate">{it.item.designation}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantite(type, i, Math.max(0, it.quantite - 1))}
                        className={`w-6 h-6 rounded-md ${colorClasses.btnBg} font-black text-xs cursor-pointer`}
                      >−</button>
                      <input
                        type="number"
                        value={it.quantite}
                        onChange={e => updateQuantite(type, i, parseInt(e.target.value) || 0)}
                        className={`w-12 text-center text-xs font-black border ${colorClasses.itemBorder} rounded-md px-1 py-0.5 focus:outline-none`}
                      />
                      <button
                        onClick={() => updateQuantite(type, i, it.quantite + 1)}
                        className={`w-6 h-6 rounded-md ${colorClasses.btnBg} font-black text-xs cursor-pointer`}
                      >+</button>
                    </div>
                    <span className="text-[10px] text-slate-400 w-12 text-right font-semibold">{it.item.unite}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
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
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 px-6 py-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <span className="material-symbols-outlined text-white text-3xl">prescriptions</span>
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-black">Prescription Kit Dialyse</h2>
                  <p className="text-xs text-violet-100 mt-0.5 font-semibold">
                    {patient ? `${patient.prenom} ${patient.nom}` : '—'}
                    {patient?.dateNaissance && ` · ${calculerAge(patient.dateNaissance)} ans`}
                    {' · #' + (patient?.id || '?')}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/15 rounded-xl cursor-pointer transition-colors">
                <span className="material-symbols-outlined text-white text-2xl">close</span>
              </button>
            </div>

            {infirmier && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
                <span className="material-symbols-outlined text-white text-sm">badge</span>
                <span className="text-xs text-white font-semibold">
                  Emetteur: {infirmier.nom_complet} ({infirmier.matricule || 'INF'})
                </span>
              </div>
            )}
          </div>


          <div className="flex-1 overflow-y-auto p-6 space-y-4">

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>

                {/* === KIT 1ERE SEANCE === */}
                {renderKitAccordion(
                  'premiere',
                  kits.premiere,
                  itemsPremiere,
                  openPremiere,
                  setOpenPremiere,
                  savePremiere,
                  {
                    border:     'border-blue-200',
                    shadow:     'shadow-lg shadow-blue-100/40',
                    gradient:   'from-blue-500 via-indigo-500 to-purple-600',
                    btnText:    'text-blue-700',
                    itemBg:     'bg-blue-50/30',
                    itemBorder: 'border-blue-100',
                    itemHover:  'hover:bg-blue-50',
                    iconColor:  'text-blue-500',
                    btnBg:      'bg-blue-100 text-blue-700 hover:bg-blue-200',
                  },
                  'vaccines',
                  'DON'
                )}

                {/* === KIT SEANCES SUIVANTES === */}
                {renderKitAccordion(
                  'suivante',
                  kits.suivante,
                  itemsSuivante,
                  openSuivante,
                  setOpenSuivante,
                  saveSuivante,
                  {
                    border:     'border-emerald-200',
                    shadow:     'shadow-lg shadow-emerald-100/40',
                    gradient:   'from-emerald-500 via-teal-500 to-cyan-600',
                    btnText:    'text-emerald-700',
                    itemBg:     'bg-emerald-50/30',
                    itemBorder: 'border-emerald-100',
                    itemHover:  'hover:bg-emerald-50',
                    iconColor:  'text-emerald-500',
                    btnBg:      'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
                  },
                  'autorenew',
                  'DON'
                )}

                {/* === KIT 1ER SOIN (ACHAT) === */}
                {renderKitAccordion(
                  'premier_soin',
                  kits.premierSoin,
                  itemsPremierSoin,
                  openPremierSoin,
                  setOpenPremierSoin,
                  savePremierSoin,
                  {
                    border:     'border-amber-200',
                    shadow:     'shadow-lg shadow-amber-100/40',
                    gradient:   'from-amber-500 via-orange-500 to-red-500',
                    btnText:    'text-amber-700',
                    itemBg:     'bg-amber-50/30',
                    itemBorder: 'border-amber-100',
                    itemHover:  'hover:bg-amber-50',
                    iconColor:  'text-amber-500',
                    btnBg:      'bg-amber-100 text-amber-700 hover:bg-amber-200',
                  },
                  'medical_services',
                  'ACHAT PATIENT'
                )}

                {/* === BOUTON UNIFIE - ENVOYER TOUS === */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl shadow-violet-200/40 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                        <span className="material-symbols-outlined text-white text-2xl">send</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-white">Envoyer Tous les Kits</p>
                        <p className="text-[11px] text-violet-100 mt-0.5 font-semibold">
                          Envoie en une fois les kits selectionnes a la pharmacie
                        </p>
                      </div>
                    </div>

                    {/* Case a cocher kit 1er soin */}
                    {kits.premierSoin && (
                      <label className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 cursor-pointer mb-3">
                        <input
                          type="checkbox"
                          checked={includePremierSoin}
                          onChange={e => setIncludePremierSoin(e.target.checked)}
                          className="w-5 h-5 rounded cursor-pointer accent-white"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-black text-white">Inclure Kit 1er Soin (Achat Patient)</p>
                          <p className="text-[10px] text-violet-100 mt-0.5">
                            Le kit 1er soin sera aussi envoye - destine a l achat par le patient
                          </p>
                        </div>
                      </label>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-violet-100 mb-3 font-semibold">
                      <span className="material-symbols-outlined text-sm">info</span>
                      <span>
                        Kits envoyes: Kit 1ere Seance + Kit Suivantes
                        {includePremierSoin && kits.premierSoin && ' + Kit 1er Soin'}
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowConfirm('tous')}
                      disabled={saveTous === 'saving' || saveTous === 'success'}
                      className={`w-full py-3.5 text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 ${
                        saveTous === 'success'
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-emerald-200'
                          : 'bg-white text-violet-700 hover:bg-violet-50 shadow-white/30'
                      }`}
                    >
                      {saveTous === 'saving' && <span className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />}
                      {saveTous === 'success' && <span className="material-symbols-outlined text-base">check_circle</span>}
                      {saveTous === 'idle' && <span className="material-symbols-outlined text-base">send</span>}
                      {saveTous === 'saving' ? 'Envoi en cours...' : saveTous === 'success' ? 'Tous envoyes' : saveTous === 'error' ? 'Reessayer' : 'Envoyer Tous les Kits a la Pharmacie'}
                    </motion.button>
                  </div>
                </motion.div>

                {/* Info pharmacie */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-slate-200 rounded-xl px-4 py-3 flex items-start gap-3">
                  <span className="material-symbols-outlined text-slate-600 text-xl">local_pharmacy</span>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-800">Envoi vers Pharmacie CHU</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Statut "EN ATTENTE DE PREPARATION" cote pharmacie. Notification automatique en cas de rupture.
                    </p>
                  </div>
                </div>

              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <p className="text-[11px] text-slate-500 font-semibold">
              <span className="material-symbols-outlined text-xs align-middle">info</span>
              {' '}Les quantites peuvent etre modifiees avant envoi
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-400 cursor-pointer transition-all"
            >
              Fermer
            </button>
          </div>
        </motion.div>


        {/* POPUP CONFIRMATION */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowConfirm(null)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-pink-600 flex items-center justify-center shadow-lg shadow-violet-200">
                    <span className="material-symbols-outlined text-white text-2xl">help</span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">Confirmer l'envoi</h3>
                    <p className="text-xs text-slate-500">Pharmacie CHU</p>
                  </div>
                </div>

                <p className="text-sm text-slate-700 mb-4">
                  {showConfirm === 'tous'
                    ? `Voulez-vous envoyer ${includePremierSoin && kits.premierSoin ? '3' : '2'} kit(s) a la pharmacie ?`
                    : `Voulez-vous envoyer ce kit a la pharmacie ?`
                  }
                </p>

                <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Recapitulatif</p>
                  <p className="text-xs text-slate-700">
                    <strong>Patient:</strong> {patient?.prenom} {patient?.nom} (#{patient?.id})
                  </p>
                  {showConfirm === 'tous' ? (
                    <>
                      <p className="text-xs text-slate-700"><strong>Kit 1ere Seance:</strong> {itemsPremiere.length} articles</p>
                      <p className="text-xs text-slate-700"><strong>Kit Suivantes:</strong> {itemsSuivante.length} articles</p>
                      {includePremierSoin && kits.premierSoin && (
                        <p className="text-xs text-slate-700"><strong>Kit 1er Soin:</strong> {itemsPremierSoin.length} articles</p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-slate-700">
                      <strong>Articles:</strong> {
                        showConfirm === 'premiere'     ? itemsPremiere.length :
                        showConfirm === 'suivante'     ? itemsSuivante.length :
                        showConfirm === 'premier_soin' ? itemsPremierSoin.length : 0
                      }
                    </p>
                  )}
                  <p className="text-xs text-slate-700">
                    <strong>Emetteur:</strong> {infirmier?.nom_complet || 'Non identifie'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(null)}
                    className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-400 cursor-pointer transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      if (showConfirm === 'tous') handleEnvoyerTous();
                      else handleEnvoyerUnique(showConfirm as KitType);
                    }}
                    className="flex-1 py-2.5 text-xs font-black text-white bg-gradient-to-r from-violet-600 to-pink-600 rounded-xl shadow-lg shadow-violet-200 hover:shadow-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                    Confirmer l'envoi
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOAST */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`fixed bottom-6 right-6 z-[300] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-white text-sm font-bold ${
                toast.type === 'success'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-200'
                  : 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-200'
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {toast.type === 'success' ? 'check_circle' : 'error'}
              </span>
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
