
import { mapService } from './mapService';
import { supabase } from '@/integrations/supabase/client';

export interface UbicacionFrecuenteData {
  id?: string;
  nombreUbicacion: string;
  rfcAsociado: string;
  domicilio: {
    pais: string;
    codigoPostal: string;
    estado: string;
    municipio: string;
    localidad?: string;
    colonia: string;
    calle: string;
    numExterior: string;
    numInterior?: string;
    referencia?: string;
  };
  coordenadas?: {
    lat: number;
    lng: number;
  };
  usoCount?: number;
}

export class UbicacionesService {
  // Guardar ubicación frecuente con geocodificación
  static async guardarUbicacionFrecuente(ubicacion: UbicacionFrecuenteData): Promise<{ success: boolean; error?: string }> {
    try {
      // Geocodificar la dirección completa
      const direccionCompleta = `${ubicacion.domicilio.calle} ${ubicacion.domicilio.numExterior}, ${ubicacion.domicilio.colonia}, ${ubicacion.domicilio.municipio}, ${ubicacion.domicilio.estado}, ${ubicacion.domicilio.codigoPostal}`;
      
      const coordenadas = await mapService.geocodeAddress(direccionCompleta);

      const { error } = await supabase
        .from('ubicaciones_frecuentes')
        .insert({
          nombre_ubicacion: ubicacion.nombreUbicacion,
          rfc_asociado: ubicacion.rfcAsociado,
          domicilio: ubicacion.domicilio,
          coordenadas: coordenadas?.coordinates || null,
          uso_count: 1
        });

      if (error) {
        console.error('Error guardando ubicación frecuente:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error en guardarUbicacionFrecuente:', error);
      return { success: false, error: 'Error interno del sistema' };
    }
  }

  // Obtener ubicaciones frecuentes del usuario
  static async obtenerUbicacionesFrecuentes(): Promise<UbicacionFrecuenteData[]> {
    try {
      const { data, error } = await supabase
        .from('ubicaciones_frecuentes')
        .select('*')
        .order('uso_count', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error obteniendo ubicaciones frecuentes:', error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        nombreUbicacion: item.nombre_ubicacion,
        rfcAsociado: item.rfc_asociado,
        domicilio: item.domicilio,
        coordenadas: item.coordenadas,
        usoCount: item.uso_count
      }));
    } catch (error) {
      console.error('Error en obtenerUbicacionesFrecuentes:', error);
      return [];
    }
  }

  // Incrementar contador de uso
  static async incrementarUsoUbicacion(id: string): Promise<void> {
    try {
      await supabase.rpc('increment_uso_ubicacion', { ubicacion_id: id });
    } catch (error) {
      console.error('Error incrementando uso de ubicación:', error);
    }
  }

  // Buscar direcciones con autocompletado
  static async buscarDirecciones(query: string): Promise<any[]> {
    if (query.length < 3) return [];
    
    try {
      return await mapService.searchAddresses(query);
    } catch (error) {
      console.error('Error buscando direcciones:', error);
      return [];
    }
  }

  // Validar dirección completa
  static async validarDireccion(direccion: string): Promise<boolean> {
    try {
      return await mapService.validateAddress(direccion);
    } catch (error) {
      console.error('Error validando dirección:', error);
      return false;
    }
  }
}
