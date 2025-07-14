
import { useMemo } from 'react';
import { ViajeWizardData } from '@/components/viajes/ViajeWizard';
import { useCalculadoraCostosProfesional } from './useCalculadoraCostosProfesional';

interface IntelligentCostParams {
  wizardData: ViajeWizardData;
}

export const useIntelligentCostCalculator = ({ wizardData }: IntelligentCostParams) => {
  return useMemo(() => {
    console.log('🧮 Calculando costos inteligentes para:', {
      distancia: wizardData.distanciaRecorrida,
      vehiculo: wizardData.vehiculo?.placa,
      tipoServicio: wizardData.tipoServicio
    });

    // Si no hay datos suficientes, retornar cálculo básico
    if (!wizardData.distanciaRecorrida || isNaN(wizardData.distanciaRecorrida) || wizardData.distanciaRecorrida <= 0) {
      console.log('⚠️ Datos insuficientes para cálculo profesional, usando básico');
      return {
        total: 1000,
        breakdown: null,
        hasBreakdown: false,
        precision: 'basic'
      };
    }

    // Preparar parámetros para el cálculo profesional
    const calculoParams = {
      distancia: wizardData.distanciaRecorrida,
      tiempoEstimadoHoras: wizardData.distanciaRecorrida ? Math.round(wizardData.distanciaRecorrida / 60) : undefined,
      vehiculo: wizardData.vehiculo ? {
        id: wizardData.vehiculo.id,
        placa: wizardData.vehiculo.placa,
        marca: wizardData.vehiculo.marca,
        modelo: wizardData.vehiculo.modelo,
        rendimiento: wizardData.vehiculo.rendimiento,
        tipo_combustible: wizardData.vehiculo.tipo_combustible,
        capacidad_carga: wizardData.vehiculo.capacidad_carga,
        peso_bruto_vehicular: wizardData.vehiculo.peso_bruto_vehicular,
        costo_mantenimiento_km: wizardData.vehiculo.costo_mantenimiento_km || 2.07,
        costo_llantas_km: wizardData.vehiculo.costo_llantas_km || 1.08,
        valor_vehiculo: wizardData.vehiculo.valor_vehiculo,
        configuracion_ejes: wizardData.vehiculo.configuracion_ejes || 'T3S2',
        factor_peajes: wizardData.vehiculo.factor_peajes || 2.0
      } : undefined,
      tipoServicio: wizardData.tipoServicio
    };

    // Intentar cálculo profesional
    const professionalCalc = useCalculadoraCostosProfesional(calculoParams);

    if (professionalCalc) {
      return {
        total: professionalCalc.costoTotal,
        breakdown: professionalCalc,
        hasBreakdown: true,
        precision: 'professional'
      };
    }

    // Fallback a cálculo básico
    const baseCost = wizardData.distanciaRecorrida * 12;
    const serviceFactor = wizardData.tipoServicio === 'flete_pagado' ? 1.2 : 1.0;
    
    return {
      total: Math.round(baseCost * serviceFactor),
      breakdown: null,
      hasBreakdown: false,
      precision: 'basic'
    };
  }, [wizardData]);
};
