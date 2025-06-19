
import { Ubicacion } from '@/types/ubicaciones';
import { MapboxDistanceService } from './mapboxDistanceService';

interface RutaCalculada {
  distanciaTotal: number;
  tiempoEstimado: number;
  ubicacionesConDistancia: Ubicacion[];
  rutaCompleta?: any;
  coordenadasRuta?: Array<{ lat: number; lng: number }>;
}

interface GeocodingResult {
  coordinates: { lat: number; lng: number };
  formattedAddress: string;
  confidence: number;
}

export class DistanceCalculationService {
  static async calcularDistanciaReal(ubicaciones: Ubicacion[]): Promise<RutaCalculada> {
    console.log('🔄 Iniciando cálculo de distancia real con Mapbox, ubicaciones:', ubicaciones.length);

    if (ubicaciones.length < 2) {
      throw new Error('Se requieren al menos 2 ubicaciones para calcular la distancia');
    }

    // Ordenar ubicaciones por tipo y secuencia
    const ubicacionesOrdenadas = [...ubicaciones].sort((a, b) => {
      const orden = { 'Origen': 1, 'Paso Intermedio': 2, 'Destino': 3 };
      return (orden[a.tipoUbicacion as keyof typeof orden] || 2) - 
             (orden[b.tipoUbicacion as keyof typeof orden] || 2);
    });

    let distanciaTotal = 0;
    let tiempoTotal = 0;
    const ubicacionesConDistancia: Ubicacion[] = [];
    const coordenadasRuta: Array<{ lat: number; lng: number }> = [];
    let rutaCompleta: any = null;

    try {
      // Primer paso: Geocodificar todas las ubicaciones que no tengan coordenadas
      const ubicacionesConCoordenadas = await this.geocodificarUbicaciones(ubicacionesOrdenadas);
      
      // Segundo paso: Calcular la ruta completa usando Mapbox
      if (ubicacionesConCoordenadas.length >= 2) {
        const coordenadas = ubicacionesConCoordenadas
          .filter(u => u.coordenadas)
          .map(u => ({ lat: u.coordenadas!.latitud, lng: u.coordenadas!.longitud }));

        if (coordenadas.length >= 2) {
          console.log('🗺️ Calculando ruta completa con Mapbox...');
          
          const resultadoRuta = await MapboxDistanceService.calculateRoute(coordenadas);
          
          distanciaTotal = resultadoRuta.distance;
          tiempoTotal = resultadoRuta.duration / 60; // Convertir a minutos
          rutaCompleta = resultadoRuta.route;
          coordenadasRuta.push(...coordenadas);

          console.log('✅ Ruta completa calculada:', {
            distancia: distanciaTotal,
            tiempo: tiempoTotal,
            puntos: coordenadas.length
          });
        }
      }

      // Tercer paso: Calcular distancias individuales entre ubicaciones consecutivas
      for (let i = 0; i < ubicacionesConCoordenadas.length; i++) {
        const ubicacionActual = ubicacionesConCoordenadas[i];
        
        if (i === 0) {
          // Primera ubicación (origen) - distancia 0
          ubicacionesConDistancia.push({
            ...ubicacionActual,
            distanciaRecorrida: 0
          });
        } else {
          const ubicacionAnterior = ubicacionesConCoordenadas[i - 1];
          let distanciaSegmento = 0;

          try {
            if (ubicacionAnterior.coordenadas && ubicacionActual.coordenadas) {
              // Usar Mapbox para cálculo preciso
              const resultado = await MapboxDistanceService.calculateDistance(
                { lat: ubicacionAnterior.coordenadas.latitud, lng: ubicacionAnterior.coordenadas.longitud },
                { lat: ubicacionActual.coordenadas.latitud, lng: ubicacionActual.coordenadas.longitud }
              );
              
              distanciaSegmento = resultado.distance;
              console.log(`✅ Segmento ${i-1} -> ${i}: ${distanciaSegmento} km (Mapbox)`);
            } else {
              // Fallback usando estimación por código postal
              distanciaSegmento = this.estimarDistanciaPorCodigoPostal(
                ubicacionAnterior.domicilio.codigoPostal,
                ubicacionActual.domicilio.codigoPostal
              );
              console.log(`⚠️ Segmento ${i-1} -> ${i}: ${distanciaSegmento} km (estimado)`);
            }
          } catch (error) {
            console.error(`❌ Error calculando segmento ${i-1} -> ${i}:`, error);
            
            // Fallback a estimación
            distanciaSegmento = this.estimarDistanciaPorCodigoPostal(
              ubicacionAnterior.domicilio.codigoPostal,
              ubicacionActual.domicilio.codigoPostal
            );
          }

          ubicacionesConDistancia.push({
            ...ubicacionActual,
            distanciaRecorrida: distanciaSegmento
          });
        }
      }

      // Si no se pudo calcular ruta completa, sumar distancias individuales
      if (distanciaTotal === 0) {
        distanciaTotal = ubicacionesConDistancia
          .slice(1) // Omitir origen que tiene distancia 0
          .reduce((total, ub) => total + (ub.distanciaRecorrida || 0), 0);
        
        tiempoTotal = distanciaTotal * 1.2; // Estimación: 1.2 minutos por km
        console.log('📊 Distancia calculada por suma de segmentos:', distanciaTotal);
      }

    } catch (error) {
      console.error('❌ Error en cálculo de ruta:', error);
      
      // Fallback completo usando estimaciones
      return this.calcularDistanciaFallback(ubicacionesOrdenadas);
    }

    const resultado: RutaCalculada = {
      distanciaTotal: Math.round(distanciaTotal * 100) / 100, // 2 decimales
      tiempoEstimado: Math.round(tiempoTotal), // minutos
      ubicacionesConDistancia,
      rutaCompleta,
      coordenadasRuta: coordenadasRuta.length > 0 ? coordenadasRuta : undefined
    };

    console.log('✅ Cálculo de ruta completado:', resultado);
    return resultado;
  }

  private static async geocodificarUbicaciones(ubicaciones: Ubicacion[]): Promise<Ubicacion[]> {
    console.log('🔍 Iniciando geocodificación de ubicaciones...');
    
    const ubicacionesConCoordenadas: Ubicacion[] = [];

    for (const ubicacion of ubicaciones) {
      let ubicacionFinal = { ...ubicacion };

      // Si ya tiene coordenadas, usarlas
      if (ubicacion.coordenadas) {
        console.log(`✅ Ubicación ya tiene coordenadas: ${ubicacion.nombreRemitenteDestinatario}`);
        ubicacionesConCoordenadas.push(ubicacionFinal);
        continue;
      }

      // Intentar geocodificar
      try {
        const direccionCompleta = this.construirDireccionCompleta(ubicacion.domicilio);
        console.log(`🔍 Geocodificando: ${direccionCompleta}`);
        
        const resultado = await MapboxDistanceService.geocodeAddress(direccionCompleta);
        
        if (resultado && resultado.confidence > 0.3) {
          ubicacionFinal.coordenadas = {
            latitud: resultado.coordinates.lat,
            longitud: resultado.coordinates.lng
          };
          
          console.log(`✅ Geocodificación exitosa: ${ubicacion.nombreRemitenteDestinatario} -> ${resultado.coordinates.lat}, ${resultado.coordinates.lng}`);
        } else {
          console.log(`⚠️ Geocodificación con baja confianza para: ${ubicacion.nombreRemitenteDestinatario}`);
        }
      } catch (error) {
        console.error(`❌ Error geocodificando ${ubicacion.nombreRemitenteDestinatario}:`, error);
      }

      ubicacionesConCoordenadas.push(ubicacionFinal);
    }

    console.log(`🔍 Geocodificación completada: ${ubicacionesConCoordenadas.filter(u => u.coordenadas).length}/${ubicaciones.length} ubicaciones con coordenadas`);
    
    return ubicacionesConCoordenadas;
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

  private static calcularDistanciaFallback(ubicaciones: Ubicacion[]): RutaCalculada {
    console.log('⚠️ Usando cálculo de distancia fallback...');
    
    let distanciaTotal = 0;
    const ubicacionesConDistancia: Ubicacion[] = [];

    for (let i = 0; i < ubicaciones.length; i++) {
      const ubicacionActual = ubicaciones[i];
      
      if (i === 0) {
        ubicacionesConDistancia.push({
          ...ubicacionActual,
          distanciaRecorrida: 0
        });
      } else {
        const ubicacionAnterior = ubicaciones[i - 1];
        const distanciaEstimada = this.estimarDistanciaPorCodigoPostal(
          ubicacionAnterior.domicilio.codigoPostal,
          ubicacionActual.domicilio.codigoPostal
        );
        
        distanciaTotal += distanciaEstimada;
        
        ubicacionesConDistancia.push({
          ...ubicacionActual,
          distanciaRecorrida: distanciaEstimada
        });
      }
    }

    return {
      distanciaTotal: Math.round(distanciaTotal * 100) / 100,
      tiempoEstimado: Math.round(distanciaTotal * 1.2), // 1.2 min por km
      ubicacionesConDistancia
    };
  }

  private static estimarDistanciaPorCodigoPostal(cp1: string, cp2: string): number {
    // Estimación básica basada en diferencia de códigos postales
    if (!cp1 || !cp2) return 50; // Default 50km si faltan CPs
    
    const num1 = parseInt(cp1);
    const num2 = parseInt(cp2);
    
    if (isNaN(num1) || isNaN(num2)) return 50;
    
    // Estimación mejorada: cada 1000 unidades de CP ≈ 100km
    const diferencia = Math.abs(num1 - num2);
    const distanciaEstimada = Math.max(5, diferencia / 10); // Mínimo 5km
    
    console.log(`📍 Estimación por CP ${cp1} -> ${cp2}: ${distanciaEstimada} km`);
    return Math.round(distanciaEstimada * 100) / 100;
  }

  // Método para validar disponibilidad de Mapbox
  static async validarDisponibilidadMapbox(): Promise<boolean> {
    try {
      const testResult = await MapboxDistanceService.geocodeAddress('Ciudad de México, México');
      return testResult !== null;
    } catch (error) {
      console.error('❌ Mapbox no disponible:', error);
      return false;
    }
  }
}
