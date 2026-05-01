'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';
import { useDeputado } from '@/context/DeputadoContext';

export default function ProjetoForm({ id }: { id?: string } = {}) {
  const router = useRouter();
  const resolvedParams = { id };
  const isEditing = !!id;
  const { selectedDeputado } = useDeputado();
  
  const [areas, setAreas] = useState<any[]>([]);
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    descricao: '',
    ementa: '',
    tipo: 'Projeto de Lei Ordinária (PL)',
    autor: '',
    municipio: '',
    valor_projeto: 0,
    valor_projeto_formatted: '',
    id_area_tematica: '',
    etapa: 'Liberado'
  });

  const formatCurrency = (value: string | number) => {
    const stringValue = String(value).replace(/\D/g, '');
    const amount = Number(stringValue) / 100;
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    const numericValue = Number(e.target.value.replace(/\D/g, '')) / 100;
    setFormData({ ...formData, valor_projeto_formatted: formatted, valor_projeto: numericValue });
  };

  useEffect(() => {
    async function fetchData() {
      if (!selectedDeputado) return;
      
      const { data: areasData } = await supabase.from('areas_tematicas').select('*');
      if (areasData) setAreas(areasData);

      const { data: municipiosData } = await supabase
        .from('municipio')
        .select('*, unidade_federacao!inner(sigla)')
        .eq('unidade_federacao.sigla', selectedDeputado.estado)
        .order('nome');
      if (municipiosData) setMunicipios(municipiosData);

      if (isEditing) {
        const { data: projetoData } = await supabase.from('projetos').select('*').eq('id', resolvedParams.id).single();
        if (projetoData) {
          setFormData({
            data: projetoData.data || new Date().toISOString().split('T')[0],
            descricao: projetoData.descricao,
            ementa: projetoData.ementa || '',
            tipo: projetoData.tipo || 'Projeto de Lei Ordinária (PL)',
            autor: projetoData.autor || '',
            municipio: projetoData.municipio || '',
            valor_projeto: projetoData.valor_projeto,
            valor_projeto_formatted: formatCurrency(projetoData.valor_projeto * 100),
            id_area_tematica: projetoData.id_area_tematica || '',
            etapa: projetoData.etapa || 'Liberado'
          });
        }
        setFetching(false);
      }
    }
    fetchData();
  }, [isEditing, resolvedParams?.id, selectedDeputado]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    if (isEditing) {
      const { valor_projeto_formatted, ...payload } = formData;
      const finalPayload = { ...payload, id_deputado: selectedDeputado?.id || null };
      const { error } = await supabase.from('projetos').update(finalPayload).eq('id', resolvedParams.id);
      if (!error) router.push('/projetos');
      else alert('Erro ao atualizar projeto');
    } else {
      const { valor_projeto_formatted, ...payload } = formData;
      const finalPayload = { ...payload, id_deputado: selectedDeputado?.id || null };
      const { error } = await supabase.from('projetos').insert([finalPayload]);
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

          <div className="col-span-2 space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Ementa</label>
            <textarea 
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all min-h-[100px]"
              value={formData.ementa}
              onChange={e => setFormData({...formData, ementa: e.target.value})}
              placeholder="Texto livre da ementa..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tipo do Projeto</label>
            <select 
              required
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all appearance-none"
              value={formData.tipo}
              onChange={e => setFormData({...formData, tipo: e.target.value})}
            >
              <option value="Proposta de Emenda à Constituição (PEC)">Proposta de Emenda à Constituição (PEC)</option>
              <option value="Projeto de Lei Complementar (PLP)">Projeto de Lei Complementar (PLP)</option>
              <option value="Projeto de Lei Ordinária (PL)">Projeto de Lei Ordinária (PL)</option>
              <option value="Projeto de Decreto Legislativo (PDL)">Projeto de Decreto Legislativo (PDL)</option>
              <option value="Resolução (PRC)">Resolução (PRC)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Autor do Projeto</label>
            <input 
              type="text" 
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              value={formData.autor}
              onChange={e => setFormData({...formData, autor: e.target.value})}
              placeholder="Nome do autor"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Município</label>
            <select 
              required
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all appearance-none"
              value={formData.municipio}
              onChange={e => setFormData({...formData, municipio: e.target.value})}
            >
              <option value="" disabled>Selecione um município</option>
              {municipios.map(mun => (
                <option key={mun.id} value={`${mun.nome} - ${mun.unidade_federacao?.sigla}`}>
                  {mun.nome} - {mun.unidade_federacao?.sigla}
                </option>
              ))}
            </select>
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
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Valor do Projeto</label>
            <input 
              required
              type="text" 
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              value={formData.valor_projeto_formatted}
              onChange={handleCurrencyChange}
              placeholder="R$ 0,00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Etapa</label>
            <select 
              required
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all appearance-none"
              value={formData.etapa}
              onChange={e => setFormData({...formData, etapa: e.target.value})}
            >
              <option value="Rascunho">Rascunho</option>
              <option value="Liberado">Liberado</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Data do Projeto</label>
            <input 
              required
              type="date" 
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              value={formData.data}
              onChange={e => setFormData({...formData, data: e.target.value})}
            />
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
