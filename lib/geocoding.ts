// Geocoding utilities using OpenStreetMap's Nominatim (free, no API key required)

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
  type?: string;
  city?: string;
  state?: string;
  country?: string;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  if (!address || address.trim().length < 3) return null;

  try {
    const query = encodeURIComponent(`${address}, Brasil`);
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?q=${query}&format=json&limit=1&addressdetails=1&countrycodes=br`,
      {
        headers: {
          'User-Agent': 'DemocraciaDigital/1.0',
        },
      }
    );

    if (!response.ok) {
      console.error('Geocoding request failed:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    const result = data[0];
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
      type: result.type,
      city: result.address?.city || result.address?.town || result.address?.municipality,
      state: result.address?.state,
      country: result.address?.country,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'DemocraciaDigital/1.0',
        },
      }
    );

    if (!response.ok) {
      console.error('Reverse geocoding request failed:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data || data.error) {
      return null;
    }

    return {
      latitude: lat,
      longitude: lng,
      displayName: data.display_name,
      type: data.type,
      city: data.address?.city || data.address?.town || data.address?.municipality,
      state: data.address?.state,
      country: data.address?.country,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

export function generateGoogleMapsUrl(address: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
}

export function generateWazeUrl(address: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
}

export function generateOpenStreetMapUrl(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
