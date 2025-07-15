import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Cotizacion {
  id: string;
  nombre_cotizacion: string;
  folio_cotizacion: string;
  estado: 'borrador' | 'enviada' | 'aprobada' | 'cancelada';
  cliente_tipo: 'nuevo' | 'existente';
  cliente_existente_id?: string;
  cliente_nuevo_datos: any;
  empresa_datos: any;
  origen: string;
  destino: string;
  ubicaciones_intermedias: any[];
  distancia_total?: number;
  tiempo_estimado?: number;
  mapa_datos: any;
  vehiculo_id?: string;
  conductor_id?: string;
  remolque_id?: string;
  costos_internos: any;
  margen_ganancia: number;
  costo_total_interno: number;
  precio_cotizado: number;
  notas_internas?: string;
  condiciones_comerciales?: string;
  tiempo_validez_dias: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  fecha_envio?: string;
  fecha_aprobacion?: string;
  fecha_vencimiento?: string;
}

export function useCotizaciones() {
  const queryClient = useQueryClient();

  const { data: cotizaciones, isLoading, error } = useQuery({
    queryKey: ['cotizaciones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cotizaciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const createCotizacion = useMutation({
    mutationFn: async (cotizacionData: any) => {
      const { data, error } = await supabase
        .from('cotizaciones')
        .insert(cotizacionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
      toast.success('Cotización creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating cotizacion:', error);
      toast.error('Error al crear la cotización');
    }
  });

  const updateCotizacion = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Cotizacion> }) => {
      const { data, error } = await supabase
        .from('cotizaciones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
      toast.success('Cotización actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Error updating cotizacion:', error);
      toast.error('Error al actualizar la cotización');
    }
  });

  const deleteCotizacion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cotizaciones')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
      toast.success('Cotización eliminada exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting cotizacion:', error);
      toast.error('Error al eliminar la cotización');
    }
  });

  return {
    cotizaciones,
    isLoading,
    error,
    createCotizacion,
    updateCotizacion,
    deleteCotizacion
  };
}