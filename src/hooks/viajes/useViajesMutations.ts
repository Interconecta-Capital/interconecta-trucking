
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Viaje, EventoViaje, ViajeEstadoParams, EventoViajeParams } from './types';

export const useViajesMutations = () => {
  const queryClient = useQueryClient();

  // Cambiar estado de viaje
  const cambiarEstadoMutation = useMutation({
    mutationFn: async (params: ViajeEstadoParams) => {
      const { data, error } = await supabase
        .from('viajes')
        .update({ 
          estado: params.nuevoEstado,
          observaciones: params.observaciones,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.viajeId)
        .select()
        .single();

      if (error) throw error;
      return data as Viaje;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
    }
  });

  // Registrar evento de viaje
  const registrarEventoMutation = useMutation({
    mutationFn: async (params: EventoViajeParams) => {
      const { data, error } = await supabase
        .from('eventos_viaje')
        .insert({
          viaje_id: params.viajeId,
          tipo_evento: params.tipoEvento,
          descripcion: params.descripcion,
          ubicacion: params.ubicacion,
          coordenadas: params.coordenadas,
          automatico: params.automatico || false,
          metadata: params.metadata
        })
        .select()
        .single();

      if (error) throw error;
      return data as EventoViaje;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-viaje'] });
    }
  });

  // Actualizar viaje (para el editor)
  const actualizarViajeMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Viaje> }) => {
      const { data, error } = await supabase
        .from('viajes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Viaje;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
      toast.success('Viaje actualizado correctamente');
    },
    onError: (error: any) => {
      console.error('Error actualizando viaje:', error);
      toast.error('Error al actualizar el viaje');
    }
  });

  // FASE 6: Validar antes de eliminar - ISO 27001 A.18.1.4
  const validarEliminacionViaje = async (viajeId: string) => {
    console.log('🔍 [VALIDACIÓN] Verificando documentos timbrados para viaje:', viajeId);
    
    // Verificar si tiene factura timbrada
    const { data: factura, error: facturaError } = await supabase
      .from('facturas')
      .select('status, folio, serie')
      .eq('viaje_id', viajeId)
      .eq('status', 'timbrada')
      .maybeSingle();
    
    if (facturaError && facturaError.code !== 'PGRST116') {
      console.error('Error verificando factura:', facturaError);
      throw facturaError;
    }
      
    if (factura) {
      throw new Error(
        `No se puede eliminar: El viaje tiene una factura timbrada (${factura.serie}-${factura.folio}). ` +
        `Los documentos fiscales timbrados no pueden ser eliminados por cumplimiento con el SAT.`
      );
    }
    
    // Verificar si tiene carta porte timbrada
    const { data: cartaPorte, error: cartaPorteError } = await supabase
      .from('cartas_porte')
      .select('status, id_ccp, uuid_fiscal')
      .eq('viaje_id', viajeId)
      .eq('status', 'timbrada')
      .maybeSingle();
    
    if (cartaPorteError && cartaPorteError.code !== 'PGRST116') {
      console.error('Error verificando carta porte:', cartaPorteError);
      throw cartaPorteError;
    }
      
    if (cartaPorte) {
      const uuid = cartaPorte.uuid_fiscal || cartaPorte.id_ccp || 'N/A';
      throw new Error(
        `No se puede eliminar: El viaje tiene una Carta Porte timbrada. ` +
        `Los documentos fiscales timbrados no pueden ser eliminados por cumplimiento con el SAT. ` +
        `UUID: ${uuid}`
      );
    }
    
    console.log('✅ [VALIDACIÓN] No hay documentos timbrados. Eliminación permitida.');
    return true;
  };

  // Eliminar viaje con validación
  const eliminarViajeMutation = useMutation({
    mutationFn: async (id: string) => {
      // FASE 6: Validar ANTES de intentar eliminar - ISO 27001 A.18.1.4
      await validarEliminacionViaje(id);
      
      // Si pasa la validación, proceder con eliminación
      const { error } = await supabase
        .from('viajes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
      toast.success('Viaje eliminado correctamente');
    },
    onError: (error: any) => {
      console.error('Error eliminando viaje:', error);
      toast.error(error.message || 'Error al eliminar el viaje', { duration: 7000 });
    }
  });

  return {
    cambiarEstadoViaje: cambiarEstadoMutation.mutate,
    registrarEventoViaje: registrarEventoMutation.mutate,
    actualizarViaje: actualizarViajeMutation.mutate,
    eliminarViaje: eliminarViajeMutation.mutate,
    isLoading: cambiarEstadoMutation.isPending || registrarEventoMutation.isPending,
    isUpdatingViaje: actualizarViajeMutation.isPending,
    isDeleting: eliminarViajeMutation.isPending
  };
};
