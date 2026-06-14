export function normaliserStatut(statut: string | null | undefined): string {
  if (!statut) return 'inconnu';

  const original = String(statut).trim();
  let decoded = original;

  try {
    decoded = Buffer.from(original, 'latin1').toString('utf8').trim();
  } catch {
    decoded = original;
  }

  const candidats = [original, decoded]
    .filter(Boolean)
    .map((v) => v.toLowerCase().trim());

  for (const v of candidats) {
    if (v === 'planifié' || v === 'planifie' || v.includes('planifi')) return 'planifié';
    if (v === 'confirmé' || v === 'confirme' || v.includes('confirm')) return 'confirmé';
    if (v === 'annulé' || v === 'annule' || v.includes('annul')) return 'annulé';
    if (v === 'terminé' || v === 'termine' || v.includes('termin')) return 'terminé';
    if (v === 'en_attente' || v.includes('attente')) return 'en_attente';
    if (v === 'en_cours' || v.includes('cours')) return 'en_cours';
    if (v === 'absent' || v.includes('absen')) return 'absent';
  }

  return original;
}
