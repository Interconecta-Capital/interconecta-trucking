
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Socio {
  id?: string;
  nombre_razon_social: string;
  rfc: string;
  tipo_persona?: string;
  telefono?: string;
  email?: string;
  direccion?: any;
  estado?: string;
  activo?: boolean;
}

export const useSocios = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener socios del usuario
  const { data: socios = [], isLoading } = useQuery({
    queryKey: ['socios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('socios')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Crear socio
  const createSocioMutation = useMutation({
    mutationFn: async (socio: Socio) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('socios')
        .insert({
          ...socio,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socios'] });
      toast({
        title: "Éxito",
        description: "Socio creado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear el socio",
        variant: "destructive",
      });
    },
  });

  // Actualizar socio
  const updateSocioMutation = useMutation({
    mutationFn: async ({ id, ...socio }: Socio & { id: string }) => {
      const { data, error } = await supabase
        .from('socios')
        .update(socio)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socios'] });
      toast({
        title: "Éxito",
        description: "Socio actualizado correctamente",
      });
    },
  });

  // Eliminar socio (soft delete)
  const eliminarSocio = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('socios')
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socios'] });
      toast({
        title: "Éxito",
        description: "Socio eliminado correctamente",
      });
    },
  });

  return {
    socios,
    isLoading,
    crearSocio: createSocioMutation.mutate,
    updateSocio: updateSocioMutation.mutate,
    eliminarSocio: eliminarSocio.mutate,
    isCreating: createSocioMutation.isPending,
    isUpdating: updateSocioMutation.isPending,
  };
};
