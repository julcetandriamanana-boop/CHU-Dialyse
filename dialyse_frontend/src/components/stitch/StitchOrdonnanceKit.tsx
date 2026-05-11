'use client';

export default function StitchOrdonnanceKit() {
  return (
    <div className="bg-clinical-100 antialiased min-h-screen py-8 px-8">
      {/* Full Screen Container */}
      <div className="max-w-full mx-auto">
        {/* Action Bar (UI Only) */}
        <div className="mb-8 flex justify-between items-center no-print px-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-display font-bold text-lg text-primary"><br /></h2>
              <p className="text-xs text-clinical-500 font-medium uppercase tracking-wider"><br /></p>
            </div>
          </div>
          <button className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20 font-bold group" type="button" onClick={() => window.print()}>
            <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">print</span>
            Imprimer l'ordonnance
          </button>
        </div>
        {/* BEGIN: Prescription Card (Paper Layout) */}
        <div className="prescription-paper shadow-2xl" data-purpose="prescription-form">
          {/* BEGIN: Professional Header */}
          <header className="mb-10">
            <div className="flex justify-between items-start mb-8">
              <div className="flex gap-4 items-center">
                <div className="w-20 h-20 border border-clinical-200 rounded overflow-hidden flex items-center justify-center bg-white">
                  <img alt="Logo CHU ANDRAINJATO" className="max-w-full max-h-full object-contain" src="https://lh3.googleusercontent.com/aida/ADBb0uiBsTG6DINUkcFF5OgmFFwSk4x2zlGYlPL__dUaf8zWdyCsrLt3LzUv9RXpqVMfj6o2vFKiTuWTqjVwrbvGmenHr3rqzq2FByaTk5as531uqPe9sv4Qw_8MyaZq4m2ebFD7e1dFcKbVRLUOO5OG3NCVD8pqXJXnrLX6n11cwDJJljlidtJMwkx0_43sxNIi9ydt8DqBvbL1bLtBdnSGhTReSCuaR2l1uaNR6E2vNxULBH_iCAPVaEgf26H3K7ODrF32gSYqvvFToSM" />
                </div>
                <div>
                  <p className="font-extrabold text-sm uppercase tracking-tight">CHU ANDRAINJATO</p>
                  <p className="text-[10px] text-clinical-600 font-medium">Service d'Hémodialyse</p>
                  <p className="text-[10px] text-clinical-600 font-medium italic">Fianarantsoa, Madagascar</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-clinical-800 uppercase">Document Vitalis v2.4</p>
                <p className="text-[10px] text-clinical-500">Ref: KIT-HEMO-2024</p>
              </div>
            </div>
            <h1 className="form-title">ORDONNANCE KIT DON HEMODIALYSE</h1>
            <div className="section-divider" />
            {/* Patient Info Grid */}
            <div className="grid grid-cols-12 gap-y-6 gap-x-8 text-sm font-semibold text-clinical-900">
              <div className="col-span-12 flex items-center gap-4">
                <label className="whitespace-nowrap uppercase text-[11px] text-clinical-500 min-w-[100px]">Nom et Prénom :</label>
                <input className="field-input" placeholder="Saisir le nom complet..." type="text" />
              </div>
              <div className="col-span-4 flex items-center gap-4">
                <label className="whitespace-nowrap uppercase text-[11px] text-clinical-500">Age :</label>
                <input className="field-input" placeholder="..." type="text" />
              </div>
              <div className="col-span-4 flex items-center gap-4">
                <label className="whitespace-nowrap uppercase text-[11px] text-clinical-500">Sexe :</label>
                <input className="field-input" placeholder="..." type="text" />
              </div>
              <div className="col-span-4 flex items-center gap-4">
                <label className="whitespace-nowrap uppercase text-[11px] text-clinical-500">P(KG) :</label>
                <input className="field-input" placeholder="..." type="text" />
              </div>
              <div className="col-span-12 flex items-center gap-4">
                <label className="whitespace-nowrap uppercase text-[11px] text-clinical-500 min-w-[100px]">Adresse :</label>
                <input className="field-input" placeholder="Adresse de résidence..." type="text" />
              </div>
              <div className="col-span-8 flex items-center gap-4">
                <label className="whitespace-nowrap uppercase text-[11px] text-clinical-500 min-w-[100px]">Service :</label>
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-bold text-primary bg-primary/5 px-2 py-1 rounded">HEMODIALYSE</span>
                  <input className="field-input flex-1" placeholder="Unité / Salle" type="text" />
                </div>
              </div>
              <div className="col-span-4 flex items-center gap-4">
                <label className="whitespace-nowrap uppercase text-[11px] text-clinical-500">Date :</label>
                <input className="field-input" type="date" />
              </div>
            </div>
          </header>
          {/* END: Header Section */}
          {/* BEGIN: Items Table */}
          <main className="mb-12">
            <table data-purpose="medical-items-list" id="kit-table">
              <thead>
                <tr>
                  <th className="w-[45%]">DESIGNATION</th>
                  <th className="w-[15%] text-center">QUANTITÉ</th>
                  <th className="w-[20%] text-center">PRIX UNITAIRE</th>
                  <th className="w-[20%] text-center">MONTANT</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm">
                <tr className="item-row">
                  <td className="cell-padding font-sans font-medium">Lovenox 4000 UI</td>
                  <td><div className="flex justify-center px-2"><input className="table-input text-center bg-clinical-50 border border-clinical-200 rounded-lg py-1 hover:bg-clinical-100 transition-colors font-bold text-primary" type="text" defaultValue={3} /></div></td>
                  <td><input className="table-input rounded-lg" placeholder="0.00" type="text" /></td>
                  <td><input className="table-input rounded-lg" placeholder="0.00" type="text" /></td>
                </tr>
                <tr className="item-row">
                  <td className="cell-padding font-sans font-medium">Compresse Stérile 40×40</td>
                  <td><div className="flex justify-center px-2"><input className="table-input text-center bg-clinical-50 border border-clinical-200 rounded-lg py-1 hover:bg-clinical-100 transition-colors font-bold text-primary" type="text" defaultValue="2 boîtes" /></div></td>
                  <td><input className="table-input rounded-lg" placeholder="0.00" type="text" /></td>
                  <td><input className="table-input rounded-lg" placeholder="0.00" type="text" /></td>
                </tr>
                <tr className="item-row">
                  <td className="cell-padding font-sans font-medium">Gant d’examen non stérile</td>
                  <td><div className="flex justify-center px-2"><input className="table-input text-center bg-clinical-50 border border-clinical-200 rounded-lg py-1 hover:bg-clinical-100 transition-colors font-bold text-primary" type="text" defaultValue={6} /></div></td>
                  <td><input className="table-input rounded-lg" placeholder="0.00" type="text" /></td>
                  <td><input className="table-input rounded-lg" placeholder="0.00" type="text" /></td>
                </tr>
                <tr className="item-row">
                  <td className="cell-padding font-sans font-medium">Gant stérile 7/0</td>
                  <td><div className="flex justify-center px-2"><input className="table-input text-center bg-clinical-50 border border-clinical-200 rounded-lg py-1 hover:bg-clinical-100 transition-colors font-bold text-primary" type="text" defaultValue={6} /></div></td>
                  <td><input className="table-input rounded-lg" placeholder="0.00" type="text" /></td>
                  <td><input className="table-input rounded-lg" placeholder="0.00" type="text" /></td>
                </tr>
                <tr className="item-row">
                  <td className="cell-padding font-sans font-medium">Masque chirurgical</td>
                  <td><div className="flex justify-center px-2"><input className="table-input text-center bg-clinical-50 border border-clinical-200 rounded-lg py-1 hover:bg-clinical-100 transition-colors font-bold text-primary" type="text" defaultValue={6} /></div></td>
                  <td><input className="table-input rounded-lg" placeholder="0.00" type="text" /></td>
                  <td><input className="table-input rounded-lg" placeholder="0.00" type="text" /></td>
                </tr>
                <tr className="item-row">
                  <td className="cell-padding font-sans font-medium">Rein artificiel (Dialyseur) F7/F8</td>
                  <td><div className="flex justify-center px-2"><input className="table-input text-center bg-clinical-50 border border-clinical-200 rounded-lg py-1 hover:bg-clinical-100 transition-colors font-bold text-primary" type="text" defaultValue={1} /></div></td>
                  <td><input className="table-input rounded-lg" placeholder="0.00" type="text" /></td>
                  <td><input className="table-input rounded-lg" placeholder="0.00" type="text" /></td>
                </tr>
                <tr className="item-row">
                  <td className="cell-padding font-sans font-medium">Seringue 10 cc</td>
                  <td><div className="flex justify-center px-2"><input className="table-input text-center bg-clinical-50 border border-clinical-200 rounded-lg py-1 hover:bg-clinical-100 transition-colors font-bold text-primary" type="text" defaultValue={6} /></div></td>
                  <td><input className="table-input rounded-lg" placeholder="0.00" type="text" /></td>
                  <td><input className="table-input rounded-lg" placeholder="0.00" type="text" /></td>
                </tr>
                <tr className="item-row">
                  <td className="cell-padding font-sans font-medium">Seringue 20 cc</td>
                  <td><div className="flex justify-center px-2"><input className="table-input text-center bg-clinical-50 border border-clinical-200 rounded-lg py-1 hover:bg-clinical-100 transition-colors font-bold text-primary" type="text" defaultValue={6} /></div></td>
                  <td><input className="table-input rounded-lg" placeholder="0.00" type="text" /></td>
                  <td><input className="table-input rounded-lg" placeholder="0.00" type="text" /></td>
                </tr>
                <tr className="item-row">
                  <td className="cell-padding font-sans font-medium">Seringue 5 cc</td>
                  <td><div className="flex justify-center px-2"><input className="table-input text-center bg-clinical-50 border border-clinical-200 rounded-lg py-1 hover:bg-clinical-100 transition-colors font-bold text-primary" type="text" defaultValue={6} /></div></td>
                  <td><input className="table-input rounded-lg" placeholder="0.00" type="text" /></td>
                  <td><input className="table-input rounded-lg" placeholder="0.00" type="text" /></td>
                </tr>
                <tr className="item-row">
                  <td className="cell-padding font-sans font-medium">SSI 500 ml</td>
                  <td><div className="flex justify-center px-2"><input className="table-input text-center bg-clinical-50 border border-clinical-200 rounded-lg py-1 hover:bg-clinical-100 transition-colors font-bold text-primary" type="text" defaultValue={4} /></div></td>
                  <td><input className="table-input rounded-lg" placeholder="0.00" type="text" /></td>
                  <td><input className="table-input rounded-lg" placeholder="0.00" type="text" /></td>
                </tr>
                {/* Total Row */}
                <tr className="font-bold bg-clinical-50">
                  <td className="cell-padding text-left uppercase font-sans tracking-widest" colSpan={2}>TOTAL GENERAL</td>
                  <td className="border-r-0" />
                  <td className="border-l-0 pr-4">
                    <div className="flex items-center justify-end">
                      <input className="table-input text-right font-bold w-full focus:bg-white rounded-lg" placeholder="0.00" type="text" />
                      <span className="ml-2 font-sans text-xs">Ar</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </main>
          {/* END: Items Table */}
          {/* BEGIN: Signature Section */}
          <section className="grid grid-cols-3 gap-8 mb-20 text-[11px] font-extrabold text-center uppercase text-clinical-800">
            <div className="group">
              <div className="border-t-2 border-black mb-4 mx-4 group-focus-within:border-primary transition-colors" />
              LE DIRECTEUR<br />D'ÉTABLISSEMENT
              <textarea className="signature-textarea" placeholder="Annotations Directeur..." defaultValue={""} />
            </div>
            <div className="group">
              <div className="border-t-2 border-black mb-4 mx-4 group-focus-within:border-primary transition-colors" />
              LE PRESCRIPTEUR
              <textarea className="signature-textarea" placeholder="Signature électronique ou cachet..." defaultValue={""} />
            </div>
            <div className="group">
              <div className="border-t-2 border-black mb-4 mx-4 group-focus-within:border-primary transition-colors" />
              LE DISPENSATEUR
              <textarea className="signature-textarea" placeholder="Validation Pharmacie..." defaultValue={""} />
            </div>
          </section>
          {/* END: Signature Section */}
          {/* BEGIN: Footer Remarks */}
          <footer className="pt-8 border-t-2 border-clinical-900">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-xs space-y-1.5 text-clinical-700">
                <p className="font-extrabold text-clinical-900 mb-2 uppercase tracking-wide">Remarques :</p>
                <p className="flex gap-2 items-start"><span className="text-primary font-bold">✓</span> <span>À renouveler à chaque séance d’hémodialyse.</span></p>
                <p className="flex gap-2 items-start"><span className="text-primary font-bold">✓</span> <span>Dialyseur (F7 pour enfant / petit poids - F8 pour adulte).</span></p>
                <p className="flex gap-2 items-start"><span className="text-primary font-bold">✓</span> <span>Vérifier les dates de péremption avant délivrance.</span></p>
              </div>
              <div className="flex flex-col justify-end items-end">
                <button className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-lg flex flex-col items-center gap-1 transition-all shadow-md hover:shadow-lg no-print group">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">save</span>
                    <span className="font-display font-bold uppercase tracking-wide text-sm">Enregistrer le document</span>
                  </div>
                  <span className="text-[8px] opacity-80 font-medium uppercase tracking-tighter">Document à conserver par l'établissement</span>
                </button>
              </div>
            </div>
          </footer>
          {/* END: Footer Remarks */}
        </div>
        {/* END: Prescription Card */}
        <div className="mt-6 text-center text-clinical-400 text-xs no-print">
          Powered by <span className="font-bold">Vitalis Core</span> Health Systems — Standard Medical Protocol Layout
        </div>
      </div>
    </div>
    
  );
}
