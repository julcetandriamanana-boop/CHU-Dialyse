'use client';

export default function StitchDemandesAvis() {
  return (
    <div className="bg-background text-on-surface">
      {/* SideNavBar */}
      {/* TopAppBar */}
      <header className="fixed top-0 right-0 left-72 h-20 bg-white/80 backdrop-blur-xl flex justify-between items-center px-10 w-full z-40 shadow-sm shadow-blue-900/5">
        <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-full w-96 group focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <span className="material-symbols-outlined text-outline" style={{}}>search</span>
          <input className="bg-transparent border-none focus:ring-0 text-sm w-full font-body placeholder:text-outline" placeholder="Rechercher un dossier ou un patient..." type="text" />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button className="hover:bg-blue-50 rounded-full p-2 text-slate-500 transition-colors relative" style={{}}>
              <span className="material-symbols-outlined" style={{}}>notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-tertiary rounded-full border-2 border-white" />
            </button>
            <button className="hover:bg-blue-50 rounded-full p-2 text-slate-500 transition-colors" style={{}}>
              <span className="material-symbols-outlined" style={{}}>chat_bubble</span>
            </button>
            <button className="hover:bg-blue-50 rounded-full p-2 text-slate-500 transition-colors" style={{}}>
              <span className="material-symbols-outlined" style={{}}>settings</span>
            </button>
          </div>
          <div className="h-8 w-px bg-surface-variant" />
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold font-manrope text-blue-900" style={{}}>Tableau de Bord</p>
            <img alt="Profile" className="w-9 h-9 rounded-full border-2 border-white shadow-sm" data-alt="Close up thumbnail of a doctor portrait for profile identification" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeCRI-dV2uAutA0iNJIuQ3rrpfexvsSWX6TN3Q-nN0g-4KADQdJALEwV84HS1DCmVIb_wTc1PbHu2vM1WmF_Q7VizxwEm7WUAtyO54QedirTbd9wpmEwfD8ew_NtRjdR9Dtd4tdhvj2_LgEB59gkFdB0Wxga452YofnlftV1LLIDDrYexPl37BUgSp4S0Rf_SZclUrtUrkTvj6uqWD6OQlj1vj_Fta73uTc_k6E8ZswmGFo1VTBsmT2wPzTlKqT3ifmNAX9EZ9br6u" style={{}} />
          </div>
        </div>
      </header>
      {/* Main Content Canvas */}
      <main className="pt-28 px-10 pb-12">
        {/* Header Section */}
        <section className="mb-10 flex justify-between items-end">
          <div>
            <nav className="flex items-center gap-2 text-xs text-secondary font-medium mb-2">
              <span style={{}}>Espace Clinique</span>
              <span className="material-symbols-outlined text-xs" style={{}}>chevron_right</span>
              <span className="text-primary font-bold" style={{}}>Demandes d'avis</span>
            </nav>
            <h1 className="text-4xl font-extrabold text-on-surface tracking-tight" style={{}}>Demandes d'avis reçues</h1>
            <p className="text-secondary mt-2 max-w-lg" style={{}}>Gérez les demandes de consultation entrantes. Donnez la priorité aux alertes STAT pour assurer la continuité des soins critiques.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-highest text-on-surface-variant rounded-md font-semibold text-sm hover:bg-surface-variant transition-colors" style={{}}>
              <span className="material-symbols-outlined text-sm" style={{}}>filter_list</span>
              Filtrer
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-highest text-on-surface-variant rounded-md font-semibold text-sm hover:bg-surface-variant transition-colors" style={{}}>
              <span className="material-symbols-outlined text-sm" style={{}}>file_download</span>
              Exporter
            </button>
          </div>
        </section>
        {/* Bento Grid Summaries */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          <div className="bg-surface-container-lowest p-6 rounded-xl ambient-shadow flex flex-col justify-between h-32 border-l-4 border-primary">
            <div className="flex justify-between items-start">
              <p className="text-xs font-bold text-secondary uppercase tracking-widest" style={{}}>Total Demandes</p>
              <span className="material-symbols-outlined text-primary opacity-50" style={{}}>description</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-headline" style={{}}>24</span>
              <span className="text-xs text-green-600 font-bold font-body" style={{}}>+12%</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl ambient-shadow flex flex-col justify-between h-32 border-l-4 border-amber-400">
            <div className="flex justify-between items-start">
              <p className="text-xs font-bold text-secondary uppercase tracking-widest" style={{}}>En Attente</p>
              <span className="material-symbols-outlined text-amber-500 opacity-50" style={{}}>hourglass_empty</span>
            </div>
            <div className="text-3xl font-extrabold font-headline" style={{}}>09</div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl ambient-shadow flex flex-col justify-between h-32 border-l-4 border-orange-500">
            <div className="flex justify-between items-start">
              <p className="text-xs font-bold text-secondary uppercase tracking-widest" style={{}}>Urgent</p>
              <span className="material-symbols-outlined text-orange-500 opacity-50" style={{}}>priority_high</span>
            </div>
            <div className="text-3xl font-extrabold font-headline" style={{}}>04</div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl ambient-shadow flex flex-col justify-between h-32 border-l-4 border-tertiary">
            <div className="flex justify-between items-start">
              <p className="text-xs font-bold text-secondary uppercase tracking-widest" style={{}}>STAT</p>
              <span className="material-symbols-outlined text-tertiary animate-pulse" style={{}}>emergency</span>
            </div>
            <div className="text-3xl font-extrabold font-headline text-tertiary" style={{}}>02</div>
          </div>
        </div>
        {/* Clinical Requests Table with fixed header and smooth scroll */}
        <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden border border-surface-variant/20">
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar-container scroll-smooth">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="sticky top-0 z-20 bg-surface-container-low shadow-sm">
                <tr><th className="px-6 py-5 text-xs font-bold text-secondary uppercase tracking-wider font-manrope">Patient Name</th><th className="px-6 py-5 text-xs font-bold text-secondary uppercase tracking-wider font-manrope">ID</th><th className="px-6 py-5 text-xs font-bold text-secondary uppercase tracking-wider font-manrope">Age/Gender</th><th className="px-6 py-5 text-xs font-bold text-secondary uppercase tracking-wider font-manrope">Reason</th><th className="px-6 py-5 text-xs font-bold text-secondary uppercase tracking-wider font-manrope text-center">Urgency</th><th className="px-6 py-5 text-xs font-bold text-secondary uppercase tracking-wider font-manrope">DATE &amp; HEURE</th><th className="px-6 py-5 text-xs font-bold text-secondary uppercase tracking-wider font-manrope">Médecin Référent</th><th className="px-6 py-5 text-xs font-bold text-secondary uppercase tracking-wider font-manrope">Date &amp; Heure</th><th className="px-6 py-5 text-xs font-bold text-secondary uppercase tracking-wider font-manrope text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">{/* STAT Row 1 */}
                <tr className="bg-error-container/10 group transition-colors hover:bg-error-container/20"><td className="px-6 py-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold text-xs">MA</div><span className="font-bold text-on-surface font-manrope">Marc Andreou</span></div></td><td className="px-6 py-5 text-sm font-medium text-secondary">#NX-8821</td><td className="px-6 py-5 text-sm text-on-surface">54Y / M</td><td className="px-6 py-5 text-sm text-on-surface italic max-w-xs truncate">Encéphalopathie aiguë &amp; déséquilibre dialyse</td><td className="px-6 py-5 text-center"><span className="px-3 py-1 bg-tertiary text-white rounded-full text-[10px] font-black uppercase tracking-tighter">STAT</span></td><td className="px-6 py-5 text-sm text-on-surface font-medium">12 Oct 2023, 14:20</td><td className="px-6 py-5 text-sm text-on-surface font-medium">Dr. Sarah Méline</td><td className="px-6 py-5 text-sm text-on-surface font-medium">12 Oct 2023, 14:20</td><td className="px-6 py-5 text-right"><button className="px-4 py-1.5 border border-primary text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all flex items-center gap-2 ml-auto"><span className="material-symbols-outlined text-sm">visibility</span> Détails</button></td></tr>
                {/* Urgent Row */}
                <tr className="group transition-colors hover:bg-surface-container-low"><td className="px-6 py-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-xs">LS</div><span className="font-bold text-on-surface font-manrope">Léa Salmon</span></div></td><td className="px-6 py-5 text-sm font-medium text-secondary">#NX-4432</td><td className="px-6 py-5 text-sm text-on-surface">32Y / F</td><td className="px-6 py-5 text-sm text-on-surface italic max-w-xs truncate">Migraine sévère réfractaire post-séance</td><td className="px-6 py-5 text-center"><span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold uppercase tracking-tight">Urgent</span></td><td className="px-6 py-5 text-sm text-on-surface font-medium">12 Oct 2023, 12:45</td><td className="px-6 py-5 text-sm text-on-surface font-medium">Dr. Marc Laurent</td><td className="px-6 py-5 text-sm text-on-surface font-medium">12 Oct 2023, 12:45</td><td className="px-6 py-5 text-right"><button className="px-4 py-1.5 border border-primary text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all flex items-center gap-2 ml-auto"><span className="material-symbols-outlined text-sm">visibility</span> Détails</button></td></tr>
                {/* Normal Row */}
                <tr className="group transition-colors hover:bg-surface-container-low"><td className="px-6 py-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xs">JP</div><span className="font-bold text-on-surface font-manrope">Jean Petit</span></div></td><td className="px-6 py-5 text-sm font-medium text-secondary">#NX-1029</td><td className="px-6 py-5 text-sm text-on-surface">67Y / M</td><td className="px-6 py-5 text-sm text-on-surface italic max-w-xs truncate">Contrôle neuropathie diabétique</td><td className="px-6 py-5 text-center"><span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-tight">Normal</span></td><td className="px-6 py-5 text-sm text-on-surface font-medium">11 Oct 2023, 16:15</td><td className="px-6 py-5 text-sm text-on-surface font-medium">Dr. Aline Russo</td><td className="px-6 py-5 text-sm text-on-surface font-medium">11 Oct 2023, 16:15</td><td className="px-6 py-5 text-right"><button className="px-4 py-1.5 border border-primary text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all flex items-center gap-2 ml-auto"><span className="material-symbols-outlined text-sm">visibility</span> Détails</button></td></tr>
                {/* STAT Row 2 */}
                <tr className="bg-error-container/10 group transition-colors hover:bg-error-container/20"><td className="px-6 py-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold text-xs">CD</div><span className="font-bold text-on-surface font-manrope">Claire Dubois</span></div></td><td className="px-6 py-5 text-sm font-medium text-secondary">#NX-5501</td><td className="px-6 py-5 text-sm text-on-surface">45Y / F</td><td className="px-6 py-5 text-sm text-on-surface italic max-w-xs truncate">Suspicion AVC hémorragique per-dialyse</td><td className="px-6 py-5 text-center"><span className="px-3 py-1 bg-tertiary text-white rounded-full text-[10px] font-black uppercase tracking-tighter">STAT</span></td><td className="px-6 py-5 text-sm text-on-surface font-medium">11 Oct 2023, 09:10</td><td className="px-6 py-5 text-sm text-on-surface font-medium">Dr. Thomas Hedi</td><td className="px-6 py-5 text-sm text-on-surface font-medium">11 Oct 2023, 09:10</td><td className="px-6 py-5 text-right"><button className="px-4 py-1.5 border border-primary text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all flex items-center gap-2 ml-auto"><span className="material-symbols-outlined text-sm">visibility</span> Détails</button></td></tr>
                {/* Row 5 */}
                <tr className="group transition-colors hover:bg-surface-container-low"><td className="px-6 py-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-xs">AM</div><span className="font-bold text-on-surface font-manrope">Arthur Martin</span></div></td><td className="px-6 py-5 text-sm font-medium text-secondary">#NX-1122</td><td className="px-6 py-5 text-sm text-on-surface">58Y / M</td><td className="px-6 py-5 text-sm text-on-surface italic max-w-xs truncate">Évaluation tremblements essentiels</td><td className="px-6 py-5 text-center"><span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-tight">Normal</span></td><td className="px-6 py-5 text-sm text-on-surface font-medium">11 Oct 2023, 11:30</td><td className="px-6 py-5 text-sm text-on-surface font-medium">Dr. Julie Becker</td><td className="px-6 py-5 text-sm text-on-surface font-medium">11 Oct 2023, 11:30</td><td className="px-6 py-5 text-right"><button className="px-4 py-1.5 border border-primary text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all flex items-center gap-2 ml-auto"><span className="material-symbols-outlined text-sm">visibility</span> Détails</button></td></tr></tbody>
            </table>
          </div>
          <div className="p-4 bg-surface-container-low/50 flex justify-center items-center border-t border-surface-variant/30 text-xs font-semibold text-secondary italic" style={{}}>
            Défilez pour voir les 24 demandes
          </div>
        </div>
        {/* Information Panel */}
        <div className="mt-8 grid grid-cols-12 gap-8">
          <div className="col-span-8">
            <div className="bg-surface-container-high p-8 rounded-2xl h-full flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-4">
                <span className="material-symbols-outlined text-primary" style={{}}>info</span>
                <h4 className="font-bold font-manrope text-xl text-on-surface" style={{}}>Protocole STAT</h4>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-tertiary rounded-full mt-2 shrink-0" />
                  <p className="text-sm text-secondary font-medium" style={{}}>Réponse requise sous 15 minutes.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                  <p className="text-sm text-secondary font-medium" style={{}}>Examen clinique au chevet obligatoire.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                  <p className="text-sm text-secondary font-medium" style={{}}>Rapport d'avis immédiat dans le dossier.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    
  );
}
