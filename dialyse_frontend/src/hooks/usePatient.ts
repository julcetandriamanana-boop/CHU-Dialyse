'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  PatientData,
  getCurrentPatient,
  setCurrentPatient,
  clearCurrentPatient,
  setPatientFromDB,
} from '@/src/stores/patient.store';

export function usePatient() {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = getCurrentPatient();
    setPatient(current.id ? current : null);
    setLoading(false);
  }, []);

  const updatePatient = useCallback((data: Partial<PatientData>) => {
    setCurrentPatient(data);
    setPatient(prev => prev ? { ...prev, ...data } : null);
  }, []);

  const clearPatient = useCallback(() => {
    clearCurrentPatient();
    setPatient(null);
  }, []);

  return {
    patient,
    loading,
    updatePatient,
    clearPatient,
    setCurrentPatient: updatePatient,
  };
}

export function useAutoFillPatient() {
  const { patient, updatePatient } = usePatient();

  const getFieldValue = useCallback((field: keyof PatientData, defaultValue: string = ''): string => {
    if (!patient) return defaultValue;
    return patient[field] || defaultValue;
  }, [patient]);

  return {
    patient,
    getFieldValue,
    updatePatient,
  };
}
