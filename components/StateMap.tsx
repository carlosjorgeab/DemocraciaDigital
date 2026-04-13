'use client';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useDeputado } from '@/context/DeputadoContext';
import { supabase } from '@/lib/supabase';

export function StateMap() {
  const { selectedDeputado } = useDeputado();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ show: boolean, x: number, y: number, name: string, pop: string, value: string }>({ show: false, x: 0, y: 0, name: '', pop: '', value: '' });

  useEffect(() => {
    if (!selectedDeputado?.estado) return;

    async function drawMap() {
      setLoading(true);
      try {
        // 1. Fetch GeoJSON for the state
        const geoResponse = await fetch(`https://servicodados.ibge.gov.br/api/v3/malhas/estados/${selectedDeputado?.estado}?formato=application/vnd.geo+json&resolucao=5`);
        const geoData = await geoResponse.json();

        // 2. Fetch Municipality names
        const munResponse = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedDeputado?.estado}/municipios`);
        const munData = await munResponse.json();
        
        // 3. Fetch Emendas and Projetos for this deputy
        const { data: emendas } = await supabase.from('orcamentos').select('municipio, valor').eq('id_deputado', selectedDeputado?.id);
        const { data: projetos } = await supabase.from('projetos').select('municipio, valor_projeto').eq('id_deputado', selectedDeputado?.id);

        const valuesByMun = new Map<string, number>();
        
        const normalizeName = (name: string) => name ? name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : '';

        if (emendas) {
          emendas.forEach(e => {
            if (e.municipio) {
              const norm = normalizeName(e.municipio);
              valuesByMun.set(norm, (valuesByMun.get(norm) || 0) + Number(e.valor));
            }
          });
        }
        if (projetos) {
          projetos.forEach(p => {
            if (p.municipio) {
              const norm = normalizeName(p.municipio);
              valuesByMun.set(norm, (valuesByMun.get(norm) || 0) + Number(p.valor_projeto));
            }
          });
        }

        // Map codarea to name and values
        geoData.features.forEach((f: any) => {
          const codarea = f.properties.codarea;
          // Find name from munData
          const mun = munData.find((m: any) => m.id.toString().startsWith(codarea) || codarea.startsWith(m.id.toString()));
          if (mun) {
            f.properties.name = mun.nome;
            const norm = normalizeName(mun.nome);
            f.properties.value = valuesByMun.get(norm) || 0;
            // Mock population based on ID for now (since IBGE population API requires specific query)
            // We use a deterministic pseudo-random based on ID so it stays consistent
            const pseudoPop = (parseInt(mun.id.toString().slice(-4)) * 123) % 500000 + 5000;
            f.properties.pop = pseudoPop.toLocaleString('pt-BR');
          } else {
            f.properties.name = 'Desconhecido';
            f.properties.value = 0;
            f.properties.pop = 'N/A';
          }
        });

        // Draw with D3
        const width = 600;
        const height = 400;
        
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // Use fitExtent to add padding and ensure the state is fully visible and centered
        const projection = d3.geoMercator().fitExtent([[20, 20], [width - 20, height - 20]], geoData);
        const path = d3.geoPath().projection(projection);

        // Get party color
        const partyColor = selectedDeputado?.partidos?.cor_primaria || '#d80000';

        svg.append('g')
          .selectAll('path')
          .data(geoData.features)
          .enter()
          .append('path')
          .attr('d', path as any)
          .attr('fill', '#e2e8f0') // Neutral color for all municipalities by default
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 0.5)
          .style('cursor', 'pointer')
          .style('transition', 'fill 0.2s, stroke-width 0.2s')
          .on('mouseover', function(event, d: any) {
            d3.select(this)
              .attr('fill', partyColor)
              .attr('stroke-width', 1.5);
            
            const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
            
            // Get container bounds to position tooltip relative to viewport
            setTooltip({
              show: true,
              x: event.clientX,
              y: event.clientY,
              name: d.properties.name,
              pop: d.properties.pop,
              value: formatCurrency(d.properties.value)
            });
          })
          .on('mousemove', function(event) {
             setTooltip(t => ({
              ...t,
              x: event.clientX,
              y: event.clientY,
            }));
          })
          .on('mouseout', function(event, d: any) {
            d3.select(this)
              .attr('fill', '#e2e8f0')
              .attr('stroke-width', 0.5);
            
            setTooltip(t => ({ ...t, show: false }));
          });

      } catch (err) {
        console.error("Error drawing map:", err);
      } finally {
        setLoading(false);
      }
    }

    drawMap();
  }, [selectedDeputado]);

  return (
    <div ref={containerRef} className="relative w-full h-[400px] flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
      {loading && <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 text-sm text-slate-500 font-medium">Carregando mapa do estado...</div>}
      <svg ref={svgRef} viewBox="0 0 600 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet"></svg>
      
      {tooltip.show && (
        <div 
          className="fixed z-[100] bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-15px] min-w-[200px]"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <p className="font-bold text-sm mb-2 pb-2 border-b border-slate-700">{tooltip.name}</p>
          <div className="space-y-1">
            <p className="text-slate-300 flex justify-between">
              <span>População:</span> 
              <span className="text-white font-medium">{tooltip.pop}</span>
            </p>
            <p className="text-slate-300 flex justify-between">
              <span>Verba Destinada:</span> 
              <span className="text-white font-medium">{tooltip.value}</span>
            </p>
          </div>
          {/* Tooltip Arrow */}
          <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
}
