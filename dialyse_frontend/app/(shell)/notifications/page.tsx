'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import {
  NotificationDB,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  pollExternalNotifications,
  urgenceColor,
  urgenceLabel,
} from '@/src/services/notification.service';

const typeIcons: Record<string, string> = {
  success: 'check_circle',
  error:   'emergency',
  warning: 'warning',
  info:    'info',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'À l\'instant';
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d} jour${d > 1 ? 's' : ''}`;
}

type FilterType = 'toutes' | 'non_lues' | 'externes' | 'internes';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationDB[]>([]);
  const [loading, setLoading]             = useState(true);
  const [syncing, setSyncing]             = useState(false);
  const [filter, setFilter]               = useState<FilterType>('toutes');
  const [toast, setToast]                 = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSync = async () => {
    setSyncing(true);
    const synced = await pollExternalNotifications();
    await load();
    setSyncing(false);
    showToast(synced > 0 ? `✅ ${synced} nouvelle(s) notification(s)` : 'Aucune nouvelle notification');
  };

  const handleMarkRead = async (id: number) => {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    showToast('✅ Toutes les notifications marquées comme lues');
  };

  const handleDelete = async (id: number) => {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    showToast('🗑️ Notification supprimée');
  };

  const filtered = notifications.filter(n => {
    if (filter === 'non_lues')  return !n.is_read;
    if (filter === 'externes')  return n.source === 'externe';
    if (filter === 'internes')  return n.source === 'interne';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const filters: { key: FilterType; label: string; count?: number }[] = [
    { key: 'toutes',    label: 'Toutes',   count: notifications.length },
    { key: 'non_lues',  label: 'Non lues', count: unreadCount },
    { key: 'externes',  label: 'Externes', count: notifications.filter(n => n.source === 'externe').length },
    { key: 'internes',  label: 'Internes', count: notifications.filter(n => n.source === 'interne').length },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── En-tête ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-black text-slate-800">Notifications</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Historique complet · Service Dialyse CHU Andrainjato
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
            >
              Tout marquer lu
            </button>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-60"
          >
            <span className={`material-symbols-outlined text-sm ${syncing ? 'animate-spin' : ''}`}>sync</span>
            {syncing ? 'Synchronisation...' : 'Sync externes'}
          </button>
        </div>
      </motion.div>

      {/* ── Bandeau info service ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3"
      >
        <span className="material-symbols-outlined text-blue-500 text-base">info</span>
        <div className="flex-1">
          <p className="text-xs font-semibold text-blue-700">
            Service Dialyse · ID: d604bde1-c9dd-4284-a690-0c5ed9be6a37
          </p>
          <p className="text-[10px] text-blue-500">
            CHU: 1e5bbbb7-fa10-4d59-8848-2d0ce96a9394 · Seules les notifications destinées à ce service sont affichées
          </p>
        </div>
        <a
          href="https://service-notification.onrender.com/api"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
        >
          API externe
          <span className="material-symbols-outlined text-xs">open_in_new</span>
        </a>
      </motion.div>

      {/* ── Filtres ── */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === f.key
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
            }`}
          >
            {f.label}
            {f.count !== undefined && f.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                filter === f.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Liste ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <span className="material-symbols-outlined text-5xl mb-3 block">notifications_off</span>
          <p className="font-medium">Aucune notification</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-white rounded-2xl border p-4 flex items-start gap-4 group transition-all hover:shadow-md ${
                  notif.is_read ? 'opacity-70 border-slate-100' : 'border-slate-200 shadow-sm'
                }`}
              >
                {/* Icône */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                  notif.source === 'externe'
                    ? urgenceColor(notif.urgence || 1)
                    : notif.type === 'success' ? 'bg-emerald-100 text-emerald-600 border-emerald-200'
                    : notif.type === 'error'   ? 'bg-red-100 text-red-600 border-red-200'
                    : notif.type === 'warning' ? 'bg-amber-100 text-amber-600 border-amber-200'
                    : 'bg-blue-100 text-blue-600 border-blue-200'
                }`}>
                  <span className="material-symbols-outlined text-lg">
                    {notif.icon || typeIcons[notif.type] || 'notifications'}
                  </span>
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-slate-800">{notif.title}</p>
                        {!notif.is_read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                        )}
                        {notif.source === 'externe' && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                            EXTERNE
                          </span>
                        )}
                        {notif.source === 'externe' && notif.urgence && notif.urgence >= 2 && (
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${urgenceColor(notif.urgence)}`}>
                            {urgenceLabel(notif.urgence)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!notif.is_read && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Marquer comme lu"
                        >
                          <span className="material-symbols-outlined text-blue-500 text-sm">done</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                        title="Supprimer"
                      >
                        <span className="material-symbols-outlined text-red-400 text-sm">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Méta infos */}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      {timeAgo(notif.created_at)}
                    </span>
                    {notif.emitter_name && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">person</span>
                        {notif.emitter_name}
                      </span>
                    )}
                    {notif.source_service_name && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">business</span>
                        {notif.source_service_name}
                      </span>
                    )}
                    {notif.entite_ref_type && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">link</span>
                        {notif.entite_ref_type}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-slate-800 text-white text-sm font-semibold rounded-2xl shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
