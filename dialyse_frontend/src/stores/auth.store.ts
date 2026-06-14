'use client';

const AUTH_STORAGE_KEY = 'chu_dialyse_user';

export type UserRole = 'admin' | 'medecin' | 'infirmier';

export interface User {
  id: number;
  nom: string;
  role: UserRole;
  email?: string;
}

const defaultUser: User = {
  id: 0,
  nom: 'Visiteur',
  role: 'infirmier', // Rôle par défaut : lecture seule
};

export function getCurrentUser(): User {
  if (typeof window === 'undefined') return { ...defaultUser };
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  return stored ? JSON.parse(stored) : { ...defaultUser };
}

export function setCurrentUser(user: User) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function clearCurrentUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isAdmin(): boolean {
  return getCurrentUser().role === 'admin';
}

export function canDeleteRapports(): boolean {
  return isAdmin();
}

export function canModifyRapports(): boolean {
  return isAdmin();
}
