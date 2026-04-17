'use client';
import { useDeputado } from '@/context/DeputadoContext';
import { StateMap } from '@/components/StateMap';
import { MapPin, DollarSign, Map, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MapaPage() {
  const { selectedDeputado } = useDeputado();
  const [stats, setStats] = useState({
    totalEmendas: 0,
    totalValor: 0,
    totalMunicipios: 0
  });

  useEffect(() => {
    async function fetchStats() {
      if (!selectedDeputado?.id) return;
      
      const { data: emendas } = await supabase
        .from('orcamentos')
        .select('municipio, valor')
        .eq('id_deputado', selectedDeputado.id);
        
      if (emendas) {
        const uniqueMun = new Set(emendas.map(e => e.municipio).filter(Boolean));
        const total = emendas.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
        
        setStats({
          totalEmendas: emendas.length,
          totalValor: total,
          totalMunicipios: uniqueMun.size
        });
      }
    }
    
    fetchStats();
  }, [selectedDeputado]);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-headline text-on-surface flex items-center gap-2">
          <MapPin size={28} className="text-primary" />
          Mapa de Destinação de Recursos {selectedDeputado?.estado ? `(${selectedDeputado.estado})` : ''}
        </h2>
        <p className="text-slate-500 mt-2">Visão geográfica geral da distribuição de recursos de emendas parlamentares.</p>
      </div>

      {/* Summary Cards - Portal da Transparencia style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 border-l-4 border-l-blue-600">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase">Total Destinado</p>
            <p className="text-2xl font-black text-slate-800">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalValor)}
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-full">
            <Map size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase">Municípios Atendidos</p>
            <p className="text-2xl font-black text-slate-800">{stats.totalMunicipios}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-full">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase">Emendas Destinadas</p>
            <p className="text-2xl font-black text-slate-800">{stats.totalEmendas}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 flex flex-col min-h-[600px]">
        <div className="flex-1 relative rounded-lg overflow-hidden border border-slate-100">
          <StateMap />
        </div>
      </div>
    </div>
  );
}
