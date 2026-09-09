'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Search, Navigation, X, ExternalLink, Loader2 } from 'lucide-react';
import { geocodeAddress, reverseGeocode, GeocodingResult, generateGoogleMapsUrl, generateWazeUrl, generateOpenStreetMapUrl } from '@/lib/geocoding';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface LocationPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  onLocationChange?: (location: GeocodingResult | null) => void;
  placeholder?: string;
  className?: string;
}

export default function LocationPicker({
  value = '',
  onChange,
  onLocationChange,
  placeholder = 'Digite o endereço do local...',
  className = '',
}: LocationPickerProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showMap, setShowMap] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<GeocodingResult | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !mapReady) {
      import('leaflet').then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
        setMapReady(true);
      });
    }
  }, [mapReady]);

  const handleSearch = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const result = await geocodeAddress(query);
      if (result) {
        setSearchResults([result]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue && inputValue !== value) {
        handleSearch(inputValue);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue, value, handleSearch]);

  const handleSelectResult = (result: GeocodingResult) => {
    setSelectedLocation(result);
    setInputValue(result.displayName.split(',')[0]);
    setSearchResults([]);
    onChange?.(result.displayName);
    onLocationChange?.(result);
  };

  const handleClear = () => {
    setInputValue('');
    setSelectedLocation(null);
    setSearchResults([]);
    onChange?.('');
    onLocationChange?.(null);
  };

  const mapCenter: [number, number] = selectedLocation
    ? [selectedLocation.latitude, selectedLocation.longitude]
    : [-25.4284, -49.2733];

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-xs font-bold text-slate-700">
        Local do Compromisso
      </label>

      <div className="relative">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          />
          {inputValue && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
            >
              <X size={16} />
            </button>
          )}
          {isSearching && (
            <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin z-10" />
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 z-50 max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSelectResult(result)}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-slate-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-rose-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {result.city || result.displayName.split(',')[0]}
                    </div>
                    <div className="text-xs text-slate-500">
                      {result.city && result.state ? `${result.city}, ${result.state}` : result.displayName}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedLocation && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMap(!showMap)}
              className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-blue-200"
            >
              <Navigation size={14} />
              {showMap ? 'Ocultar Mapa' : 'Ver no Mapa'}
            </button>

            <a
              href={generateGoogleMapsUrl(inputValue)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors"
            >
              Google Maps <ExternalLink size={12} />
            </a>

            <a
              href={generateWazeUrl(inputValue)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors"
            >
              Waze <ExternalLink size={12} />
            </a>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1">
            <div className="flex items-center gap-2 text-slate-600">
              <Navigation size={12} className="text-blue-600" />
              <span className="font-semibold">Coordenadas:</span>
              <span className="font-mono">
                {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </span>
            </div>
            {selectedLocation.city && (
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin size={12} className="text-rose-500" />
                <span>{selectedLocation.city}{selectedLocation.state ? `, ${selectedLocation.state}` : ''}</span>
              </div>
            )}
          </div>

          {showMap && mapReady && (
            <div className="rounded-xl overflow-hidden border border-slate-200 h-64">
              <MapContainer
                center={mapCenter}
                zoom={14}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[selectedLocation.latitude, selectedLocation.longitude]}>
                  <Popup>
                    <div className="text-sm">
                      <strong>{inputValue}</strong>
                      <br />
                      <span className="text-xs text-slate-600">
                        {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="openMapToggle"
          checked={showMap}
          onChange={(e) => setShowMap(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <label htmlFor="openMapToggle" className="text-xs text-slate-600 font-medium cursor-pointer">
          Sempre mostrar mapa do local
        </label>
      </div>
    </div>
  );
}
