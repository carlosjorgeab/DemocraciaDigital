'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, FileText } from 'lucide-react';
import Link from 'next/link';

export default function FormularioEmenda({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  
  const [emenda, setEmenda] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    nome_entidade: '',
    cnpj: '',
    nome_projeto: '',
    resumo_projeto: '',
    descricao_projeto: '',
    orcamento_url: '',
    curriculo_url: ''
  });

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

      // Fetch existing form if any
      const { data: formData } = await supabase
        .from('formularios_emenda')
        .select('*')
        .eq('id_emenda', id)
        .single();
      
      if (formData) {
        setFormData({
          nome_entidade: formData.nome_entidade || '',
          cnpj: formData.cnpj || '',
          nome_projeto: formData.nome_projeto || '',
          resumo_projeto: formData.resumo_projeto || '',
          descricao_projeto: formData.descricao_projeto || '',
          orcamento_url: formData.orcamento_url || '',
          curriculo_url: formData.curriculo_url || ''
        });
      }
      
      setFetching(false);
    }
    fetchData();
  }, [id]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, field: 'orcamento_url' | 'curriculo_url') {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, we would upload to Supabase Storage here.
    // For this prototype, we'll just simulate an upload and store a fake URL or file name.
    // Since we don't have a storage bucket set up in the prompt, we'll just use the file name as a placeholder.
    alert(`Simulando upload do arquivo: ${file.name}`);
    setFormData({ ...formData, [field]: file.name });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      id_emenda: id,
      ...formData
    };

    // Check if exists
    const { data: existing } = await supabase
      .from('formularios_emenda')
      .select('id')
      .eq('id_emenda', id)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('formularios_emenda')
        .update(payload)
        .eq('id_emenda', id);
      
      if (!error) {
        alert('Adesão Edital atualizada com sucesso!');
        router.push('/emendas');
      } else {
        alert('Erro ao atualizar adesão edital');
      }
    } else {
      const { error } = await supabase
        .from('formularios_emenda')
        .insert([payload]);
      
      if (!error) {
        alert('Adesão Edital salva com sucesso!');
        router.push('/emendas');
      } else {
        alert('Erro ao salvar adesão edital');
      }
    }
    setLoading(false);
  }

  if (fetching) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/emendas" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Adesão Edital da Emenda</p>
          <h2 className="text-3xl font-black font-headline text-on-surface">
            {emenda ? emenda.objeto : 'Carregando...'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">a) Nome da entidade ou ente público</label>
            <input 
              required
              type="text" 
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              value={formData.nome_entidade}
              onChange={e => setFormData({...formData, nome_entidade: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">b) CNPJ</label>
            <input 
              required
              type="text" 
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              value={formData.cnpj}
              onChange={e => setFormData({...formData, cnpj: e.target.value})}
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">c) Nome do projeto</label>
            <input 
              required
              type="text" 
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              value={formData.nome_projeto}
              onChange={e => setFormData({...formData, nome_projeto: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">d) Resumo / Objeto do projeto (no máximo 3 linhas)</label>
            <textarea 
              required
              rows={3}
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all resize-none"
              value={formData.resumo_projeto}
              onChange={e => setFormData({...formData, resumo_projeto: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">e) Descrição de como pretende desenvolver o projeto</label>
            <textarea 
              required
              rows={5}
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              value={formData.descricao_projeto}
              onChange={e => setFormData({...formData, descricao_projeto: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">f) Orçamento: Planilha de valores detalhados do projeto</label>
            <p className="text-xs text-slate-500 mb-2">Se possível destacar o que será destinado a custeio e / ou investimento. (Formato PDF)</p>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm font-medium">
                <Upload size={16} />
                Selecionar Arquivo PDF
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  onChange={e => handleFileUpload(e, 'orcamento_url')}
                />
              </label>
              {formData.orcamento_url && (
                <span className="text-sm text-primary flex items-center gap-1">
                  <FileText size={16} /> {formData.orcamento_url}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">g) Currículo da entidade</label>
            <p className="text-xs text-slate-500 mb-2">Comprovando sua existência, experiência com o objeto da emenda (para OSCs). (Formato PDF)</p>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm font-medium">
                <Upload size={16} />
                Selecionar Arquivo PDF
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  onChange={e => handleFileUpload(e, 'curriculo_url')}
                />
              </label>
              {formData.curriculo_url && (
                <span className="text-sm text-primary flex items-center gap-1">
                  <FileText size={16} /> {formData.curriculo_url}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Observação:</strong> Sugerimos consultar os tutoriais do Transferegov.br sobre os atos preparatórios antes de montar seu projeto e principalmente sua planilha de orçamento:{' '}
            <a href="https://www.gov.br/transferegov/pt-br/manuais/transferegov/discricionarias" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
              https://www.gov.br/transferegov/pt-br/manuais/transferegov/discricionarias
            </a>
          </p>
        </div>

        <div className="pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white px-8 py-3 rounded-full text-sm font-bold hover:opacity-90 transition-all shadow-md disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Salvando...' : 'Salvar Adesão Edital'}
          </button>
        </div>
      </form>
    </div>
  );
}
