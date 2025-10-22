
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useViajeActions = () => {
  const queryClient = useQueryClient();

  // Iniciar viaje
  const iniciarViaje = async (viajeId: string, ubicacionActual?: string) => {
    const { data, error } = await supabase
      .from('viajes')
      .update({
        estado: 'en_transito',
        fecha_inicio_real: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', viajeId)
      .select()
      .single();

    if (error) throw error;

    // Registrar evento
    await supabase
      .from('eventos_viaje')
      .insert({
        viaje_id: viajeId,
        tipo_evento: 'inicio',
        descripcion: 'Viaje iniciado',
        ubicacion: ubicacionActual,
        automatico: false
      });

    queryClient.invalidateQueries({ queryKey: ['viajes-activos'] });
    return data;
  };

  // Completar viaje
  const completarViaje = async (viajeId: string, observaciones?: string) => {
    const { data, error } = await supabase
      .from('viajes')
      .update({
        estado: 'completado',
        fecha_fin_real: new Date().toISOString(),
        observaciones: observaciones,
        updated_at: new Date().toISOString()
      })
      .eq('id', viajeId)
      .select()
      .single();

    if (error) throw error;

    // Registrar evento
    await supabase
      .from('eventos_viaje')
      .insert({
        viaje_id: viajeId,
        tipo_evento: 'entrega',
        descripcion: 'Viaje completado',
        automatico: false
      });

    // Actualizar analisis_viajes con datos reales para aprendizaje IA
    try {
      // Obtener costos reales del viaje
      const { data: costosData } = await supabase
        .from('costos_viaje')
        .select('costo_total_real')
        .eq('viaje_id', viajeId)
        .maybeSingle();

      // Calcular tiempo real en horas
      const tiempoRealHoras = data.fecha_inicio_real && data.fecha_fin_real
        ? Math.round((new Date(data.fecha_fin_real).getTime() - new Date(data.fecha_inicio_real).getTime()) / (1000 * 60 * 60))
        : null;

      // Calcular margen real
      const costoReal = costosData?.costo_total_real || data.costo_estimado;
      const margenReal = data.precio_cobrado && costoReal 
        ? ((data.precio_cobrado - costoReal) / data.precio_cobrado) * 100
        : null;

      // Actualizar registro de análisis
      await supabase
        .from('analisis_viajes')
        .update({
          costo_real: costoReal,
          margen_real: margenReal,
          tiempo_real: tiempoRealHoras,
          updated_at: new Date().toISOString()
        })
        .eq('viaje_id', viajeId);

      console.log('✅ IA actualizada con datos reales del viaje');
      toast.success('Viaje completado. IA aprendiendo de esta experiencia.');
    } catch (iaError) {
      console.warn('⚠️ No se pudo actualizar análisis IA:', iaError);
      // No fallar la operación principal por esto
    }

    queryClient.invalidateQueries({ queryKey: ['viajes-activos'] });
    return data;
  };

  // Reportar retraso
  const reportarRetraso = async (viajeId: string, motivo: string, tiempoRetraso?: number) => {
    const { data, error } = await supabase
      .from('viajes')
      .update({
        estado: 'retrasado',
        observaciones: motivo,
        updated_at: new Date().toISOString()
      })
      .eq('id', viajeId)
      .select()
      .single();

    if (error) throw error;

    // Registrar evento
    await supabase
      .from('eventos_viaje')
      .insert({
        viaje_id: viajeId,
        tipo_evento: 'retraso',
        descripcion: `Retraso reportado: ${motivo}`,
        metadata: { tiempoRetraso },
        automatico: false
      });

    queryClient.invalidateQueries({ queryKey: ['viajes-activos'] });
    return data;
  };

  // Actualizar ubicación
  const actualizarUbicacion = async (
    viajeId: string, 
    coordenadas: { lat: number; lng: number }, 
    descripcionUbicacion: string
  ) => {
    // Registrar evento de ubicación
    const { data, error } = await supabase
      .from('eventos_viaje')
      .insert({
        viaje_id: viajeId,
        tipo_evento: 'ubicacion',
        descripcion: `Ubicación actualizada: ${descripcionUbicacion}`,
        ubicacion: descripcionUbicacion,
        coordenadas: coordenadas,
        automatico: false
      })
      .select()
      .single();

    if (error) throw error;

    queryClient.invalidateQueries({ queryKey: ['eventos-viaje'] });
    return data;
  };

  return {
    iniciarViaje,
    completarViaje,
    reportarRetraso,
    actualizarUbicacion
  };
};
