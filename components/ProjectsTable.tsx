'use client';

import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { useDeputado } from '@/context/DeputadoContext';
import { useFilters } from '@/context/FilterContext';
import { supabase } from '@/lib/supabase';

export function ProjectsTable() {
  const { selectedDeputado } = useDeputado();
  const { filters } = useFilters();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!selectedDeputado) {
        setData([]);
        setLoading(false);
        return;
      }
      setLoading(true);

      let combinedData: any[] = [];

      if (filters.tipoVerba === 'Todas' || filters.tipoVerba === 'Projetos') {
        let query = supabase
          .from('projetos')
          .select('*, areas_tematicas(nome)')
          .eq('id_deputado', selectedDeputado.id)
          .eq('etapa', 'Liberado');
        
        const { data: projetos } = await query;
        if (projetos) {
          const pIds = projetos.map(p => p.id);
          const { data: hPagos } = await supabase
            .from('historico_projetos')
            .select('id_projeto, valor')
            .in('id_projeto', pIds)
            .eq('status', 'Paga');

          const formattedProjetos = projetos
            .filter(p => {
              const y = p.data ? new Date(p.data).getFullYear() : new Date().getFullYear();
              const matchYear = filters.anosFiscais.length === 0 || filters.anosFiscais.includes(y);
              const matchMun = filters.municipio === 'Todos' || p.municipio === filters.municipio;
              return matchYear && matchMun;
            })
            .map(p => {
              const totalPago = hPagos?.filter(h => h.id_projeto === p.id).reduce((acc, curr) => acc + Number(curr.valor), 0) || 0;
              const valorTotal = Number(p.valor_projeto) || 1;
              return {
                id: `proj-${p.id}`,
                titulo: p.descricao,
                categoria: p.areas_tematicas?.nome || 'Sem Categoria',
                local: p.municipio || '-',
                valor: p.valor_projeto,
                tipo: 'Projeto',
                status: p.status,
                progresso: Math.min(Math.round((totalPago / valorTotal) * 100), 100),
                raw: p
              };
            });
          combinedData = [...combinedData, ...formattedProjetos];
        }
      }

      if (filters.tipoVerba === 'Todas' || filters.tipoVerba === 'Emendas') {
        let query = supabase
          .from('orcamentos')
          .select('*, areas_tematicas(nome)')
          .eq('id_deputado', selectedDeputado.id)
          .eq('etapa', 'Liberado');
        
        const { data: emendas } = await query;
        if (emendas) {
          const eIds = emendas.map(e => e.id);
          const { data: hPagos } = await supabase
            .from('historico_emendas')
            .select('id_emenda, valor')
            .in('id_emenda', eIds)
            .eq('status', 'Pagamento');

          const formattedEmendas = emendas
            .filter(e => {
              const y = e.data ? new Date(e.data).getFullYear() : new Date().getFullYear();
              const cat = (e as any).areas_tematicas?.nome || 'Emenda';
              
              const matchYear = filters.anosFiscais.length === 0 || filters.anosFiscais.includes(y);
              const matchMun = filters.municipio === 'Todos' || e.municipio === filters.municipio;
              const matchCat = filters.categoria === 'Todas' || filters.categoria === cat;
              
              return matchYear && matchMun && matchCat;
            })
            .map(e => {
              const totalPago = hPagos?.filter(h => h.id_emenda === e.id).reduce((acc, curr) => acc + Number(curr.valor), 0) || 0;
              const valorTotal = Number(e.valor) || 1;
              return {
                id: `emenda-${e.id}`,
                titulo: e.objeto,
                categoria: (e as any).areas_tematicas?.nome || 'Emenda',
                local: e.municipio || e.beneficiario || '-',
                valor: e.valor,
                tipo: e.tipo,
                status: 'Emenda',
                progresso: Math.min(Math.round((totalPago / valorTotal) * 100), 100),
                raw: e
              };
            });
          combinedData = [...combinedData, ...formattedEmendas];
        }
      }

      if (filters.categoria !== 'Todas') {
        combinedData = combinedData.filter(item => item.categoria === filters.categoria);
      }

      setData(combinedData);
      setLoading(false);
    }

    fetchData();
  }, [selectedDeputado, filters]);

  const handleExport = () => {
    if (data.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }

    // Define specific fields to export as requested by user
    const exportData = data.map(item => {
      const raw = item.raw || {};
      return {
        'Iniciativa/Projeto': item.titulo,
        'Valor': item.valor,
        'Status': item.status,
        'Município': item.local,
        'Data': raw.data ? new Date(raw.data).toLocaleDateString('pt-BR') : '-',
        'Tipo': item.tipo
      };
    });

    if (exportData.length === 0) return;

    // Get all headers in the specific order defined above
    const allHeaders = ['Iniciativa/Projeto', 'Valor', 'Status', 'Município', 'Data', 'Tipo'];

    const csvContent = [
      allHeaders.join(';'),
      ...exportData.map(row => 
        allHeaders.map(header => {
          const val = (row as any)[header];
          if (val === null || val === undefined) return '""';
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(';')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Relatorio_Iniciativas_${selectedDeputado?.nome || 'Deputado'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
      <div className="p-8 flex justify-between items-center border-b border-surface-container-low">
        <div>
          <h4 className="text-xl font-headline font-bold text-on-surface">Minhas Iniciativas</h4>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Acompanhamento das iniciativas do {selectedDeputado ? `Deputado ${selectedDeputado.nome}` : 'Deputado'}</p>
        </div>
        <button 
          onClick={handleExport}
          className="text-primary font-bold text-sm flex items-center gap-2 hover:underline"
        >
          Exportar Relatório Detalhado <Download size={16} />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-8 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Projeto / Iniciativa</th>
              <th className="px-8 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Local Beneficiado</th>
              <th className="px-8 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Orçamento</th>
              <th className="px-8 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Progresso</th>
              <th className="px-8 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider text-right">Status Atual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low">
            {loading ? (
              <tr><td colSpan={5} className="px-8 py-8 text-center text-slate-500">Carregando...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={5} className="px-8 py-8 text-center text-slate-500">Nenhum registro encontrado.</td></tr>
            ) : (
              data.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div>
                      <p className="font-bold text-sm text-on-surface">{item.titulo}</p>
                      <p className="text-xs text-on-surface-variant font-medium">{item.categoria}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm text-on-surface">{item.local}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-sm text-on-surface">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                    </p>
                    <p className="text-[10px] text-primary font-bold">{item.tipo}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="w-48">
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] font-bold text-on-surface-variant">{item.progresso}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${item.progresso}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="px-3 py-1 bg-tertiary text-on-tertiary font-bold text-[10px] rounded-full uppercase">{item.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
