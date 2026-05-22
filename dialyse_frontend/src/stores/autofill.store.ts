import { create, type StateCreator } from "zustand";
import {
  createJSONStorage,
  devtools,
  persist,
} from "zustand/middleware";
import { differenceInYears, isValid, parse, parseISO } from "date-fns";

function parseDateNaissance(value: string): Date | null {
  const iso = parseISO(value);
  if (isValid(iso)) return iso;
  const fr = parse(value, "dd/MM/yyyy", new Date());
  if (isValid(fr)) return fr;
  return null;
}

function calculateAgeFromDateNaissance(dateNaissance: string): number {
  const birth = parseDateNaissance(dateNaissance);
  if (!birth) return 0;
  return Math.max(0, differenceInYears(new Date(), birth));
}

function reconcileSeanceDerived(
  patient: AutofillState["currentPatient"],
  seance: NonNullable<AutofillState["currentSeance"]>
): NonNullable<AutofillState["currentSeance"]> {
  const poidsRef = patient?.poidsRef;
  const poidsAvant = seance.poidsAvant;
  if (
    patient == null ||
    poidsRef == null ||
    poidsAvant == null ||
    Number.isNaN(poidsRef) ||
    Number.isNaN(poidsAvant)
  ) {
    return { ...seance, poidsASoustraire: 0, ufProgramme: 0 };
  }
  const poidsASoustraire = poidsAvant - poidsRef;
  const ufProgramme = poidsASoustraire * 1000;
  return { ...seance, poidsASoustraire, ufProgramme };
}

export interface AutofillState {
  currentPatient: {
    id: string;
    nom: string;
    prenom: string;
    nomComplet: string;
    dateNaissance: string;
    age: number;
    sexe: "M" | "F";
    telephone: string;
    adresse: string;
    groupeSanguin: string;
    poidsRef: number;
    nefropathieCause: string;
    comorbidites: string[];
    typeDialyse: "HD" | "HDF";
    groupeSeance: "LMV" | "MJS";
    machine: "M01" | "M02" | "M03";
    medecinReferent: string;
    numeroSeance: number;
    dateAdmission: string;
  } | null;

  currentSeance: {
    id: string;
    date: string;
    heureDebut: string;
    infirmiere: string;
    poidsAvant: number;
    poidsASoustraire: number;
    ufProgramme: number;
    machine: string;
    poste: string;
    dialyseur: string;
    anticoagulant: string;
    debitDialysat: number;
    conductivite: number;
    bicarbonates: number;
    temperature: number;
  } | null;

  currentUser: {
    nom: string;
    prenom: string;
    nomComplet: string;
    titre: string;
    specialite: string;
    matricule: string;
    ordreNumero: string;
  } | null;

  etablissement: {
    nom: string;
    service: string;
    ville: string;
    pays: string;
  };

  lastKnownValues: Record<string, string | number | boolean>;

  actions: {
    setCurrentPatient: (patient: AutofillState["currentPatient"]) => void;
    setCurrentSeance: (seance: AutofillState["currentSeance"]) => void;
    setCurrentUser: (user: AutofillState["currentUser"]) => void;
    updateLastKnownValue: (field: string, value: string | number) => void;
    clearCurrentPatient: () => void;
    clearCurrentSeance: () => void;
    calculateAge: (dateNaissance: string) => number;
    calculatePoidsASoustraire: () => number;
    calculateUF: () => number;
    getFieldValue: (field: string) => string | number | null;
  };
}

const initialEtablissement: AutofillState["etablissement"] = {
  nom: "CHU Andrainjato",
  service: "Service d'Hémodialyse",
  ville: "Fianarantsoa",
  pays: "Madagascar",
};

const initialCurrentUser: NonNullable<AutofillState["currentUser"]> = {
  nom: "Dupont",
  prenom: "Jean",
  nomComplet: "Dr. Jean Dupont",
  titre: "Dr.",
  specialite: "Néphrologue",
  matricule: "CHU-001",
  ordreNumero: "ONM-2019-4421",
};

const slice: StateCreator<AutofillState> = (set, get) => ({
  currentPatient: null,
  currentSeance: null,
  currentUser: initialCurrentUser,
  etablissement: initialEtablissement,
  lastKnownValues: {},

  actions: {
    setCurrentPatient: (patient) => {
      set((state) => {
        if (patient === null) {
          return { currentPatient: null };
        }
        const age = patient.dateNaissance
          ? calculateAgeFromDateNaissance(patient.dateNaissance)
          : patient.age;
        const nomComplet =
          patient.nomComplet?.trim() ||
          `${patient.prenom} ${patient.nom}`.trim();
        const nextPatient = { ...patient, age, nomComplet };

        const nextSeance = state.currentSeance
          ? reconcileSeanceDerived(nextPatient, state.currentSeance)
          : null;

        return { currentPatient: nextPatient, currentSeance: nextSeance };
      });
    },

    setCurrentSeance: (seance) => {
      set((state) => {
        if (seance === null) {
          return { currentSeance: null };
        }
        const merged =
          state.currentSeance === null
            ? { ...seance }
            : ({ ...state.currentSeance, ...seance } as NonNullable<
                AutofillState["currentSeance"]
              >);
        const next = reconcileSeanceDerived(state.currentPatient, merged);
        return { currentSeance: next };
      });
    },

    setCurrentUser: (user) => set({ currentUser: user }),

    updateLastKnownValue: (field, value) =>
      set((state) => ({
        lastKnownValues: { ...state.lastKnownValues, [field]: value },
      })),

    clearCurrentPatient: () => set({ currentPatient: null }),

    clearCurrentSeance: () => set({ currentSeance: null }),

    calculateAge: (dateNaissance) =>
      calculateAgeFromDateNaissance(dateNaissance),

    calculatePoidsASoustraire: () => {
      const { currentPatient, currentSeance } = get();
      if (
        !currentPatient ||
        currentSeance == null ||
        currentPatient.poidsRef == null ||
        currentSeance.poidsAvant == null
      ) {
        return 0;
      }
      return currentSeance.poidsAvant - currentPatient.poidsRef;
    },

    calculateUF: () => {
      return get().actions.calculatePoidsASoustraire() * 1000;
    },

    getFieldValue: (field) => {
      const {
        lastKnownValues,
        currentPatient,
        currentSeance,
        currentUser,
        etablissement,
      } = get();

      if (currentPatient && field in currentPatient) {
        const v = currentPatient[field as keyof typeof currentPatient];
        if (typeof v === "string" || typeof v === "number") return v;
      }

      if (currentSeance && field in currentSeance) {
        const v = currentSeance[field as keyof typeof currentSeance];
        if (typeof v === "string" || typeof v === "number") return v;
      }

      if (currentUser && field in currentUser) {
        const v = currentUser[field as keyof typeof currentUser];
        if (typeof v === "string" || typeof v === "number") return v;
      }

      if (field in etablissement) {
        return etablissement[field as keyof typeof etablissement];
      }

      const lk = lastKnownValues[field];
      if (lk !== undefined && lk !== "" && typeof lk !== "boolean") {
        return lk as string | number;
      }

      return null;
    },
  },
});

const noopStorage: Storage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  key: () => null,
  length: 0,
};

const persistOptions = {
  name: "sih-autofill",
  storage: createJSONStorage(() =>
    typeof window !== "undefined" ? localStorage : noopStorage
  ),
  partialize: (state: AutofillState) => ({
    currentPatient: state.currentPatient,
    currentSeance: state.currentSeance,
    currentUser: state.currentUser,
    etablissement: state.etablissement,
    lastKnownValues: state.lastKnownValues,
  }),
  merge: (persistedState: any, currentState: AutofillState) => {
    const p = persistedState as Partial<AutofillState> | undefined;
    return {
      ...currentState,
      ...p,
      etablissement: initialEtablissement,
      actions: currentState.actions,
    };
  },
} as const;

const persistedSlice = persist(slice, persistOptions);

const isDev =
  typeof process !== "undefined" && process.env.NODE_ENV === "development";

export const useAutofillStore = create<AutofillState>()(
  devtools(persistedSlice, {
    name: "SIH-autofill-store",
    enabled: typeof window !== "undefined" ? isDev : false,
  })
);
