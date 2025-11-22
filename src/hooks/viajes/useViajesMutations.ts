
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
      
      console.log('🗑️ [ELIMINACIÓN] Iniciando eliminación en cascada para viaje:', id);
      
      // FASE 3.3: Obtener el viaje para acceder a tracking_data y factura_id
      const { data: viaje, error: viajeError } = await supabase
        .from('viajes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (viajeError) {
        console.error('[FASE 3.3] Error obteniendo viaje:', viajeError);
        throw viajeError;
      }
      
      let eliminados = {
        borradores_cp: 0,
        cartas_porte: 0,
        facturas: 0,
        documentos: 0
      };
      
      // 1. Eliminar borrador de carta porte si existe en tracking_data
      const trackingData = viaje.tracking_data as any;
      const borradorCartaPorteId = trackingData?.borrador_carta_porte_id;
      if (borradorCartaPorteId) {
        console.log('[ELIMINACIÓN] Eliminando borrador de carta porte:', borradorCartaPorteId);
        const { error: borradorError } = await supabase
          .from('borradores_carta_porte')
          .delete()
          .eq('id', borradorCartaPorteId);
        
        if (borradorError) {
          console.error('[ELIMINACIÓN] Error eliminando borrador:', borradorError);
        } else {
          eliminados.borradores_cp++;
          console.log('[ELIMINACIÓN] ✅ Borrador de carta porte eliminado');
        }
      }
      
      // 2. Eliminar TODAS las cartas porte NO TIMBRADAS asociadas a este viaje
      const { data: cartasPorte, error: cartasError } = await supabase
        .from('cartas_porte')
        .select('id, status, id_ccp, fecha_timbrado')
        .eq('viaje_id', id);
      
      if (!cartasError && cartasPorte && cartasPorte.length > 0) {
        for (const cp of cartasPorte) {
          // Solo eliminar si NO está timbrada (sin fecha_timbrado o status diferente a 'timbrada')
          if (!cp.fecha_timbrado && cp.status !== 'timbrada' && cp.status !== 'timbrado') {
            console.log('[ELIMINACIÓN] Eliminando carta porte no timbrada:', cp.id, cp.id_ccp);
            const { error: cpError } = await supabase
              .from('cartas_porte')
              .delete()
              .eq('id', cp.id);
            
            if (cpError) {
              console.error('[ELIMINACIÓN] Error eliminando carta porte:', cpError);
            } else {
              eliminados.cartas_porte++;
              console.log('[ELIMINACIÓN] ✅ Carta porte eliminada:', cp.id_ccp);
            }
          } else {
            console.log('[ELIMINACIÓN] ⏭️ Carta porte timbrada, no se puede eliminar:', cp.id_ccp);
          }
        }
      }
      
      // 3. Eliminar TODAS las facturas NO TIMBRADAS asociadas a este viaje
      const { data: facturas, error: facturasError } = await supabase
        .from('facturas')
        .select('id, status, folio, serie, fecha_timbrado')
        .eq('viaje_id', id);
      
      if (!facturasError && facturas && facturas.length > 0) {
        for (const factura of facturas) {
          // Solo eliminar si NO está timbrada
          if (!factura.fecha_timbrado && factura.status !== 'timbrada' && factura.status !== 'timbrado') {
            console.log('[ELIMINACIÓN] Eliminando factura no timbrada:', factura.id, `${factura.serie}-${factura.folio}`);
            const { error: facturaError } = await supabase
              .from('facturas')
              .delete()
              .eq('id', factura.id);
            
            if (facturaError) {
              console.error('[ELIMINACIÓN] Error eliminando factura:', facturaError);
            } else {
              eliminados.facturas++;
              console.log('[ELIMINACIÓN] ✅ Factura eliminada:', `${factura.serie}-${factura.folio}`);
            }
          } else {
            console.log('[ELIMINACIÓN] ⏭️ Factura timbrada, no se puede eliminar:', `${factura.serie}-${factura.folio}`);
          }
        }
      }
      
      // 4. Eliminar documentos relacionados (hojas de ruta, checklists, etc.)
      const { data: documentos, error: docsError } = await supabase
        .from('documentos_entidades')
        .select('id, tipo_documento, nombre_archivo')
        .eq('entidad_tipo', 'viaje')
        .eq('entidad_id', id);
      
      if (!docsError && documentos && documentos.length > 0) {
        for (const doc of documentos) {
          console.log('[ELIMINACIÓN] Eliminando documento:', doc.tipo_documento, doc.nombre_archivo);
          const { error: docError } = await supabase
            .from('documentos_entidades')
            .delete()
            .eq('id', doc.id);
          
          if (docError) {
            console.error('[ELIMINACIÓN] Error eliminando documento:', docError);
          } else {
            eliminados.documentos++;
            console.log('[ELIMINACIÓN] ✅ Documento eliminado:', doc.nombre_archivo);
          }
        }
      }
      
      // 5. Si pasa la validación, proceder con eliminación del viaje
      const { error } = await supabase
        .from('viajes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      console.log('[ELIMINACIÓN] ✅ Viaje eliminado correctamente');
      console.log('[ELIMINACIÓN] 📊 Resumen:', eliminados);
      
      return eliminados;
    },
    onSuccess: (eliminados) => {
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
      queryClient.invalidateQueries({ queryKey: ['cartas-porte'] });
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      
      // Mensaje detallado de lo que se eliminó
      const detalles: string[] = [];
      if (eliminados.borradores_cp > 0) detalles.push(`${eliminados.borradores_cp} borrador(es) de carta porte`);
      if (eliminados.cartas_porte > 0) detalles.push(`${eliminados.cartas_porte} carta(s) porte`);
      if (eliminados.facturas > 0) detalles.push(`${eliminados.facturas} factura(s)`);
      if (eliminados.documentos > 0) detalles.push(`${eliminados.documentos} documento(s)`);
      
      const mensaje = detalles.length > 0 
        ? `Viaje eliminado junto con: ${detalles.join(', ')}`
        : 'Viaje eliminado correctamente';
      
      toast.success(mensaje, {
        description: 'Solo se eliminaron documentos no timbrados',
        duration: 5000
      });
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
