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

      let projetoIds: string[] = [];
      let emendaIds: string[] = [];

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
            if (p.status !== 'Concluído') projetosAtivos++;
            if (p.status === 'Em Licitação') emLicitacao++;
            projetoIds.push(p.id);
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
          const filteredEmendas = filters.categoria !== 'Todas' ? [] : emendas;
          
          filteredEmendas.forEach(e => {
            verbaDestinada += Number(e.valor) || 0;
            emendaIds.push(e.id);
          });
        }
      }

      if (projetoIds.length > 0) {
        // Fetch history for projetos (status 'Paga')
        // Chunking the IDs to avoid URL length limits if there are many projects
        const chunkSize = 200;
        for (let i = 0; i < projetoIds.length; i += chunkSize) {
          const chunk = projetoIds.slice(i, i + chunkSize);
          const { data: histProj } = await supabase
            .from('historico_projetos')
            .select('valor')
            .in('id_projeto', chunk)
            .eq('status', 'Paga');
          
          if (histProj) {
            totalExecutado += histProj.reduce((acc, curr) => acc + Number(curr.valor), 0);
          }
        }
      }

      if (emendaIds.length > 0) {
        // Fetch history for emendas (status 'Pagamento')
        const chunkSize = 200;
        for (let i = 0; i < emendaIds.length; i += chunkSize) {
          const chunk = emendaIds.slice(i, i + chunkSize);
          const { data: histEmendas } = await supabase
            .from('historico_emendas')
            .select('valor')
            .in('id_emenda', chunk)
            .eq('status', 'Pagamento');
          
          if (histEmendas) {
            totalExecutado += histEmendas.reduce((acc, curr) => acc + Number(curr.valor), 0);
          }
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
