'use client';

import { useState, useEffect } from 'react';
import { useDeputado } from '@/context/DeputadoContext';
import { useFilters } from '@/context/FilterContext';
import { supabase } from '@/lib/supabase';

export function Charts() {
  const { selectedDeputado } = useDeputado();
  const { filters } = useFilters();
  const [categories, setCategories] = useState<{ name: string; value: number; color: string }[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchChartData() {
      if (!selectedDeputado) return;

      let categoryTotals: Record<string, number> = {};
      let totalValue = 0;

      if (filters.tipoVerba === 'Todas' || filters.tipoVerba === 'Projetos') {
        let query = supabase
          .from('projetos')
          .select('*, areas_tematicas(nome)')
          .eq('id_deputado', selectedDeputado.id);
        
        const { data: projetos } = await query;
        if (projetos) {
          projetos.forEach(p => {
            const cat = p.areas_tematicas?.nome || 'Outros';
            if (filters.categoria === 'Todas' || filters.categoria === cat) {
              categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(p.valor_projeto);
              totalValue += Number(p.valor_projeto);
            }
          });
        }
      }

      if (filters.tipoVerba === 'Todas' || filters.tipoVerba === 'Emendas') {
        let query = supabase
          .from('orcamentos')
          .select('*')
          .eq('id_deputado', selectedDeputado.id);
        
        const { data: emendas } = await query;
        if (emendas) {
          emendas.forEach(e => {
            // Emendas don't have a direct category in the current schema, assume 'Outros' or 'Emendas'
            const cat = 'Outros';
            if (filters.categoria === 'Todas' || filters.categoria === cat) {
              categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.valor);
              totalValue += Number(e.valor);
            }
          });
        }
      }

      const colors = ['#005baa', '#009b3a', '#fedf00', '#slate-300']; // primary, tertiary, secondary
      
      const formattedCategories = Object.entries(categoryTotals)
        .map(([name, value], index) => ({
          name,
          value,
          color: colors[index % colors.length]
        }))
        .sort((a, b) => b.value - a.value);

      setCategories(formattedCategories);
      setTotal(totalValue);
    }

    fetchChartData();
  }, [selectedDeputado, filters]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Calculate SVG stroke dash offsets
  let currentOffset = 0;
  const circumference = 2 * Math.PI * 40; // r=40

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h4 className="text-xl font-headline font-bold text-on-surface">Histórico de Empenho</h4>
            <p className="text-sm text-on-surface-variant">Execução mensal de emendas (Milhões R$)</p>
          </div>
          <div className="flex gap-4 text-xs font-bold">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-tertiary rounded-sm"></div>
              <span>Empenhado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-sm"></div>
              <span>Pago</span>
            </div>
          </div>
        </div>
        
        <div className="h-64 flex items-end justify-between gap-4 px-2">
          <div className="flex-1 flex flex-col justify-end gap-1 h-full">
            <div className="w-full bg-tertiary/20 h-[50%] rounded-t-sm relative group">
              <div className="absolute inset-x-0 bottom-0 bg-tertiary h-[70%] rounded-t-sm"></div>
            </div>
            <span className="text-[10px] text-center font-bold text-on-surface-variant">JAN</span>
          </div>
          <div className="flex-1 flex flex-col justify-end gap-1 h-full">
            <div className="w-full bg-primary/20 h-[70%] rounded-t-sm relative group">
              <div className="absolute inset-x-0 bottom-0 bg-primary h-[60%] rounded-t-sm"></div>
            </div>
            <span className="text-[10px] text-center font-bold text-on-surface-variant">FEV</span>
          </div>
          <div className="flex-1 flex flex-col justify-end gap-1 h-full">
            <div className="w-full bg-tertiary/20 h-[60%] rounded-t-sm relative group">
              <div className="absolute inset-x-0 bottom-0 bg-tertiary h-[80%] rounded-t-sm"></div>
            </div>
            <span className="text-[10px] text-center font-bold text-on-surface-variant">MAR</span>
          </div>
          <div className="flex-1 flex flex-col justify-end gap-1 h-full">
            <div className="w-full bg-primary/20 h-[85%] rounded-t-sm relative group">
              <div className="absolute inset-x-0 bottom-0 bg-primary h-[75%] rounded-t-sm"></div>
            </div>
            <span className="text-[10px] text-center font-bold text-on-surface-variant">ABR</span>
          </div>
          <div className="flex-1 flex flex-col justify-end gap-1 h-full">
            <div className="w-full bg-tertiary/20 h-[75%] rounded-t-sm relative group">
              <div className="absolute inset-x-0 bottom-0 bg-tertiary h-[70%] rounded-t-sm"></div>
            </div>
            <span className="text-[10px] text-center font-bold text-on-surface-variant">MAI</span>
          </div>
          <div className="flex-1 flex flex-col justify-end gap-1 h-full">
            <div className="w-full bg-primary/20 h-[90%] rounded-t-sm relative group">
              <div className="absolute inset-x-0 bottom-0 bg-primary h-[90%] rounded-t-sm"></div>
            </div>
            <span className="text-[10px] text-center font-bold text-on-surface-variant">JUN</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
        <h4 className="text-xl font-headline font-bold text-on-surface self-start mb-2">Impacto Social</h4>
        <p className="text-sm text-on-surface-variant self-start mb-8">Foco por Área Temática</p>
        
        <div className="relative w-48 h-48 mb-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {categories.map((cat, i) => {
              const percentage = total > 0 ? cat.value / total : 0;
              const strokeDasharray = `${percentage * circumference} ${circumference}`;
              const strokeDashoffset = -currentOffset;
              currentOffset += percentage * circumference;
              
              return (
                <circle 
                  key={cat.name}
                  cx="50" cy="50" fill="transparent" r="40" 
                  stroke={cat.color} 
                  strokeDasharray={strokeDasharray} 
                  strokeDashoffset={strokeDashoffset} 
                  strokeWidth="12"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black font-headline">{formatCurrency(total)}</span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase">Total</span>
          </div>
        </div>
        
        <div className="w-full space-y-3">
          {categories.map(cat => (
            <div key={cat.name} className="flex justify-between items-center text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                <span>{cat.name}</span>
              </div>
              <span className="font-bold">{total > 0 ? Math.round((cat.value / total) * 100) : 0}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
