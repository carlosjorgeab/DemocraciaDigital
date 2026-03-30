'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useDeputado } from '@/context/DeputadoContext';
import { use } from 'react';

export default function EmendaForm({ params }: { params?: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = params ? use(params) : null;
  const isEditing = !!resolvedParams?.id;
  const { selectedDeputado } = useDeputado();
  
  const [projetos, setProjetos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    tipo: 'DESPESA',
    descricao: '',
    valor: 0,
    id_projeto: ''
  });

  useEffect(() => {
    async function fetchData() {
      const { data: projetosData } = await supabase.from('projetos').select('*');
      if (projetosData) setProjetos(projetosData);

      if (isEditing) {
        const { data: orcamentoData } = await supabase.from('orcamentos').select('*').eq('id', resolvedParams.id).single();
        if (orcamentoData) {
          setFormData({
            data: orcamentoData.data,
            tipo: orcamentoData.tipo,
            descricao: orcamentoData.descricao || '',
            valor: orcamentoData.valor,
            id_projeto: orcamentoData.id_projeto || ''
          });
        }
        setFetching(false);
      }
    }
    fetchData();
  }, [isEditing, resolvedParams?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDeputado) {
      alert('Selecione um deputado primeiro');
      return;
    }

    setLoading(true);
    
    const payload = {
      ...formData,
      id_deputado: selectedDeputado.id,
      id_projeto: formData.id_projeto || null,
      uf: selectedDeputado.estado
    };

    if (isEditing) {
      const { error } = await supabase.from('orcamentos').update(payload).eq('id', resolvedParams.id);
      if (!error) router.push('/emendas');
      else alert('Erro ao atualizar emenda');
    } else {
      const { error } = await supabase.from('orcamentos').insert([payload]);
      if (!error) router.push('/emendas');
      else alert('Erro ao salvar emenda');
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
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Emendas</p>
          <h2 className="text-3xl font-black font-headline text-on-surface">
            {isEditing ? 'Editar Emenda' : 'Nova Emenda'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2 space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Descrição</label>
            <input 
              required
              type="text" 
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              value={formData.descricao}
              onChange={e => setFormData({...formData, descricao: e.target.value})}
              placeholder="Ex: Emenda para reforma..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Unidade da Federação</label>
            <input 
              type="text" 
              disabled
              className="w-full bg-slate-100 border border-transparent rounded-lg px-4 py-3 text-sm outline-none text-slate-500 cursor-not-allowed"
              value={selectedDeputado?.estado || 'Selecione um deputado'}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Data</label>
            <input 
              required
              type="date" 
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              value={formData.data}
              onChange={e => setFormData({...formData, data: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tipo</label>
            <select 
              required
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all appearance-none"
              value={formData.tipo}
              onChange={e => setFormData({...formData, tipo: e.target.value})}
            >
              <option value="DESPESA">Despesa</option>
              <option value="RECEITA">Receita</option>
              <option value="EMPENHO">Empenho</option>
              <option value="PAGAMENTO">Pagamento</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Valor (R$)</label>
            <input 
              required
              type="number" 
              step="0.01"
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              value={formData.valor}
              onChange={e => setFormData({...formData, valor: parseFloat(e.target.value)})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Projeto Vinculado (Opcional)</label>
            <select 
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all appearance-none"
              value={formData.id_projeto}
              onChange={e => setFormData({...formData, id_projeto: e.target.value})}
            >
              <option value="">Nenhum</option>
              {projetos.map(projeto => (
                <option key={projeto.id} value={projeto.id}>{projeto.descricao}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={loading || !selectedDeputado}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white px-8 py-3 rounded-full text-sm font-bold hover:opacity-90 transition-all shadow-md disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Salvando...' : 'Salvar Emenda'}
          </button>
        </div>
      </form>
    </div>
  );
}
