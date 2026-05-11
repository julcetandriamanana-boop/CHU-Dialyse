'use client';

export default function StitchRapports() {
  return (
    <div className="bg-background text-on-background min-h-[1024px]">
      {/* SideNavBar Component */}
      {/* Main Content Area */}
      <main className="min-h-[1024px]">
        {/* TopAppBar Component */}
        <header className="flex justify-between items-center w-full pr-8 py-4 bg-transparent backdrop-blur-xl font-['Manrope'] font-semibold text-lg sticky top-0 z-40">
          <div className="pl-8">
            <h2 className="text-on-surface text-xl font-extrabold tracking-tight">Rapports de l'Unité de Dialyse</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-primary">
                <span className="material-symbols-outlined text-sm" data-icon="search">search</span>
              </span>
              <input className="bg-surface-container-low border-none rounded-md pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary w-48 transition-all outline-none" placeholder="Rechercher..." type="text" />
            </div>
            <button className="signature-gradient text-white px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 shadow-md hover:opacity-90 transition-opacity whitespace-nowrap">
              <span className="material-symbols-outlined text-sm" data-icon="add_circle">add_circle</span>
              Générer un nouveau rapport
            </button>
            <div className="flex items-center gap-2 border-l pl-6 border-slate-200">
              <button className="p-2 text-slate-500 hover:bg-white/20 rounded-full transition-all scale-95 active:scale-90">
                <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
              </button>
              <button className="p-2 text-slate-500 hover:bg-white/20 rounded-full transition-all scale-95 active:scale-90">
                <span className="material-symbols-outlined" data-icon="account_circle">account_circle</span>
              </button>
            </div>
          </div>
        </header>
        {/* Content Canvas */}
        <section className="px-8 pb-12">
          {/* Validation Quotidienne Section */}
          <div className="mb-8 bg-primary-container/10 border border-primary-container/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
                <span className="material-symbols-outlined" data-icon="fact_check">fact_check</span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-primary">Validation Interne de l'Activité</h4>
                <p className="text-sm text-secondary">Vérification du personnel pour les données du <span className="font-bold">12 Juillet 2024</span> avant génération du rapport</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="bg-white px-4 py-2 rounded-lg border border-primary-container/30 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400">Séances réalisées</span>
                <span className="text-lg font-bold text-on-surface">42</span>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg border border-primary-container/30 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400">Kits consommés</span>
                <span className="text-lg font-bold text-on-surface">126</span>
              </div>
              <button className="signature-gradient text-white px-6 py-3 rounded-md text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined text-sm" data-icon="verified">verified</span>
                Valider &amp; Signer la journée
              </button>
            </div>
          </div>
          {/* Header Filter Bar */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-2xl font-bold text-on-surface">Statistiques de l'Unité</h3>
              <p className="text-sm text-secondary font-medium">Données cliniques générées par l'activité interne de service</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-surface-container-low rounded-md px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-sm" data-icon="calendar_month">calendar_month</span>
                <span className="text-sm font-semibold">Ce mois</span>
                <span className="material-symbols-outlined text-sm" data-icon="expand_more">expand_more</span>
              </div>
              <button className="bg-surface-container-highest text-on-surface px-5 py-2 rounded-md text-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm" data-icon="file_download">file_download</span>
                Exporter les données
              </button>
            </div>
          </div>
          {/* Activity Summary Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
              <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Séances de l'Unité</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-extrabold text-on-surface">1,284</span>
                <span className="text-xs font-bold text-emerald-600 pb-1">+12%</span>
              </div>
              <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary w-3/4" />
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-container/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
              <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Patients de l'Unité</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-extrabold text-on-surface">42</span>
                <span className="text-xs font-bold text-emerald-600 pb-1">+4%</span>
              </div>
              <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary-container w-1/2" />
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
              <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Kits Consommés</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-extrabold text-on-surface">3,850</span>
                <span className="text-xs font-bold text-amber-600 pb-1">-2%</span>
              </div>
              <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[85%]" />
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
              <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Taux de Conformité</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-extrabold text-on-surface">99.2%</span>
                <span className="text-xs font-bold text-emerald-600 pb-1">+0.1%</span>
              </div>
              <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[99%]" />
              </div>
            </div>
          </div>
          {/* Main Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-sm border-none">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h4 className="text-lg font-bold text-on-surface">Activité Réelle de l'Unité</h4>
                  <p className="text-sm text-secondary">Volume de séances validées vs prévisions</p>
                </div>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-secondary">
                    <span className="w-3 h-3 rounded-full bg-primary-container" /> Prévisions
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-secondary">
                    <span className="w-3 h-3 rounded-full bg-primary" /> Réalisé
                  </span>
                </div>
              </div>
              <div className="flex items-end justify-between h-64 gap-4 px-2">
                <div className="flex flex-col items-center flex-1 gap-2">
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    <div className="w-4 bg-primary-container/20 h-[70%] rounded-t-sm" />
                    <div className="w-4 bg-primary h-[65%] rounded-t-sm" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">JAN</span>
                </div>
                <div className="flex flex-col items-center flex-1 gap-2">
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    <div className="w-4 bg-primary-container/20 h-[85%] rounded-t-sm" />
                    <div className="w-4 bg-primary h-[82%] rounded-t-sm" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">FEB</span>
                </div>
                <div className="flex flex-col items-center flex-1 gap-2">
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    <div className="w-4 bg-primary-container/20 h-[75%] rounded-t-sm" />
                    <div className="w-4 bg-primary h-[78%] rounded-t-sm" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">MAR</span>
                </div>
                <div className="flex flex-col items-center flex-1 gap-2">
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    <div className="w-4 bg-primary-container/20 h-[90%] rounded-t-sm" />
                    <div className="w-4 bg-primary h-[88%] rounded-t-sm" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">APR</span>
                </div>
                <div className="flex flex-col items-center flex-1 gap-2">
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    <div className="w-4 bg-primary-container/20 h-[95%] rounded-t-sm" />
                    <div className="w-4 bg-primary h-[92%] rounded-t-sm" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">MAY</span>
                </div>
                <div className="flex flex-col items-center flex-1 gap-2">
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    <div className="w-4 bg-primary-container/20 h-[80%] rounded-t-sm" />
                    <div className="w-4 bg-primary h-[85%] rounded-t-sm" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">JUN</span>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border-none">
              <h4 className="text-lg font-bold text-on-surface mb-1">Stock Consommé par l'Unité</h4>
              <p className="text-sm text-secondary mb-8">Utilisation réelle par type de kit</p>
              <div className="relative w-40 h-40 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx={18} cy={18} fill="transparent" r="15.915" stroke="#e2e8f0" strokeWidth={3} />
                  <circle cx={18} cy={18} fill="transparent" r="15.915" stroke="#00478d" strokeDasharray="45 100" strokeDashoffset={0} strokeWidth={3} />
                  <circle cx={18} cy={18} fill="transparent" r="15.915" stroke="#005eb8" strokeDasharray="30 100" strokeDashoffset={-45} strokeWidth={3} />
                  <circle cx={18} cy={18} fill="transparent" r="15.915" stroke="#a9c7ff" strokeDasharray="25 100" strokeDashoffset={-75} strokeWidth={3} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xl font-extrabold text-on-surface">3.8k</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Unités</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-sm font-semibold text-on-surface">Kit Standard #1</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary-container" />
                    <span className="text-sm font-semibold text-on-surface">Kit Intensif #2</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface">30%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary-fixed-dim" />
                    <span className="text-sm font-semibold text-on-surface">Kit Pédiatrique #3</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface">25%</span>
                </div>
              </div>
            </div>
          </div>
          {/* Monthly Report Table */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border-none overflow-hidden">
            <div className="px-8 py-6 border-b border-surface-container-low flex justify-between items-center">
              <h4 className="text-lg font-bold text-on-surface">Archives des Rapports Internes de Service</h4>
              <button className="text-primary text-sm font-bold hover:underline">Accéder aux archives complètes</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                    <th className="px-8 py-4">Mois / Période</th>
                    <th className="px-8 py-4 text-center">Séances Totales</th>
                    <th className="px-8 py-4 text-center">Consommation Kits</th>
                    <th className="px-8 py-4 text-center">Statut de Validation</th>
                    <th className="px-8 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {/* Current Month Row */}
                  <tr className="bg-primary/5 hover:bg-primary/10 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined" data-icon="pending_actions">pending_actions</span>
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">Juillet 2024</p>
                          <p className="text-xs text-slate-400">Période en cours</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-sm font-bold text-on-surface">512</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-sm font-bold text-on-surface">1,536 kits</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className="bg-surface-container-highest text-secondary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">Données en consolidation</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline transition-colors">
                        <span className="material-symbols-outlined text-sm" data-icon="auto_awesome">auto_awesome</span>
                        Préparer le rapport
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <span className="material-symbols-outlined" data-icon="verified_user">verified_user</span>
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">Juin 2024</p>
                          <p className="text-xs text-slate-400">Généré le 01/07/2024</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-sm font-bold text-on-surface">1,284</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-sm font-bold text-on-surface">3,852 kits</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">Rapport de Service Validé</span>
                        <span className="text-[9px] text-slate-400 mt-1 italic">Dr. Martin - 02/07/2024</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:text-primary-container transition-colors">
                        <span className="material-symbols-outlined text-sm" data-icon="picture_as_pdf">picture_as_pdf</span>
                        Rapport Certifié
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <span className="material-symbols-outlined" data-icon="verified_user">verified_user</span>
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">Mai 2024</p>
                          <p className="text-xs text-slate-400">Généré le 01/06/2024</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-sm font-bold text-on-surface">1,192</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-sm font-bold text-on-surface">3,576 kits</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">Rapport de Service Validé</span>
                        <span className="text-[9px] text-slate-400 mt-1 italic">Dr. Martin - 03/06/2024</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:text-primary-container transition-colors">
                        <span className="material-symbols-outlined text-sm" data-icon="picture_as_pdf">picture_as_pdf</span>
                        Rapport Certifié
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                          <span className="material-symbols-outlined" data-icon="history_edu">history_edu</span>
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">Avril 2024</p>
                          <p className="text-xs text-slate-400">Généré le 01/05/2024</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-sm font-bold text-on-surface">1,045</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-sm font-bold text-on-surface">3,135 kits</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">En attente de signature</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="inline-flex items-center gap-2 text-amber-600 font-bold text-sm hover:text-amber-700 transition-colors">
                        <span className="material-symbols-outlined text-sm" data-icon="draw">draw</span>
                        Signer maintenant
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      {/* Ambient Accents */}
      <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-primary-container/5 rounded-full blur-[100px] pointer-events-none" />
    </div>
    
  );
}
