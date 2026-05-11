'use client';

export default function StitchListeMateriels() {
  return (
    <div className="h-full flex flex-col">
      {/* BEGIN: Main Layout Wrapper */}
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        {/* BEGIN: Header */}
        <header className="bg-white border-b border-surface-container-highest px-8 py-4 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-4">
            <img alt="CHU Andrainjato Logo" className="h-12 w-12 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7T7oWCxtmkesSGYkMx-xM6HJ88IyPvyI-dH3_4EomecdnOGzHQkkDCAV6VdkyG14mmNSwQlRnQaOl15_CseWJW5omfu6WSfS5SNM9AhAzL3CByDPuhmn-6ZZZ1Lp7F7VVdDZbsSsyKZ4Gk2hNU7zb_lHvP1poO--yx_kLtOFJShM5OAUQmvlZRTMWz2wF_ZrFkr0_UDT7YGkiXamuVCD1eD0CQ8tP_majzyIi8p3dP-d6K0y_rpwShVmAUhCrej847e0sjW2Ua9MB" />
            <div>
              <h1 className="text-xl font-extrabold text-primary tracking-tight uppercase">CHU ANDRAINJATO</h1>
              <p className="text-[10px] text-on-surface-variant font-bold tracking-widest uppercase">Clinical Precision System</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-on-surface-variant">KIT HÉMODIALYSE</div>
            <div className="text-2xl font-black text-surface-container-highest">FORM-02</div>
          </div>
        </header>
        {/* BEGIN: Content Area (Full Screen Scrolling) */}
        <main className="flex-grow overflow-y-auto custom-scrollbar bg-surface-container-low p-4 md:p-8 flex justify-center">
          <div className="bg-white w-full max-w-5xl shadow-sm border border-surface-container rounded-xl flex flex-col">
            {/* Content Padding Container */}
            <div className="p-8 md:p-12 space-y-12">
              {/* BEGIN: Identity & Description Section */}
              <section className="space-y-6 max-w-3xl">
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label className="text-on-surface font-medium whitespace-nowrap">Volan'ny olona manana sonia eo ambanin'ny marary voalaza anarana etsy ambony:</label>
                    <input className="flex-grow border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-1 px-0 text-on-surface" placeholder="(Anarana)" type="text" />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label className="text-on-surface font-medium whitespace-nowrap">Izay (Havana, namana, mpiantoka, ......) ny marary voalaza anarana etsy ambony:</label>
                    <input className="flex-grow border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-1 px-0 text-on-surface" placeholder="(Antsipiriany)" type="text" />
                  </div>
                </div>
              </section>
              {/* BEGIN: Checklist Section */}
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-primary rounded-full" />
                  <h2 className="text-2xl font-extrabold text-on-surface">NY ILAINA (MATÉRIELS NÉCESSAIRES)</h2>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {/* Checklist Item 1 */}
                  <label className="flex items-center p-4 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer group border border-transparent hover:border-surface-container">
                    <div className="relative flex items-center">
                      <input className="peer w-6 h-6 rounded-lg border-2 border-outline-variant text-primary focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer" type="checkbox" />
                      <div className="absolute inset-0 pointer-events-none opacity-0 peer-checked:opacity-100 flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-grow flex justify-between items-center">
                      <span className="font-semibold text-on-surface text-lg peer-checked:text-on-surface-variant peer-checked:line-through transition-all">SSI 0.9% 500 ml</span>
                      <span className="bg-surface-container-highest px-4 py-1.5 rounded-full text-sm font-bold font-mono text-on-surface-variant">06 FLACONS</span>
                    </div>
                  </label>
                  {/* Checklist Item 2 */}
                  <label className="flex items-center p-4 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer group border border-transparent hover:border-surface-container">
                    <div className="relative flex items-center">
                      <input className="peer w-6 h-6 rounded-lg border-2 border-outline-variant text-primary focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer" type="checkbox" />
                    </div>
                    <div className="ml-4 flex-grow flex justify-between items-center">
                      <span className="font-semibold text-on-surface text-lg">Oxigen solution 500 ml</span>
                      <span className="bg-surface-container-highest px-4 py-1.5 rounded-full text-sm font-bold font-mono text-on-surface-variant">01 FLACON</span>
                    </div>
                  </label>
                  {/* Checklist Item 3 */}
                  <label className="flex items-center p-4 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer group border border-transparent hover:border-surface-container">
                    <div className="relative flex items-center">
                      <input className="peer w-6 h-6 rounded-lg border-2 border-outline-variant text-primary focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer" type="checkbox" />
                    </div>
                    <div className="ml-4 flex-grow flex justify-between items-center">
                      <span className="font-semibold text-on-surface text-lg">Securifix 10 X 25</span>
                      <span className="bg-surface-container-highest px-4 py-1.5 rounded-full text-sm font-bold font-mono text-on-surface-variant">02</span>
                    </div>
                  </label>
                  {/* Checklist Item 4 */}
                  <label className="flex items-center p-4 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer group border border-transparent hover:border-surface-container">
                    <div className="relative flex items-center">
                      <input className="peer w-6 h-6 rounded-lg border-2 border-outline-variant text-primary focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer" type="checkbox" />
                    </div>
                    <div className="ml-4 flex-grow flex justify-between items-center">
                      <span className="font-semibold text-on-surface text-lg">Calot chirurgical</span>
                      <span className="bg-surface-container-highest px-4 py-1.5 rounded-full text-sm font-bold font-mono text-on-surface-variant">06</span>
                    </div>
                  </label>
                  {/* Checklist Item 5 */}
                  <label className="flex items-center p-4 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer group border border-transparent hover:border-surface-container">
                    <div className="relative flex items-center">
                      <input className="peer w-6 h-6 rounded-lg border-2 border-outline-variant text-primary focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer" type="checkbox" />
                    </div>
                    <div className="ml-4 flex-grow flex justify-between items-center">
                      <span className="font-semibold text-on-surface text-lg">Cathéter double voie pour dialyse 20 cm / 15</span>
                      <span className="bg-surface-container-highest px-4 py-1.5 rounded-full text-sm font-bold font-mono text-on-surface-variant">01</span>
                    </div>
                  </label>
                  {/* Checklist Item 6 */}
                  <label className="flex items-center p-4 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer group border border-transparent hover:border-surface-container">
                    <div className="relative flex items-center">
                      <input className="peer w-6 h-6 rounded-lg border-2 border-outline-variant text-primary focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer" type="checkbox" />
                    </div>
                    <div className="ml-4 flex-grow flex justify-between items-center">
                      <span className="font-semibold text-on-surface text-lg">Solucart 750g</span>
                      <span className="bg-surface-container-highest px-4 py-1.5 rounded-full text-sm font-bold font-mono text-on-surface-variant">01</span>
                    </div>
                  </label>
                  {/* Checklist Item 7 */}
                  <label className="flex items-center p-4 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer group border border-transparent hover:border-surface-container">
                    <div className="relative flex items-center">
                      <input className="peer w-6 h-6 rounded-lg border-2 border-outline-variant text-primary focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer" type="checkbox" />
                    </div>
                    <div className="ml-4 flex-grow flex justify-between items-center">
                      <span className="font-semibold text-on-surface text-lg">Rasoirs (épiceries)</span>
                      <span className="bg-surface-container-highest px-4 py-1.5 rounded-full text-sm font-bold font-mono text-on-surface-variant">02</span>
                    </div>
                  </label>
                </div>
              </section>
            </div>
            {/* BEGIN: Signature & Action Footer Container */}
            <div className="mt-auto border-t border-surface-container">
              <div className="p-8 md:p-12 bg-surface-container-lowest">
                <div className="flex flex-col md:flex-row justify-between items-end gap-12">
                  {/* Left: Witness Signature */}
                  <div className="w-full md:w-1/2 space-y-4">
                    <label className="text-on-surface font-extrabold uppercase text-xs tracking-widest">Sonia ny vavolombelona / Signature Témoin</label>
                    <div className="h-24 w-full bg-slate-50 border-2 border-dashed border-outline-variant rounded-xl flex items-center justify-center text-outline text-sm italic">
                      Sonia eto
                    </div>
                    <input className="w-full border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-1 px-0 text-center" placeholder="Anarana sy Fanampiny" type="text" />
                  </div>
                  {/* Right: Medical Authority Signature */}
                  <div className="w-full md:w-1/2 space-y-4">
                    <label className="text-on-surface font-extrabold uppercase text-xs tracking-widest">Sonia ny mpitsabo / Visa Médical</label>
                    <div className="h-24 w-full bg-slate-50 border-2 border-dashed border-outline-variant rounded-xl flex items-center justify-center text-outline text-sm italic">
                      Tombokase sy Sonia
                    </div>
                    <input className="w-full border-0 border-b border-outline-variant focus:ring-0 focus:border-primary py-1 px-0 text-center" placeholder="Anaran'ny Mpitsabo" type="text" />
                  </div>
                </div>
              </div>
              {/* System Footer */}
              <div className="bg-surface-container px-8 py-4 flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center gap-4 text-[10px] font-bold text-on-surface-variant tracking-wider">
                  <span>DOCUMENT MÉDICAL</span>
                  <span className="h-4 w-px bg-outline-variant" />
                  <span>VITALIS CORE V1.0</span>
                </div>
                <div className="mt-4 md:mt-0 no-print flex gap-4">
                  <button className="bg-primary-container text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-primary transition-all shadow-lg active:scale-95">
                    <span className="material-symbols-outlined">save</span>
                    Enregistrer les données
                  </button><button className="bg-primary text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-primary-container transition-all shadow-lg active:scale-95" type="button" onClick={() => window.print()}>
                    <span className="material-symbols-outlined">print</span>
                    Hivoaka pirinty
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    
  );
}
