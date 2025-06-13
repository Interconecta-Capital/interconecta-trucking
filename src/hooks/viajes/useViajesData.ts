
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';
import { Viaje, EventoViaje } from './types';

export const useViajesData = () => {
  const { user } = useAuth();

  console.log('[ViajesData] Hook initialized with user:', user?.id);

  // Obtener viajes activos con mejor manejo de errores y menos frecuencia
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
        console.log('[ViajesData] Viajes data:', data);
        
        return (data || []) as Viaje[];
      } catch (error) {
        console.error('[ViajesData] Error in viajes query:', error);
        // Retornar array vacío en lugar de lanzar error
        return [];
      }
    },
    enabled: !!user?.id,
    retry: 2, // Reducido de 3 a 2
    retryDelay: attemptIndex => Math.min(2000 * 2 ** attemptIndex, 10000), // Reducido delay máximo
    staleTime: 10 * 60 * 1000, // Aumentado a 10 minutos
    refetchOnWindowFocus: false, // Evitar refetch automático
    refetchOnReconnect: false, // Evitar refetch en reconexión
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
        return []; // Retornar array vacío en lugar de lanzar
      }

      console.log('[ViajesData] Eventos query successful, found:', data?.length || 0);
      console.log('[ViajesData] Eventos data:', data);
      
      return (data || []) as EventoViaje[];
    } catch (error) {
      console.error('[ViajesData] Error in obtenerEventosViaje:', error);
      return [];
    }
  };

  // Log errores si existen pero no los propagues para evitar crashes
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
