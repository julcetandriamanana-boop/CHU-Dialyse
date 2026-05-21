'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { NotificationDB, fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead, playNotificationSound } from '@/src/services/notification.service';

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationDB[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await fetchNotifications();
      const count = await fetchUnreadCount();
      setNotifications(data.slice(0, 10));
      if (count > unreadCount && audioReady) {
        playNotificationSound();
      }
      setUnreadCount(count);
    } catch {}
  }, [unreadCount, audioReady]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Activer l'audio au premier clic sur la cloche
  const handleBellClick = () => {
    if (!audioReady) {
      playNotificationSound(); // Débloque l'API Audio
      setAudioReady(true);
    }
    setIsOpen(!isOpen);
  };

  const handleClick = async (notif: NotificationDB) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
      setUnreadCount(c => Math.max(0, c - 1));
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    }
    if (notif.link) {
      router.push(notif.link);
    }
    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const typeStyles: Record<string, string> = {
    success: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    error: 'bg-red-100 text-red-600 border-red-200',
    warning: 'bg-amber-100 text-amber-600 border-amber-200',
    info: 'bg-blue-100 text-blue-600 border-blue-200',
  };

  const typeIcons: Record<string, string> = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info',
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleBellClick}
        className="relative p-2.5 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-100"
      >
        <span className="material-symbols-outlined text-slate-600 text-xl">notifications</span>
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key={unreadCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg"
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-14 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <h3 className="text-sm font-black text-slate-800">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
                  Tout marquer lu
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <span className="material-symbols-outlined text-3xl mb-2">notifications_off</span>
                  <p className="text-xs">Aucune notification</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <motion.div
                    key={notif.id}
                    whileHover={{ backgroundColor: '#f8fafc' }}
                    onClick={() => handleClick(notif)}
                    className={`p-4 border-b border-slate-50 cursor-pointer transition-all flex items-start gap-3 ${notif.is_read ? 'opacity-60' : ''}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeStyles[notif.type]}`}>
                      <span className="material-symbols-outlined text-sm">{notif.icon || typeIcons[notif.type]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-bold text-slate-800 truncate">{notif.title}</p>
                        {!notif.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 ml-1" />}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{notif.message}</p>
                      <p className="text-[9px] text-slate-400 mt-1">
                        {new Date(notif.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
