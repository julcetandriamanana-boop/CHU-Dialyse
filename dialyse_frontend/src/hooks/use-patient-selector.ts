"use client";

import { useCallback } from "react";
import { parse } from "date-fns";
import { mockPatients } from "@/data/mock/patients";
import { mockSeances } from "@/data/mock/seances";
import { useAutofillStore } from "@/stores/autofill.store";

function sessionTimestamp(
  ms: Pick<(typeof mockSeances)[number], "date" | "heureDebut">
): number {
  const d = parse(ms.date, "dd/MM/yyyy", new Date());
  const [hRaw, minRaw] = ms.heureDebut.split(":").map((x) => Number.parseInt(x, 10));
  const h = Number.isFinite(hRaw) ? hRaw : 0;
  const mi = Number.isFinite(minRaw) ? minRaw : 0;
  const t = new Date(d);
  t.setHours(h, mi, 0, 0);
  return t.getTime();
}

export function usePatientSelector() {
  const currentPatient = useAutofillStore((s) => s.currentPatient);

  const selectedPatientId = currentPatient?.id ?? null;
  const hasActivePatient = currentPatient != null;

  const selectPatient = useCallback((patientId: string): boolean => {
    const mock = mockPatients.find((p) => p.id === patientId);
    if (!mock) return false;

    const api = useAutofillStore.getState();
    const age = api.actions.calculateAge(mock.dateNaissance);
    const nomComplet = `${mock.prenom} ${mock.nom}`.trim();

    api.actions.setCurrentPatient({
      ...mock,
      nomComplet,
      age,
    });

    const list = mockSeances.filter((s) => s.patientId === patientId);
    if (list.length === 0) {
      api.actions.setCurrentSeance(null);
      return true;
    }

    const latest = [...list].sort(
      (a, b) => sessionTimestamp(b) - sessionTimestamp(a)
    )[0];

    const { patientId: _pid, ...seanceSlice } = latest;

    api.actions.setCurrentSeance(seanceSlice);
    return true;
  }, []);

  const openPatientDossier = useCallback((patientId: string) => {
    selectPatient(patientId);
  }, [selectPatient]);

  const clearSelection = useCallback(() => {
    const api = useAutofillStore.getState();
    api.actions.clearCurrentPatient();
    api.actions.clearCurrentSeance();
  }, []);

  return {
    selectedPatientId,
    selectPatient,
    openPatientDossier,
    clearSelection,
    hasActivePatient,
  };
}
