'use client';
import { KpiCards } from '@/components/KpiCards';
import { Filters } from '@/components/Filters';
import { Charts } from '@/components/Charts';
import { ProjectsTable } from '@/components/ProjectsTable';
import { Share, Download } from 'lucide-react';
import { useDeputado } from '@/context/DeputadoContext';
import { FilterProvider } from '@/context/FilterContext';

export default function Home() {
  const { selectedDeputado } = useDeputado();

  const handleShare = async () => {
    const publicUrl = `${window.location.origin}/p/${selectedDeputado?.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Painel do Deputado ${selectedDeputado?.nome || ''}`,
          text: 'Confira as iniciativas e emendas no Democracia Digital.',
          url: publicUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(publicUrl);
      alert('Link público copiado para a área de transferência!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <FilterProvider>
      <div className="p-8 space-y-8">
        
        {/* Dashboard Header & Personal Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Visão Consolidada</p>
            <h2 className="text-2xl md:text-3xl font-black font-headline text-on-surface">
              {selectedDeputado ? `Dep. ${selectedDeputado.nome}` : 'Carregando...'}
            </h2>
            <p className="text-on-surface-variant text-sm">Gerenciamento de emendas e projetos parlamentares - 56ª Legislatura</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={handleShare}
              className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Share size={18} />
              Compartilhar
            </button>
            <button 
              onClick={handlePrint}
              className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-md"
            >
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

      {/* Contextual "Pulse" Indicator */}
      <div className="fixed bottom-8 right-8 flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-2xl border border-primary/10 z-50">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-tertiary"></span>
        </div>
        <span className="text-xs font-bold text-on-surface tracking-tight">Sincronizado com o Tesouro Nacional</span>
      </div>
    </FilterProvider>
  );
}
