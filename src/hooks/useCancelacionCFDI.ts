
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CancelacionCFDI {
  uuid: string;
  rfc: string;
  motivo: string;
  folioSustitucion?: string;
  ambiente?: 'sandbox' | 'production';
}

export interface ConsultaEstatusCFDI {
  re: string; // RFC Emisor
  rr: string; // RFC Receptor
  tt: string; // Total
  id: string; // UUID
  fe: string; // Últimos 8 caracteres del sello
  ambiente?: 'sandbox' | 'production';
}

export const useCancelacionCFDI = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Consultar estatus antes de cancelar
  const consultarEstatus = async (params: ConsultaEstatusCFDI) => {
    const { data, error } = await supabase.functions.invoke('consultar-estatus-cfdi', {
      body: params
    });

    if (error) throw error;
    return data;
  };

  // Cancelar CFDI
  const cancelarCFDI = useMutation({
    mutationFn: async ({ uuid, rfc, motivo, folioSustitucion, ambiente = 'sandbox' }: CancelacionCFDI) => {
      console.log('🚀 Iniciando cancelación CFDI con SmartWeb:', { uuid: uuid.substring(0, 20) + '...', rfc, motivo });

      const { data, error } = await supabase.functions.invoke('cancelar-cfdi-sw', {
        body: {
          uuid,
          rfcEmisor: rfc,
          motivo,
          folioSustitucion,
          ambiente
        },
      });

      if (error) {
        console.error('❌ Error en cancelación:', error);
        throw new Error(error.message || 'Error al cancelar CFDI');
      }

      if (!data.success) {
        console.error('❌ Cancelación fallida:', data);
        throw new Error(data.error || 'Error al cancelar CFDI');
      }

      console.log('✅ Cancelación exitosa:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte'] });
      queryClient.invalidateQueries({ queryKey: ['solicitudes-cancelacion'] });

      if (data.requiere_aceptacion) {
        toast({
          title: "Solicitud de Cancelación Enviada",
          description: "El receptor debe aceptar la cancelación. Se te notificará cuando sea procesada.",
        });
      } else {
        toast({
          title: "CFDI Cancelado",
          description: `El CFDI ${variables.uuid} ha sido cancelado exitosamente`,
        });
      }
    },
    onError: (error: any, variables) => {
      console.error('Error cancelando CFDI:', error);
      toast({
        title: "Error en Cancelación",
        description: error.message || "No se pudo cancelar el CFDI",
        variant: "destructive",
      });
    },
  });

  // Obtener solicitudes pendientes
  const { data: solicitudesPendientes, isLoading: loadingSolicitudes } = useQuery({
    queryKey: ['solicitudes-cancelacion'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solicitudes_cancelacion_cfdi')
        .select('*')
        .in('estado', ['pendiente', 'procesando'])
        .order('fecha_solicitud', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return {
    cancelarCFDI: cancelarCFDI.mutate,
    isCancelling: cancelarCFDI.isPending,
    consultarEstatus,
    solicitudesPendientes,
    loadingSolicitudes,
  };
};
