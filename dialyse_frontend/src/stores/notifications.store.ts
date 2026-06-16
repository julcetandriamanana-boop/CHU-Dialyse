'use client';

import { create } from 'zustand';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface NotificationsStore {
  unreadCount:    number;
  setUnreadCount: (count: number) => void;
  decrement:      (by?: number) => void;
  increment:      (by?: number) => void;
  reset:          () => void;
  fetchCount:     () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  unreadCount: 0,

  setUnreadCount: (count) =>
    set({ unreadCount: Math.max(0, count) }),

  decrement: (by = 1) =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - by) })),

  increment: (by = 1) =>
    set((state) => ({ unreadCount: state.unreadCount + by })),

  reset: () => set({ unreadCount: 0 }),

  fetchCount: async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = await res.json();
      const count = typeof data === 'number' ? data : (data?.count || 0);
      set({ unreadCount: Math.max(0, count) });
    } catch {
      // silencieux
    }
  },
}));
