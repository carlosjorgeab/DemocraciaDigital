'use client';
import { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Map as MapIcon, Loader2, DollarSign, Users, Target, X, Search, FileText, Calendar, Receipt, Filter } from 'lucide-react';
import { PRPath, prPaths } from './pr-data';
import { useDeputado } from '@/context/DeputadoContext';
import { supabase } from '@/lib/supabase';

// Helper formats
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

const formatCompact = (val: number) => {
  if (val === 0) return 'R$ 0';
  if (val >= 1000000) return `R$ ${(val / 1000000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} Mi`;
  if (val >= 1000) return `R$ ${(val / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Mil`;
  return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

interface CityStats {
  populacao: number;
  emendas: number;
  projetos: number;
  emendasList: any[];
}

export default function PRMapDivisions({ onHover, onBack, selectedYears = [] }: { onHover?: (name: string | null) => void; onBack: () => void; selectedYears?: number[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedDeputado } = useDeputado();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  
  const [mapStats, setMapStats] = useState<Record<string, CityStats>>({});
  const [loadingStats, setLoadingStats] = useState(true);

  // Modal State
  const [selectedCityModal, setSelectedCityModal] = useState<string | null>(null);
  const [modalSearch, setModalSearch] = useState('');
  const [activeLegendRange, setActiveLegendRange] = useState<number | 'all'>('all');

  useEffect(() => {
    async function loadStats() {
      setLoadingStats(true);
      try {
        const stats: Record<string, CityStats> = {};
        
        // 1. Fetch populations for PR
        const { data: popData } = await supabase
          .from('municipio')
          .select('nome, populacao, unidade_federacao!inner(sigla)')
          .eq('unidade_federacao.sigla', 'PR');
          
        if (popData) {
          popData.forEach(item => {
            const cityName = item.nome;
            if (!stats[cityName]) stats[cityName] = { populacao: 0, emendas: 0, projetos: 0, emendasList: [] };
            stats[cityName].populacao = item.populacao || 0;
          });
        }

        // 2. Fetch Orcamentos (Emendas)
        let orcQuery = supabase
          .from('orcamentos')
          .select('id, numero_emenda, objeto, valor, data, etapa, beneficiario, municipio(nome, unidade_federacao(sigla))')
          .eq('etapa', 'Liberado');

        if (selectedDeputado?.id) {
          orcQuery = orcQuery.eq('id_deputado', selectedDeputado.id);
        }
        
        const { data: emendasData } = await orcQuery;
        
        if (emendasData) {
          emendasData.forEach((item: any) => {
            const munObj = Array.isArray(item.municipio) ? item.municipio[0] : item.municipio;
            const cityName = munObj?.nome;
            if (!cityName) return;

            const y = item.data ? new Date(item.data).getFullYear() : new Date().getFullYear();
            if (selectedYears.length > 0 && !selectedYears.includes(y)) return;

            const val = Number(item.valor || 0);

            if (stats[cityName]) {
              stats[cityName].emendas += val;
              stats[cityName].emendasList.push(item);
            } else {
              const cityKey = Object.keys(stats).find(k => k.toLowerCase() === cityName.toLowerCase());
              if (cityKey) {
                stats[cityKey].emendas += val;
                stats[cityKey].emendasList.push(item);
              } else {
                stats[cityName] = { populacao: 0, emendas: val, projetos: 0, emendasList: [item] };
              }
            }
          });
        }
        
        setMapStats(stats);
      } catch (err) {
        console.error("Error loading map stats:", err);
      } finally {
        setLoadingStats(false);
      }
    }
    
    loadStats();
  }, [selectedDeputado?.id, selectedYears]);

  const nonZeroTotals = Object.values(mapStats)
    .map(stat => stat.emendas || 0)
    .filter(val => val > 0);
    
  let thresholds: number[] = [];
  if (nonZeroTotals.length > 0) {
    const minVal = Math.min(...nonZeroTotals);
    const maxVal = Math.max(...nonZeroTotals);
    if (minVal === maxVal) {
      thresholds = [maxVal];
    } else {
      const step = (maxVal - minVal) / 4;
      thresholds = [
        minVal + step,
        minVal + step * 2,
        minVal + step * 3,
        maxVal
      ];
    }
  }

  const getRangeIndex = (total: number): number => {
    if (total <= 0) return 0;
    if (thresholds.length <= 1) return 4;
    if (total <= thresholds[0]) return 1;
    if (total <= thresholds[1]) return 2;
    if (total <= thresholds[2]) return 3;
    return 4;
  };

  const getDynamicOpacity = (cityName: string): number | null => {
    if (!mapStats[cityName]) return null;
    const total = mapStats[cityName].emendas || 0;
    if (total <= 0) return null;
    if (thresholds.length === 0) return null;
    
    if (thresholds.length === 1) return 1.0;
    
    if (total <= thresholds[0]) return 0.35;
    if (total <= thresholds[1]) return 0.6;
    if (total <= thresholds[2]) return 0.85;
    return 1.0;
  };

  const currentCityStats = selectedCityModal ? mapStats[selectedCityModal] : null;
  const filteredCityEmendas = (currentCityStats?.emendasList || []).filter((e: any) => {
    if (!modalSearch.trim()) return true;
    const t = modalSearch.toLowerCase();
    return (
      (e.objeto || '').toLowerCase().includes(t) ||
      (e.numero_emenda || '').toLowerCase().includes(t) ||
      (e.etapa || '').toLowerCase().includes(t) ||
      String(e.valor || '').includes(t)
    );
  });

  return (
    <div className="w-full flex md:p-6 flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-500 relative">
      <div className="w-full flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6 px-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Mapa do Brasil
        </button>
        <div className="flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 uppercase tracking-widest">
          <MapIcon className="w-4 h-4" />
          Paraná: Divisões Municipais
        </div>
      </div>
      
      <div className="relative w-full flex items-center justify-center min-h-[600px] bg-slate-50 rounded-2xl border border-slate-200 shadow-inner p-4 overflow-hidden">
        <div ref={containerRef} className="w-full h-full max-w-[800px] relative z-0 flex justify-center">
              <svg 
                id="pr-municipal-map"
                viewBox="0 0 800 600" 
                className="w-full h-full drop-shadow-2xl transition-all duration-500"
                strokeLinecap="round" 
                strokeLinejoin="round" 
              >
                  {prPaths.map((path) => {
                      const cityTotal = mapStats[path.name]?.emendas || 0;
                      const rangeIdx = getRangeIndex(cityTotal);

                      const opacidade = getDynamicOpacity(path.name);
                      const hasRecursos = opacidade !== null;

                      const isFilteredOut = activeLegendRange !== 'all' && rangeIdx !== activeLegendRange;
                      
                      return (
                      <path
                          key={path.id}
                          id={path.id}
                          d={path.d}
                          fill={
                            isFilteredOut
                              ? '#f1f5f9'
                              : hoveredId === path.id
                              ? 'var(--color-primary, #d80000)'
                              : hasRecursos
                              ? 'var(--color-primary, #d80000)'
                              : '#e2e8f0'
                          }
                          fillOpacity={
                            isFilteredOut
                              ? 0.2
                              : hoveredId === path.id
                              ? 1
                              : hasRecursos
                              ? opacidade
                              : 1
                          }
                          stroke="#1e293b" 
                          strokeWidth={hoveredId === path.id ? "1.8" : (hasRecursos ? "0.8" : "0.5")}
                          className="transition-all duration-200 cursor-pointer hover:scale-[1.002]"
                          onClick={() => {
                            setSelectedCityModal(path.name);
                            setModalSearch('');
                          }}
                          onMouseEnter={() => {
                              setHoveredId(path.id);
                              setHoveredName(path.name);
                              onHover?.(path.name);
                          }}
                          onMouseLeave={() => {
                              setHoveredId(null);
                              setHoveredName(null);
                              onHover?.(null);
                          }}
                      >
                          <title>{path.name} (Clique para ver as emendas)</title>
                      </path>
                  )})}
            </svg>

            {hoveredName && (
                <div className="absolute pointer-events-none bg-slate-900/95 backdrop-blur-sm text-white px-3.5 py-2.5 rounded-2xl shadow-xl z-50 transition-all border border-slate-700 whitespace-nowrap flex flex-col gap-1.5"
                     style={{ 
                         left: '50%',
                         top: '10px',
                         transform: 'translateX(-50%)'
                     }}
                >
                    <div className="font-black text-sm border-b border-white/10 pb-1 uppercase tracking-wide flex justify-between gap-4">
                        <span>{hoveredName}</span>
                        <span className="text-[10px] text-emerald-400 font-bold">Clique para abrir</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        <span>População:</span>
                        <span className="font-bold text-white ml-auto">
                            {mapStats[hoveredName]?.populacao ? formatNumber(mapStats[hoveredName].populacao) : 'N/A'}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Investimento:</span>
                        <span className="font-bold text-emerald-400 ml-auto">
                            {formatCurrency(mapStats[hoveredName]?.emendas || 0)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-300">
                        <Receipt className="w-3.5 h-3.5 text-amber-400" />
                        <span>Emendas:</span>
                        <span className="font-bold text-white ml-auto">
                            {mapStats[hoveredName]?.emendasList?.length || 0} emenda(s)
                        </span>
                    </div>
                </div>
            )}
        </div>
        
        {/* Interactive Gradient Legend */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md pl-4 pr-5 py-4 rounded-3xl shadow-2xl border border-slate-200 z-20 max-w-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-primary" />
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[10px]">Legenda de Investimento</h4>
              </div>
              {activeLegendRange !== 'all' && (
                <button 
                  onClick={() => setActiveLegendRange('all')}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Gradient Visual Bar */}
            <div className="space-y-1">
              <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-slate-200 via-primary/40 via-primary/70 to-primary shadow-inner" />
              <div className="flex justify-between text-[8px] font-black text-slate-600">
                <span>R$ 0</span>
                <span>{thresholds[0] ? formatCompact(thresholds[0]) : 'Min'}</span>
                <span>{thresholds[2] ? formatCompact(thresholds[2]) : 'Max'}</span>
              </div>
            </div>
            
            {loadingStats ? (
                <div className="flex items-center gap-2 text-[10px] text-slate-600 my-2 font-bold italic">
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    Sincronizando...
                </div>
            ) : (
                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={() => setActiveLegendRange(activeLegendRange === 0 ? 'all' : 0)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                      activeLegendRange === 0
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-md bg-slate-200 border border-slate-400"></div>
                      <span>Sem Destinação</span>
                    </div>
                  </button>
                  
                  {thresholds.length === 4 && (
                    <>
                      <button
                        onClick={() => setActiveLegendRange(activeLegendRange === 1 ? 'all' : 1)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                          activeLegendRange === 1
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-md bg-primary opacity-35 border border-slate-700"></div>
                          <span>Até {formatCompact(thresholds[0])}</span>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveLegendRange(activeLegendRange === 2 ? 'all' : 2)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                          activeLegendRange === 2
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-md bg-primary opacity-60 border border-slate-700"></div>
                          <span>Até {formatCompact(thresholds[1])}</span>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveLegendRange(activeLegendRange === 3 ? 'all' : 3)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                          activeLegendRange === 3
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-md bg-primary opacity-85 border border-slate-700"></div>
                          <span>Até {formatCompact(thresholds[2])}</span>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveLegendRange(activeLegendRange === 4 ? 'all' : 4)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                          activeLegendRange === 4
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-md bg-primary border border-slate-700"></div>
                          <span>Acima de {formatCompact(thresholds[2])}</span>
                        </div>
                      </button>
                    </>
                  )}
                </div>
            )}
        </div>
      </div>

      {/* POP-UP / MODAL COM A LISTA DE EMENDAS DO MUNICÍPIO */}
      {selectedCityModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary font-black text-[10px] uppercase rounded-full">
                    PR
                  </span>
                  <span className="text-xs text-slate-600 font-bold uppercase">Município do Paraná</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">{selectedCityModal}</h3>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  População: {currentCityStats?.populacao ? formatNumber(currentCityStats.populacao) : 'N/A'}
                </p>
              </div>

              <button
                onClick={() => setSelectedCityModal(null)}
                className="p-2 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-100/60 border-b border-slate-100">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-600">Total Investido</p>
                  <p className="text-lg font-black text-emerald-600">{formatCurrency(currentCityStats?.emendas || 0)}</p>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Receipt size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-600">Total de Emendas</p>
                  <p className="text-lg font-black text-slate-900">{currentCityStats?.emendasList?.length || 0} emendas</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por objeto, número ou valor..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-slate-50/50">
              {filteredCityEmendas.length === 0 ? (
                <div className="text-center py-12 text-slate-600 text-xs font-semibold">
                  Nenhuma emenda cadastrada para este município com os filtros atuais.
                </div>
              ) : (
                filteredCityEmendas.map((emenda: any, idx: number) => {
                  const valorNum = Number(emenda.valor) || 0;
                  const dataAno = emenda.data ? new Date(emenda.data).getFullYear() : '';

                  return (
                    <div
                      key={emenda.id || idx}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-primary transition-all space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-900 text-[11px] font-black rounded-lg uppercase">
                            Nº {emenda.numero_emenda || 'Sem Nº'}
                          </span>
                          {emenda.etapa && (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg uppercase">
                              {emenda.etapa}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {dataAno && (
                            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                              <Calendar size={13} className="text-slate-500" /> {dataAno}
                            </span>
                          )}
                          <span className="text-sm font-black text-emerald-600">
                            {formatCurrency(valorNum)}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs font-bold text-slate-900 leading-relaxed">
                        {emenda.objeto || 'Emenda Parlamentar'}
                      </p>

                      {emenda.beneficiario && (
                        <p className="text-[10px] font-semibold text-slate-600">
                          Beneficiário: <strong className="text-slate-800">{emenda.beneficiario}</strong>
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedCityModal(null)}
                className="px-5 py-2.5 bg-slate-200 text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-slate-300 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

