import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Vehiculo {
  id: string;
  user_id: string;
  placa: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  num_serie?: string;
  config_vehicular?: string;
  poliza_seguro?: string;
  vigencia_seguro?: string;
  verificacion_vigencia?: string;
  id_equipo_gps?: string;
  fecha_instalacion_gps?: string;
  acta_instalacion_gps?: string;
  estado: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

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
    gcTime: 5 * 60 * 1000, // 5 minutos (renamed from cacheTime)
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
