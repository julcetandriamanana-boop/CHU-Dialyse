'use client';

export default function StitchArchives() {
  return (
    <div className="bg-background text-on-surface">
      {/* SideNavBar Shell */}
      {/* TopNavBar Shell */}
      <header className="fixed top-0 right-0 left-64 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex items-center justify-between px-8 w-full border-b border-slate-200/15 z-40">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" style={{}}>search</span>
            <input className="w-full bg-surface-container-low border-none rounded-md py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="Rechercher une archive..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-slate-600">
            <button className="hover:text-blue-600 transition-all focus:ring-2 focus:ring-blue-500/20 rounded-md p-1" style={{}}>
              <span className="material-symbols-outlined" style={{}}>notifications</span>
            </button>
            <button className="hover:text-blue-600 transition-all focus:ring-2 focus:ring-blue-500/20 rounded-md p-1" style={{}}>
              <span className="material-symbols-outlined" style={{}}>settings</span>
            </button>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <span className="text-sm font-semibold text-slate-900 font-manrope" style={{}}>Archives Centrales</span>
        </div>
      </header>
      {/* Main Content Area */}
      <main className="mt-16 p-8 min-h-screen">
        {/* Header Section */}
        <section className="mb-8">
          <h2 className="text-3xl font-extrabold text-on-surface font-manrope tracking-tight" style={{}}>Archives Centrales</h2>
          <p className="text-secondary mt-1 max-w-2xl font-body" style={{}}>Consultez l'historique complet des dossiers, prescriptions et comptes-rendus de l'unité de dialyse.</p>
        </section>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content: Search, Filters & List */}
          <div className="flex-1 space-y-6">
            {/* Filters Bar */}
            <div className="glass-panel p-4 rounded-xl border border-outline-variant/15 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block" style={{}}>Recherche par Patient</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" style={{}}>person</span>
                  <input className="w-full bg-surface-container-low border-none rounded-md py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Nom ou ID..." type="text" />
                </div>
              </div>
              <div className="w-48">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block" style={{}}>Type de document</label>
                <select className="w-full bg-surface-container-low border-none rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer">
                  <option>Tous les types</option>
                  <option>Prescription</option>
                  <option>Compte-rendu</option>
                  <option>Labo</option>
                </select>
              </div>
              <div className="w-40">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block" style={{}}>Date</label>
                <input className="w-full bg-surface-container-low border-none rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer" type="date" />
              </div>
              <button className="self-end h-10 px-6 bg-primary text-white rounded-md font-bold text-sm hover:opacity-90 transition-opacity" style={{}}>
                Filtrer
              </button>
            </div>
            {/* Archive List (Bento-style list) */}
            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-380px)] pr-2 custom-scrollbar">
              <div className="grid grid-cols-12 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                <div className="col-span-4" style={{}}>Patient</div>
                <div className="col-span-3" style={{}}>Document</div>
                <div className="col-span-3" style={{}}>Date d'archivage</div>
                <div className="col-span-2 text-right" style={{}}>Actions</div>
              </div>
              {/* List Item 1 */}
              <div className="group relative bg-surface-container-low hover:bg-surface-container-high transition-colors duration-200 rounded-xl p-6 grid grid-cols-12 items-center">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs" style={{}}>MA</div>
                  <div>
                    <p className="font-bold text-on-surface" style={{}}>Marie Autier</p>
                    <p className="text-xs text-secondary font-mono" style={{}}>ID: #DX-9021</p>
                  </div>
                </div>
                <div className="col-span-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold" style={{}}>
                    <span className="material-symbols-outlined text-[14px]" style={{}}>prescriptions</span>
                    Prescription
                  </span>
                </div>
                <div className="col-span-3">
                  <p className="text-sm font-medium text-secondary" style={{}}>12 Octobre 2023</p>
                  <p className="text-[10px] text-slate-400" style={{}}>Archivé par System Admin</p>
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <button className="p-2 hover:bg-white rounded-lg transition-colors text-primary" title="Voir" style={{}}>
                    <span className="material-symbols-outlined" style={{}}>visibility</span>
                  </button>
                  <button className="p-2 hover:bg-white rounded-lg transition-colors text-primary" title="Télécharger" style={{}}>
                    <span className="material-symbols-outlined" style={{}}>download</span>
                  </button>
                </div>
              </div>
              {/* List Item 2 */}
              <div className="group relative bg-surface-container-low hover:bg-surface-container-high transition-colors duration-200 rounded-xl p-6 grid grid-cols-12 items-center">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs" style={{}}>JL</div>
                  <div>
                    <p className="font-bold text-on-surface" style={{}}>Jean-Luc Picard</p>
                    <p className="text-xs text-secondary font-mono" style={{}}>ID: #DX-1701</p>
                  </div>
                </div>
                <div className="col-span-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100" style={{}}>
                    <span className="material-symbols-outlined text-[14px]" style={{}}>lab_research</span>
                    Labo
                  </span>
                </div>
                <div className="col-span-3">
                  <p className="text-sm font-medium text-secondary" style={{}}>08 Octobre 2023</p>
                  <p className="text-[10px] text-slate-400" style={{}}>Archivé par Lab_Tech_04</p>
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <button className="p-2 hover:bg-white rounded-lg transition-colors text-primary" style={{}}>
                    <span className="material-symbols-outlined" style={{}}>visibility</span>
                  </button>
                  <button className="p-2 hover:bg-white rounded-lg transition-colors text-primary" style={{}}>
                    <span className="material-symbols-outlined" style={{}}>download</span>
                  </button>
                </div>
              </div>
              {/* List Item 3 */}
              <div className="group relative bg-surface-container-low hover:bg-surface-container-high transition-colors duration-200 rounded-xl p-6 grid grid-cols-12 items-center">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs" style={{}}>SK</div>
                  <div>
                    <p className="font-bold text-on-surface" style={{}}>Sarah Konor</p>
                    <p className="text-xs text-secondary font-mono" style={{}}>ID: #DX-800</p>
                  </div>
                </div>
                <div className="col-span-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant text-[11px] font-bold" style={{}}>
                    <span className="material-symbols-outlined text-[14px]" style={{}}>description</span>
                    Compte-rendu
                  </span>
                </div>
                <div className="col-span-3">
                  <p className="text-sm font-medium text-secondary" style={{}}>05 Octobre 2023</p>
                  <p className="text-[10px] text-slate-400" style={{}}>Archivé par Dr. Dupont</p>
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <button className="p-2 hover:bg-white rounded-lg transition-colors text-primary" style={{}}>
                    <span className="material-symbols-outlined" style={{}}>visibility</span>
                  </button>
                  <button className="p-2 hover:bg-white rounded-lg transition-colors text-primary" style={{}}>
                    <span className="material-symbols-outlined" style={{}}>download</span>
                  </button>
                </div>
              </div>
              {/* List Item 4 */}
              <div className="group relative bg-surface-container-low hover:bg-surface-container-high transition-colors duration-200 rounded-xl p-6 grid grid-cols-12 items-center">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs" style={{}}>BM</div>
                  <div>
                    <p className="font-bold text-on-surface" style={{}}>Benoît Magimel</p>
                    <p className="text-xs text-secondary font-mono" style={{}}>ID: #DX-4432</p>
                  </div>
                </div>
                <div className="col-span-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold" style={{}}>
                    <span className="material-symbols-outlined text-[14px]" style={{}}>prescriptions</span>
                    Prescription
                  </span>
                </div>
                <div className="col-span-3">
                  <p className="text-sm font-medium text-secondary" style={{}}>30 Septembre 2023</p>
                  <p className="text-[10px] text-slate-400" style={{}}>Archivé par System Admin</p>
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <button className="p-2 hover:bg-white rounded-lg transition-colors text-primary" style={{}}>
                    <span className="material-symbols-outlined" style={{}}>visibility</span>
                  </button>
                  <button className="p-2 hover:bg-white rounded-lg transition-colors text-primary" style={{}}>
                    <span className="material-symbols-outlined" style={{}}>download</span>
                  </button>
                </div>
              </div>
            </div>
            {/* Pagination */}
          </div>
          {/* Statistics Sidebar */}
          <aside className="w-full lg:w-80 space-y-6">
            {/* Archive Summary Card */}
            <div className="bg-gradient-to-br from-primary to-primary-container p-6 rounded-2xl text-white shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <span className="material-symbols-outlined text-3xl opacity-50" style={{}}>inventory_2</span>
                <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider" style={{}}>Mise à jour: 2h</span>
              </div>
              <p className="text-blue-100 text-sm font-medium" style={{}}>Total documents archivés</p>
              <h3 className="text-4xl font-extrabold font-manrope mt-1" style={{}}>12,482</h3>
              <div className="mt-6 flex items-center gap-2">
                <span className="flex items-center text-emerald-300 text-xs font-bold" style={{}}>
                  <span className="material-symbols-outlined text-sm" style={{}}>trending_up</span>
                  +12%
                </span>
                <span className="text-blue-200 text-[10px]" style={{}}>depuis le mois dernier</span>
              </div>
            </div>
            {/* Trend Chart Section */}
            <div className="bg-white p-6 rounded-2xl border border-outline-variant/15">
              <h4 className="text-sm font-bold text-on-surface font-manrope mb-4" style={{}}>Volume d'archives</h4>
              <div className="h-32 flex items-end justify-between gap-1">
                {/* Simulated Sparkline Chart */}
                <div className="w-full bg-primary/5 rounded-t-sm h-[30%] hover:bg-primary/20 transition-all cursor-pointer" title="Jan: 450" />
                <div className="w-full bg-primary/5 rounded-t-sm h-[45%] hover:bg-primary/20 transition-all cursor-pointer" title="Feb: 620" />
                <div className="w-full bg-primary/5 rounded-t-sm h-[40%] hover:bg-primary/20 transition-all cursor-pointer" title="Mar: 580" />
                <div className="w-full bg-primary/10 rounded-t-sm h-[60%] hover:bg-primary/20 transition-all cursor-pointer" title="Apr: 890" />
                <div className="w-full bg-primary/10 rounded-t-sm h-[55%] hover:bg-primary/20 transition-all cursor-pointer" title="May: 750" />
                <div className="w-full bg-primary/20 rounded-t-sm h-[75%] hover:bg-primary/20 transition-all cursor-pointer" title="Jun: 920" />
                <div className="w-full bg-primary/40 rounded-t-sm h-[70%] hover:bg-primary/20 transition-all cursor-pointer" title="Jul: 880" />
                <div className="w-full bg-primary/60 rounded-t-sm h-[85%] hover:bg-primary/20 transition-all cursor-pointer" title="Aug: 1100" />
                <div className="w-full bg-primary/80 rounded-t-sm h-[95%] hover:bg-primary/20 transition-all cursor-pointer" title="Sep: 1250" />
                <div className="w-full bg-primary rounded-t-sm h-[100%] hover:bg-primary/20 transition-all cursor-pointer" title="Oct: 1400" />
              </div>
              <div className="flex justify-between mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <span style={{}}>Jan</span>
                <span style={{}}>Oct</span>
              </div>
            </div>
            {/* Storage Info */}
          </aside>
        </div>
      </main>
    </div>
    
  );
}
