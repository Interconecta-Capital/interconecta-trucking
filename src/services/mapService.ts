
import mapboxgl from 'mapbox-gl';

// Mapbox access token - Usa tu clave pública de Mapbox
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHl6Y2xieWoxMGN1MnFyMHVuaGdvczJhIn0.5GrGKZrRvv6y4HwqgM8plw';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RoutePoint {
  coordinates: Coordinates;
  name: string;
  address: string;
}

export interface RouteResult {
  distance: number; // in kilometers
  duration: number; // in minutes
  geometry: any;
  points: RoutePoint[];
}

export interface GeocodeResult {
  coordinates: Coordinates;
  formattedAddress: string;
  confidence: number;
}

class MapService {
  private accessToken: string;

  constructor() {
    this.accessToken = MAPBOX_ACCESS_TOKEN;
    if (typeof window !== 'undefined') {
      mapboxgl.accessToken = this.accessToken;
    }
  }

  // Check if Mapbox token is configured
  isConfigured(): boolean {
    return this.accessToken.length > 0;
  }

  // Geocodificar una dirección a coordenadas
  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    if (!this.isConfigured()) {
      console.warn('Mapbox token not configured properly');
      return null;
    }

    try {
      console.log('🔍 Geocodificando dirección:', address);
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${this.accessToken}&country=mx&types=address,poi&limit=1`
      );

      if (!response.ok) {
        console.error('Error en geocodificación:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      console.log('📍 Respuesta de geocodificación:', data);
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const result = {
          coordinates: {
            lng: feature.center[0],
            lat: feature.center[1]
          },
          formattedAddress: feature.place_name,
          confidence: feature.relevance || 0.8
        };
        
        console.log('✅ Geocodificación exitosa:', result);
        return result;
      }

      console.log('❌ No se encontraron resultados para:', address);
      return null;
    } catch (error) {
      console.error('❌ Error en geocodificación:', error);
      return null;
    }
  }

  // Buscar direcciones con autocompletado
  async searchAddresses(query: string): Promise<GeocodeResult[]> {
    if (!this.isConfigured() || query.length < 3) {
      return [];
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${this.accessToken}&country=mx&types=address,poi&limit=5`
      );

      const data = await response.json();
      
      return data.features?.map((feature: any) => ({
        coordinates: {
          lng: feature.center[0],
          lat: feature.center[1]
        },
        formattedAddress: feature.place_name,
        confidence: feature.relevance || 0.8
      })) || [];
    } catch (error) {
      console.error('Error en búsqueda de direcciones:', error);
      return [];
    }
  }

  // Calcular ruta entre múltiples puntos
  async calculateRoute(points: Coordinates[]): Promise<RouteResult | null> {
    if (!this.isConfigured() || points.length < 2) {
      console.warn('No se puede calcular ruta: token no configurado o puntos insuficientes');
      return null;
    }

    try {
      console.log('🛣️ Calculando ruta entre puntos:', points);
      
      const waypoints = points.map(p => `${p.lng},${p.lat}`).join(';');
      
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}?geometries=geojson&overview=full&steps=true&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        console.error('Error en cálculo de ruta:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      console.log('🗺️ Respuesta de Mapbox Directions:', data);
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        const result = {
          distance: Math.round(route.distance / 1000 * 100) / 100, // km con 2 decimales
          duration: Math.round(route.duration / 60), // minutos
          geometry: route.geometry,
          points: points.map((coords, index) => ({
            coordinates: coords,
            name: `Punto ${index + 1}`,
            address: ''
          }))
        };
        
        console.log('✅ Ruta calculada exitosamente:', result);
        return result;
      }

      console.log('❌ No se pudo calcular la ruta');
      return null;
    } catch (error) {
      console.error('❌ Error calculando ruta:', error);
      return null;
    }
  }

  // Calcular matriz de distancias entre múltiples puntos
  async calculateDistanceMatrix(origins: Coordinates[], destinations: Coordinates[]): Promise<number[][]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const originCoords = origins.map(p => `${p.lng},${p.lat}`).join(';');
      const destCoords = destinations.map(p => `${p.lng},${p.lat}`).join(';');
      
      const response = await fetch(
        `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${originCoords};${destCoords}?access_token=${this.accessToken}`
      );

      const data = await response.json();
      
      if (data.distances) {
        // Convertir de metros a kilómetros
        return data.distances.map((row: number[]) => 
          row.map(distance => Math.round(distance / 1000 * 100) / 100)
        );
      }

      return [];
    } catch (error) {
      console.error('Error calculando matriz de distancias:', error);
      return [];
    }
  }

  // Optimizar orden de ubicaciones para ruta más eficiente
  async optimizeRoute(points: Coordinates[]): Promise<{ optimizedPoints: Coordinates[], totalDistance: number } | null> {
    if (!this.isConfigured() || points.length < 3) {
      return null;
    }

    try {
      const waypoints = points.map(p => `${p.lng},${p.lat}`).join(';');
      
      const response = await fetch(
        `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${waypoints}?roundtrip=false&source=first&destination=last&access_token=${this.accessToken}`
      );

      const data = await response.json();
      
      if (data.trips && data.trips.length > 0) {
        const trip = data.trips[0];
        const waypointOrder = trip.waypoint_order || [];
        
        const optimizedPoints = waypointOrder.map((index: number) => points[index]);
        
        return {
          optimizedPoints,
          totalDistance: Math.round(trip.distance / 1000 * 100) / 100
        };
      }

      return null;
    } catch (error) {
      console.error('Error optimizando ruta:', error);
      return null;
    }
  }

  // Validar que una dirección sea real
  async validateAddress(address: string): Promise<boolean> {
    const result = await this.geocodeAddress(address);
    return result !== null && result.confidence > 0.6;
  }
}

export const mapService = new MapService();
