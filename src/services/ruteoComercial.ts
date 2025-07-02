interface ParametrosRuteoComercial {
  vehiculo: {
    peso: number; // toneladas
    altura: number; // metros
    ancho: number; // metros
    largo: number; // metros
    ejes: number;
    materialesPeligrosos: boolean;
  };
  restricciones: {
    evitarPeajes: boolean;
    horarioRestriccion: boolean; // CDMX, GDL
    zonasAmbientales: boolean;
    puentesBajos: boolean;
  };
  optimizacion: 'tiempo' | 'distancia' | 'combustible';
}

interface Coordenada {
  lat: number;
  lng: number;
}

interface RutaComercial {
  id: string;
  distancia: number; // km
  tiempo: number; // minutos
  combustibleEstimado: number; // litros
  restriccionesEncontradas: string[];
  waypoints: Array<{
    lat: number;
    lng: number;
    tipo: 'origen' | 'destino' | 'intermedio' | 'restriccion' | 'parada_obligatoria';
    descripcion: string;
  }>;
  geometria: string; // encoded polyline
  advertencias: string[];
  costoPeajes: number;
}

interface HereRoutingResponse {
  routes: Array<{
    sections: Array<{
      polyline: string;
      summary: {
        length: number;
        duration: number;
        baseDuration: number;
      };
      notices: Array<{
        code: string;
        message: string;
      }>;
      transport: {
        mode: string;
      };
    }>;
  }>;
}

import { restriccionesUrbanasService } from './restriccionesUrbanas';
import { supabase } from '@/integrations/supabase/client';

class RuteoComercialService {
  private readonly baseURL = 'https://router.hereapi.com/v8/routes';
  private cache = new Map<string, { data: RutaComercial; timestamp: number }>();
  private readonly cacheTimeout = 4 * 60 * 60 * 1000; // 4 horas

  private generateCacheKey(
    origen: Coordenada,
    destino: Coordenada,
    parametros: ParametrosRuteoComercial
  ): string {
    return `${origen.lat},${origen.lng}-${destino.lat},${destino.lng}-${JSON.stringify(parametros)}`;
  }

  private buildHereApiUrl(
    origen: Coordenada,
    destino: Coordenada,
    parametros: ParametrosRuteoComercial
  ): string {
    const apiKey = import.meta.env.VITE_HERE_API_KEY || 'demo-key';
    
    const params = new URLSearchParams({
      'apikey': apiKey,
      'transportMode': 'truck',
      'origin': `${origen.lat},${origen.lng}`,
      'destination': `${destino.lat},${destino.lng}`,
      'return': 'polyline,summary,notices,tolls',
      'spans': 'length,duration,notices'
    });

    // Configuración del vehículo
    params.append('truck[grossWeight]', (parametros.vehiculo.peso * 1000).toString()); // kg
    params.append('truck[height]', (parametros.vehiculo.altura * 100).toString()); // cm
    params.append('truck[width]', (parametros.vehiculo.ancho * 100).toString()); // cm
    params.append('truck[length]', (parametros.vehiculo.largo * 100).toString()); // cm
    params.append('truck[axleCount]', parametros.vehiculo.ejes.toString());

    // Materiales peligrosos
    if (parametros.vehiculo.materialesPeligrosos) {
      params.append('truck[hazardousGoods]', 'explosive,gas,flammable,combustible,organic,poison,radioActive,corrosive,poisonousInhalation,harmfulToWater,other');
    }

    // Restricciones de tiempo (horarios de restricción México)
    if (parametros.restricciones.horarioRestriccion) {
      // Evitar horas pico CDMX/GDL: 6-10 AM y 6-9 PM días laborales
      params.append('avoid[features]', 'seasonalClosure,tollRoad');
    }

    // Optimización
    switch (parametros.optimizacion) {
      case 'tiempo':
        params.append('routingMode', 'fast');
        break;
      case 'distancia':
        params.append('routingMode', 'short');
        break;
      case 'combustible':
        params.append('routingMode', 'balanced');
        break;
    }

    // Evitar peajes si se solicita
    if (parametros.restricciones.evitarPeajes) {
      params.append('avoid[features]', 'tollRoad');
    }

    return `${this.baseURL}?${params.toString()}`;
  }

  async calcularRutaOptima(
    origen: Coordenada,
    destino: Coordenada,
    parametros: ParametrosRuteoComercial
  ): Promise<RutaComercial> {
    const cacheKey = this.generateCacheKey(origen, destino, parametros);
    
    // Verificar cache
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      console.log('Ruteo comercial: Usando datos del cache');
      return cached.data;
    }

    try {
      console.log('Calculando ruta comercial con HERE Maps:', {
        origen,
        destino,
        vehiculo: parametros.vehiculo
      });

      const url = this.buildHereApiUrl(origen, destino, parametros);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HERE API error: ${response.status}`);
      }

      const data: HereRoutingResponse = await response.json();
      
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No se encontraron rutas disponibles');
      }

      const route = data.routes[0];
      const section = route.sections[0];

      // Procesar restricciones y advertencias
      const restriccionesEncontradas: string[] = [];
      const advertencias: string[] = [];

      section.notices?.forEach(notice => {
        if (notice.code.includes('weight') || notice.code.includes('height')) {
          restriccionesEncontradas.push(notice.message);
        } else {
          advertencias.push(notice.message);
        }
      });

      // NUEVA FUNCIONALIDAD: Validar restricciones urbanas
      const waypoints = [
        {
          lat: origen.lat,
          lng: origen.lng,
          descripcion: 'Punto de origen'
        },
        {
          lat: destino.lat,
          lng: destino.lng,
          descripcion: 'Punto de destino'
        }
      ];

      const ciudadesDetectadas = restriccionesUrbanasService.detectarCiudadesEnRuta(waypoints);
      
      // Consultar restricciones urbanas de la base de datos
      for (const ciudad of ciudadesDetectadas) {
        try {
          const { data: restriccionesCiudad, error } = await supabase
            .from('restricciones_urbanas')
            .select('*')
            .eq('ciudad', ciudad.nombre)
            .eq('estado', ciudad.estado)
            .eq('activa', true);

          if (!error && restriccionesCiudad) {
            const alertasUrbanas = restriccionesUrbanasService.generarAlertasRestricciones(
              restriccionesCiudad,
              parametros.vehiculo
            );
            advertencias.push(...alertasUrbanas);

            // Agregar restricciones específicas encontradas
            restriccionesCiudad.forEach(r => {
              if (this.aplicaRestriccion(r, parametros.vehiculo)) {
                restriccionesEncontradas.push(`${r.ciudad}: ${r.descripcion}`);
              }
            });
          }
        } catch (dbError) {
          console.warn('Error consultando restricciones urbanas:', dbError);
        }
      }

      // Validar restricciones específicas de México
      const validacionMexico = this.validarRestriccionesMexico(parametros);
      advertencias.push(...validacionMexico);

      // Sugerir rutas alternativas si hay restricciones
      const ciudadesConRestricciones = ciudadesDetectadas
        .filter(c => restriccionesEncontradas.some(r => r.includes(c.nombre)))
        .map(c => c.nombre);
      
      if (ciudadesConRestricciones.length > 0) {
        const sugerenciasRuta = restriccionesUrbanasService.sugerirRutasAlternativas(ciudadesConRestricciones);
        advertencias.push(...sugerenciasRuta.map(s => `💡 Sugerencia: ${s}`));
      }

      const rutaComercial: RutaComercial = {
        id: `here-${Date.now()}`,
        distancia: Math.round(section.summary.length / 1000), // metros a km
        tiempo: Math.round(section.summary.duration / 60), // segundos a minutos
        combustibleEstimado: this.calcularCombustible(section.summary.length / 1000, parametros.vehiculo),
        restriccionesEncontradas,
        waypoints: [
          {
            lat: origen.lat,
            lng: origen.lng,
            tipo: 'origen',
            descripcion: 'Punto de origen'
          },
          {
            lat: destino.lat,
            lng: destino.lng,
            tipo: 'destino',
            descripcion: 'Punto de destino'
          }
        ],
        geometria: section.polyline,
        advertencias,
        costoPeajes: 0 // Se calculará con el servicio de peajes
      };

      // Guardar en cache
      this.cache.set(cacheKey, {
        data: rutaComercial,
        timestamp: Date.now()
      });

      console.log('Ruta comercial calculada con restricciones urbanas:', {
        distancia: rutaComercial.distancia,
        tiempo: rutaComercial.tiempo,
        restricciones: restriccionesEncontradas.length,
        ciudadesAnalizadas: ciudadesDetectadas.length
      });

      return rutaComercial;

    } catch (error) {
      console.warn('Error en HERE Maps, usando cálculo de respaldo:', error);
      return this.calcularRutaRespaldo(origen, destino, parametros);
    }
  }

  private aplicaRestriccion(restriccion: any, vehiculo: ParametrosRuteoComercial['vehiculo']): boolean {
    // Verificar si la restricción aplica al vehículo específico
    if (restriccion.aplica_configuraciones && 
        !restriccion.aplica_configuraciones.includes(vehiculo.configuracion || 'C2')) {
      return false;
    }

    switch (restriccion.tipo_restriccion) {
      case 'peso':
        return vehiculo.peso > (restriccion.peso_maximo || 0);
      case 'dimension':
        return vehiculo.altura > (restriccion.altura_maxima || 0);
      case 'horaria':
      case 'ambiental':
        return true; // Siempre mostrar advertencia
      default:
        return false;
    }
  }

  private validarRestriccionesMexico(parametros: ParametrosRuteoComercial): string[] {
    const advertencias: string[] = [];

    // Restricciones de peso en México
    if (parametros.vehiculo.peso > 48.5) {
      advertencias.push('Vehículo excede peso máximo permitido (48.5 ton) - Requiere permisos especiales');
    }

    // Restricciones de altura
    if (parametros.vehiculo.altura > 4.25) {
      advertencias.push('Altura del vehículo excede límite estándar (4.25m) - Verificar puentes');
    }

    // Restricciones de ancho
    if (parametros.vehiculo.ancho > 2.6) {
      advertencias.push('Ancho del vehículo requiere consideraciones especiales');
    }

    // Materiales peligrosos
    if (parametros.vehiculo.materialesPeligrosos) {
      advertencias.push('Transporte de materiales peligrosos - Verificar rutas autorizadas');
      advertencias.push('Evitar zonas urbanas densas y túneles');
    }

    // Restricciones horarias principales ciudades
    if (parametros.restricciones.horarioRestriccion) {
      advertencias.push('Considerar restricciones horarias: CDMX (6-10 AM, 6-9 PM), GDL (7-9 AM, 7-9 PM)');
    }

    return advertencias;
  }

  private calcularCombustible(distanciaKm: number, vehiculo: ParametrosRuteoComercial['vehiculo']): number {
    // Rendimiento estimado basado en peso y tipo de vehículo
    let rendimientoBase = 3.5; // km/litro base

    // Ajustar por peso
    if (vehiculo.peso > 20) rendimientoBase *= 0.8;
    if (vehiculo.peso > 35) rendimientoBase *= 0.7;

    // Ajustar por número de ejes (más ejes = mayor resistencia)
    if (vehiculo.ejes > 5) rendimientoBase *= 0.9;
    if (vehiculo.ejes > 7) rendimientoBase *= 0.85;

    return Math.round(distanciaKm / rendimientoBase);
  }

  private calcularRutaRespaldo(
    origen: Coordenada,
    destino: Coordenada,
    parametros: ParametrosRuteoComercial
  ): RutaComercial {
    // Cálculo básico usando Haversine
    const distancia = this.calcularDistanciaHaversine(origen, destino);
    const factorRuta = 1.25; // Factor para considerar que las carreteras no son línea recta
    const distanciaReal = Math.round(distancia * factorRuta);

    // Tiempo estimado considerando velocidad promedio de camión
    const velocidadPromedio = parametros.vehiculo.peso > 20 ? 50 : 60; // km/h
    const tiempo = Math.round((distanciaReal / velocidadPromedio) * 60); // minutos

    const advertencias = [
      'Cálculo de respaldo - Recomendamos verificar ruta manualmente',
      ...this.validarRestriccionesMexico(parametros)
    ];

    return {
      id: `fallback-${Date.now()}`,
      distancia: distanciaReal,
      tiempo,
      combustibleEstimado: this.calcularCombustible(distanciaReal, parametros.vehiculo),
      restriccionesEncontradas: [],
      waypoints: [
        { lat: origen.lat, lng: origen.lng, tipo: 'origen', descripcion: 'Punto de origen' },
        { lat: destino.lat, lng: destino.lng, tipo: 'destino', descripcion: 'Punto de destino' }
      ],
      geometria: '',
      advertencias,
      costoPeajes: Math.round(distanciaReal * 2.5) // Estimación básica
    };
  }

  private calcularDistanciaHaversine(punto1: Coordenada, punto2: Coordenada): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(punto2.lat - punto1.lat);
    const dLng = this.deg2rad(punto2.lng - punto1.lng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(punto1.lat)) * Math.cos(this.deg2rad(punto2.lat)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  validarRutaSegura(ruta: RutaComercial, vehiculo: ParametrosRuteoComercial['vehiculo']): {
    esSegura: boolean;
    alertas: string[];
    recomendaciones: string[];
  } {
    const alertas: string[] = [];
    const recomendaciones: string[] = [];

    // Validar restricciones de peso
    if (vehiculo.peso > 48.5) {
      alertas.push('CRÍTICO: Peso excede límite legal - Requiere permisos especiales');
      recomendaciones.push('Obtener permiso de la SCT para sobrepeso');
    }

    // Validar dimensiones
    if (vehiculo.altura > 4.25) {
      alertas.push('ADVERTENCIA: Altura puede causar problemas en puentes');
      recomendaciones.push('Verificar altura de puentes en la ruta');
    }

    // Validar distancia vs autonomía
    if (ruta.combustibleEstimado > 500) {
      alertas.push('Ruta larga - Planificar paradas para combustible');
      recomendaciones.push('Identificar gasolineras con acceso para vehículos pesados');
    }

    // Validar materiales peligrosos
    if (vehiculo.materialesPeligrosos) {
      alertas.push('Transporte de materiales peligrosos - Restricciones especiales');
      recomendaciones.push('Verificar documentación SEMARNAT/SCT');
      recomendaciones.push('Evitar centros urbanos y horarios pico');
    }

    // NUEVA VALIDACIÓN: Restricciones urbanas encontradas
    if (ruta.restriccionesEncontradas.length > 0) {
      alertas.push(`Restricciones urbanas detectadas: ${ruta.restriccionesEncontradas.length}`);
      recomendaciones.push('Revisar horarios de circulación en ciudades importantes');
      recomendaciones.push('Considerar rutas periféricas para evitar centros urbanos');
    }

    const esSegura = !alertas.some(alerta => alerta.includes('CRÍTICO'));

    return {
      esSegura,
      alertas,
      recomendaciones
    };
  }

  limpiarCache(): void {
    this.cache.clear();
  }

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

export const ruteoComercialService = new RuteoComercialService();
export type { ParametrosRuteoComercial, RutaComercial, Coordenada };
