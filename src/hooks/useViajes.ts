
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ViajeWizardData } from '@/components/viajes/ViajeWizard';

export interface Viaje {
  id: string;
  carta_porte_id: string;
  origen: string;
  destino: string;
  conductor_id?: string;
  vehiculo_id?: string;
  estado: 'programado' | 'en_transito' | 'completado' | 'cancelado' | 'retrasado';
  fecha_inicio_programada: string;
  fecha_inicio_real?: string;
  fecha_fin_programada: string;
  fecha_fin_real?: string;
  observaciones?: string;
  tracking_data?: any;
  user_id: string;
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

  // Crear viaje desde wizard - usando la nueva tabla viajes
  const crearViaje = useMutation({
    mutationFn: async (wizardData: ViajeWizardData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Mapear datos del wizard a la estructura de la tabla viajes existente
      const viajeData = {
        carta_porte_id: `CP-${Date.now()}`, // Temporal hasta que se genere la carta porte
        origen: wizardData.origen?.direccion || '',
        destino: wizardData.destino?.direccion || '',
        conductor_id: wizardData.conductor?.id,
        vehiculo_id: wizardData.vehiculo?.id,
        estado: 'programado' as const,
        fecha_inicio_programada: new Date().toISOString(),
        fecha_fin_programada: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        observaciones: `Viaje ${wizardData.cliente?.nombre_razon_social || 'Sin cliente'}`,
        tracking_data: JSON.parse(JSON.stringify(wizardData)), // Convert to proper JSON
        user_id: user.id
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
