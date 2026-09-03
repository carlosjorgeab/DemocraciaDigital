'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, UserPlus, UserCheck, ChevronDown, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useDeputado } from '@/context/DeputadoContext';

export interface AutorItem {
  id: string;
  nome: string;
  cargo?: string;
  partido?: string;
  uf?: string;
}

export default function ProjetoForm({ id }: { id?: string } = {}) {
  const router = useRouter();
  const resolvedParams = { id };
  const isEditing = !!id;
  const { selectedDeputado } = useDeputado();
  
  const [areas, setAreas] = useState<any[]>([]);
  const [autores, setAutores] = useState<AutorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  
  // Modal de cadastro de autor no Supabase
  const [isNovoAutorModalOpen, setIsNovoAutorModalOpen] = useState(false);
  const [salvandoAutor, setSalvandoAutor] = useState(false);
  const [autorNotice, setAutorNotice] = useState<string | null>(null);
  const [novoAutorForm, setNovoAutorForm] = useState({
    nome: '',
    cargo: 'Deputado(a) Federal',
    partido: '',
    uf: 'PR'
  });

  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    descricao: '',
    ementa: '',
    tipo: 'Projeto de Lei Ordinária (PL)',
    autor: '',
    id_autor: null as string | null,
    etapa: 'Liberado',
    tramitacao: 'Em elaboração',
    url_legislativo: '',
    numero_proposicao: ''
  });

  // Carregar lista de autores cadastrados no Supabase
  const carregarAutores = useCallback(async () => {
    try {
      // 1. Consulta a tabela autores no Supabase
      const { data: autoresData, error } = await supabase
        .from('autores')
        .select('*')
        .order('nome', { ascending: true });

      if (!error && autoresData && autoresData.length > 0) {
        setAutores(autoresData);
        return autoresData;
      }

      // 2. Fallback de dados existentes para garantir exibição contínua
      const { data: deputadosData } = await supabase.from('deputado').select('id, nome, estado');
      const { data: projData } = await supabase.from('projetos').select('autor').not('autor', 'is', null);

      const mapAutores = new Map<string, AutorItem>();

      if (deputadosData) {
        deputadosData.forEach((d: any) => {
          if (d.nome) {
            mapAutores.set(d.nome.trim().toLowerCase(), {
              id: d.id,
              nome: d.nome.trim(),
              cargo: 'Deputado(a) Federal',
              uf: d.estado || 'PR'
            });
          }
        });
      }

      if (projData) {
        projData.forEach((p: any) => {
          const trimmed = p.autor ? p.autor.trim() : '';
          if (trimmed && !mapAutores.has(trimmed.toLowerCase())) {
            mapAutores.set(trimmed.toLowerCase(), {
              id: `legacy-${trimmed}`,
              nome: trimmed,
              cargo: 'Autor Cadastrado'
            });
          }
        });
      }

      const listaFallback = Array.from(mapAutores.values()).sort((a, b) => a.nome.localeCompare(b.nome));
      setAutores(listaFallback);
      return listaFallback;
    } catch (err) {
      console.error('Erro ao consultar autores do Supabase:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!selectedDeputado) return;
      
      const { data: areasData } = await supabase.from('areas_tematicas').select('*');
      if (areasData) setAreas(areasData);

      const listaAutoresCarregados = await carregarAutores();

      if (isEditing) {
        const { data: projetoData } = await supabase.from('projetos').select('*').eq('id', resolvedParams.id).single();
        if (projetoData) {
          const nomeAutor = projetoData.autor || selectedDeputado?.nome || '';
          const autorCorrespondente = listaAutoresCarregados.find(
            (a: AutorItem) => (projetoData.id_autor && a.id === projetoData.id_autor) || a.nome.toLowerCase() === nomeAutor.toLowerCase()
          );

          setFormData({
            data: projetoData.data || new Date().toISOString().split('T')[0],
            descricao: projetoData.descricao || '',
            ementa: projetoData.ementa || '',
            tipo: projetoData.tipo || 'Projeto de Lei Ordinária (PL)',
            autor: nomeAutor,
            id_autor: autorCorrespondente?.id && !autorCorrespondente.id.startsWith('legacy-') ? autorCorrespondente.id : (projetoData.id_autor || null),
            etapa: projetoData.etapa || 'Liberado',
            tramitacao: projetoData.tramitacao || 'Em elaboração',
            url_legislativo: projetoData.url_legislativo || '',
            numero_proposicao: projetoData.numero_proposicao || ''
          });

          // Buscar áreas temáticas associadas
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
        const autorInicial = selectedDeputado?.nome || '';
        const autorCorrespondente = listaAutoresCarregados.find(
          (a: AutorItem) => a.nome.toLowerCase() === autorInicial.toLowerCase()
        );

        setFormData(prev => ({
          ...prev,
          autor: autorInicial,
          id_autor: autorCorrespondente?.id && !autorCorrespondente.id.startsWith('legacy-') ? autorCorrespondente.id : null
        }));
      }
    }
    fetchData();
  }, [isEditing, resolvedParams?.id, selectedDeputado, carregarAutores]);

  const handleToggleArea = (areaId: string) => {
    setSelectedAreaIds(prev =>
      prev.includes(areaId)
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  // Cadastrar novo autor diretamente no banco de dados Supabase
  const handleSalvarNovoAutor = async (e: React.FormEvent) => {
    e.preventDefault();
    const nomeTrimmed = novoAutorForm.nome.trim();
    if (!nomeTrimmed) return;

    setSalvandoAutor(true);
    setAutorNotice(null);

    const payload = {
      nome: nomeTrimmed,
      cargo: novoAutorForm.cargo || 'Deputado(a) Federal',
      partido: novoAutorForm.partido ? novoAutorForm.partido.trim().toUpperCase() : null,
      uf: novoAutorForm.uf ? novoAutorForm.uf.trim().toUpperCase() : null,
      id_deputado: selectedDeputado?.id || null
    };

    try {
      const { data: insertedAutor, error } = await supabase
        .from('autores')
        .insert([payload])
        .select()
        .single();

      if (!error && insertedAutor) {
        setAutores(prev => {
          const exists = prev.some(a => a.id === insertedAutor.id || a.nome.toLowerCase() === insertedAutor.nome.toLowerCase());
          if (exists) {
            return prev.map(a => a.nome.toLowerCase() === insertedAutor.nome.toLowerCase() ? insertedAutor : a);
          }
          return [...prev, insertedAutor].sort((a, b) => a.nome.localeCompare(b.nome));
        });

        setFormData(prev => ({
          ...prev,
          autor: insertedAutor.nome,
          id_autor: insertedAutor.id
        }));

        setIsNovoAutorModalOpen(false);
        setNovoAutorForm({
          nome: '',
          cargo: 'Deputado(a) Federal',
          partido: '',
          uf: selectedDeputado?.estado || 'PR'
        });
      } else {
        console.warn('Inserção na tabela autores (Supabase) retornou observação:', error);
        
        const tempId = `temp-${Date.now()}`;
        const fallbackAutor: AutorItem = {
          id: tempId,
          nome: payload.nome,
          cargo: payload.cargo,
          partido: payload.partido || undefined,
          uf: payload.uf || undefined
        };

        setAutores(prev => [...prev, fallbackAutor].sort((a, b) => a.nome.localeCompare(b.nome)));
        setFormData(prev => ({
          ...prev,
          autor: payload.nome,
          id_autor: null
        }));

        setIsNovoAutorModalOpen(false);
        setAutorNotice(
          `Autor "${payload.nome}" selecionado para o projeto! Caso a tabela 'autores' ainda não tenha sido criada no Supabase, execute a migration gerada em "supabase/migrations/20260903150000_create_autores_table.sql".`
        );
      }
    } catch (err) {
      console.error('Erro ao conectar com Supabase para cadastro de autor:', err);
      alert('Ocorreu um erro ao cadastrar o autor no Supabase.');
    } finally {
      setSalvandoAutor(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const finalPayload: any = { 
      data: formData.data,
      descricao: formData.descricao,
      ementa: formData.ementa,
      tipo: formData.tipo,
      autor: formData.autor,
      etapa: formData.etapa,
      tramitacao: formData.tramitacao,
      url_legislativo: formData.url_legislativo,
      numero_proposicao: formData.numero_proposicao,
      id_deputado: selectedDeputado?.id || null 
    };

    if (formData.id_autor && !formData.id_autor.startsWith('legacy-') && !formData.id_autor.startsWith('temp-')) {
      finalPayload.id_autor = formData.id_autor;
    }

    if (isEditing) {
      let { error } = await supabase.from('projetos').update(finalPayload).eq('id', resolvedParams.id);
      
      // Fallback gracioso se a coluna id_autor ainda não existir na tabela remota do Supabase
      if (error && (error.message?.includes('id_autor') || error.code === 'PGRST204')) {
        delete finalPayload.id_autor;
        const retry = await supabase.from('projetos').update(finalPayload).eq('id', resolvedParams.id);
        error = retry.error;
      }

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
        alert('Erro ao atualizar projeto: ' + (error.message || ''));
      }
    } else {
      let { data: newProj, error } = await supabase.from('projetos').insert([finalPayload]).select().single();
      
      // Fallback gracioso se a coluna id_autor ainda não existir na tabela remota do Supabase
      if (error && (error.message?.includes('id_autor') || error.code === 'PGRST204')) {
        delete finalPayload.id_autor;
        const retry = await supabase.from('projetos').insert([finalPayload]).select().single();
        newProj = retry.data;
        error = retry.error;
      }

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
        alert('Erro ao salvar projeto: ' + (error ? error.message : ''));
      }
    }
    setLoading(false);
  }

  if (fetching) return <div className="p-8">Carregando...</div>;

  // Informações do autor atualmente selecionado para exibição das tags informativas
  const selectedAutorInfo = autores.find(
    a => (formData.id_autor && a.id === formData.id_autor) || a.nome.toLowerCase() === formData.autor.toLowerCase()
  );

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

          {/* Combo com Cadastro de Autores no Supabase */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
                <UserCheck size={14} className="text-primary" />
                Autor do Projeto
              </label>
              <button
                type="button"
                onClick={() => {
                  setNovoAutorForm({
                    nome: '',
                    cargo: 'Deputado(a) Federal',
                    partido: '',
                    uf: selectedDeputado?.estado || 'PR'
                  });
                  setIsNovoAutorModalOpen(true);
                }}
                className="text-[11px] font-bold text-primary hover:text-primary/90 bg-primary/10 hover:bg-primary/15 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
                title="Cadastrar novo autor no banco de dados Supabase"
              >
                <UserPlus size={13} />
                + Cadastrar Autor
              </button>
            </div>

            <div className="relative">
              <select 
                required
                className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-white rounded-lg px-4 py-3 text-sm outline-none transition-all appearance-none pr-10 font-medium text-slate-800 cursor-pointer"
                value={
                  formData.id_autor || 
                  (autores.find(a => a.nome.toLowerCase() === formData.autor.toLowerCase())?.id) || 
                  formData.autor || 
                  ''
                }
                onChange={e => {
                  const val = e.target.value;
                  if (val === '__CADASTRAR_NOVO__') {
                    setNovoAutorForm({
                      nome: '',
                      cargo: 'Deputado(a) Federal',
                      partido: '',
                      uf: selectedDeputado?.estado || 'PR'
                    });
                    setIsNovoAutorModalOpen(true);
                    return;
                  }
                  
                  const selected = autores.find(a => a.id === val || a.nome === val);
                  if (selected) {
                    setFormData(prev => ({
                      ...prev,
                      autor: selected.nome,
                      id_autor: selected.id.startsWith('legacy-') || selected.id.startsWith('temp-') ? null : selected.id
                    }));
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      autor: val,
                      id_autor: null
                    }));
                  }
                }}
              >
                <option value="">Selecione o autor do projeto...</option>
                
                {autores.map(autor => (
                  <option key={autor.id} value={autor.id}>
                    {autor.nome}
                    {autor.cargo ? ` (${autor.cargo})` : ''}
                    {autor.partido ? ` - ${autor.partido}` : ''}
                    {autor.uf ? `/${autor.uf}` : ''}
                  </option>
                ))}

                {/* Se houver autor preexistente que não está na lista, mantém selecionável */}
                {formData.autor && !autores.some(a => a.nome.toLowerCase() === formData.autor.toLowerCase() || a.id === formData.id_autor) && (
                  <option value={formData.autor}>
                    {formData.autor} (Atual)
                  </option>
                )}

                <option value="__CADASTRAR_NOVO__" className="text-primary font-bold bg-primary/5">
                  ➕ + Cadastrar Novo Autor no Supabase...
                </option>
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <ChevronDown size={16} />
              </div>
            </div>

            {/* Informações complementares do autor selecionado */}
            {selectedAutorInfo && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-500">Selecionado:</span>
                <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                  {selectedAutorInfo.nome}
                </span>
                {selectedAutorInfo.cargo && (
                  <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                    {selectedAutorInfo.cargo}
                  </span>
                )}
                {selectedAutorInfo.partido && (
                  <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                    {selectedAutorInfo.partido}
                  </span>
                )}
                {selectedAutorInfo.uf && (
                  <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                    {selectedAutorInfo.uf}
                  </span>
                )}
              </div>
            )}

            {autorNotice && (
              <div className="flex items-start gap-2 p-2.5 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-800">
                <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="flex-1">{autorNotice}</p>
                <button 
                  type="button" 
                  onClick={() => setAutorNotice(null)} 
                  className="text-amber-600 hover:text-amber-800 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}
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

      {/* Modal para Cadastro de Autores no Supabase */}
      {isNovoAutorModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-6 space-y-5 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cadastrar Autor do Projeto</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Salvar no banco de dados Supabase</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNovoAutorModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoAutor} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nome do Autor / Parlamentar *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Dep. Carlos Silva, Bancada do Paraná..."
                  value={novoAutorForm.nome}
                  onChange={e => setNovoAutorForm({ ...novoAutorForm, nome: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary/60 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Cargo / Função</label>
                  <select
                    value={novoAutorForm.cargo}
                    onChange={e => setNovoAutorForm({ ...novoAutorForm, cargo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary/60 focus:bg-white rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 outline-none transition-all"
                  >
                    <option value="Deputado(a) Federal">Deputado(a) Federal</option>
                    <option value="Deputado(a) Estadual">Deputado(a) Estadual</option>
                    <option value="Senador(a)">Senador(a)</option>
                    <option value="Vereador(a)">Vereador(a)</option>
                    <option value="Bancada Parlamentar">Bancada Parlamentar</option>
                    <option value="Comissão Temática">Comissão Temática</option>
                    <option value="Poder Executivo">Poder Executivo</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Partido / Sigla</label>
                  <input
                    type="text"
                    placeholder="Ex: PT, PL, MDB..."
                    maxLength={15}
                    value={novoAutorForm.partido}
                    onChange={e => setNovoAutorForm({ ...novoAutorForm, partido: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary/60 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">UF / Estado</label>
                <input
                  type="text"
                  placeholder="Ex: PR, SP, RS, DF..."
                  maxLength={2}
                  value={novoAutorForm.uf}
                  onChange={e => setNovoAutorForm({ ...novoAutorForm, uf: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary/60 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
                <span className="text-primary font-bold">Supabase:</span>
                <span>O autor cadastrado será persistido na tabela <code className="font-mono text-slate-800 font-bold bg-white px-1 py-0.5 rounded border border-slate-200">autores</code> do banco.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNovoAutorModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoAutor || !novoAutorForm.nome.trim()}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save size={14} />
                  {salvandoAutor ? 'Salvando no Supabase...' : 'Salvar Autor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

