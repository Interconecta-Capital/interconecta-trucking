
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Ubicacion } from '@/types/ubicaciones';
import { DistanceOptimizationService } from '@/services/ai/DistanceOptimizationService';

interface OptimizationResult {
  distanciaTotal: number;
  tiempoTotal: number;
  ubicacionesOptimizadas: Ubicacion[];
  ahorroDistancia: number;
  ahorroTiempo: number;
  coordenadasRuta: Array<{ lat: number; lng: number }>;
}

export const useDistanceOptimization = () => {
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const { toast } = useToast();

  const optimizarRuta = useMutation({
    mutationFn: async (ubicaciones: Ubicacion[]) => {
      console.log('🚀 Iniciando optimización de ruta con IA...');
      return await DistanceOptimizationService.optimizarRutaCompleta(ubicaciones);
    },
    onSuccess: (data) => {
      setOptimizationResult(data);
      
      const mensajeExito = data.ahorroDistancia > 0 
        ? `🎯 ¡Ruta optimizada! Ahorro: ${data.ahorroDistancia} km (${data.ahorroTiempo} min)`
        : `✅ Ruta calculada: ${data.distanciaTotal} km en ${data.tiempoTotal} min`;
      
      toast({
        title: "Optimización completada",
        description: mensajeExito,
      });

      console.log('✅ Optimización exitosa:', {
        distanciaTotal: data.distanciaTotal,
        ahorro: data.ahorroDistancia,
        ubicaciones: data.ubicacionesOptimizadas.length
      });
    },
    onError: (error: Error) => {
      console.error('❌ Error en optimización:', error);
      toast({
        title: "Error en optimización",
        description: error.message || "No se pudo optimizar la ruta",
        variant: "destructive",
      });
    },
  });

  const calcularRutaSimple = useMutation({
    mutationFn: async (ubicaciones: Ubicacion[]) => {
      console.log('📏 Calculando ruta simple...');
      // Usar el servicio de cálculo básico
      return await DistanceOptimizationService.optimizarRutaCompleta(ubicaciones);
    },
    onSuccess: (data) => {
      setOptimizationResult(data);
      toast({
        title: "Ruta calculada",
        description: `Distancia total: ${data.distanciaTotal} km`,
      });
    },
    onError: (error: Error) => {
      console.error('❌ Error calculando ruta:', error);
      toast({
        title: "Error calculando ruta",
        description: error.message || "No se pudo calcular la ruta",
        variant: "destructive",
      });
    },
  });

  const limpiarOptimizacion = () => {
    setOptimizationResult(null);
    DistanceOptimizationService.clearCache();
  };

  const aplicarOptimizacion = (onUbicacionesChange: (ubicaciones: Ubicacion[]) => void) => {
    if (optimizationResult && optimizationResult.ubicacionesOptimizadas) {
      onUbicacionesChange(optimizationResult.ubicacionesOptimizadas);
      
      toast({
        title: "Optimización aplicada",
        description: "El orden de ubicaciones ha sido optimizado",
      });
    }
  };

  return {
    // Estados
    optimizationResult,
    isOptimizing: optimizarRuta.isPending,
    isCalculating: calcularRutaSimple.isPending,
    
    // Funciones
    optimizarRuta: optimizarRuta.mutate,
    calcularRutaSimple: calcularRutaSimple.mutate,
    limpiarOptimizacion,
    aplicarOptimizacion,
    
    // Helpers
    tieneOptimizacion: !!optimizationResult,
    tieneAhorro: !!optimizationResult && optimizationResult.ahorroDistancia > 0,
  };
};
