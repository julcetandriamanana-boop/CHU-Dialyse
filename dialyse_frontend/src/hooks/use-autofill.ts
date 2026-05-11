import { useCallback, useMemo } from "react";
import { format } from "date-fns";
import { useAutofillStore } from "@/stores/autofill.store";

export function useAutofill() {
  const {
    currentPatient,
    currentSeance,
    currentUser,
    etablissement,
    actions,
  } = useAutofillStore();

  // ----- Patient fields -----
  const patientFields = useMemo(() => {
    if (!currentPatient) {
      return {
        nom: "",
        prenom: "",
        nomComplet: "",
        age: "",
        sexe: "",
        telephone: "",
        adresse: "",
        groupeSanguin: "",
        dateNaissance: "",
        medecinReferent: "",
      };
    }
    const {
      nom,
      prenom,
      nomComplet,
      age,
      sexe,
      telephone,
      adresse,
      groupeSanguin,
      dateNaissance,
      medecinReferent,
    } = currentPatient;
    return {
      nom: nom ?? "",
      prenom: prenom ?? "",
      nomComplet: nomComplet ?? "",
      age: age ?? "",
      sexe: sexe ?? "",
      telephone: telephone ?? "",
      adresse: adresse ?? "",
      groupeSanguin: groupeSanguin ?? "",
      dateNaissance: dateNaissance ?? "",
      medecinReferent: medecinReferent ?? "",
    };
  }, [currentPatient]);

  // ----- Seance fields -----
  const seanceFields = useMemo(() => {
    const today = format(new Date(), "dd/MM/yyyy");
    const now = format(new Date(), "HH:mm");
    if (!currentSeance) {
      return {
        date: today,
        heureDebut: now,
        infirmiere: "",
        poidsAvant: "",
        poidsRef: currentPatient?.poidsRef ?? "",
        poidsASoustraire: "",
        ufProgramme: "",
        dialyseur: "",
        anticoagulant: "",
        machine: "",
        poste: "",
        debitDialysat: "",
        conductivite: "",
        bicarbonates: "",
        temperature: "",
        numeroSeance: "",
      };
    }
    const {
      date,
      heureDebut,
      infirmiere,
      poidsAvant,
      poidsASoustraire,
      ufProgramme,
      dialyseur,
      anticoagulant,
      machine,
      poste,
      debitDialysat,
      conductivite,
      bicarbonates,
      temperature,
    } = currentSeance;
    return {
      date: date ?? today,
      heureDebut: heureDebut ?? now,
      infirmiere: infirmiere ?? "",
      poidsAvant: poidsAvant ?? "",
      poidsRef: currentPatient?.poidsRef ?? "",
      poidsASoustraire: poidsASoustraire ?? "",
      ufProgramme: ufProgramme ?? "",
      dialyseur: dialyseur ?? "",
      anticoagulant: anticoagulant ?? "",
      machine: machine ?? "",
      poste: poste ?? "",
      debitDialysat: debitDialysat ?? "",
      conductivite: conductivite ?? "",
      bicarbonates: bicarbonates ?? "",
      temperature: temperature ?? "",
      numeroSeance: currentPatient?.numeroSeance ?? "",
    };
  }, [currentSeance, currentPatient]);

  // ----- Prescription fields -----
  const prescriptionFields = useMemo(() => {
    return {
      patientNom: patientFields.nomComplet ?? "",
      patientId: currentPatient?.id ?? "",
      dateOrdonnance: format(new Date(), "dd/MM/yyyy"),
      medecin: currentUser?.nomComplet ?? "",
      service: etablissement?.service ?? "",
      dialyseur: seanceFields.dialyseur ?? "",
      anticoagulant: seanceFields.anticoagulant ?? "",
    };
  }, [patientFields, currentUser, etablissement, seanceFields]);

  // ----- Document fields -----
  const documentFields = useMemo(() => {
    return {
      nomPrenom: `${patientFields.nom ?? ""} ${patientFields.prenom ?? ""}`.trim(),
      age: patientFields.age ?? "",
      sexe: patientFields.sexe ?? "",
      poids: seanceFields.poidsRef ?? "",
      adresse: patientFields.adresse ?? "",
      service: etablissement?.service ?? "",
      dateOrdonnance: format(new Date(), "dd/MM/yyyy"),
      prescripteur: currentUser?.nomComplet ?? "",
      etablissement: etablissement?.nom ?? "",
    };
  }, [patientFields, seanceFields, etablissement, currentUser]);

  const isPatientLoaded = !!currentPatient;
  const isSeanceLoaded = !!currentSeance;

  const applyToForm = useCallback(
    (
      setValue: (name: string, value: any) => void,
      context: "patient" | "seance" | "prescription" | "document"
    ) => {
      let fields: Record<string, any> = {};
      switch (context) {
        case "patient":
          fields = patientFields;
          break;
        case "seance":
          fields = seanceFields;
          break;
        case "prescription":
          fields = prescriptionFields;
          break;
        case "document":
          fields = documentFields;
          break;
      }
      for (const [key, value] of Object.entries(fields)) {
        if (value !== "" && value !== undefined && value !== null) {
          setValue(key, value);
        }
      }
    },
    [patientFields, seanceFields, prescriptionFields, documentFields]
  );

  const onFieldChange = useCallback(
    (field: string, value: string | number) => {
      actions.updateLastKnownValue(field, value);
    },
    [actions]
  );

  return {
    patientFields,
    seanceFields,
    prescriptionFields,
    documentFields,
    isPatientLoaded,
    isSeanceLoaded,
    applyToForm,
    onFieldChange,
  };
}
