'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNotificationsStore } from '@/src/stores/notifications.store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface SidebarCounts {
  notifications:  number;
  rendezvous:     number;
  dialyses:       number;
  demandesAvis:   number;
  rapports:       number;
  archives:       number;
}

const defaultCounts: SidebarCounts = {
  notifications: 0,
  rendezvous:    0,
  dialyses:      0,
  demandesAvis:  0,
  rapports:      0,
  archives:      0,
};

async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return fallback;
    return await res.json();
  } catch {
    return fallback;
  }
}

export function useSidebarCounts(refreshInterval = 30000): SidebarCounts {
  const [counts, setCounts] = useState<SidebarCounts>(defaultCounts);

  // ✅ Lire le compteur notifications depuis le store Zustand (temps réel)
  const storeUnreadCount = useNotificationsStore(s => s.unreadCount);
  const setStoreCount    = useNotificationsStore(s => s.setUnreadCount);
  const storeIncrement   = useNotificationsStore(s => s.increment);

  const loadCounts = useCallback(async () => {
    try {
      const [
        unreadCount,
        rdvToday,
        prescEnAttente,
        demandesAvis,
        rapports,
        archiveStats,
      ] = await Promise.all([
        safeFetch<number>(`${API_URL}/notifications/unread-count`, 0),
        safeFetch<any[]>(`${API_URL}/rendezvous/aujourdhui`, []),
        safeFetch<any[]>(`${API_URL}/prescriptions/en-attente`, []),
        safeFetch<any[]>(`${API_URL}/demandes-avis`, []),
        safeFetch<any[]>(`${API_URL}/rapports`, []),
        safeFetch<any>(`${API_URL}/archives/statistiques`, { total: 0 }),
      ]);

      // ✅ Mettre à jour le store Zustand avec le vrai count
      const notifCount = typeof unreadCount === 'number'
        ? unreadCount
        : (unreadCount as any)?.count || 0;
      setStoreCount(notifCount);

      setCounts(prev => ({
        ...prev,
        rendezvous:   Array.isArray(rdvToday)       ? rdvToday.length       : 0,
        dialyses:     Array.isArray(prescEnAttente)  ? prescEnAttente.length  : 0,
        demandesAvis: Array.isArray(demandesAvis)    ? demandesAvis.length    : 0,
        rapports:     Array.isArray(rapports)        ? rapports.length        : 0,
        archives:     archiveStats?.total            || 0,
      }));
    } catch (e) {
      console.warn('[useSidebarCounts] Erreur chargement:', e);
    }
  }, [setStoreCount]);

  useEffect(() => {
    loadCounts();
    const interval = setInterval(loadCounts, refreshInterval);
    return () => clearInterval(interval);
  }, [loadCounts, refreshInterval]);

  // ✅ SSE — incrémente le store Zustand en temps réel
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`${API_URL}/notifications/stream`);
      eventSource.addEventListener('notification', () => {
        storeIncrement(1);
      });
      eventSource.onerror = () => { eventSource?.close(); };
    } catch {}
    return () => { eventSource?.close(); };
  }, [storeIncrement]);

  // ✅ Le badge notifications vient du store (mis à jour instantanément)
  return {
    ...counts,
    notifications: storeUnreadCount,
  };
}
