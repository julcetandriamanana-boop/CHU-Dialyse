'use client';

export default function StitchRendezVousCalendrier() {
  return (
    <div className="bg-background text-on-surface antialiased flex overflow-auto">
      {/* SideNavBar */}
      {/* Main Canvas */}
      <main className="flex-1 min-h-screen relative overflow-y-auto bg-surface">
        {/* TopNavBar */}
        <header className="fixed top-0 right-0 left-64 h-16 bg-white/80 dark:bg-[#191c1d]/80 backdrop-blur-xl flex items-center justify-between px-8 z-40 border-b border-surface-container">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg" style={{}}>search</span>
              <input className="w-full bg-surface-container-low border-none rounded-md pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary" placeholder="Rechercher un patient ou un créneau..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-opacity" style={{}}>
              <span className="material-symbols-outlined text-on-surface-variant" style={{}}>notifications</span>
            </button>
            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-opacity" style={{}}>
              <span className="material-symbols-outlined text-on-surface-variant" style={{}}>settings</span>
            </button>
            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-opacity" style={{}}>
              <span className="material-symbols-outlined text-on-surface-variant" style={{}}>help_outline</span>
            </button>
            <div className="h-8 w-px bg-outline-variant/30 mx-2" />
          </div>
        </header>
        {/* Content Area */}
        <div className="pt-24 px-8 pb-12">
          {/* Page Title and Filters */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-black text-on-surface tracking-tight mb-1" style={{}}>Gestion des Rendez-vous</h2>
              <p className="text-on-surface-variant font-medium" style={{}}>Visualisez et organisez les séances de dialyse de l'unité.</p>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl">
              <button className="px-4 py-1.5 text-xs font-bold bg-white shadow-sm text-primary rounded-lg transition-all" style={{}}>Aujourd'hui</button>
              <button className="px-4 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-white/50 rounded-lg transition-all" style={{}}>Demain</button>
              <button className="px-4 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-white/50 rounded-lg transition-all" style={{}}>Semaine</button>
              <div className="w-px h-4 bg-outline-variant/30 mx-1" />
              <button className="px-3 py-1.5 text-on-surface-variant flex items-center gap-2 hover:bg-white/50 rounded-lg transition-all" style={{}}>
                <span className="material-symbols-outlined text-sm" style={{}}>filter_list</span>
                <span className="text-xs font-bold" style={{}}>Filtres</span>
              </button>
            </div>
          </div>
          {/* Bento Layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* Calendar View (Large Column) */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/5">
                <div className="p-6 border-b border-surface-container flex items-center justify-between">
                  <div className="flex items-center gap-4"><h3 className="text-xl font-bold font-headline" style={{}}>Octobre 2024</h3><div className="flex gap-1 ml-4"><button className="p-1 hover:bg-surface-container rounded-md" style={{}}><span className="material-symbols-outlined" style={{}}>chevron_left</span></button><button className="p-1 hover:bg-surface-container rounded-md" style={{}}><span className="material-symbols-outlined" style={{}}>chevron_right</span></button></div></div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-container" />
                      <span className="text-xs font-semibold text-outline" style={{}}>validé</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary-container" />
                      <span className="text-xs font-semibold text-outline" style={{}}>validé</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
                      <span className="text-xs font-semibold text-outline" style={{}}>validé</span>
                    </div>
                  </div>
                </div>
                {/* Grid Calendar */}
                <div className="grid grid-cols-7 border-collapse">
                  {/* Header */}
                  <div className="py-3 text-center border-r border-b border-surface-container text-[10px] font-black uppercase tracking-widest text-outline" style={{}}>Lun</div>
                  <div className="py-3 text-center border-r border-b border-surface-container text-[10px] font-black uppercase tracking-widest text-outline" style={{}}>Mar</div>
                  <div className="py-3 text-center border-r border-b border-surface-container text-[10px] font-black uppercase tracking-widest text-outline" style={{}}>Mer</div>
                  <div className="py-3 text-center border-r border-b border-surface-container text-[10px] font-black uppercase tracking-widest text-outline" style={{}}>Jeu</div>
                  <div className="py-3 text-center border-r border-b border-surface-container text-[10px] font-black uppercase tracking-widest text-outline" style={{}}>Ven</div>
                  <div className="py-3 text-center border-r border-b border-surface-container text-[10px] font-black uppercase tracking-widest text-outline" style={{}}>Sam</div>
                  <div className="py-3 text-center border-b border-surface-container text-[10px] font-black uppercase tracking-widest text-outline" style={{}}>Dim</div>
                  {/* Calendar Cells */}
                  {/* Example Row 1 */}
                  <div className="min-h-[120px] p-2 border-r border-b border-surface-container text-on-surface-variant bg-surface-container-low opacity-40" style={{}}>28</div>
                  <div className="min-h-[120px] p-2 border-r border-b border-surface-container text-on-surface-variant bg-surface-container-low opacity-40" style={{}}>29</div>
                  <div className="min-h-[120px] p-2 border-r border-b border-surface-container text-on-surface-variant bg-surface-container-low opacity-40" style={{}}>30</div>
                  <div className="min-h-[120px] p-2 border-r border-b border-surface-container relative relative group">
                    <span className="text-sm font-bold" style={{}}>1</span>
                    <div className="mt-2 space-y-1">
                      <div className="px-2 py-1 bg-primary-container/10 border-l-2 border-primary text-[10px] font-bold text-primary-container truncate rounded-sm" style={{}}>08:00 - M. Lambert</div>
                      <div className="px-2 py-1 bg-secondary-container/10 border-l-2 border-secondary text-[10px] font-bold text-secondary truncate rounded-sm" style={{}}>13:30 - J. Dubois</div>
                    </div>
                    <a href="/rendez-vous/nouveau" className="absolute top-1 right-1 w-6 h-6 rounded-md bg-surface-container-highest text-outline hover:bg-primary hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm" style={{}}>
                      <span className="material-symbols-outlined text-sm" style={{}}>add</span>
                    </a></div>
                  <div className="min-h-[120px] p-2 border-r border-b border-surface-container relative group">
                    <span className="text-sm font-bold" style={{}}>2</span>
                    <div className="mt-2 space-y-1">
                      <div className="px-2 py-1 bg-tertiary/10 border-l-2 border-tertiary text-[10px] font-bold text-tertiary truncate rounded-sm" style={{}}>09:00 - Urgence</div>
                    </div>
                    <a href="/rendez-vous/nouveau" className="absolute top-1 right-1 w-6 h-6 rounded-md bg-surface-container-highest text-outline hover:bg-primary hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm" style={{}}>
                      <span className="material-symbols-outlined text-sm" style={{}}>add</span>
                    </a></div>
                  <div className="min-h-[120px] p-2 border-r border-b border-surface-container relative group"><span className="text-sm font-bold" style={{}}>3</span><a href="/rendez-vous/nouveau" className="absolute top-1 right-1 w-6 h-6 rounded-md bg-surface-container-highest text-outline hover:bg-primary hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm" style={{}}>
                      <span className="material-symbols-outlined text-sm" style={{}}>add</span>
                    </a></div>
                  <div className="min-h-[120px] p-2 border-b border-surface-container bg-surface-container-low/30 relative group"><span className="text-sm font-bold" style={{}}>4</span><a href="/rendez-vous/nouveau" className="absolute top-1 right-1 w-6 h-6 rounded-md bg-surface-container-highest text-outline hover:bg-primary hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm" style={{}}>
                      <span className="material-symbols-outlined text-sm" style={{}}>add</span>
                    </a></div>
                  {/* Example Row 2 (Active Day) */}
                  <div className="min-h-[120px] p-2 border-r border-b border-surface-container relative group"><span className="text-sm font-bold" style={{}}>5</span><a href="/rendez-vous/nouveau" className="absolute top-1 right-1 w-6 h-6 rounded-md bg-surface-container-highest text-outline hover:bg-primary hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm" style={{}}>
                      <span className="material-symbols-outlined text-sm" style={{}}>add</span>
                    </a></div>
                  <div className="min-h-[120px] p-2 border-r border-b border-surface-container bg-primary-fixed/20 relative group">
                    <span className="text-sm font-black text-primary" style={{}}>6</span>
                    <div className="mt-2 space-y-1">
                      <div className="px-2 py-1 bg-primary-container text-white text-[10px] font-bold truncate rounded-sm shadow-sm" style={{}}>08:00 - A. Morel</div>
                      <div className="px-2 py-1 bg-primary-container/80 text-white text-[10px] font-bold truncate rounded-sm" style={{}}>10:30 - S. Petit</div>
                      <div className="px-2 py-1 bg-primary-container/60 text-white text-[10px] font-bold truncate rounded-sm" style={{}}>14:00 - P. Leroux</div>
                    </div>
                    <a href="/rendez-vous/nouveau" className="absolute top-1 right-1 w-6 h-6 rounded-md bg-surface-container-highest text-outline hover:bg-primary hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm" style={{}}>
                      <span className="material-symbols-outlined text-sm" style={{}}>add</span>
                    </a></div>
                  <div className="min-h-[120px] p-2 border-r border-b border-surface-container relative group"><span className="text-sm font-bold" style={{}}>7</span><a href="/rendez-vous/nouveau" className="absolute top-1 right-1 w-6 h-6 rounded-md bg-surface-container-highest text-outline hover:bg-primary hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm" style={{}}>
                      <span className="material-symbols-outlined text-sm" style={{}}>add</span>
                    </a></div>
                  <div className="min-h-[120px] p-2 border-r border-b border-surface-container relative group"><span className="text-sm font-bold" style={{}}>8</span><a href="/rendez-vous/nouveau" className="absolute top-1 right-1 w-6 h-6 rounded-md bg-surface-container-highest text-outline hover:bg-primary hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm" style={{}}>
                      <span className="material-symbols-outlined text-sm" style={{}}>add</span>
                    </a></div>
                  <div className="min-h-[120px] p-2 border-r border-b border-surface-container relative group"><span className="text-sm font-bold" style={{}}>9</span><a href="/rendez-vous/nouveau" className="absolute top-1 right-1 w-6 h-6 rounded-md bg-surface-container-highest text-outline hover:bg-primary hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm" style={{}}>
                      <span className="material-symbols-outlined text-sm" style={{}}>add</span>
                    </a></div>
                  <div className="min-h-[120px] p-2 border-r border-b border-surface-container relative group"><span className="text-sm font-bold" style={{}}>10</span><a href="/rendez-vous/nouveau" className="absolute top-1 right-1 w-6 h-6 rounded-md bg-surface-container-highest text-outline hover:bg-primary hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm" style={{}}>
                      <span className="material-symbols-outlined text-sm" style={{}}>add</span>
                    </a></div>
                  <div className="min-h-[120px] p-2 border-b border-surface-container bg-surface-container-low/30 relative group"><span className="text-sm font-bold" style={{}}>11</span><a href="/rendez-vous/nouveau" className="absolute top-1 right-1 w-6 h-6 rounded-md bg-surface-container-highest text-outline hover:bg-primary hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm" style={{}}>
                      <span className="material-symbols-outlined text-sm" style={{}}>add</span>
                    </a></div>
                </div>
              </div>
            </div>
            {/* Upcoming Appointments List (Right Column) */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-surface-container-low rounded-xl p-6 h-full border border-outline-variant/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black font-headline" style={{}}>À venir (Aujourd'hui)</h3>
                  <span className="px-2 py-0.5 bg-surface-container-highest rounded text-[10px] font-bold uppercase tracking-wider text-outline" style={{}}>8 patients</span>
                </div>
                {/* Appointment Card 1 */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-4 border-l-4 border-primary hover:translate-x-1 transition-transform cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-primary bg-primary-fixed px-2 py-0.5 rounded uppercase" style={{}}>Machine #04</span>
                    <span className="text-[10px] font-bold text-primary flex items-center gap-1" style={{}}>
                      <span className="material-symbols-outlined text-[14px]" style={{}}>check_circle</span> Validé
                    </span>
                  </div>
                  <h4 className="font-bold text-on-surface mb-1" style={{}}>Morel Aurélie</h4>
                  <p className="text-xs text-on-surface-variant mb-3 flex items-center gap-1" style={{}}>
                    <span className="material-symbols-outlined text-sm" style={{}}>id_card</span> ID: DL-8842-X
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-surface-container">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-outline text-lg" style={{}}>schedule</span>
                      <span className="text-sm font-bold" style={{}}>08:30 - 12:30</span>
                    </div>
                    <span className="text-[10px] font-medium text-outline" style={{}}>4.0h séance</span>
                  </div>
                </div>
                {/* Appointment Card 2 */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-4 border-l-4 border-secondary hover:translate-x-1 transition-transform cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-secondary bg-secondary-fixed px-2 py-0.5 rounded uppercase" style={{}}>Machine #12</span>
                    <span className="text-[10px] font-bold text-secondary flex items-center gap-1" style={{}}>
                      <span className="material-symbols-outlined text-[14px]" style={{}}>pending</span> En attente
                    </span>
                  </div>
                  <h4 className="font-bold text-on-surface mb-1" style={{}}>Dubois Jean-Luc</h4>
                  <p className="text-xs text-on-surface-variant mb-3 flex items-center gap-1" style={{}}>
                    <span className="material-symbols-outlined text-sm" style={{}}>id_card</span> ID: DL-1029-A
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-surface-container">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-outline text-lg" style={{}}>schedule</span>
                      <span className="text-sm font-bold" style={{}}>13:30 - 17:30</span>
                    </div>
                    <span className="text-[10px] font-medium text-outline" style={{}}>4.0h séance</span>
                  </div>
                </div>
                {/* Appointment Card 3 - Urgence */}
                <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-tertiary hover:translate-x-1 transition-transform cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-tertiary bg-error-container px-2 py-0.5 rounded uppercase" style={{}}>Machine #01</span>
                    <span className="text-[10px] font-bold text-tertiary flex items-center gap-1" style={{}}>
                      <span className="material-symbols-outlined text-[14px]" style={{}}>emergency</span> Urgence
                    </span>
                  </div>
                  <h4 className="font-bold text-on-surface mb-1" style={{}}>Martin Sophie</h4>
                  <p className="text-xs text-on-surface-variant mb-3 flex items-center gap-1" style={{}}>
                    <span className="material-symbols-outlined text-sm" style={{}}>id_card</span> ID: DL-9921-U
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-surface-container">
                    <div className="flex items-center gap-2 text-tertiary">
                      <span className="material-symbols-outlined text-lg" style={{}}>bolt</span>
                      <span className="text-sm font-black" style={{}}>ASAP</span>
                    </div>
                    <button className="text-[10px] font-bold text-primary underline" style={{}}>Attribuer lit</button>
                  </div>
                </div>
                <button className="w-full mt-6 py-3 border border-dashed border-outline-variant rounded-xl text-outline-variant hover:border-primary hover:text-primary transition-colors text-sm font-bold flex items-center justify-center gap-2" style={{}}>
                  <span className="material-symbols-outlined" style={{}}>add_circle</span>
                  Voir tous les patients (8)
                </button>
              </div>
            </div>
            {/* Secondary Analysis Section (Bento Bottom) */}
            <div className="col-span-12 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-white p-6 rounded-xl flex items-center gap-5 border border-outline-variant/10 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined" style={{}}>medical_services</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-0.5" style={{}}>Machines Libres</p>
                  <h4 className="text-2xl font-black text-on-surface tracking-tight" style={{}}>02 / 3</h4>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl flex items-center gap-5 border border-outline-variant/10 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined" style={{}}>ecg_heart</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-tertiary mb-0.5" style={{}}>Rendez-vous prioritaires</p>
                  <h4 className="text-2xl font-black text-on-surface tracking-tight" style={{}}>02</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* FAB for New Appointment (Contextual Support) */}
      <a href="/rendez-vous/nouveau" className="fixed bottom-8 right-8 w-14 h-14 signature-gradient text-white rounded-full flex items-center justify-center shadow-xl md:hidden" style={{}}>
        <span className="material-symbols-outlined text-2xl" style={{}}>add</span>
      </a>
    </div>
    
  );
}
