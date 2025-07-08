
import { useMemo } from 'react';
import { ViajeWizardData } from '@/components/viajes/ViajeWizard';
import { useCalculadoraCostosProfesional } from './useCalculadoraCostosProfesional';

interface IntelligentCostParams {
  wizardData: ViajeWizardData;
}

export const useIntelligentCostCalculator = ({ wizardData }: IntelligentCostParams) => {
  return useMemo(() => {
    // Si no hay datos suficientes, retornar cálculo básico
    if (!wizardData.distanciaRecorrida) {
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
        marca: wizardData.vehiculo.marca || 'N/A',
        modelo: wizardData.vehiculo.modelo || 'N/A',
        rendimiento: wizardData.vehiculo.rendimiento || 3.5,
        tipo_combustible: (wizardData.vehiculo.tipo_combustible as 'diesel' | 'gasolina') || 'diesel',
        capacidad_carga: wizardData.vehiculo.capacidad_carga || 28000,
        peso_bruto_vehicular: wizardData.vehiculo.peso_bruto_vehicular,
        costo_mantenimiento_km: wizardData.vehiculo.costo_mantenimiento_km || 2.07,
        costo_llantas_km: wizardData.vehiculo.costo_llantas_km || 1.08,
        valor_vehiculo: wizardData.vehiculo.valor_vehiculo || 1500000,
        configuracion_ejes: wizardData.vehiculo.configuracion_ejes || 'T3S2',
        factor_peajes: wizardData.vehiculo.factor_peajes || 2.0
      } : undefined,
      tipoServicio: wizardData.tipoServicio
    };

    // Usar el hook de cálculo profesional
    const breakdown = useCalculadoraCostosProfesional(calculoParams);

    if (breakdown) {
      return {
        total: breakdown.costoTotal,
        breakdown,
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
