'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Receipt, Building2, Search, ExternalLink, X, Filter, ChevronRight, FileText, Calendar, DollarSign } from 'lucide-react';

// Fix default leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// PR default fallback coordinates dictionary for PR cities in case DB lat/lng is missing
const PR_COORDINATES: Record<string, [number, number]> = {
  'Curitiba': [-25.4284, -49.2733],
  'Londrina': [-23.3045, -51.1696],
  'Maringá': [-23.421, -51.9331],
  'Ponta Grossa': [-25.095, -50.1619],
  'Cascavel': [-24.9558, -53.4552],
  'São José dos Pinhais': [-25.5348, -49.2064],
  'Foz do Iguaçu': [-25.5163, -54.5854],
  'Colombo': [-25.2917, -49.2242],
  'Guarapuava': [-25.3953, -51.4625],
  'Paranaguá': [-25.5204, -48.5094],
  'Araucária': [-25.5931, -49.4103],
  'Toledo': [-24.7136, -53.7431],
  'Apucarana': [-23.5511, -51.4614],
  'Campo Largo': [-25.4594, -49.5283],
  'Pinhais': [-25.4428, -49.1925],
  'Umuarama': [-23.7661, -53.3206],
  'Arapongas': [-23.4139, -51.4247],
  'Almirante Tamandaré': [-25.3217, -49.3039],
  'Piraquara': [-25.4422, -49.0628],
  'Cambé': [-23.2758, -51.2783],
  'Fazenda Rio Grande': [-25.66, -49.3083],
  'Sarandi': [-23.4436, -51.8742],
  'Campo Mourão': [-24.0439, -52.3786],
  'Francisco Beltrão': [-26.0811, -53.055],
  'Paranavaí': [-23.08, -52.4639],
  'Pato Branco': [-26.2289, -52.6708],
  'Cianorte': [-23.6631, -52.6053],
  'Telêmaco Borba': [-24.3239, -50.6156],
  'Castro': [-24.7911, -50.0119],
  'Rolândia': [-23.3103, -51.3689],
  'Irati': [-25.4672, -50.6511],
  'União da Vitória': [-26.2283, -51.0864],
  'Ibiporã': [-23.2692, -51.0481],
  'Prudentópolis': [-25.2131, -50.9786],
  'Marechal Cândido Rondon': [-24.5558, -54.0569],
  'Cornélio Procópio': [-23.1811, -50.6469],
  'Palmas': [-26.4839, -51.9889],
  'Lapa': [-25.7681, -49.7169],
  'Medianeira': [-25.2972, -54.0939],
  'Santo Antônio da Platina': [-23.1469, -50.0828],
  'São Mateus do Sul': [-25.8711, -50.3828],
  'Jacarezinho': [-23.1603, -49.9708],
  'Dois Vizinhos': [-25.75, -53.0572],
  'Laranjeiras do Sul': [-25.4081, -52.4158],
  'Guaíra': [-24.08, -54.2578],
  'Ivaiporã': [-24.2481, -51.6833]
};

const STATE_NAMES: Record<string, string> = {
  'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas', 'BA': 'Bahia', 'CE': 'Ceará',
  'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás', 'MA': 'Maranhão', 'MT': 'Mato Grosso',
  'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais', 'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná',
  'PE': 'Pernambuco', 'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
  'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina',
  'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins'
};

const STATE_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  'AC': { center: [-9.02, -70.81], zoom: 7 },
  'AL': { center: [-9.57, -36.78], zoom: 8 },
  'AM': { center: [-3.41, -65.85], zoom: 6 },
  'AP': { center: [1.41, -51.77], zoom: 7 },
  'BA': { center: [-12.57, -41.70], zoom: 6 },
  'CE': { center: [-5.20, -39.53], zoom: 7 },
  'DF': { center: [-15.78, -47.92], zoom: 10 },
  'ES': { center: [-19.18, -40.30], zoom: 8 },
  'GO': { center: [-15.82, -49.83], zoom: 7 },
  'MA': { center: [-5.42, -45.44], zoom: 6 },
  'MT': { center: [-12.64, -55.42], zoom: 6 },
  'MS': { center: [-20.77, -54.78], zoom: 7 },
  'MG': { center: [-18.51, -44.55], zoom: 6 },
  'PA': { center: [-1.99, -54.93], zoom: 6 },
  'PB': { center: [-7.24, -36.78], zoom: 8 },
  'PR': { center: [-24.89, -51.55], zoom: 7 },
  'PE': { center: [-8.38, -37.86], zoom: 8 },
  'PI': { center: [-7.71, -42.80], zoom: 6 },
  'RJ': { center: [-22.25, -42.50], zoom: 8 },
  'RN': { center: [-5.81, -36.59], zoom: 8 },
  'RS': { center: [-30.03, -53.20], zoom: 7 },
  'RO': { center: [-10.83, -63.34], zoom: 7 },
  'RR': { center: [1.99, -61.33], zoom: 7 },
  'SC': { center: [-27.24, -50.21], zoom: 7 },
  'SP': { center: [-22.20, -48.50], zoom: 7 },
  'SE': { center: [-10.57, -37.38], zoom: 8 },
  'TO': { center: [-10.18, -48.33], zoom: 7 },
};

interface MunicipioData {
  id: string;
  nome: string;
  uf?: string;
  lat?: number;
  lng?: number;
  totalValor: number;
  emendasCount: number;
  emendas: any[];
}

function MapController({ selectedCoords }: { selectedCoords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedCoords) {
      map.flyTo(selectedCoords, 10, { duration: 1.5 });
    }
  }, [selectedCoords, map]);
  return null;
}

function StateAutoCenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Investment Range Bands Definition
const INVESTMENT_RANGES = [
  { id: 'all', label: 'Todos', color: '#005baa', min: 0, max: Infinity },
  { id: '1', label: 'Até R$ 200 mil', color: '#7dd3fc', min: 0.01, max: 200000 },
  { id: '2', label: 'R$ 200k - R$ 500k', color: '#38bdf8', min: 200000.01, max: 500000 },
  { id: '3', label: 'R$ 500k - R$ 1 Mi', color: '#0284c7', min: 500000.01, max: 1000000 },
  { id: '4', label: 'Acima de R$ 1 Mi', color: '#005baa', min: 1000000.01, max: Infinity },
];

function getRangeId(val: number): string {
  if (val <= 200000) return '1';
  if (val <= 500000) return '2';
  if (val <= 1000000) return '3';
  return '4';
}

function getColorForValue(val: number): string {
  if (val > 1000000) return '#005baa';
  if (val > 500000) return '#0284c7';
  if (val > 200000) return '#38bdf8';
  return '#7dd3fc';
}

export default function ParanaMap({ municipios, uf = 'PR' }: { municipios: MunicipioData[]; uf?: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [activeRange, setActiveRange] = useState<string>('all');
  const [selectedMunicipioModal, setSelectedMunicipioModal] = useState<MunicipioData | null>(null);
  const [modalSearchTerm, setModalSearchTerm] = useState('');

  const currentUF = (uf || 'PR').toUpperCase();
  const stateName = STATE_NAMES[currentUF] || currentUF;
  const stateConfig = STATE_CENTERS[currentUF] || { center: [-24.89, -51.55], zoom: 7 };

  // Calculate range counts
  const rangeCounts: Record<string, number> = {
    'all': municipios.length,
    '1': municipios.filter(m => m.totalValor > 0 && m.totalValor <= 200000).length,
    '2': municipios.filter(m => m.totalValor > 200000 && m.totalValor <= 500000).length,
    '3': municipios.filter(m => m.totalValor > 500000 && m.totalValor <= 1000000).length,
    '4': municipios.filter(m => m.totalValor > 1000000).length,
  };

  // Filter municipalities by search term and active interactive legend range
  const filteredMunicipios = municipios.filter(m => {
    const matchesSearch = m.nome.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (activeRange === 'all') return true;
    const rId = getRangeId(m.totalValor);
    return rId === activeRange;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getCoordinates = (m: MunicipioData): [number, number] | null => {
    if (m.lat && m.lng && !isNaN(m.lat) && !isNaN(m.lng) && m.lat !== 0) {
      return [m.lat, m.lng];
    }
    const cleanName = m.nome.trim();
    if (PR_COORDINATES[cleanName]) {
      return PR_COORDINATES[cleanName];
    }
    return null;
  };

  // Find max value for radius scaling
  const maxVal = Math.max(...municipios.map(m => m.totalValor), 1);

  // Filtered emendas inside modal
  const modalEmendas = selectedMunicipioModal?.emendas?.filter((e: any) => {
    if (!modalSearchTerm.trim()) return true;
    const t = modalSearchTerm.toLowerCase();
    return (
      (e.objeto || '').toLowerCase().includes(t) ||
      (e.numero_emenda || '').toLowerCase().includes(t) ||
      (e.etapa || '').toLowerCase().includes(t) ||
      String(e.valor || '').includes(t)
    );
  }) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
      {/* Map Container */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-[650px] relative">
        {/* Top bar overlay */}
        <div className="p-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur border-b border-slate-100 dark:border-slate-700 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-primary shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Mapa da Base Eleitoral - {stateName} ({currentUF})
              </h3>
              <p className="text-[10px] text-slate-600 font-medium">Clique nos marcadores para visualizar a lista completa de emendas do município</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
              <Receipt size={12} /> {filteredMunicipios.length} {filteredMunicipios.length === 1 ? 'município' : 'municípios'}
            </span>
          </div>
        </div>

        {/* Map Canvas */}
        <div className="flex-1 w-full h-full relative">
          <MapContainer
            center={stateConfig.center}
            zoom={stateConfig.zoom}
            scrollWheelZoom={true}
            className="w-full h-full z-0"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <StateAutoCenter center={stateConfig.center} zoom={stateConfig.zoom} />
            <MapController selectedCoords={selectedCoords} />

            {municipios.map(m => {
              const coords = getCoordinates(m);
              if (!coords) return null;

              const isMatch = activeRange === 'all' || getRangeId(m.totalValor) === activeRange;
              if (!isMatch) return null;

              // Calculate circle size between 8px and 28px
              const radius = Math.max(9, Math.min(28, (m.totalValor / maxVal) * 28 + 9));
              const fillColor = getColorForValue(m.totalValor);

              return (
                <CircleMarker
                  key={m.id || m.nome}
                  center={coords}
                  radius={radius}
                  eventHandlers={{
                    click: () => {
                      setSelectedMunicipioModal(m);
                      setModalSearchTerm('');
                    }
                  }}
                  pathOptions={{
                    fillColor: fillColor,
                    fillOpacity: 0.85,
                    color: '#ffffff',
                    weight: 2.5
                  }}
                >
                  <Tooltip permanent={false} direction="top">
                    <span className="font-bold">{m.nome}</span>: {formatCurrency(m.totalValor)} ({m.emendasCount} emendas)
                  </Tooltip>
                  <Popup className="custom-leaflet-popup">
                    <div className="p-1 space-y-3 max-w-xs">
                      <div className="border-b border-slate-100 pb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Município</span>
                        <h4 className="font-black text-slate-900 text-base">{m.nome}</h4>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl space-y-1 border border-slate-100">
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Total Investido</p>
                        <p className="text-base font-black text-emerald-600">{formatCurrency(m.totalValor)}</p>
                        <p className="text-[11px] text-slate-700 font-semibold">{m.emendasCount} emenda(s) cadastrada(s)</p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedMunicipioModal(m);
                          setModalSearchTerm('');
                        }}
                        className="w-full py-2 px-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md hover:opacity-90 transition-all"
                      >
                        <FileText size={14} /> Ver Lista de Emendas ({m.emendasCount})
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          {/* Interactive Gradient Legend Overlay on Map */}
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-[1000] space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Filter size={14} className="text-primary" />
                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider">Legenda de Investimento</h4>
              </div>
              {activeRange !== 'all' && (
                <button
                  onClick={() => setActiveRange('all')}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  Limpar filtro
                </button>
              )}
            </div>

            {/* Continuous Color Gradient Bar */}
            <div className="space-y-1">
              <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-[#7dd3fc] via-[#38bdf8] via-[#0284c7] to-[#005baa] shadow-inner" />
              <div className="flex justify-between text-[9px] font-bold text-slate-600 dark:text-slate-400">
                <span>R$ 0</span>
                <span>R$ 200k</span>
                <span>R$ 500k</span>
                <span>R$ 1 Mi+</span>
              </div>
            </div>

            {/* Interactive Filter Range Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {INVESTMENT_RANGES.map((range) => {
                const isSelected = activeRange === range.id;
                const count = rangeCounts[range.id] || 0;

                return (
                  <button
                    key={range.id}
                    onClick={() => setActiveRange(isSelected && range.id !== 'all' ? 'all' : range.id)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-105'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: range.color }} />
                    <span>{range.label}</span>
                    <span className="opacity-70 font-black">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar List & Search */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-[650px] space-y-4">
        <div>
          <h3 className="font-headline font-black text-lg text-slate-900 dark:text-white">Municípios e Recursos</h3>
          <p className="text-xs text-slate-600 font-medium">Selecione para focar no mapa ou abrir os detalhes das emendas</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder={`Buscar município em ${stateName}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-primary"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredMunicipios.length === 0 ? (
            <div className="text-center py-12 text-slate-600 text-xs font-semibold">
              Nenhum município encontrado para os filtros selecionados.
            </div>
          ) : (
            filteredMunicipios
              .sort((a, b) => b.totalValor - a.totalValor)
              .map((m) => {
                const coords = getCoordinates(m);
                return (
                  <div
                    key={m.id || m.nome}
                    onClick={() => {
                      if (coords) setSelectedCoords(coords);
                      setSelectedMunicipioModal(m);
                      setModalSearchTerm('');
                    }}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-primary group-hover:scale-110 transition-transform" />
                        <h4 className="font-black text-xs text-slate-900 dark:text-white">{m.nome}</h4>
                      </div>
                      <p className="text-[11px] text-slate-700 font-semibold pl-5">{m.emendasCount} emenda(s)</p>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-xs text-emerald-600 block">{formatCurrency(m.totalValor)}</span>
                      <span className="text-[10px] text-primary font-bold group-hover:underline inline-flex items-center gap-0.5">
                        Ver detalhes <ChevronRight size={10} />
                      </span>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* POP-UP / MODAL: DETALHES DE EMENDAS DO MUNICÍPIO */}
      {selectedMunicipioModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary font-black text-[10px] uppercase rounded-full">
                    {currentUF}
                  </span>
                  <span className="text-xs text-slate-600 font-bold uppercase">Município Atendido</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{selectedMunicipioModal.nome}</h3>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  Detalhamento de emendas e investimentos alocados no município
                </p>
              </div>

              <button
                onClick={() => setSelectedMunicipioModal(null)}
                className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Highlights / Stats Bar */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
              <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-600">Valor Investido</p>
                  <p className="text-lg font-black text-emerald-600">{formatCurrency(selectedMunicipioModal.totalValor)}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Receipt size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-600">Total de Emendas</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{selectedMunicipioModal.emendasCount} emendas</p>
                </div>
              </div>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por objeto, número, ano ou status da emenda..."
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Modal Content - Emendas List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
              {modalEmendas.length === 0 ? (
                <div className="text-center py-12 text-slate-600 text-xs font-semibold">
                  Nenhuma emenda encontrada com o termo informado.
                </div>
              ) : (
                modalEmendas.map((emenda: any, idx: number) => {
                  const valorNum = Number(emenda.valor) || 0;
                  const dataAno = emenda.data ? new Date(emenda.data).getFullYear() : emenda.ano || '';

                  return (
                    <div
                      key={emenda.id || idx}
                      className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-primary transition-all space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-[11px] font-black rounded-lg uppercase">
                            Nº {emenda.numero_emenda || emenda.numero || 'Sem Nº'}
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

                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                          {emenda.objeto || emenda.descricao || 'Emenda Parlamentar'}
                        </p>
                      </div>

                      {(emenda.beneficiario || emenda.autor || emenda.area_tematica) && (
                        <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-semibold text-slate-600">
                          {emenda.beneficiario && (
                            <span>Beneficiário: <strong className="text-slate-800 dark:text-slate-200">{emenda.beneficiario}</strong></span>
                          )}
                          {emenda.area_tematica && (
                            <span>Área: <strong className="text-slate-800 dark:text-slate-200">{emenda.area_tematica}</strong></span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setSelectedMunicipioModal(null)}
                className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
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

