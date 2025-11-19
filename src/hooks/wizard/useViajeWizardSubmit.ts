/**
 * Hook especializado para el envío/creación del viaje
 * Usa React Query para caching y gestión de estado
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ViajeWizardData } from '@/components/viajes/ViajeWizard';
import { ViajeOrchestrationService } from '@/services/viajes/ViajeOrchestrationService';

export const useViajeWizardSubmit = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createViajeMutation = useMutation({
    mutationFn: async (wizardData: ViajeWizardData) => {
      console.log('🚀 [WIZARD SUBMIT] Iniciando creación de viaje completo...');
      
      // Llamar al orquestador
      const result = await ViajeOrchestrationService.crearViajeCompleto(wizardData);
      
      console.log('✅ [WIZARD SUBMIT] Viaje completo creado:', result);
      return result;
    },
    onSuccess: (result) => {
      // Invalidar cache de viajes
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
      queryClient.invalidateQueries({ queryKey: ['viajes-dashboard'] });

      // Toast de éxito
      toast.success('🎉 Viaje programado correctamente', {
        description: result.factura_id 
          ? 'Viaje, factura y carta porte creados exitosamente'
          : 'Viaje y carta porte creados exitosamente',
        duration: 5000,
        action: {
          label: 'Ver Viaje',
          onClick: () => navigate(`/viajes/${result.viaje_id}`)
        }
      });

      // Navegar después de un breve delay
      setTimeout(() => {
        navigate(`/viajes/${result.viaje_id}`);
      }, 2000);
    },
    onError: (error: Error) => {
      console.error('❌ [WIZARD SUBMIT] Error creando viaje:', error);
      
      toast.error('Error al programar el viaje', {
        description: error.message || 'Ocurrió un error inesperado',
        duration: 8000
      });
    }
  });

  return {
    createViaje: createViajeMutation.mutate,
    isCreating: createViajeMutation.isPending,
    error: createViajeMutation.error,
    data: createViajeMutation.data,
    reset: createViajeMutation.reset
  };
};
