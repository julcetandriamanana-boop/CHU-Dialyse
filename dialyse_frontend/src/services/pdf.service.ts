'use client';

import jsPDF from 'jspdf';

// ─── Couleurs CHU ──────────────────────────────────────────────
const COLORS = {
  primary:    [79, 70, 229],   // indigo-600
  secondary:  [147, 51, 234],  // purple-600
  success:    [5, 150, 105],   // emerald-600
  danger:     [220, 38, 38],   // red-600
  warning:    [217, 119, 6],   // amber-600
  dark:       [15, 23, 42],    // slate-900
  medium:     [71, 85, 105],   // slate-600
  light:      [148, 163, 184], // slate-400
  white:      [255, 255, 255],
  bgLight:    [248, 250, 252], // slate-50
  bgSection:  [238, 242, 255], // indigo-50
};

// ─── Utilitaires PDF ───────────────────────────────────────────
function addHeader(doc: jsPDF, titre: string, auteur = 'Service Dialyse') {
  const w = doc.internal.pageSize.getWidth();

  // Bande gradient simulée
  doc.setFillColor(...COLORS.primary as [number, number, number]);
  doc.rect(0, 0, w, 35, 'F');

  doc.setFillColor(...COLORS.secondary as [number, number, number]);
  doc.rect(w - 60, 0, 60, 35, 'F');

  // Titre CHU
  doc.setTextColor(...COLORS.white as [number, number, number]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('CHU ANDRAINJATO', 12, 12);

  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('Service Hémodialyse', 12, 18);

  // Titre rapport
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(titre, 12, 28);

  // Date + auteur (coin droit)
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  const now = new Date().toLocaleString('fr-FR');
  doc.text(now, w - 8, 12, { align: 'right' });
  doc.text(`Par: ${auteur}`, w - 8, 18, { align: 'right' });

  return 45; // y de départ après header
}

function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  doc.setFillColor(...COLORS.bgLight as [number, number, number]);
  doc.rect(0, h - 15, w, 15, 'F');

  doc.setDrawColor(...COLORS.light as [number, number, number]);
  doc.line(10, h - 15, w - 10, h - 15);

  doc.setTextColor(...COLORS.light as [number, number, number]);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('CHU Andrainjato - Document confidentiel - Usage interne', 12, h - 7);
  doc.text(`Page ${pageNum}/${totalPages}`, w - 12, h - 7, { align: 'right' });
}

function addSectionTitle(doc: jsPDF, titre: string, y: number): number {
  const w = doc.internal.pageSize.getWidth();

  doc.setFillColor(...COLORS.bgSection as [number, number, number]);
  doc.rect(10, y, w - 20, 8, 'F');

  doc.setDrawColor(...COLORS.primary as [number, number, number]);
  doc.setLineWidth(0.5);
  doc.line(10, y, 10, y + 8);

  doc.setTextColor(...COLORS.primary as [number, number, number]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(titre.toUpperCase(), 14, y + 5.5);

  return y + 13;
}

function addKPIGrid(doc: jsPDF, items: { label: string; value: string | number }[], y: number): number {
  const w = doc.internal.pageSize.getWidth();
  const cols = Math.min(items.length, 4);
  const cardW = (w - 20 - (cols - 1) * 4) / cols;
  const cardH = 18;

  items.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 10 + col * (cardW + 4);
    const cy = y + row * (cardH + 4);

    // Card background
    doc.setFillColor(...COLORS.white as [number, number, number]);
    doc.setDrawColor(...COLORS.light as [number, number, number]);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, cy, cardW, cardH, 2, 2, 'FD');

    // Accent bar gauche
    doc.setFillColor(...COLORS.primary as [number, number, number]);
    doc.rect(x, cy, 2, cardH, 'F');

    // Label
    doc.setTextColor(...COLORS.light as [number, number, number]);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(String(item.label).toUpperCase(), x + 5, cy + 6);

    // Valeur
    doc.setTextColor(...COLORS.dark as [number, number, number]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(String(item.value), x + 5, cy + 14);
  });

  const rows = Math.ceil(items.length / cols);
  return y + rows * (cardH + 4) + 4;
}

function addTable(
  doc: jsPDF,
  headers: string[],
  rows: (string | number)[][],
  y: number,
): number {
  const w = doc.internal.pageSize.getWidth();
  const colW = (w - 20) / headers.length;
  const rowH = 7;

  // Header
  doc.setFillColor(...COLORS.primary as [number, number, number]);
  doc.rect(10, y, w - 20, rowH, 'F');
  doc.setTextColor(...COLORS.white as [number, number, number]);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  headers.forEach((h, i) => {
    doc.text(h, 12 + i * colW, y + 5);
  });
  y += rowH;

  // Rows
  rows.forEach((row, ri) => {
    const isEven = ri % 2 === 0;
    doc.setFillColor(...(isEven ? COLORS.white : COLORS.bgLight) as [number, number, number]);
    doc.rect(10, y, w - 20, rowH, 'F');

    doc.setDrawColor(...COLORS.bgLight as [number, number, number]);
    doc.setLineWidth(0.1);
    doc.line(10, y + rowH, w - 10, y + rowH);

    doc.setTextColor(...COLORS.dark as [number, number, number]);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    row.forEach((cell, ci) => {
      const text = String(cell ?? '-');
      doc.text(text, 12 + ci * colW, y + 5);
    });
    y += rowH;
  });

  return y + 5;
}

function checkPageBreak(doc: jsPDF, y: number, needed = 30): number {
  const h = doc.internal.pageSize.getHeight();
  if (y + needed > h - 20) {
    doc.addPage();
    return 15;
  }
  return y;
}

// ─── EXPORTS PDF PAR RAPPORT ──────────────────────────────────

export function exportPdfActiviteDialyse(kpi: any): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = addHeader(doc, 'Rapport Activité Dialyse');

  // Séances
  y = addSectionTitle(doc, 'Séances Hémodialyse', y);
  y = addKPIGrid(doc, [
    { label: 'Total séances', value: kpi.seances?.total || 0 },
    { label: 'Moyenne/jour', value: kpi.seances?.moyenne_par_jour || 0 },
    { label: 'Poids moyen pré', value: `${kpi.seances?.poids_moyen_pre || 0} kg` },
    { label: 'Poids moyen post', value: `${kpi.seances?.poids_moyen_post || 0} kg` },
    { label: 'Perte poids moy', value: `${kpi.seances?.perte_poids_moyenne || 0} kg` },
  ], y);

  // Patients
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, 'Patients', y);
  y = addKPIGrid(doc, [
    { label: 'Total patients', value: kpi.patients?.total || 0 },
    { label: 'Actifs', value: kpi.patients?.actifs || 0 },
    { label: 'Suspendus', value: kpi.patients?.suspendus || 0 },
    { label: 'Terminés', value: kpi.patients?.termines || 0 },
  ], y);

  // Rendez-vous
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, 'Rendez-vous', y);
  y = addKPIGrid(doc, [
    { label: 'Total RDV', value: kpi.rendezVous?.total || 0 },
    { label: 'Taux réalisation', value: `${kpi.rendezVous?.taux_realisation_pct || 0}%` },
  ], y);

  // Par statut RDV
  if (kpi.rendezVous?.par_statut) {
    const rows = Object.entries(kpi.rendezVous.par_statut).map(([st, cnt]) => [st, String(cnt)]);
    y = addTable(doc, ['Statut RDV', 'Nombre'], rows, y);
  }

  // Par machine
  y = checkPageBreak(doc, y);
  if (kpi.rendezVous?.par_machine) {
    y = addSectionTitle(doc, 'Utilisation machines', y);
    const rows = Object.entries(kpi.rendezVous.par_machine).map(([mac, cnt]) => [mac, String(cnt)]);
    y = addTable(doc, ['Machine', 'RDV'], rows, y);
  }

  addFooter(doc, 1, 1);
  doc.save(`rapport-activite-dialyse-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportPdfMedicalPatient(kpi: any): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const nom = `${kpi.patient?.nom || ''} ${kpi.patient?.prenom || ''}`;
  let y = addHeader(doc, `Rapport Médical - ${nom}`);

  // Identité
  y = addSectionTitle(doc, 'Identité Patient', y);
  y = addKPIGrid(doc, [
    { label: 'Nom complet', value: nom },
    { label: 'Statut traitement', value: kpi.patient?.traitement_statut || '-' },
  ], y);

  // Séances
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, 'Séances', y);
  y = addKPIGrid(doc, [
    { label: 'Total séances', value: kpi.seances?.total || 0 },
    { label: 'Poids moyen pré', value: `${kpi.seances?.poids_moyen_pre || 0} kg` },
    { label: 'Poids moyen post', value: `${kpi.seances?.poids_moyen_post || 0} kg` },
  ], y);

  // Historique séances
  if (kpi.seances?.historique?.length > 0) {
    y = checkPageBreak(doc, y);
    y = addSectionTitle(doc, 'Historique séances', y);
    const rows = kpi.seances.historique.slice(0, 10).map((s: any) => [
      new Date(s.date_debut).toLocaleDateString('fr-FR'),
      `${s.poids_pre} kg`,
      `${s.poids_post} kg`,
      `${s.perte_poids} kg`,
    ]);
    y = addTable(doc, ['Date', 'Poids pré', 'Poids post', 'Perte'], rows, y);
  }

  // Surveillance
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, 'Surveillance', y);
  y = addKPIGrid(doc, [
    { label: 'Surveillances', value: kpi.surveillance?.total_surveillances || 0 },
    { label: 'Kt/V moyen', value: kpi.surveillance?.kt_v_moyen || '-' },
    { label: 'Incidents', value: kpi.surveillance?.incidents_detectes || 0 },
    { label: 'Taux incident', value: `${kpi.surveillance?.taux_incident_pct || 0}%` },
  ], y);

  // Risque
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, 'Évaluation Risque', y);
  y = addKPIGrid(doc, [
    { label: 'Score risque', value: kpi.risque?.score || 0 },
    { label: 'Niveau', value: (kpi.risque?.niveau || 'faible').toUpperCase() },
  ], y);

  if (kpi.risque?.facteurs?.length > 0) {
    doc.setTextColor(...COLORS.medium as [number, number, number]);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    kpi.risque.facteurs.forEach((f: string) => {
      y = checkPageBreak(doc, y, 10);
      doc.text(`• ${f}`, 14, y);
      y += 5;
    });
  }

  addFooter(doc, 1, 1);
  doc.save(`rapport-medical-${nom.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportPdfPrescriptions(kpi: any): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = addHeader(doc, 'Rapport Prescriptions');

  // Global
  y = addSectionTitle(doc, 'Statistiques Globales', y);
  y = addKPIGrid(doc, [
    { label: 'Total prescriptions', value: kpi.global?.total || 0 },
    { label: 'Taux validation', value: `${kpi.global?.taux_validation_pct || 0}%` },
    { label: 'Délai moyen validation', value: kpi.global?.delai_moyen_validation_heures ? `${kpi.global.delai_moyen_validation_heures.toFixed(1)}h` : '-' },
    { label: 'En attente', value: kpi.global?.en_attente || 0 },
  ], y);

  // Par statut
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, 'Par statut', y);
  const statutRows = Object.entries(kpi.par_statut || {}).map(([st, cnt]) => [st, String(cnt)]);
  y = addTable(doc, ['Statut', 'Nombre'], statutRows, y);

  // Top médicaments
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, 'Top Médicaments', y);
  const medRows = (kpi.top_medicaments || []).map((m: any, i: number) => [
    `${i + 1}`, m.medicament, String(m.count),
  ]);
  y = addTable(doc, ['#', 'Médicament', 'Nb prescriptions'], medRows, y);

  // Par médecin
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, 'Par Médecin', y);
  const medecinRows = (kpi.par_medecin || []).map((m: any) => [
    m.medecin, String(m.total), String(m.validees),
  ]);
  y = addTable(doc, ['Médecin', 'Total', 'Validées'], medecinRows, y);

  addFooter(doc, 1, 1);
  doc.save(`rapport-prescriptions-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportPdfKits(kpi: any): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = addHeader(doc, 'Rapport Kits & Consommation');

  // Global
  y = addSectionTitle(doc, 'Statistiques Globales', y);
  y = addKPIGrid(doc, [
    { label: 'Total kits', value: kpi.global?.total_kits || 0 },
    { label: 'Total articles', value: kpi.global?.total_articles || 0 },
    { label: 'Moy. articles/kit', value: kpi.global?.moyenne_articles_par_kit?.toFixed(2) || 0 },
  ], y);

  // Par type
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, 'Par Type de Kit', y);
  const typeRows = Object.entries(kpi.par_type_kit || {}).map(([t, cnt]) => [t, String(cnt)]);
  y = addTable(doc, ['Type', 'Nb kits'], typeRows, y);

  // Par statut
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, 'Par Statut', y);
  const statutRows = Object.entries(kpi.par_statut || {}).map(([s, cnt]) => [s, String(cnt)]);
  y = addTable(doc, ['Statut', 'Nb kits'], statutRows, y);

  // Top patients
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, 'Top Patients Consommateurs', y);
  const patientRows = (kpi.top_patients || []).map((p: any) => [
    p.patient, String(p.kits), String(p.articles),
  ]);
  y = addTable(doc, ['Patient', 'Kits', 'Articles'], patientRows, y);

  // Évolution mensuelle
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, 'Évolution Mensuelle', y);
  const mensuelRows = (kpi.evolution_mensuelle || []).map((m: any) => [
    m.mois, String(m.kits), String(m.articles),
  ]);
  y = addTable(doc, ['Mois', 'Kits', 'Articles'], mensuelRows, y);

  addFooter(doc, 1, 1);
  doc.save(`rapport-kits-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportPdfRdvFlux(kpi: any): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = addHeader(doc, 'Rapport RDV & Flux Patients');

  // Global
  y = addSectionTitle(doc, 'Statistiques Globales', y);
  y = addKPIGrid(doc, [
    { label: 'Total RDV', value: kpi.global?.total_rdv || 0 },
    { label: 'Taux présence', value: `${kpi.global?.taux_presence_pct || 0}%` },
    { label: 'Taux absentéisme', value: `${kpi.global?.taux_absenteisme_pct || 0}%` },
    { label: 'Taux annulation', value: `${kpi.global?.taux_annulation_pct || 0}%` },
    { label: 'Durée moy. séance', value: kpi.global?.duree_moyenne_seance_minutes ? `${Math.round(kpi.global.duree_moyenne_seance_minutes)} min` : '-' },
  ], y);

  // Par statut RDV
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, 'Par Statut RDV', y);
  const rdvRows = Object.entries(kpi.par_statut_rdv || {}).map(([st, cnt]) => [st, String(cnt)]);
  y = addTable(doc, ['Statut', 'Nombre'], rdvRows, y);

  // Par statut séance
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, 'Par Statut Séance', y);
  const seanceRows = Object.entries(kpi.par_statut_seance || {}).map(([st, cnt]) => [st, String(cnt)]);
  y = addTable(doc, ['Statut séance', 'Nombre'], seanceRows, y);

  // Flux horaire
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, 'Flux Horaire', y);
  const horaireRows = Object.entries(kpi.flux_horaire || {})
    .sort((a: any, b: any) => parseInt(a[0]) - parseInt(b[0]))
    .map(([h, cnt]) => [h, String(cnt)]);
  y = addTable(doc, ['Heure', 'Nb RDV'], horaireRows, y);

  // Charge médecin
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, 'Charge par Médecin', y);
  const medecinRows = (kpi.charge_par_medecin || []).map((m: any) => [
    m.medecin, String(m.total), `${m.charges_pct}%`,
  ]);
  y = addTable(doc, ['Médecin', 'Total RDV', '% charge'], medecinRows, y);

  addFooter(doc, 1, 1);
  doc.save(`rapport-rdv-flux-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportPdfSurveillance(kpi: any): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = addHeader(doc, 'Rapport Surveillance Critique');

  // Global
  y = addSectionTitle(doc, 'Statistiques Globales', y);
  y = addKPIGrid(doc, [
    { label: 'Total surveillances', value: kpi.global?.total_surveillances || 0 },
    { label: 'Total lignes', value: kpi.global?.total_lignes || 0 },
    { label: 'Incidents détectés', value: kpi.global?.incidents_detectes || 0 },
    { label: 'Taux incident', value: `${kpi.global?.taux_incident_pct || 0}%` },
  ], y);

  // Alertes
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, 'Alertes Cliniques', y);
  y = addKPIGrid(doc, [
    { label: 'Recirculation mauvaise', value: kpi.alertes?.recirculation_mauvaise || 0 },
    { label: 'Piège bulle caillot', value: kpi.alertes?.piege_bulle_caillot || 0 },
    { label: 'Dealeur caillot', value: kpi.alertes?.dealeur_caillot || 0 },
    { label: 'Kt/V insuffisant', value: kpi.alertes?.kt_v_insuffisant || 0 },
  ], y);

  // Patients à risque
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, 'Patients à Risque', y);
  if (kpi.patients_a_risque?.length > 0) {
    const rows = kpi.patients_a_risque.map((p: any) => [
      p.patient_nom, String(p.nb_incidents), p.niveau.toUpperCase(),
    ]);
    y = addTable(doc, ['Patient', 'Nb incidents', 'Niveau'], rows, y);
  } else {
    doc.setTextColor(...COLORS.success as [number, number, number]);
    doc.setFontSize(8);
    doc.text('✓ Aucun patient à risque détecté', 14, y + 5);
    y += 12;
  }

  // Par infirmier
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, 'Par Infirmier', y);
  const infRows = (kpi.par_infirmier || []).map((inf: any) => [
    inf.infirmier, String(inf.surveillances), String(inf.incidents),
  ]);
  y = addTable(doc, ['Infirmier', 'Surveillances', 'Incidents'], infRows, y);

  addFooter(doc, 1, 1);
  doc.save(`rapport-surveillance-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportPdfPerformance(kpi: any): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = addHeader(doc, 'Rapport Performance Personnel');

  // Global
  y = addSectionTitle(doc, 'Indicateurs Globaux', y);
  y = addKPIGrid(doc, [
    { label: 'Taux validation soins', value: `${kpi.global?.taux_validation_soins_global_pct || 0}%` },
    { label: 'Charge moy. infirmier', value: kpi.global?.charge_moyenne_infirmier?.toFixed(1) || 0 },
    { label: 'Charge moy. médecin', value: kpi.global?.charge_moyenne_medecin?.toFixed(1) || 0 },
  ], y);

  // Infirmiers
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, `Infirmiers (${kpi.infirmiers?.total_actifs || 0} actifs)`, y);
  const infRows = (kpi.infirmiers?.performance || []).map((inf: any) => [
    inf.nom,
    String(inf.surveillances),
    String(inf.soins),
    String(inf.validations_soins),
    `${inf.taux_validation_pct}%`,
  ]);
  y = addTable(doc, ['Infirmier', 'Surveill.', 'Soins', 'Validés', 'Taux'], infRows, y);

  // Médecins
  y = checkPageBreak(doc, y);
  y = addSectionTitle(doc, `Médecins (${kpi.medecins?.total || 0})`, y);
  const medRows = (kpi.medecins?.performance || []).map((med: any) => [
    med.nom,
    med.specialite,
    String(med.rdv_total),
    String(med.prescriptions_total),
    String(med.prescriptions_validees),
  ]);
  y = addTable(doc, ['Médecin', 'Spécialité', 'RDV', 'Presc.', 'Validées'], medRows, y);

  addFooter(doc, 1, 1);
  doc.save(`rapport-performance-${new Date().toISOString().split('T')[0]}.pdf`);
}

// ─── EXPORT PDF HISTORIQUE PATIENT ────────────────────────────

export function exportPdfHistoriquePatient(historique: any): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const patient = historique.patient;
  const nom = `${patient?.nom || ''} ${patient?.prenom || ''}`.trim();

  let y = addHeader(doc, `Historique Complet - ${nom}`, 'Service Dialyse CHU');

  // ── Identité Patient ──────────────────────────────────────────
  y = addSectionTitle(doc, 'Identité Patient', y);

  const age = patient?.dateNaissance
    ? `${new Date().getFullYear() - new Date(patient.dateNaissance).getFullYear()} ans`
    : '-';

  y = addKPIGrid(doc, [
    { label: 'Nom complet',    value: nom },
    { label: 'Âge',           value: age },
    { label: 'N° Dossier',    value: patient?.numero_dossier || '-' },
    { label: 'Statut traitement', value: patient?.traitement_statut || '-' },
  ], y);

  // Statut archivage
  if (patient?.is_archived) {
    y = checkPageBreak(doc, y, 25);
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(10, y, doc.internal.pageSize.getWidth() - 20, 22, 2, 2, 'F');
    doc.setDrawColor(...COLORS.danger as [number, number, number]);
    doc.setLineWidth(0.5);
    doc.line(10, y, 10, y + 22);

    doc.setTextColor(...COLORS.danger as [number, number, number]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT ARCHIVÉ', 14, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.medium as [number, number, number]);
    const archivedAt = patient?.archived_at
      ? new Date(patient.archived_at).toLocaleString('fr-FR')
      : '-';
    doc.text(`Date: ${archivedAt}  |  Par: ${patient?.archived_by || '-'}  |  Motif: ${patient?.archive_motif || '-'}`, 14, y + 14);
    y += 28;
  }

  // ── Résumé Activité ───────────────────────────────────────────
  y = checkPageBreak(doc, y, 40);
  y = addSectionTitle(doc, 'Résumé Activité', y);
  y = addKPIGrid(doc, [
    { label: 'RDV',           value: historique.resume?.rendezvous    || 0 },
    { label: 'Prescriptions', value: historique.resume?.prescriptions || 0 },
    { label: 'Kits',          value: historique.resume?.kits          || 0 },
    { label: 'Séances',       value: historique.resume?.seances       || 0 },
    { label: 'Soins',         value: historique.resume?.soins         || 0 },
    { label: 'Surveillance',  value: historique.resume?.surveillance  || 0 },
  ], y);

  // ── Timeline Chronologique ────────────────────────────────────
  y = checkPageBreak(doc, y, 30);
  y = addSectionTitle(doc, `Chronologie (${Math.min((historique.timeline || []).length, 50)} événements)`, y);

  const timeline: any[] = (historique.timeline || []).slice(0, 50);

  if (timeline.length === 0) {
    doc.setTextColor(...COLORS.light as [number, number, number]);
    doc.setFontSize(8);
    doc.text('Aucun événement enregistré', 14, y + 5);
    y += 12;
  } else {
    // Tableau timeline
    const rows = timeline.map((event: any) => {
      const dateStr = event.date && new Date(event.date).getFullYear() > 1970
        ? new Date(event.date).toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })
        : 'Date inconnue';

      const typeLabel: Record<string, string> = {
        archivage:    'Archivage',
        restauration: 'Restauration',
        rendezvous:   'RDV',
        prescription: 'Prescription',
        kit:          'Kit',
        seance:       'Séance',
        soins:        'Soins',
        surveillance: 'Surveillance',
        demande_avis: "Demande d'avis",
        creation:     'Création',
      };

      return [
        dateStr,
        typeLabel[event.type] || event.type,
        String(event.titre || '').substring(0, 40),
        String(event.details || '').substring(0, 50),
      ];
    });

    y = addTable(doc, ['Date', 'Type', 'Événement', 'Détails'], rows, y);
  }

  addFooter(doc, 1, 1);
  doc.save(`historique-${nom.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
}
