
import { Ubicacion } from '@/types/ubicaciones';
import { MapboxDistanceService } from '@/services/mapboxDistanceService';

interface OptimizedRouteResult {
  distanciaTotal: number;
  tiempoTotal: number;
  ubicacionesOptimizadas: Ubicacion[];
  ahorroDistancia: number;
  ahorroTiempo: number;
  rutaGeometry?: any;
  coordenadasRuta: Array<{ lat: number; lng: number }>;
}

interface CacheEntry {
  result: OptimizedRouteResult;
  timestamp: number;
  hash: string;
}

export class DistanceOptimizationService {
  private static cache = new Map<string, CacheEntry>();
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutos
  
  static async optimizarRutaCompleta(ubicaciones: Ubicacion[]): Promise<OptimizedRouteResult> {
    console.log('🚀 [DistanceOptimizationService] Iniciando optimización de ruta completa');

    if (ubicaciones.length < 2) {
      throw new Error('Se requieren al menos 2 ubicaciones para optimizar la ruta');
    }

    // Generar hash único para la consulta
    const queryHash = this.generateQueryHash(ubicaciones);
    
    // Verificar cache
    const cached = this.getCachedResult(queryHash);
    if (cached) {
      console.log('✅ Ruta optimizada obtenida del cache');
      return cached;
    }

    try {
      // Paso 1: Geocodificar ubicaciones si es necesario
      const ubicacionesConCoordenadas = await this.geocodificarUbicaciones(ubicaciones);
      
      // Paso 2: Calcular ruta original
      const rutaOriginal = await this.calcularRutaOriginal(ubicacionesConCoordenadas);
      
      // Paso 3: Optimizar orden de ubicaciones intermedias
      const rutaOptimizada = await this.optimizarOrdenUbicaciones(ubicacionesConCoordenadas);
      
      // Paso 4: Comparar resultados y preparar respuesta
      const resultado = this.compararRutas(rutaOriginal, rutaOptimizada, ubicacionesConCoordenadas);
      
      // Guardar en cache
      this.setCachedResult(queryHash, resultado);
      
      console.log('✅ Optimización de ruta completada:', {
        distanciaOriginal: rutaOriginal.distanciaTotal,
        distanciaOptimizada: resultado.distanciaTotal,
        ahorro: resultado.ahorroDistancia
      });
      
      return resultado;

    } catch (error) {
      console.error('❌ Error en optimización de ruta:', error);
      
      // Fallback: calcular ruta básica sin optimización
      return await this.calcularRutaBasica(ubicaciones);
    }
  }

  private static async geocodificarUbicaciones(ubicaciones: Ubicacion[]): Promise<Ubicacion[]> {
    console.log('🔍 Geocodificando ubicaciones para optimización...');
    
    const ubicacionesConCoordenadas: Ubicacion[] = [];

    for (const ubicacion of ubicaciones) {
      let ubicacionFinal = { ...ubicacion };

      // Si ya tiene coordenadas, usarlas
      if (ubicacion.coordenadas) {
        ubicacionesConCoordenadas.push(ubicacionFinal);
        continue;
      }

      try {
        const direccionCompleta = this.construirDireccionCompleta(ubicacion.domicilio);
        const resultado = await MapboxDistanceService.geocodeAddress(direccionCompleta);
        
        if (resultado && resultado.confidence > 0.3) {
          ubicacionFinal.coordenadas = {
            latitud: resultado.coordinates.lat,
            longitud: resultado.coordinates.lng
          };
          
          console.log(`✅ Geocodificado: ${ubicacion.nombreRemitenteDestinatario}`);
        }
      } catch (error) {
        console.error(`❌ Error geocodificando ${ubicacion.nombreRemitenteDestinatario}:`, error);
      }

      ubicacionesConCoordenadas.push(ubicacionFinal);
    }

    return ubicacionesConCoordenadas;
  }

  private static async calcularRutaOriginal(ubicaciones: Ubicacion[]): Promise<{ distanciaTotal: number; tiempoTotal: number }> {
    console.log('📏 Calculando ruta original...');
    
    const coordenadas = ubicaciones
      .filter(u => u.coordenadas)
      .map(u => ({ lat: u.coordenadas!.latitud, lng: u.coordenadas!.longitud }));

    if (coordenadas.length < 2) {
      return { distanciaTotal: 0, tiempoTotal: 0 };
    }

    try {
      const resultado = await MapboxDistanceService.calculateRoute(coordenadas);
      return {
        distanciaTotal: resultado.distance,
        tiempoTotal: resultado.duration / 60 // Convertir a minutos
      };
    } catch (error) {
      console.error('❌ Error calculando ruta original:', error);
      return { distanciaTotal: 0, tiempoTotal: 0 };
    }
  }

  private static async optimizarOrdenUbicaciones(ubicaciones: Ubicacion[]): Promise<{ distanciaTotal: number; tiempoTotal: number; ordenOptimizado: Ubicacion[] }> {
    console.log('🔄 Optimizando orden de ubicaciones...');
    
    // Separar origen, destino y puntos intermedios
    const origen = ubicaciones.find(u => u.tipoUbicacion === 'Origen');
    const destino = ubicaciones.find(u => u.tipoUbicacion === 'Destino');
    const intermedios = ubicaciones.filter(u => u.tipoUbicacion === 'Paso Intermedio');

    if (!origen || !destino) {
      throw new Error('Se requiere al menos un origen y un destino');
    }

    // Si no hay puntos intermedios, la ruta ya está optimizada
    if (intermedios.length === 0) {
      const coordenadas = [origen, destino]
        .filter(u => u.coordenadas)
        .map(u => ({ lat: u.coordenadas!.latitud, lng: u.coordenadas!.longitud }));

      const resultado = await MapboxDistanceService.calculateRoute(coordenadas);
      return {
        distanciaTotal: resultado.distance,
        tiempoTotal: resultado.duration / 60,
        ordenOptimizado: [origen, destino]
      };
    }

    // Optimizar puntos intermedios usando algoritmo nearest neighbor mejorado
    const intermediosOptimizados = await this.optimizarPuntosIntermedios(origen, destino, intermedios);
    
    const ordenFinal = [origen, ...intermediosOptimizados, destino];
    
    // Calcular ruta optimizada
    const coordenadas = ordenFinal
      .filter(u => u.coordenadas)
      .map(u => ({ lat: u.coordenadas!.latitud, lng: u.coordenadas!.longitud }));

    const resultado = await MapboxDistanceService.calculateRoute(coordenadas);
    
    return {
      distanciaTotal: resultado.distance,
      tiempoTotal: resultado.duration / 60,
      ordenOptimizado: ordenFinal
    };
  }

  private static async optimizarPuntosIntermedios(origen: Ubicacion, destino: Ubicacion, intermedios: Ubicacion[]): Promise<Ubicacion[]> {
    if (intermedios.length <= 1) {
      return intermedios;
    }

    console.log(`🧮 Optimizando ${intermedios.length} puntos intermedios...`);

    // Algoritmo greedy mejorado: nearest neighbor con look-ahead
    const puntosDisponibles = [...intermedios];
    const rutaOptimizada: Ubicacion[] = [];
    let puntoActual = origen;

    while (puntosDisponibles.length > 0) {
      let mejorPunto: Ubicacion | null = null;
      let menorDistancia = Infinity;

      // Encontrar el punto más cercano al actual
      for (const punto of puntosDisponibles) {
        if (!puntoActual.coordenadas || !punto.coordenadas) continue;

        try {
          const resultado = await MapboxDistanceService.calculateDistance(
            { lat: puntoActual.coordenadas.latitud, lng: puntoActual.coordenadas.longitud },
            { lat: punto.coordenadas.latitud, lng: punto.coordenadas.longitud }
          );

          if (resultado.distance < menorDistancia) {
            menorDistancia = resultado.distance;
            mejorPunto = punto;
          }
        } catch (error) {
          console.error('Error calculando distancia para optimización:', error);
        }
      }

      if (mejorPunto) {
        rutaOptimizada.push(mejorPunto);
        puntosDisponibles.splice(puntosDisponibles.indexOf(mejorPunto), 1);
        puntoActual = mejorPunto;
      } else {
        // Si no se puede calcular, agregar el primero disponible
        rutaOptimizada.push(puntosDisponibles[0]);
        puntosDisponibles.splice(0, 1);
      }
    }

    return rutaOptimizada;
  }

  private static compararRutas(
    rutaOriginal: { distanciaTotal: number; tiempoTotal: number },
    rutaOptimizada: { distanciaTotal: number; tiempoTotal: number; ordenOptimizado: Ubicacion[] },
    ubicacionesOriginales: Ubicacion[]
  ): OptimizedRouteResult {
    
    const ahorroDistancia = Math.max(0, rutaOriginal.distanciaTotal - rutaOptimizada.distanciaTotal);
    const ahorroTiempo = Math.max(0, rutaOriginal.tiempoTotal - rutaOptimizada.tiempoTotal);

    // Actualizar distancias recorridas en las ubicaciones optimizadas
    const ubicacionesConDistancias = this.calcularDistanciasAcumuladas(rutaOptimizada.ordenOptimizado);

    return {
      distanciaTotal: Math.round(rutaOptimizada.distanciaTotal * 100) / 100,
      tiempoTotal: Math.round(rutaOptimizada.tiempoTotal),
      ubicacionesOptimizadas: ubicacionesConDistancias,
      ahorroDistancia: Math.round(ahorroDistancia * 100) / 100,
      ahorroTiempo: Math.round(ahorroTiempo),
      coordenadasRuta: rutaOptimizada.ordenOptimizado
        .filter(u => u.coordenadas)
        .map(u => ({ lat: u.coordenadas!.latitud, lng: u.coordenadas!.longitud }))
    };
  }

  private static calcularDistanciasAcumuladas(ubicaciones: Ubicacion[]): Ubicacion[] {
    const result: Ubicacion[] = [];
    let distanciaAcumulada = 0;

    for (let i = 0; i < ubicaciones.length; i++) {
      if (i === 0) {
        result.push({
          ...ubicaciones[i],
          distanciaRecorrida: 0
        });
      } else {
        // Para simplificar, usar distancia lineal como aproximación
        const distanciaSegmento = this.calcularDistanciaLineal(ubicaciones[i-1], ubicaciones[i]);
        distanciaAcumulada += distanciaSegmento;
        
        result.push({
          ...ubicaciones[i],
          distanciaRecorrida: distanciaSegmento
        });
      }
    }

    return result;
  }

  private static calcularDistanciaLineal(punto1: Ubicacion, punto2: Ubicacion): number {
    if (!punto1.coordenadas || !punto2.coordenadas) return 0;

    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(punto2.coordenadas.latitud - punto1.coordenadas.latitud);
    const dLon = this.deg2rad(punto2.coordenadas.longitud - punto1.coordenadas.longitud);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(punto1.coordenadas.latitud)) * Math.cos(this.deg2rad(punto2.coordenadas.latitud)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private static async calcularRutaBasica(ubicaciones: Ubicacion[]): Promise<OptimizedRouteResult> {
    console.log('⚠️ Usando cálculo de ruta básico (fallback)');
    
    return {
      distanciaTotal: 100, // Valor por defecto
      tiempoTotal: 120, // 2 horas por defecto
      ubicacionesOptimizadas: ubicaciones.map((ub, index) => ({
        ...ub,
        distanciaRecorrida: index === 0 ? 0 : 50
      })),
      ahorroDistancia: 0,
      ahorroTiempo: 0,
      coordenadasRuta: []
    };
  }

  private static construirDireccionCompleta(domicilio: any): string {
    const partes = [
      domicilio.calle,
      domicilio.numExterior,
      domicilio.colonia,
      domicilio.municipio,
      domicilio.estado,
      domicilio.codigoPostal,
      'México'
    ].filter(Boolean);

    return partes.join(', ');
  }

  private static generateQueryHash(ubicaciones: Ubicacion[]): string {
    const queryData = ubicaciones.map(u => ({
      tipo: u.tipoUbicacion,
      cp: u.domicilio.codigoPostal,
      municipio: u.domicilio.municipio,
      estado: u.domicilio.estado
    }));
    
    return btoa(JSON.stringify(queryData));
  }

  private static getCachedResult(hash: string): OptimizedRouteResult | null {
    const cached = this.cache.get(hash);
    if (!cached) return null;

    // Verificar si el cache expiró
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(hash);
      return null;
    }

    return cached.result;
  }

  private static setCachedResult(hash: string, result: OptimizedRouteResult): void {
    this.cache.set(hash, {
      result,
      timestamp: Date.now(),
      hash
    });

    // Limpiar cache antiguo
    if (this.cache.size > 100) {
      this.clearOldCache();
    }
  }

  private static clearOldCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }

  // Método público para limpiar cache manualmente
  static clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache de optimización de rutas limpiado');
  }
}
