'use client';

export default function StitchDashboard() {
  return (
    <div className="bg-background text-on-background min-h-screen">
      {/* SideNavBar */}
      <main className="min-h-screen">
        {/* TopNavBar */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl w-full flex justify-between items-center px-6 py-3 shadow-sm border-b border-slate-200/50">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" style={{}}>search</span>
              <input className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary" placeholder="Rechercher patients ou séances..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-full transition-colors relative" style={{}}>
              <span className="material-symbols-outlined" data-icon="notifications" style={{fontVariationSettings: '"FILL" 1'}}>notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-tertiary rounded-full" />
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-full transition-colors" style={{}}>
              <span className="material-symbols-outlined" data-icon="settings" style={{}}>settings</span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-on-background leading-none" style={{}}>Dr Julian Vance</p>
                <p className="text-[10px] text-secondary" style={{}}>Néphrologue en chef</p>
              </div>
              <img alt="Profil Néphrologue en chef" className="w-10 h-10 rounded-full object-cover border-2 border-primary-container" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC4au1QRyhFgf-T1u7BHySWdo5uSRf7vAgqfw3agTvuIjJ92GNOfEcwCrQ2dzW56bLyGmz-MoTDyjLzdThRg6chmKYST7lidPcHytjnF4Y-09NzhY0u99kurIlF020I387BWwAbUi0WfhU9K59erlPfUs2CMjipmehqrnZQ6TLjjC6fsMMq4DT19cfj2T7Mmm740M3X-A-PBoGRlkbRwNtCtZfj-d4gaUWdcp9L5XFgcoH1hFdaETHAXLUpeQUfmLv_EGrbuKzpYtP" style={{}} />
            </div>
          </div>
        </header>
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-black font-manrope text-on-surface" style={{}}>Tableau de Bord - Version Finalisée FR</h2>
          {/* Quick Stats Section */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/15 flex flex-col gap-1 shadow-sm">
              <span className="text-secondary text-xs font-semibold" style={{}}>Total séances aujourd'hui</span>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-primary" style={{}}>23/24</span>
                <p className="text-[11px] text-secondary font-medium mt-1" style={{}}>1 séance terminée</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/15 flex flex-col gap-1 shadow-sm">
              <span className="text-secondary text-xs font-semibold" style={{}}>Unités disponibles</span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-black text-on-surface" style={{}}>3</span>
                <span className="material-symbols-outlined text-primary/60 text-3xl" data-icon="precision_manufacturing" style={{}}>precision_manufacturing</span>
              </div>
            </div>
            <div className="bg-tertiary-container p-5 rounded-xl flex flex-col gap-1 shadow-md shadow-tertiary-container/20">
              <span className="text-on-tertiary-container text-xs font-semibold" style={{}}>Alertes critiques</span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-black text-white" style={{}}>02</span>
                <span className="material-symbols-outlined text-white text-3xl" data-icon="warning" style={{fontVariationSettings: '"FILL" 1'}}>warning</span>
              </div>
            </div>
          </section>
          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 gap-6">
            {/* Sessions Monitoring */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold font-manrope" style={{}}>Liste des dialyses effectuées</h2>
                <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/15 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary" data-icon="build" style={{}}>build</span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold" style={{}}>Contrôle maintenance</p>
                    <p className="text-[10px] text-secondary" style={{}}>3 unités à désinfecter dans 2h</p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-secondary text-[11px] font-bold uppercase tracking-widest border-b border-slate-100 pb-3">
                      <th className="pb-3 pl-2" style={{}}>Patient</th>
                      <th className="pb-3" style={{}}>Poste</th>
                      <th className="pb-3" style={{}}>Progression</th>
                      <th className="pb-3 text-center" style={{}}>Action</th>
                      <th className="pb-3 text-center" style={{}}>Statut</th>
                      <th className="pb-3 text-right" style={{}}>Prochaine séance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-6 pl-2" style={{}}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center font-bold text-primary text-base" style={{}}>EL</div>
                          <div>
                            <p className="font-bold text-base" style={{}}>Elena L. Ross</p>
                            <p className="text-xs text-secondary" style={{}}>ID: #DX-9021</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6" style={{}}>
                        <span className="text-base font-bold text-on-surface" style={{}}>Poste B-04</span>
                      </td>
                      <td className="py-6" style={{}}>
                        <div className="max-w-[180px]">
                          <div className="flex justify-between text-[11px] mb-1.5">
                            <span className="text-secondary font-medium" style={{}}>Début 08:30</span>
                            <span className="font-bold text-primary" style={{}}>75%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{width: '75%'}} />
                          </div>
                        </div>
                      </td>
                      <td className="py-6 text-center" style={{}}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-primary rounded-lg border border-primary/20">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-wider" style={{}}>En cours</span>
                        </div>
                      </td>
                      <td className="py-6 text-center" style={{}}>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700 border border-green-200" style={{}}><div className="flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-[14px]" data-icon="check" style={{}}>check</span>
                            <span style={{}}>FAIT</span>
                          </div></span>
                      </td>
                      <td className="py-6 text-right" style={{}}>
                        <button className="px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors inline-flex items-center gap-2 border border-primary/20 bg-white" type="button" onClick={() => {
                          window.location.href = "/rendez-vous";
                        }} style={{}}>
                          <span className="material-symbols-outlined text-[18px]" data-icon="calendar_today" style={{}}>calendar_today</span>
                          <span className="text-[11px] font-bold uppercase" style={{}}>PROGRAMMER RDV 2ème  séance</span>
                        </button>
                      </td>
                    </tr>
                    <tr className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-6 pl-2" style={{}}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center font-bold text-orange-600 text-base" style={{}}>MJ</div>
                          <div>
                            <p className="font-bold text-base" style={{}}>Marcus Jensen</p>
                            <p className="text-xs text-secondary" style={{}}>ID: #DX-4452</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6" style={{}}>
                        <span className="text-base font-bold text-on-surface" style={{}}>Poste A-12</span>
                      </td>
                      <td className="py-6" style={{}}>
                        <div className="max-w-[180px]">
                          <div className="flex justify-between text-[11px] mb-1.5">
                            <span className="text-secondary font-medium" style={{}}>Début 10:15</span>
                            <span className="font-bold text-primary" style={{}}>20%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{width: '20%'}} />
                          </div>
                        </div>
                      </td>
                      <td className="py-6 text-center" style={{}}>
                        <button className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95" type="button" onClick={() => {
                          window.location.href = "/dialyses/nouvelle-seance";
                        }} style={{}}>Démarrer la séance</button>
                      </td>
                      <td className="py-6 text-center" style={{}}>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700 border border-red-200" style={{}}>
                          NON FAIT
                        </span>
                      </td>
                      <td className="py-6 text-right" style={{}}>
                        <button className="px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors inline-flex items-center gap-2 border border-primary/20 bg-white" type="button" onClick={() => {
                          window.location.href = "/rendez-vous";
                        }} style={{}}>
                          <span className="material-symbols-outlined text-[18px]" data-icon="calendar_today" style={{}}>calendar_today</span>
                          <span className="text-[11px] font-bold uppercase" style={{}}>PROGRAMMER RDV 2ème  séance</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* Weekly Schedule Expanded */}
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold font-manrope" style={{}}>Liste des dialyses effectuées</h2>
                  <p className="text-sm text-secondary mt-1" style={{}}>Aperçu de la charge de l'unité rénale</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-lg text-[11px] font-bold">
                  <button className="px-6 py-2 bg-white rounded-md shadow-sm text-primary" style={{}}>Lundi / Mercredi / Vendredi</button>
                  <button className="px-6 py-2 text-slate-500 hover:text-slate-700 transition-colors" style={{}}>Mardi / Jeudi / Samedi</button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-4">
                <div className="flex flex-col items-center p-6 rounded-xl bg-blue-50/50 border border-blue-100/50">
                  <span className="text-[10px] font-bold text-blue-400 mb-2 tracking-widest" style={{}}>LUNDI</span>
                  <span className="text-3xl font-black text-blue-800" style={{}}>12</span>
                  <div className="mt-4 w-full space-y-2">
                    <div className="h-1.5 w-full bg-blue-300 rounded-full opacity-60" />
                    <div className="h-1.5 w-full bg-blue-300 rounded-full opacity-60" />
                    <div className="h-1.5 w-2/3 bg-blue-300 rounded-full opacity-60" />
                  </div>
                </div>
                <div className="flex flex-col items-center p-6 rounded-xl bg-slate-50 border border-slate-100/50">
                  <span className="text-[10px] font-bold text-slate-400 mb-2 tracking-widest" style={{}}>MARDI</span>
                  <span className="text-3xl font-black text-slate-800" style={{}}>13</span>
                </div>
                <div className="flex flex-col items-center p-6 rounded-xl bg-blue-50/50 border border-blue-100/50">
                  <span className="text-[10px] font-bold text-blue-400 mb-2 tracking-widest" style={{}}>MERCREDI</span>
                  <span className="text-3xl font-black text-blue-800" style={{}}>14</span>
                  <div className="mt-4 w-full space-y-2">
                    <div className="h-1.5 w-full bg-blue-300 rounded-full opacity-60" />
                    <div className="h-1.5 w-full bg-blue-300 rounded-full opacity-60" />
                    <div className="h-1.5 w-full bg-blue-300 rounded-full opacity-60" />
                  </div>
                </div>
                <div className="flex flex-col items-center p-6 rounded-xl bg-slate-50 border border-slate-100/50">
                  <span className="text-[10px] font-bold text-slate-400 mb-2 tracking-widest" style={{}}>JEUDI</span>
                  <span className="text-3xl font-black text-slate-800" style={{}}>15</span>
                </div>
                <div className="flex flex-col items-center p-6 rounded-xl bg-blue-50/50 border border-blue-100/50">
                  <span className="text-[10px] font-bold text-blue-400 mb-2 tracking-widest" style={{}}>VENDREDI</span>
                  <span className="text-3xl font-black text-blue-800" style={{}}>16</span>
                  <div className="mt-4 w-full space-y-2">
                    <div className="h-1.5 w-full bg-blue-300 rounded-full opacity-60" />
                    <div className="h-1.5 w-3/4 bg-blue-300 rounded-full opacity-60" />
                  </div>
                </div>
                <div className="flex flex-col items-center p-6 rounded-xl bg-slate-50 border border-slate-100/50 opacity-40">
                  <span className="text-[10px] font-bold text-slate-400 mb-2 tracking-widest" style={{}}>SAMEDI</span>
                  <span className="text-3xl font-black text-slate-800" style={{}}>17</span>
                </div>
                <div className="flex flex-col items-center p-6 rounded-xl bg-slate-50 border border-slate-100/50 opacity-40">
                  <span className="text-[10px] font-bold text-slate-400 mb-2 tracking-widest" style={{}}>DIMANCHE</span>
                  <span className="text-3xl font-black text-slate-800" style={{}}>18</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-slate-200/50 flex justify-around items-center py-3 px-6 z-50">
        <a className="text-primary flex flex-col items-center gap-1" href="#" style={{}}>
          <span className="material-symbols-outlined" data-icon="dashboard" style={{fontVariationSettings: '"FILL" 1'}}>dashboard</span>
          <span className="text-[10px] font-bold" style={{}}>
            ueil</span>
        </a>
        <a className="text-slate-400 flex flex-col items-center gap-1" href="/dialyses" style={{}}>
          <span className="material-symbols-outlined" data-icon="groups" style={{}}>groups</span>
          <span className="text-[10px] font-bold" style={{}}>Patients</span>
        </a>
        <button className="bg-primary text-white p-3 rounded-full -translate-y-6 shadow-xl" type="button" onClick={() => {
          window.location.href = "/rendez-vous/nouveau";
        }} style={{}}>
          <span className="material-symbols-outlined" data-icon="add" style={{}}>add</span>
        </button>
        <a className="text-slate-400 flex flex-col items-center gap-1" href="/dialyses/nouvelle-seance" style={{}}>
          <span className="material-symbols-outlined" data-icon="bloodtype" style={{}}>bloodtype</span>
          <span className="text-[10px] font-bold" style={{}}>Séances</span>
        </a>
        <a className="text-slate-400 flex flex-col items-center gap-1" href="#" style={{}}>
          <span className="material-symbols-outlined" data-icon="person" style={{}}>person</span>
          <span className="text-[10px] font-bold" style={{}}>Profil</span>
        </a>
      </nav>
    </div>
    
  );
}
