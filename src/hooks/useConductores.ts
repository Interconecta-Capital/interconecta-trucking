
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Conductor {
  id?: string;
  nombre: string;
  rfc?: string;
  curp?: string;
  num_licencia?: string;
  tipo_licencia?: string;
  vigencia_licencia?: string;
  telefono?: string;
  email?: string;
  direccion?: any;
  estado?: string;
  activo?: boolean;
}

export const useConductores = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener conductores del usuario
  const { data: conductores = [], isLoading: loading } = useQuery({
    queryKey: ['conductores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conductores')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Crear conductor
  const crearConductorMutation = useMutation({
    mutationFn: async (conductor: Conductor) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('conductores')
        .insert({
          ...conductor,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conductores'] });
      toast({
        title: "Éxito",
        description: "Conductor creado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear el conductor",
        variant: "destructive",
      });
    },
  });

  // Actualizar conductor
  const actualizarConductorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Conductor }) => {
      const { data: result, error } = await supabase
        .from('conductores')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conductores'] });
      toast({
        title: "Éxito",
        description: "Conductor actualizado correctamente",
      });
    },
  });

  // Eliminar conductor (soft delete)
  const eliminarConductorMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('conductores')
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conductores'] });
      toast({
        title: "Éxito",
        description: "Conductor eliminado correctamente",
      });
    },
  });

  return {
    conductores,
    loading,
    crearConductor: crearConductorMutation.mutate,
    actualizarConductor: actualizarConductorMutation.mutate,
    eliminarConductor: eliminarConductorMutation.mutate,
    isCreating: crearConductorMutation.isPending,
    isUpdating: actualizarConductorMutation.isPending,
    isDeleting: eliminarConductorMutation.isPending,
  };
};
