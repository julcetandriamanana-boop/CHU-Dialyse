import { Suspense } from "react";
import StitchDemandesAvis from "@/src/components/stitch/StitchDemandesAvis";

function LoadingDemandesAvis() {
  return (
    <div className="min-h-screen bg-slate-50/60 p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-8 text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-black text-slate-800">Demandes d'avis</h1>
        <p className="text-sm text-slate-400 mt-2">Chargement du module...</p>
      </div>
    </div>
  );
}

export default function DemandesAvisPage() {
  return (
    <Suspense fallback={<LoadingDemandesAvis />}>
      <StitchDemandesAvis />
    </Suspense>
  );
}
