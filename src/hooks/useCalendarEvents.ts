
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface CalendarEvent {
  id?: string;
  user_id?: string;
  tipo_evento: string;
  titulo: string;
  descripcion?: string;
  fecha_inicio: Date;
  fecha_fin?: Date;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export const useCalendarEvents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createEvent = async (eventData: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('eventos_calendario')
      .insert({
        ...eventData,
        tipo_evento: eventData.tipo_evento,
        fecha_inicio: eventData.fecha_inicio.toISOString(),
        fecha_fin: eventData.fecha_fin?.toISOString(),
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    queryClient.invalidateQueries({ queryKey: ['eventos-calendario'] });
    toast.success('Evento creado exitosamente');
    
    return data;
  };

  return {
    createEvent,
  };
};
