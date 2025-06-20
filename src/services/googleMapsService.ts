
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
      console.log('🚀 Calculating route with Google Maps API');
      console.log('📍 Origin:', origin);
      console.log('📍 Destination:', destination);
      
      if (!this.supabase) {
        const { supabase } = await import('@/integrations/supabase/client');
        this.supabase = supabase;
      }

      const { data, error } = await this.supabase.functions.invoke('google-directions', {
        body: {
          origin,
          destination,
          waypoints: waypoints || []
        }
      });

      if (error) {
        console.error('❌ Error calling google-directions function:', error);
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

  // Geocoding using Google Maps Geocoding API
  async geocodeAddress(address: string): Promise<Coordinates | null> {
    try {
      console.log('🗺️ Geocoding address:', address);
      
      if (!this.supabase) {
        const { supabase } = await import('@/integrations/supabase/client');
        this.supabase = supabase;
      }

      // Call a new geocoding function
      const { data, error } = await this.supabase.functions.invoke('google-geocoding', {
        body: { address }
      });

      if (error || !data?.success) {
        console.warn('⚠️ Geocoding failed, using fallback coordinates');
        return this.getFallbackCoordinates(address);
      }

      return data.coordinates;
    } catch (error) {
      console.error('❌ Error geocoding address:', error);
      return this.getFallbackCoordinates(address);
    }
  }

  private getFallbackCoordinates(address: string): Coordinates {
    // Extract postal code from address for better fallback
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
  }

  // Validate Google Maps API configuration
  async validateConfiguration(): Promise<boolean> {
    try {
      if (!this.supabase) {
        const { supabase } = await import('@/integrations/supabase/client');
        this.supabase = supabase;
      }

      // Test with a simple route calculation
      const testResult = await this.calculateRoute(
        { lat: 19.4326, lng: -99.1332 }, // Mexico City
        { lat: 19.3927, lng: -99.1588 }  // Del Valle
      );

      return testResult !== null;
    } catch (error) {
      console.error('❌ Google Maps configuration validation failed:', error);
      return false;
    }
  }
}

export const googleMapsService = new GoogleMapsService();
