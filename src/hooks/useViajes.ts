
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ViajeWizardData } from '@/components/viajes/ViajeWizard';

export interface Viaje {
  id: string;
  user_id: string;
  nombre_viaje: string;
  status: 'programado' | 'en_curso' | 'completado' | 'cancelado';
  datos_viaje: any;
  cliente_id?: string;
  vehiculo_id?: string;
  conductor_id?: string;
  origen?: any;
  destino?: any;
  distancia_recorrida?: number;
  fecha_programada?: string;
  fecha_completado?: string;
  carta_porte_id?: string;
  created_at: string;
  updated_at: string;
}

export const useViajes = () => {
  const queryClient = useQueryClient();

  // Obtener todos los viajes
  const { data: viajes = [], isLoading } = useQuery({
    queryKey: ['viajes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viajes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Viaje[];
    }
  });

  // Crear viaje desde wizard
  const crearViaje = useMutation({
    mutationFn: async (wizardData: ViajeWizardData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const viajeData = {
        user_id: user.id,
        nombre_viaje: `Viaje ${wizardData.cliente?.nombre_razon_social || 'Sin cliente'}`,
        status: 'programado' as const,
        datos_viaje: wizardData,
        cliente_id: wizardData.cliente?.id,
        vehiculo_id: wizardData.vehiculo?.id,
        conductor_id: wizardData.conductor?.id,
        origen: wizardData.origen,
        destino: wizardData.destino,
        distancia_recorrida: wizardData.distanciaRecorrida,
        fecha_programada: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('viajes')
        .insert(viajeData)
        .select()
        .single();

      if (error) throw error;
      return data as Viaje;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
      toast.success('Viaje creado exitosamente');
    },
    onError: (error) => {
      console.error('Error creando viaje:', error);
      toast.error('Error al crear el viaje');
    }
  });

  // Actualizar estado del viaje
  const actualizarViaje = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Viaje> }) => {
      const { data, error } = await supabase
        .from('viajes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Viaje;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
    }
  });

  return {
    viajes,
    isLoading,
    crearViaje: crearViaje.mutate,
    isCreatingViaje: crearViaje.isPending,
    actualizarViaje: actualizarViaje.mutate,
    isUpdatingViaje: actualizarViaje.isPending
  };
};
