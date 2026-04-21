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
      let iniciativasAtivas = 0;
      let emLicitacao = 0;

      let projetoIds: string[] = [];
      let emendaIds: string[] = [];

      // Fetch all projects for this deputy
      const { data: projetos } = await supabase
        .from('projetos')
        .select('*, areas_tematicas(nome)')
        .eq('id_deputado', selectedDeputado.id);
      
      // Fetch all emendas for this deputy
      const { data: emendas } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('id_deputado', selectedDeputado.id);

      if (projetos) {
        let filteredProjetos = projetos;
        
        // Apply filters
        if (filters.tipoVerba !== 'Todas' && filters.tipoVerba !== 'Projetos') filteredProjetos = [];
        if (filters.categoria !== 'Todas') {
          filteredProjetos = filteredProjetos.filter(p => p.areas_tematicas?.nome === filters.categoria);
        }
        if (filters.anosFiscais.length > 0) {
          filteredProjetos = filteredProjetos.filter(p => {
             const y = p.data ? new Date(p.data).getFullYear() : new Date().getFullYear();
             return filters.anosFiscais.includes(y);
          });
        }
        if (filters.municipio !== 'Todos') {
          filteredProjetos = filteredProjetos.filter(p => p.municipio === filters.municipio);
        }

        // Fetch ids of projects that have 'Liquidada' in history
        const pIds = filteredProjetos.map(p => p.id);
        let liquidadaPIds = new Set<string>();
        if (pIds.length > 0) {
          const { data: hLiquidada } = await supabase
            .from('historico_projetos')
            .select('id_projeto')
            .in('id_projeto', pIds)
            .eq('status', 'Liquidada');
          hLiquidada?.forEach(h => liquidadaPIds.add(h.id_projeto));
        }

        filteredProjetos.forEach(p => {
          verbaDestinada += Number(p.valor_projeto) || 0;
          if (p.status === 'Em Licitação') emLicitacao++;
          if (!liquidadaPIds.has(p.id)) iniciativasAtivas++;
          projetoIds.push(p.id);
        });
      }

      if (emendas) {
        let filteredEmendas = emendas;
        
        // Apply filters
        if (filters.tipoVerba !== 'Todas' && filters.tipoVerba !== 'Emendas') filteredEmendas = [];
        if (filters.categoria !== 'Todas') filteredEmendas = []; // Emendas don't have category yet in schema
        
        if (filters.anosFiscais.length > 0) {
          filteredEmendas = filteredEmendas.filter(e => {
             const y = e.data ? new Date(e.data).getFullYear() : new Date().getFullYear();
             return filters.anosFiscais.includes(y);
          });
        }
        if (filters.municipio !== 'Todos') {
          filteredEmendas = filteredEmendas.filter(e => e.municipio === filters.municipio);
        }

        // Fetch ids of emendas that have 'Liquidação' in history
        const eIds = filteredEmendas.map(e => e.id);
        let liquidacaoEIds = new Set<string>();
        if (eIds.length > 0) {
          const { data: hLiquidacao } = await supabase
            .from('historico_emendas')
            .select('id_emenda')
            .in('id_emenda', eIds)
            .eq('status', 'Liquidação');
          hLiquidacao?.forEach(h => liquidacaoEIds.add(h.id_emenda));
        }

        filteredEmendas.forEach(e => {
          verbaDestinada += Number(e.valor) || 0;
          if (!liquidacaoEIds.has(e.id)) iniciativasAtivas++;
          emendaIds.push(e.id);
        });
      }

      if (projetoIds.length > 0) {
        const chunkSize = 200;
        for (let i = 0; i < projetoIds.length; i += chunkSize) {
          const chunk = projetoIds.slice(i, i + chunkSize);
          const { data: histProj } = await supabase
            .from('historico_projetos')
            .select('valor')
            .in('id_projeto', chunk)
            .eq('status', 'Paga');
          if (histProj) totalExecutado += histProj.reduce((acc, curr) => acc + Number(curr.valor), 0);
        }
      }

      if (emendaIds.length > 0) {
        const chunkSize = 200;
        for (let i = 0; i < emendaIds.length; i += chunkSize) {
          const chunk = emendaIds.slice(i, i + chunkSize);
          const { data: histEmendas } = await supabase
            .from('historico_emendas')
            .select('valor')
            .in('id_emenda', chunk)
            .eq('status', 'Pagamento');
          if (histEmendas) totalExecutado += histEmendas.reduce((acc, curr) => acc + Number(curr.valor), 0);
        }
      }

      saldoCaixa = verbaDestinada - totalExecutado;

      setTotals({
        verbaDestinada,
        totalExecutado,
        saldoCaixa,
        projetosAtivos: iniciativasAtivas,
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
        <h3 className="text-4xl font-headline font-black text-slate-800">{formatCurrency(totals.verbaDestinada)}</h3>
        <div className="flex items-center gap-1 mt-2 text-primary font-bold text-xs">
          <TrendingUp size={14} />
          <span>Atualizado</span>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Total Executado</p>
        <h3 className="text-4xl font-headline font-black text-slate-800">{formatCurrency(totals.totalExecutado)}</h3>
        <div className="flex items-center gap-1 mt-2 text-primary font-bold text-xs">
          <BarChart size={14} />
          <span>{execucaoPercent}% de execução</span>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Saldo em Caixa</p>
        <h3 className="text-4xl font-headline font-black text-slate-800">{formatCurrency(totals.saldoCaixa)}</h3>
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
