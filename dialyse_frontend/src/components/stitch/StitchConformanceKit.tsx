'use client';

export default function StitchConformanceKit() {
  return (
    <div className="bg-surface font-body text-on-surface p-4 md:p-6 lg:p-10">
      {/* BEGIN: MainContainer */}
      {/* Updated max-w-none for full width layout */}
      <main className="print-container w-full max-w-none mx-auto bg-white border border-outline-variant shadow-sm p-6 md:p-10 lg:p-16 min-h-screen flex flex-col" data-purpose="form-wrapper">
        {/* BEGIN: HeaderSection */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 border-b-4 border-on-surface pb-6" data-purpose="form-header">
          <div className="flex items-center mb-4 md:mb-0">
            {/* Placeholder for CHU Andrainjato Logo */}
            <img alt="CHU Andrainjato Logo" className="w-16 h-16 object-contain mr-4" src="https://lh3.googleusercontent.com/aida/ADBb0uiSco477d2uQie3OYbwn0PKjyn8cUlMECnhFVQAWzjWHm1bkaOIKbus0ne0sQfCLZwdNjsjRz4quk6ardqsuixzz5PzqBJVw7_6cHBZrlCzfuB2WWgOZIkHzT3LxSZQPSxALGHS4K8tu6zuRjR64EklSJ-cJhGv2lwINZLUTl9PFBsrIwal_evYcTiXu2b_1a6BKwunElSkNAbrJUE-w00wwc-9uCziYzLS0uC79BBrMcAKFD7YqeB1o2ygLINpnpYHl6GL8PUOghI" />
            <div className="text-left">
              <p className="font-extrabold text-sm uppercase tracking-wider">CHU Andrainjato</p>
              <p className="text-[10px] uppercase opacity-75">Service d'Hémodialyse</p>
            </div>
          </div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold uppercase tracking-widest text-center md:text-right text-primary">
            ORDONNANCE KIT : PREMIÈRE SÉANCE D'HÉMODIALYSE
          </h1>
        </header>
        {/* END: HeaderSection */}
        {/* BEGIN: PatientInformation */}
        <section className="space-y-6 mb-12" data-purpose="patient-details">
          <div className="flex items-end w-full">
            <span className="font-bold whitespace-nowrap text-sm uppercase">Nom et Prénom du patient :</span>
            <div className="flex-grow ml-2"><input aria-label="Nom et Prénom du patient" className="focus:border-primary focus:ring-0 transition-colors border-outline-variant rounded-lg" type="text" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-end">
              <span className="font-bold whitespace-nowrap text-sm uppercase">Age :</span>
              <div className="flex-grow ml-2"><input aria-label="Age" className="focus:border-primary focus:ring-0 transition-colors border-outline-variant rounded-lg" type="text" /></div>
            </div>
            <div className="flex items-end">
              <span className="font-bold whitespace-nowrap text-sm uppercase">Sexe :</span>
              <div className="flex-grow ml-2"><input aria-label="Sexe" className="focus:border-primary focus:ring-0 transition-colors border-outline-variant rounded-lg" type="text" /></div>
            </div>
            <div className="flex items-end">
              <span className="font-bold whitespace-nowrap text-sm uppercase">Poids (kg) :</span>
              <div className="flex-grow ml-2"><input aria-label="Poids en kilogrammes" className="focus:border-primary focus:ring-0 transition-colors border-outline-variant rounded-lg" type="text" /></div>
            </div>
          </div>
          <div className="flex items-end w-full">
            <span className="font-bold whitespace-nowrap text-sm uppercase">Adresse :</span>
            <div className="flex-grow ml-2"><input aria-label="Adresse" className="focus:border-primary focus:ring-0 transition-colors border-outline-variant rounded-lg" type="text" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-end">
              <span className="font-bold whitespace-nowrap text-sm uppercase">Service :</span>
              <div className="flex-grow ml-2"><input aria-label="Service" className="focus:border-primary focus:ring-0 transition-colors border-outline-variant rounded-lg" type="text" /></div>
            </div>
            <div className="flex items-end">
              <span className="font-bold whitespace-nowrap text-sm uppercase">Date de l'ordonnance :</span>
              <div className="flex-grow ml-2"><input aria-label="Date de l'ordonnance" className="focus:border-primary focus:ring-0 transition-colors border-outline-variant rounded-lg" type="text" /></div>
            </div>
          </div>
        </section>
        {/* END: PatientInformation */}
        {/* BEGIN: PharmacyTableSection */}
        <section className="mb-16" data-purpose="pharmacy-table-container">
          <h2 className="font-bold italic mb-6 text-lg text-secondary">1- PHARMACIE : <span className="font-normal text-sm opacity-75 uppercase not-italic">Rayer les mentions inutiles</span></h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm uppercase border-collapse" data-purpose="inventory-table">
              <thead className="bg-surface-container-high text-primary">
                <tr>
                  <th className="w-1/2 font-extrabold text-center py-4">DESIGNATION</th>
                  <th className="w-24 font-extrabold text-center py-4">QTE</th>
                  <th className="font-extrabold text-center py-4">PRIX UNITAIRE</th>
                  <th className="font-extrabold text-center py-4">MONTANT</th>
                </tr>
              </thead>
              <tbody>
                {/* Table Rows */}
                <tr className="border-b border-outline-variant hover:bg-surface-bright transition-colors"><td className="pl-4">Eau non glucose 5L ou 10L</td><td className="text-center font-bold"><input className="w-full text-center font-bold focus:bg-primary-fixed/20 transition-colors bg-transparent m-0 border-none border-outline-variant rounded-lg" placeholder="1" type="number" defaultValue={1} /></td><td><input aria-label="Prix Unitaire" className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td><td><input aria-label="Montant" className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td></tr>
                <tr className="border-b border-outline-variant hover:bg-surface-bright transition-colors"><td className="pl-4">Bétadine jaune 125ml</td><td className="text-center font-bold"><input className="w-full text-center font-bold focus:bg-primary-fixed/20 transition-colors bg-transparent m-0 border-none border-outline-variant rounded-lg" type="number" defaultValue={1} /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td></tr>
                <tr className="border-b border-outline-variant hover:bg-surface-bright transition-colors"><td className="pl-4">Bétadine rouge 125ml</td><td className="text-center font-bold"><input className="w-full text-center font-bold focus:bg-primary-fixed/20 transition-colors bg-transparent m-0 border-none border-outline-variant rounded-lg" type="number" defaultValue={1} /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td></tr>
                <tr className="border-b border-outline-variant hover:bg-surface-bright transition-colors"><td className="pl-4">Lovenox - 6.000 USI</td><td className="text-center font-bold"><input className="w-full text-center font-bold focus:bg-primary-fixed/20 transition-colors bg-transparent m-0 border-none border-outline-variant rounded-lg" type="number" defaultValue={1} /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td></tr>
                <tr className="border-b border-outline-variant hover:bg-surface-bright transition-colors"><td className="pl-4">Lidocaine 2% inj</td><td className="text-center font-bold"><input className="w-full text-center font-bold focus:bg-primary-fixed/20 transition-colors bg-transparent m-0 border-none border-outline-variant rounded-lg" type="number" defaultValue={1} /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td></tr>
                <tr className="border-b border-outline-variant hover:bg-surface-bright transition-colors"><td className="pl-4">Compresse stérile 40X40</td><td className="text-center font-bold"><input className="w-full text-center font-bold focus:bg-primary-fixed/20 transition-colors bg-transparent m-0 border-none border-outline-variant rounded-lg" type="number" defaultValue={1} /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td></tr>
                <tr className="border-b border-outline-variant hover:bg-surface-bright transition-colors"><td className="pl-4">Fil à peau 3,0</td><td className="text-center font-bold"><input className="w-full text-center font-bold focus:bg-primary-fixed/20 transition-colors bg-transparent m-0 border-none border-outline-variant rounded-lg" type="number" defaultValue={1} /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td></tr>
                <tr className="border-b border-outline-variant hover:bg-surface-bright transition-colors"><td className="pl-4">Gant d'examen non stérile</td><td className="text-center font-bold"><input className="w-full text-center font-bold focus:bg-primary-fixed/20 transition-colors bg-transparent m-0 border-none border-outline-variant rounded-lg" type="number" defaultValue={1} /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td></tr>
                <tr className="border-b border-outline-variant hover:bg-surface-bright transition-colors"><td className="pl-4 font-bold">Gant stérile 7</td><td className="text-center font-bold"><input className="w-full text-center font-bold focus:bg-primary-fixed/20 transition-colors bg-transparent m-0 border-none border-outline-variant rounded-lg" type="number" defaultValue={1} /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td></tr>
                <tr className="border-b border-outline-variant hover:bg-surface-bright transition-colors"><td className="pl-4">Ligne artério-veineuse</td><td className="text-center font-bold"><input className="w-full text-center font-bold focus:bg-primary-fixed/20 transition-colors bg-transparent m-0 border-none border-outline-variant rounded-lg" type="number" defaultValue={1} /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td></tr>
                <tr className="border-b border-outline-variant hover:bg-surface-bright transition-colors"><td className="pl-4">Masque chirurgical</td><td className="text-center font-bold"><input className="w-full text-center font-bold focus:bg-primary-fixed/20 transition-colors bg-transparent m-0 border-none border-outline-variant rounded-lg" type="number" defaultValue={1} /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td></tr>
                <tr className="border-b border-outline-variant hover:bg-surface-bright transition-colors"><td className="pl-4">Rein artificiel (Dialyseur) F6/F7/F8/F10</td><td className="text-center font-bold"><input className="w-full text-center font-bold focus:bg-primary-fixed/20 transition-colors bg-transparent m-0 border-none border-outline-variant rounded-lg" type="number" defaultValue={1} /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td></tr>
                <tr className="border-b border-outline-variant hover:bg-surface-bright transition-colors"><td className="pl-4">Seringue 10cc</td><td className="text-center font-bold"><input className="w-full text-center font-bold focus:bg-primary-fixed/20 transition-colors bg-transparent m-0 border-none border-outline-variant rounded-lg" type="number" defaultValue={1} /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td></tr>
                <tr className="border-b border-outline-variant hover:bg-surface-bright transition-colors"><td className="pl-4">Seringue 20cc</td><td className="text-center font-bold"><input className="w-full text-center font-bold focus:bg-primary-fixed/20 transition-colors bg-transparent m-0 border-none border-outline-variant rounded-lg" type="number" defaultValue={1} /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td></tr>
                <tr className="border-b border-outline-variant hover:bg-surface-bright transition-colors"><td className="pl-4">Seringue 5cc</td><td className="text-center font-bold"><input className="w-full text-center font-bold focus:bg-primary-fixed/20 transition-colors bg-transparent m-0 border-none border-outline-variant rounded-lg" type="number" defaultValue={1} /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td><td><input className="w-full text-right focus:bg-primary-fixed/20 transition-colors border-outline-variant rounded-lg" type="text" /></td></tr>
                {/* Total Row */}
                <tr className="bg-primary-container text-on-primary-container font-extrabold border-b border-outline-variant hover:bg-surface-bright transition-colors">
                  <td className="text-left px-4 py-4">TOTAL</td>
                  <td className="text-center py-4">3</td>
                  <td><input className="w-full text-right font-extrabold focus:bg-primary-fixed/20 transition-colors bg-transparent border-outline-variant rounded-lg" type="text" /></td>
                  <td><input className="w-full text-right font-extrabold focus:bg-primary-fixed/20 transition-colors bg-transparent border-outline-variant rounded-lg" type="text" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        {/* END: PharmacyTableSection */}
        {/* BEGIN: FooterSignatures */}
        <footer className="mt-auto pt-16" data-purpose="footer-signatures">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center text-xs font-bold uppercase tracking-widest">
            <div className="flex flex-col items-center">
              <div className="w-full border-t-2 border-on-surface mb-4" />
              <span className="px-2">LE DIRECTEUR D'ETABLISSEMENT</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full border-t-2 border-on-surface mb-4" />
              <span className="px-2">LE PRESCRIPTEUR</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full border-t-2 border-on-surface mb-4" />
              <span className="px-2">LE DISPENSATEUR</span>
            </div>
          </div>
        </footer>
        {/* END: FooterSignatures */}
        {/* BEGIN: Actions (Non-printing) */}
        <div className="no-print mt-16 flex justify-end gap-4 border-t border-outline-variant pt-8"><button className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold hover:bg-on-primary-fixed-variant hover:shadow-xl active:scale-95 transition-all duration-300 flex items-center gap-3 group shadow-md" type="button" onClick={() => {
                          console.log("Enregistrer le formulaire");
                        }}>
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">save</span>
            Enregistrer le formulaire
          </button>
          <button className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold hover:bg-on-primary-fixed-variant hover:shadow-xl active:scale-95 transition-all duration-300 flex items-center gap-3 group shadow-md" type="button" onClick={() => window.print()}>
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">print</span>
            Imprimer le formulaire
          </button>
        </div>
        {/* END: Actions */}
      </main>
      {/* END: MainContainer */}
    </div>
    
  );
}
