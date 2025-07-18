import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useDataFlowConnection } from './useDataFlowConnection';

// Hook para automatizar flujos de datos en tiempo real
export const useAutomaticFlows = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { convertirCotizacionAViaje, generarCartaPorteDesdeViaje, actualizarCostosReales } = useDataFlowConnection();

  // Automatizar análisis de viajes al completarse
  const procesarAnalisisViaje = useMutation({
    mutationFn: async (viajeId: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      // Obtener datos completos del viaje
      const { data: viaje, error: viajeError } = await supabase
        .from('viajes')
        .select(`
          *,
          costos_viaje (*),
          cotizaciones (
            precio_cotizado,
            costo_total_interno,
            origen,
            destino
          )
        `)
        .eq('id', viajeId)
        .eq('user_id', user.id)
        .single();

      if (viajeError) throw viajeError;
      if (!viaje) throw new Error('Viaje no encontrado');

      // Generar hash de ruta para análisis
      const rutaHash = `${viaje.origen?.toLowerCase().trim()}_${viaje.destino?.toLowerCase().trim()}`;

      // Calcular métricas para análisis
      const costosViaje = Array.isArray(viaje.costos_viaje) ? viaje.costos_viaje[0] : null;
      const cotizacion = viaje.cotizaciones;

      const analisisData = {
        user_id: user.id,
        viaje_id: viajeId,
        ruta_hash: rutaHash,
        fecha_viaje: viaje.fecha_inicio_real || viaje.fecha_inicio_programada,
        costo_estimado: costosViaje?.costo_total_estimado || viaje.costo_estimado || 0,
        costo_real: costosViaje?.costo_total_real || viaje.costo_real || 0,
        tiempo_estimado: 60, // tiempo estimado por defecto
        tiempo_real: 60, // tiempo real por defecto
        precio_cobrado: costosViaje?.precio_final_cobrado || 0,
        margen_real: costosViaje?.margen_real || 0,
        vehiculo_tipo: viaje.vehiculo_id || 'No especificado',
        cliente_id: null
      };

      // Insertar análisis en la tabla
      const { error: analisisError } = await supabase
        .from('analisis_viajes')
        .insert(analisisData);

      if (analisisError) throw analisisError;

      return analisisData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analisis_viajes'] });
      queryClient.invalidateQueries({ queryKey: ['real-dashboard-metrics'] });
      toast.success('Análisis de viaje procesado automáticamente');
    },
    onError: (error) => {
      console.error('Error procesando análisis de viaje:', error);
      toast.error('Error al procesar análisis del viaje');
    }
  });

  // Procesar cotizaciones aprobadas automáticamente
  const procesarCotizacionesAprobadas = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      // Buscar cotizaciones aprobadas sin viaje asociado
      const { data: cotizacionesAprobadas, error } = await supabase
        .from('cotizaciones')
        .select('*')
        .eq('user_id', user.id)
        .eq('estado', 'aprobada')
        .is('viaje_id', null);

      if (error) throw error;

      const resultados = [];
      for (const cotizacion of cotizacionesAprobadas || []) {
        try {
          // Convertir a viaje automáticamente
          await convertirCotizacionAViaje.mutateAsync({
        cotizacionId: cotizacion.id,
        conductorId: cotizacion.conductor_id,
        vehiculoId: cotizacion.vehiculo_id,
        remolqueId: cotizacion.remolque_id,
        fechaInicioProgramada: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
        fechaFinProgramada: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // Pasado mañana
          });
          resultados.push({ cotizacion: cotizacion.folio_cotizacion, status: 'success' });
        } catch (error) {
          console.error(`Error procesando cotización ${cotizacion.folio_cotizacion}:`, error);
          resultados.push({ cotizacion: cotizacion.folio_cotizacion, status: 'error' });
        }
      }

      return resultados;
    },
    onSuccess: (resultados) => {
      const exitosos = resultados.filter(r => r.status === 'success').length;
      if (exitosos > 0) {
        toast.success(`${exitosos} cotizaciones convertidas a viajes automáticamente`);
      }
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
    }
  });

  // Generar cartas porte para viajes que inician
  const procesarViajesIniciados = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      // Buscar viajes en tránsito sin carta porte
      const { data: viajesEnTransito, error } = await supabase
        .from('viajes')
        .select('*')
        .eq('user_id', user.id)
        .eq('estado', 'en_transito')
        .is('carta_porte_id', null);

      if (error) throw error;

      const resultados = [];
      for (const viaje of viajesEnTransito || []) {
        try {
          // Generar carta porte automáticamente
          await generarCartaPorteDesdeViaje.mutateAsync({
            viajeId: viaje.id,
            mercanciaData: {
              descripcion: 'Carga general',
              peso_kg: 1000,
              cantidad: 1,
              unidad: 'PZA'
            },
            ubicacionesData: {
              origen: {
                tipo_ubicacion: 'Origen',
                direccion: viaje.origen,
                codigo_postal: '01000',
                fecha_hora_salida: viaje.fecha_inicio_real || new Date().toISOString()
              },
              destino: {
                tipo_ubicacion: 'Destino',
                direccion: viaje.destino,
                codigo_postal: '01000',
                distancia_recorrida: viaje.distancia_km || 100
              }
            }
          });
          resultados.push({ viaje: viaje.id, status: 'success' });
        } catch (error) {
          console.error(`Error generando carta porte para viaje ${viaje.id}:`, error);
          resultados.push({ viaje: viaje.id, status: 'error' });
        }
      }

      return resultados;
    },
    onSuccess: (resultados) => {
      const exitosos = resultados.filter(r => r.status === 'success').length;
      if (exitosos > 0) {
        toast.success(`${exitosos} cartas porte generadas automáticamente`);
      }
      queryClient.invalidateQueries({ queryKey: ['cartas_porte'] });
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
    }
  });

  // Auto-procesamiento cuando se detectan cambios
  useEffect(() => {
    if (!user?.id) return;

    // Configurar intervalo para procesamiento automático
    const interval = setInterval(async () => {
      try {
        // Procesar cotizaciones aprobadas cada 5 minutos
        await procesarCotizacionesAprobadas.mutateAsync();
        
        // Procesar viajes iniciados cada 5 minutos
        await procesarViajesIniciados.mutateAsync();
        
      } catch (error) {
        console.error('Error en procesamiento automático:', error);
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [user?.id]);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!user?.id) return;

    // Escuchar cambios en tabla viajes
    const viajesChannel = supabase
      .channel('viajes-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'viajes',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const viajeActualizado = payload.new as any;
          
          // Si el viaje se marcó como completado, procesar análisis
          if (viajeActualizado.estado === 'completado' && payload.old.estado !== 'completado') {
            procesarAnalisisViaje.mutate(viajeActualizado.id);
          }
          
          // Si el viaje cambió a en_transito, verificar carta porte
          if (viajeActualizado.estado === 'en_transito' && !viajeActualizado.carta_porte_id) {
            generarCartaPorteDesdeViaje.mutate({
              viajeId: viajeActualizado.id,
              mercanciaData: {
                descripcion: 'Carga general',
                peso_kg: 1000,
                cantidad: 1,
                unidad: 'PZA'
              },
              ubicacionesData: {
                origen: {
                  tipo_ubicacion: 'Origen',
                  direccion: viajeActualizado.origen,
                  codigo_postal: '01000',
                  fecha_hora_salida: new Date().toISOString()
                },
                destino: {
                  tipo_ubicacion: 'Destino',
                  direccion: viajeActualizado.destino,
                  codigo_postal: '01000',
                  distancia_recorrida: viajeActualizado.distancia_km || 100
                }
              }
            });
          }
        }
      )
      .subscribe();

    // Escuchar cambios en cotizaciones
    const cotizacionesChannel = supabase
      .channel('cotizaciones-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cotizaciones',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const cotizacionActualizada = payload.new as any;
          
          // Si la cotización se aprobó, convertir a viaje
          if (cotizacionActualizada.estado === 'aprobada' && payload.old.estado !== 'aprobada') {
          convertirCotizacionAViaje.mutate({
            cotizacionId: cotizacionActualizada.id,
            conductorId: cotizacionActualizada.conductor_id,
            vehiculoId: cotizacionActualizada.vehiculo_id,
            remolqueId: cotizacionActualizada.remolque_id,
            fechaInicioProgramada: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            fechaFinProgramada: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
          });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(viajesChannel);
      supabase.removeChannel(cotizacionesChannel);
    };
  }, [user?.id]);

  return {
    procesarAnalisisViaje,
    procesarCotizacionesAprobadas,
    procesarViajesIniciados,
    isProcessing: procesarAnalisisViaje.isPending || 
                 procesarCotizacionesAprobadas.isPending || 
                 procesarViajesIniciados.isPending
  };
};