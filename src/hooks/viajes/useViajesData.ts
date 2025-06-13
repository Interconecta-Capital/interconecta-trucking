
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from '../useOptimizedAuth';
import { Viaje, EventoViaje } from './types';

export const useViajesData = () => {
  const { user } = useOptimizedAuth();

  console.log('[ViajesData] Hook initialized with user:', user?.id);

  // Obtener viajes activos con manejo robusto de errores
  const { 
    data: viajesActivos = [], 
    isLoading: loadingViajes,
    error: viajesError,
    refetch: refetchViajes
  } = useQuery({
    queryKey: ['viajes-activos', user?.id],
    queryFn: async (): Promise<Viaje[]> => {
      console.log('[ViajesData] Starting viajes query for user:', user?.id);
      
      if (!user?.id) {
        console.log('[ViajesData] No user ID, returning empty array');
        return [];
      }
      
      try {
        console.log('[ViajesData] Executing Supabase query...');
        
        const { data, error } = await supabase
          .from('viajes')
          .select('*')
          .eq('user_id', user.id)
          .in('estado', ['programado', 'en_transito', 'retrasado'])
          .order('fecha_inicio_programada', { ascending: true });

        if (error) {
          console.error('[ViajesData] Supabase query error:', error);
          // Retornar array vacío en lugar de lanzar error para evitar crashes
          return [];
        }

        console.log('[ViajesData] Query successful, found viajes:', data?.length || 0);
        
        return (data || []) as Viaje[];
      } catch (error) {
        console.error('[ViajesData] Error in viajes query:', error);
        // Retornar array vacío en lugar de lanzar error
        return [];
      }
    },
    enabled: !!user?.id,
    retry: (failureCount, error) => {
      // Solo reintentar para errores de red, no para errores 500
      if (error && 'status' in error && error.status === 500) {
        console.warn('[ViajesData] Server error 500, not retrying');
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 30 * 60 * 1000, // 30 minutos para evitar requests frecuentes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    meta: {
      errorMessage: 'Error loading active trips'
    }
  });

  // Obtener historial de eventos de un viaje con mejor manejo de errores
  const obtenerEventosViaje = async (viajeId: string): Promise<EventoViaje[]> => {
    console.log('[ViajesData] Getting eventos for viaje:', viajeId);
    
    if (!viajeId) {
      console.error('[ViajesData] No viaje ID provided');
      return [];
    }
    
    try {
      console.log('[ViajesData] Executing eventos query...');
      
      const { data, error } = await supabase
        .from('eventos_viaje')
        .select('*')
        .eq('viaje_id', viajeId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('[ViajesData] Error fetching eventos:', error);
        return [];
      }

      console.log('[ViajesData] Eventos query successful, found:', data?.length || 0);
      
      return (data || []) as EventoViaje[];
    } catch (error) {
      console.error('[ViajesData] Error in obtenerEventosViaje:', error);
      return [];
    }
  };

  // Log errores pero no los propagues para evitar crashes
  if (viajesError) {
    console.error('[ViajesData] Query error detected but handled gracefully:', viajesError);
  }

  return {
    viajesActivos,
    isLoading: loadingViajes,
    error: viajesError,
    obtenerEventosViaje,
    refetchViajes
  };
};
