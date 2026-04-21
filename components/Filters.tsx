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
  const [areas, setAreas] = useState<any[]>([]);

  useEffect(() => {
    async function fetchOptions() {
      if (!selectedDeputado?.id) return;
      
      const { data: areasData } = await supabase.from('areas_tematicas').select('*').order('nome');
      if (areasData) setAreas(areasData);

      // Fetch Years based on primary tables only as per user request
      try {
        const years = new Set<number>();
        // Emendas
        const { data: eData } = await supabase.from('orcamentos').select('data').eq('id_deputado', selectedDeputado.id);
        eData?.forEach(e => { if (e.data) years.add(new Date(e.data).getFullYear()); });
        
        // Projetos
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
    <section className="glass-panel p-4 rounded-xl shadow-sm border border-white/50">
      <div className="flex flex-wrap items-center gap-4 lg:gap-6">
        {/* Dynamic Year Multi-select - Increased space */}
        <div className="flex items-center gap-2 flex-[2] min-w-[250px]">
          <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2 whitespace-nowrap shrink-0">
            <Calendar size={12} className="text-primary" />
            Ano
          </label>
          <div className="flex flex-wrap gap-1.5 flex-1 overflow-x-auto no-scrollbar py-1">
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => toggleYear(year)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all border whitespace-nowrap shrink-0 ${
                  filters.anosFiscais.includes(year)
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                {year}
              </button>
            ))}
            <button 
              onClick={toggleAllYears}
              className="text-[10px] font-black uppercase text-primary px-2 hover:bg-primary/5 rounded shrink-0"
            >
              {filters.anosFiscais.length === availableYears.length ? 'Nenhum' : 'Todos'}
            </button>
          </div>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 hidden lg:block"></div>

        {/* Municipality Filter - Reduced space */}
        <div className="flex items-center gap-2 flex-1 min-w-[120px] max-w-[180px]">
          <MapPin size={12} className="text-primary shrink-0" />
          <select 
            className="bg-transparent border-none font-bold text-slate-700 text-xs focus:ring-0 outline-none w-full cursor-pointer truncate"
            value={filters.municipio}
            onChange={(e) => setFilters({ ...filters, municipio: e.target.value })}
          >
            <option value="Todos">Município: Todos</option>
            {municipios.map((mun, idx) => (
              <option key={idx} value={`${mun.nome} - ${mun.unidade_federacao.sigla}`}>
                {mun.nome} - {mun.unidade_federacao.sigla}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo Verba */}
        <div className="flex items-center gap-2">
          <Tag size={12} className="text-primary shrink-0" />
          <select 
            className="bg-transparent border-none font-bold text-slate-700 text-xs focus:ring-0 outline-none cursor-pointer"
            value={filters.tipoVerba}
            onChange={(e) => setFilters({ ...filters, tipoVerba: e.target.value })}
          >
            <option value="Todas">Verba: Todas</option>
            <option value="Emendas">Emendas</option>
            <option value="Projetos">Projetos</option>
          </select>
        </div>

        {/* Dynamic Area Filter */}
        <div className="flex items-center gap-2 flex-1 min-w-[150px]">
          <Filter size={12} className="text-primary shrink-0" />
          <select 
            className="bg-transparent border-none font-bold text-slate-700 text-xs focus:ring-0 outline-none cursor-pointer w-full"
            value={filters.categoria}
            onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
          >
            <option value="Todas">Categoria: Todas</option>
            {areas.map(area => (
              <option key={area.id} value={area.nome}>{area.nome}</option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={resetFilters}
          className="p-2 text-slate-400 hover:text-primary transition-colors ml-auto shrink-0"
          title="Resetar Filtros"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </section>
  );
}
