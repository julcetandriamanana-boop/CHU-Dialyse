'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  NotificationDB,
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  pollExternalNotifications,
  playNotificationSound,
  urgenceColor,
  urgenceLabel,
} from '@/src/services/notification.service';
import { useNotificationsStore } from '@/src/stores/notifications.store';
import { timeAgoMadagascar } from '@/src/utils/date.utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ─── Helper : extraire infos patient depuis notification ──────
function getPatientFromNotif(notif: NotificationDB): string | null {
  // 1. Champ structuré patient_ref_id
  if (notif.patient_ref_id) return `Patient #${notif.patient_ref_id}`;
  // 2. emitter_name (nom de l'émetteur)
  if (notif.emitter_name) return notif.emitter_name;
  // 3. Extraire depuis le message (pattern : "pour Prénom Nom")
  const matchPour = notif.message?.match(/pour\s+([A-ZÀ-ÖØ-öø-ÿ][a-zà-öø-ÿ]+(?:\s+[A-ZÀ-ÖØ-öø-ÿ][a-zà-öø-ÿ]+)+)/);
  if (matchPour) return matchPour[1];
  // 4. Extraire pattern "— Prénom Nom"
  const matchTiret = notif.message?.match(/—\s+([A-ZÀ-ÖØ-öø-ÿ][a-zà-öø-ÿ]+(?:\s+[A-ZÀ-ÖØ-öø-ÿ][a-zà-öø-ÿ]+)+)/);
  if (matchTiret) return matchTiret[1];
  return null;
}

function getCategoryLabel(notif: NotificationDB): string {
  const map: Record<string, string> = {
    'avis_inter_service': "Demande d'avis",
    'ordonnance':         'Prescription',
    'rendez_vous':        'Rendez-vous',
    'stock_critique':     'Stock',
    'ARCHIVE':            'Archive',
    'seance':             'Séance',
  };
  return map[notif.category] || notif.category || '';
}

const typeIcons: Record<string, string> = {
  success: 'check_circle',
  error:   'emergency',
  warning: 'warning',
  info:    'info',
};

function timeAgo(dateStr: string): string {
  return timeAgoMadagascar(dateStr);
}

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationDB[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [isOpen, setIsOpen]               = useState(false);
  const [audioReady, setAudioReady]       = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [sseConnected, setSseConnected]   = useState(false);
  const prevCountRef  = useRef(0);
  const dropdownRef   = useRef<HTMLDivElement>(null);
  const audioReadyRef = useRef(false);

  // ✅ Store Zustand — synchronisation sidebar
  const storeSetCount  = useNotificationsStore(s => s.setUnreadCount);
  const storeDecrement = useNotificationsStore(s => s.decrement);
  const storeReset     = useNotificationsStore(s => s.reset);

  // Synchroniser audioReadyRef avec audioReady
  useEffect(() => {
    audioReadyRef.current = audioReady;
  }, [audioReady]);

  // Activer audio dès la premiere interaction sur la page
  useEffect(() => {
    if (audioReady) return;
    const enableAudio = () => {
      setAudioReady(true);
      console.log('Audio active');
    };
    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('keydown', enableAudio, { once: true });
    document.addEventListener('touchstart', enableAudio, { once: true });
    return () => {
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
    };
  }, [audioReady]);

  // ── Charger les notifications depuis l'API ──────
  const loadNotifications = useCallback(async () => {
    try {
      const [data, count] = await Promise.all([
        fetchNotifications(),
        fetchUnreadCount(),
      ]);
      setNotifications(data.slice(0, 10));
      setUnreadCount(count);
      prevCountRef.current = count;
      // ✅ Sync store Zustand
      storeSetCount(count);
    } catch {}
  }, []);

  // ── SSE — Connexion temps réel ──────────────────
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        eventSource = new EventSource(`${API_URL}/notifications/stream`);

        eventSource.onopen = () => {
          setSseConnected(true);
          console.log('✅ SSE connecté — notifications en temps réel');
        };

        // ✅ Événement "notification" reçu en temps réel
        eventSource.addEventListener('notification', (event: MessageEvent) => {
          try {
            const notif: NotificationDB = JSON.parse(event.data);
            console.log('🔔 Nouvelle notification temps réel:', notif.title);

            // Mettre à jour la liste
            setNotifications(prev => {
              const exists = prev.find(n => n.id === notif.id);
              if (exists) return prev;
              return [notif, ...prev].slice(0, 10);
            });

            // Incrémenter le compteur
            setUnreadCount(c => {
              const newCount = c + 1;
              prevCountRef.current = newCount;
              return newCount;
            });

            // ✅ Jouer le son si audio activé
            if (audioReadyRef.current) {
              playNotificationSound(notif.urgence || 1);
            }

          } catch (e) {
            console.error('Erreur parsing SSE:', e);
          }
        });

        eventSource.onerror = () => {
          setSseConnected(false);
          eventSource?.close();
          // Reconnexion automatique après 5s
          reconnectTimer = setTimeout(connect, 5000);
        };

      } catch (e) {
        setSseConnected(false);
        reconnectTimer = setTimeout(connect, 5000);
      }
    };

    // Charger d'abord les notifications existantes
    loadNotifications();

    // Puis connecter SSE
    connect();

    // Polling de secours toutes les 60s (si SSE déconnecté)
    const fallbackInterval = setInterval(() => {
      if (!sseConnected) {
        loadNotifications();
      }
    }, 60000);

    return () => {
      eventSource?.close();
      clearTimeout(reconnectTimer);
      clearInterval(fallbackInterval);
    };
  }, [loadNotifications]);

  // Polling externe toutes les 60s
  useEffect(() => {
    const pollExternal = async () => {
      const synced = await pollExternalNotifications();
      if (synced > 0) await loadNotifications();
    };
    pollExternal();
    const interval = setInterval(pollExternal, 60000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Fermer dropdown si clic dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBellClick = () => {
    if (!audioReady) setAudioReady(true);
    setIsOpen(o => !o);
  };

  const handleClick = async (notif: NotificationDB) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
      storeDecrement(1); // ✅ Diminue le badge sidebar immédiatement
      setUnreadCount(c => Math.max(0, c - 1));
      setNotifications(prev =>
        prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
      );
    }
    if (notif.link) router.push(notif.link);
    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    storeReset(); // ✅ Remet à 0 le badge sidebar immédiatement
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const handleRefreshExternal = async () => {
    setIsLoading(true);
    await pollExternalNotifications();
    await loadNotifications();
    setIsLoading(false);
  };

  const maxUrgence = notifications
    .filter(n => !n.is_read)
    .reduce((max, n) => Math.max(max, n.urgence || 1), 0);

  const bellColor = maxUrgence >= 5 ? 'text-red-500'
    : maxUrgence >= 3 ? 'text-amber-500'
    : 'text-slate-600';

  return (
    <div className="relative" ref={dropdownRef}>

      {/* ── Cloche ── */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleBellClick}
        animate={maxUrgence >= 4 ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ repeat: maxUrgence >= 4 ? Infinity : 0, repeatDelay: 3, duration: 0.5 }}
        className="relative p-2.5 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-100"
      >
        <span className={`material-symbols-outlined text-xl ${bellColor}`}>
          notifications
        </span>

        {/* ✅ Indicateur SSE connecté */}
        <span className={`absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
          sseConnected ? 'bg-emerald-400' : 'bg-slate-300'
        }`} title={sseConnected ? 'Temps réel actif' : 'Polling'} />

        {/* Badge compteur */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key={unreadCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={`absolute -top-1 -right-1 min-w-[20px] h-[20px] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg ${
                maxUrgence >= 5 ? 'bg-red-500' :
                maxUrgence >= 3 ? 'bg-amber-500' :
                'bg-blue-500'
              }`}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-14 w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-800">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
                    {unreadCount} non lues
                  </span>
                )}
                {/* Indicateur SSE */}
                <span className={`flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                  sseConnected
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  {sseConnected ? 'En direct' : 'Polling'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefreshExternal}
                  disabled={isLoading}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Synchroniser"
                >
                  <span className={`material-symbols-outlined text-slate-400 text-sm ${isLoading ? 'animate-spin' : ''}`}>
                    sync
                  </span>
                </button>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer whitespace-nowrap">
                    Tout lu
                  </button>
                )}
              </div>
            </div>

            {/* Liste */}
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2 block">notifications_off</span>
                  <p className="text-xs font-medium">Aucune notification</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ backgroundColor: '#f8fafc' }}
                    onClick={() => handleClick(notif)}
                    className={`p-3 cursor-pointer transition-all flex items-start gap-3 group ${
                      notif.is_read ? 'opacity-60' : 'bg-white'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      notif.source === 'externe'
                        ? urgenceColor(notif.urgence || 1)
                        : notif.type === 'success' ? 'bg-emerald-100 text-emerald-600 border-emerald-200'
                        : notif.type === 'error'   ? 'bg-red-100 text-red-600 border-red-200'
                        : notif.type === 'warning' ? 'bg-amber-100 text-amber-600 border-amber-200'
                        : 'bg-blue-100 text-blue-600 border-blue-200'
                    }`}>
                      <span className="material-symbols-outlined text-sm">
                        {notif.icon || typeIcons[notif.type] || 'notifications'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{notif.title}</p>
                          {/* ✅ Affichage patient si détecté */}
                          {getPatientFromNotif(notif) && (
                            <p className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5 mt-0.5">
                              <span className="material-symbols-outlined text-[11px]">person</span>
                              {getPatientFromNotif(notif)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!notif.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                          <button
                            onClick={(e) => handleDelete(e, notif.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-100 rounded cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-red-400 text-xs">close</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{notif.message}</p>

                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <p className="text-[9px] text-slate-400">{timeAgo(notif.created_at)}</p>
                        {/* ✅ Catégorie */}
                        {notif.category && (
                          <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                            {getCategoryLabel(notif)}
                          </span>
                        )}
                        {notif.source === 'externe' && notif.urgence && notif.urgence >= 2 && (
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border ${urgenceColor(notif.urgence)}`}>
                            {urgenceLabel(notif.urgence)}
                          </span>
                        )}
                        {notif.source === 'externe' && (
                          <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                            EXTERNE
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => { router.push('/notifications'); setIsOpen(false); }}
                className="w-full py-2 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                Voir toutes les notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
