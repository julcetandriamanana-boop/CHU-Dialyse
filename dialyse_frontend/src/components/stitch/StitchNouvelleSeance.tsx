'use client';

export default function StitchNouvelleSeance() {
  return (
    <div className="text-on-surface">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-6 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm shadow-blue-900/5">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-200 ease-in-out active:scale-95 text-slate-500">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="text-xl font-black tracking-tight text-blue-800 dark:text-blue-300 font-headline">Ethereal Dialysis</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-slate-500">notifications</span>
          <span className="material-symbols-outlined text-slate-500">account_circle</span>
        </div>
      </nav>
      <main className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="mb-10 text-left">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold mb-4">
            <span className="material-symbols-outlined text-sm mr-1">medical_services</span>
            Nouvelle Session
          </div>
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">Démarrer une nouvelle séance</h1>
          <p className="text-secondary body-md">Veuillez renseigner les paramètres cliniques du patient pour initialiser la procédure de dialyse.</p>
        </header>
        {/* Main Form Grid (Asymmetric Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Patient & Weights */}
          <div className="lg:col-span-7 space-y-6">
            {/* Patient Identification Card */}
            <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm shadow-blue-900/5 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">badge</span>
                </div>
                <h2 className="text-xl font-bold font-headline">Identification du Patient</h2>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-xs font-semibold text-secondary mb-1 uppercase tracking-wider">ID Patient</label>
                  <input className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-outline-variant" placeholder="Ex: PT-8829-X" type="text" />
                </div>
                <div className="p-4 bg-surface-container-low rounded-lg flex items-center gap-4">
                  <img className="w-12 h-12 rounded-full object-cover" data-alt="Portrait of a mature patient with a friendly expression in a clinical setting with soft natural light" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBb9-rwklwx3tSi8n0yXkOADp45Ph-Igtc7t-8_kQ-G0TE-_AaH9i8JatMdIdGipFP9Vh4LUrebDuiI6GKDW_KDO4BC2n-rN6Vw9EowwORbUYzV2Gf-U7aQxAL50u7wNzyW4y8_AoAptSs6oEDNxv3EY_k2HTza6aU63MA76N99H0Bif3nXQvkbXsvpXJ9LQGJZC6UT4QOxeom1nMkaUGr--NKtzETf_iapVgKzKAg6oT9Lam4h-n7nF9sPj4Lee1db3aU-D1lIClu5" />
                  <div>
                    <p className="text-sm font-bold text-on-surface">Recherche rapide...</p>
                    <p className="text-xs text-secondary">Saisissez l'ID pour charger le profil</p>
                  </div>
                </div>
              </div>
            </section>
            {/* Weight Analysis Card */}
            <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm shadow-blue-900/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">monitor_weight</span>
                </div>
                <h2 className="text-xl font-bold font-headline">Mesures de Poids</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-xs font-semibold text-secondary mb-1 uppercase tracking-wider">Poids actuel (kg)</label>
                  <input className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary transition-all text-on-surface font-medium text-lg" placeholder="00.0" step="0.1" type="number" />
                </div>
                <div className="relative">
                  <label className="block text-xs font-semibold text-secondary mb-1 uppercase tracking-wider">Poids sec (kg)</label>
                  <input className="w-full bg-surface-container-highest border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary transition-all text-on-surface font-medium text-lg" placeholder="00.0" step="0.1" type="number" />
                </div>
              </div>
              <div className="mt-8 p-6 bg-surface-container-low rounded-lg border-l-4 border-primary">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Objectif UF calculé</p>
                    <p className="text-3xl font-black text-primary font-headline">-- <span className="text-lg font-normal text-secondary">kg</span></p>
                  </div>
                  <div className="h-12 w-24 opacity-20">
                    {/* Vitality Sparkline Placeholder */}
                    <svg className="w-full h-full stroke-primary fill-none stroke-2" viewBox="0 0 100 40">
                      <path d="M0 30 Q 20 10 40 30 T 80 10 T 100 30" />
                    </svg>
                  </div>
                </div>
              </div>
            </section>
          </div>
          {/* Right Column: Kit & Confirmation */}
          <div className="lg:col-span-5 space-y-6">
            {/* Kit Selection Card */}
            <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm shadow-blue-900/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
                <h2 className="text-xl font-bold font-headline">Sélection du Kit</h2>
              </div>
              <div className="space-y-3">
                <label className="relative flex items-center p-4 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-low transition-all group">
                  <input className="w-5 h-5 text-primary border-outline-variant focus:ring-primary" name="kit" type="radio" defaultValue="A" />
                  <div className="ml-4">
                    <span className="block text-sm font-bold text-on-surface">Kit A</span>
                    <span className="block text-xs text-secondary">Standard Flux - Dialyseur F60S</span>
                    <a className="inline-flex mt-2 items-center gap-2 rounded-full border border-primary px-3 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10 transition" href="/dialyses/fiche-surveillance" target="_blank" rel="noopener noreferrer">
                      <span className="material-symbols-outlined text-sm">open_in_new</span>Ouvrir la fiche
                    </a>
                  </div>
                  <span className="ml-auto material-symbols-outlined text-outline-variant group-hover:text-primary">check_circle</span>
                </label>
                <label className="relative flex items-center p-4 border border-primary bg-primary-fixed/20 rounded-lg cursor-pointer transition-all group">
                  <input defaultChecked className="w-5 h-5 text-primary border-outline-variant focus:ring-primary" name="kit" type="radio" defaultValue="B" />
                  <div className="ml-4">
                    <span className="block text-sm font-bold text-on-surface">Kit B</span>
                    <span className="block text-xs text-secondary">Haut Flux - Dialyseur FX80</span>
                    <a className="inline-flex mt-2 items-center gap-2 rounded-full border border-primary px-3 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10 transition" href="/dialyses/fiche-surveillance" target="_blank" rel="noopener noreferrer">
                      <span className="material-symbols-outlined text-sm">open_in_new</span>Ouvrir la fiche
                    </a>
                  </div>
                  <span className="ml-auto material-symbols-outlined text-primary" style={{fontVariationSettings: '"FILL" 1'}}>check_circle</span>
                </label>
                <label className="relative flex items-center p-4 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-low transition-all group">
                  <input className="w-5 h-5 text-primary border-outline-variant focus:ring-primary" name="kit" type="radio" defaultValue="C" />
                  <div className="ml-4">
                    <span className="block text-sm font-bold text-on-surface">Kit C</span>
                    <span className="block text-xs text-secondary">Pédiatrique / Spécialisé</span>
                    <a className="inline-flex mt-2 items-center gap-2 rounded-full border border-primary px-3 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10 transition" href="/dialyses/fiche-surveillance" target="_blank" rel="noopener noreferrer">
                      <span className="material-symbols-outlined text-sm">open_in_new</span>Ouvrir la fiche
                    </a>
                  </div>
                  <span className="ml-auto material-symbols-outlined text-outline-variant group-hover:text-primary">check_circle</span>
                </label>
              </div>
            </section>
            {/* Action Card */}
            <section className="glass-effect p-8 rounded-xl shadow-lg shadow-blue-900/10 border border-white/40">
              <div className="space-y-4">
                <button className="w-full signature-gradient text-on-primary font-bold py-4 rounded-md shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">play_circle</span>
                  Initialiser la séance 
                </button>
                <div className="flex items-center gap-2 text-xs text-secondary px-2">
                  <span className="material-symbols-outlined text-sm">info</span>
                  L'initialisation génère un rapport de pré-séance automatique.
                </div>
                <div className="pt-4 border-t border-outline-variant/30">
                  <button className="w-full py-3 text-secondary hover:text-on-surface font-medium text-sm flex items-center justify-center gap-2 transition-colors" type="button" onClick={() => alert("Programmation du RDV en cours...")}>
                    <span className="text-[11px] font-bold uppercase">PROGRAMMER RDV 2ème séance</span>
                  </button>
                  <button className="w-full py-3 text-secondary hover:text-on-surface font-medium text-sm flex items-center justify-center gap-2 transition-colors">
                    <span className="material-symbols-outlined">close</span>
                    Annuler et retourner au tableau de bord
                  </button>
                </div>
              </div>
            </section>
            {/* Visual Anchor Image */}
            <div className="rounded-xl overflow-hidden h-48 relative shadow-sm">
              <img className="w-full h-full object-cover" data-alt="Modern medical facility interior with sterile equipment and soft blue ambient lighting reflecting on clean surfaces" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3jffQl58VMT3Ry68l-4KOC1bgKCVomuppMohYAczD5jGC7QW_DgYv0pJfWhLN_aDWCTocLM6SynW7HoCdGuJKd88xkLdbDGblM5qVWOoJZ9iitDvd1OKK9ip1IzA7hZHM456sqs37afRANwMLYWeueMKOp4vfI3Uxv5k1Q2UQTRikcKA63EozaxgTFBzi4_JWPbaUyLc-ZvAgHhGswaNLZ3--GUTK21oKcXgTI_RzMMA8O5xleI7FbxJxPSAgXaQ85NMjd1fc9izN" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <p className="text-white  text-xs font-medium">Station de dialyse prête pour protocole</p>
              </div>
            </div>
          </div>
        </div>
        {/* Warning Section (Bottom) */}
        <footer className="mt-12 p-6 rounded-xl bg-error-container/30 border border-error-container flex gap-4 items-start">
          <span className="material-symbols-outlined text-tertiary">warning</span>
          <div>
            <h4 className="text-sm font-bold text-on-tertiary-fixed-variant mb-1">Alerte de Sécurité Clinique</h4>
            <p className="text-xs text-on-error-container leading-relaxed">Assurez-vous que tous les paramètres correspondent à la prescription médicale avant de cliquer sur 'Initialiser'. Une vérification du patient par double identification est obligatoire selon le protocole de l'établissement.</p>
          </div>
        </footer>
      </main>
    </div>
    
  );
}
