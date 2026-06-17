'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { formatDateMedium, formatDateTime } from '@/src/utils/date.utils';
import {
  AvisAPI, DemandeAvis, AvisStats,
  getNomPatient, getMotif, getServiceDemandeur,
  isEnAttente, getPrioriteConfig,
} from '@/src/services/avis-interservices.service';

type TabId     = 'en_attente' | 'historique';
type TriOption = 'recent' | 'ancien' | 'patient';
const DELAI_DISPARITION_MS = 60 * 1000;

// ─── Toast ────────────────────────────────────────────────────
function Toast({ message, type = 'success' }: { message: string; type?: 'success' | 'error' }) {
  const c = type === 'success'
    ? { bg: 'from-emerald-500 to-teal-600', icon: 'check_circle', sh: 'shadow-emerald-200' }
    : { bg: 'from-red-500 to-rose-600',     icon: 'error',        sh: 'shadow-red-200' };
  return (
    <motion.div initial={{ opacity: 0, y: 60, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 60, scale: 0.8 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`fixed bottom-6 right-6 z-50 px-5 py-3 bg-gradient-to-r ${c.bg} text-white rounded-2xl shadow-2xl ${c.sh} text-sm font-bold flex items-center gap-2`}>
      <span className="material-symbols-outlined text-lg">{c.icon}</span>{message}
    </motion.div>
  );
}

// ─── Badge Statut ─────────────────────────────────────────────
function StatutBadge({ statut }: { statut: string | null }) {
  const r = statut === 'repondu';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
      r ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-amber-100 text-amber-700 border-amber-300'
    }`}>
      <span className="material-symbols-outlined text-xs">{r ? 'check_circle' : 'schedule'}</span>
      {r ? 'Répondu' : 'En attente'}
    </span>
  );
}

// ─── Badge Priorité ───────────────────────────────────────────
function PrioriteBadge({ priorite }: { priorite: string | null }) {
  const c = getPrioriteConfig(priorite);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${c.bg} ${c.text} ${c.border}`}>
      <span className="material-symbols-outlined text-[10px]">flag</span>
      {c.label}
    </span>
  );
}

// ─── Modal Détail ─────────────────────────────────────────────
function ModalDetail({ avis, onClose, onRepondre }: { avis: DemandeAvis; onClose: () => void; onRepondre: () => void }) {
  const enAtt = isEnAttente(avis);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-xl">forum</span>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">Demande d'avis #{avis.id}</h2>
              <p className="text-xs text-slate-500">{getNomPatient(avis)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/70 rounded-xl cursor-pointer">
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Patient</p>
            <p className="text-sm font-black text-slate-800">{getNomPatient(avis)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
              <p className="text-[9px] font-bold text-blue-400 uppercase mb-1">Service demandeur</p>
              <p className="text-sm font-bold text-blue-800">{getServiceDemandeur(avis)}</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-200">
              <p className="text-[9px] font-bold text-indigo-400 uppercase mb-1">Service destinataire</p>
              <p className="text-sm font-bold text-indigo-800">{avis.service_destinataire || 'Dialyse'}</p>
            </div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
            <p className="text-[9px] font-bold text-amber-500 uppercase mb-1">Motif</p>
            <p className="text-sm text-amber-900 font-medium leading-relaxed">{getMotif(avis)}</p>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              {formatDateMedium(avis.created_at)}
            </span>
            <div className="flex gap-2">
              <PrioriteBadge priorite={avis.priorite} />
              <StatutBadge statut={avis.statut} />
            </div>
          </div>
          {avis.reponse && (
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
              <p className="text-[9px] font-bold text-emerald-500 uppercase mb-1">Réponse de {avis.repondu_par || 'Médecin'}</p>
              <p className="text-sm text-emerald-900 font-medium leading-relaxed">{avis.reponse}</p>
              {avis.repondu_at && <p className="text-[10px] text-emerald-500 mt-2">{formatDateTime(avis.repondu_at)}</p>}
            </div>
          )}
          {enAtt && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onRepondre}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-black shadow-md cursor-pointer flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">edit</span>Répondre à cette demande
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Modal Répondre ───────────────────────────────────────────
function ModalRepondre({ avis, onClose, onSuccess }: { avis: DemandeAvis; onClose: () => void; onSuccess: (msg: string) => void }) {
  const [rep, setRep] = useState('');
  const [par, setPar] = useState('');
  const [ld, setLd]   = useState(false);
  const submit = async () => {
    if (!rep.trim() || !par.trim()) return;
    setLd(true);
    try {
      await AvisAPI.repondre(avis.id, rep, par);
      onSuccess(`Réponse envoyée pour ${getNomPatient(avis)}`);
    } catch { onSuccess('Erreur envoi réponse'); }
    setLd(false);
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
          <span className="material-symbols-outlined text-white text-2xl">edit_note</span>
        </div>
        <h2 className="text-xl font-black text-slate-800 text-center mb-1">Répondre à la demande</h2>
        <p className="text-sm text-slate-500 text-center mb-5">{getNomPatient(avis)} · {getServiceDemandeur(avis)}</p>
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 mb-4">
          <p className="text-[9px] font-bold text-amber-500 uppercase mb-1">Motif</p>
          <p className="text-xs text-amber-900 font-medium">{getMotif(avis)}</p>
        </div>
        <div className="space-y-3 mb-5">
          <div>
            <label className="text-xs font-black text-slate-700 uppercase block mb-1">Réponse médicale *</label>
            <textarea value={rep} onChange={e => setRep(e.target.value)} rows={4} placeholder="Ex: Recommandation dialyse 3x/semaine..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
          </div>
          <div>
            <label className="text-xs font-black text-slate-700 uppercase block mb-1">Répondu par *</label>
            <input value={par} onChange={e => setPar(e.target.value)} placeholder="Ex: Dr. Andrianjato"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
        </div>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
            className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 cursor-pointer">Annuler</motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={submit}
            disabled={!rep.trim() || !par.trim() || ld}
            className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-black shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
            {ld ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><span className="material-symbols-outlined text-sm">send</span>Envoyer</>}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Carte Avis ───────────────────────────────────────────────
function CarteAvis({ avis, onVoir, onRepondre, isDisp }: {
  avis: DemandeAvis; onVoir: () => void; onRepondre: () => void; isDisp: boolean;
}) {
  const enAtt = isEnAttente(avis);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: isDisp ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.4 } }} whileHover={{ y: -2 }}
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
        enAtt ? 'border-amber-200' : 'border-emerald-200'
      } ${isDisp ? 'opacity-60' : ''}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${enAtt ? 'bg-amber-100' : 'bg-emerald-100'}`}>
              <span className={`material-symbols-outlined text-lg ${enAtt ? 'text-amber-600' : 'text-emerald-600'}`}>
                {enAtt ? 'schedule' : 'check_circle'}
              </span>
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">{getNomPatient(avis)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{formatDateMedium(avis.created_at)}</p>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap justify-end">
            <PrioriteBadge priorite={avis.priorite} />
            <StatutBadge statut={avis.statut} />
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-200">
            {getServiceDemandeur(avis)}
          </span>
          <span className="material-symbols-outlined text-slate-300 text-base">arrow_forward</span>
          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-lg border border-indigo-200">
            {avis.service_destinataire || 'Dialyse'}
          </span>
        </div>
        <p className="text-xs text-slate-600 font-medium mb-3 line-clamp-2 leading-relaxed">
          <span className="font-bold text-slate-700">Motif : </span>{getMotif(avis)}
        </p>
        {avis.reponse && (
          <div className="bg-emerald-50 rounded-lg p-2.5 border border-emerald-100 mb-3">
            <p className="text-[9px] font-bold text-emerald-500 uppercase mb-0.5">Réponse de {avis.repondu_par}</p>
            <p className="text-xs text-emerald-800 font-medium line-clamp-2">{avis.reponse}</p>
          </div>
        )}
        {isDisp && (
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-slate-400 animate-spin">autorenew</span>
            <p className="text-[10px] text-slate-400 font-semibold">Déplacement vers l'historique...</p>
          </div>
        )}
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onVoir}
            className="flex-1 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 hover:bg-blue-100 cursor-pointer flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-sm">visibility</span>Voir détails
          </motion.button>
          {enAtt && !isDisp && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onRepondre}
              className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-sm">edit_note</span>Répondre
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Composant Principal ──────────────────────────────────────
export default function StitchDemandesAvis() {
  const [tab, setTab]             = useState<TabId>('en_attente');
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState<{ m: string; t: 'success' | 'error' } | null>(null);
  const [modal, setModal]         = useState<{ type: 'detail' | 'repondre'; avis: DemandeAvis } | null>(null);
  const [allAvis, setAllAvis]     = useState<DemandeAvis[]>([]);
  const [stats, setStats]         = useState<AvisStats | null>(null);
  const [repTs, setRepTs]         = useState<Record<number, number>>({});
  const [now, setNow]             = useState(Date.now());
  const [search, setSearch]       = useState('');
  const [filtreSrv, setFiltreSrv] = useState('tous');
  const [tri, setTri]             = useState<TriOption>('recent');
  const [visible, setVisible]     = useState(10);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 10000); return () => clearInterval(t); }, []);

  const showToast = useCallback((m: string, t: 'success' | 'error' = 'success') => {
    setToast({ m, t }); setTimeout(() => setToast(null), 3500);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [avis, st] = await Promise.all([
        AvisAPI.getRecues().catch(() => []),
        AvisAPI.getStats().catch(() => null),
      ]);
      setAllAvis(avis); setStats(st);
    } catch { showToast('Erreur chargement', 'error'); }
    setLoading(false);
  }, [showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const obs = new IntersectionObserver(e => { if (e[0].isIntersecting) setVisible(p => p + 10); }, { threshold: 0.1 });
    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => { setVisible(10); }, [tab, search, filtreSrv, tri]);

  const srvUniques = useMemo(() => {
    const s = new Set<string>();
    allAvis.forEach(a => { if (a.service_demandeur) s.add(a.service_demandeur); });
    return Array.from(s).sort();
  }, [allAvis]);

  const marquerRepondu = useCallback((id: number) => {
    setRepTs(p => ({ ...p, [id]: Date.now() }));
    setTimeout(() => loadData(), 1500);
  }, [loadData]);

  const filtered = useMemo(() => {
    let list = allAvis.filter(a => {
      if (search) {
        const s = search.toLowerCase();
        if (!getNomPatient(a).toLowerCase().includes(s) && !getMotif(a).toLowerCase().includes(s)) return false;
      }
      if (filtreSrv !== 'tous' && a.service_demandeur !== filtreSrv) return false;
      return true;
    });
    if (tri === 'recent') list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (tri === 'ancien') list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    if (tri === 'patient') list.sort((a, b) => getNomPatient(a).localeCompare(getNomPatient(b)));
    return list;
  }, [allAvis, search, filtreSrv, tri]);

  const { enAttente, historique, disp } = useMemo(() => {
    const ea: DemandeAvis[] = [], hist: DemandeAvis[] = [], d = new Set<number>();
    filtered.forEach(a => {
      const ts = repTs[a.id]; const repondu = !isEnAttente(a);
      if (repondu) {
        if (ts && (now - ts) < DELAI_DISPARITION_MS) { ea.push(a); d.add(a.id); }
        else hist.push(a);
      } else ea.push(a);
    });
    return { enAttente: ea, historique: hist, disp: d };
  }, [filtered, repTs, now]);

  const liste = tab === 'en_attente' ? enAttente : historique;
  const vis = liste.slice(0, visible);
  const hasMore = visible < liste.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="p-6 space-y-5 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl shadow-xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="text-white">
              <h1 className="text-xl md:text-2xl font-black flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl">forum</span>Demandes d'Avis Reçues
              </h1>
              <p className="text-xs text-indigo-100 mt-1 font-semibold">Service Dialyse · CHU Andrainjato · Interservices</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={loadData}
              className="px-3 py-2 bg-white/15 text-white text-xs font-bold rounded-xl border border-white/20 hover:bg-white/25 cursor-pointer flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">refresh</span>Actualiser
            </motion.button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { l: 'Total',        v: stats?.total || 0,        i: 'forum',        g: 'from-indigo-500 to-blue-600' },
              { l: 'En attente',   v: stats?.en_attente || 0,   i: 'schedule',     g: 'from-amber-500 to-orange-600' },
              { l: 'Répondues',    v: stats?.repondues || 0,    i: 'check_circle', g: 'from-emerald-500 to-teal-600' },
              { l: 'Taux réponse', v: `${stats?.taux_reponse || 0}%`, i: 'percent', g: 'from-purple-500 to-pink-600' },
            ].map((k, i) => (
              <motion.div key={k.l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${k.g} flex items-center justify-center mb-2 shadow-sm`}>
                  <span className="material-symbols-outlined text-white text-sm">{k.i}</span>
                </div>
                <p className="text-xl font-black text-white">{k.v}</p>
                <p className="text-[10px] text-white/70 font-semibold uppercase">{k.l}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-2 flex gap-1">
          {[
            { id: 'en_attente' as TabId, l: 'En attente', i: 'schedule', c: enAttente.length },
            { id: 'historique' as TabId, l: 'Historique',  i: 'history',  c: historique.length },
          ].map(t => (
            <motion.button key={t.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setTab(t.id)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                tab === t.id ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}>
              <span className="material-symbols-outlined text-sm">{t.i}</span>{t.l}
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${tab === t.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>{t.c}</span>
            </motion.button>
          ))}
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 space-y-3">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-48 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher patient, motif..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <select value={filtreSrv} onChange={e => setFiltreSrv(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="tous">Tous les services</option>
              {srvUniques.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={tri} onChange={e => setTri(e.target.value as TriOption)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="recent">Plus récent</option>
              <option value="ancien">Plus ancien</option>
              <option value="patient">Patient A-Z</option>
            </select>
            {(search || filtreSrv !== 'tous' || tri !== 'recent') && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setSearch(''); setFiltreSrv('tous'); setTri('recent'); }}
                className="px-3 py-2.5 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 cursor-pointer flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">close</span>Réinit.
              </motion.button>
            )}
          </div>
          <p className="text-xs text-slate-400 font-semibold">{liste.length} demande{liste.length > 1 ? 's' : ''}</p>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-500">Chargement...</p>
          </div>
        ) : liste.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-3 block">{tab === 'en_attente' ? 'check_circle' : 'history'}</span>
            <p className="font-bold text-lg text-slate-600">{tab === 'en_attente' ? 'Aucune demande en attente' : 'Historique vide'}</p>
            <p className="text-xs text-slate-400 mt-1">{tab === 'en_attente' ? 'Toutes les demandes ont été traitées ✅' : 'Les réponses apparaîtront ici'}</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {vis.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                  <CarteAvis avis={a} isDisp={disp.has(a.id)}
                    onVoir={() => setModal({ type: 'detail', avis: a })}
                    onRepondre={() => setModal({ type: 'repondre', avis: a })} />
                </motion.div>
              ))}
            </AnimatePresence>
            {hasMore && (
              <div ref={loaderRef} className="flex justify-center py-6">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold">Chargement...</span>
                </div>
              </div>
            )}
            {!hasMore && <p className="text-center py-6 text-xs text-slate-400">✅ Tout affiché ({liste.length})</p>}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal?.type === 'detail' && <ModalDetail avis={modal.avis} onClose={() => setModal(null)}
          onRepondre={() => setModal({ type: 'repondre', avis: modal.avis })} />}
        {modal?.type === 'repondre' && <ModalRepondre avis={modal.avis} onClose={() => setModal(null)}
          onSuccess={m => { showToast(m); marquerRepondu(modal.avis.id); setModal(null); }} />}
      </AnimatePresence>
      <AnimatePresence>{toast && <Toast message={toast.m} type={toast.t} />}</AnimatePresence>
    </div>
  );
}
