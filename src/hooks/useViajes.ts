
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

// Estado global para prevenir duplicaciones
const viajesEnProceso = new Set<string>();

function generarViajeSignature(wizardData: ViajeWizardData): string {
  return [
    wizardData.cliente?.rfc || '',
    wizardData.origen?.direccion || '',
    wizardData.destino?.direccion || '',
    wizardData.vehiculo?.id || '',
    wizardData.conductor?.id || '',
    Date.now().toString().slice(0, -4) // Agrupa por minutos para evitar duplicados rápidos
  ].join('|');
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

  // Crear viaje desde wizard - VERSIÓN IDEMPOTENTE
  const crearViaje = useMutation({
    mutationFn: async (wizardData: ViajeWizardData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Generar signature única para este viaje
      const viajeSignature = generarViajeSignature(wizardData);
      
      console.log('🔒 Verificando duplicados para signature:', viajeSignature);
      
      // Verificar si ya está en proceso
      if (viajesEnProceso.has(viajeSignature)) {
        console.log('⚠️ Viaje ya en proceso, evitando duplicado');
        throw new Error('Este viaje ya está siendo procesado. Por favor espera.');
      }

      // Marcar como en proceso
      viajesEnProceso.add(viajeSignature);

      try {
        // Verificar si ya existe un viaje similar en la base de datos (último minuto)
        const ahoraMinusUnMinuto = new Date(Date.now() - 60000).toISOString();
        
        const { data: viajesExistentes, error: errorConsulta } = await supabase
          .from('viajes')
          .select('id, tracking_data')
          .eq('user_id', user.id)
          .gte('created_at', ahoraMinusUnMinuto)
          .order('created_at', { ascending: false })
          .limit(5);

        if (errorConsulta) {
          console.warn('⚠️ Error consultando viajes existentes:', errorConsulta);
        }

        // Verificar duplicados en tracking_data con type assertion
        if (viajesExistentes && viajesExistentes.length > 0) {
          for (const viajeExistente of viajesExistentes) {
            const trackingExistente = viajeExistente.tracking_data as any;
            if (trackingExistente && 
                typeof trackingExistente === 'object' &&
                trackingExistente.cliente?.rfc === wizardData.cliente?.rfc &&
                trackingExistente.origen?.direccion === wizardData.origen?.direccion &&
                trackingExistente.destino?.direccion === wizardData.destino?.direccion) {
              
              console.log('🔍 Viaje duplicado detectado:', viajeExistente.id);
              throw new Error('Ya existe un viaje similar creado recientemente. Revisa la lista de viajes.');
            }
          }
        }

        // Mapear datos del wizard a la estructura de la tabla viajes
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

        console.log('💾 Creando nuevo viaje:', viajeData.origen, '->', viajeData.destino);

        const { data, error } = await supabase
          .from('viajes')
          .insert(viajeData)
          .select()
          .single();

        if (error) {
          console.error('❌ Error insertando viaje:', error);
          throw error;
        }

        console.log('✅ Viaje creado exitosamente:', data.id);
        return data as Viaje;

      } finally {
        // Limpiar el estado de procesamiento después de 30 segundos
        setTimeout(() => {
          viajesEnProceso.delete(viajeSignature);
          console.log('🧹 Limpieza de signature:', viajeSignature);
        }, 30000);
      }
    },
    onSuccess: (viaje) => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
      toast.success(`Viaje creado exitosamente: ${viaje.origen} → ${viaje.destino}`);
    },
    onError: (error) => {
      console.error('❌ Error creando viaje:', error);
      toast.error(error.message || 'Error al crear el viaje');
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
