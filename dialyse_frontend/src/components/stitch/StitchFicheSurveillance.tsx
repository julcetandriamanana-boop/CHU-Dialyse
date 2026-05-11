'use client';

export default function StitchFicheSurveillance() {
  return (
    <div className="text-clinical-900 antialiased bg-surface-container py-12 px-4">
      {/* BEGIN: MainContainer */}
      <main className="print-container border border-gray-200 rounded-md p-12 shadow-2xl">
        {/* BEGIN: HeaderSection */}
        <header className="flex flex-col items-center mb-6 border-b-2 border-brand pb-4">
          <div className="w-full flex justify-between items-start mb-4">
            {/* Logo Placeholder for CHU Andrainjato */}
            <div className="flex items-center gap-3">
              <img alt="CHU Andrainjato Logo" className="h-16 object-contain" data-purpose="hospital-logo" src="https://lh3.googleusercontent.com/aida/ADBb0ujRbTYfb5T1VZi9USqJuL6pWtBiUkOe3ltDfyII3cztdPhXX9Jf6-j9pZjuMvtbe83yesWhRp4W8lQrkKtLHcSKgQtGi3TJjfokEPtP_YqgPg2DxnjmpADbAg80DrUQ5R8Q332vH6EhmaVZC1sqjQ0W7GVrktsdJt9Rvx2Sie3uvzgSz1HRYhaVC2QhU0p6RcDmmNEUp8o15ikkMATv30DGMnt-DOm5u1NIObPdGJhy8_0ED1Pw3J2LETd9VrqK1COWqbxNef3vCg" />
              <div className="text-xs font-bold text-clinical-700 leading-tight uppercase">
                Centre Hospitalier Universitaire<br />Andrainjato Fianarantsoa
              </div>
            </div>
            <div className="text-right text-[10px] text-gray-500 font-medium">
              Réf: CLIN-HEMO-042<br />Version: 2023.1
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-brand tracking-wider uppercase text-primary font-headline">Fiche de Surveillance - Hémodialyse</h1>
        </header>
        {/* END: HeaderSection */}
        {/* BEGIN: PatientIdentification */}
        <section className="grid grid-cols-12 gap-y-4 gap-x-6 mb-8 text-sm p-6 rounded-lg border border-outline-variant shadow-sm bg-surface-container-low" data-purpose="identification-section">
          <div className="col-span-6 flex items-baseline border-b border-dotted border-gray-400">
            <label className="font-bold mr-2 whitespace-nowrap">Nom :</label>
            <input className="w-full border-none p-0 focus:ring-0 text-clinical-700 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
          </div>
          <div className="col-span-6 flex items-baseline border-b border-dotted border-gray-400">
            <label className="font-bold mr-2 whitespace-nowrap">Prénoms :</label>
            <input className="w-full border-none p-0 focus:ring-0 text-clinical-700 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
          </div>
          <div className="col-span-2 flex items-baseline border-b border-dotted border-gray-400">
            <label className="font-bold mr-2">Age :</label>
            <input className="w-full border-none p-0 focus:ring-0 text-clinical-700 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
          </div>
          <div className="col-span-3 flex items-center gap-4">
            <span className="font-bold">Sexe :</span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input className="w-4 h-4 rounded border-outline text-brand focus:ring-brand cursor-pointer transition-all hover:scale-110 accent-brand focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="checkbox" />
              <span className="text-xs font-medium">M</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input className="w-4 h-4 rounded border-outline text-brand focus:ring-brand cursor-pointer transition-all hover:scale-110 accent-brand focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="checkbox" />
              <span className="text-xs font-medium">F</span>
            </label>
          </div>
          <div className="col-span-7 flex items-baseline border-b border-dotted border-gray-400">
            <label className="font-bold mr-2">Tél :</label>
            <input className="w-full border-none p-0 focus:ring-0 text-clinical-700 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
          </div>
          <div className="col-span-4 flex items-baseline border-b border-dotted border-gray-400">
            <label className="font-bold mr-2">DATE :</label>
            <input className="w-full border-none p-0 focus:ring-0 text-clinical-700 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="date" />
          </div>
          <div className="col-span-3 flex items-baseline border-b border-dotted border-gray-400">
            <label className="font-bold mr-2 whitespace-nowrap">SÉANCE N° :</label>
            <input className="w-full border-none p-0 focus:ring-0 text-clinical-700 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
          </div>
          <div className="col-span-5 flex items-baseline border-b border-dotted border-gray-400">
            <label className="font-bold mr-2 whitespace-nowrap">INFIRMIÈRE :</label>
            <input className="w-full border-none p-0 focus:ring-0 text-clinical-700 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
          </div>
        </section>
        {/* END: PatientIdentification */}
        {/* BEGIN: TechnicalParameters */}
        <section className="mb-8 p-4 border border-clinical-200 rounded-md text-xs bg-surface-container-low border-outline-variant" data-purpose="technical-parameters">
          <div className="grid grid-cols-12 gap-x-4 gap-y-3">
            <div className="col-span-7 flex items-center border-b border-gray-300 pb-1">
              <span className="font-bold mr-2">DIALYSAT :</span>
              <input className="flex-grow border-none p-0 h-4 text-clinical-700 focus:ring-0 text-xs focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
              <span className="text-[10px] text-gray-500 ml-2 italic">Conductivité programmée</span>
            </div>
            <div className="col-span-5 flex items-center border-b border-gray-300 pb-1">
              <span className="font-bold mr-2 uppercase">Générateur :</span>
              <input className="flex-grow border-none p-0 h-4 text-clinical-700 focus:ring-0 text-xs focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
            </div>
            <div className="col-span-3 flex items-center border-b border-gray-300 pb-1">
              <span className="font-bold mr-2 uppercase">Poste n° :</span>
              <input className="flex-grow border-none p-0 h-4 text-clinical-700 focus:ring-0 text-xs focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
            </div>
            <div className="col-span-3 flex items-center border-b border-gray-300 pb-1">
              <span className="font-bold mr-2 uppercase">T.A. :</span>
              <input className="flex-grow border-none p-0 h-4 text-clinical-700 focus:ring-0 text-xs focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
            </div>
            <div className="col-span-3 flex items-center border-b border-gray-300 pb-1">
              <span className="font-bold mr-2 uppercase">Bicar :</span>
              <input className="flex-grow border-none p-0 h-4 text-clinical-700 focus:ring-0 text-xs focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
            </div>
            <div className="col-span-3 flex items-center border-b border-gray-300 pb-1">
              <span className="font-bold mr-2 uppercase">Dialyseur : F</span>
              <input className="flex-grow border-none p-0 h-4 text-clinical-700 focus:ring-0 text-xs focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
            </div>
            <div className="col-span-3 flex items-center border-b border-gray-300 pb-1">
              <span className="font-bold mr-2 uppercase">R. n° :</span>
              <input className="flex-grow border-none p-0 h-4 text-clinical-700 focus:ring-0 text-xs focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
            </div>
            <div className="col-span-3 flex items-center border-b border-gray-300 pb-1">
              <span className="font-bold mr-2 uppercase">Profil Na :</span>
              <input className="flex-grow border-none p-0 h-4 text-clinical-700 focus:ring-0 text-xs focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
            </div>
            <div className="col-span-3 flex items-center border-b border-gray-300 pb-1">
              <span className="font-bold mr-2 uppercase">Profil UF :</span>
              <input className="flex-grow border-none p-0 h-4 text-clinical-700 focus:ring-0 text-xs focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
            </div>
            <div className="col-span-3 flex items-center border-b border-gray-300 pb-1 col-span-4">
              <span className="font-bold mr-2 uppercase">FAV :</span>
              <input className="flex-grow border-none p-0 h-4 text-clinical-700 focus:ring-0 text-xs focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
            </div>
            <div className="col-span-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold uppercase">Cathéter sinuso :</span>
                <input className="w-4 h-4 rounded border-outline text-brand focus:ring-brand cursor-pointer transition-all hover:scale-110 accent-brand focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" placeholder="on" type="checkbox" defaultValue />
              </div>
            </div>
            <div className="col-span-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold uppercase">Catheter tunnel :</span>
                <input className="w-4 h-4 rounded border-outline text-brand focus:ring-brand cursor-pointer transition-all hover:scale-110 accent-brand focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="checkbox" />
              </div>
            </div>
            <div className="col-span-4 flex items-center gap-4">
              <span className="font-bold">X : 2</span>
              <div className="flex items-center gap-2 ml-4">
                <span className="font-bold uppercase whitespace-nowrap">T° Dialysat :</span>
                <span className="font-semibold">36°5C</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="font-bold uppercase">Aiguilles : G</span>
                <input className="w-8 border-b border-gray-300 border-t-0 border-l-0 border-r-0 p-0 h-4 focus:ring-0 text-xs text-center focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
              </div>
            </div>
            <div className="col-span-12 grid grid-cols-3 gap-8 mt-2 border-t border-clinical-200 pt-3">
              <div className="flex items-center border-b border-gray-300 pb-1">
                <span className="font-bold mr-2 uppercase">Heure début HD :</span>
                <input className="flex-grow border-none p-0 h-4 text-clinical-700 focus:ring-0 text-xs focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" placeholder="21:51" type="time" />
              </div>
              <div className="flex items-center border-b border-gray-300 pb-1">
                <span className="font-bold mr-2 uppercase whitespace-nowrap">Ca : 1,5</span>
                <input className="flex-grow border-none p-0 h-4 text-clinical-700 focus:ring-0 text-xs focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
              </div>
              <div className="flex items-center border-b border-gray-300 pb-1">
                <span className="font-bold mr-2 uppercase whitespace-nowrap">Débit dialysat : 300</span>
                <input className="flex-grow border-none p-0 h-4 text-clinical-700 focus:ring-0 text-xs focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
              </div>
            </div>
          </div>
        </section>
        {/* END: TechnicalParameters */}
        {/* BEGIN: PrePostMeasurements */}
        <section className="grid grid-cols-2 gap-8 mb-8" data-purpose="vital-signs">
          {/* Avant Section */}
          <div className="border-l-4 border-brand pl-4">
            <h3 className="font-black text-sm uppercase mb-3 tracking-tighter text-primary-fixed-variant">AVANT</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-baseline border-b border-dotted border-gray-400 pb-0.5">
                <span className="w-24 font-bold">Poids :</span>
                <input className="w-full border-none p-0 focus:ring-0 h-4 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
              </div>
              <div className="flex items-baseline border-b border-dotted border-gray-400 pb-0.5">
                <span className="w-24 font-bold">T.A. :</span>
                <input className="w-full border-none p-0 focus:ring-0 h-4 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
              </div>
              <div className="flex items-baseline border-b border-dotted border-gray-400 pb-0.5">
                <span className="w-24 font-bold">FC :</span>
                <input className="w-full border-none p-0 focus:ring-0 h-4 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
              </div>
              <div className="flex items-baseline border-b border-dotted border-gray-400 pb-0.5">
                <span className="w-24 font-bold">Température :</span>
                <input className="w-full border-none p-0 focus:ring-0 h-4 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
              </div>
              <div className="flex items-baseline border-b border-dotted border-gray-400 pb-0.5">
                <span className="w-24 font-bold">O₂ :</span>
                <input className="w-full border-none p-0 focus:ring-0 h-4 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
              </div>
            </div>
          </div>
          {/* Après Section */}
          <div className="border-l-4 border-clinical-300 pl-4">
            <h3 className="font-black text-sm uppercase mb-3 tracking-tighter text-primary-fixed-variant">APRÈS</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-baseline border-b border-dotted border-gray-400 pb-0.5">
                <span className="w-24 font-bold">Poids :</span>
                <input className="w-full border-none p-0 focus:ring-0 h-4 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
              </div>
              <div className="flex items-baseline border-b border-dotted border-gray-400 pb-0.5">
                <span className="w-24 font-bold">T.A. :</span>
                <input className="w-full border-none p-0 focus:ring-0 h-4 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
              </div>
              <div className="flex items-baseline border-b border-dotted border-gray-400 pb-0.5">
                <span className="w-24 font-bold">FC :</span>
                <input className="w-full border-none p-0 focus:ring-0 h-4 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
              </div>
              <div className="flex items-baseline border-b border-dotted border-gray-400 pb-0.5">
                <span className="w-24 font-bold">Température :</span>
                <input className="w-full border-none p-0 focus:ring-0 h-4 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
              </div>
              <div className="flex items-baseline border-b border-dotted border-gray-400 pb-0.5">
                <span className="w-24 font-bold">O₂ :</span>
                <input className="w-full border-none p-0 focus:ring-0 h-4 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
              </div>
            </div>
          </div>
        </section>
        {/* END: PrePostMeasurements */}
        {/* BEGIN: AnticoagulationSection */}
        <section className="mb-8" data-purpose="anticoagulation">
          <h3 className="border-l-4 border-brand pl-4 font-black text-sm uppercase mb-3 tracking-tighter">Anticoagulation</h3>
          <div className="grid grid-cols-12 gap-x-6 gap-y-3 text-xs p-4 border border-clinical-200 rounded bg-surface-container-low">
            <div className="col-span-3 flex items-center border-b border-gray-300">
              <span className="font-bold mr-2 uppercase">Héparine :</span>
              <input className="w-full border-none p-0 h-4 focus:ring-0 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
            </div>
            <div className="col-span-3 flex items-center border-b border-gray-300">
              <span className="font-bold mr-2 uppercase whitespace-nowrap">DC :</span>
              <input className="w-full border-none p-0 h-4 focus:ring-0 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
            </div>
            <div className="col-span-6 flex items-center border-b border-gray-300">
              <span className="font-bold mr-2 uppercase whitespace-nowrap">KT/Artère :</span>
              <input className="w-full border-none p-0 h-4 focus:ring-0 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
            </div>
            <div className="col-span-12 text-[10px] text-clinical-700 italic font-medium py-1">
              Désinfection acide citrique/Chaleur
            </div>
            <div className="col-span-3 flex items-center border-b border-gray-300">
              <span className="font-bold mr-2 uppercase">HBPM :</span>
              <input className="w-full border-none p-0 h-4 focus:ring-0 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
            </div>
            <div className="col-span-3 flex items-center border-b border-gray-300">
              <span className="font-bold mr-2 uppercase whitespace-nowrap">DE :</span>
              <input className="w-full border-none p-0 h-4 focus:ring-0 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
            </div>
            <div className="col-span-3 flex items-center border-b border-gray-300">
              <span className="font-bold mr-2 uppercase whitespace-nowrap">KT/Veine :</span>
              <input className="w-full border-none p-0 h-4 focus:ring-0 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
            </div>
            <div className="col-span-3 flex items-center text-[10px] text-clinical-700 italic font-medium justify-end">
              Déminéralisation chimique
            </div>
          </div>
        </section>
        {/* END: AnticoagulationSection */}
        {/* BEGIN: SurveillanceTable */}
        <section className="mb-8" data-purpose="monitoring-table">
          <h3 className="border-l-4 border-brand pl-4 font-black text-sm uppercase mb-3 tracking-tighter">SURVEILLANCE DE LA DIALYSE</h3>
          <div className="overflow-x-auto">
            <table className="w-full surveillance-table border-collapse text-center table-fixed">
              <thead>
                <tr>
                  <th className="w-16 bg-primary-container text-on-primary-container font-label bg-primary text-on-primary">HUF</th>
                  <th className="w-16 bg-primary-container text-on-primary-container font-label bg-primary text-on-primary">T.A.</th>
                  <th className="w-16 bg-primary-container text-on-primary-container font-label bg-primary text-on-primary">POULS</th>
                  <th className="w-20 bg-primary-container text-on-primary-container font-label bg-primary text-on-primary">DÉBIT SANG</th>
                  <th className="w-24 bg-primary-container text-on-primary-container font-label bg-primary text-on-primary">PRESSION VEINEUSE</th>
                  <th className="w-24 bg-primary-container text-on-primary-container font-label bg-primary text-on-primary">PRESSION ARTÉRIELLE</th>
                  <th className="w-20 bg-primary-container text-on-primary-container font-label bg-primary text-on-primary">UF AFFICHÉE</th>
                  <th className="w-20 bg-primary-container text-on-primary-container font-label bg-primary text-on-primary">UF OBTENUE</th>
                  <th className="w-16 bg-primary-container text-on-primary-container font-label bg-primary text-on-primary">PTM</th>
                  <th className="w-28 bg-primary-container text-on-primary-container font-label bg-primary text-on-primary">INDICATIONS CLINIQUES</th>
                  <th className="w-20 bg-primary-container text-on-primary-container font-label bg-primary text-on-primary">T° CATH.MU</th>
                </tr>
              </thead>
              <tbody><tr><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" placeholder="*" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td></tr><tr><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td></tr><tr><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td></tr><tr><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td></tr><tr><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td></tr><tr><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td></tr><tr><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td><td className="border border-outline-variant p-0"><input className="w-full h-full border-none text-center focus:ring-2 focus:ring-brand text-xs p-1 bg-transparent" type="text" /></td></tr></tbody>
            </table>
          </div>
        </section>
        {/* END: SurveillanceTable */}
        {/* BEGIN: SummaryDetails */}
        <section className="text-xs space-y-4 mb-12 p-4 border border-outline-variant rounded-lg bg-surface-container-low" data-purpose="post-session-summary">
          <div className="grid grid-cols-2 gap-8">
            <div className="flex items-center border-b border-dotted border-gray-400">
              <span className="font-bold mr-2 whitespace-nowrap uppercase">Clarice cathéter :</span>
              <input className="w-full border-none p-0 h-4 focus:ring-0 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
            </div>
            <div className="flex items-center border-b border-dotted border-gray-400">
              <span className="font-bold mr-2 whitespace-nowrap uppercase">Volume de sang total traité :</span>
              <input className="w-full border-none p-0 h-4 focus:ring-0 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
            </div>
          </div>
          <div className="flex items-center border-b border-dotted border-gray-400 w-1/2">
            <span className="font-bold mr-2 whitespace-nowrap uppercase">Temps non entière :</span>
            <input className="w-full border-none p-0 h-4 focus:ring-0 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
          </div>
          <div className="grid grid-cols-3 gap-8">
            <div className="flex items-center border-b border-dotted border-gray-400">
              <span className="font-bold mr-2 whitespace-nowrap uppercase">KT/V :</span>
              <input className="w-full border-none p-0 h-4 focus:ring-0 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
            </div>
            <div className="flex items-center border-b border-dotted border-gray-400">
              <span className="font-bold mr-2 whitespace-nowrap uppercase">AVS :</span>
              <input className="w-full border-none p-0 h-4 focus:ring-0 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
            </div>
            <div className="flex items-center border-b border-dotted border-gray-400">
              <span className="font-bold mr-2 whitespace-nowrap uppercase">PRU :</span>
              <input className="w-full border-none p-0 h-4 focus:ring-0 focus:border-primary rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
            </div>
          </div>
          <div className="flex items-center gap-8 py-2">
            <span className="font-bold uppercase">Restitution circuit :</span>
            <label className="flex items-center gap-2">
              <input className="w-4 h-4 rounded border-outline text-brand focus:ring-brand cursor-pointer transition-all hover:scale-110 accent-brand focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="checkbox" />
              <span className="uppercase">Bonne</span>
            </label>
            <label className="flex items-center gap-2">
              <input className="w-4 h-4 rounded border-outline text-brand focus:ring-brand cursor-pointer transition-all hover:scale-110 accent-brand focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="checkbox" />
              <span className="uppercase">Moyenne</span>
            </label>
            <label className="flex items-center gap-2">
              <input className="w-4 h-4 rounded border-outline text-brand focus:ring-brand cursor-pointer transition-all hover:scale-110 accent-brand focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="checkbox" />
              <span className="uppercase">Mauvaise</span>
            </label>
          </div>
          <div className="flex items-center gap-6 py-2">
            <span className="font-bold uppercase">Temps de compression :</span>
            <div className="flex items-center gap-2">
              <span className="italic">Veine (ml)</span>
              <input className="w-20 border-b border-gray-300 border-t-0 border-l-0 border-r-0 p-0 h-4 focus:ring-0 text-xs focus:border-primary ml-1 rounded-sm px-2 py-1 hover:bg-surface-container-highest transition-colors focus:bg-surface-container-lowest focus:ring-2 focus:ring-brand focus:ring-offset-1 outline-none focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="text" />
            </div>
            <label className="flex items-center gap-2">
              <span>10 min</span>
              <input className="w-4 h-4 rounded border-outline text-brand focus:ring-brand cursor-pointer transition-all hover:scale-110 accent-brand focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="checkbox" />
            </label>
            <label className="flex items-center gap-2">
              <span>20 min</span>
              <input className="w-4 h-4 rounded border-outline text-brand focus:ring-brand cursor-pointer transition-all hover:scale-110 accent-brand focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="checkbox" />
            </label>
            <label className="flex items-center gap-2">
              <span>&gt;20 min</span>
              <input className="w-4 h-4 rounded border-outline text-brand focus:ring-brand cursor-pointer transition-all hover:scale-110 accent-brand focus:ring-2 focus:ring-brand focus:outline-none transition-all bg-transparent" type="checkbox" />
            </label>
          </div>
        </section>
        {/* END: SummaryDetails */}
        {/* BEGIN: FooterSignatures */}
        <footer className="grid grid-cols-3 gap-4 mt-auto pt-8 border-t border-gray-200" data-purpose="signatures">
          <div className="text-center border-outline flex flex-col gap-1"><input className="w-full border-b border-dotted border-gray-400 text-center focus:ring-2 focus:ring-brand text-[10px] italic bg-transparent p-1 focus:ring-2 focus:ring-brand focus:outline-none transition-all" placeholder="Nom et Prénom" type="text" /><div className="border-t-2 border-clinical-900 pt-2 text-[10px] font-black uppercase tracking-widest text-clinical-700">Le Prescripteur</div></div>
          <div className="text-center border-outline flex flex-col gap-1"><input className="w-full border-b border-dotted border-gray-400 text-center focus:ring-2 focus:ring-brand text-[10px] italic bg-transparent p-1 focus:ring-2 focus:ring-brand focus:outline-none transition-all" placeholder="Nom et Prénom" type="text" /><div className="border-t-2 border-clinical-900 pt-2 text-[10px] font-black uppercase tracking-widest text-clinical-700">Le Prescripteur</div></div>
          <div className="text-center border-outline flex flex-col gap-1"><input className="w-full border-b border-dotted border-gray-400 text-center focus:ring-2 focus:ring-brand text-[10px] italic bg-transparent p-1 focus:ring-2 focus:ring-brand focus:outline-none transition-all" placeholder="Nom et Prénom" type="text" /><div className="border-t-2 border-clinical-900 pt-2 text-[10px] font-black uppercase tracking-widest text-clinical-700">Le Dispensateur / Infirmier</div></div>
        </footer>
        {/* END: FooterSignatures */}
      </main>
      {/* END: MainContainer */}
      {/* Utility script to allow print view from button (not in the form itself) */}
      <div className="fixed bottom-4 right-4 no-print flex items-center gap-4"><button className="bg-primary text-on-primary px-8 py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 font-label font-bold text-sm flex items-center gap-3 border-2 border-primary-fixed" type="button" onClick={() => alert("Fiche enregistrée")}>
          <span className="material-symbols-outlined text-xl">save</span>
          <span className="uppercase tracking-widest">Enregistrer la fiche</span>
        </button>
        <button className="bg-primary text-on-primary px-8 py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 font-label font-bold text-sm flex items-center gap-3 border-2 border-primary-fixed" type="button" onClick={() => window.print()}><span className="material-symbols-outlined text-xl">print</span><span className="uppercase tracking-widest">Imprimer la fiche</span></button>
      </div>
    </div>
    
  );
}
