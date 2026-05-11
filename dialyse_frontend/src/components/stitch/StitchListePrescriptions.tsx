'use client';

export default function StitchListePrescriptions() {
  return (
    <div className="bg-surface text-on-surface flex min-h-screen overflow-hidden">
      {/* SideNavBar (Authority Source: JSON/Design System) */}
      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* TopNavBar (Authority Source: JSON) */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex justify-between items-center w-full px-8 h-16 fixed top-0 z-40 transition-colors shadow-sm shadow-blue-900/5 ml-0">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{}}>search</span>
              <input className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-container transition-all" placeholder="Rechercher un patient ou une prescription..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-full transition-colors active:scale-95" style={{}}>
              <span className="material-symbols-outlined" style={{}}>notifications</span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-full transition-colors active:scale-95" style={{}}>
              <span className="material-symbols-outlined" style={{}}>help</span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-full transition-colors active:scale-95" style={{}}>
              <span className="material-symbols-outlined" style={{}}>settings</span>
            </button>
          </div>
        </header>
        {/* Content Area */}
        <div className="pt-24 px-8 pb-12">
          {/* Bento Dashboard Header */}
          <div className="grid grid-cols-12 gap-6 mb-10 items-start">
            {/* Left: Title Column */}
            <div className="col-span-12 lg:col-span-5">
              <nav className="flex items-center gap-2 text-xs text-secondary font-medium mb-2">
                <span style={{}}>Vitalis Core</span>
                <span className="material-symbols-outlined text-[14px]" style={{}}>chevron_right</span>
                <span className="text-primary font-bold" style={{}}>Registre des Prescriptions</span>
              </nav>
              <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2" style={{}}>Prescriptions</h1>
              <p className="text-secondary body-md max-w-md" style={{}}>Gérez et validez les protocoles cliniques en temps réel pour l'unité de dialyse.</p>
            </div>
            {/* Right: Summary Card */}
            <div className="col-span-12 lg:col-span-7">
              <div className="bg-surface-container-low rounded-xl p-6 flex items-center justify-between relative overflow-hidden">
                <div className="relative z-10 flex flex-col">
                  <span className="text-sm font-semibold text-primary mb-1" style={{}}>Activité Totale</span>
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-5xl font-extrabold text-on-surface tracking-tighter" style={{}}>142</h2>
                    <span className="text-sm font-medium text-secondary" style={{}}>Prescriptions enregistrées</span>
                  </div>
                </div>
                {/* Nested Badges Area */}
                <div className="flex flex-wrap gap-2 justify-end max-w-xs">
                  <div className="flex flex-col items-end px-3 py-2 bg-surface-container-highest rounded-lg border-l-4 border-error/40">
                    <span className="text-[10px] uppercase font-bold text-tertiary" style={{}}>Urgences</span>
                    <span className="text-lg font-bold" style={{}}>12</span>
                  </div>
                  <div className="flex flex-col items-end px-3 py-2 bg-surface-container-highest rounded-lg border-l-4 border-blue-500/40">
                    <span className="text-[10px] uppercase font-bold text-blue-700" style={{}}>En attente</span>
                    <span className="text-lg font-bold" style={{}}>48</span>
                  </div>
                  <div className="flex flex-col items-end px-3 py-2 bg-surface-container-highest rounded-lg border-l-4 border-emerald-500/40">
                    <span className="text-[10px] uppercase font-bold text-emerald-700" style={{}}>Validées</span>
                    <span className="text-lg font-bold" style={{}}>82</span>
                  </div>
                </div>
                {/* Abstract background element */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
          {/* Main Data Table Container */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-on-surface" style={{}}>Registre des Patients</h3>
                <p className="text-xs text-secondary" style={{}}>Priorité : Actions Requises (Non-Validé)</p>
              </div>
              <div className="flex gap-3">
                <a href="/dialyses/prescriptions-validees" className="flex items-center gap-2 px-5 py-2.5 bg-secondary-container text-on-secondary-container rounded-md text-sm font-bold hover:bg-blue-100 transition-all border border-blue-200/50">
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                  ACCÉDER AUX VALIDATIONS
                </a>
              </div>
            </div>
            {/* Scrollable Table Body Container */}
            <div className="max-h-[500px] overflow-y-auto overflow-x-auto custom-scrollbar border-t border-surface-container-low">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest bg-surface-container-low" style={{}}>Patient</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest bg-surface-container-low" style={{}}>Protocole</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest bg-surface-container-low" style={{}}>Statut</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest bg-surface-container-low" style={{}}>Date de Prescription</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest text-right bg-surface-container-low" style={{}}>Actions Cliniques</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {/* Row 1 */}
                  <tr className="group hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-5" style={{}}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-error-container flex items-center justify-center text-on-error-container text-xs font-bold ring-4 ring-white" style={{}}>
                          JD
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface" style={{}}>Jean Dupont</p>
                          <p className="text-[11px] text-secondary" style={{}}>ID: #DX-9021</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5" style={{}}>
                      <p className="text-sm font-medium text-on-surface" style={{}}>Hémodialyse Haute Flux</p>
                      <p className="text-[11px] text-tertiary font-medium" style={{}}>Ajustement dose d'EPO requis</p>
                    </td>
                    <td className="px-6 py-5" style={{}}>
                      <span className="px-3 py-1 bg-error-container text-on-error-container rounded-full text-[10px] font-bold uppercase tracking-tight" style={{}}>Critique</span>
                    </td>
                    <td className="px-6 py-5" style={{}}>
                      <p className="text-sm font-medium text-on-surface" style={{}}>Il y a 2 heures</p>
                    </td>
                    <td className="px-6 py-5 text-right" style={{}}>
                      <div className="flex justify-end gap-2">
                        <button className="px-3 py-1.5 bg-surface-container-highest text-primary rounded-md text-[11px] font-bold hover:bg-primary-container hover:text-on-primary-container transition-all" type="button" onClick={() => {
                          window.location.href = "/rendez-vous";
                        }} style={{}}>Rendez-vous</button>
                        <button className="px-3 py-1.5 bg-surface-container-highest text-secondary rounded-md text-[11px] font-bold hover:bg-slate-200 transition-all" style={{}}>Archive</button>
                      </div>
                    </td>
                  </tr>
                  {/* Row 2 */}
                  <tr className="group hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-5" style={{}}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold ring-4 ring-white" style={{}}>
                          MB
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface" style={{}}>Marie Bernard</p>
                          <p className="text-[11px] text-secondary" style={{}}>ID: #DX-8842</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5" style={{}}>
                      <p className="text-sm font-medium text-on-surface" style={{}}>Anticoagulation Citrate</p>
                      <p className="text-[11px] text-secondary" style={{}}>Révision trimestrielle</p>
                    </td>
                    <td className="px-6 py-5" style={{}}>
                      <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-tight" style={{}}>En attente</span>
                    </td>
                    <td className="px-6 py-5" style={{}}>
                      <p className="text-sm font-medium text-on-surface" style={{}}>12 Oct 2023, 09:15</p>
                    </td>
                    <td className="px-6 py-5 text-right" style={{}}>
                      <div className="flex justify-end gap-2">
                        <button className="px-3 py-1.5 bg-surface-container-highest text-primary rounded-md text-[11px] font-bold hover:bg-primary-container hover:text-on-primary-container transition-all" type="button" onClick={() => {
                          window.location.href = "/rendez-vous";
                        }} style={{}}>Rendez-vous</button>
                        <button className="px-3 py-1.5 bg-surface-container-highest text-secondary rounded-md text-[11px] font-bold hover:bg-slate-200 transition-all" style={{}}>Archive</button>
                      </div>
                    </td>
                  </tr>
                  {/* Row 3 (Filler) */}
                  <tr className="group hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-5" style={{}}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center text-secondary text-xs font-bold ring-4 ring-white" style={{}}>
                          PL
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface" style={{}}>Pierre Lefevre</p>
                          <p className="text-[11px] text-secondary" style={{}}>ID: #DX-7721</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5" style={{}}>
                      <p className="text-sm font-medium text-on-surface" style={{}}>Hémodiafiltration</p>
                      <p className="text-[11px] text-secondary" style={{}}>Contrôle hebdomadaire</p>
                    </td>
                    <td className="px-6 py-5" style={{}}>
                      <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-tight" style={{}}>En attente</span>
                    </td>
                    <td className="px-6 py-5" style={{}}>
                      <p className="text-sm font-medium text-on-surface" style={{}}>11 Oct 2023, 14:30</p>
                    </td>
                    <td className="px-6 py-5 text-right" style={{}}>
                      <div className="flex justify-end gap-2">
                        <button className="px-3 py-1.5 bg-surface-container-highest text-primary rounded-md text-[11px] font-bold hover:bg-primary-container hover:text-on-primary-container transition-all" type="button" onClick={() => {
                          window.location.href = "/rendez-vous";
                        }} style={{}}>Rendez-vous</button>
                        <button className="px-3 py-1.5 bg-surface-container-highest text-secondary rounded-md text-[11px] font-bold hover:bg-slate-200 transition-all" style={{}}>Archive</button>
                      </div>
                    </td>
                  </tr>
                  {/* Row 4 (Filler) */}
                  <tr className="group hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-5" style={{}}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center text-secondary text-xs font-bold ring-4 ring-white" style={{}}>
                          SD
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface" style={{}}>Sophie Durand</p>
                          <p className="text-[11px] text-secondary" style={{}}>ID: #DX-6612</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5" style={{}}>
                      <p className="text-sm font-medium text-on-surface" style={{}}>Dialyse Péritonéale</p>
                      <p className="text-[11px] text-secondary" style={{}}>Suivi à domicile</p>
                    </td>
                    <td className="px-6 py-5" style={{}}>
                      <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-tight" style={{}}>En attente</span>
                    </td>
                    <td className="px-6 py-5" style={{}}>
                      <p className="text-sm font-medium text-on-surface" style={{}}>10 Oct 2023, 11:20</p>
                    </td>
                    <td className="px-6 py-5 text-right" style={{}}>
                      <div className="flex justify-end gap-2">
                        <button className="px-3 py-1.5 bg-surface-container-highest text-primary rounded-md text-[11px] font-bold hover:bg-primary-container hover:text-on-primary-container transition-all" type="button" onClick={() => {
                          window.location.href = "/rendez-vous";
                        }} style={{}}>Rendez-vous</button>
                        <button className="px-3 py-1.5 bg-surface-container-highest text-secondary rounded-md text-[11px] font-bold hover:bg-slate-200 transition-all" style={{}}>Archive</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Pagination / Footer */}
            <div className="p-6 bg-surface-container-low border-t border-surface-container-low flex items-center justify-between">
              <span className="text-xs text-secondary font-medium italic" style={{}}>Défilement activé pour voir l'ensemble des patients prioritaires</span>
              <div className="flex gap-2">
                <p className="text-xs text-secondary font-medium" style={{}}>Total: 4 en attente</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Contextual FAB */}
    </div>
    
  );
}
