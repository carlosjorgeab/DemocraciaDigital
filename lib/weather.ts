// Weather API utilities using Open-Meteo (free, no API key required)

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon: string;
  isDay: boolean;
  precipitation: number;
  cloudCover: number;
  visibility: number;
  uvIndex: number;
}

export interface WeatherForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon: string;
  precipitationSum: number;
  precipitationProbability: number;
  windSpeedMax: number;
  sunrise: string;
  sunset: string;
}

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export const WEATHER_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: 'Céu limpo', icon: '☀️' },
  1: { description: 'Predominantemente limpo', icon: '🌤️' },
  2: { description: 'Parcialmente nublado', icon: '⛅' },
  3: { description: 'Nublado', icon: '☁️' },
  45: { description: 'Névoa', icon: '🌫️' },
  48: { description: 'Névoa gelada', icon: '🌫️' },
  51: { description: 'Garoa leve', icon: '🌧️' },
  53: { description: 'Garoa moderada', icon: '🌧️' },
  55: { description: 'Garoa densa', icon: '🌧️' },
  56: { description: 'Garoa gelada leve', icon: '🌧️' },
  57: { description: 'Garoa gelada densa', icon: '🌧️' },
  61: { description: 'Chuva leve', icon: '🌧️' },
  63: { description: 'Chuva moderada', icon: '🌧️' },
  65: { description: 'Chuva forte', icon: '🌧️' },
  66: { description: 'Chuva gelada leve', icon: '🌧️' },
  67: { description: 'Chuva gelada forte', icon: '🌧️' },
  71: { description: 'Neve leve', icon: '🌨️' },
  73: { description: 'Neve moderada', icon: '🌨️' },
  75: { description: 'Neve forte', icon: '❄️' },
  77: { description: 'Grãos de neve', icon: '🌨️' },
  80: { description: 'Pancadas de chuva leves', icon: '🌦️' },
  81: { description: 'Pancadas de chuva moderadas', icon: '🌦️' },
  82: { description: 'Pancadas de chuva violentas', icon: '⛈️' },
  85: { description: 'Pancadas de neve leves', icon: '🌨️' },
  86: { description: 'Pancadas de neve fortes', icon: '❄️' },
  95: { description: 'Tempestade', icon: '⛈️' },
  96: { description: 'Tempestade com granizo leve', icon: '⛈️' },
  99: { description: 'Tempestade com granizo forte', icon: '⛈️' },
};

export function getWeatherDescription(code: number): { description: string; icon: string } {
  return WEATHER_CODES[code] || { description: 'Desconhecido', icon: '❓' };
}

export async function getCurrentWeather(lat: number, lng: number): Promise<WeatherData | null> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,is_day,precipitation,cloud_cover,visibility,uv_index',
      timezone: 'America/Sao_Paulo',
    });

    const response = await fetch(`${OPEN_METEO_BASE_URL}?${params}`);

    if (!response.ok) {
      console.error('Weather API request failed:', response.status);
      return null;
    }

    const data = await response.json();
    const current = data.current;

    if (!current) return null;

    const weatherInfo = getWeatherDescription(current.weather_code);

    return {
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      weatherCode: current.weather_code,
      weatherDescription: weatherInfo.description,
      weatherIcon: weatherInfo.icon,
      isDay: current.is_day === 1,
      precipitation: current.precipitation,
      cloudCover: current.cloud_cover,
      visibility: current.visibility,
      uvIndex: current.uv_index,
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
}

export async function getWeatherForecast(lat: number, lng: number, days: number = 7): Promise<WeatherForecast[] | null> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset',
      timezone: 'America/Sao_Paulo',
      forecast_days: Math.min(days, 16).toString(),
    });

    const response = await fetch(`${OPEN_METEO_BASE_URL}?${params}`);

    if (!response.ok) {
      console.error('Weather forecast API request failed:', response.status);
      return null;
    }

    const data = await response.json();
    const daily = data.daily;

    if (!daily) return null;

    return daily.time.map((date: string, index: number) => {
      const weatherInfo = getWeatherDescription(daily.weather_code[index]);
      return {
        date,
        tempMax: daily.temperature_2m_max[index],
        tempMin: daily.temperature_2m_min[index],
        weatherCode: daily.weather_code[index],
        weatherDescription: weatherInfo.description,
        weatherIcon: weatherInfo.icon,
        precipitationSum: daily.precipitation_sum[index],
        precipitationProbability: daily.precipitation_probability_max[index],
        windSpeedMax: daily.wind_speed_10m_max[index],
        sunrise: daily.sunrise[index],
        sunset: daily.sunset[index],
      };
    });
  } catch (error) {
    console.error('Weather forecast fetch error:', error);
    return null;
  }
}

export function getWeatherBackground(weatherCode: number): string {
  if (weatherCode === 0) return 'from-amber-50 to-blue-50';
  if (weatherCode <= 3) return 'from-blue-50 to-slate-50';
  if (weatherCode >= 61 && weatherCode <= 67) return 'from-blue-100 to-slate-50';
  if (weatherCode >= 71 && weatherCode <= 77) return 'from-slate-50 to-blue-50';
  if (weatherCode >= 80 && weatherCode <= 82) return 'from-blue-100 to-slate-50';
  if (weatherCode >= 95) return 'from-slate-100 to-slate-200';
  return 'from-slate-50 to-slate-100';
}

export function getWindDirectionLabel(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export function formatTemperature(temp: number): string {
  return `${Math.round(temp)}°C`;
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
