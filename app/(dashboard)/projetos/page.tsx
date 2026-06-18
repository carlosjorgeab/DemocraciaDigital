'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import Link from 'next/link';
import { useDeputado } from '@/context/DeputadoContext';

export default function ProjetosPage() {
  const { selectedDeputado } = useDeputado();
  const [projetos, setProjetos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjetos() {
      if (!selectedDeputado) {
        setProjetos([]);
        setLoading(false);
        return;
      }

      const { data: projectsData, error } = await supabase
        .from('projetos')
        .select(`
          *,
          projeto_areas(
            areas_tematicas(id, nome, cor, icone_url)
          )
        `)
        .eq('id_deputado', selectedDeputado.id);
      
      if (projectsData) {
        const enriched = projectsData.map((p: any) => {
          const areaMap = new Map();
          if (p.projeto_areas) {
            p.projeto_areas.forEach((pa: any) => {
              const area = Array.isArray(pa.areas_tematicas) ? pa.areas_tematicas[0] : pa.areas_tematicas;
              if (area && area.id) {
                areaMap.set(area.id, area);
              }
            });
          }
          return {
            ...p,
            all_areas: Array.from(areaMap.values())
          };
        });
        setProjetos(enriched);
      } else {
        setProjetos([]);
      }
      setLoading(false);
    }
    fetchProjetos();
  }, [selectedDeputado]);

  async function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      await supabase.from('projetos').delete().eq('id', id);
      if (selectedDeputado) {
        const { data: projectsData } = await supabase
          .from('projetos')
          .select(`
            *,
            projeto_areas(
              areas_tematicas(id, nome, cor, icone_url)
            )
          `)
          .eq('id_deputado', selectedDeputado.id);
        
        if (projectsData) {
          const enriched = projectsData.map((p: any) => {
            const areaMap = new Map();
            if (p.projeto_areas) {
              p.projeto_areas.forEach((pa: any) => {
                const area = Array.isArray(pa.areas_tematicas) ? pa.areas_tematicas[0] : pa.areas_tematicas;
                if (area && area.id) {
                  areaMap.set(area.id, area);
                }
              });
            }
            return {
              ...p,
              all_areas: Array.from(areaMap.values())
            };
          });
          setProjetos(enriched);
        }
      }
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Gestão</p>
          <h2 className="text-2xl md:text-3xl font-black font-headline text-on-surface">Projetos</h2>
          <p className="text-on-surface-variant text-sm">Gerencie os projetos e iniciativas do mandato</p>
        </div>
        <Link href="/projetos/novo" className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-md w-full md:w-auto">
          <Plus size={18} />
          Novo Projeto
        </Link>
      </div>

      <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-surface-container-low flex justify-between items-center">
          <div className="relative flex items-center bg-slate-50 rounded-lg px-4 py-2 w-80 border border-slate-200">
            <Search className="text-slate-400" size={16} />
            <input 
              className="bg-transparent border-none focus:ring-0 text-sm w-full font-body placeholder:text-slate-400 ml-2 outline-none" 
              placeholder="Buscar projetos..." 
              type="text" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Projeto / Iniciativa</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Ementa</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Autor</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Tramitação</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">URL</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Etapa</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-500">Carregando...</td></tr>
              ) : projetos.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-500">Nenhum projeto encontrado.</td></tr>
              ) : (
                projetos.map(projeto => (
                  <tr key={projeto.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-sm text-on-surface">{projeto.descricao}</p>
                         <div className="flex flex-wrap gap-1 mt-1 max-w-xs">
                          {projeto.all_areas && projeto.all_areas.length > 0 ? (
                            projeto.all_areas.map((area: any) => (
                              <div 
                                key={area.id} 
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border rounded-md"
                                style={{ borderColor: (area.cor || 'var(--color-primary)') + '22' }}
                              >
                                {area.icone_url && (
                                  area.icone_url.startsWith('<svg') ? (
                                    <div 
                                      dangerouslySetInnerHTML={{ __html: area.icone_url }} 
                                      className="un-svg w-3 h-3 flex items-center justify-center" 
                                      style={{ color: area.cor }} 
                                    />
                                  ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={area.icone_url} alt="" className="w-3 h-3 object-contain" />
                                  )
                                )}
                                <span className="text-[10px] font-black" style={{ color: area.cor }}>
                                  {area.nome}
                                </span>
                              </div>
                            ))
                          ) : projeto.areas_tematicas ? (
                            <div 
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border rounded-md"
                              style={{ borderColor: (projeto.areas_tematicas.cor || 'var(--color-primary)') + '22' }}
                            >
                              {projeto.areas_tematicas.icone_url && (
                                projeto.areas_tematicas.icone_url.startsWith('<svg') ? (
                                  <div 
                                    dangerouslySetInnerHTML={{ __html: projeto.areas_tematicas.icone_url }} 
                                    className="un-svg w-3 h-3 flex items-center justify-center" 
                                    style={{ color: projeto.areas_tematicas.cor }} 
                                  />
                                ) : (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={projeto.areas_tematicas.icone_url} alt="" className="w-3 h-3 object-contain" />
                                )
                              )}
                              <span className="text-[10px] font-black" style={{ color: projeto.areas_tematicas.cor }}>
                                {projeto.areas_tematicas.nome}
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 font-medium">Nenhuma área</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-on-surface line-clamp-2" title={projeto.ementa}>{projeto.ementa || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-on-surface">{projeto.tipo || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-on-surface">{projeto.autor || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded">
                        {projeto.tramitacao || 'Em elaboração'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {projeto.url_legislativo ? (
                        <a href={projeto.url_legislativo} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-bold">
                          Ver Link
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold text-[10px] rounded-full uppercase">
                        {projeto.etapa || 'Liberado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/projetos/${projeto.id}/editar`} className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-red-50" title="Editar">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(projeto.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50" title="Excluir">
                          <Trash2 size={16} />
                        </button>
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
