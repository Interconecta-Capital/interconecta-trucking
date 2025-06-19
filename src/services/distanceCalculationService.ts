
import { Ubicacion } from '@/types/ubicaciones';
import { MapboxDistanceService } from './mapboxDistanceService';

interface RutaCalculada {
  distanciaTotal: number;
  tiempoEstimado: number;
  ubicacionesConDistancia: Ubicacion[];
}

export class DistanceCalculationService {
  static async calcularDistanciaReal(ubicaciones: Ubicacion[]): Promise<RutaCalculada> {
    console.log('🔄 Iniciando cálculo de distancia real con', ubicaciones.length, 'ubicaciones');

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

    // Calcular distancias entre ubicaciones consecutivas
    for (let i = 0; i < ubicacionesOrdenadas.length; i++) {
      const ubicacionActual = ubicacionesOrdenadas[i];
      
      if (i === 0) {
        // Primera ubicación (origen) - distancia 0
        ubicacionesConDistancia.push({
          ...ubicacionActual,
          distanciaRecorrida: 0
        });
      } else {
        const ubicacionAnterior = ubicacionesOrdenadas[i - 1];
        
        try {
          // Intentar usar coordenadas si están disponibles
          let coordenadasOrigen = ubicacionAnterior.coordenadas;
          let coordenadasDestino = ubicacionActual.coordenadas;

          // Si no hay coordenadas, intentar geocodificar usando dirección
          if (!coordenadasOrigen || !coordenadasDestino) {
            console.log('⚠️ Coordenadas faltantes, usando geocodificación aproximada');
            
            // Fallback usando códigos postales (estimación)
            const distanciaEstimada = this.estimarDistanciaPorCodigoPostal(
              ubicacionAnterior.domicilio.codigoPostal,
              ubicacionActual.domicilio.codigoPostal
            );
            
            distanciaTotal += distanciaEstimada;
            tiempoTotal += distanciaEstimada * 1.2; // Estimación: 1.2 minutos por km
            
            ubicacionesConDistancia.push({
              ...ubicacionActual,
              distanciaRecorrida: distanciaEstimada
            });
            
            continue;
          }

          // Calcular distancia real con Mapbox
          const resultado = await MapboxDistanceService.calculateDistance(
            { lat: coordenadasOrigen.latitud, lng: coordenadasOrigen.longitud },
            { lat: coordenadasDestino.latitud, lng: coordenadasDestino.longitud }
          );

          distanciaTotal += resultado.distance;
          tiempoTotal += resultado.duration / 60; // Convertir segundos a minutos

          ubicacionesConDistancia.push({
            ...ubicacionActual,
            distanciaRecorrida: resultado.distance
          });

          console.log(`✅ Distancia calculada ${i-1} -> ${i}: ${resultado.distance} km`);
          
        } catch (error) {
          console.error(`❌ Error calculando distancia ${i-1} -> ${i}:`, error);
          
          // Fallback a estimación
          const distanciaEstimada = this.estimarDistanciaPorCodigoPostal(
            ubicacionAnterior.domicilio.codigoPostal,
            ubicacionActual.domicilio.codigoPostal
          );
          
          distanciaTotal += distanciaEstimada;
          tiempoTotal += distanciaEstimada * 1.2;
          
          ubicacionesConDistancia.push({
            ...ubicacionActual,
            distanciaRecorrida: distanciaEstimada
          });
        }
      }
    }

    const resultado = {
      distanciaTotal: Math.round(distanciaTotal * 100) / 100, // 2 decimales
      tiempoEstimado: Math.round(tiempoTotal), // minutos
      ubicacionesConDistancia
    };

    console.log('✅ Cálculo de ruta completado:', resultado);
    return resultado;
  }

  private static estimarDistanciaPorCodigoPostal(cp1: string, cp2: string): number {
    // Estimación básica basada en diferencia de códigos postales
    // Esto es un fallback cuando no hay coordenadas disponibles
    
    if (!cp1 || !cp2) return 50; // Default 50km si faltan CPs
    
    const num1 = parseInt(cp1);
    const num2 = parseInt(cp2);
    
    if (isNaN(num1) || isNaN(num2)) return 50;
    
    // Estimación muy básica: cada 1000 unidades de CP ≈ 100km
    const diferencia = Math.abs(num1 - num2);
    const distanciaEstimada = Math.max(10, diferencia / 10); // Mínimo 10km
    
    console.log(`📍 Estimación por CP ${cp1} -> ${cp2}: ${distanciaEstimada} km`);
    return Math.round(distanciaEstimada * 100) / 100;
  }

  static async geocodificarDireccion(domicilio: any): Promise<{ latitud: number; longitud: number } | null> {
    // Implementación simplificada de geocodificación
    // En un sistema real, usarías Mapbox Geocoding API
    
    try {
      const direccion = `${domicilio.calle} ${domicilio.numExterior}, ${domicilio.colonia}, ${domicilio.municipio}, ${domicilio.estado}, ${domicilio.codigoPostal}`;
      
      console.log('🔍 Geocodificando:', direccion);
      
      // Por ahora, devolver null para forzar uso de estimación por CP
      // En implementación real, aquí irían las llamadas a Mapbox Geocoding
      
      return null;
    } catch (error) {
      console.error('Error en geocodificación:', error);
      return null;
    }
  }
}
