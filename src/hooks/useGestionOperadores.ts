
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { 
  ConductorExtendido, 
  CalificacionConductor, 
  MetricaConductor, 
  PerformanceConductor,
  AsignacionInteligente 
} from '@/types/operadores';

export const useGestionOperadores = () => {
  const { user } = useAuth();
  const [conductores, setConductores] = useState<ConductorExtendido[]>([]);
  const [calificaciones, setCalificaciones] = useState<CalificacionConductor[]>([]);
  const [metricas, setMetricas] = useState<MetricaConductor[]>([]);
  const [loading, setLoading] = useState(false);

  // Función para convertir datos de Supabase a nuestros tipos
  const convertirConductorData = (data: any[]): ConductorExtendido[] => {
    return data.map(conductor => ({
      ...conductor,
      historial_performance: conductor.historial_performance || {
        viajes_completados: 0,
        km_totales: 0,
        calificacion_promedio: 5.0,
        incidentes: 0,
        eficiencia_combustible: 0,
        puntualidad_promedio: 95,
        costo_promedio_viaje: 0
      },
      certificaciones: conductor.certificaciones || {
        materiales_peligrosos: false,
        carga_especializada: false,
        primeros_auxilios: false,
        manejo_defensivo: false,
        vigencias: {}
      },
      preferencias: conductor.preferencias || {
        rutas_preferidas: [],
        tipos_carga: [],
        disponibilidad_horarios: {},
        radio_operacion_km: 500
      }
    }));
  };

  const convertirCalificacionData = (data: any[]): CalificacionConductor[] => {
    return data.map(calificacion => ({
      ...calificacion,
      tipo_calificacion: (calificacion.tipo_calificacion === 'conductor_a_cliente' 
        ? 'conductor_a_cliente' 
        : 'cliente_a_conductor') as 'cliente_a_conductor' | 'conductor_a_cliente',
      criterios: calificacion.criterios || {}
    }));
  };

  // Cargar conductores con datos extendidos
  const cargarConductores = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conductores')
        .select('*')
        .eq('user_id', user.id)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConductores(convertirConductorData(data || []));
    } catch (error) {
      console.error('Error cargando conductores:', error);
      toast.error('Error al cargar conductores');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Cargar calificaciones
  const cargarCalificaciones = useCallback(async (conductorId?: string) => {
    if (!user?.id) return;
    
    try {
      let query = supabase
        .from('calificaciones_conductores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (conductorId) {
        query = query.eq('conductor_id', conductorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCalificaciones(convertirCalificacionData(data || []));
    } catch (error) {
      console.error('Error cargando calificaciones:', error);
      toast.error('Error al cargar calificaciones');
    }
  }, [user?.id]);

  // Calcular performance de conductor
  const calcularPerformance = useCallback(async (conductorId: string): Promise<PerformanceConductor | null> => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase.rpc('calcular_performance_conductor', {
        p_conductor_id: conductorId,
        p_user_id: user.id
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const result = data[0];
        return {
          metricas: {
            eficienciaCombustible: result.eficiencia_combustible || 0,
            puntualidad: result.puntualidad || 95,
            cuidadoVehiculo: result.cuidado_vehiculo || 5,
            satisfaccionCliente: result.satisfaccion_cliente || 5
          },
          tendencias: {
            mejora: result.tendencia_mejora || false,
            areaMejora: result.areas_mejora || [],
            fortalezas: result.fortalezas || []
          },
          recomendaciones: {
            capacitacion: result.recomendaciones_capacitacion || [],
            rutasOptimas: result.rutas_optimas || [],
            tiposCargaIdeales: result.tipos_carga_ideales || []
          }
        };
      }
      return null;
    } catch (error) {
      console.error('Error calculando performance:', error);
      return null;
    }
  }, [user?.id]);

  // Crear calificación
  const crearCalificacion = useCallback(async (calificacion: Omit<CalificacionConductor, 'id' | 'created_at' | 'user_id'>) => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('calificaciones_conductores')
        .insert({
          ...calificacion,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      // Actualizar lista de calificaciones
      await cargarCalificaciones();
      toast.success('Calificación registrada correctamente');
      return data;
    } catch (error) {
      console.error('Error creando calificación:', error);
      toast.error('Error al registrar calificación');
      return null;
    }
  }, [user?.id, cargarCalificaciones]);

  // Registrar métrica de conductor
  const registrarMetrica = useCallback(async (metrica: Omit<MetricaConductor, 'id' | 'created_at' | 'user_id'>) => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('metricas_conductor')
        .insert({
          ...metrica,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Métrica registrada correctamente');
      return data;
    } catch (error) {
      console.error('Error registrando métrica:', error);
      toast.error('Error al registrar métrica');
      return null;
    }
  }, [user?.id]);

  // Asignación inteligente de conductor
  const obtenerAsignacionInteligente = useCallback(async (
    rutalOrigen: string,
    rutaDestino: string,
    tipoCarga: string,
    fechaRequerida: string
  ): Promise<AsignacionInteligente[]> => {
    if (!conductores.length) return [];
    
    const asignaciones: AsignacionInteligente[] = [];
    
    for (const conductor of conductores) {
      if (conductor.estado !== 'disponible') continue;
      
      let score = 0;
      const factores = {
        distancia: 0,
        especializacion: 0,
        disponibilidad: 0,
        performance: 0,
        preferencias: 0
      };
      const observaciones: string[] = [];
      
      // Factor distancia (30%)
      const radioOperacion = conductor.preferencias?.radio_operacion_km || 500;
      factores.distancia = Math.min(100, (radioOperacion / 1000) * 100);
      
      // Factor especialización (25%)
      if (conductor.certificaciones?.carga_especializada && 
          ['especializada', 'peligrosa'].includes(tipoCarga.toLowerCase())) {
        factores.especializacion = 100;
        observaciones.push('Certificado para carga especializada');
      } else if (conductor.certificaciones?.materiales_peligrosos && 
                 tipoCarga.toLowerCase().includes('peligro')) {
        factores.especializacion = 100;
        observaciones.push('Certificado para materiales peligrosos');
      } else {
        factores.especializacion = 70;
      }
      
      // Factor disponibilidad (20%)
      factores.disponibilidad = 90; // Simplificado - en producción verificar calendario
      
      // Factor performance (15%)
      const performance = conductor.historial_performance;
      if (performance) {
        const scorePuntualidad = Math.min(100, performance.puntualidad_promedio);
        const scoreCalificacion = (performance.calificacion_promedio / 5) * 100;
        factores.performance = (scorePuntualidad + scoreCalificacion) / 2;
      } else {
        factores.performance = 85; // Score por defecto
      }
      
      // Factor preferencias (10%)
      const rutasPreferidas = conductor.preferencias?.rutas_preferidas || [];
      if (rutasPreferidas.some(ruta => 
          rutalOrigen.toLowerCase().includes(ruta.toLowerCase()) ||
          rutaDestino.toLowerCase().includes(ruta.toLowerCase())
      )) {
        factores.preferencias = 100;
        observaciones.push('Ruta está en sus preferencias');
      } else {
        factores.preferencias = 50;
      }
      
      // Calcular score total
      score = (
        factores.distancia * 0.3 +
        factores.especializacion * 0.25 +
        factores.disponibilidad * 0.2 +
        factores.performance * 0.15 +
        factores.preferencias * 0.1
      );
      
      // Determinar recomendación
      let recomendacion: 'alta' | 'media' | 'baja';
      if (score >= 85) {
        recomendacion = 'alta';
      } else if (score >= 70) {
        recomendacion = 'media';
      } else {
        recomendacion = 'baja';
      }
      
      asignaciones.push({
        conductor_id: conductor.id,
        score_compatibilidad: Math.round(score),
        factores,
        recomendacion,
        observaciones
      });
    }
    
    // Ordenar por score descendente
    return asignaciones.sort((a, b) => b.score_compatibilidad - a.score_compatibilidad);
  }, [conductores]);

  // Actualizar certificaciones de conductor
  const actualizarCertificaciones = useCallback(async (
    conductorId: string, 
    certificaciones: ConductorExtendido['certificaciones']
  ) => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('conductores')
        .update({ certificaciones })
        .eq('id', conductorId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await cargarConductores();
      toast.success('Certificaciones actualizadas correctamente');
      return true;
    } catch (error) {
      console.error('Error actualizando certificaciones:', error);
      toast.error('Error al actualizar certificaciones');
      return false;
    }
  }, [user?.id, cargarConductores]);

  // Actualizar preferencias de conductor
  const actualizarPreferencias = useCallback(async (
    conductorId: string, 
    preferencias: ConductorExtendido['preferencias']
  ) => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('conductores')
        .update({ preferencias })
        .eq('id', conductorId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await cargarConductores();
      toast.success('Preferencias actualizadas correctamente');
      return true;
    } catch (error) {
      console.error('Error actualizando preferencias:', error);
      toast.error('Error al actualizar preferencias');
      return false;
    }
  }, [user?.id, cargarConductores]);

  useEffect(() => {
    if (user?.id) {
      cargarConductores();
      cargarCalificaciones();
    }
  }, [user?.id, cargarConductores, cargarCalificaciones]);

  return {
    // Estados
    conductores,
    calificaciones,
    metricas,
    loading,
    
    // Funciones
    cargarConductores,
    cargarCalificaciones,
    calcularPerformance,
    crearCalificacion,
    registrarMetrica,
    obtenerAsignacionInteligente,
    actualizarCertificaciones,
    actualizarPreferencias
  };
};
