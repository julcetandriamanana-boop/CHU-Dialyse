'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNotificationsStore } from '@/src/stores/notifications.store';
import { fetchPatientsKitStatus } from '@/src/services/pharmacie.service';
import { todayMadagascar, toInputDate } from '@/src/utils/date.utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface SidebarCounts {
  notifications: number;
  rendezvous:    number;
  dialyses:      number; // ✅ nombre de patients à traiter
  demandesAvis:  number;
  rapports:      number;
  archives:      number;
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

export function useSidebarCounts(refreshInterval = 10000): SidebarCounts {
  const [counts, setCounts] = useState<SidebarCounts>(defaultCounts);

  // ✅ Notifications via store partagé
  const storeUnreadCount = useNotificationsStore((s) => s.unreadCount);
  const setStoreCount    = useNotificationsStore((s) => s.setUnreadCount);
  const storeIncrement   = useNotificationsStore((s) => s.increment);

  const loadCounts = useCallback(async () => {
    try {
      const today = todayMadagascar();
      const nowTs = Date.now();
      const DELAI_DISPARITION_MS = 60 * 1000; // 1 minute

      const [
        unreadCount,
        prescriptionsValidees,
        rdvData,
        demandesAvis,
        rapports,
        archiveStats,
        kitsStatus,
      ] = await Promise.all([
        safeFetch<number>(`${API_URL}/notifications/unread-count`, 0),
        safeFetch<any[]>(`${API_URL}/prescriptions/validees`, []),
        safeFetch<any[]>(`${API_URL}/rendezvous`, []),
        safeFetch<any[]>(`${API_URL}/demandes-avis`, []),
        safeFetch<any[]>(`${API_URL}/rapports`, []),
        safeFetch<any>(`${API_URL}/archives/statistiques`, { total: 0 }),
        fetchPatientsKitStatus().catch(() => ({})),
      ]);

      // ✅ sync notifications store
      const notifCount =
        typeof unreadCount === 'number'
          ? unreadCount
          : (unreadCount as any)?.count || 0;

      setStoreCount(notifCount);

      // ── Même logique que la page Dialyses ───────────────────

      // 1) patients venant des prescriptions validées
      const patientIds = new Set<number>();

      if (Array.isArray(prescriptionsValidees)) {
        for (const p of prescriptionsValidees) {
          const pid = p?.patient?.id;
          if (typeof pid === 'number') {
            patientIds.add(pid);
          }
        }
      }

      // 2) patients venant des RDV futurs planifiés/confirmés
      if (Array.isArray(rdvData)) {
        const futurs = rdvData.filter((r: any) =>
          r?.patient &&
          new Date(r.date_heure) >= new Date() &&
          (r.statut === 'planifié' || r.statut === 'confirmé')
        );

        for (const r of futurs) {
          const pid = r?.patient?.id;
          if (typeof pid === 'number') {
            patientIds.add(pid);
          }
        }
      }

      // 3) compter seulement ceux "à traiter"
      let patientsATraiterCount = 0;

      for (const patientId of patientIds) {
        const kit = (kitsStatus as any)?.[patientId];

        // Pas de kit = à traiter
        if (!kit || !kit.dernier) {
          patientsATraiterCount++;
          continue;
        }

        const kitDate = toInputDate(kit.dernier);
        const elapsed = nowTs - new Date(kit.dernier).getTime();

        // kit d'un autre jour => à traiter aujourd'hui
        if (kitDate !== today) {
          patientsATraiterCount++;
          continue;
        }

        // kit envoyé aujourd'hui il y a moins d'1 minute => encore à traiter
        if (elapsed < DELAI_DISPARITION_MS) {
          patientsATraiterCount++;
          continue;
        }

        // sinon => traité aujourd'hui, donc pas dans le badge "à traiter"
      }

      setCounts({
        notifications: storeUnreadCount,
        rendezvous:    Array.isArray(rdvData)
          ? rdvData.filter((r: any) =>
              r?.patient &&
              new Date(r.date_heure) >= new Date() &&
              (r.statut === 'planifié' || r.statut === 'confirmé')
            ).length
          : 0,
        dialyses:     patientsATraiterCount, // ✅ badge sidebar = À traiter
        demandesAvis: Array.isArray(demandesAvis) ? demandesAvis.length : 0,
        rapports:     Array.isArray(rapports) ? rapports.length : 0,
        archives:     archiveStats?.total || 0,
      });
    } catch (e) {
      console.warn('[useSidebarCounts] Erreur chargement:', e);
    }
  }, [setStoreCount, storeUnreadCount]);

  useEffect(() => {
    loadCounts();
    const interval = setInterval(loadCounts, refreshInterval);
    return () => clearInterval(interval);
  }, [loadCounts, refreshInterval]);

  // ✅ SSE notifications en temps réel
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`${API_URL}/notifications/stream`);
      eventSource.addEventListener('notification', () => {
        storeIncrement(1);
      });
      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch {}

    return () => {
      eventSource?.close();
    };
  }, [storeIncrement]);

  return {
    ...counts,
    notifications: storeUnreadCount,
  };
}
