
import { useMemo } from 'react';
import { ViajeWizardData } from '@/components/viajes/ViajeWizard';

export interface CostBreakdown {
  combustible: {
    amount: number;
    details: string;
    calculation: string;
  };
  conductor: {
    amount: number;
    details: string;
    calculation: string;
  };
  peajes: {
    amount: number;
    details: string;
    calculation: string;
  };
  mantenimiento: {
    amount: number;
    details: string;
    calculation: string;
  };
  operativo: {
    amount: number;
    details: string;
    calculation: string;
  };
  total: number;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
}

interface CostCalculatorParams {
  wizardData: ViajeWizardData;
  precioCombustiblePorLitro?: number;
  tarifaConductorPorHora?: number;
}

export const useIntelligentCostCalculator = ({ 
  wizardData, 
  precioCombustiblePorLitro = 24.50, // Precio promedio diesel México
  tarifaConductorPorHora = 85 
}: CostCalculatorParams): CostBreakdown => {
  
  return useMemo(() => {
    const vehiculo = wizardData.vehiculo;
    const conductor = wizardData.conductor;
    const distancia = wizardData.distanciaRecorrida || 0;
    const tipoServicio = wizardData.tipoServicio;
    
    const warnings: string[] = [];
    let confidence: 'high' | 'medium' | 'low' = 'high';

    // Fallback a cálculo básico si faltan datos críticos
    if (!vehiculo || !distancia) {
      const basicCost = distancia * 12; // Cálculo original
      confidence = 'low';
      warnings.push('Usando cálculo básico por falta de datos del vehículo');
      
      return {
        combustible: { amount: basicCost * 0.4, details: 'Estimación básica', calculation: 'Cálculo genérico' },
        conductor: { amount: basicCost * 0.3, details: 'Estimación básica', calculation: 'Cálculo genérico' },
        peajes: { amount: basicCost * 0.15, details: 'Estimación básica', calculation: 'Cálculo genérico' },
        mantenimiento: { amount: basicCost * 0.1, details: 'Estimación básica', calculation: 'Cálculo genérico' },
        operativo: { amount: basicCost * 0.05, details: 'Estimación básica', calculation: 'Cálculo genérico' },
        total: basicCost,
        confidence,
        warnings
      };
    }

    // 1. CÁLCULO DE COMBUSTIBLE
    const rendimiento = vehiculo.rendimiento || 3.5; // km/litro promedio para camiones
    const tipoCombustible = vehiculo.tipo_combustible || 'diesel';
    const precioFinal = tipoCombustible === 'gasolina' ? precioCombustiblePorLitro * 0.85 : precioCombustiblePorLitro;
    
    const litrosNecesarios = distancia / rendimiento;
    const costoCombustible = litrosNecesarios * precioFinal;
    
    if (!vehiculo.rendimiento) {
      warnings.push('Rendimiento no especificado, usando promedio de 3.5 km/l');
      confidence = 'medium';
    }

    // 2. CÁLCULO DE CONDUCTOR
    const velocidadPromedio = 65; // km/h promedio en carretera
    const tiempoViaje = distancia / velocidadPromedio;
    const horasFacturables = Math.max(tiempoViaje, 8); // Mínimo 8 horas
    const costoConductor = horasFacturables * tarifaConductorPorHora;

    // 3. CÁLCULO DE PEAJES
    // Estimación basada en distancia y tipo de vehículo
    const factorPeaje = vehiculo.tipo_carroceria === 'Semirremolque' ? 1.8 : 1.2;
    const costoPeajes = (distancia / 100) * 150 * factorPeaje; // ~$150 pesos cada 100km

    // 4. CÁLCULO DE MANTENIMIENTO Y DESGASTE
    const factorDesgaste = vehiculo.capacidad_carga ? 
      Math.min(vehiculo.capacidad_carga / 20000, 1.5) : 1.0; // Factor basado en capacidad
    const costoMantenimiento = distancia * 2.5 * factorDesgaste; // $2.5 por km ajustado

    // 5. COSTOS OPERATIVOS
    const costoSeguroDiario = 180; // Costo promedio de seguro por día
    const costoAdministrativo = costoCombustible * 0.08; // 8% del costo de combustible
    const costoOperativo = costoSeguroDiario + costoAdministrativo;

    // Factor de servicio
    const factorServicio = tipoServicio === 'flete_pagado' ? 1.15 : 1.0;

    const subtotal = (costoCombustible + costoConductor + costoPeajes + costoMantenimiento + costoOperativo) * factorServicio;

    return {
      combustible: {
        amount: Math.round(costoCombustible * factorServicio),
        details: `${litrosNecesarios.toFixed(1)}L × $${precioFinal.toFixed(2)}`,
        calculation: `${distancia}km ÷ ${rendimiento}km/L × $${precioFinal.toFixed(2)}/L`
      },
      conductor: {
        amount: Math.round(costoConductor * factorServicio),
        details: `${horasFacturables.toFixed(1)}h × $${tarifaConductorPorHora}`,
        calculation: `${distancia}km ÷ ${velocidadPromedio}km/h × $${tarifaConductorPorHora}/h`
      },
      peajes: {
        amount: Math.round(costoPeajes * factorServicio),
        details: `${(distancia/100).toFixed(1)} tramos × $${(150 * factorPeaje).toFixed(0)}`,
        calculation: `Estimación basada en tipo ${vehiculo.tipo_carroceria || 'estándar'}`
      },
      mantenimiento: {
        amount: Math.round(costoMantenimiento * factorServicio),
        details: `${distancia}km × $${(2.5 * factorDesgaste).toFixed(2)}/km`,
        calculation: `Factor de desgaste: ${factorDesgaste.toFixed(2)}`
      },
      operativo: {
        amount: Math.round(costoOperativo * factorServicio),
        details: `Seguro diario + admin (${(costoAdministrativo * factorServicio).toFixed(0)})`,
        calculation: `$${costoSeguroDiario} + 8% del combustible`
      },
      total: Math.round(subtotal),
      confidence,
      warnings
    };
  }, [wizardData, precioCombustiblePorLitro, tarifaConductorPorHora]);
};
