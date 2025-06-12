
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useVehiculos = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query optimizada con cache mejorado
  const { data: vehiculos = [], isLoading: loading, error } = useQuery({
    queryKey: ['vehiculos', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('vehiculos')
        .select('*')
        .eq('user_id', user.id)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutos
    cacheTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutación para crear vehículo
  const crearVehiculoMutation = useMutation({
    mutationFn: async (vehiculoData: any) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('vehiculos')
        .insert({
          ...vehiculoData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
    },
  });

  // Mutación para actualizar vehículo
  const actualizarVehiculoMutation = useMutation({
    mutationFn: async ({ id, ...vehiculoData }: any) => {
      const { data, error } = await supabase
        .from('vehiculos')
        .update(vehiculoData)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
    },
  });

  // Mutación para eliminar vehículo
  const eliminarVehiculoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vehiculos')
        .update({ activo: false })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
    },
  });

  return {
    vehiculos,
    loading,
    error,
    crearVehiculo: crearVehiculoMutation.mutateAsync,
    actualizarVehiculo: actualizarVehiculoMutation.mutateAsync,
    eliminarVehiculo: eliminarVehiculoMutation.mutateAsync,
    isCreating: crearVehiculoMutation.isPending,
    isUpdating: actualizarVehiculoMutation.isPending,
    isDeleting: eliminarVehiculoMutation.isPending,
  };
};
