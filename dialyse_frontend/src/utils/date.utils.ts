/**
 * Utilitaires date/heure - Timezone Madagascar (EAT UTC+3)
 * CHU Andrainjato - Service Hémodialyse
 */

export const TZ_MADAGASCAR = 'Indian/Antananarivo'; // UTC+3
export const LOCALE_FR     = 'fr-FR';

// ─── Date courante en heure Madagascar ───────────────────────

export function nowMadagascar(): Date {
  return new Date(
    new Date().toLocaleString(LOCALE_FR, { timeZone: TZ_MADAGASCAR })
  );
}

export function todayMadagascar(): string {
  return new Date()
    .toLocaleDateString('fr-CA', { timeZone: TZ_MADAGASCAR }) // format YYYY-MM-DD
    .split('/')
    .join('-');
}

// ─── Formatage dates ──────────────────────────────────────────

/**
 * Format court : 12/06/2026
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString(LOCALE_FR, {
      timeZone: TZ_MADAGASCAR,
      day:   '2-digit',
      month: '2-digit',
      year:  'numeric',
    });
  } catch {
    return '-';
  }
}

/**
 * Format avec heure : 12/06/2026 à 14:32
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    const d = new Date(date);
    const dateStr = d.toLocaleDateString(LOCALE_FR, {
      timeZone: TZ_MADAGASCAR,
      day:   '2-digit',
      month: '2-digit',
      year:  'numeric',
    });
    const timeStr = d.toLocaleTimeString(LOCALE_FR, {
      timeZone: TZ_MADAGASCAR,
      hour:   '2-digit',
      minute: '2-digit',
    });
    return `${dateStr} à ${timeStr}`;
  } catch {
    return '-';
  }
}

/**
 * Format long : 12 juin 2026
 */
export function formatDateLong(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString(LOCALE_FR, {
      timeZone: TZ_MADAGASCAR,
      day:   '2-digit',
      month: 'long',
      year:  'numeric',
    });
  } catch {
    return '-';
  }
}

/**
 * Format medium : 12 juin 2026, 14:32
 */
export function formatDateMedium(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString(LOCALE_FR, {
      timeZone: TZ_MADAGASCAR,
      day:   '2-digit',
      month: 'short',
      year:  'numeric',
      hour:  '2-digit',
      minute:'2-digit',
    });
  } catch {
    return '-';
  }
}

/**
 * Format heure seulement : 14:32
 */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleTimeString(LOCALE_FR, {
      timeZone: TZ_MADAGASCAR,
      hour:   '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}

/**
 * Format mois/année : juin 2026
 */
export function formatMois(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString(LOCALE_FR, {
      timeZone: TZ_MADAGASCAR,
      month: 'long',
      year:  'numeric',
    });
  } catch {
    return '-';
  }
}

/**
 * Temps relatif : "il y a 3 minutes", "À l'instant"
 */
export function timeAgoMadagascar(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const s    = Math.floor(diff / 1000);
    const m    = Math.floor(s / 60);
    const h    = Math.floor(m / 60);
    const d    = Math.floor(h / 24);

    if (s < 60)  return 'À l\'instant';
    if (m < 60)  return `${m}m`;
    if (h < 24)  return `${h}h`;
    if (d < 7)   return `${d}j`;
    return formatDate(dateStr);
  } catch {
    return '-';
  }
}

/**
 * Calcul âge depuis date naissance (Madagascar)
 */
export function calculerAge(dateNaissance: string | Date | null | undefined): string {
  if (!dateNaissance) return '-';
  try {
    const now         = nowMadagascar();
    const birth       = new Date(dateNaissance);
    let age           = now.getFullYear() - birth.getFullYear();
    const moisDiff    = now.getMonth() - birth.getMonth();
    if (moisDiff < 0 || (moisDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} ans`;
  } catch {
    return '-';
  }
}

/**
 * Vérifier si une date est aujourd'hui (Madagascar)
 */
export function isToday(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  try {
    const today = todayMadagascar();
    const d     = new Date(date)
      .toLocaleDateString('fr-CA', { timeZone: TZ_MADAGASCAR })
      .split('/')
      .join('-');
    return d === today;
  } catch {
    return false;
  }
}

/**
 * Horloge temps réel Madagascar — à utiliser dans un composant avec useState + setInterval
 * Retourne : "14:32:05"
 */
export function getHeureMadagascar(): string {
  return new Date().toLocaleTimeString(LOCALE_FR, {
    timeZone: TZ_MADAGASCAR,
    hour:     '2-digit',
    minute:   '2-digit',
    second:   '2-digit',
  });
}

/**
 * Date ISO en heure Madagascar pour les inputs date
 * Retourne : "2026-06-12"
 */
export function toInputDate(date?: string | Date | null): string {
  if (!date) return '';
  try {
    return new Date(date)
      .toLocaleDateString('fr-CA', { timeZone: TZ_MADAGASCAR });
  } catch {
    return '';
  }
}
