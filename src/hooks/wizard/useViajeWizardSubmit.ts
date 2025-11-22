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
      
      // 🔧 FASE 1: Convertir descripcionMercancia a array si es necesario
      if ((!wizardData.mercancias || wizardData.mercancias.length === 0) && wizardData.descripcionMercancia) {
        console.log('🔄 [WIZARD SUBMIT] Convirtiendo descripción a mercancías...');
        
        // Importar dinámicamente el mapper
        const { ViajeToCartaPorteMapper } = await import('@/services/viajes/ViajeToCartaPorteMapper');
        const mercanciasGeneradas = ViajeToCartaPorteMapper.generateIntelligentMercancia(wizardData);
        
        wizardData.mercancias = mercanciasGeneradas;
        console.log(`✅ [WIZARD SUBMIT] Mercancías generadas: ${mercanciasGeneradas.length}`);
        
        toast.info(`📦 ${mercanciasGeneradas.length} mercancía(s) procesada(s)`);
      }
      
      // Llamar al orquestador
      const result = await ViajeOrchestrationService.crearViajeCompleto(wizardData);
      
      console.log('✅ [WIZARD SUBMIT] Viaje completo creado:', result);
      return result;
    },
    onSuccess: (result) => {
      // Invalidar cache de viajes
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
      queryClient.invalidateQueries({ queryKey: ['viajes-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['viajes-activos'] });

      // Toast de éxito
      toast.success('🎉 Viaje programado correctamente', {
        description: result.factura_id 
          ? 'Viaje, factura y carta porte creados exitosamente'
          : 'Viaje y carta porte creados exitosamente',
        duration: 5000
      });

      // ✅ CORRECCIÓN: Navegar a /viajes y guardar ID para abrir modal automáticamente
      sessionStorage.setItem('ultimo_viaje_creado', result.viaje_id);
      navigate('/viajes');
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
