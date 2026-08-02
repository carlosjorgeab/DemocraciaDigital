'use client';
import { useState, useEffect } from 'react';
import { useDeputado } from '@/context/DeputadoContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Folder, LayoutGrid, Tags, FileText, ExternalLink, Calendar, Search, BookOpen } from 'lucide-react';

export default function ProjetosPublicPage() {
  const { selectedDeputado } = useDeputado();
  const router = useRouter();
  const [areas, setAreas] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!selectedDeputado) return;
      
      setLoading(true);
      
      const uniqueAreasMap = new Map();

      // 1. Fetch areas
      try {
        const { data: rels, error: relError } = await supabase
          .from('projeto_areas')
          .select('id_area_tematica, areas_tematicas(id, nome, cor, icone_url), projetos!inner(id_deputado, etapa)')
          .eq('projetos.id_deputado', selectedDeputado.id)
          .eq('projetos.etapa', 'Liberado');

        if (rels && !relError) {
          rels.forEach((r: any) => {
            const area = Array.isArray(r.areas_tematicas) ? r.areas_tematicas[0] : r.areas_tematicas;
            if (area && area.id) {
              uniqueAreasMap.set(area.id, area);
            }
          });
        }
      } catch (err) {
        console.error('Error loading areas from mapping table:', err);
      }
      
      const areasArray = Array.from(uniqueAreasMap.values()).sort((a, b) => a.nome.localeCompare(b.nome));
      setAreas(areasArray);

      // 2. Fetch all public/released projects
      try {
        const { data: projsData } = await supabase
          .from('projetos')
          .select('*')
          .eq('id_deputado', selectedDeputado.id)
          .eq('etapa', 'Liberado');

        if (projsData && projsData.length > 0) {
          const enrichedProjetos = await Promise.all(projsData.map(async (p: any) => {
            const pAreasMap = new Map();
            try {
              const { data: assoc } = await supabase
                .from('projeto_areas')
                .select('areas_tematicas(id, nome, cor, icone_url)')
                .eq('id_projeto', p.id);

              if (assoc) {
                assoc.forEach((a: any) => {
                  const areaObj = Array.isArray(a.areas_tematicas) ? a.areas_tematicas[0] : a.areas_tematicas;
                  if (areaObj && areaObj.id) {
                    pAreasMap.set(areaObj.id, areaObj);
                  }
                });
              }
            } catch (e) {
              // safe fail
            }

            return {
              ...p,
              all_areas: Array.from(pAreasMap.values())
            };
          }));

          // Sort by numero_proposicao desc
          enrichedProjetos.sort((a, b) => {
            const numA = a.numero_proposicao || '';
            const numB = b.numero_proposicao || '';
            return numB.localeCompare(numA);
          });

          setProjetos(enrichedProjetos);
        } else {
          setProjetos([]);
        }
      } catch (err) {
        console.error('Error loading projects:', err);
        setProjetos([]);
      }

      setLoading(false);
    }
    
    fetchData();
  }, [selectedDeputado]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary, #005baa)' }}></div>
      </div>
    );
  }

  const filteredProjetos = projetos.filter(p => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const desc = (p.descricao || '').toLowerCase();
    const ementa = (p.ementa || '').toLowerCase();
    const num = (p.numero_proposicao || '').toLowerCase();
    const tipo = (p.tipo || '').toLowerCase();
    const autor = (p.autor || '').toLowerCase();
    return desc.includes(term) || ementa.includes(term) || num.includes(term) || tipo.includes(term) || autor.includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* 1. Categorias por Áreas Temáticas */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm" style={{ color: 'var(--color-primary)' }}>
            <LayoutGrid size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight">Projetos por Áreas Temáticas</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Selecione uma área temática para visualizar os projetos relacionados do Deputado {selectedDeputado?.nome}.</p>
          </div>
        </div>

        {areas.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
              <Folder size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Nenhuma área temática encontrada</h3>
            <p className="text-slate-500 max-w-md mx-auto">Este deputado ainda não possui áreas temáticas com projetos liberados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {areas.map(area => (
              <button
                key={area.id}
                onClick={() => router.push(`/p/${selectedDeputado?.slug || selectedDeputado?.id}/projetos/${area.id}`)}
                className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-3xl transition-all duration-300 hover:shadow-xl hover:scale-105 group relative overflow-hidden"
                title={area.nome}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300" 
                  style={{ backgroundColor: area.cor || 'var(--color-primary)' }} 
                />
                
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center p-3 transition-transform duration-300 group-hover:scale-110 mb-4 bg-slate-50 shadow-sm"
                  style={{ 
                    borderColor: (area.cor || 'var(--color-primary)') + '33', 
                    borderWidth: '2px', 
                    borderStyle: 'solid'
                  }}
                >
                  {area.icone_url ? (
                    area.icone_url.startsWith('<svg') ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: area.icone_url }} 
                        className="w-8 h-8 flex items-center justify-center" 
                        style={{ color: area.cor || 'var(--color-primary)' }} 
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={area.icone_url} alt={area.nome} className="w-8 h-8 object-contain" />
                    )
                  ) : (
                    <Tags size={28} style={{ color: area.cor || 'var(--color-primary)' }} />
                  )}
                </div>
                
                <h3 className="text-sm font-bold text-center text-slate-800 group-hover:text-primary transition-colors line-clamp-2">
                  {area.nome}
                </h3>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 2. Listagem Geral de Projetos */}
      <section className="pt-8 border-t border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm" style={{ color: 'var(--color-primary)' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase text-slate-900 tracking-tight">Todos os Projetos ({projetos.length})</h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5">Lista completa de proposições legislativas do Deputado {selectedDeputado?.nome}</p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por título, número, ementa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-primary shadow-xs transition-colors"
            />
          </div>
        </div>

        {filteredProjetos.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <FileText size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {searchTerm ? 'Nenhum projeto encontrado para a busca' : 'Nenhum projeto cadastrado'}
            </h3>
            <p className="text-xs text-slate-500">
              {searchTerm ? 'Tente pesquisar com outros termos.' : 'Não há projetos liberados para visualização pública neste momento.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjetos.map((projeto) => {
              const primaryArea = projeto.all_areas?.[0];
              const accentColor = primaryArea?.cor || 'var(--color-primary, #005baa)';

              return (
                <div 
                  key={projeto.id} 
                  className="bg-white rounded-3xl p-6 border-l-4 shadow-sm hover:shadow-md transition-all border-y border-r border-y-slate-200 border-r-slate-200 relative overflow-hidden flex flex-col justify-between" 
                  style={{ borderLeftColor: accentColor }}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      {projeto.numero_proposicao ? (
                        projeto.url_legislativo ? (
                          <a 
                            href={projeto.url_legislativo} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-200 transition-colors shadow-xs"
                            style={{ color: accentColor }}
                          >
                            Nº {projeto.numero_proposicao}
                            <ExternalLink size={13} className="opacity-70" />
                          </a>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-200">
                            Nº {projeto.numero_proposicao}
                          </div>
                        )
                      ) : (
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-400 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-100">
                          Sem Proposição
                        </div>
                      )}

                      {projeto.tipo && (
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg tracking-wider">
                          {projeto.tipo}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-snug mb-3">
                      {projeto.descricao}
                    </h3>

                    {/* Area tags */}
                    {projeto.all_areas && projeto.all_areas.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {projeto.all_areas.map((a: any) => (
                          <div 
                            key={a.id}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-50 border rounded-full text-[11px] font-bold"
                            style={{ borderColor: (a.cor || accentColor) + '44', color: a.cor || accentColor }}
                          >
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: a.cor || accentColor }} />
                            {a.nome}
                          </div>
                        ))}
                      </div>
                    )}

                    {projeto.ementa && (
                      <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100 relative">
                        <FileText size={14} className="absolute top-4 left-4 text-slate-400" />
                        <p className="text-xs text-slate-600 leading-relaxed pl-6 line-clamp-4">
                          {projeto.ementa}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider pt-3 border-t border-slate-100 mt-2">
                    {projeto.autor ? (
                      <span className="truncate max-w-[200px]" title={projeto.autor}>
                        Autor: <strong className="text-slate-700">{projeto.autor}</strong>
                      </span>
                    ) : <span />}

                    {projeto.data && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{new Date(projeto.data).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

