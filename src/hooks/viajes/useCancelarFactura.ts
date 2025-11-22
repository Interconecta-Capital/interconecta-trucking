// ============================================
// FASE 7: Hook para Cancelar Factura
// ISO 27001 A.12.4: Auditoría y registro
// ============================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CancelarFacturaParams {
  facturaId: string;
  viajeId: string;
  motivoCancelacion: string;
  detallesCancelacion: string;
}

export function useCancelarFactura() {
  const queryClient = useQueryClient();

  const cancelarFacturaMutation = useMutation({
    mutationFn: async ({ 
      facturaId, 
      viajeId,
      motivoCancelacion, 
      detallesCancelacion 
    }: CancelarFacturaParams) => {
      console.log('🚫 [CANCELAR FACTURA] Iniciando cancelación - ISO 27001 A.12.4.1');
      
      // 1. Obtener datos del viaje - ISO 27001 A.9.2.1
      const { data: viaje, error: viajeError } = await supabase
        .from('viajes')
        .select('conductor_id, tracking_data')
        .eq('id', viajeId)
        .single();
        
      if (viajeError) {
        console.error('❌ Error obteniendo viaje:', viajeError);
        throw viajeError;
      }
      
      const conductorId = viaje.conductor_id;
      console.log('📍 Conductor a liberar:', conductorId);

      // 2. Llamar edge function para cancelar en el SAT
      console.log('📡 Llamando edge function cancelar-cfdi-sw...');
      const { data: cancelData, error: cancelError } = await supabase.functions.invoke('cancelar-cfdi-sw', {
        body: {
          facturaId,
          motivo: motivoCancelacion
        }
      });
      
      if (cancelError || !cancelData?.success) {
        console.error('❌ Error cancelando en SAT:', cancelError || cancelData?.error);
        throw new Error(cancelData?.error || 'Error al cancelar factura en el SAT');
      }
      
      console.log('✅ Factura cancelada en SAT');

      // 3. Actualizar estado de la factura en BD - ISO 27001 A.18.1.4
      const { error: updateFacturaError } = await supabase
        .from('facturas')
        .update({
          status: 'cancelada',
          motivo_cancelacion: motivoCancelacion,
          fecha_cancelacion: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', facturaId);
        
      if (updateFacturaError) {
        console.error('❌ Error actualizando factura:', updateFacturaError);
        throw updateFacturaError;
      }
      
      console.log('✅ Factura actualizada en BD');

      // 4. Liberar conductor (actualizar disponibilidad) - ISO 27001 A.9.2.1
      if (conductorId) {
        const { error: conductorError } = await supabase
          .from('conductores')
          .update({
            estado: 'disponible',
            viaje_actual_id: null,
            fecha_proxima_disponibilidad: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', conductorId);
          
        if (conductorError) {
          console.error('⚠️ Error liberando conductor:', conductorError);
          // No lanzar error, solo loggear
        } else {
          console.log('✅ Conductor liberado:', conductorId);
        }
      }

      // 5. Registrar evento en el viaje - ISO 27001 A.12.4.1
      const { error: eventoError } = await supabase
        .from('eventos_viaje')
        .insert({
          viaje_id: viajeId,
          tipo_evento: 'cancelacion_factura',
          descripcion: `Factura cancelada. Motivo SAT: ${motivoCancelacion}. Detalles: ${detallesCancelacion}`,
          metadata: {
            motivo_sat: motivoCancelacion,
            detalles_internos: detallesCancelacion,
            conductor_liberado: conductorId,
            factura_id: facturaId,
            timestamp_iso27001: new Date().toISOString()
          },
          automatico: false
        });
        
      if (eventoError) {
        console.error('⚠️ Error registrando evento:', eventoError);
      } else {
        console.log('✅ Evento de cancelación registrado');
      }

      return { 
        success: true, 
        conductorLiberado: !!conductorId,
        conductorId 
      };
    },
    onSuccess: (data) => {
      // Invalidar queries relevantes
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      queryClient.invalidateQueries({ queryKey: ['conductores'] });
      queryClient.invalidateQueries({ queryKey: ['eventos-viaje'] });
      
      const mensaje = data.conductorLiberado 
        ? `Factura cancelada exitosamente. Conductor liberado y disponible para nuevos viajes.`
        : 'Factura cancelada exitosamente.';
      
      toast.success(mensaje, { duration: 5000 });
      console.log('✅ [CANCELAR FACTURA] Proceso completado exitosamente');
    },
    onError: (error: Error) => {
      console.error('❌ [CANCELAR FACTURA] Error:', error);
      toast.error(`Error al cancelar factura: ${error.message}`, { duration: 7000 });
    }
  });

  return {
    cancelarFactura: cancelarFacturaMutation.mutate,
    isCancelling: cancelarFacturaMutation.isPending
  };
}
