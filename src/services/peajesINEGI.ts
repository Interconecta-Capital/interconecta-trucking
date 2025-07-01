
interface Coordenada {
  lat: number;
  lng: number;
}

interface CasetaPeaje {
  nombre: string;
  ubicacion: Coordenada;
  costo: number;
  metodoPago: 'efectivo' | 'tag' | 'ambos';
  configuraciones: {
    [key: string]: number; // C2, C3, T3S2, etc.
  };
}

interface CalculoPeajesINEGI {
  ruta: {
    origen: Coordenada;
    destino: Coordenada;
    waypoints?: Coordenada[];
  };
  vehiculo: {
    configuracion: 'C2' | 'C3' | 'T2S1' | 'T3S2' | 'T3S3';
    ejes: number;
    peso: number;
  };
  respuesta: {
    casetas: CasetaPeaje[];
    costoTotal: number;
    distanciaTotal: number;
    tiempoEstimado: number;
    rutaOptimizada: boolean;
  };
}

interface RespuestaSAKBE {
  success: boolean;
  data?: {
    route: {
      distance: number;
      duration: number;
      tolls: Array<{
        name: string;
        location: { lat: number; lng: number };
        cost_by_vehicle: {
          [key: string]: number;
        };
        payment_methods: string[];
      }>;
    };
  };
  error?: string;
}

class PeajesINEGIService {
  private baseURL = 'https://www.inegi.org.mx/servicios/Ruteo';
  private cache = new Map<string, { data: CalculoPeajesINEGI['respuesta']; timestamp: number }>();
  private cacheTimeout = 24 * 60 * 60 * 1000; // 24 horas

  private generateCacheKey(origen: Coordenada, destino: Coordenada, configuracion: string): string {
    return `${origen.lat},${origen.lng}-${destino.lat},${destino.lng}-${configuracion}`;
  }

  private mapConfiguracionToAPI(configuracion: string): string {
    const mapping: { [key: string]: string } = {
      'C2': 'camion_2_ejes',
      'C3': 'camion_3_ejes',
      'T2S1': 'tracto_3_ejes',
      'T3S2': 'tracto_5_ejes',
      'T3S3': 'tracto_6_ejes'
    };
    return mapping[configuracion] || 'tracto_5_ejes';
  }

  private calculateFallbackTolls(distancia: number, configuracion: string): number {
    // Cálculo de respaldo basado en promedios nacionales
    const factorPorKm = 2.80; // MXN por km promedio
    const factorVehicular: { [key: string]: number } = {
      'C2': 1.0,
      'C3': 1.5,
      'T2S1': 1.8,
      'T3S2': 2.0,
      'T3S3': 2.2
    };

    const factor = factorVehicular[configuracion] || 2.0;
    return Math.round(distancia * factorPorKm * factor);
  }

  async calcularPeajesRuta(
    origen: Coordenada,
    destino: Coordenada,
    configuracion: 'C2' | 'C3' | 'T2S1' | 'T3S2' | 'T3S3',
    waypoints?: Coordenada[]
  ): Promise<CalculoPeajesINEGI['respuesta']> {
    const cacheKey = this.generateCacheKey(origen, destino, configuracion);
    
    // Verificar cache
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      console.log('Peajes: Usando datos del cache');
      return cached.data;
    }

    try {
      // Intentar API SAKBE/INEGI
      const resultado = await this.llamarAPISAKBE(origen, destino, configuracion, waypoints);
      
      // Guardar en cache
      this.cache.set(cacheKey, {
        data: resultado,
        timestamp: Date.now()
      });

      return resultado;
    } catch (error) {
      console.warn('Error al consultar API SAKBE, usando cálculo de respaldo:', error);
      
      // Calcular distancia estimada para fallback
      const distanciaEstimada = this.calcularDistanciaHaversine(origen, destino);
      const costoFallback = this.calculateFallbackTolls(distanciaEstimada, configuracion);

      return {
        casetas: [],
        costoTotal: costoFallback,
        distanciaTotal: distanciaEstimada,
        tiempoEstimado: Math.round(distanciaEstimada / 60), // 60 km/h promedio
        rutaOptimizada: false
      };
    }
  }

  private async llamarAPISAKBE(
    origen: Coordenada,
    destino: Coordenada,
    configuracion: string,
    waypoints?: Coordenada[]
  ): Promise<CalculoPeajesINEGI['respuesta']> {
    const params = new URLSearchParams({
      origen: `${origen.lat},${origen.lng}`,
      destino: `${destino.lat},${destino.lng}`,
      vehiculo: this.mapConfiguracionToAPI(configuracion),
      incluir_peajes: 'true',
      optimizar_ruta: 'true'
    });

    if (waypoints && waypoints.length > 0) {
      params.append('waypoints', waypoints.map(w => `${w.lat},${w.lng}`).join('|'));
    }

    const response = await fetch(`${this.baseURL}/calcular?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TransporteApp/1.0'
      },
      timeout: 10000 // 10 segundos timeout
    });

    if (!response.ok) {
      throw new Error(`API SAKBE error: ${response.status}`);
    }

    const data: RespuestaSAKBE = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error('Respuesta inválida de API SAKBE');
    }

    // Procesar respuesta
    const casetas: CasetaPeaje[] = data.data.route.tolls.map(toll => ({
      nombre: toll.name,
      ubicacion: toll.location,
      costo: toll.cost_by_vehicle[this.mapConfiguracionToAPI(configuracion)] || 0,
      metodoPago: toll.payment_methods.includes('tag') ? 'ambos' : 'efectivo',
      configuraciones: toll.cost_by_vehicle
    }));

    const costoTotal = casetas.reduce((sum, caseta) => sum + caseta.costo, 0);

    return {
      casetas,
      costoTotal,
      distanciaTotal: data.data.route.distance,
      tiempoEstimado: Math.round(data.data.route.duration / 60), // convertir a minutos
      rutaOptimizada: true
    };
  }

  private calcularDistanciaHaversine(origen: Coordenada, destino: Coordenada): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(destino.lat - origen.lat);
    const dLon = this.deg2rad(destino.lng - origen.lng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(origen.lat)) * Math.cos(this.deg2rad(destino.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Método para limpiar cache manualmente
  limpiarCache(): void {
    this.cache.clear();
  }

  // Método para obtener estadísticas de cache
  getEstadisticasCache(): { entradas: number; ultimaActualizacion: number | null } {
    let ultimaActualizacion = null;
    for (const [, value] of this.cache) {
      if (!ultimaActualizacion || value.timestamp > ultimaActualizacion) {
        ultimaActualizacion = value.timestamp;
      }
    }

    return {
      entradas: this.cache.size,
      ultimaActualizacion
    };
  }
}

export const peajesINEGIService = new PeajesINEGIService();
export type { CalculoPeajesINEGI, CasetaPeaje, Coordenada };
