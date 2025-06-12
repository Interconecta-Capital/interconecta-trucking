
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';
import { Viaje, EventoViaje } from './types';

export const useViajesData = () => {
  const { user } = useAuth();

  // Obtener viajes activos
  const { data: viajesActivos = [], isLoading: loadingViajes } = useQuery({
    queryKey: ['viajes-activos', user?.id],
    queryFn: async (): Promise<Viaje[]> => {
      if (!user?.id) return [];
      
      console.log('Fetching viajes for user:', user.id);
      
      try {
        const { data, error } = await supabase
          .from('viajes')
          .select('*')
          .eq('user_id', user.id)
          .in('estado', ['programado', 'en_transito', 'retrasado'])
          .order('fecha_inicio_programada', { ascending: true });

        if (error) {
          console.error('Error fetching viajes:', error);
          throw error;
        }

        console.log('Viajes data:', data);
        return (data || []) as Viaje[];
      } catch (error) {
        console.error('Error in viajes query:', error);
        return [];
      }
    },
    enabled: !!user?.id,
  });

  // Obtener historial de eventos de un viaje
  const obtenerEventosViaje = async (viajeId: string): Promise<EventoViaje[]> => {
    console.log('Fetching eventos for viaje:', viajeId);
    
    try {
      const { data, error } = await supabase
        .from('eventos_viaje')
        .select('*')
        .eq('viaje_id', viajeId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching eventos:', error);
        throw error;
      }

      console.log('Eventos data:', data);
      return (data || []) as EventoViaje[];
    } catch (error) {
      console.error('Error in obtenerEventosViaje:', error);
      return [];
    }
  };

  return {
    viajesActivos,
    isLoading: loadingViajes,
    obtenerEventosViaje
  };
};
