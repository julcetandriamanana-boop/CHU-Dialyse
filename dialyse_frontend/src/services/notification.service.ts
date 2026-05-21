'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface NotificationDB {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  category: string;
  link: string;
  is_read: boolean;
  icon: string;
  created_at: string;
}

export async function fetchNotifications(): Promise<NotificationDB[]> {
  const res = await fetch(`${API_URL}/notifications`);
  return res.json();
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await fetch(`${API_URL}/notifications/unread-count`);
  const data = await res.json();
  return data.count;
}

export async function markAsRead(id: number): Promise<void> {
  await fetch(`${API_URL}/notifications/${id}/read`, { method: 'POST' });
}

export async function markAllAsRead(): Promise<void> {
  await fetch(`${API_URL}/notifications/read-all`, { method: 'POST' });
}

// Son de notification utilisant l'API Web Audio (fonctionne sans fichier)
export function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Son doux de notification
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Silencieux si Web Audio non supporté
  }
}
