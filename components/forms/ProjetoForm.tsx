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
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    descricao: '',
    ementa: '',
    tipo: 'Projeto de Lei Ordinária (PL)',
    autor: '',
    etapa: 'Liberado',
    tramitacao: 'Em elaboração',
    url_legislativo: '',
    numero_proposicao: ''
  });

  useEffect(() => {
    async function fetchData() {
      if (!selectedDeputado) return;
      
      const { data: areasData } = await supabase.from('areas_tematicas').select('*');
      if (areasData) setAreas(areasData);

      if (isEditing) {
        const { data: projetoData } = await supabase.from('projetos').select('*').eq('id', resolvedParams.id).single();
        if (projetoData) {
          setFormData({
            data: projetoData.data || new Date().toISOString().split('T')[0],
            descricao: projetoData.descricao,
            ementa: projetoData.ementa || '',
            tipo: projetoData.tipo || 'Projeto de Lei Ordinária (PL)',
            autor: projetoData.autor || selectedDeputado?.nome || '',
            etapa: projetoData.etapa || 'Liberado',
            tramitacao: projetoData.tramitacao || 'Em elaboração',
            url_legislativo: projetoData.url_legislativo || '',
            numero_proposicao: projetoData.numero_proposicao || ''
          });

          // Fetch multiple thematic areas from relation table
          const { data: relations } = await supabase
            .from('projeto_areas')
            .select('id_area_tematica')
            .eq('id_projeto', resolvedParams.id);
          
          if (relations && relations.length > 0) {
            setSelectedAreaIds(relations.map((r: any) => r.id_area_tematica));
          } else if (projetoData.id_area_tematica) {
            setSelectedAreaIds([projetoData.id_area_tematica]);
          }
        }
        setFetching(false);
      } else {
        setFormData(prev => ({
          ...prev,
          autor: selectedDeputado?.nome || ''
        }));
      }
    }
    fetchData();
  }, [isEditing, resolvedParams?.id, selectedDeputado]);

  const handleToggleArea = (areaId: string) => {
    setSelectedAreaIds(prev =>
      prev.includes(areaId)
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const finalPayload = { 
      ...formData, 
      id_deputado: selectedDeputado?.id || null 
    };

    if (isEditing) {
      const { error } = await supabase.from('projetos').update(finalPayload).eq('id', resolvedParams.id);
      if (!error) {
        try {
          await supabase.from('projeto_areas').delete().eq('id_projeto', resolvedParams.id);
          if (selectedAreaIds.length > 0) {
            const relations = selectedAreaIds.map(areaId => ({
              id_projeto: resolvedParams.id,
              id_area_tematica: areaId
            }));
            await supabase.from('projeto_areas').insert(relations);
          }
        } catch (err) {
          console.error('Error saving projects-areas relations:', err);
        }
        router.push('/projetos');
      } else {
        alert('Erro ao atualizar projeto');
      }
    } else {
      const { data: newProj, error } = await supabase.from('projetos').insert([finalPayload]).select().single();
      if (!error && newProj) {
        try {
          if (selectedAreaIds.length > 0) {
            const relations = selectedAreaIds.map(areaId => ({
              id_projeto: newProj.id,
              id_area_tematica: areaId
            }));
            await supabase.from('projeto_areas').insert(relations);
          }
        } catch (err) {
          console.error('Error saving projects-areas relations:', err);
        }
        router.push('/projetos');
      } else {
        alert('Erro ao salvar projeto');
      }
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

          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Áreas Temáticas</label>
            <p className="text-xs text-slate-500 mb-2">Selecione uma ou mais áreas temáticas para este projeto:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {areas.map(area => {
                const isSelected = selectedAreaIds.includes(area.id);
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => handleToggleArea(area.id)}
                    className={`flex items-center gap-2 p-3 border-2 rounded-2xl transition-all text-left ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary scale-[1.02] shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center p-1.5 transition-transform duration-300 bg-slate-50 border shadow-sm shrink-0"
                      style={{ 
                        borderColor: isSelected ? area.cor : '#e2e8f0',
                        color: area.cor || '#005baa'
                      }}
                    >
                      {area.icone_url ? (
                        area.icone_url.startsWith('<svg') ? (
                          <div 
                            dangerouslySetInnerHTML={{ __html: area.icone_url }} 
                            className="w-full h-full flex items-center justify-center" 
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={area.icone_url} alt="" className="w-full h-full object-contain" />
                        )
                      ) : (
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: area.cor || '#005baa' }} />
                      )}
                    </div>
                    <span className="text-xs font-bold line-clamp-2 leading-tight">{area.nome}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tramitação</label>
            <select 
              required
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all appearance-none"
              value={formData.tramitacao}
              onChange={e => setFormData({...formData, tramitacao: e.target.value})}
            >
              <option value="Em elaboração">Em elaboração</option>
              <option value="Protocolado na Mesa Diretora">Protocolado na Mesa Diretora</option>
              <option value="Em análise na CCJ">Em análise na CCJ (Comissão de Constituição e Justiça)</option>
              <option value="Em análise nas Comissões Temáticas">Em análise nas Comissões Temáticas</option>
              <option value="Aguardando votação no Plenário">Aguardando votação no Plenário</option>
              <option value="Aprovado / Enviado para Sanção">Aprovado / Enviado para Sanção</option>
              <option value="Sancionado e Publicado">Sancionado e Publicado</option>
              <option value="Veto Parcial / Total">Veto Parcial / Total</option>
              <option value="Acompanhar no Link...">Acompanhar no Link...</option>
              <option value="Arquivado">Arquivado</option>
            </select>
          </div>

          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Link da URL do Projeto Legislativo</label>
            <input 
              type="url" 
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              value={formData.url_legislativo}
              onChange={e => setFormData({...formData, url_legislativo: e.target.value})}
              placeholder="Ex: https://www.al.gov.br/processo/..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Nº Proposição</label>
            <input 
              type="text" 
              maxLength={15}
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all"
              value={formData.numero_proposicao}
              onChange={e => setFormData({...formData, numero_proposicao: e.target.value})}
              placeholder="Ex: PL 123/2026"
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
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Data Apresentação</label>
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
