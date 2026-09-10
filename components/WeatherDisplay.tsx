'use client';

import { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, Eye, Sun, CloudRain, Snowflake, Zap, Thermometer } from 'lucide-react';
import { WeatherData, getCurrentWeather, getWeatherBackground, getWindDirectionLabel, formatTemperature } from '@/lib/weather';

interface WeatherDisplayProps {
  latitude: number;
  longitude: number;
  city?: string;
  compact?: boolean;
  onWeatherLoad?: (weather: WeatherData | null) => void;
}

export default function WeatherDisplay({
  latitude,
  longitude,
  city,
  compact = false,
  onWeatherLoad,
}: WeatherDisplayProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchWeather() {
      if (!latitude || !longitude) {
        setLoading(false);
        setError('Coordenadas não disponíveis');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getCurrentWeather(latitude, longitude);
        if (mounted) {
          setWeather(data);
          onWeatherLoad?.(data);
        }
      } catch (err) {
        if (mounted) {
          setError('Erro ao carregar previsão do tempo');
          onWeatherLoad?.(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchWeather();

    return () => {
      mounted = false;
    };
  }, [latitude, longitude, onWeatherLoad]);

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-3 flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
        <Cloud className="animate-pulse text-slate-400" size={compact ? 14 : 18} />
        <span className="text-slate-500 font-medium">Carregando clima...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className={`bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-3 ${compact ? 'text-xs' : 'text-sm'}`}>
        <div className="flex items-center gap-2">
          <Cloud className="text-slate-400" size={compact ? 14 : 18} />
          <span className="text-slate-500 font-medium">
            {error || 'Clima indisponível'}
          </span>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`bg-gradient-to-br ${getWeatherBackground(weather.weatherCode)} rounded-xl p-2.5 flex items-center gap-3 shadow-sm`}>
        <span className="text-2xl">{weather.weatherIcon}</span>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Thermometer size={12} className="text-slate-600" />
            <span className="font-black text-slate-900">{formatTemperature(weather.temperature)}</span>
          </div>
          <div className="text-[10px] text-slate-600 font-medium">{weather.weatherDescription}</div>
        </div>
        {city && (
          <div className="ml-auto text-[10px] text-slate-500 font-medium">{city}</div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br ${getWeatherBackground(weather.weatherCode)} rounded-2xl p-4 shadow-sm border border-white/50`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{weather.weatherIcon}</span>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">{formatTemperature(weather.temperature)}</span>
              <span className="text-sm text-slate-600 font-medium">sensação {formatTemperature(weather.feelsLike)}</span>
            </div>
            <div className="text-sm text-slate-700 font-semibold">{weather.weatherDescription}</div>
            {city && <div className="text-xs text-slate-500 font-medium">{city}</div>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/30">
        <div className="flex items-center gap-2">
          <Droplets size={16} className="text-blue-500" />
          <div>
            <div className="text-xs text-slate-500">Umidade</div>
            <div className="text-sm font-bold text-slate-800">{weather.humidity}%</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Wind size={16} className="text-slate-500" />
          <div>
            <div className="text-xs text-slate-500">Vento</div>
            <div className="text-sm font-bold text-slate-800">
              {weather.windSpeed.toFixed(1)} km/h {getWindDirectionLabel(weather.windDirection)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Eye size={16} className="text-slate-400" />
          <div>
            <div className="text-xs text-slate-500">Visibilidade</div>
            <div className="text-sm font-bold text-slate-800">{(weather.visibility / 1000).toFixed(1)} km</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Sun size={16} className="text-amber-500" />
          <div>
            <div className="text-xs text-slate-500">Índice UV</div>
            <div className="text-sm font-bold text-slate-800">{weather.uvIndex.toFixed(1)}</div>
          </div>
        </div>
      </div>

      {weather.precipitation > 0 && (
        <div className="mt-3 flex items-center gap-2 bg-blue-100/50 rounded-lg px-3 py-2">
          <CloudRain size={16} className="text-blue-600" />
          <span className="text-xs font-semibold text-blue-800">
            Precipitação: {weather.precipitation.toFixed(1)} mm
          </span>
        </div>
      )}
    </div>
  );
}
