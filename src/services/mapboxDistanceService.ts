
import { useToast } from '@/hooks/use-toast';

// Mapbox API Key - debe estar configurada en las variables de entorno
const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiaW50ZXJjb25lY3RhIiwiYSI6ImNtYndqcWFyajExYTIya3B1NG1oaXJ2YjIifQ.OVtTgnmv6ZA3En2trhim-Q';

interface Coordinates {
  lat: number;
  lng: number;
}

interface DistanceResult {
  distance: number; // in kilometers
  duration: number; // in seconds
  route?: any;
  geometry?: any;
}

interface MapboxDirectionsResponse {
  routes: Array<{
    distance: number;
    duration: number;
    geometry: any;
    legs: Array<{
      distance: number;
      duration: number;
    }>;
  }>;
  code: string;
  message?: string;
}

interface GeocodeResult {
  coordinates: Coordinates;
  formattedAddress: string;
  addressComponents: {
    codigoPostal?: string;
    estado?: string;
    municipio?: string;
    colonia?: string;
    calle?: string;
    pais?: string;
  };
  confidence: number;
}

interface MapboxGeocodeResponse {
  features: Array<{
    place_name: string;
    center: [number, number];
    properties: any;
    context: Array<{
      id: string;
      text: string;
    }>;
    relevance: number;
  }>;
}

export class MapboxDistanceService {
  private static cache = new Map<string, DistanceResult>();
  private static geocodeCache = new Map<string, GeocodeResult>();

  private static validateCoordinates(coords: Coordinates): boolean {
    return (
      coords &&
      typeof coords.lat === 'number' &&
      typeof coords.lng === 'number' &&
      coords.lat >= -90 &&
      coords.lat <= 90 &&
      coords.lng >= -180 &&
      coords.lng <= 180 &&
      !isNaN(coords.lat) &&
      !isNaN(coords.lng)
    );
  }

  private static buildDirectionsUrl(waypoints: Coordinates[]): string {
    const baseUrl = 'https://api.mapbox.com/directions/v5/mapbox/driving';
    const coordinates = waypoints.map(point => `${point.lng},${point.lat}`).join(';');
    const params = new URLSearchParams({
      access_token: MAPBOX_API_KEY,
      geometries: 'geojson',
      overview: 'full',
      steps: 'false',
      alternatives: 'false'
    });

    return `${baseUrl}/${coordinates}?${params.toString()}`;
  }

  private static buildGeocodeUrl(address: string): string {
    const baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
    const encodedAddress = encodeURIComponent(address);
    const params = new URLSearchParams({
      access_token: MAPBOX_API_KEY,
      country: 'mx', // Limitar a México
      language: 'es',
      limit: '5',
      types: 'address,poi'
    });

    return `${baseUrl}/${encodedAddress}.json?${params.toString()}`;
  }

  static async calculateDistance(
    origin: Coordinates,
    destination: Coordinates
  ): Promise<DistanceResult> {
    console.log('[MapboxDistanceService] Calculando distancia...', {
      origen: origin,
      destino: destination
    });

    // Validar coordenadas de entrada
    if (!this.validateCoordinates(origin)) {
      throw new Error('Coordenadas de origen inválidas');
    }

    if (!this.validateCoordinates(destination)) {
      throw new Error('Coordenadas de destino inválidas');
    }

    // Verificar cache
    const cacheKey = `${origin.lat},${origin.lng}-${destination.lat},${destination.lng}`;
    if (this.cache.has(cacheKey)) {
      console.log('[MapboxDistanceService] Resultado obtenido del cache');
      return this.cache.get(cacheKey)!;
    }

    try {
      const result = await this.calculateRoute([origin, destination]);
      
      // Guardar en cache
      this.cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('❌ [MapboxDistanceService] Error calculando distancia:', error);
      throw error;
    }
  }

  static async calculateRoute(waypoints: Coordinates[]): Promise<DistanceResult> {
    if (waypoints.length < 2) {
      throw new Error('Se requieren al menos 2 puntos para calcular la ruta');
    }

    // Validar todas las coordenadas
    for (const point of waypoints) {
      if (!this.validateCoordinates(point)) {
        throw new Error(`Coordenadas inválidas: ${JSON.stringify(point)}`);
      }
    }

    const url = this.buildDirectionsUrl(waypoints);
    console.log('[MapboxDistanceService] URL de Directions API:', url.replace(MAPBOX_API_KEY, '***'));

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        await this.handleMapboxError(response);
        throw new Error(`Error HTTP ${response.status}`);
      }

      const data: MapboxDirectionsResponse = await response.json();
      console.log('[MapboxDistanceService] Respuesta de Directions API:', data);

      if (data.code !== 'Ok') {
        throw new Error(`Error de Mapbox Directions: ${data.message || data.code}`);
      }

      if (!data.routes || data.routes.length === 0) {
        throw new Error('No se encontraron rutas disponibles');
      }

      const route = data.routes[0];
      const result: DistanceResult = {
        distance: Math.round((route.distance / 1000) * 100) / 100, // Convertir a km con 2 decimales
        duration: Math.round(route.duration), // Segundos
        route: route,
        geometry: route.geometry
      };

      console.log('✅ [MapboxDistanceService] Ruta calculada:', result);
      return result;

    } catch (error) {
      console.error('❌ [MapboxDistanceService] Error calculando ruta:', error);
      throw error;
    }
  }

  static async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    if (!address || address.trim().length < 4) {
      console.log('[MapboxDistanceService] Dirección muy corta para geocodificar');
      return null;
    }

    // Verificar cache
    const cacheKey = address.toLowerCase().trim();
    if (this.geocodeCache.has(cacheKey)) {
      console.log('[MapboxDistanceService] Geocodificación obtenida del cache');
      return this.geocodeCache.get(cacheKey)!;
    }

    const url = this.buildGeocodeUrl(address);
    console.log('[MapboxDistanceService] URL de Geocoding API:', url.replace(MAPBOX_API_KEY, '***'));

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        await this.handleMapboxError(response);
        return null;
      }

      const data: MapboxGeocodeResponse = await response.json();
      console.log('[MapboxDistanceService] Respuesta de Geocoding API:', data);

      if (!data.features || data.features.length === 0) {
        console.log('[MapboxDistanceService] No se encontraron resultados de geocodificación');
        return null;
      }

      // Tomar el primer resultado (más relevante)
      const feature = data.features[0];
      const result: GeocodeResult = {
        coordinates: {
          lat: feature.center[1],
          lng: feature.center[0]
        },
        formattedAddress: feature.place_name,
        addressComponents: this.parseAddressComponents(feature),
        confidence: feature.relevance || 0.5
      };

      // Guardar en cache
      this.geocodeCache.set(cacheKey, result);

      console.log('✅ [MapboxDistanceService] Dirección geocodificada:', result);
      return result;

    } catch (error) {
      console.error('❌ [MapboxDistanceService] Error en geocodificación:', error);
      return null;
    }
  }

  static async searchAddresses(query: string): Promise<GeocodeResult[]> {
    if (!query || query.trim().length < 3) {
      return [];
    }

    try {
      const result = await this.geocodeAddress(query);
      return result ? [result] : [];
    } catch (error) {
      console.error('❌ [MapboxDistanceService] Error buscando direcciones:', error);
      return [];
    }
  }

  private static parseAddressComponents(feature: any): GeocodeResult['addressComponents'] {
    const components: GeocodeResult['addressComponents'] = {};
    
    // Extraer componentes del contexto de Mapbox
    if (feature.context) {
      for (const item of feature.context) {
        if (item.id.includes('postcode')) {
          components.codigoPostal = item.text;
        } else if (item.id.includes('place')) {
          components.municipio = item.text;
        } else if (item.id.includes('region')) {
          components.estado = item.text;
        } else if (item.id.includes('country')) {
          components.pais = item.text;
        }
      }
    }

    // Extraer calle del place_name
    const addressParts = feature.place_name.split(',');
    if (addressParts.length > 0) {
      components.calle = addressParts[0].trim();
    }

    return components;
  }

  private static async handleMapboxError(response: Response): Promise<void> {
    let errorMessage = `Error ${response.status}`;
    let errorType = 'unknown';

    switch (response.status) {
      case 401:
        errorMessage = 'API Key de Mapbox inválida o expirada';
        errorType = 'auth';
        break;
      case 403:
        errorMessage = 'Acceso denegado a la API de Mapbox. Verifique las restricciones de dominio';
        errorType = 'forbidden';
        break;
      case 429:
        errorMessage = 'Límite de solicitudes excedido. Intente más tarde';
        errorType = 'rate_limit';
        break;
      case 422:
        errorMessage = 'Coordenadas inválidas o fuera de rango';
        errorType = 'invalid_data';
        break;
      default:
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Si no se puede parsear el JSON, usar mensaje por defecto
        }
    }

    console.error(`❌ [MapboxDistanceService] ${errorType}:`, errorMessage);
    throw new Error(errorMessage);
  }

  // Limpiar cache cuando sea necesario
  static clearCache(): void {
    this.cache.clear();
    this.geocodeCache.clear();
    console.log('🗑️ [MapboxDistanceService] Cache limpiado');
  }

  // Función helper para usar con react hook
  static useDistanceCalculation() {
    const { toast } = useToast();

    return {
      calculateDistance: async (origin: Coordinates, destination: Coordinates) => {
        try {
          return await MapboxDistanceService.calculateDistance(origin, destination);
        } catch (error: any) {
          console.error('Error en cálculo de distancia:', error);
          
          toast({
            title: "Error calculando distancia",
            description: error.message || "No se pudo calcular la distancia",
            variant: "destructive",
          });
          
          // Retornar valores por defecto en caso de error
          return { distance: 0, duration: 0 };
        }
      },
      geocodeAddress: async (address: string) => {
        try {
          return await MapboxDistanceService.geocodeAddress(address);
        } catch (error: any) {
          console.error('Error en geocodificación:', error);
          
          toast({
            title: "Error buscando dirección",
            description: error.message || "No se pudo encontrar la dirección",
            variant: "destructive",
          });
          
          return null;
        }
      }
    };
  }
}
