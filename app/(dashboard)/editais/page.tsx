'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Search, FileSignature, Calendar, Download, Trash2, Edit2, AlertCircle, Save, X } from 'lucide-react';
import { useDeputado } from '@/context/DeputadoContext';

interface Edital {
  id: string;
  titulo: string;
  data_inicio: string;
  data_fim: string;
  arquivo_pdf_base64: string | null;
  id_deputado: string;
}

export default function EditaisPage() {
  const { selectedDeputado } = useDeputado();
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEdital, setEditingEdital] = useState<Edital | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    titulo: '',
    data_inicio: '',
    data_fim: '',
    arquivo_pdf_base64: ''
  });

  useEffect(() => {
    if (selectedDeputado) {
      fetchEditais();
    }
  }, [selectedDeputado]);

  async function fetchEditais() {
    if (!selectedDeputado) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('editais')
        .select('*')
        .eq('id_deputado', selectedDeputado.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setEditais(data);
    } catch (err) {
      console.error('Error fetching editais:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor, envie apenas arquivos PDF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData({ ...formData, arquivo_pdf_base64: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = (base64: string, titulo: string) => {
    const a = document.createElement('a');
    a.href = base64;
    a.download = `Edital_${titulo.replace(/\s+/g, '_')}.pdf`;
    a.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeputado) return;

    try {
      if (editingEdital) {
        const { error } = await supabase
          .from('editais')
          .update(formData)
          .eq('id', editingEdital.id);
          
        if (error) throw error;
        alert('Edital atualizado com sucesso!');
      } else {
        const payload = {
          ...formData,
          id_deputado: selectedDeputado.id
        };
        const { error } = await supabase.from('editais').insert([payload]);
        if (error) throw error;
        alert('Edital cadastrado com sucesso!');
      }
      
      setShowModal(false);
      setEditingEdital(null);
      setFormData({ titulo: '', data_inicio: '', data_fim: '', arquivo_pdf_base64: '' });
      fetchEditais();
    } catch (err: any) {
      console.error('Save error:', err);
      alert(`Erro: ${err.message || 'Falha ao salvar o edital.'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este edital?')) {
      try {
        const { error } = await supabase.from('editais').delete().eq('id', id);
        if (error) throw error;
        fetchEditais();
      } catch (err) {
        console.error('Delete error:', err);
        alert('Erro ao excluir edital.');
      }
    }
  };

  const filteredEditais = editais.filter(e => 
    e.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {!selectedDeputado && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-center gap-4 text-amber-800">
          <AlertCircle size={24} className="shrink-0" />
          <div>
            <p className="font-bold">Atenção</p>
            <p className="text-sm">Selecione um deputado na barra superior para gerenciar os editais vinculados.</p>
          </div>
        </div>
      )}

      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${!selectedDeputado ? 'opacity-50 pointer-events-none' : ''}`}>
        <div>
          <h2 className="text-3xl font-black font-headline text-slate-900 dark:text-white uppercase tracking-tight">
            Editais
          </h2>
          <p className="text-slate-500 font-medium mt-1">Gerencie os editais e seus prazos</p>
        </div>
        
        <button 
          onClick={() => {
            setEditingEdital(null);
            setFormData({ titulo: '', data_inicio: '', data_fim: '', arquivo_pdf_base64: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95 uppercase text-xs tracking-widest"
          disabled={!selectedDeputado}
        >
          <Plus size={18} />
          Novo Edital
        </button>
      </div>

      <div className={`flex items-center bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-sm border border-slate-200 dark:border-slate-700 max-w-md ${!selectedDeputado ? 'opacity-50 pointer-events-none' : ''}`}>
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar edital..." 
          className="bg-transparent border-none focus:ring-0 w-full ml-2 text-slate-700 dark:text-slate-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={!selectedDeputado}
        />
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${!selectedDeputado ? 'opacity-50 pointer-events-none' : ''}`}>
        {loading && selectedDeputado ? (
          <div className="col-span-full py-20 text-center text-slate-500">Carregando editais...</div>
        ) : !selectedDeputado ? (
          <div className="col-span-full py-20 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            Selecione um deputado para visualizar os editais.
          </div>
        ) : filteredEditais.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            Nenhum edital encontrado para este deputado.
          </div>
        ) : (
          filteredEditais.map(edital => (
            <div key={edital.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4 hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                    <FileSignature size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{edital.titulo}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl flex items-center gap-3">
                 <Calendar className="text-slate-400" size={16} />
                 <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Período</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {new Date(edital.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR')} até{' '}
                      {new Date(edital.data_fim + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </p>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setEditingEdital(edital);
                      setFormData({
                        titulo: edital.titulo,
                        data_inicio: edital.data_inicio,
                        data_fim: edital.data_fim,
                        arquivo_pdf_base64: edital.arquivo_pdf_base64 || ''
                      });
                      setShowModal(true);
                    }}
                    className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(edital.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                {edital.arquivo_pdf_base64 && (
                  <button 
                    onClick={() => handleDownload(edital.arquivo_pdf_base64!, edital.titulo)}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold shadow-sm"
                  >
                    <Download size={14} />
                    Download
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-black font-headline uppercase tracking-tight text-slate-900 dark:text-white">
                {editingEdital ? 'Editar Edital' : 'Novo Edital'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Título do Edital</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 focus:border-primary transition-all outline-none font-medium"
                    placeholder="Ex: Edital Cultura 2024"
                    value={formData.titulo}
                    onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Data Início</label>
                    <input 
                      type="date" 
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 focus:border-primary transition-all outline-none font-medium text-slate-700 dark:text-slate-200"
                      value={formData.data_inicio}
                      onChange={e => setFormData({ ...formData, data_inicio: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Data Fim</label>
                    <input 
                      type="date" 
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 focus:border-primary transition-all outline-none font-medium text-slate-700 dark:text-slate-200"
                      value={formData.data_fim}
                      onChange={e => setFormData({ ...formData, data_fim: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Arquivo (PDF)</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-3 rounded-xl cursor-pointer transition-colors w-full border border-dashed border-slate-300 dark:border-slate-600 font-medium text-sm">
                      <FileSignature size={18} />
                      {formData.arquivo_pdf_base64 ? 'Arquivo Selecionado' : 'Selecionar Arquivo PDF'}
                      <input 
                        type="file" 
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                    {formData.arquivo_pdf_base64 && (
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, arquivo_pdf_base64: '' })}
                        className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                        title="Remover"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                  <Save size={18} />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
