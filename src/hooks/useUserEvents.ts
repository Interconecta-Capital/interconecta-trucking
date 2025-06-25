import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserEvents = (start: Date, end: Date) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['eventos-calendario', user?.id, start.toISOString(), end.toISOString()],
    queryFn: async () => {
      if (!user?.id) return [] as any[];
      const { data, error } = await supabase
        .from('eventos_calendario')
        .select('*')
        .eq('user_id', user.id)
        .gte('fecha_inicio', start.toISOString())
        .lte('fecha_inicio', end.toISOString())
        .order('fecha_inicio', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!start && !!end,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
