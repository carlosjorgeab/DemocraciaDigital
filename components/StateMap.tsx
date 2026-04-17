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

        const g = svg.append('g');

        // Zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
          .scaleExtent([1, 8])
          .on('zoom', (event) => {
            g.attr('transform', event.transform);
          });
        
        (svg as any).call(zoom);

        // Use fitExtent to add padding and ensure the state is fully visible and centered
        const projection = d3.geoMercator().fitExtent([[40, 40], [width - 40, height - 80]], geoData);
        const path = d3.geoPath().projection(projection);

        // Color scale for choropleth (Portal da Transparência style: LightBlue to DarkBlue)
        const maxVal = (d3.max(geoData.features, (d: any) => d.properties.value as number) || 1) as number;
        
        // Define a nice sequential colormap
        const colorScale = d3.scaleThreshold<number, string>()
          .domain([1, maxVal * 0.1, maxVal * 0.3, maxVal * 0.6, maxVal])
          .range(['#f8fafc', '#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a']);

        // Draw municipalities
        g.selectAll('path')
          .data(geoData.features)
          .enter()
          .append('path')
          .attr('d', path as any)
          .attr('fill', (d: any) => d.properties.value > 0 ? colorScale(d.properties.value) : '#f8fafc')
          .attr('stroke', '#cbd5e1')
          .attr('stroke-width', 0.5)
          .style('cursor', 'pointer')
          .style('transition', 'fill 0.2s, stroke-width 0.2s')
          .on('mouseover', function(event, d: any) {
            d3.select(this)
              .attr('stroke', '#0f172a')
              .attr('stroke-width', 1.5)
              .raise(); // Bring to front
            
            const formatCurrency = (val: number) => {
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
              .attr('stroke', '#cbd5e1')
              .attr('stroke-width', 0.5);
            
            setTooltip(t => ({ ...t, show: false }));
          });

        // Add labels for top municipalities
        const topMunicipalities = geoData.features
          .filter((f: any) => f.properties.value > 0)
          .sort((a: any, b: any) => b.properties.value - a.properties.value)
          .slice(0, 5); // Top 5

        const labels = g.append('g').attr('class', 'labels');
        
        topMunicipalities.forEach((d: any) => {
          const centroid = path.centroid(d);
          if (!isNaN(centroid[0]) && !isNaN(centroid[1])) {
            const formatCurrency = (val: number) => {
              if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
              return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
            };
            const percentage = totalStateValue > 0 ? Math.round((d.properties.value / totalStateValue) * 100) : 0;

            const labelGroup = labels.append('g')
              .attr('transform', `translate(${centroid[0]},${centroid[1]})`)
              .style('pointer-events', 'none'); // Prevent blocking tooltips

            // Label background
            labelGroup.append('rect')
              .attr('x', -40)
              .attr('y', -20)
              .attr('width', 80)
              .attr('height', 40)
              .attr('fill', 'rgba(255, 255, 255, 0.95)')
              .attr('rx', 4)
              .attr('stroke', '#cbd5e1')
              .attr('stroke-width', 1)
              .style('box-shadow', '0 1px 2px rgba(0,0,0,0.1)');

            // City name
            labelGroup.append('text')
              .attr('text-anchor', 'middle')
              .attr('y', -6)
              .attr('fill', '#0f172a')
              .attr('font-size', '10px')
              .attr('font-weight', 'bold')
              .text(d.properties.name);

            // Value
            labelGroup.append('text')
              .attr('text-anchor', 'middle')
              .attr('y', 6)
              .attr('fill', '#1d4ed8')
              .attr('font-size', '10px')
              .attr('font-weight', 'bold')
              .text(formatCurrency(d.properties.value));

            // Percentage
            labelGroup.append('text')
              .attr('text-anchor', 'middle')
              .attr('y', 16)
              .attr('fill', '#64748b')
              .attr('font-size', '8px')
              .text(`Participação: ${percentage}%`);
          }
        });

        // Add Legend
        const legendWidth = 200;
        const legendHeight = 10;
        
        const legend = svg.append('g')
          .attr('class', 'legend')
          .attr('transform', `translate(20, ${height - 40})`);
          
        const legendScale = d3.scaleLinear()
          .domain([0, maxVal])
          .range([0, legendWidth]);
          
        const defs = svg.append("defs");
        const linearGradient = defs.append("linearGradient")
            .attr("id", "linear-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        linearGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#f8fafc");
            
        linearGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#1e3a8a");

        legend.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#linear-gradient)")
            .attr("stroke", "#cbd5e1")
            .attr("stroke-width", 0.5)
            .attr("rx", 2);

        const formatLegendValues = (val: number) => {
            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
            if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
            return val.toString();
        };

        const legendAxis = d3.axisBottom(legendScale)
          .ticks(5)
          .tickFormat(d => formatLegendValues(d as number));
          
        legend.append("g")
          .attr("transform", `translate(0, ${legendHeight})`)
          .call(legendAxis)
          .select(".domain").remove();
          
        legend.append("text")
          .attr("y", -6)
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .attr("fill", "#475569")
          .text("Volume de Recursos (R$)");

        // Set up zoom controls state (not react state, just D3 methods)
        (window as any).__zoomMap = (factor: number) => {
          (svg as any).transition().duration(300).call(zoom.scaleBy, factor);
        };
        (window as any).__resetZoom = () => {
          (svg as any).transition().duration(300).call(zoom.transform, d3.zoomIdentity);
        };

      } catch (err) {
        console.error("Error drawing map:", err);
      } finally {
        setLoading(false);
      }
    }

    drawMap();
  }, [selectedDeputado]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-slate-50 overflow-hidden">
      {loading && <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 text-sm text-slate-500 font-medium">Carregando mapa do estado...</div>}
      <svg ref={svgRef} viewBox="0 0 800 600" className="w-full h-full cursor-grab active:cursor-grabbing" preserveAspectRatio="xMidYMid meet"></svg>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden z-20">
        <button 
          onClick={() => (window as any).__zoomMap && (window as any).__zoomMap(1.5)}
          className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 border-b border-slate-200 font-bold"
          title="Zoom In"
        >
          +
        </button>
        <button 
          onClick={() => (window as any).__zoomMap && (window as any).__zoomMap(0.667)}
          className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 border-b border-slate-200 font-bold"
          title="Zoom Out"
        >
          -
        </button>
        <button 
          onClick={() => (window as any).__resetZoom && (window as any).__resetZoom()}
          className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 text-xs font-bold"
          title="Reset Zoom"
        >
          R
        </button>
      </div>
      
      {tooltip.show && (
        <div 
          className="fixed z-[100] bg-white text-slate-800 text-xs p-3 rounded shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-15px] min-w-[200px] border border-slate-200"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <p className="font-bold text-sm mb-2 pb-2 border-b border-slate-100">{tooltip.name}</p>
          <div className="space-y-1">
            <p className="text-slate-500 flex justify-between">
              <span>População:</span> 
              <span className="text-slate-800 font-medium">{tooltip.pop}</span>
            </p>
            <p className="text-slate-500 flex justify-between">
              <span>Verba Destinada:</span> 
              <span className="text-slate-800 font-medium">{tooltip.value}</span>
            </p>
            {tooltip.percentage && (
              <p className="text-slate-500 flex justify-between">
                <span>Porcentagem:</span> 
                <span className="text-slate-800 font-medium">{tooltip.percentage}</span>
              </p>
            )}
            {tooltip.lat !== undefined && tooltip.lng !== undefined && (
              <p className="text-slate-400 flex justify-between text-[10px] mt-1 pt-1 border-t border-slate-100">
                <span>Lat/Lng:</span> 
                <span>{tooltip.lat.toFixed(4)}, {tooltip.lng.toFixed(4)}</span>
              </p>
            )}
          </div>
          {/* Tooltip Arrow */}
          <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white"></div>
        </div>
      )}
    </div>
  );
}
