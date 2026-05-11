// Données mock pour le dashboard du module Dialyse

export const seancesAujourdhui = [
  {
    id: "S-001",
    patientId: "DX-0001",
    patientNom: "Rakoto Jean",
    patientInitiales: "RJ",
    patientCouleur: "#00478d", // Bleu pour LMV
    machine: "M01",
    poste: "Poste B-04",
    heureDebut: "08:30",
    heureFin: "12:30",
    progression: 75,
    statut: "en_cours" as const,
    dialyseFaite: false,
  },
  {
    id: "S-002",
    patientId: "DX-0002",
    patientNom: "Rasoa Marie",
    patientInitiales: "RM",
    patientCouleur: "#940010", // Orange pour MJS
    machine: "M02",
    poste: "Poste B-05",
    heureDebut: "09:00",
    heureFin: "13:00",
    progression: 100,
    statut: "termine" as const,
    dialyseFaite: true,
  },
  {
    id: "S-003",
    patientId: "DX-0003",
    patientNom: "Randria Paul",
    patientInitiales: "RP",
    patientCouleur: "#00478d", // Bleu pour LMV
    machine: "M03",
    poste: "Poste B-06",
    heureDebut: "10:00",
    heureFin: "14:00",
    progression: 0,
    statut: "planifie" as const,
    dialyseFaite: false,
  },
  {
    id: "S-004",
    patientId: "DX-0004",
    patientNom: "Rabe Hanta",
    patientInitiales: "RH",
    patientCouleur: "#940010", // Orange pour MJS
    machine: "M01",
    poste: "Poste B-07",
    heureDebut: "11:00",
    heureFin: "15:00",
    progression: 0,
    statut: "annule" as const,
    dialyseFaite: false,
  },
  {
    id: "S-005",
    patientId: "DX-0005",
    patientNom: "Razafy Luc",
    patientInitiales: "RL",
    patientCouleur: "#00478d", // Bleu pour LMV
    machine: "M02",
    poste: "Poste B-08",
    heureDebut: "12:00",
    heureFin: "16:00",
    progression: 50,
    statut: "en_cours" as const,
    dialyseFaite: false,
  },
];

export const statsJournalières = {
  totalSeances: 24,
  seancesEffectuees: 23,
  machinesDisponibles: 3,
  alertesCritiques: 2,
  prochaineMaintenance: "dans 2h",
};

export const chargeSemaine = [
  {
    jour: "Lundi" as const,
    jourCode: "LUN" as const,
    nombreSeances: 8,
    estJourDialyse: true,
    actif: true,
  },
  {
    jour: "Mardi" as const,
    jourCode: "MAR" as const,
    nombreSeances: 0,
    estJourDialyse: false,
    actif: true,
  },
  {
    jour: "Mercredi" as const,
    jourCode: "MER" as const,
    nombreSeances: 8,
    estJourDialyse: true,
    actif: true,
  },
  {
    jour: "Jeudi" as const,
    jourCode: "JEU" as const,
    nombreSeances: 0,
    estJourDialyse: false,
    actif: true,
  },
  {
    jour: "Vendredi" as const,
    jourCode: "VEN" as const,
    nombreSeances: 8,
    estJourDialyse: true,
    actif: true,
  },
  {
    jour: "Samedi" as const,
    jourCode: "SAM" as const,
    nombreSeances: 0,
    estJourDialyse: false,
    actif: false,
  },
  {
    jour: "Dimanche" as const,
    jourCode: "DIM" as const,
    nombreSeances: 0,
    estJourDialyse: false,
    actif: false,
  },
];

export const alertesCritiques = [
  {
    id: "A-001",
    type: "urgence" as const,
    message: "Hypotension sévère détectée",
    patientNom: "Rakoto Jean",
    horodatage: "10:45",
  },
  {
    id: "A-002",
    type: "maintenance" as const,
    message: "Maintenance machine M03 requise",
    horodatage: "11:30",
  },
];
