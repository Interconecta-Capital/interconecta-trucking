
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CancelacionCFDI {
  uuid: string;
  motivo: string;
  folioSustitucion?: string;
}

export const useCancelacionCFDI = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const cancelarCFDI = useMutation({
    mutationFn: async ({ uuid, motivo, folioSustitucion }: CancelacionCFDI) => {
      console.log('Iniciando cancelación CFDI:', { uuid, motivo, folioSustitucion });

      const { data, error } = await supabase.functions.invoke('cancelar-cfdi', {
        body: {
          uuid,
          motivo,
          folioSustitucion
        },
      });

      if (error) {
        console.error('Error en cancelación:', error);
        throw error;
      }

      console.log('Respuesta de cancelación:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      // Actualizar estado en base de datos
      supabase
        .from('cartas_porte')
        .update({ 
          status: 'cancelado',
          updated_at: new Date().toISOString()
        })
        .eq('uuid_fiscal', variables.uuid)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['cartas-porte'] });
        });

      toast({
        title: "CFDI Cancelado",
        description: `El CFDI ${variables.uuid} ha sido cancelado exitosamente`,
      });
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

  return {
    cancelarCFDI: cancelarCFDI.mutate,
    isCancelling: cancelarCFDI.isPending,
  };
};
