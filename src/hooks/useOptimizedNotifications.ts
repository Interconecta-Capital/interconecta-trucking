
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface NotificationOptimizada {
  id: string;
  user_id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  urgente: boolean;
  leida: boolean;
  created_at: string;
}

// Hook optimizado para notificaciones con actualizaciones en tiempo real
export const useOptimizedNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notificaciones = [], isLoading } = useQuery({
    queryKey: ['notificaciones-optimized', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50); // Limitar para mejor rendimiento

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds para notificaciones
    refetchOnWindowFocus: true,
  });

  // Mutation para marcar como leída
  const marcarComoLeida = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones-optimized'] });
    }
  });

  // Estadísticas optimizadas
  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;
  const notificacionesUrgentes = notificaciones.filter(n => n.urgente && !n.leida).length;

  return {
    notificaciones,
    notificacionesNoLeidas,
    notificacionesUrgentes,
    isLoading,
    marcarComoLeida: marcarComoLeida.mutateAsync,
    isMarkingRead: marcarComoLeida.isPending,
  };
};
