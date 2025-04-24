const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org';
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface GeocodeResult {
  lat: number;
  lon: number;
}

interface GeocodeCache {
  [key: string]: {
    coordinates: GeocodeResult;
    timestamp: number;
  };
}

let lastRequestTime = 0;
const geocodeCache: GeocodeCache = {};

export const geocodeLocation = async (location: string): Promise<GeocodeResult | null> => {
  try {
    // Check cache first
    const cachedResult = geocodeCache[location];
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_EXPIRY) {
      return cachedResult.coordinates;
    }

    // Implement rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
    }
    lastRequestTime = Date.now();

    const url = `${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(location)}&limit=1&countrycodes=us`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RVR-App/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const coordinates: GeocodeResult = {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
      
      // Update cache
      geocodeCache[location] = {
        coordinates,
        timestamp: Date.now()
      };
      
      return coordinates;
    }
    return null;
  } catch (error) {
    console.error('Error in geocodeLocation:', error);
    return null;
  }
}; 