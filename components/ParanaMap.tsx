'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Receipt, Building2, Search, ExternalLink } from 'lucide-react';

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

export default function ParanaMap({ municipios, uf = 'PR' }: { municipios: MunicipioData[]; uf?: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);

  const currentUF = (uf || 'PR').toUpperCase();
  const stateName = STATE_NAMES[currentUF] || currentUF;
  const stateConfig = STATE_CENTERS[currentUF] || { center: [-24.89, -51.55], zoom: 7 };

  // Filter municipalities
  const filteredMunicipios = municipios.filter(m =>
    m.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalEmendasBase = municipios.reduce((acc, m) => acc + m.totalValor, 0);
  const totalCountBase = municipios.reduce((acc, m) => acc + m.emendasCount, 0);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Map Container */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-[600px] relative">
        <div className="p-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur border-b border-slate-100 dark:border-slate-700 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-primary" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Mapa da Base Eleitoral - {stateName} ({currentUF})
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Toque nos marcadores para visualizar o investimento por município</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-primary/10 text-primary">
              <Receipt size={12} /> {municipios.length} municípios com recursos
            </span>
          </div>
        </div>

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

              // Calculate circle size between 8px and 28px
              const radius = Math.max(8, Math.min(28, (m.totalValor / maxVal) * 28 + 8));

              return (
                <CircleMarker
                  key={m.id || m.nome}
                  center={coords}
                  radius={radius}
                  pathOptions={{
                    fillColor: m.totalValor > 1000000 ? '#005baa' : m.totalValor > 300000 ? '#0284c7' : '#38bdf8',
                    fillOpacity: 0.75,
                    color: '#ffffff',
                    weight: 2
                  }}
                >
                  <Tooltip permanent={false} direction="top">
                    <span className="font-bold">{m.nome}</span>: {formatCurrency(m.totalValor)}
                  </Tooltip>
                  <Popup className="custom-leaflet-popup">
                    <div className="p-1 space-y-2 max-w-xs">
                      <div className="border-b pb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Município</span>
                        <h4 className="font-black text-slate-900 text-base">{m.nome}</h4>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Total Destinado</p>
                        <p className="text-sm font-black text-primary">{formatCurrency(m.totalValor)}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{m.emendasCount} emenda(s) cadastrada(s)</p>
                      </div>

                      {m.emendas && m.emendas.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase">Principais Emendas</p>
                          <div className="max-h-28 overflow-y-auto space-y-1 text-xs">
                            {m.emendas.slice(0, 3).map((e: any, idx: number) => (
                              <div key={idx} className="p-1.5 bg-white border border-slate-100 rounded text-[11px] space-y-0.5">
                                <p className="font-bold text-slate-800 truncate">{e.objeto || 'Emenda Parlamentar'}</p>
                                <div className="flex justify-between text-[10px] text-slate-500">
                                  <span>{e.numero_emenda || 'Sem Nº'}</span>
                                  <span className="font-bold text-emerald-600">{formatCurrency(Number(e.valor) || 0)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* Sidebar List & Search */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-[600px] space-y-4">
        <div>
          <h3 className="font-headline font-black text-lg text-slate-900 dark:text-white">Municípios e Recursos</h3>
          <p className="text-xs text-slate-400">Pesquise para focar o mapa em uma cidade</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder={`Buscar município em ${stateName}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-primary"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredMunicipios.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Nenhum município encontrado com o termo informado.
            </div>
          ) : (
            filteredMunicipios
              .sort((a, b) => b.totalValor - a.totalValor)
              .map((m) => {
                const coords = getCoordinates(m);
                return (
                  <div
                    key={m.id || m.nome}
                    onClick={() => coords && setSelectedCoords(coords)}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-primary group-hover:scale-110 transition-transform" />
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{m.nome}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium pl-5">{m.emendasCount} emenda(s)</p>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-xs text-primary block">{formatCurrency(m.totalValor)}</span>
                      <span className="text-[10px] text-slate-400 font-bold group-hover:text-primary transition-colors inline-flex items-center gap-0.5">
                        Focar no mapa <ExternalLink size={10} />
                      </span>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
