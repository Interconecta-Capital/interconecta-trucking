
import { useToast } from '@/hooks/use-toast';

// Mapbox API Key from the user's message
const MAPBOX_API_KEY = 'pk.eyJ1IjoiaW50ZXJjb25lY3RhIiwiYSI6ImNtYndqcWFyajExYTIya3B1NG1oaXJ2YjIifQ.OVtTgnmv6ZA3En2trhim-Q';

interface Coordinates {
  lat: number;
  lng: number;
}

interface DistanceResult {
  distance: number; // in kilometers
  duration: number; // in seconds
  route?: any;
}

interface MapboxResponse {
  routes: Array<{
    distance: number;
    duration: number;
    geometry: any;
  }>;
  code: string;
  message?: string;
}

export class MapboxDistanceService {
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

  private static buildMapboxUrl(origin: Coordinates, destination: Coordinates): string {
    const baseUrl = 'https://api.mapbox.com/directions/v5/mapbox/driving';
    const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    const params = new URLSearchParams({
      access_token: MAPBOX_API_KEY,
      geometries: 'geojson',
      overview: 'simplified'
    });

    return `${baseUrl}/${coordinates}?${params.toString()}`;
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

    // Construir URL de la API
    const url = this.buildMapboxUrl(origin, destination);
    console.log('[MapboxDistanceService] URL de Mapbox:', url.replace(MAPBOX_API_KEY, '***'));

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('[MapboxDistanceService] Status de respuesta:', response.status);

      if (!response.ok) {
        await this.handleMapboxError(response);
        return { distance: 0, duration: 0 };
      }

      const data: MapboxResponse = await response.json();
      console.log('[MapboxDistanceService] Respuesta de Mapbox:', data);

      if (data.code !== 'Ok') {
        throw new Error(`Error de Mapbox: ${data.message || data.code}`);
      }

      if (!data.routes || data.routes.length === 0) {
        throw new Error('No se encontraron rutas disponibles');
      }

      const route = data.routes[0];
      const result: DistanceResult = {
        distance: Math.round((route.distance / 1000) * 100) / 100, // Convertir a km con 2 decimales
        duration: Math.round(route.duration), // Segundos
        route: route.geometry
      };

      console.log('✅ [MapboxDistanceService] Distancia calculada:', result);
      return result;

    } catch (error) {
      console.error('❌ [MapboxDistanceService] Error calculando distancia:', error);
      throw error;
    }
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

    // Sugerencias específicas según el tipo de error
    switch (errorType) {
      case 'auth':
        console.log('💡 [MapboxDistanceService] Sugerencia: Verifique que la API Key de Mapbox esté correctamente configurada');
        break;
      case 'forbidden':
        console.log('💡 [MapboxDistanceService] Sugerencia: Verifique las restricciones de URL en el dashboard de Mapbox');
        break;
      case 'rate_limit':
        console.log('💡 [MapboxDistanceService] Sugerencia: Considere upgrading el plan de Mapbox o implementar cache');
        break;
      case 'invalid_data':
        console.log('💡 [MapboxDistanceService] Sugerencia: Valide que las coordenadas estén en formato correcto (lat, lng)');
        break;
    }

    throw new Error(errorMessage);
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
      }
    };
  }
}
