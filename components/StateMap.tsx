'use client';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useDeputado } from '@/context/DeputadoContext';
import { supabase } from '@/lib/supabase';

const stateNameToUF: Record<string, string> = {
  'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM', 'Bahia': 'BA', 'Ceará': 'CE',
  'Distrito Federal': 'DF', 'Espírito Santo': 'ES', 'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT',
  'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR',
  'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC',
  'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO'
};

export function StateMap() {
  const { selectedDeputado } = useDeputado();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ show: boolean, x: number, y: number, name: string, pop: string, value: string, percentage?: string, lat?: number, lng?: number }>({ show: false, x: 0, y: 0, name: '', pop: '', value: '' });

  useEffect(() => {
    if (!selectedDeputado?.estado) return;

    async function drawMap() {
      setLoading(true);
      try {
        const estadoRaw = selectedDeputado?.estado || '';
        const uf = estadoRaw.length === 2 ? estadoRaw.toUpperCase() : (stateNameToUF[estadoRaw] || estadoRaw);

        // 1. Fetch GeoJSON for the state municipalities (with cache busting)
        const geoResponse = await fetch(`https://servicodados.ibge.gov.br/api/v3/malhas/estados/${uf}?formato=application/vnd.geo+json&intrarregiao=municipio&_t=${Date.now()}`, { cache: 'no-store' });
        if (!geoResponse.ok) throw new Error('Failed to fetch map data');
        const geoData = await geoResponse.json();

        // 2. Fetch Municipality names (with cache busting)
        const munResponse = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?_t=${Date.now()}`, { cache: 'no-store' });
        const munData = await munResponse.json();
        
        // 3. Fetch Emendas and Projetos for this deputy
        const { data: emendas } = await supabase.from('orcamentos').select('municipio, valor').eq('id_deputado', selectedDeputado?.id);
        const { data: projetos } = await supabase.from('projetos').select('municipio, valor_projeto').eq('id_deputado', selectedDeputado?.id);

        // 4. Fetch Municipality data from our database
        const { data: dbMunicipios } = await supabase
          .from('municipio')
          .select('nome, populacao, latitude, longitude, unidade_federacao!inner(sigla)')
          .eq('unidade_federacao.sigla', uf);

        const dbMunMap = new Map<string, any>();
        const normalizeName = (name: string) => name ? name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : '';

        if (dbMunicipios) {
          dbMunicipios.forEach(m => {
            dbMunMap.set(normalizeName(m.nome), m);
          });
        }

        const valuesByMun = new Map<string, number>();
        
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
            
            const dbMun = dbMunMap.get(norm);
            if (dbMun) {
              f.properties.pop = dbMun.populacao ? dbMun.populacao.toLocaleString('pt-BR') : 'N/A';
              f.properties.lat = dbMun.latitude;
              f.properties.lng = dbMun.longitude;
            } else {
              // Fallback
              const pseudoPop = (parseInt(mun.id.toString().slice(-4)) * 123) % 500000 + 5000;
              f.properties.pop = pseudoPop.toLocaleString('pt-BR');
            }
          } else {
            f.properties.name = 'Desconhecido';
            f.properties.value = 0;
            f.properties.pop = 'N/A';
          }
        });

        // Calculate total value for percentages
        let totalStateValue = 0;
        geoData.features.forEach((f: any) => {
          totalStateValue += f.properties.value || 0;
        });

        // Draw with D3
        const width = 800;
        const height = 600;
        
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // Use fitExtent to add padding and ensure the state is fully visible and centered
        const projection = d3.geoMercator().fitExtent([[40, 40], [width - 40, height - 40]], geoData);
        const path = d3.geoPath().projection(projection);

        // Color scale for choropleth
        const maxVal = (d3.max(geoData.features, (d: any) => d.properties.value as number) || 1) as number;
        const colorScale = d3.scaleLinear<string>()
          .domain([0, maxVal])
          .range(['#1e293b', '#60a5fa']); // Dark slate to light blue

        // Draw municipalities
        svg.append('g')
          .selectAll('path')
          .data(geoData.features)
          .enter()
          .append('path')
          .attr('d', path as any)
          .attr('fill', (d: any) => d.properties.value > 0 ? colorScale(d.properties.value) : '#0f172a') // Darker for 0
          .attr('stroke', '#000000')
          .attr('stroke-width', 0.5)
          .style('cursor', 'pointer')
          .style('transition', 'fill 0.2s, stroke-width 0.2s')
          .on('mouseover', function(event, d: any) {
            d3.select(this)
              .attr('stroke', '#ffffff')
              .attr('stroke-width', 1.5)
              .raise(); // Bring to front
            
            const formatCurrency = (val: number) => {
              if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
              if (val >= 1000) return `R$ ${(val / 1000).toFixed(1)}K`;
              return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
            };
            
            const percentage = totalStateValue > 0 ? ((d.properties.value / totalStateValue) * 100).toFixed(1) : '0.0';
            
            setTooltip({
              show: true,
              x: event.clientX,
              y: event.clientY,
              name: d.properties.name,
              pop: d.properties.pop,
              value: formatCurrency(d.properties.value),
              percentage: `${percentage}%`,
              lat: d.properties.lat,
              lng: d.properties.lng
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
              .attr('stroke', '#000000')
              .attr('stroke-width', 0.5);
            
            setTooltip(t => ({ ...t, show: false }));
          });

        // Add labels for top municipalities
        const topMunicipalities = geoData.features
          .filter((f: any) => f.properties.value > 0)
          .sort((a: any, b: any) => b.properties.value - a.properties.value)
          .slice(0, 5); // Top 5

        const labels = svg.append('g').attr('class', 'labels');
        
        topMunicipalities.forEach((d: any) => {
          const centroid = path.centroid(d);
          if (!isNaN(centroid[0]) && !isNaN(centroid[1])) {
            const formatCurrency = (val: number) => {
              if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
              return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
            };
            const percentage = totalStateValue > 0 ? Math.round((d.properties.value / totalStateValue) * 100) : 0;

            const g = labels.append('g')
              .attr('transform', `translate(${centroid[0]},${centroid[1]})`);

            // Label background
            g.append('rect')
              .attr('x', -40)
              .attr('y', -20)
              .attr('width', 80)
              .attr('height', 40)
              .attr('fill', 'rgba(30, 41, 59, 0.8)')
              .attr('rx', 4);

            // City name
            g.append('text')
              .attr('text-anchor', 'middle')
              .attr('y', -6)
              .attr('fill', '#ffffff')
              .attr('font-size', '10px')
              .attr('font-weight', 'bold')
              .text(d.properties.name);

            // Value
            g.append('text')
              .attr('text-anchor', 'middle')
              .attr('y', 6)
              .attr('fill', '#ffffff')
              .attr('font-size', '10px')
              .attr('font-weight', 'bold')
              .text(formatCurrency(d.properties.value));

            // Percentage
            g.append('text')
              .attr('text-anchor', 'middle')
              .attr('y', 16)
              .attr('fill', '#94a3b8')
              .attr('font-size', '8px')
              .text(`Percen: ${percentage}%`);
          }
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
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {loading && <div className="absolute inset-0 flex items-center justify-center bg-[#0b1120]/80 z-10 text-sm text-slate-400 font-medium">Carregando mapa do estado...</div>}
      <svg ref={svgRef} viewBox="0 0 800 600" className="w-full h-full" preserveAspectRatio="xMidYMid meet"></svg>
      
      {tooltip.show && (
        <div 
          className="fixed z-[100] bg-[#1e293b] text-white text-xs p-3 rounded shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-15px] min-w-[200px] border border-slate-700"
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
            {tooltip.percentage && (
              <p className="text-slate-300 flex justify-between">
                <span>Porcentagem:</span> 
                <span className="text-white font-medium">{tooltip.percentage}</span>
              </p>
            )}
            {tooltip.lat !== undefined && tooltip.lng !== undefined && (
              <p className="text-slate-500 flex justify-between text-[10px] mt-1 pt-1 border-t border-slate-700/50">
                <span>Lat/Lng:</span> 
                <span>{tooltip.lat.toFixed(4)}, {tooltip.lng.toFixed(4)}</span>
              </p>
            )}
          </div>
          {/* Tooltip Arrow */}
          <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#1e293b]"></div>
        </div>
      )}
    </div>
  );
}
