import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Notificacion {
  id: string;
  user_id: string;
  tipo: 'success' | 'warning' | 'error' | 'info';
  titulo: string;
  mensaje: string;
  leida: boolean;
  urgente: boolean;
  metadata?: any;
  created_at: string;
}

export const useNotificaciones = () => {
  const queryClient = useQueryClient();

  // Obtener notificaciones del usuario
  const { data: notificaciones = [], isLoading } = useQuery({
    queryKey: ['notificaciones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notificacion[];
    }
  });

  // Crear notificación
  const crearNotificacion = useMutation({
    mutationFn: async ({
      tipo,
      titulo,
      mensaje,
      urgente = false,
      metadata = null
    }: {
      tipo: 'success' | 'warning' | 'error' | 'info';
      titulo: string;
      mensaje: string;
      urgente?: boolean;
      metadata?: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('notificaciones')
        .insert({
          user_id: user.id,
          tipo,
          titulo,
          mensaje,
          urgente,
          metadata,
          leida: false
        })
        .select()
        .single();

      if (error) throw error;
      return data as Notificacion;
    },
    onSuccess: (notificacion) => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
      
      // Mostrar toast según el tipo
      const toastOptions = {
        description: notificacion.mensaje,
        duration: notificacion.urgente ? 10000 : 4000,
      };

      switch (notificacion.tipo) {
        case 'success':
          toast.success(notificacion.titulo, toastOptions);
          break;
        case 'warning':
          toast.warning(notificacion.titulo, toastOptions);
          break;
        case 'error':
          toast.error(notificacion.titulo, toastOptions);
          break;
        case 'info':
          toast.info(notificacion.titulo, toastOptions);
          break;
      }
    },
    onError: (error) => {
      console.error('Error creando notificación:', error);
    }
  });

  // Marcar notificación como leída
  const marcarComoLeida = useMutation({
    mutationFn: async (notificacionId: string) => {
      const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('id', notificacionId);

      if (error) throw error;
      return notificacionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    }
  });

  // Contar notificaciones no leídas
  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;

  return {
    // Datos
    notificaciones,
    isLoading,
    notificacionesNoLeidas,

    // Funciones
    crearNotificacion: crearNotificacion.mutate,
    marcarComoLeida: marcarComoLeida.mutate,
    isCreating: crearNotificacion.isPending,
  };
};