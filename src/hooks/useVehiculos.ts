
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Vehiculo {
  id?: string;
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
  estado?: string;
  activo?: boolean;
}

export const useVehiculos = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener vehículos del usuario
  const { data: vehiculos = [], isLoading } = useQuery({
    queryKey: ['vehiculos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehiculos')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Crear vehículo
  const createVehiculoMutation = useMutation({
    mutationFn: async (vehiculo: Vehiculo) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('vehiculos')
        .insert({
          ...vehiculo,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      toast({
        title: "Éxito",
        description: "Vehículo creado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear el vehículo",
        variant: "destructive",
      });
    },
  });

  // Actualizar vehículo
  const updateVehiculoMutation = useMutation({
    mutationFn: async ({ id, ...vehiculo }: Vehiculo & { id: string }) => {
      const { data, error } = await supabase
        .from('vehiculos')
        .update(vehiculo)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      toast({
        title: "Éxito",
        description: "Vehículo actualizado correctamente",
      });
    },
  });

  // Eliminar vehículo (soft delete)
  const eliminarVehiculo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vehiculos')
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      toast({
        title: "Éxito",
        description: "Vehículo eliminado correctamente",
      });
    },
  });

  return {
    vehiculos,
    isLoading,
    createVehiculo: createVehiculoMutation.mutate,
    updateVehiculo: updateVehiculoMutation.mutate,
    eliminarVehiculo: eliminarVehiculo.mutate,
    isCreating: createVehiculoMutation.isPending,
    isUpdating: updateVehiculoMutation.isPending,
  };
};
