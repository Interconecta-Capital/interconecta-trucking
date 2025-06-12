
import { useViajesMutations } from './useViajesMutations';
import { supabase } from '@/integrations/supabase/client';

export const useViajeActions = () => {
  const { cambiarEstadoViaje, registrarEventoViaje } = useViajesMutations();

  // Iniciar viaje
  const iniciarViaje = async (viajeId: string, ubicacionActual?: string) => {
    cambiarEstadoViaje({
      viajeId,
      nuevoEstado: 'en_transito',
      observaciones: 'Viaje iniciado',
      ubicacionActual
    });
  };

  // Completar viaje
  const completarViaje = async (viajeId: string, observaciones?: string) => {
    cambiarEstadoViaje({
      viajeId,
      nuevoEstado: 'completado',
      observaciones: observaciones || 'Viaje completado exitosamente'
    });
  };

  // Reportar retraso
  const reportarRetraso = async (viajeId: string, motivo: string, tiempoEstimado?: number) => {
    cambiarEstadoViaje({
      viajeId,
      nuevoEstado: 'retrasado',
      observaciones: `Retraso: ${motivo}${tiempoEstimado ? ` (${tiempoEstimado} min estimados)` : ''}`
    });
  };

  // Actualizar ubicación en tiempo real
  const actualizarUbicacion = async (viajeId: string, coordenadas: { lat: number; lng: number }, direccion?: string) => {
    await registrarEventoViaje({
      viajeId,
      tipoEvento: 'ubicacion',
      descripcion: 'Actualización de ubicación',
      ubicacion: direccion,
      coordenadas,
      automatico: true,
      metadata: { timestamp: new Date().toISOString() }
    });

    // Actualizar tracking_data del viaje
    try {
      const { error } = await supabase
        .from('viajes')
        .update({
          tracking_data: {
            ultima_ubicacion: coordenadas,
            ultima_actualizacion: new Date().toISOString(),
            direccion: direccion
          }
        })
        .eq('id', viajeId);

      if (error) {
        console.error('Error updating tracking data:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in actualizarUbicacion:', error);
      throw error;
    }
  };

  return {
    iniciarViaje,
    completarViaje,
    reportarRetraso,
    actualizarUbicacion
  };
};
