'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, FileText, Upload, Download } from 'lucide-react';
import Link from 'next/link';

export default function VisualizarFormulario({ params }: { params: Promise<{ id: string, formId: string }> }) {
  const resolvedParams = use(params);
  const { id, formId } = resolvedParams;
  
  const [emenda, setEmenda] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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

  const handleUploadEdital = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor, selecione um arquivo PDF.');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      
      const { error } = await supabase
        .from('formularios_emenda')
        .update({ edital_pdf_base64: base64 })
        .eq('id', formId);
      
      if (!error) {
        setFormData({ ...formData, edital_pdf_base64: base64 });
        alert('Edital enviado com sucesso!');
      } else {
        alert('Erro ao enviar o edital.');
        console.error(error);
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadEdital = () => {
    if (!formData?.edital_pdf_base64) return;
    const a = document.createElement('a');
    a.href = formData.edital_pdf_base64;
    a.download = `Edital_${formData.nome_projeto || 'Emenda'}.pdf`;
    a.click();
  };

  if (loading) return <div className="p-8">Carregando...</div>;
  if (!formData) return <div className="p-8">Formulário não encontrado.</div>;

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/emendas/${id}/formularios`} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Visualizar Formulário</p>
          <h2 className="text-3xl font-black font-headline text-on-surface">
            {emenda ? emenda.objeto : 'Carregando...'}
          </h2>
        </div>
      </div>

      {/* Edital Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <FileText className="text-primary" size={20} />
            Edital da Emenda
          </h3>
          <p className="text-sm text-slate-500 mt-1">Faça o upload do documento em PDF referente a este formulário.</p>
        </div>
        <div className="flex items-center gap-3">
          {formData.edital_pdf_base64 && (
            <button 
              onClick={handleDownloadEdital}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors text-sm font-bold"
            >
              <Download size={16} />
              Baixar Edital
            </button>
          )}
          <label className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm font-bold shadow-sm">
            <Upload size={16} />
            {uploading ? 'Enviando...' : (formData.edital_pdf_base64 ? 'Substituir PDF' : 'Upload PDF')}
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              onChange={handleUploadEdital}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 space-y-6">
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
                <span className="text-sm text-primary flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                  <FileText size={16} /> {formData.orcamento_url}
                </span>
              ) : (
                <span className="text-sm text-slate-500">Nenhum arquivo anexado</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">g) Currículo da entidade</label>
            <div className="flex items-center gap-4">
              {formData.curriculo_url ? (
                <span className="text-sm text-primary flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                  <FileText size={16} /> {formData.curriculo_url}
                </span>
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
