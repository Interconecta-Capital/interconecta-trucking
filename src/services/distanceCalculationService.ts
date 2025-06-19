
import { mapService } from '@/services/mapService';
import { Ubicacion } from '@/types/ubicaciones';

interface DistanceCalculationResult {
  distanciaTotal: number;
  tiempoEstimado: number;
  distanciasIndividuales: { desde: string; hasta: string; distancia: number; tiempo: number }[];
  rutaCompleta?: any;
}

export class DistanceCalculationService {
  static async calcularDistanciaReal(ubicaciones: Ubicacion[]): Promise<DistanceCalculationResult> {
    console.log('🚀 Calculando distancia real con Mapbox para ubicaciones:', ubicaciones);
    
    if (ubicaciones.length < 2) {
      throw new Error('Se necesitan al menos 2 ubicaciones para calcular distancia');
    }

    // Ordenar ubicaciones por tipo y secuencia
    const ubicacionesOrdenadas = this.ordenarUbicaciones(ubicaciones);
    console.log('📍 Ubicaciones ordenadas:', ubicacionesOrdenadas);

    // Geocodificar todas las direcciones
    const coordenadas = await this.geocodificarUbicaciones(ubicacionesOrdenadas);
    console.log('🌍 Coordenadas obtenidas:', coordenadas);

    // Calcular ruta completa con Mapbox
    const rutaCompleta = await mapService.calculateRoute(coordenadas);
    
    if (!rutaCompleta) {
      throw new Error('No se pudo calcular la ruta con Mapbox');
    }

    console.log('🛣️ Ruta calculada:', rutaCompleta);

    // Calcular distancias individuales entre puntos consecutivos
    const distanciasIndividuales = [];
    let distanciaAcumulada = 0;
    let tiempoAcumulado = 0;

    for (let i = 0; i < coordenadas.length - 1; i++) {
      const origen = coordenadas[i];
      const destino = coordenadas[i + 1];
      
      const segmento = await mapService.calculateRoute([origen, destino]);
      
      if (segmento) {
        distanciasIndividuales.push({
          desde: ubicacionesOrdenadas[i].nombreRemitenteDestinatario || `Ubicación ${i + 1}`,
          hasta: ubicacionesOrdenadas[i + 1].nombreRemitenteDestinatario || `Ubicación ${i + 2}`,
          distancia: segmento.distance,
          tiempo: segmento.duration
        });
        
        distanciaAcumulada += segmento.distance;
        tiempoAcumulado += segmento.duration;
      }
    }

    const resultado = {
      distanciaTotal: Math.round(rutaCompleta.distance * 100) / 100, // Redondear a 2 decimales
      tiempoEstimado: Math.round(rutaCompleta.duration), // En minutos
      distanciasIndividuales,
      rutaCompleta: rutaCompleta.geometry
    };

    console.log('✅ Cálculo completado:', resultado);
    return resultado;
  }

  private static ordenarUbicaciones(ubicaciones: Ubicacion[]): Ubicacion[] {
    return [...ubicaciones].sort((a, b) => {
      // Orden: Origen -> Pasos Intermedios -> Destino
      const orden = { 'Origen': 1, 'Paso Intermedio': 2, 'Destino': 3 };
      const ordenA = orden[a.tipoUbicacion as keyof typeof orden] || 2;
      const ordenB = orden[b.tipoUbicacion as keyof typeof orden] || 2;
      
      if (ordenA !== ordenB) {
        return ordenA - ordenB;
      }
      
      // Si son del mismo tipo, ordenar por secuencia
      return (a.ordenSecuencia || 0) - (b.ordenSecuencia || 0);
    });
  }

  private static async geocodificarUbicaciones(ubicaciones: Ubicacion[]): Promise<Array<{lat: number, lng: number}>> {
    const coordenadas = [];
    
    for (const ubicacion of ubicaciones) {
      // Si ya tiene coordenadas, usarlas
      if (ubicacion.coordenadas) {
        coordenadas.push({
          lat: ubicacion.coordenadas.latitud,
          lng: ubicacion.coordenadas.longitud
        });
        continue;
      }

      // Construir dirección completa
      const direccion = [
        ubicacion.domicilio.calle,
        ubicacion.domicilio.numExterior,
        ubicacion.domicilio.colonia,
        ubicacion.domicilio.municipio,
        ubicacion.domicilio.estado,
        ubicacion.domicilio.codigoPostal,
        'México'
      ].filter(Boolean).join(', ');

      console.log('🔍 Geocodificando:', direccion);

      const resultado = await mapService.geocodeAddress(direccion);
      
      if (resultado) {
        coordenadas.push({
          lat: resultado.coordinates.lat,
          lng: resultado.coordinates.lng
        });
      } else {
        throw new Error(`No se pudo geocodificar la dirección: ${direccion}`);
      }
    }

    return coordenadas;
  }
}
