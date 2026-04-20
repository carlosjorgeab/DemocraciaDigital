'use client';
import { useRef, useState } from 'react';
import { ArrowLeft, Map as MapIcon } from 'lucide-react';
import { rsPaths } from './rs-data'; // 497 paths pre-computed from IBGE GeoJSON!

export function RSMapDivisions({ onHover, onBack }: { onHover?: (name: string | null) => void; onBack: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  return (
    <div className="w-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="w-full flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Mapa do Brasil
        </button>
        <div className="flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 uppercase tracking-widest">
          <MapIcon className="w-4 h-4" />
          Rio Grande do Sul: Divisões Municipais
        </div>
      </div>
      
      <div className="relative w-full flex items-center justify-center min-h-[600px] bg-slate-50 rounded-xl border border-slate-200 shadow-inner p-4 overflow-hidden">
        <div ref={containerRef} className="w-full h-full max-w-[800px] relative z-0 flex justify-center">
              <svg 
                id="rs-municipal-map"
                viewBox="0 0 800 600" 
                className="w-full h-full drop-shadow-2xl transition-all duration-500"
                strokeLinecap="round" 
                strokeLinejoin="round" 
              >
                  {rsPaths.map((path) => (
                      <path
                          key={path.id}
                          id={path.id}
                          d={path.d}
                          fill="var(--color-primary, #d80000)"
                          fillOpacity={hoveredId === path.id ? 1 : 0.8}
                          stroke="#ffffff"
                          strokeWidth={hoveredId === path.id ? "1.5" : "0.5"}
                          className="transition-all duration-200 cursor-pointer"
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
                          <title>{path.name}</title>
                      </path>
                  ))}
            </svg>

            {/* Tooltip implementation */}
            {hoveredName && (
                <div className="absolute pointer-events-none bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg z-50 transition-opacity border border-white/20 whitespace-nowrap"
                     style={{ 
                         left: '50%',
                         top: '10px',
                         transform: 'translateX(-50%)'
                     }}
                >
                    {hoveredName}
                </div>
            )}
        </div>
        
        {/* Info Legend */}
        <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm pl-4 pr-6 py-4 rounded-xl shadow-lg border border-slate-200 z-10 scale-90 sm:scale-100 origin-bottom-right">
            <h4 className="font-bold text-slate-700 mb-3 uppercase tracking-widest text-[10px]">Rio Grande do Sul</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md shadow-sm border border-black/5" style={{ backgroundColor: 'var(--color-primary, #d80000)' }}></div>
                <span className="text-slate-600 text-xs font-semibold">{rsPaths.length} Municípios</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-4 max-w-[180px] leading-tight">
              Os dados geográficos oficiais do IBGE para o RS foram compilados diretamente no app.
            </p>
        </div>
      </div>
    </div>
  );
}
