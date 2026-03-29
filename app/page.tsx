import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { KpiCards } from '@/components/KpiCards';
import { Filters } from '@/components/Filters';
import { Charts } from '@/components/Charts';
import { ProjectsTable } from '@/components/ProjectsTable';
import { Share, Download } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Sidebar />
      <Topbar />
      
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-8 space-y-8">
          
          {/* Dashboard Header & Personal Info */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Visão Consolidada</p>
              <h2 className="text-3xl font-black font-headline text-on-surface">Dep. Carlos Silva</h2>
              <p className="text-on-surface-variant text-sm">Gerenciamento de emendas e projetos parlamentares - 56ª Legislatura</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                <Share size={18} />
                Compartilhar
              </button>
              <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-md">
                <Download size={18} />
                Gerar PDF
              </button>
            </div>
          </div>
          
          <Filters />
          <KpiCards />
          <Charts />
          <ProjectsTable />
          
        </div>
      </main>

      {/* Contextual "Pulse" Indicator */}
      <div className="fixed bottom-8 right-8 flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-2xl border border-primary/10 z-50">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-tertiary"></span>
        </div>
        <span className="text-xs font-bold text-on-surface tracking-tight">Sincronizado com o Tesouro Nacional</span>
      </div>
    </>
  );
}
