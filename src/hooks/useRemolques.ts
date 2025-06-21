
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Remolque {
  id: string;
  placa: string;
  subtipo_rem: string;
  vehiculo_id?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export const useRemolques = () => {
  const queryClient = useQueryClient();

  // Obtener todos los remolques del usuario
  const { data: remolques = [], isLoading } = useQuery({
    queryKey: ['remolques'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('remolques_ccp')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo remolques:', error);
        throw error;
      }

      return data || [];
    }
  });

  // Obtener remolques disponibles (sin asignar)
  const remolquesDisponibles = remolques.filter(r => !r.autotransporte_id);

  // Crear remolque
  const crearRemolque = useMutation({
    mutationFn: async (remolqueData: {
      placa: string;
      subtipo_rem: string;
      autotransporte_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('remolques_ccp')
        .insert(remolqueData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remolques'] });
      toast.success('Remolque creado exitosamente');
    },
    onError: (error) => {
      console.error('Error creando remolque:', error);
      toast.error('Error al crear el remolque');
    }
  });

  // Asignar remolque a vehículo
  const asignarRemolque = useMutation({
    mutationFn: async ({ 
      remolqueId, 
      autotransporteId 
    }: { 
      remolqueId: string; 
      autotransporteId: string;
    }) => {
      const { data, error } = await supabase
        .from('remolques_ccp')
        .update({ autotransporte_id: autotransporteId })
        .eq('id', remolqueId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remolques'] });
      toast.success('Remolque asignado exitosamente');
    },
    onError: (error) => {
      console.error('Error asignando remolque:', error);
      toast.error('Error al asignar el remolque');
    }
  });

  // Desasignar remolque
  const desasignarRemolque = useMutation({
    mutationFn: async (remolqueId: string) => {
      const { data, error } = await supabase
        .from('remolques_ccp')
        .update({ autotransporte_id: null })
        .eq('id', remolqueId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remolques'] });
      toast.success('Remolque desasignado exitosamente');
    },
    onError: (error) => {
      console.error('Error desasignando remolque:', error);
      toast.error('Error al desasignar el remolque');
    }
  });

  return {
    remolques,
    remolquesDisponibles,
    isLoading,
    crearRemolque: crearRemolque.mutate,
    asignarRemolque: asignarRemolque.mutate,
    desasignarRemolque: desasignarRemolque.mutate,
    isCreating: crearRemolque.isPending,
    isAssigning: asignarRemolque.isPending
  };
};
