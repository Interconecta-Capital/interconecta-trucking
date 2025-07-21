
import { useState, useCallback } from 'react';
import { CostosCalculatorProfesional, ParametrosCalculoCostos, ResultadoCalculoCostos } from '@/services/costos/CostosCalculatorProfesional';
import { ConfiguracionVehicular } from '@/types/vehiculosBenchmarks';

export const useCostosViajeProfesional = () => {
  const [loading, setLoading] = useState(false);
  const [ultimoCalculo, setUltimoCalculo] = useState<ResultadoCalculoCostos | null>(null);

  const calcularCostosProfesionales = useCallback(async (parametros: ParametrosCalculoCostos): Promise<ResultadoCalculoCostos> => {
    setLoading(true);
    
    try {
      // Simular pequeño delay para mostrar loading (en producción aquí iría llamada a APIs externas)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const resultado = CostosCalculatorProfesional.calcularCostosViaje(parametros);
      
      setUltimoCalculo(resultado);
      
      console.log('💰 Cálculo profesional completado:', {
        configuracion: parametros.configuracionVehicular,
        distancia: parametros.distanciaKm,
        costoTotal: resultado.costoTotalVariable,
        recomendaciones: resultado.recomendaciones.length
      });
      
      return resultado;
      
    } catch (error) {
      console.error('Error en cálculo profesional:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const obtenerBenchmarkVehicular = useCallback((configuracion: ConfiguracionVehicular) => {
    return CostosCalculatorProfesional;
  }, []);

  const calcularMargenRecomendado = useCallback((costoTotal: number, tipoOperacion: 'transporte_pesado' | 'ultima_milla') => {
    // Márgenes recomendados según tipo de operación
    const margenesRecomendados = {
      transporte_pesado: {
        minimo: 15,
        objetivo: 25,
        excelente: 35
      },
      ultima_milla: {
        minimo: 20,
        objetivo: 30,
        excelente: 45
      }
    };
    
    const margenes = margenesRecomendados[tipoOperacion];
    
    return {
      precioMinimo: Math.round(costoTotal * (1 + margenes.minimo / 100)),
      precioObjetivo: Math.round(costoTotal * (1 + margenes.objetivo / 100)),
      precioExcelente: Math.round(costoTotal * (1 + margenes.excelente / 100)),
      margenes
    };
  }, []);

  return {
    calcularCostosProfesionales,
    obtenerBenchmarkVehicular,
    calcularMargenRecomendado,
    loading,
    ultimoCalculo
  };
};
