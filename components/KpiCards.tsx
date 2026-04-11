'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, BarChart, Wallet, ClipboardList } from 'lucide-react';
import { useDeputado } from '@/context/DeputadoContext';
import { useFilters } from '@/context/FilterContext';
import { supabase } from '@/lib/supabase';

export function KpiCards() {
  const { selectedDeputado } = useDeputado();
  const { filters } = useFilters();
  const [totals, setTotals] = useState({
    verbaDestinada: 0,
    totalExecutado: 0,
    saldoCaixa: 0,
    projetosAtivos: 0,
    emLicitacao: 0
  });

  useEffect(() => {
    async function fetchTotals() {
      if (!selectedDeputado) return;

      let verbaDestinada = 0;
      let totalExecutado = 0;
      let saldoCaixa = 0;
      let projetosAtivos = 0;
      let emLicitacao = 0;

      if (filters.tipoVerba === 'Todas' || filters.tipoVerba === 'Projetos') {
        let query = supabase
          .from('projetos')
          .select('*, areas_tematicas(nome)')
          .eq('id_deputado', selectedDeputado.id);
        
        const { data: projetos } = await query;
        if (projetos) {
          const filteredProjetos = filters.categoria !== 'Todas' 
            ? projetos.filter(p => p.areas_tematicas?.nome === filters.categoria)
            : projetos;

          filteredProjetos.forEach(p => {
            verbaDestinada += Number(p.valor_projeto) || 0;
            totalExecutado += Number(p.total_executado) || 0;
            if (p.status !== 'Concluído') projetosAtivos++;
            if (p.status === 'Em Licitação') emLicitacao++;
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
          // Emendas don't have a direct category in the current schema, but let's assume they are included if category is 'Todas'
          // If a specific category is selected, we might exclude emendas unless we add category to them.
          // For now, if category is not 'Todas', we exclude emendas from totals to be consistent with the table.
          const filteredEmendas = filters.categoria !== 'Todas' ? [] : emendas;
          
          filteredEmendas.forEach(e => {
            verbaDestinada += Number(e.valor) || 0;
            // Assuming emendas are fully executed for this simple KPI if they don't have total_executado
            // Or maybe they just add to verba destinada. Let's just add to verba destinada.
          });
        }
      }

      saldoCaixa = verbaDestinada - totalExecutado;

      setTotals({
        verbaDestinada,
        totalExecutado,
        saldoCaixa,
        projetosAtivos,
        emLicitacao
      });
    }

    fetchTotals();
  }, [selectedDeputado, filters]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const execucaoPercent = totals.verbaDestinada > 0 
    ? Math.round((totals.totalExecutado / totals.verbaDestinada) * 100) 
    : 0;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border border-slate-100">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full translate-x-4 -translate-y-4 transition-transform group-hover:scale-110"></div>
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Verba Destinada (Total)</p>
        <h3 className="text-4xl font-headline font-black text-on-surface">{formatCurrency(totals.verbaDestinada)}</h3>
        <div className="flex items-center gap-1 mt-2 text-primary font-bold text-xs">
          <TrendingUp size={14} />
          <span>Atualizado</span>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Total Executado</p>
        <h3 className="text-4xl font-headline font-black text-primary">{formatCurrency(totals.totalExecutado)}</h3>
        <div className="flex items-center gap-1 mt-2 text-primary font-bold text-xs">
          <BarChart size={14} />
          <span>{execucaoPercent}% de execução</span>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Saldo em Caixa</p>
        <h3 className="text-4xl font-headline font-black text-tertiary">{formatCurrency(totals.saldoCaixa)}</h3>
        <div className="flex items-center gap-1 mt-2 text-tertiary font-bold text-xs">
          <Wallet size={14} />
          <span>Disponível para empenho</span>
        </div>
      </div>
      
      <div className="bg-primary p-6 rounded-xl shadow-lg hover:opacity-95 transition-opacity">
        <p className="text-[10px] uppercase tracking-widest text-white/70 font-bold mb-1">Iniciativas Ativas</p>
        <h3 className="text-4xl font-headline font-black text-white">{totals.projetosAtivos}</h3>
        <div className="flex items-center gap-1 mt-2 text-white/80 font-bold text-xs">
          <ClipboardList size={14} />
          <span>{totals.emLicitacao} em fase de licitação</span>
        </div>
      </div>
    </section>
  );
}
