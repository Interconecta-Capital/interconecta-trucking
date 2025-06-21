
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ViajeWizardData } from '@/components/viajes/ViajeWizard';

export interface ViajeCompleto {
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
  // Datos del conductor
  conductor?: {
    id: string;
    nombre: string;
    telefono?: string;
    tipo_licencia?: string;
  };
  // Datos del vehículo
  vehiculo?: {
    id: string;
    marca: string;
    modelo: string;
    placa: string;
    tipo_carroceria?: string;
    capacidad_carga?: number;
  };
  // Datos de mercancías
  mercancias?: {
    descripcion: string;
    cantidad: number;
    peso_kg: number;
    valor_total?: number;
  }[];
  // Cliente/receptor
  cliente?: {
    nombre: string;
    rfc: string;
  };
}

export const useViajesCompletos = () => {
  const queryClient = useQueryClient();
  const [isCreatingViaje, setIsCreatingViaje] = useState(false);

  // Obtener viajes con información completa
  const { data: viajes = [], isLoading } = useQuery({
    queryKey: ['viajes-completos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viajes')
        .select(`
          *,
          conductor:conductores(id, nombre, telefono, tipo_licencia),
          vehiculo:vehiculos(id, marca, modelo, placa, tipo_carroceria, capacidad_carga)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enriquecer con datos de tracking_data
      const viajesEnriquecidos = data.map(viaje => {
        let trackingData: any = {};
        
        // Safely parse tracking_data if it's a string
        if (typeof viaje.tracking_data === 'string') {
          try {
            trackingData = JSON.parse(viaje.tracking_data);
          } catch (e) {
            console.warn('Error parsing tracking_data:', e);
            trackingData = {};
          }
        } else if (viaje.tracking_data && typeof viaje.tracking_data === 'object') {
          trackingData = viaje.tracking_data;
        }
        
        return {
          ...viaje,
          mercancias: Array.isArray(trackingData.mercancias) ? trackingData.mercancias : [],
          cliente: trackingData.cliente || null,
          conductor: viaje.conductor,
          vehiculo: viaje.vehiculo
        };
      });

      return viajesEnriquecidos as ViajeCompleto[];
    }
  });

  // Filtrar viajes activos (programado, en_transito, retrasado)
  const viajesActivos = viajes.filter(viaje => 
    ['programado', 'en_transito', 'retrasado'].includes(viaje.estado)
  );

  // Filtrar historial (completado, cancelado)
  const viajesHistorial = viajes.filter(viaje => 
    ['completado', 'cancelado'].includes(viaje.estado)
  );

  // Actualizar estado del viaje
  const actualizarEstadoViaje = useMutation({
    mutationFn: async ({ id, nuevoEstado, observaciones }: { 
      id: string; 
      nuevoEstado: string; 
      observaciones?: string 
    }) => {
      const updateData: any = { estado: nuevoEstado };
      
      if (nuevoEstado === 'en_transito' && !viajes.find(v => v.id === id)?.fecha_inicio_real) {
        updateData.fecha_inicio_real = new Date().toISOString();
      }
      
      if (nuevoEstado === 'completado') {
        updateData.fecha_fin_real = new Date().toISOString();
      }
      
      if (observaciones) {
        updateData.observaciones = observaciones;
      }

      const { data, error } = await supabase
        .from('viajes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes-completos'] });
      toast.success('Estado del viaje actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error actualizando estado:', error);
      toast.error('Error al actualizar el estado del viaje');
    }
  });

  // Asignar recursos al viaje
  const asignarRecursos = useMutation({
    mutationFn: async ({ 
      viajeId, 
      conductorId, 
      vehiculoId 
    }: { 
      viajeId: string; 
      conductorId?: string; 
      vehiculoId?: string 
    }) => {
      const updates: any = {};
      if (conductorId) updates.conductor_id = conductorId;
      if (vehiculoId) updates.vehiculo_id = vehiculoId;

      const { data, error } = await supabase
        .from('viajes')
        .update(updates)
        .eq('id', viajeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes-completos'] });
      toast.success('Recursos asignados exitosamente');
    }
  });

  return {
    viajes,
    viajesActivos,
    viajesHistorial,
    isLoading,
    actualizarEstadoViaje: actualizarEstadoViaje.mutate,
    isUpdatingEstado: actualizarEstadoViaje.isPending,
    asignarRecursos: asignarRecursos.mutate,
    isAssigningRecursos: asignarRecursos.isPending
  };
};
