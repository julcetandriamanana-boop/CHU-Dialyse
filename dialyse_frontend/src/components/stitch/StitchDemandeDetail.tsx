'use client';

import { useState } from "react";

const VALIDATED_PRESCRIPTIONS_STORAGE_KEY = "dialyse_validated_prescriptions";

export default function StitchDemandeDetail() {
  const [specialistComment, setSpecialistComment] = useState("");

  const acceptRequest = () => {
    const savedPrescriptions = JSON.parse(
      window.localStorage.getItem(VALIDATED_PRESCRIPTIONS_STORAGE_KEY) || "[]"
    );

    window.localStorage.setItem(
      VALIDATED_PRESCRIPTIONS_STORAGE_KEY,
      JSON.stringify([
        {
          id: `AVIS-${Date.now()}`,
          type: "demande d'avis",
          patientName: "Mme. Hélène Bernard",
          patientId: "#DR-8821",
          validatedAt: new Date().toISOString(),
          details: {
            motif: "Suspicion de syndrome de déséquilibre de dialyse",
            diagnostic: "Oedème Cérébral Osmotique",
            priorite: "Urgent",
            commentaire: specialistComment.trim() || "Validation spécialiste sans commentaire ajouté.",
          },
        },
        ...savedPrescriptions,
      ])
    );
    window.location.href = "/dialyses/prescriptions-validees";
  };

  return (
    <div className="bg-background text-on-surface font-body antialiased">
      {/* SideNavBar Shell */}
      {/* TopAppBar Shell */}
      <header className="fixed top-0 right-0 left-72 h-20 z-40 bg-white/80 backdrop-blur-xl flex justify-between items-center px-10 w-full shadow-sm shadow-blue-900/5">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-secondary hover:text-primary transition-colors group" style={{}}>
            <span className="material-symbols-outlined text-xl transition-transform group-hover:-translate-x-1" style={{}}>arrow_back</span>
            <span className="font-semibold text-sm" style={{}}>Retour</span>
          </button>
          <div className="h-6 w-px bg-outline-variant/30 mx-2" />
          <h2 className="text-on-surface font-headline font-bold text-lg" style={{}}>Détails de la demande #DR-8821</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 hover:bg-blue-50 rounded-full p-2 cursor-pointer transition-colors" style={{}}>notifications</span>
            <span className="material-symbols-outlined text-slate-400 hover:bg-blue-50 rounded-full p-2 cursor-pointer transition-colors" style={{}}>chat_bubble</span>
            <span className="material-symbols-outlined text-slate-400 hover:bg-blue-50 rounded-full p-2 cursor-pointer transition-colors" style={{}}>settings</span>
          </div>
          <div className="flex items-center gap-3 pl-6 border-l border-outline-variant/30">
            <div className="text-right">
              <p className="text-sm font-bold text-on-surface" style={{}}>Dr. Julian Vance</p>
              <p className="text-xs text-secondary" style={{}}>Neurologue Senior</p>
            </div>
            <img className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" data-alt="professional portrait of a male doctor in a white clinical coat with a friendly and confident expression" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfn4DEf-DB7xPGQXQCeEeUutFK75Vv3iNperTVvHVLK9jDJISrkjZkvg41qGY1VQm0ecS902bDiqKr49BzJJoJskkjd0f_yb_2GKGiK0L3JE64n4hMmxNLDpX6uZ2d40boJ9f5eGjcaE1GRaAI5m43JkHwTDU-4jDL2G-RK00LMesp79QT5XVFkbcpTENPi_ckDKjx6IJnq6x08fkB73zS5gIQichRf4dN49D_QSyWaFohBVbVaw6YDNPyJHXOrlBdB_XqwFieK7qm" style={{}} />
          </div>
        </div>
      </header>
      {/* Main Content Canvas */}
      <main className="pt-20 min-h-screen p-10 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column: Patient & Clinical Info */}
            <div className="col-span-8 flex flex-col gap-8">
              {/* Patient Info Card */}
              <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex gap-6 items-center">
                    <div className="w-20 h-20 rounded-2xl bg-secondary-container flex items-center justify-center overflow-hidden">
                      <img className="w-full h-full object-cover" data-alt="portrait of an elderly woman with silver hair and gentle features, looking towards the camera in soft daylight" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRW44-CZxq6kkLJpi9yq4dvd2VsT_ANKnTXExe15JqfTpqYvYlAEdRO1wEOrB90CdwPVQGvGiCcJHPP82cxHL1sJ8RIK3bXJM01nWmEUAC655aMrGz2-vscdA9KUGXl07P9JqH5aN7DBleWg1jUQIsSjOXANXcaKKGubrCLHKLJZEzyRXsNed8jIGw950v7c359bYC9YiUC2y13QkEOq_O1IehAWlqwXr9_cC_HReXD0jzdR7xXyWAme_IDjxLekWuUxH-kHlx9WCS" style={{}} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-headline font-extrabold text-on-surface" style={{}}>Mme. Hélène Bernard</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-medium text-secondary" style={{}}>ID: 992-001-44</span>
                        <span className="w-1 h-1 bg-outline-variant rounded-full" />
                        <span className="text-sm font-medium text-secondary" style={{}}>72 ans</span>
                        <span className="w-1 h-1 bg-outline-variant rounded-full" />
                        <span className="text-sm font-medium text-secondary" style={{}}>Féminin</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider" style={{}}>
                    Urgent
                  </div>
                </div>
                <div className="bg-surface-container-low rounded-lg p-6">
                  <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3" style={{}}>Résumé des antécédents</h4>
                  <p className="text-on-surface leading-relaxed text-sm" style={{}}>
                    Hypertension artérielle chronique depuis 15 ans. Diabète de type 2 équilibré. Insuffisance rénale chronique stade 4 (DFG 22 ml/min). Pas d'antécédents neurologiques majeurs rapportés. Début récent de confusion fluctuante post-séance de dialyse.
                  </p>
                </div>
              </section>
              {/* Request Details Card */}
              <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary" style={{}}>clinical_notes</span>
                  <h3 className="text-lg font-headline font-bold" style={{}}>Détails de la demande de consultation</h3>
                </div>
                <div className="grid grid-cols-1 gap-8">
                  <div>
                    <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-2" style={{}}>Motif de la demande</h4>
                    <p className="text-on-surface text-base font-medium" style={{}}>Suspicion de syndrome de déséquilibre de dialyse (SDD) avec épisodes de confusion aiguë et céphalées intenses.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-1" style={{}}>Diagnostic suspecté</h4>
                        <span className="inline-block bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-md text-sm font-semibold" style={{}}>Oedème Cérébral Osmotique</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-1" style={{}}>Observations cliniques</h4>
                        <ul className="text-sm text-on-surface-variant space-y-2">
                          <li className="flex items-start gap-2" style={{}}>
                            <span className="material-symbols-outlined text-[10px] mt-1 text-primary" style={{}}>circle</span>
                            Désorientation spatio-temporelle post-traitement.
                          </li>
                          <li className="flex items-start gap-2" style={{}}>
                            <span className="material-symbols-outlined text-[10px] mt-1 text-primary" style={{}}>circle</span>
                            Nausées et vomissements cycliques.
                          </li>
                          <li className="flex items-start gap-2" style={{}}>
                            <span className="material-symbols-outlined text-[10px] mt-1 text-primary" style={{}}>circle</span>
                            TA: 165/95 mmHg à la sortie de séance.
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-surface-container-low rounded-lg p-5">
                      <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4" style={{}}>Résultats Biologiques Clés</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                          <span className="text-sm text-on-surface-variant" style={{}}>Urée Sérique</span>
                          <span className="text-sm font-bold text-tertiary" style={{}}>32.4 mmol/L</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                          <span className="text-sm text-on-surface-variant" style={{}}>Sodium (Na+)</span>
                          <span className="text-sm font-bold" style={{}}>142 mEq/L</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                          <span className="text-sm text-on-surface-variant" style={{}}>Créatinine</span>
                          <span className="text-sm font-bold text-tertiary" style={{}}>580 µmol/L</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-on-surface-variant" style={{}}>Kaliémie (K+)</span>
                          <span className="text-sm font-bold" style={{}}>4.2 mEq/L</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            {/* Right Column: Decision & Summary */}
            <div className="col-span-4 flex flex-col gap-8">
              {/* Decision Section */}
              <section className="glass-panel sticky top-28 rounded-xl p-8 border border-outline-variant/20 shadow-xl shadow-blue-900/5">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: '"FILL" 1'}}>rate_review</span>
                  <h3 className="text-lg font-headline font-bold" style={{}}>Décision Spécialiste</h3>
                </div>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-secondary uppercase tracking-widest" htmlFor="comment" style={{}}>Commentaire du Spécialiste *</label>
                    <textarea className="w-full bg-surface-container-highest border-none rounded-md focus:ring-2 focus:ring-primary-container text-sm placeholder:text-outline p-4" id="comment" placeholder="Indiquez vos recommandations ou motifs d'acceptation/refus..." required rows={6} value={specialistComment} onChange={(event) => setSpecialistComment(event.target.value)} />
                  </div>
                  <div className="flex flex-col gap-3">
                    <button className="w-full py-4 bg-gradient-to-br from-[#006e33] to-[#004b23] text-white rounded-md font-bold text-sm shadow-lg shadow-green-900/20 hover:opacity-90 transition-all flex items-center justify-center gap-2" type="button" onClick={acceptRequest} style={{}}>
                      <span className="material-symbols-outlined" style={{}}>check_circle</span> Accept Request
                    </button>
                    <button className="w-full py-4 border-2 border-tertiary text-tertiary rounded-md font-bold text-sm hover:bg-tertiary/5 transition-all flex items-center justify-center gap-2" type="button" style={{}}>
                      <span className="material-symbols-outlined" style={{}}>cancel</span> Refuse Request
                    </button>
                  </div>
                  <p className="text-[11px] text-center text-slate-400 italic" style={{}}>
                    Une notification sera envoyée immédiatement au service de néphrologie émetteur.
                  </p>
                </form>
              </section>
              {/* Summary Widget */}
              <div className="bg-surface-container-low rounded-xl p-6">
                <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4" style={{}}>Informations supplémentaires</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-lg" style={{}}>calendar_today</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-secondary leading-none uppercase" style={{}}>Date de demande</p>
                      <p className="text-sm font-bold" style={{}}>Aujourd'hui, 09:42</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-lg" style={{}}>local_hospital</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-secondary leading-none uppercase" style={{}}>Service Émetteur</p>
                      <p className="text-sm font-bold" style={{}}>Unité de Dialyse A</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-lg" style={{}}>person</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-secondary leading-none uppercase" style={{}}>Médecin Référent</p>
                      <p className="text-sm font-bold" style={{}}>Dr. Sarah Méline</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    
  );
}
