'use client';
import { useState, useEffect } from 'react';
import { RefreshCw, Calendar, MapPin, Tag, Filter } from 'lucide-react';
import { useFilters } from '@/context/FilterContext';
import { useDeputado } from '@/context/DeputadoContext';
import { supabase } from '@/lib/supabase';

export function Filters() {
  const { filters, setFilters, resetFilters } = useFilters();
  const { selectedDeputado } = useDeputado();
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [municipios, setMunicipios] = useState<any[]>([]);

  useEffect(() => {
    async function fetchOptions() {
      if (!selectedDeputado?.id) return;
      
      // Fetch Years
      try {
        const years = new Set<number>();
        const { data: eData } = await supabase.from('orcamentos').select('data').eq('id_deputado', selectedDeputado.id);
        eData?.forEach(e => { if (e.data) years.add(new Date(e.data).getFullYear()); });
        const { data: pData } = await supabase.from('projetos').select('data').eq('id_deputado', selectedDeputado.id);
        pData?.forEach(p => { if (p.data) years.add(new Date(p.data).getFullYear()); });
        if (years.size === 0) years.add(new Date().getFullYear());
        setAvailableYears(Array.from(years).sort((a, b) => b - a));
      } catch (err) { console.error("Error years:", err); }

      // Fetch Municipios
      try {
        const { data: mData } = await supabase
          .from('municipio')
          .select('nome, unidade_federacao!inner(sigla)')
          .eq('unidade_federacao.sigla', selectedDeputado.estado)
          .order('nome');
        if (mData) setMunicipios(mData);
      } catch (err) { console.error("Error municipios:", err); }
    }
    fetchOptions();
  }, [selectedDeputado?.id, selectedDeputado?.estado]);

  const toggleYear = (year: number) => {
    const newAnos = filters.anosFiscais.includes(year)
      ? filters.anosFiscais.filter(y => y !== year)
      : [...filters.anosFiscais, year];
    setFilters({ ...filters, anosFiscais: newAnos });
  };

  const toggleAllYears = () => {
    if (filters.anosFiscais.length === availableYears.length) {
      setFilters({ ...filters, anosFiscais: [] });
    } else {
      setFilters({ ...filters, anosFiscais: [...availableYears] });
    }
  };

  return (
    <section className="glass-panel p-6 rounded-xl space-y-6 shadow-sm border border-white/50">
      <div className="flex items-center gap-2 mb-2">
        <Filter size={18} className="text-primary" />
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Filtros Inteligentes</h3>
      </div>

      <div className="flex flex-wrap items-end gap-6 md:gap-10">
        {/* Dynamic Year Multi-select */}
        <div className="flex flex-col gap-3 min-w-[200px]">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold flex items-center gap-2">
              <Calendar size={12} className="text-primary" />
              Ano Fiscal
            </label>
            <button 
              onClick={toggleAllYears}
              className="text-[10px] font-black uppercase text-primary hover:underline"
            >
              {filters.anosFiscais.length === availableYears.length ? 'Limpar' : 'Todos'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => toggleYear(year)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                  filters.anosFiscais.includes(year)
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className="h-12 w-[1px] bg-slate-200 hidden md:block self-center"></div>

        {/* Municipality Filter */}
        <div className="flex flex-col gap-2 min-w-[180px] flex-1">
          <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold flex items-center gap-2">
            <MapPin size={12} className="text-primary" />
            Município
          </label>
          <select 
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none shadow-sm"
            value={filters.municipio}
            onChange={(e) => setFilters({ ...filters, municipio: e.target.value })}
          >
            <option value="Todos">Todos os Municípios</option>
            {municipios.map((mun, idx) => (
              <option key={idx} value={`${mun.nome} - ${mun.unidade_federacao.sigla}`}>
                {mun.nome} - {mun.unidade_federacao.sigla}
              </option>
            ))}
          </select>
        </div>

        {/* Other Filters Row */}
        <div className="flex flex-wrap gap-6 flex-1">
          <div className="flex flex-col gap-2 min-w-[140px]">
            <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Tipo de Verba</label>
            <select 
              className="bg-transparent border-b border-slate-200 font-headline font-bold text-on-surface p-0 pb-1 focus:border-primary cursor-pointer outline-none transition-colors"
              value={filters.tipoVerba}
              onChange={(e) => setFilters({ ...filters, tipoVerba: e.target.value })}
            >
              <option value="Todas">Todas</option>
              <option value="Emendas">Emendas</option>
              <option value="Projetos">Projetos</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-2 min-w-[160px]">
            <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold flex items-center gap-2">
              <Tag size={12} className="text-primary" />
              Categoria
            </label>
            <select 
              className="bg-transparent border-b border-slate-200 font-headline font-bold text-on-surface p-0 pb-1 focus:border-primary cursor-pointer outline-none transition-colors"
              value={filters.categoria}
              onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
            >
              <option value="Todas">Todas</option>
              <option value="Saúde & Bem-estar">Saúde & Bem-estar</option>
              <option value="Educação">Educação</option>
              <option value="Infraestrutura">Infraestrutura</option>
            </select>
          </div>
        </div>
        
        <button 
          onClick={resetFilters}
          className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all shadow-md ml-auto"
        >
          <RefreshCw size={16} />
          <span>Resetar</span>
        </button>
      </div>
    </section>
  );
}
