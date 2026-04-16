'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

export default function VisualizarFormulario({ params }: { params: Promise<{ id: string, formId: string }> }) {
  const resolvedParams = use(params);
  const { id, formId } = resolvedParams;
  
  const [emenda, setEmenda] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch emenda details
      const { data: emendaData } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (emendaData) {
        setEmenda(emendaData);
      }

      // Fetch specific form
      const { data: form } = await supabase
        .from('formularios_emenda')
        .select('*')
        .eq('id', formId)
        .single();
      
      if (form) {
        setFormData(form);
      }
      
      setLoading(false);
    }
    fetchData();
  }, [id, formId]);

  if (loading) return <div className="p-8">Carregando...</div>;
  if (!formData) return <div className="p-8">Adesão Edital não encontrada.</div>;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <Link href={`/emendas/${id}/formularios`} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors self-start md:self-auto">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Visualizar Adesão Edital</p>
          <h2 className="text-2xl md:text-3xl font-black font-headline text-on-surface">
            {emenda ? emenda.objeto : 'Carregando...'}
          </h2>
        </div>
      </div>

      <div className="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-slate-100 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">a) Nome da entidade ou ente público</label>
            <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800">
              {formData.nome_entidade}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">b) CNPJ</label>
            <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800">
              {formData.cnpj}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">c) Nome do projeto</label>
            <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800">
              {formData.nome_projeto}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">d) Resumo / Objeto do projeto</label>
            <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 whitespace-pre-wrap">
              {formData.resumo_projeto}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">e) Descrição de como pretende desenvolver o projeto</label>
            <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 whitespace-pre-wrap">
              {formData.descricao_projeto}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">f) Orçamento: Planilha de valores detalhados do projeto</label>
            <div className="flex items-center gap-4">
              {formData.orcamento_url ? (
                <button 
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = formData.orcamento_url;
                    a.download = `Orcamento_${formData.nome_entidade}.pdf`;
                    a.click();
                  }}
                  className="text-sm text-primary flex items-center gap-2 bg-blue-50 hover:bg-blue-100 transition-colors px-4 py-2 rounded-lg border border-blue-100 cursor-pointer font-medium"
                >
                  <FileText size={16} /> Baixar Orçamento (PDF)
                </button>
              ) : (
                <span className="text-sm text-slate-500">Nenhum arquivo anexado</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">g) Currículo da entidade</label>
            <div className="flex items-center gap-4">
              {formData.curriculo_url ? (
                <button 
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = formData.curriculo_url;
                    a.download = `Curriculo_${formData.nome_entidade}.pdf`;
                    a.click();
                  }}
                  className="text-sm text-primary flex items-center gap-2 bg-blue-50 hover:bg-blue-100 transition-colors px-4 py-2 rounded-lg border border-blue-100 cursor-pointer font-medium"
                >
                  <FileText size={16} /> Baixar Currículo (PDF)
                </button>
              ) : (
                <span className="text-sm text-slate-500">Nenhum arquivo anexado</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
