/**
 * ============================================
 * SERVICIO DE VALIDACIÓN DE DISPONIBILIDAD
 * ============================================
 * ISO 27001 A.18.1.3 - Integridad de datos
 * Valida disponibilidad de recursos antes de asignación
 */

import { supabase } from '@/integrations/supabase/client';

interface ConflictoDisponibilidad {
  recurso_id: string;
  recurso_tipo: 'conductor' | 'vehiculo' | 'remolque' | 'socio';
  motivo: string;
  fecha_conflicto: string;
  viaje_conflicto_id?: string;
}

interface ResultadoValidacion {
  disponible: boolean;
  conflictos: ConflictoDisponibilidad[];
  advertencias: string[];
}

export class DisponibilidadService {
  
  /**
   * Validar disponibilidad de conductor
   */
  static async validarDisponibilidadConductor(
    conductorId: string,
    fechaInicio: string,
    fechaFin: string
  ): Promise<ResultadoValidacion> {
    const { data: conductor, error } = await supabase
      .from('conductores')
      .select('id, nombre, estado, viaje_actual_id, fecha_proxima_disponibilidad')
      .eq('id', conductorId)
      .single();
    
    if (error || !conductor) {
      return {
        disponible: false,
        conflictos: [{
          recurso_id: conductorId,
          recurso_tipo: 'conductor',
          motivo: 'Conductor no encontrado',
          fecha_conflicto: fechaInicio
        }],
        advertencias: []
      };
    }
    
    const conflictos: ConflictoDisponibilidad[] = [];
    const advertencias: string[] = [];
    
    // Validar estado
    if (conductor.estado !== 'disponible') {
      conflictos.push({
        recurso_id: conductorId,
        recurso_tipo: 'conductor',
        motivo: `Conductor en estado: ${conductor.estado}`,
        fecha_conflicto: fechaInicio,
        viaje_conflicto_id: conductor.viaje_actual_id || undefined
      });
    }
    
    // Validar viaje actual
    if (conductor.viaje_actual_id) {
      advertencias.push(`Conductor asignado a viaje ${conductor.viaje_actual_id}`);
    }
    
    // Validar fecha próxima disponibilidad
    if (conductor.fecha_proxima_disponibilidad) {
      const fechaDisponibilidad = new Date(conductor.fecha_proxima_disponibilidad);
      const fechaInicioViaje = new Date(fechaInicio);
      
      if (fechaDisponibilidad > fechaInicioViaje) {
        advertencias.push(
          `Conductor disponible hasta ${fechaDisponibilidad.toLocaleDateString()}`
        );
      }
    }
    
    return {
      disponible: conflictos.length === 0,
      conflictos,
      advertencias
    };
  }
  
  /**
   * Validar disponibilidad de vehículo
   */
  static async validarDisponibilidadVehiculo(
    vehiculoId: string,
    fechaInicio: string,
    fechaFin: string
  ): Promise<ResultadoValidacion> {
    const { data: vehiculo, error } = await supabase
      .from('vehiculos')
      .select('id, placa, estado, viaje_actual_id, fecha_proxima_disponibilidad')
      .eq('id', vehiculoId)
      .single();
    
    if (error || !vehiculo) {
      return {
        disponible: false,
        conflictos: [{
          recurso_id: vehiculoId,
          recurso_tipo: 'vehiculo',
          motivo: 'Vehículo no encontrado',
          fecha_conflicto: fechaInicio
        }],
        advertencias: []
      };
    }
    
    const conflictos: ConflictoDisponibilidad[] = [];
    const advertencias: string[] = [];
    
    if (vehiculo.estado !== 'disponible') {
      conflictos.push({
        recurso_id: vehiculoId,
        recurso_tipo: 'vehiculo',
        motivo: `Vehículo en estado: ${vehiculo.estado}`,
        fecha_conflicto: fechaInicio,
        viaje_conflicto_id: vehiculo.viaje_actual_id || undefined
      });
    }
    
    if (vehiculo.viaje_actual_id) {
      advertencias.push(`Vehículo asignado a viaje ${vehiculo.viaje_actual_id}`);
    }
    
    return {
      disponible: conflictos.length === 0,
      conflictos,
      advertencias
    };
  }
  
  /**
   * ✅ NUEVO: Validar disponibilidad de remolque
   */
  static async validarDisponibilidadRemolque(
    remolqueId: string,
    fechaInicio: string,
    fechaFin: string
  ): Promise<ResultadoValidacion> {
    const { data: remolque, error } = await supabase
      .from('remolques')
      .select('id, placa, estado, viaje_actual_id, fecha_proxima_disponibilidad')
      .eq('id', remolqueId)
      .single();
    
    if (error || !remolque) {
      return {
        disponible: false,
        conflictos: [{
          recurso_id: remolqueId,
          recurso_tipo: 'remolque',
          motivo: 'Remolque no encontrado',
          fecha_conflicto: fechaInicio
        }],
        advertencias: []
      };
    }
    
    const conflictos: ConflictoDisponibilidad[] = [];
    const advertencias: string[] = [];
    
    // Validar estado
    if (remolque.estado !== 'disponible') {
      conflictos.push({
        recurso_id: remolqueId,
        recurso_tipo: 'remolque',
        motivo: `Remolque en estado: ${remolque.estado}`,
        fecha_conflicto: fechaInicio,
        viaje_conflicto_id: remolque.viaje_actual_id || undefined
      });
    }
    
    // Validar viaje actual
    if (remolque.viaje_actual_id) {
      advertencias.push(`Remolque asignado a viaje ${remolque.viaje_actual_id}`);
    }
    
    // Validar fecha próxima disponibilidad
    if (remolque.fecha_proxima_disponibilidad) {
      const fechaDisponibilidad = new Date(remolque.fecha_proxima_disponibilidad);
      const fechaInicioViaje = new Date(fechaInicio);
      
      if (fechaDisponibilidad > fechaInicioViaje) {
        advertencias.push(
          `Remolque disponible hasta ${fechaDisponibilidad.toLocaleDateString()}`
        );
      }
    }
    
    return {
      disponible: conflictos.length === 0,
      conflictos,
      advertencias
    };
  }
  
  /**
   * Validar disponibilidad de socio
   */
  static async validarDisponibilidadSocio(
    socioId: string,
    fechaInicio: string,
    fechaFin: string
  ): Promise<ResultadoValidacion> {
    const { data: socio, error } = await supabase
      .from('socios')
      .select('id, nombre_razon_social, activo')
      .eq('id', socioId)
      .single();
    
    if (error || !socio) {
      return {
        disponible: false,
        conflictos: [{
          recurso_id: socioId,
          recurso_tipo: 'socio',
          motivo: 'Socio no encontrado',
          fecha_conflicto: fechaInicio
        }],
        advertencias: []
      };
    }
    
    if (!socio.activo) {
      return {
        disponible: false,
        conflictos: [{
          recurso_id: socioId,
          recurso_tipo: 'socio',
          motivo: 'Socio inactivo',
          fecha_conflicto: fechaInicio
        }],
        advertencias: []
      };
    }
    
    return {
      disponible: true,
      conflictos: [],
      advertencias: []
    };
  }
  
  /**
   * Validar disponibilidad de todos los recursos de un viaje
   */
  static async validarDisponibilidadCompleta(
    conductorId?: string,
    vehiculoId?: string,
    remolqueId?: string,
    socioId?: string,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<{
    todosDisponibles: boolean;
    resultados: {
      conductor?: ResultadoValidacion;
      vehiculo?: ResultadoValidacion;
      remolque?: ResultadoValidacion;
      socio?: ResultadoValidacion;
    };
  }> {
    const fechaInicioDefault = fechaInicio || new Date().toISOString();
    const fechaFinDefault = fechaFin || new Date(Date.now() + 86400000).toISOString();
    
    const resultados: any = {};
    
    if (conductorId) {
      resultados.conductor = await this.validarDisponibilidadConductor(
        conductorId,
        fechaInicioDefault,
        fechaFinDefault
      );
    }
    
    if (vehiculoId) {
      resultados.vehiculo = await this.validarDisponibilidadVehiculo(
        vehiculoId,
        fechaInicioDefault,
        fechaFinDefault
      );
    }
    
    if (remolqueId) {
      resultados.remolque = await this.validarDisponibilidadRemolque(
        remolqueId,
        fechaInicioDefault,
        fechaFinDefault
      );
    }
    
    if (socioId) {
      resultados.socio = await this.validarDisponibilidadSocio(
        socioId,
        fechaInicioDefault,
        fechaFinDefault
      );
    }
    
    const todosDisponibles = Object.values(resultados).every(
      (r: any) => r.disponible
    );
    
    return {
      todosDisponibles,
      resultados
    };
  }
}
