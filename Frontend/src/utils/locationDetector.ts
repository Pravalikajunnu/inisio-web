export interface DetectedLocation {
  city?: string;
  state?: string;
  country?: string;
  formattedLocation: string;
  latitude?: number;
  longitude?: number;
  source: 'browser' | 'ip' | 'default';
}

let cachedLocation: DetectedLocation | null = null;

export async function detectUserLocation(): Promise<DetectedLocation> {
  if (cachedLocation) {
    return cachedLocation;
  }

  // 1. Try silent IP lookup first (no permission popup required)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch('https://ipapi.co/json/', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const city = data.city || '';
      const region = data.region || data.region_code || '';
      const country = data.country_name || 'India';
      const formatted = [city, region].filter(Boolean).join(', ') || country;

      cachedLocation = {
        city,
        state: region,
        country,
        formattedLocation: formatted,
        latitude: data.latitude,
        longitude: data.longitude,
        source: 'ip'
      };
      return cachedLocation;
    }
  } catch (e) {
    // Silently fall back
  }

  // 2. Try browser geolocation if available and already granted or non-blocking
  if (typeof window !== 'undefined' && 'geolocation' in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 4000,
          maximumAge: 600000,
          enableHighAccuracy: false
        });
      });

      cachedLocation = {
        formattedLocation: 'India (Detected Location)',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        source: 'browser'
      };
      return cachedLocation;
    } catch (e) {
      // Permission denied or timed out
    }
  }

  // Default fallback
  cachedLocation = {
    city: 'Hyderabad / Mumbai',
    state: 'Telangana / Maharashtra',
    country: 'India',
    formattedLocation: 'India',
    source: 'default'
  };

  return cachedLocation;
}
