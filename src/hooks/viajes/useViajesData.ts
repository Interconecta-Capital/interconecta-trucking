
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';
import { Viaje, EventoViaje } from './types';

export const useViajesData = () => {
  const { user } = useAuth();

  console.log('[ViajesData] Hook initialized with user:', user?.id);

  // Obtener viajes activos con mejor manejo de errores
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
          throw new Error(`Error fetching viajes: ${error.message}`);
        }

        console.log('[ViajesData] Query successful, found viajes:', data?.length || 0);
        console.log('[ViajesData] Viajes data:', data);
        
        return (data || []) as Viaje[];
      } catch (error) {
        console.error('[ViajesData] Error in viajes query:', error);
        
        // Re-throw with more context
        if (error instanceof Error) {
          throw new Error(`Failed to load viajes: ${error.message}`);
        }
        throw new Error('Failed to load viajes: Unknown error');
      }
    },
    enabled: !!user?.id,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutos
    meta: {
      errorMessage: 'Error loading active trips'
    }
  });

  // Log del estado actual
  console.log('[ViajesData] Current state:', {
    viajesCount: viajesActivos.length,
    loading: loadingViajes,
    hasError: !!viajesError,
    userId: user?.id
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
        throw new Error(`Error fetching eventos: ${error.message}`);
      }

      console.log('[ViajesData] Eventos query successful, found:', data?.length || 0);
      console.log('[ViajesData] Eventos data:', data);
      
      return (data || []) as EventoViaje[];
    } catch (error) {
      console.error('[ViajesData] Error in obtenerEventosViaje:', error);
      
      // Return empty array instead of throwing to avoid breaking UI
      if (error instanceof Error) {
        console.error('[ViajesData] Eventos error details:', error.message);
      }
      
      return [];
    }
  };

  // Log errores si existen
  if (viajesError) {
    console.error('[ViajesData] Query error detected:', viajesError);
  }

  return {
    viajesActivos,
    isLoading: loadingViajes,
    error: viajesError,
    obtenerEventosViaje,
    refetchViajes
  };
};
