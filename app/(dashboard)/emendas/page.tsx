'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Search, History, FileText } from 'lucide-react';
import Link from 'next/link';
import { useDeputado } from '@/context/DeputadoContext';
import EmendasImportExportModal from '@/components/emendas/EmendasImportExportModal';

export default function EmendasPage() {
  const { selectedDeputado } = useDeputado();
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrcamentos = useCallback(async () => {
    if (!selectedDeputado) {
      setOrcamentos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('orcamentos')
      .select('*, areas_tematicas(nome), projetos(descricao), municipio(id, nome, unidade_federacao(sigla))')
      .eq('id_deputado', selectedDeputado.id)
      .order('data', { ascending: false });
    
    if (data) setOrcamentos(data);
    setLoading(false);
  }, [selectedDeputado]);

  useEffect(() => {
    let isMounted = true;

    const timeoutId = setTimeout(() => {
      if (isMounted) fetchOrcamentos();
    }, 0);

    return () => { 
      isMounted = false; 
      clearTimeout(timeoutId);
    };
  }, [fetchOrcamentos]);

  async function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir esta emenda?')) {
      await supabase.from('orcamentos').delete().eq('id', id);
      fetchOrcamentos();
    }
  }

  const filteredOrcamentos = orcamentos.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const munObj = Array.isArray(item.municipio) ? item.municipio[0] : item.municipio;
    const munName = munObj?.nome || '';
    return (
      (item.objeto && item.objeto.toLowerCase().includes(term)) ||
      (item.autor && item.autor.toLowerCase().includes(term)) ||
      (item.beneficiario && item.beneficiario.toLowerCase().includes(term)) ||
      (munName && munName.toLowerCase().includes(term)) ||
      (item.numero_emenda && item.numero_emenda.toLowerCase().includes(term)) ||
      (item.areas_tematicas?.nome && item.areas_tematicas.nome.toLowerCase().includes(term)) ||
      (item.tipo && item.tipo.toLowerCase().includes(term)) ||
      (item.etapa && item.etapa.toLowerCase().includes(term))
    );
  });

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Gestão Financeira</p>
          <h2 className="text-2xl md:text-3xl font-black font-headline text-on-surface">Minhas Emendas</h2>
          <p className="text-on-surface-variant text-sm">Acompanhamento, importação e exportação de emendas e orçamentos</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <EmendasImportExportModal
            selectedDeputado={selectedDeputado}
            orcamentos={orcamentos}
            onImportSuccess={fetchOrcamentos}
          />

          <Link href="/emendas/nova" className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-md">
            <Plus size={18} />
            Nova Emenda
          </Link>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-surface-container-low flex justify-between items-center flex-wrap gap-4">
          <div className="relative flex items-center bg-slate-50 rounded-lg px-4 py-2 w-full sm:w-80 border border-slate-200">
            <Search className="text-slate-400 shrink-0" size={16} />
            <input 
              className="bg-transparent border-none focus:ring-0 text-sm w-full font-body placeholder:text-slate-400 ml-2 outline-none" 
              placeholder="Buscar por objeto, autor, município..." 
              type="text" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total de emendas: <strong className="text-slate-900 font-bold">{filteredOrcamentos.length}</strong>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80">
                <th className="px-4 py-3.5 text-[10px] uppercase font-black text-slate-600 tracking-wider">Nº Emenda</th>
                <th className="px-4 py-3.5 text-[10px] uppercase font-black text-slate-600 tracking-wider">Data</th>
                <th className="px-4 py-3.5 text-[10px] uppercase font-black text-slate-600 tracking-wider">Objeto</th>
                <th className="px-4 py-3.5 text-[10px] uppercase font-black text-slate-600 tracking-wider">Autor</th>
                <th className="px-4 py-3.5 text-[10px] uppercase font-black text-slate-600 tracking-wider">Área Temática</th>
                <th className="px-4 py-3.5 text-[10px] uppercase font-black text-slate-600 tracking-wider">Beneficiário</th>
                <th className="px-4 py-3.5 text-[10px] uppercase font-black text-slate-600 tracking-wider">Tipo</th>
                <th className="px-4 py-3.5 text-[10px] uppercase font-black text-slate-600 tracking-wider">Município</th>
                <th className="px-4 py-3.5 text-[10px] uppercase font-black text-slate-600 tracking-wider">Valor (R$)</th>
                <th className="px-4 py-3.5 text-[10px] uppercase font-black text-slate-600 tracking-wider">Etapa</th>
                <th className="px-4 py-3.5 text-[10px] uppercase font-black text-slate-600 tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={11} className="px-6 py-8 text-center text-slate-500">Carregando...</td></tr>
              ) : !selectedDeputado ? (
                <tr><td colSpan={11} className="px-6 py-8 text-center text-slate-500">Selecione um deputado para ver as emendas.</td></tr>
              ) : filteredOrcamentos.length === 0 ? (
                <tr><td colSpan={11} className="px-6 py-8 text-center text-slate-500">Nenhuma emenda encontrada.</td></tr>
              ) : (
                filteredOrcamentos.map(orcamento => (
                  <tr key={orcamento.id} className="hover:bg-slate-50/70 transition-colors text-xs">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                      {orcamento.numero_emenda || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap font-medium">
                      {new Date(orcamento.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 max-w-xs truncate" title={orcamento.objeto}>
                      {orcamento.objeto || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {orcamento.autor || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {orcamento.areas_tematicas?.nome ? (
                        <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded text-[11px]">
                          {orcamento.areas_tematicas.nome}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {orcamento.beneficiario || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-[10px] rounded-full uppercase">
                        {orcamento.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {(() => {
                        const munObj = Array.isArray(orcamento.municipio) ? orcamento.municipio[0] : orcamento.municipio;
                        if (!munObj?.nome) return '-';
                        const ufSigla = munObj.unidade_federacao ? (Array.isArray(munObj.unidade_federacao) ? munObj.unidade_federacao[0]?.sigla : munObj.unidade_federacao.sigla) : '';
                        return `${munObj.nome}${ufSigla ? ` - ${ufSigla}` : ''}`;
                      })()}
                    </td>
                    <td className="px-4 py-3 font-black text-slate-900 whitespace-nowrap">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.valor)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        orcamento.etapa === 'Liberado' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {orcamento.etapa || 'Liberado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/emendas/${orcamento.id}/historico`} className="p-1.5 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-blue-50" title="Histórico">
                          <History size={15} />
                        </Link>
                        <Link href={`/emendas/${orcamento.id}/editar`} className="p-1.5 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-red-50" title="Editar">
                          <Edit size={15} />
                        </Link>
                        <button onClick={() => handleDelete(orcamento.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50" title="Excluir">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

