'use client';

import { useState, useEffect } from 'react';
import { useDeputado } from '@/context/DeputadoContext';
import { useFilters } from '@/context/FilterContext';
import { supabase } from '@/lib/supabase';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  Tags, 
  TrendingUp, 
  Award, 
  Layers, 
  PieChart as PieChartIcon, 
  BarChart2, 
  DollarSign
} from 'lucide-react';

interface AreaSummary {
  name: string;
  value: number;
  count: number;
  color: string;
  percentage: number;
}

const PALETTE = [
  '#005baa', '#009b3a', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#10b981', '#f97316', 
  '#6366f1', '#14b8a6', '#84cc16', '#a855f7'
];

export function ThematicAreasDashboard() {
  const { selectedDeputado } = useDeputado();
  const { filters } = useFilters();
  const [areasData, setAreasData] = useState<AreaSummary[]>([]);
  const [totalInvestido, setTotalInvestido] = useState(0);
  const [totalItens, setTotalItens] = useState(0);
  const [chartView, setChartView] = useState<'donut' | 'bars'>('donut');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchThematicData() {
      if (!selectedDeputado) {
        setAreasData([]);
        setTotalInvestido(0);
        setTotalItens(0);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Fetch all registered thematic areas for default colors
        const { data: areasList } = await supabase.from('areas_tematicas').select('nome, cor');
        const colorMap: Record<string, string> = {};
        if (areasList) {
          areasList.forEach((a, idx) => {
            colorMap[a.nome] = a.cor || PALETTE[idx % PALETTE.length];
          });
        }

        // Fetch emendas/orçamentos
        const { data: emendas } = await supabase
          .from('orcamentos')
          .select('*, areas_tematicas(nome), municipio(nome)')
          .eq('id_deputado', selectedDeputado.id);

        const areaTotals: Record<string, { value: number; count: number }> = {};
        let runningTotal = 0;
        let runningCount = 0;

        if (emendas) {
          emendas.forEach((e: any) => {
            const munObj = Array.isArray(e.municipio) ? e.municipio[0] : e.municipio;
            const munName = munObj?.nome || '';
            const cat = e.areas_tematicas?.nome || 'Geral / Não Especificado';
            const dateObj = e.data ? new Date(e.data) : new Date();
            const y = dateObj.getFullYear();

            const matchYear = filters.anosFiscais.length === 0 || filters.anosFiscais.includes(y);
            const matchMun = filters.municipio === 'Todos' || munName === filters.municipio;
            const matchCat = filters.categoria === 'Todas' || filters.categoria === cat;
            const matchTipo = filters.tipoVerba === 'Todas' || filters.tipoVerba === 'Emendas';

            if (matchYear && matchMun && matchCat && matchTipo) {
              const val = Number(e.valor) || 0;
              if (!areaTotals[cat]) {
                areaTotals[cat] = { value: 0, count: 0 };
              }
              areaTotals[cat].value += val;
              areaTotals[cat].count += 1;
              runningTotal += val;
              runningCount += 1;
            }
          });
        }

        // Format data for Recharts
        const formatted: AreaSummary[] = Object.entries(areaTotals)
          .map(([name, stat], index) => ({
            name,
            value: stat.value,
            count: stat.count,
            color: colorMap[name] || PALETTE[index % PALETTE.length],
            percentage: runningTotal > 0 ? (stat.value / runningTotal) * 100 : 0
          }))
          .sort((a, b) => b.value - a.value);

        setAreasData(formatted);
        setTotalInvestido(runningTotal);
        setTotalItens(runningCount);
      } catch (err) {
        console.error('Error fetching thematic areas data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchThematicData();
  }, [selectedDeputado, filters]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const topArea = areasData.length > 0 ? areasData[0] : null;
  const averagePerArea = areasData.length > 0 ? totalInvestido / areasData.length : 0;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Tags size={24} />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black font-headline text-slate-900 tracking-tight">
              Investimentos por Área Temática
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Demonstrativo visual dos recursos alocados pelo parlamentar por segmento
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setChartView('donut')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              chartView === 'donut' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <PieChartIcon size={14} />
            Distribuição
          </button>
          <button
            onClick={() => setChartView('bars')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              chartView === 'bars' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart2 size={14} />
            Ranking
          </button>
        </div>
      </div>

      {/* Summary KPI Mini-Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-widest">Total Destinado</span>
            <DollarSign size={16} className="text-primary" />
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 font-headline">
            {formatCurrency(totalInvestido)}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">Recursos filtrados</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-widest">Principal Área</span>
            <Award size={16} className="text-amber-500" />
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 truncate font-headline" title={topArea?.name || 'N/A'}>
            {topArea ? topArea.name : 'Nenhuma'}
          </p>
          <p className="text-[10px] text-slate-500 font-bold">
            {topArea ? `${topArea.percentage.toFixed(1)}% do total (${formatCurrency(topArea.value)})` : 'Sem registros'}
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-widest">Áreas Atendidas</span>
            <Layers size={16} className="text-emerald-600" />
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 font-headline">
            {areasData.length} Áreas
          </p>
          <p className="text-[10px] text-slate-400 font-medium">Segmentos beneficiados</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-widest">Média por Área</span>
            <TrendingUp size={16} className="text-indigo-500" />
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 font-headline">
            {formatCurrency(averagePerArea)}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">Média ponderada</p>
        </div>
      </div>

      {/* Main Charts & Breakdown Section */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
          <span className="text-xs font-black uppercase tracking-widest">Carregando dados temáticos...</span>
        </div>
      ) : areasData.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8">
          <Tags size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-slate-600">Nenhum dado encontrado para o filtro selecionado</p>
          <p className="text-xs text-slate-400 mt-1">Ajuste os filtros de ano fiscal, município ou categoria acima.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          {/* Recharts Graphical Display */}
          <div className="lg:col-span-7 w-full h-[340px] min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'donut' ? (
                <PieChart>
                  <Pie
                    data={areasData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {areasData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [
                      formatCurrency(Number(value) || 0),
                      'Total Investido'
                    ]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      borderColor: '#e2e8f0',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      padding: '12px 16px',
                      fontWeight: 700
                    }}
                    labelStyle={{ color: '#0f172a', fontWeight: 900, marginBottom: '4px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '16px', fontSize: '11px', fontWeight: 700 }}
                  />
                </PieChart>
              ) : (
                <BarChart
                  layout="vertical"
                  data={areasData}
                  margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis 
                    type="number" 
                    tickFormatter={(v) => {
                      if (v >= 1000000) return `R$ ${(v / 1000000).toFixed(1)}M`;
                      if (v >= 1000) return `R$ ${(v / 1000).toFixed(0)}k`;
                      return `R$ ${v}`;
                    }}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#334155' }}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip
                    formatter={(value: any) => [
                      formatCurrency(Number(value) || 0),
                      'Valor Total'
                    ]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      borderColor: '#e2e8f0',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      padding: '12px 16px',
                      fontWeight: 700
                    }}
                  />
                  <Bar dataKey="value" name="Valor" radius={[0, 8, 8, 0]} barSize={16}>
                    {areasData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Area Breakdown List with Progress Bars */}
          <div className="lg:col-span-5 space-y-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                Detalhamento por Segmento
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {totalItens} registros
              </span>
            </div>

            <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
              {areasData.map((area) => (
                <div key={area.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div 
                        className="w-3 h-3 rounded-full shrink-0 shadow-xs" 
                        style={{ backgroundColor: area.color }}
                      />
                      <span className="font-bold text-slate-800 truncate" title={area.name}>
                        {area.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-black text-slate-900">
                        {formatCurrency(area.value)}
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-100">
                        {area.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${Math.max(area.percentage, 2)}%`, 
                        backgroundColor: area.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
