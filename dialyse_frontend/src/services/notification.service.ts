'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const MY_SERVICE_ID = process.env.NEXT_PUBLIC_DIALYSE_SERVICE_ID || 'd604bde1-c9dd-4284-a690-0c5ed9be6a37';
export const MY_CHU_ID     = process.env.NEXT_PUBLIC_DIALYSE_CHU_ID     || '1e5bbbb7-fa10-4d59-8848-2d0ce96a9394';

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
  // Champs externes
  urgence: number;
  source: 'interne' | 'externe';
  source_service_id?: string;
  source_service_name?: string;
  emitter_name?: string;
  patient_ref_id?: string;
  ringtone?: string;
  channels?: string[];
  sent_at?: string;
  entite_ref_type?: string;
  payload?: any;
}

export async function fetchNotifications(): Promise<NotificationDB[]> {
  const res = await fetch(`${API_URL}/notifications`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await fetch(`${API_URL}/notifications/unread-count`);
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count;
}

export async function fetchUnread(): Promise<NotificationDB[]> {
  const res = await fetch(`${API_URL}/notifications/unread`);
  if (!res.ok) return [];
  return res.json();
}

export async function markAsRead(id: number): Promise<void> {
  await fetch(`${API_URL}/notifications/${id}/read`, { method: 'POST' });
}

export async function markAllAsRead(): Promise<void> {
  await fetch(`${API_URL}/notifications/read-all`, { method: 'POST' });
}

export async function deleteNotification(id: number): Promise<void> {
  await fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE' });
}

export async function pollExternalNotifications(): Promise<number> {
  try {
    const res = await fetch(`${API_URL}/notifications/poll-external`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return Number(data?.synced || 0);
  } catch (error) {
    console.warn('[notification.service] pollExternalNotifications failed:', error);
    return 0;
  }
}

// ── Sons selon urgence ─────────────────────────
export function playNotificationSound(urgence: number = 1) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode   = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (urgence >= 5) {
      // Urgence critique — son fort répété
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
      oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.30);
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } else if (urgence >= 3) {
      // Urgence moyenne — son double
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
      oscillator.frequency.setValueAtTime(800,  ctx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.35);
    } else {
      // Urgence faible — son doux
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800,  ctx.currentTime);
      oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800,  ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    }
  } catch {}
}

// ── Couleurs urgence ───────────────────────────
export function urgenceColor(urgence: number): string {
  if (urgence >= 5) return 'bg-red-100 text-red-700 border-red-200';
  if (urgence >= 4) return 'bg-orange-100 text-orange-700 border-orange-200';
  if (urgence >= 3) return 'bg-amber-100 text-amber-700 border-amber-200';
  if (urgence >= 2) return 'bg-blue-100 text-blue-700 border-blue-200';
  return 'bg-emerald-100 text-emerald-700 border-emerald-200';
}

export function urgenceLabel(urgence: number): string {
  if (urgence >= 5) return 'CRITIQUE';
  if (urgence >= 4) return 'URGENT';
  if (urgence >= 3) return 'IMPORTANT';
  if (urgence >= 2) return 'NORMAL';
  return 'INFO';
}
