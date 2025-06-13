
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleAuth } from '../useSimpleAuth';
import { Viaje, EventoViaje } from './types';

export const useViajesData = () => {
  const { user } = useSimpleAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Query para viajes activos
  const { data: viajesActivos, error, refetch } = useQuery({
    queryKey: ['viajes-activos', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('viajes')
        .select('*')
        .eq('user_id', user.id)
        .in('estado', ['programado', 'en_transito', 'retrasado'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Viaje[];
    },
    enabled: !!user?.id
  });

  // Función para obtener eventos de un viaje
  const obtenerEventosViaje = async (viajeId: string): Promise<EventoViaje[]> => {
    try {
      const { data, error } = await supabase
        .from('eventos_viaje')
        .select('*')
        .eq('viaje_id', viajeId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data as EventoViaje[];
    } catch (error) {
      console.error('Error fetching eventos:', error);
      return [];
    }
  };

  return {
    viajesActivos: viajesActivos || [],
    isLoading,
    error,
    obtenerEventosViaje,
    refetch
  };
};
