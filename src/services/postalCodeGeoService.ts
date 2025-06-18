const GEO_API_KEY = import.meta.env.VITE_GEO_API_KEY || '';

export interface PostalCodeCoordinates {
  lat: number;
  lng: number;
}

class PostalCodeGeoService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async getCoordinates(postalCode: string): Promise<PostalCodeCoordinates | null> {
    if (!this.isConfigured()) return null;

    try {
      const resp = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(postalCode)}&key=${this.apiKey}`
      );

      if (!resp.ok) return null;

      const data = await resp.json();
      const result = data.results && data.results[0];
      if (result && result.geometry && result.geometry.location) {
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        };
      }
    } catch (err) {
      console.error('Geolocation API error:', err);
    }

    return null;
  }
}

export const postalCodeGeoService = new PostalCodeGeoService(GEO_API_KEY);
