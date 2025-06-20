
interface Coordinates {
  lat: number;
  lng: number;
}

interface RouteResult {
  distance_km: number;
  duration_minutes: number;
  route_geometry: {
    type: string;
    coordinates: string; // Google's encoded polyline
  };
  google_data?: {
    polyline: string;
    bounds: any;
    legs: any[];
  };
  success: boolean;
  fallback?: boolean;
  fallback_reason?: string;
}

class GoogleMapsService {
  private supabase: any;

  constructor() {
    // Import supabase client
    import('@/integrations/supabase/client').then(({ supabase }) => {
      this.supabase = supabase;
    });
  }

  async calculateRoute(
    origin: Coordinates,
    destination: Coordinates,
    waypoints?: Coordinates[]
  ): Promise<RouteResult | null> {
    try {
      console.log('🚀 Calculating route with Google Maps');
      
      if (!this.supabase) {
        const { supabase } = await import('@/integrations/supabase/client');
        this.supabase = supabase;
      }

      const { data, error } = await this.supabase.functions.invoke('google-directions', {
        body: {
          origin,
          destination,
          waypoints
        }
      });

      if (error) {
        console.error('❌ Error calling google-directions function:', error);
        
        // If we get a function error, return null so the hybrid system can use fallbacks
        console.log('⚠️ Google Maps service unavailable, will use fallback calculation');
        return null;
      }

      if (!data) {
        console.error('❌ No data received from google-directions function');
        return null;
      }

      // Check if the response indicates success (including fallback responses)
      if (!data.success) {
        console.error('❌ Google directions function returned failure:', data.error);
        return null;
      }

      // Log whether this is a fallback response
      if (data.fallback) {
        console.log('⚠️ Using fallback calculation from Google service:', data.fallback_reason);
      } else {
        console.log('✅ Route calculated successfully with Google Maps');
      }

      return data;
    } catch (error) {
      console.error('❌ Error in GoogleMapsService:', error);
      return null;
    }
  }

  // Geocoding using Google Maps Geocoding API (for future use)
  async geocodeAddress(address: string): Promise<Coordinates | null> {
    try {
      // For now, return mock coordinates based on postal code
      // This can be enhanced with actual Google Geocoding API
      const cpMap: { [key: string]: Coordinates } = {
        '01000': { lat: 19.4326, lng: -99.1332 }, // CDMX Centro
        '03100': { lat: 19.3927, lng: -99.1588 }, // Del Valle
        '06700': { lat: 19.4284, lng: -99.1676 }, // Roma Norte
        '11000': { lat: 19.4069, lng: -99.1716 }, // San Miguel Chapultepec
        '62577': { lat: 18.8711, lng: -99.2211 }, // Jiutepec, Morelos
        '22000': { lat: 32.5149, lng: -117.0382 }, // Tijuana, BC
      };

      // Extract postal code from address
      const cpMatch = address.match(/\b\d{5}\b/);
      if (cpMatch) {
        const cp = cpMatch[0];
        return cpMap[cp] || { lat: 19.4326, lng: -99.1332 };
      }

      return { lat: 19.4326, lng: -99.1332 }; // Default Mexico City
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }
}

export const googleMapsService = new GoogleMapsService();
