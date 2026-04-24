'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, FileText, Eye, Upload, Download } from 'lucide-react';
import Link from 'next/link';

export default function FormulariosEmendaList({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  
  const [emenda, setEmenda] = useState<any>(null);
  const [formularios, setFormularios] = useState<any[]>([]);
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

      // Fetch existing forms for this emenda
      const { data: formsData } = await supabase
        .from('formularios_emenda')
        .select('*')
        .eq('id_emenda', id)
        .order('created_at', { ascending: false });
      
      if (formsData) {
        setFormularios(formsData);
      }
      
      setLoading(false);
    }
    fetchData();
  }, [id]);

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
        .from('orcamentos')
        .update({ edital_pdf_base64: base64 })
        .eq('id', id);
      
      if (!error) {
        setEmenda({ ...emenda, edital_pdf_base64: base64 });
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
    if (!emenda?.edital_pdf_base64) return;
    const a = document.createElement('a');
    a.href = emenda.edital_pdf_base64;
    a.download = `Edital_${emenda.objeto || 'Emenda'}.pdf`;
    a.click();
  };

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/emendas" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Adesões ao Edital da Emenda</p>
          <h2 className="text-3xl font-black font-headline text-on-surface">
            {emenda ? emenda.objeto : 'Carregando...'}
          </h2>
        </div>
      </div>

      {/* Edital Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <FileText className="text-primary" size={20} />
              Edital da Emenda
            </h3>
            <p className="text-sm text-slate-500 mt-1">Configure o período e o documento oficial do Edital.</p>
          </div>
          <div className="flex items-center gap-3">
            {emenda?.edital_pdf_base64 && (
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
              {uploading ? 'Enviando...' : (emenda?.edital_pdf_base64 ? 'Substituir PDF' : 'Upload PDF')}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Inicial do Edital</label>
            <input 
              type="date"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 focus:border-primary transition-all outline-none text-sm"
              value={emenda?.data_inicial_edital || ''}
              onChange={async (e) => {
                const newVal = e.target.value;
                const { error } = await supabase.from('orcamentos').update({ data_inicial_edital: newVal }).eq('id', id);
                if (!error) setEmenda({ ...emenda, data_inicial_edital: newVal });
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Final do Edital</label>
            <input 
              type="date"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 focus:border-primary transition-all outline-none text-sm"
              value={emenda?.data_final_edital || ''}
              onChange={async (e) => {
                const newVal = e.target.value;
                const { error } = await supabase.from('orcamentos').update({ data_final_edital: newVal }).eq('id', id);
                if (!error) setEmenda({ ...emenda, data_final_edital: newVal });
              }}
            />
          </div>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Data de Criação</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Entidade</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">CNPJ</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Projeto</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {formularios.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Nenhuma adesão ao edital encontrada para esta emenda.</td></tr>
              ) : (
                formularios.map(form => (
                  <tr key={form.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm text-on-surface font-medium">
                        {new Date(form.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-on-surface">{form.nome_entidade}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-on-surface">{form.cnpj}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-on-surface">{form.nome_projeto}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/emendas/${id}/formularios/${form.id}`} className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-blue-50" title="Visualizar">
                          <Eye size={16} />
                        </Link>
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
