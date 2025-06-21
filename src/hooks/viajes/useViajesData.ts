
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Viaje, EventoViaje } from './types';

export const useViajesData = () => {
  // Obtener viajes activos
  const { data: viajesActivos, isLoading, error } = useQuery({
    queryKey: ['viajes-activos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viajes')
        .select('*')
        .in('estado', ['programado', 'en_transito', 'retrasado'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Viaje[];
    }
  });

  // Función para obtener eventos de un viaje específico
  const obtenerEventosViaje = async (viajeId: string): Promise<EventoViaje[]> => {
    const { data, error } = await supabase
      .from('eventos_viaje')
      .select('*')
      .eq('viaje_id', viajeId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data as EventoViaje[];
  };

  return {
    viajesActivos,
    isLoading,
    error,
    obtenerEventosViaje
  };
};
