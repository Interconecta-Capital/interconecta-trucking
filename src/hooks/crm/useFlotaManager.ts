import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VehiculoFlota {
  id: string;
  placas: string;
  marca: string;
  modelo: string;
  year: number;
  tipo: string;
  capacidad_peso: number;
  capacidad_volumen?: number;
  estatus: 'disponible' | 'en_ruta' | 'mantenimiento' | 'fuera_servicio';
  ubicacion_actual?: {
    latitud: number;
    longitud: number;
    direccion: string;
    timestamp: string;
  };
  conductor_asignado?: {
    id: string;
    nombre: string;
    licencia: string;
    telefono: string;
  };
  ultima_revision?: string;
  proxima_revision?: string;
  vencimiento_seguro?: string;
  vencimiento_verificacion?: string;
  costo_por_km?: number;
  consumo_combustible?: number;
  documentos: any[];
  user_id: string;
}

export interface ConductorFlota {
  id: string;
  nombre: string;
  licencia: string;
  tipo_licencia: string;
  telefono: string;
  email?: string;
  estatus: 'disponible' | 'en_ruta' | 'descanso' | 'inactivo';
  vehiculo_asignado?: string;
  experiencia_years: number;
  vencimiento_licencia?: string;
  vencimiento_medico?: string;
  calificacion?: number;
  viajes_completados: number;
  user_id: string;
}

export interface AsignacionInteligente {
  vehiculo: VehiculoFlota;
  conductor: ConductorFlota;
  score: number;
  razones: string[];
  costo_estimado: number;
  tiempo_estimado: number;
}

export function useFlotaManager() {
  const [vehiculos, setVehiculos] = useState<VehiculoFlota[]>([]);
  const [conductores, setConductores] = useState<ConductorFlota[]>([]);
  const [loading, setLoading] = useState(false);

  const mapVehiculoEstatus = (estado: string): VehiculoFlota['estatus'] => {
    switch (estado) {
      case 'disponible':
        return 'disponible';
      case 'en_ruta':
        return 'en_ruta';
      case 'mantenimiento':
        return 'mantenimiento';
      case 'fuera_servicio':
        return 'fuera_servicio';
      default:
        return 'disponible';
    }
  };

  const mapConductorEstatus = (estado: string): ConductorFlota['estatus'] => {
    switch (estado) {
      case 'disponible':
        return 'disponible';
      case 'en_ruta':
        return 'en_ruta';
      case 'descanso':
        return 'descanso';
      case 'inactivo':
        return 'inactivo';
      default:
        return 'disponible';
    }
  };

  const obtenerVehiculos = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehiculos')
        .select('*')
        .order('placa');

      if (error) throw error;

      const vehiculosFormateados: VehiculoFlota[] = data?.map(vehiculo => ({
        id: vehiculo.id,
        placas: vehiculo.placa,
        marca: vehiculo.marca || '',
        modelo: vehiculo.modelo || '',
        year: vehiculo.anio || 0,
        tipo: vehiculo.config_vehicular || 'camion',
        capacidad_peso: 5000, // Default values since not in schema
        capacidad_volumen: 50,
        estatus: mapVehiculoEstatus(vehiculo.estado),
        ubicacion_actual: undefined,
        conductor_asignado: undefined,
        ultima_revision: undefined,
        proxima_revision: undefined,
        vencimiento_seguro: vehiculo.vigencia_seguro,
        vencimiento_verificacion: vehiculo.verificacion_vigencia,
        costo_por_km: 10, // Default value
        consumo_combustible: 12, // Default value
        documentos: [],
        user_id: vehiculo.user_id
      })) || [];

      setVehiculos(vehiculosFormateados);
      return vehiculosFormateados;

    } catch (error: any) {
      console.error('Error obteniendo vehículos:', error);
      toast.error('Error al obtener vehículos: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const obtenerConductores = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conductores')
        .select('*')
        .order('nombre');

      if (error) throw error;

      const conductoresFormateados: ConductorFlota[] = data?.map(conductor => ({
        id: conductor.id,
        nombre: conductor.nombre,
        licencia: conductor.num_licencia || '',
        tipo_licencia: conductor.tipo_licencia || '',
        telefono: conductor.telefono || '',
        email: conductor.email,
        estatus: mapConductorEstatus(conductor.estado),
        vehiculo_asignado: undefined,
        experiencia_years: 5, // Default value
        vencimiento_licencia: conductor.vigencia_licencia,
        vencimiento_medico: undefined,
        calificacion: 4.5, // Default value
        viajes_completados: 25, // Default value
        user_id: conductor.user_id
      })) || [];

      setConductores(conductoresFormateados);
      return conductoresFormateados;

    } catch (error: any) {
      console.error('Error obteniendo conductores:', error);
      toast.error('Error al obtener conductores: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const sugerirAsignacion = useCallback(async (criterios: {
    peso_carga: number;
    volumen_carga?: number;
    distancia: number;
    tipo_mercancia: string;
    fecha_salida: string;
    urgencia: 'baja' | 'media' | 'alta';
  }): Promise<AsignacionInteligente[]> => {
    
    const vehiculosDisponibles = vehiculos.filter(v => 
      v.estatus === 'disponible' && 
      v.capacidad_peso >= criterios.peso_carga &&
      (!criterios.volumen_carga || !v.capacidad_volumen || v.capacidad_volumen >= criterios.volumen_carga)
    );

    const conductoresDisponibles = conductores.filter(c => 
      c.estatus === 'disponible' &&
      (!c.vencimiento_licencia || new Date(c.vencimiento_licencia) > new Date()) &&
      (!c.vencimiento_medico || new Date(c.vencimiento_medico) > new Date())
    );

    const asignaciones: AsignacionInteligente[] = [];

    for (const vehiculo of vehiculosDisponibles) {
      for (const conductor of conductoresDisponibles) {
        let score = 100;
        const razones: string[] = [];

        // Scoring basado en capacidad
        const utilizacionPeso = (criterios.peso_carga / vehiculo.capacidad_peso) * 100;
        if (utilizacionPeso >= 80 && utilizacionPeso <= 95) {
          score += 20;
          razones.push('Utilización óptima de capacidad');
        } else if (utilizacionPeso < 50) {
          score -= 10;
          razones.push('Baja utilización de capacidad');
        }

        // Scoring basado en experiencia del conductor
        if (conductor.experiencia_years >= 5) {
          score += 15;
          razones.push('Conductor experimentado');
        } else if (conductor.experiencia_years < 2) {
          score -= 5;
          razones.push('Conductor con poca experiencia');
        }

        // Scoring basado en calificación
        if (conductor.calificacion && conductor.calificacion >= 4.5) {
          score += 10;
          razones.push('Conductor con alta calificación');
        } else if (conductor.calificacion && conductor.calificacion < 3.5) {
          score -= 10;
          razones.push('Conductor con baja calificación');
        }

        // Scoring basado en eficiencia de combustible
        const costoKm = vehiculo.costo_por_km || 10;
        const costoEstimado = costoKm * criterios.distancia;
        
        if (vehiculo.consumo_combustible && vehiculo.consumo_combustible < 8) {
          score += 10;
          razones.push('Vehículo eficiente en combustible');
        }

        // Scoring basado en urgencia
        if (criterios.urgencia === 'alta' && conductor.viajes_completados > 50) {
          score += 15;
          razones.push('Conductor confiable para viajes urgentes');
        }

        // Tiempo estimado (simplificado)
        const tiempoEstimado = Math.round(criterios.distancia / 80 * 60); // minutos

        asignaciones.push({
          vehiculo,
          conductor,
          score,
          razones,
          costo_estimado: costoEstimado,
          tiempo_estimado: tiempoEstimado
        });
      }
    }

    // Ordenar por score descendente
    return asignaciones.sort((a, b) => b.score - a.score).slice(0, 5);
  }, [vehiculos, conductores]);

  const actualizarEstadoVehiculo = useCallback(async (
    vehiculoId: string, 
    nuevoEstado: VehiculoFlota['estatus'],
    ubicacion?: VehiculoFlota['ubicacion_actual']
  ) => {
    try {
      const { error } = await supabase
        .from('vehiculos')
        .update({ estado: nuevoEstado })
        .eq('id', vehiculoId);

      if (error) throw error;

      // Actualizar estado local
      setVehiculos(prev => prev.map(v => 
        v.id === vehiculoId 
          ? { ...v, estatus: nuevoEstado, ubicacion_actual: ubicacion || v.ubicacion_actual }
          : v
      ));

      toast.success('Estado del vehículo actualizado');

    } catch (error: any) {
      console.error('Error actualizando estado:', error);
      toast.error('Error al actualizar estado: ' + error.message);
    }
  }, []);

  const obtenerVehiculosProximosVencimiento = useCallback(() => {
    const hoy = new Date();
    const en30Dias = new Date();
    en30Dias.setDate(hoy.getDate() + 30);

    return vehiculos.filter(v => {
      const vencimientos = [
        v.vencimiento_seguro,
        v.vencimiento_verificacion,
        v.proxima_revision
      ];

      return vencimientos.some(fecha => {
        if (!fecha) return false;
        const fechaVencimiento = new Date(fecha);
        return fechaVencimiento >= hoy && fechaVencimiento <= en30Dias;
      });
    });
  }, [vehiculos]);

  const obtenerEstadisticasFlota = useCallback(() => {
    const total = vehiculos.length;
    const disponibles = vehiculos.filter(v => v.estatus === 'disponible').length;
    const enRuta = vehiculos.filter(v => v.estatus === 'en_ruta').length;
    const mantenimiento = vehiculos.filter(v => v.estatus === 'mantenimiento').length;

    const totalConductores = conductores.length;
    const conductoresDisponibles = conductores.filter(c => c.estatus === 'disponible').length;

    return {
      vehiculos: {
        total,
        disponibles,
        enRuta,
        mantenimiento,
        fueraServicio: total - disponibles - enRuta - mantenimiento,
        porcentajeDisponibilidad: total > 0 ? Math.round((disponibles / total) * 100) : 0
      },
      conductores: {
        total: totalConductores,
        disponibles: conductoresDisponibles,
        ocupados: totalConductores - conductoresDisponibles,
        porcentajeDisponibilidad: totalConductores > 0 ? Math.round((conductoresDisponibles / totalConductores) * 100) : 0
      }
    };
  }, [vehiculos, conductores]);

  // Auto-cargar datos al inicializar
  useEffect(() => {
    obtenerVehiculos();
    obtenerConductores();
  }, []);

  return {
    vehiculos,
    conductores,
    loading,
    obtenerVehiculos,
    obtenerConductores,
    sugerirAsignacion,
    actualizarEstadoVehiculo,
    obtenerVehiculosProximosVencimiento,
    obtenerEstadisticasFlota
  };
}
