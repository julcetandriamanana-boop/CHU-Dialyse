'use client';

import { useMemo, useState } from "react";

const VALIDATED_PRESCRIPTIONS_STORAGE_KEY = "dialyse_validated_prescriptions";
const APPOINTMENTS_STORAGE_KEY = "dialysisAppointments";

type ValidatedPrescription = {
  id: string;
  type: "rendez-vous";
  patientName: string;
  patientId: string;
  validatedAt: string;
  details: Record<string, string>;
};

export default function StitchNouveauRendezVous() {
  const [patientName, setPatientName] = useState("");
  const [selectedDay, setSelectedDay] = useState(12);
  const [selectedSlot, setSelectedSlot] = useState("Matin");
  const [selectedMachine, setSelectedMachine] = useState("Machine #02");
  const selectedDate = useMemo(() => `${selectedDay.toString().padStart(2, "0")} Octobre 2024`, [selectedDay]);
  const appointmentTime = selectedSlot === "Matin" ? "07:00 - 11:00" : selectedSlot === "Après-midi" ? "12:00 - 16:00" : "16:30 - 20:30";
  const appointmentSummary = `Séance ${selectedSlot} sur ${selectedMachine} (${appointmentTime}).`;

  const saveValidatedAppointment = () => {
    const validatedAt = new Date();
    const patientId = `RDV-${validatedAt.getTime().toString().slice(-6)}`;
    const normalizedPatientName = patientName.trim() || "Patient a completer";
    const appointment = {
      id: `rdv-${validatedAt.getTime()}`,
      patientName: normalizedPatientName,
      patientId,
      protocol: "",
      prescriptionDate: "",
      day: String(selectedDay),
      displayDate: selectedDate,
      slotLabel: selectedSlot,
      timeRange: appointmentTime,
      device: selectedMachine.replace("#", ""),
      machine: selectedMachine,
      status: "Valide",
      validationStatus: "Rendez-vous valide",
      createdAt: validatedAt.toLocaleString("fr-FR"),
      validatedAt: validatedAt.toISOString(),
    };
    const nextPrescription: ValidatedPrescription = {
      id: appointment.id,
      type: "rendez-vous",
      patientName: patientName.trim() || "Patient non renseigné",
      patientId: appointment.patientId,
      validatedAt: appointment.validatedAt,
      details: {
        date: appointment.displayDate,
        creneau: appointment.timeRange,
        periode: appointment.slotLabel,
        appareil: appointment.device,
        machine: appointment.machine,
        statut: "RDV OK",
        summary: appointmentSummary,
      },
    };

    const savedPrescriptions = JSON.parse(
      window.localStorage.getItem(VALIDATED_PRESCRIPTIONS_STORAGE_KEY) || "[]"
    ) as ValidatedPrescription[];

    const savedAppointments = JSON.parse(
      window.localStorage.getItem(APPOINTMENTS_STORAGE_KEY) || "[]"
    );
    window.localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify([appointment, ...savedAppointments]));
    window.localStorage.setItem("latestDialysisAppointment", JSON.stringify(appointment));
    window.localStorage.setItem("currentPatient", JSON.stringify({
      name: appointment.patientName,
      id: appointment.patientId,
      protocol: appointment.protocol,
      prescriptionDate: appointment.prescriptionDate,
      rdvDate: appointment.displayDate,
      rdvTime: appointment.timeRange,
      rdvMachine: appointment.machine,
      rdvDevice: appointment.device,
      rdvStatus: appointment.validationStatus,
      latestAppointmentId: appointment.id,
    }));
    window.localStorage.setItem(
      VALIDATED_PRESCRIPTIONS_STORAGE_KEY,
      JSON.stringify([nextPrescription, ...savedPrescriptions])
    );
    window.location.href = "/dialyses/prescriptions-validees";
  };

  return (
    <div className="bg-background text-on-surface overflow-hidden">
      <div className="flex h-screen w-full">
        {/* SideNavBar */}
        <aside className="flex-none h-screen w-64 bg-slate-50 dark:bg-slate-950 flex flex-col p-4 space-y-2 bg-gradient-to-r from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 border-r border-outline-variant/15">
          <div className="mb-8 px-2 flex items-center gap-3"><div className="flex items-center gap-3">
              <img alt="CHU Andrainjato Logo" className="w-12 h-12 object-contain" src="https://lh3.googleusercontent.com/aida/ADBb0uiGy8ScMjL6ZLQy7_SbLYlroJWfo78U1O4eeUMeLWpk2HKguGLGHHLChg1RlUhL5-GvJCkZZWJlDOGm1m0pJ-0gDFnkYrfag2UyCyUZclqEkh1ioIClAiyD5we9kq9xabonQTSOjhWFFTLF14LONOkKdpIjyyRMSMn5HDfVRrU4TD8nV9Gf9r_hXLUjFBYdKhV4HZwBuWMJuGmxbqw6ceHnNcWyCNRuN-PilD2vmd6ZIvO5-zBnWKhp-bAtrIxsE3YijfC_SbrT5A" />
              <div>
                <h2 className="font-headline font-black text-blue-900 dark:text-blue-100 leading-tight">CHU Andrainjato</h2>
                <p className="text-xs text-slate-500 font-medium">Nephrology Dept.</p>
              </div>
            </div></div>
          <nav className="flex-1 space-y-1">
            <a className="flex items-center px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100/50 transition-all duration-300 font-headline text-sm font-medium" href="#">
              <span className="material-symbols-outlined mr-3">grid_view</span>
              Tableau de bord
            </a><a className="flex items-center px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100/50 transition-all duration-300 font-headline text-sm font-medium" href="#">
              <span className="material-symbols-outlined mr-3">assignment_late</span>
              Demandes d'avis
            </a>
            <a className="flex items-center px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100/50 transition-all duration-300 font-headline text-sm font-medium" href="#">
              <span className="material-symbols-outlined mr-3">group</span>
              Liste des prescriptions
            </a>
            <a className="flex items-center px-3 py-2.5 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-sm rounded-lg transition-all duration-300 font-headline text-sm font-medium" href="#">
              <span className="material-symbols-outlined mr-3">calendar_today</span>
              Rendez-vous
            </a>
            <a className="flex items-center px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100/50 transition-all duration-300 font-headline text-sm font-medium" href="#">
              <span className="material-symbols-outlined mr-3">archive</span>
              Archives
            </a>
            <a className="flex items-center px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100/50 transition-all duration-300 font-headline text-sm font-medium" href="#">
              <span className="material-symbols-outlined mr-3">analytics</span>
              Rapport
            </a>
          </nav>
          <div className="pt-4 border-t border-outline-variant/15 space-y-1">
            <a className="flex items-center px-3 py-2 text-slate-600 hover:text-blue-600 transition-all font-headline text-sm" href="#">
              <span className="material-symbols-outlined mr-3">settings</span>
              Paramètres
            </a>
            <a className="flex items-center px-3 py-2 text-slate-600 hover:text-tertiary transition-all font-headline text-sm" href="#">
              <span className="material-symbols-outlined mr-3">logout</span>
              Déconnexion
            </a>
          </div>
        </aside>
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* TopNavBar */}
          <header className="fixed top-0 right-0 left-64 z-50 flex justify-between items-center px-6 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm shadow-blue-900/5 border-b-0">
            <div className="flex items-center gap-4">
              <h1 className="font-manrope tracking-tight headline-md text-2xl font-bold tracking-tighter text-blue-800 dark:text-blue-300">DialysisFlow</h1>
              <div className="h-6 w-px bg-outline-variant/20 mx-2" />
              <span className="text-slate-500 font-medium font-headline">Gestion des Rendez-vous</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-slate-400">search</span>
                <input className="pl-10 pr-4 py-1.5 bg-surface-container-low border-none rounded-full text-sm focus:ring-2 focus:ring-primary w-64" placeholder="Rechercher un dossier..." type="text" />
              </div>
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-slate-500 hover:bg-blue-50/50 p-2 rounded-full cursor-pointer transition-colors">notifications</span>
                <span className="material-symbols-outlined text-slate-500 hover:bg-blue-50/50 p-2 rounded-full cursor-pointer transition-colors">help_outline</span>
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-outline-variant/20">
                  <img alt="Dr. Claire V." className="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFTSa_IJpR5YMItEDyAOI19MhG8DmI0b2EYae678Ad04s4cPUmXlLk-zBLfgKuh7aVf54YkdMMt1xO1sutxo_06b2PLR-JD6uv73C9R38gzVMwMZmT6F0TgLBap7ipUngtRdnucJ2bKox2JfqxzE78cJK3KW0JPh3eNra_vQqq2_6XnRsaasaAbUspQvQsgxGzc-z_Y7xLkSF02fbDrST7TDxR6d8qt6nF6o46hpEJKxRpDaSXm-L4Cnr_h973ZDK975ElBZSSlhi5" />
                  <span className="text-sm font-semibold text-on-surface">Dr. Claire V.</span>
                </div>
              </div>
            </div>
          </header>
          {/* Underlying Calendar Page Content (Blurred/Dimmed) */}
          <div className="mt-16 p-8 flex-1 overflow-auto opacity-40 blur-[2px] select-none pointer-events-none">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-headline font-extrabold text-on-surface">Calendrier Hebdomadaire</h2>
                <p className="text-slate-500">Unité de Dialyse - Étage 2</p>
              </div>
              <div className="flex bg-surface-container-high rounded-md p-1">
                <button className="px-4 py-1.5 text-sm font-medium rounded">Jour</button>
                <button className="px-4 py-1.5 text-sm font-medium bg-white shadow-sm rounded">Semaine</button>
                <button className="px-4 py-1.5 text-sm font-medium rounded">Mois</button>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-0 bg-white rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
              <div className="col-span-1 bg-surface-container-low border-r border-outline-variant/10">
                <div className="h-16 flex items-center justify-center font-bold text-slate-400">HEURE</div>
                <div className="h-24 border-t border-outline-variant/5" />
              </div>
              <div className="col-span-5 border-t border-outline-variant/5" />
            </div>
          </div>
          {/* MODAL OVERLAY */}
          <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-[4px] z-[60] flex items-center justify-center p-6 overflow-y-auto">
            {/* Simplified Appointment Selection Modal */}
            <div className="bg-surface-container-lowest w-full max-w-5xl max-h-[calc(100vh-3rem)] rounded-xl shadow-2xl overflow-hidden border border-white/40 flex flex-col animate-in fade-in zoom-in duration-300">
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-outline-variant/10 bg-surface-bright flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">add_circle</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-headline font-bold text-on-surface">Nouveau Rendez-vous</h3>
                    <p className="text-sm text-on-surface-variant">Planifier une séance de dialyse</p>
                  </div>
                </div>
                <button id="closeAppointmentButton" className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                  <span className="material-symbols-outlined text-slate-400">close</span>
                </button>
              </div>
              <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Left Panel: Patient & Date Picker (Same as original) */}
                <div className="w-80 p-8 border-r border-outline-variant/10 space-y-8 overflow-y-auto">
                  {/* Patient Search */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 headline tracking-tight">Patient concerné</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">person_search</span>
                      <input id="appointmentPatientInput" className="w-full pl-10 pr-4 py-2.5 bg-surface-container border-none rounded-md text-sm focus:ring-2 focus:ring-primary transition-all" placeholder="Nom ou dossier" type="text" value={patientName} onChange={(event) => setPatientName(event.target.value)} />
                    </div>
                  </div>
                  {/* Mini Interactive Calendar */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-sm font-bold text-slate-700 headline tracking-tight">Date du soin</label>
                      <div className="flex gap-1">
                        <button className="p-1 hover:bg-surface-container rounded transition-colors"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                        <button className="p-1 hover:bg-surface-container rounded transition-colors"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
                      </div>
                    </div>
                    <div className="text-center mb-2">
                      <span id="appointmentMonthLabel" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{selectedDate}</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      <div className="text-[9px] font-bold text-slate-400 mb-1">L</div>
                      <div className="text-[9px] font-bold text-slate-400 mb-1">M</div>
                      <div className="text-[9px] font-bold text-slate-400 mb-1">M</div>
                      <div className="text-[9px] font-bold text-slate-400 mb-1">J</div>
                      <div className="text-[9px] font-bold text-slate-400 mb-1">V</div>
                      <div className="text-[9px] font-bold text-slate-400 mb-1">S</div>
                      <div className="text-[9px] font-bold text-slate-400 mb-1">D</div>
                      {/* Calendar days... */}
                      <div className="h-7 flex items-center justify-center text-[11px] text-slate-300">25</div>
                      <div className="h-7 flex items-center justify-center text-[11px] text-slate-300">26</div>
                      <div className="h-7 flex items-center justify-center text-[11px] text-slate-300">27</div>
                      <div className="h-7 flex items-center justify-center text-[11px] text-slate-300">28</div>
                      <div className="h-7 flex items-center justify-center text-[11px] text-slate-300">29</div>
                      <div className="h-7 flex items-center justify-center text-[11px] text-slate-300">30</div>
                      {Array.from({ length: 15 }, (_, index) => index + 1).map((day) => (
                        <button key={day} type="button" data-day={day} onClick={() => setSelectedDay(day)} className={`appointment-day h-7 flex items-center justify-center text-[11px] font-medium cursor-pointer rounded-md transition-colors ${selectedDay === day ? "bg-primary text-white" : "hover:bg-primary-fixed"}`}>{day}</button>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Right Panel: Suggested Slots (NEW Simplified Interface) */}
                <div className="flex-1 p-8 bg-surface-container-low/50 flex flex-col gap-8 overflow-y-auto">
                  <section className="space-y-4">
                    <label id="appointmentSlotsLabel" className="text-sm font-bold text-slate-700 headline tracking-tight">Créneaux Disponibles ({selectedDay} Oct)</label>
                    <div id="slotsContainer" className="grid grid-cols-2 gap-4">
                      {["Matin", "Après-midi", "Soir"].map((slot) => (
                        <button key={slot} type="button" onClick={() => setSelectedSlot(slot)} className={`rounded-lg border p-4 text-left transition-all ${selectedSlot === slot ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-outline-variant/15 bg-white text-slate-600 hover:border-primary/40"}`}>
                          <span className="block text-sm font-bold">{slot}</span>
                          <span className="text-[11px]">{slot === "Matin" ? "07:00 - 11:00" : slot === "Après-midi" ? "12:00 - 16:00" : "16:30 - 20:30"}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                  {/* Device Selection Grid (Contextual to Selected Slot) */}
                  <section className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-sm font-bold text-slate-700 headline tracking-tight">Assignation de l'appareil de dialyse</label>
                      <div className="flex gap-4 mb-1"><div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase" id="availableMachinesCount">3 / 3 APPAREILS</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Sélectionné</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Occupé</span>
                        </div></div>
                    </div>
                    <div className="grid gap-3 grid-cols-3">{/* Machine 01 */}
                      <button type="button" onClick={() => setSelectedMachine("Machine #01")} className={`appointment-device p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${selectedMachine === "Machine #01" ? "bg-primary/10 border-2 border-primary shadow-sm" : "bg-white border border-outline-variant/15 hover:border-primary/50 hover:bg-slate-50"}`} data-device="Machine 01" data-machine="Machine #01">
                        <span className="material-symbols-outlined text-slate-500">precision_manufacturing</span>
                        <span className="text-[11px] font-bold text-slate-500">Machine 01</span>
                      </button>
                      {/* Machine 02 (Sélectionné) */}
                      <button type="button" onClick={() => setSelectedMachine("Machine #02")} className={`appointment-device p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${selectedMachine === "Machine #02" ? "bg-primary/10 border-2 border-primary shadow-sm" : "bg-white border border-outline-variant/15 hover:border-primary/50 hover:bg-slate-50"}`} data-device="Machine 02" data-machine="Machine #02">
                        <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: '"FILL" 1'}}>precision_manufacturing</span>
                        <span className="text-[11px] font-bold text-primary">Machine 02</span>
                      </button>
                      {/* Machine 03 */}
                      <button type="button" onClick={() => setSelectedMachine("Machine #03")} className={`appointment-device p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${selectedMachine === "Machine #03" ? "bg-primary/10 border-2 border-primary shadow-sm" : "bg-white border border-outline-variant/15 hover:border-primary/50 hover:bg-slate-50"}`} data-device="Machine 03" data-machine="Machine #03">
                        <span className="material-symbols-outlined text-slate-500">precision_manufacturing</span>
                        <span className="text-[11px] font-bold text-slate-500">Machine 03</span>
                      </button></div>
                    <div id="occupiedMachinesWarning" className="hidden bg-rose-50 border border-rose-200 rounded-lg p-3 mt-2" />
                  </section>
                  <div className="mt-auto bg-blue-50/50 p-4 rounded-lg border border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-blue-600">info</span>
                      <div id="appointmentSummary" className="text-xs text-blue-800">
                        Résumé : Séance <strong>Matin</strong> sur <strong>Machine 02</strong> (07:00 - 11:00).
                      </div>
                    </div>
                    <button id="appointmentDetailsButton" type="button" className="px-3 py-1 bg-white text-[11px] font-bold text-blue-800 border border-blue-200 rounded hover:bg-blue-50 transition-colors">Détails</button>
                  </div>
                  <div id="appointmentDetailsPanel" className="hidden bg-white border border-blue-100 rounded-lg p-3 text-[11px] text-blue-900 leading-relaxed">
                    Patient, date, créneau et appareil seront enregistrés dans les rendez-vous puis affichés dans les prescriptions validées.
                  </div>
                </div>
              </div>
              {/* Modal Footer */}
              <div className="px-8 py-6 bg-white border-t border-outline-variant/10 flex justify-end items-center gap-4">
                <button id="cancelAppointmentButton" className="px-6 py-2.5 text-sm font-headline font-bold text-slate-500 hover:bg-slate-50 rounded-md transition-colors">
                  Annuler
                </button>
                <button id="validateAppointmentButton" type="button" onClick={saveValidatedAppointment} className="px-8 py-2.5 bg-primary text-white text-sm font-headline font-bold rounded-md shadow-lg shadow-primary/30 flex items-center gap-2 hover:bg-primary-container transition-all">
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  Valider le Rendez-vous
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    
  );
}
