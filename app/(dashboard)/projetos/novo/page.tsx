'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function ProjetoForm({ params }: { params?: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = params ? use(params) : null;
  const isEditing = !!resolvedParams?.id;
  
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [formData, setFormData] = useState({
    descricao: '',
    municipio: '',
    valor_projeto: 0,
    id_area_tematica: '',
    status: 'Em Execução'
  });

  useEffect(() => {
    async function fetchData() {
      const { data: areasData } = await supabase.from('areas_tematicas').select('*');
      if (areasData) setAreas(areasData);

      if (isEditing) {
        const { data: projetoData } = await supabase.from('projetos').select('*').eq('id', resolvedParams.id).single();
        if (projetoData) {
          setFormData({
            descricao: projetoData.descricao,
            municipio: projetoData.municipio || '',
            valor_projeto: projetoData.valor_projeto,
            id_area_tematica: projetoData.id_area_tematica || '',
            status: projetoData.status || 'Em Execução'
          });
        }
        setFetching(false);
      }
    }
    fetchData();
  }, [isEditing, resolvedParams?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    if (isEditing) {
      const { error } = await supabase.from('projetos').update(formData).eq('id', resolvedParams.id);
      if (!error) router.push('/projetos');
      else alert('Erro ao atualizar projeto');
    } else {
      const { error } = await supabase.from('projetos').insert([formData]);
      if (!error) router.push('/projetos');
      else alert('Erro ao salvar projeto');
    }
    setLoading(false);
  }

  if (fetching) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/projetos" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Projetos</p>
          <h2 className="text-3xl font-black font-headline text-on-surface">
            {isEditing ? 'Editar Projeto' : 'Novo Projeto'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2 space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Descrição do Projeto</label>
            <input 
              required
              type="text" 
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              value={formData.descricao}
              onChange={e => setFormData({...formData, descricao: e.target.value})}
              placeholder="Ex: Reforma da Escola Municipal..."
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Município</label>
            <input 
              type="text" 
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              value={formData.municipio}
              onChange={e => setFormData({...formData, municipio: e.target.value})}
              placeholder="Ex: São Paulo - SP"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Área Temática</label>
            <select 
              required
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all appearance-none"
              value={formData.id_area_tematica}
              onChange={e => setFormData({...formData, id_area_tematica: e.target.value})}
            >
              <option value="" disabled>Selecione uma área</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>{area.nome}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Valor do Projeto (R$)</label>
            <input 
              required
              type="number" 
              step="0.01"
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              value={formData.valor_projeto}
              onChange={e => setFormData({...formData, valor_projeto: parseFloat(e.target.value)})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Status</label>
            <select 
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all appearance-none"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="Planejamento">Planejamento</option>
              <option value="Em Licitação">Em Licitação</option>
              <option value="Em Execução">Em Execução</option>
              <option value="Concluído">Concluído</option>
            </select>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white px-8 py-3 rounded-full text-sm font-bold hover:opacity-90 transition-all shadow-md disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Salvando...' : 'Salvar Projeto'}
          </button>
        </div>
      </form>
    </div>
  );
}
