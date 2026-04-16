'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Upload, FileText, Download } from 'lucide-react';
import { useDeputado } from '@/context/DeputadoContext';

export default function FormularioEmenda() {
  const { selectedDeputado } = useDeputado();
  const [emendas, setEmendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const initialFormState = {
    id_emenda: '',
    nome_entidade: '',
    cnpj: '',
    nome_projeto: '',
    resumo_projeto: '',
    descricao_projeto: '',
    orcamento_url: '',
    curriculo_url: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  
  useEffect(() => {
    async function fetchEmendas() {
      if (!selectedDeputado) {
        setEmendas([]);
        setFetching(false);
        return;
      }
      
      setFetching(true);
      const { data } = await supabase
        .from('orcamentos')
        .select('id, objeto, valor, edital_pdf_base64')
        .eq('id_deputado', selectedDeputado.id);
      
      if (data) {
        const emendasComEdital = data.filter(e => e.edital_pdf_base64 && e.edital_pdf_base64.trim() !== '');
        setEmendas(emendasComEdital);
      }
      setFetching(false);
    }
    fetchEmendas();
  }, [selectedDeputado]);

  // Calculate Edital based on selected emenda
  const selectedEmendaId = formData.id_emenda;
  const selectedEmenda = emendas.find(e => e.id === selectedEmendaId);
  const editalBase64 = selectedEmenda?.edital_pdf_base64 || null;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, field: 'orcamento_url' | 'curriculo_url') {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor, selecione um arquivo PDF.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({ ...formData, [field]: base64String });
      alert(`Arquivo ${file.name} carregado com sucesso!`);
    };
    reader.readAsDataURL(file);
  }

  const handleDownloadEdital = () => {
    if (!editalBase64) return;
    const a = document.createElement('a');
    a.href = editalBase64;
    const selectedEmenda = emendas.find(e => e.id === formData.id_emenda);
    a.download = `Edital_${selectedEmenda?.objeto || 'Emenda'}.pdf`;
    a.click();
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.id_emenda) {
      alert('Selecione uma emenda primeiro.');
      return;
    }
    
    setLoading(true);
    
    const payload = {
      ...formData
    };

    const { error } = await supabase
      .from('formularios_emenda')
      .insert([payload]);
    
    if (!error) {
      alert('Adesão Edital salva com sucesso!');
      setFormData(initialFormState);
    } else {
      alert(`Erro ao salvar adesão edital: ${error.message || error.details || 'Erro desconhecido'}`);
      console.error('Supabase insert error:', error);
    }
    
    setLoading(false);
  }

  if (fetching) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">
            Nova Adesão Edital
          </p>
          <h2 className="text-2xl md:text-3xl font-black font-headline text-on-surface">
            Preenchimento de Emenda
          </h2>
        </div>
        
        {editalBase64 && (
          <button 
            onClick={handleDownloadEdital}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors text-sm font-bold shadow-sm border border-slate-200 w-full md:w-auto justify-center"
          >
            <Download size={16} />
            Download Edital Emenda
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-slate-100 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Selecione a Emenda</label>
            <select 
              required
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all appearance-none"
              value={formData.id_emenda}
              onChange={e => setFormData({...formData, id_emenda: e.target.value})}
            >
              <option value="" disabled>Selecione uma emenda...</option>
              {emendas.map(emenda => (
                <option key={emenda.id} value={emenda.id}>
                  {emenda.objeto} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(emenda.valor)}
                </option>
              ))}
            </select>
          </div>

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
                  <FileText size={16} /> Arquivo carregado
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
                  <FileText size={16} /> Arquivo carregado
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
            disabled={loading || !selectedDeputado}
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
