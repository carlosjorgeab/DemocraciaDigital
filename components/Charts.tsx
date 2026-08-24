'use client';

import { useState, useEffect } from 'react';
import { useDeputado } from '@/context/DeputadoContext';
import { useFilters } from '@/context/FilterContext';
import { supabase } from '@/lib/supabase';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export function Charts() {
  const { selectedDeputado } = useDeputado();
  const { filters } = useFilters();
  const [categories, setCategories] = useState<{ name: string; value: number; color: string }[]>([]);
  const [total, setTotal] = useState(0);
  
  const [monthlyData, setMonthlyData] = useState<{ month: string; liberadas: number; emAnalise: number }[]>([
    { month: 'Jan', liberadas: 0, emAnalise: 0 },
    { month: 'Fev', liberadas: 0, emAnalise: 0 },
    { month: 'Mar', liberadas: 0, emAnalise: 0 },
    { month: 'Abr', liberadas: 0, emAnalise: 0 },
    { month: 'Mai', liberadas: 0, emAnalise: 0 },
    { month: 'Jun', liberadas: 0, emAnalise: 0 },
    { month: 'Jul', liberadas: 0, emAnalise: 0 },
    { month: 'Ago', liberadas: 0, emAnalise: 0 },
    { month: 'Set', liberadas: 0, emAnalise: 0 },
    { month: 'Out', liberadas: 0, emAnalise: 0 },
    { month: 'Nov', liberadas: 0, emAnalise: 0 },
    { month: 'Dez', liberadas: 0, emAnalise: 0 },
  ]);

  useEffect(() => {
    async function fetchChartData() {
      if (!selectedDeputado) return;

      // Fetch all areas tematicas to get their colors
      const { data: areasList } = await supabase.from('areas_tematicas').select('nome, cor');
      const areaColors: Record<string, string> = {};
      if (areasList) {
        areasList.forEach(a => {
          areaColors[a.nome] = a.cor || '#cbd5e1';
        });
      }

      let categoryTotals: Record<string, number> = {};
      let totalValue = 0;

      // Initialize monthly data array (12 months)
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthlyMap = monthNames.map(m => ({ month: m, liberadas: 0, emAnalise: 0 }));

      if (filters.tipoVerba === 'Todas' || filters.tipoVerba === 'Emendas') {
        const { data: emendas } = await supabase
          .from('orcamentos')
          .select('*, areas_tematicas(nome), municipio(nome)')
          .eq('id_deputado', selectedDeputado.id);

        if (emendas) {
          emendas.forEach((e: any) => {
            const munObj = Array.isArray(e.municipio) ? e.municipio[0] : e.municipio;
            const munName = munObj?.nome || '';
            const cat = e.areas_tematicas?.nome || 'Outros';
            const dateObj = e.data ? new Date(e.data) : new Date();
            const y = dateObj.getFullYear();
            const monthIdx = dateObj.getMonth();

            const matchYear = filters.anosFiscais.length === 0 || filters.anosFiscais.includes(y);
            const matchMun = filters.municipio === 'Todos' || munName === filters.municipio;
            const matchCat = filters.categoria === 'Todas' || filters.categoria === cat;

            if (matchYear && matchMun && matchCat) {
              const val = Number(e.valor) || 0;
              if (e.etapa === 'Liberado') {
                categoryTotals[cat] = (categoryTotals[cat] || 0) + val;
                totalValue += val;
                if (monthIdx >= 0 && monthIdx < 12) {
                  monthlyMap[monthIdx].liberadas += val;
                }
              } else {
                if (monthIdx >= 0 && monthIdx < 12) {
                  monthlyMap[monthIdx].emAnalise += val;
                }
              }
            }
          });
        }
      }

      const defaultColors = ['#005baa', '#009b3a', '#fedf00', '#f97316', '#8b5cf6', '#06b6d4', '#ec4899', '#cbd5e1'];
      
      const formattedCategories = Object.entries(categoryTotals)
        .map(([name, value], index) => ({
          name,
          value,
          color: areaColors[name] || defaultColors[index % defaultColors.length]
        }))
        .sort((a, b) => b.value - a.value);

      setCategories(formattedCategories);
      setTotal(totalValue);
      setMonthlyData(monthlyMap);
    }

    fetchChartData();
  }, [selectedDeputado, filters]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly Evolution Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-slate-100 pb-4 gap-2">
            <div>
              <h3 className="text-xl font-headline font-black text-slate-900">
                Evolução Mensal das Emendas
              </h3>
              <p className="text-xs text-slate-500 font-medium">Demonstrativo de emendas liberadas x em análise ao longo do ano</p>
            </div>
          </div>
          
          <div className="flex-1 w-full h-[320px] min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} 
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={(val) => formatCurrency(val)} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0),
                    name === 'liberadas' ? 'Liberadas' : 'Em Análise / Rascunho'
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                />
                <Legend 
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '16px', fontSize: '12px', fontWeight: 700 }}
                  formatter={(value) => value === 'liberadas' ? 'Emendas Liberadas' : 'Em Análise / Rascunho'}
                />
                <Bar dataKey="liberadas" name="liberadas" fill="#005baa" radius={[6, 6, 0, 0]} barSize={14} />
                <Bar dataKey="emAnalise" name="emAnalise" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Thematic Impact Overview with Recharts */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h4 className="text-xl font-headline font-black text-slate-900">Impacto Social</h4>
            <p className="text-xs text-slate-500 font-medium mb-4">Distribuição por Área Temática</p>
          </div>
          
          <div className="w-full h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [
                    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0),
                    'Liberado'
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-base font-black font-headline text-slate-900">{formatCurrency(total)}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Total</span>
            </div>
          </div>
          
          <div className="w-full space-y-2 max-h-[140px] overflow-y-auto pr-1 mt-2">
            {categories.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Nenhuma categoria registrada.</p>
            ) : (
              categories.map(cat => (
                <div key={cat.name} className="flex justify-between items-center text-xs font-medium text-slate-700">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></div>
                    <span className="truncate max-w-[140px] font-bold text-slate-800">{cat.name}</span>
                  </div>
                  <span className="font-black text-slate-900 shrink-0">{total > 0 ? Math.round((cat.value / total) * 100) : 0}%</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
