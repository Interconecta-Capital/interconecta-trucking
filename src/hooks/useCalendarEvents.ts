
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CalendarEvent {
  id?: string;
  tipo: string;
  titulo: string;
  descripcion?: string;
  fecha_inicio: Date;
  fecha_fin?: Date;
  recordatorios?: any[];
  metadata?: Record<string, any>;
}

export function useCalendarEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const createEvent = async (eventData: CalendarEvent) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debe estar autenticado para crear eventos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: user.id,
          tipo: eventData.tipo,
          titulo: eventData.titulo,
          descripcion: eventData.descripcion,
          fecha_inicio: eventData.fecha_inicio.toISOString(),
          fecha_fin: eventData.fecha_fin?.toISOString(),
          recordatorios: eventData.recordatorios || [],
          metadata: eventData.metadata || {},
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Evento programado",
        description: `${eventData.titulo} ha sido programado exitosamente`,
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Error al programar evento: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getEvents = async () => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha_inicio', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error al obtener eventos:', error);
      return [];
    }
  };

  return {
    createEvent,
    getEvents,
    isLoading,
  };
}
