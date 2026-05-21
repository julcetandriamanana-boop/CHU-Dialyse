'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PatientData, getCurrentPatient, setCurrentPatient } from '@/src/stores/patient.store';

const PATIENTS_DEMO: PatientData[] = [
  { id: 'DX-0001', nom: 'Ross', prenoms: 'Elena', age: '58', sexe: 'F', telephone: '0341234567', adresse: 'Lot IVC 12, Fianarantsoa', service: 'Néphrologie', poids: '72', dateNaissance: '15/03/1968', groupeSanguin: 'O+', antecedents: 'HTA, Diabète type 2', allergie: 'Pénicilline', nephrologue: 'Dr. Andrianjato', infirmiere: 'Mme. Rasoa', dernierSeance: '10/05/2026', prochaineSeance: '12/05/2026' },
  { id: 'DX-0002', nom: 'Jensen', prenoms: 'Marcus', age: '45', sexe: 'M', telephone: '0349876543', adresse: 'Antsirabe 110', service: 'Néphrologie', poids: '85', dateNaissance: '22/07/1981', groupeSanguin: 'A+', antecedents: 'Polykystose rénale', allergie: 'Aucune', nephrologue: 'Dr. Rakoto', infirmiere: 'M. Jean', dernierSeance: '09/05/2026', prochaineSeance: '12/05/2026' },
  { id: 'DX-0003', nom: 'Bernard', prenoms: 'Hélène', age: '42', sexe: 'F', telephone: '0334567890', adresse: 'Manakara 301', service: 'Néphrologie', poids: '65', dateNaissance: '03/11/1984', groupeSanguin: 'B+', antecedents: 'Glomérulonéphrite', allergie: 'Latex', nephrologue: 'Dr. Andrianjato', infirmiere: 'Mme. Lalao', dernierSeance: '11/05/2026', prochaineSeance: '14/05/2026' },
];

interface PatientSearchInputProps {
  onPatientSelected?: (patient: PatientData) => void;
  placeholder?: string;
  className?: string;
}

export default function PatientSearchInput({ onPatientSelected, placeholder = "Rechercher patient...", className = "" }: PatientSearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PatientData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = getCurrentPatient();
    if (current.id && current.nom) {
      setQuery(`${current.prenoms} ${current.nom}`);
      setSelectedPatient(current);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.length >= 1) {
      const q = value.toLowerCase();
      const found = PATIENTS_DEMO.filter(p =>
        p.nom.toLowerCase().includes(q) ||
        p.prenoms.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.telephone.includes(q)
      );
      setResults(found);
      setIsOpen(found.length > 0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleSelectPatient = (patient: PatientData) => {
    setQuery(`${patient.prenoms} ${patient.nom}`);
    setResults([]);
    setIsOpen(false);
    setSelectedPatient(patient);
    // Sauvegarder TOUTES les infos dans le store
    setCurrentPatient(patient);
    // Appeler le callback
    if (onPatientSelected) onPatientSelected(patient);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedPatient(null);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
        <input ref={inputRef} type="text" value={query} onChange={(e) => handleSearch(e.target.value)} onFocus={() => results.length > 0 && setIsOpen(true)} placeholder={placeholder} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none" />
        {query && (
          <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div ref={dropdownRef} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden max-h-64 overflow-y-auto">
            {results.map((patient) => (
              <motion.button key={patient.id} whileHover={{ backgroundColor: '#f0f7ff' }} onClick={() => handleSelectPatient(patient)} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-none">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">{patient.prenoms.charAt(0)}{patient.nom.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{patient.prenoms} {patient.nom}</p>
                  <p className="text-[10px] text-slate-400">ID: {patient.id} · {patient.age} ans · {patient.sexe}</p>
                </div>
                <span className="material-symbols-outlined text-slate-300 text-lg">arrow_forward</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedPatient && selectedPatient.id && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <div>
            <p className="text-xs font-bold text-emerald-800">{selectedPatient.prenoms} {selectedPatient.nom}</p>
            <p className="text-[10px] text-emerald-600">ID: {selectedPatient.id} · {selectedPatient.age} ans · {selectedPatient.sexe} · {selectedPatient.poids} kg</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
