import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface OperacionEvento {
  id: string;
  tipo: string;
  titulo: string;
  fecha_inicio: string;
  fecha_fin?: string;
  metadata?: {
    estado?: string;
    carta_porte_id?: string;
    vehiculo?: string | null;
    conductor?: string | null;
    entidad?: string;
    todo_dia?: boolean;
    [key: string]: any;
  };
}

export function useOperacionesEventos(start: Date, end: Date) {
  const { user } = useAuth();

  const { data: eventos = [], isLoading } = useQuery({
    queryKey: ['operaciones-eventos', user?.id, start.toISOString(), end.toISOString()],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.functions.invoke('operaciones-eventos', {
        body: { start_date: start.toISOString(), end_date: end.toISOString() },
      });
      if (error) throw error;
      return (data?.events || []) as OperacionEvento[];
    },
    enabled: !!user?.id && !!start && !!end,
    refetchOnWindowFocus: false,
  });

  return { eventos, isLoading };
}
