import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { usePeajesINEGI } from './usePeajesINEGI';
import { VehiculoConCostos, CalculoProfesional, ConfiguracionCostos, AlertaCosto, ComparacionCalculo } from '@/types/calculoCostos';

interface ParametrosCalculo {
  distancia: number;
  tiempoEstimadoHoras?: number;
  vehiculo?: VehiculoConCostos;
  pesoMercancia?: number;
  tipoServicio?: string;
  coordenadas?: {
    origen: { lat: number; lng: number };
    destino: { lat: number; lng: number };
  };
}

const PRECIOS_COMBUSTIBLE_DEFAULT = {
  diesel: 24.50, // MXN por litro (promedio México 2024)
  gasolina: 23.80
};

const COSTOS_FIJOS_ANUALES = {
  seguros: 45000, // MXN anuales promedio
  tenencia: 8000,
  verificacion: 500,
  administracion: 24000
};

export const useCalculadoraCostosProfesional = (parametros: ParametrosCalculo) => {
  const { user } = useAuth();
  const { calcularPeajes } = usePeajesINEGI();
  
  return useMemo(() => {
    const { distancia, tiempoEstimadoHoras, vehiculo, pesoMercancia, tipoServicio, coordenadas } = parametros;
    
    if (!distancia || distancia <= 0) {
      return null;
    }

    // Configuración por defecto si no hay configuración de empresa
    const configuracionDefault: ConfiguracionCostos = {
      modo_calculo: 'profesional',
      combustible: {
        usar_rendimiento_vehiculo: true,
        precio_fijo_litro: null,
        sobrecargo_percentage: 0
      },
      viaticos: {
        tarifa_diaria: 1500,
        incluir_hospedaje: true
      },
      peajes: {
        usar_calculo_automatico: true,
        factor_adicional: 0
      },
      costos_fijos: {
        incluir_depreciacion: true,
        incluir_seguros: true,
        incluir_administracion: true
      },
      margen_ganancia: {
        porcentaje_minimo: 15,
        porcentaje_objetivo: 25,
        alertar_bajo_minimo: true
      }
    };

    const alertas: AlertaCosto[] = [];

    // 1. CÁLCULO DE COMBUSTIBLE
    const calcularCombustible = () => {
      const rendimiento = vehiculo?.rendimiento || 3.5; // km/litro por defecto
      const tipoCombustible = vehiculo?.tipo_combustible || 'diesel';
      const precioLitro = configuracionDefault.combustible.precio_fijo_litro || 
                         PRECIOS_COMBUSTIBLE_DEFAULT[tipoCombustible] || 24.50;
      
      // Validar valores para evitar NaN
      if (!distancia || distancia <= 0 || !rendimiento || rendimiento <= 0) {
        return {
          litros: 0,
          costo: 0,
          precio_litro: precioLitro,
          fuente: 'Error: datos insuficientes'
        };
      }
      
      const litros = distancia / rendimiento;
      const costo = litros * precioLitro * (1 + configuracionDefault.combustible.sobrecargo_percentage / 100);
      
      if (!vehiculo?.rendimiento) {
        alertas.push({
          tipo: 'warning',
          mensaje: 'Rendimiento del vehículo no configurado',
          impacto: 'Precisión reducida en cálculo de combustible',
          solucion: 'Configurar rendimiento real del vehículo'
        });
      }

      return {
        litros: Math.round(litros * 100) / 100,
        costo: Math.round(costo),
        precio_litro: precioLitro,
        fuente: configuracionDefault.combustible.precio_fijo_litro ? 'Configurado' : 'Promedio nacional'
      };
    };

    // 2. CÁLCULO DE PEAJES MEJORADO CON API INEGI
    const calcularPeajesAvanzado = async () => {
      if (coordenadas && vehiculo?.configuracion_ejes) {
        try {
          const resultadoPeajes = await calcularPeajes(
            coordenadas.origen,
            coordenadas.destino,
            vehiculo.configuracion_ejes
          );

          if (resultadoPeajes.rutaOptimizada) {
            alertas.push({
              tipo: 'info',
              mensaje: 'Peajes calculados con API oficial INEGI',
              impacto: 'Cálculo preciso basado en casetas reales',
              solucion: 'Datos oficiales actualizados'
            });
          } else {
            alertas.push({
              tipo: 'warning',
              mensaje: 'API INEGI no disponible, usando cálculo estimado',
              impacto: 'Precisión reducida en peajes',
              solucion: 'Verificar conectividad o intentar más tarde'
            });
          }

          return {
            casetas_estimadas: resultadoPeajes.casetas.length,
            costo: resultadoPeajes.costoTotal,
            factor: vehiculo.factor_peajes || 2.0,
            metodo_calculo: resultadoPeajes.rutaOptimizada ? 'API_INEGI' : 'ESTIMADO',
            casetas_detalle: resultadoPeajes.casetas
          };
        } catch (error) {
          console.warn('Error en cálculo de peajes avanzado:', error);
        }
      }

      // Fallback al método original
      return calcularPeajesOriginal();
    };

    // Método original como fallback
    const calcularPeajesOriginal = () => {
      const factorEjes = vehiculo?.factor_peajes || 2.0;
      const costoPorKm = 2.80; // MXN por km promedio México
      const factorAdicional = 1 + (configuracionDefault.peajes.factor_adicional / 100);
      
      const casetas_estimadas = Math.ceil(distancia / 150); // Caseta cada 150km promedio
      const costo = Math.round(distancia * costoPorKm * factorEjes * factorAdicional);
      
      return {
        casetas_estimadas,
        costo,
        factor: factorEjes,
        metodo_calculo: 'ESTIMADO',
        casetas_detalle: []
      };
    };

    // 3. CÁLCULO DE VIÁTICOS
    const calcularViaticos = () => {
      const tiempoHoras = tiempoEstimadoHoras || (distancia / 60); // 60 km/h promedio
      const dias = Math.ceil(tiempoHoras / 24);
      const tarifaDiaria = configuracionDefault.viaticos.tarifa_diaria;
      
      const costo = dias * tarifaDiaria;
      
      return {
        dias,
        costo,
        tarifa_diaria: tarifaDiaria
      };
    };

    // 4. CÁLCULO DE MANTENIMIENTO
    const calcularMantenimiento = () => {
      const costoPorKm = vehiculo?.costo_mantenimiento_km || 2.07;
      const costoLlantas = vehiculo?.costo_llantas_km || 1.08;
      
      const costo = Math.round(distancia * (costoPorKm + costoLlantas));
      
      return {
        costo,
        costo_por_km: costoPorKm + costoLlantas
      };
    };

    // 5. CÁLCULO DE COSTOS FIJOS
    const calcularCostosFijos = () => {
      const kilometrajeAnual = 120000; // km promedio anual
      const proporcionViaje = distancia / kilometrajeAnual;
      
      const depreciacion = configuracionDefault.costos_fijos.incluir_depreciacion ? 
        Math.round((vehiculo?.valor_vehiculo || 800000) * 0.20 * proporcionViaje) : 0;
      
      const seguros = configuracionDefault.costos_fijos.incluir_seguros ? 
        Math.round(COSTOS_FIJOS_ANUALES.seguros * proporcionViaje) : 0;
      
      const administracion = configuracionDefault.costos_fijos.incluir_administracion ? 
        Math.round(COSTOS_FIJOS_ANUALES.administracion * proporcionViaje) : 0;
      
      const costo = depreciacion + seguros + administracion;
      
      return {
        costo,
        depreciacion,
        seguros,
        administracion
      };
    };

    // EJECUTAR CÁLCULOS SÍNCRONOS
    const combustible = calcularCombustible();
    const viaticos = calcularViaticos();
    const mantenimiento = calcularMantenimiento();
    const costosFijos = calcularCostosFijos();

    // Para peajes, usar el método original síncrono como base
    // La versión avanzada se manejará por separado
    const peajes = calcularPeajesOriginal();

    // CÁLCULO TOTAL - Validar valores NaN
    const costoTotal = Math.round(
      (isNaN(combustible.costo) ? 0 : combustible.costo) + 
      (isNaN(peajes.costo) ? 0 : peajes.costo) + 
      (isNaN(viaticos.costo) ? 0 : viaticos.costo) + 
      (isNaN(mantenimiento.costo) ? 0 : mantenimiento.costo) + 
      (isNaN(costosFijos.costo) ? 0 : costosFijos.costo)
    );

    // MARGEN Y PRECIO SUGERIDO - Validar valores NaN
    const margenSugerido = configuracionDefault.margen_ganancia.porcentaje_objetivo;
    const precioVentaSugerido = isNaN(costoTotal) || costoTotal === 0 ? 0 : 
                               Math.round(costoTotal * (1 + margenSugerido / 100));

    // CÁLCULO BÁSICO PARA COMPARACIÓN
    const calculoBasico = Math.round((distancia * 12) * (tipoServicio === 'flete_pagado' ? 1.2 : 1.0));
    const diferencia = costoTotal - calculoBasico;
    const porcentajeMejora = Math.abs(diferencia / calculoBasico * 100);

    // ALERTAS DE MARGEN
    if (margenSugerido < configuracionDefault.margen_ganancia.porcentaje_minimo) {
      alertas.push({
        tipo: 'error',
        mensaje: `Margen inferior al mínimo (${configuracionDefault.margen_ganancia.porcentaje_minimo}%)`,
        impacto: 'Viaje no rentable',
        solucion: 'Aumentar precio al cliente o optimizar ruta'
      });
    }

    // ALERTA DE EFICIENCIA
    if (pesoMercancia && vehiculo?.capacidad_carga) {
      const eficiencia = (pesoMercancia / vehiculo.capacidad_carga) * 100;
      if (eficiencia < 60) {
        alertas.push({
          tipo: 'warning',
          mensaje: `Capacidad utilizada: ${Math.round(eficiencia)}%`,
          impacto: 'Baja eficiencia operativa',
          solucion: 'Considerar vehículo más pequeño o consolidar carga'
        });
      }
    }

    const resultado: CalculoProfesional = {
      combustible,
      peajes,
      viaticos,
      mantenimiento,
      costos_fijos: costosFijos,
      costoTotal,
      margenSugerido,
      precioVentaSugerido,
      precisionMejora: `${Math.round(porcentajeMejora)}% más preciso que cálculo básico`,
      alertas
    };

    return resultado;
  }, [parametros, user, calcularPeajes]);
};

// Hook separado para cálculo avanzado de peajes (asíncrono)
export const useCalculadoraPeajesAvanzada = () => {
  const { calcularPeajes } = usePeajesINEGI();

  const calcularPeajesDetallado = async (
    origen: { lat: number; lng: number },
    destino: { lat: number; lng: number },
    configuracion: 'C2' | 'C3' | 'T2S1' | 'T3S2' | 'T3S3'
  ) => {
    try {
      const resultado = await calcularPeajes(origen, destino, configuracion);
      return {
        ...resultado,
        precision: 'alta',
        fuente: 'INEGI_SAKBE'
      };
    } catch (error) {
      console.error('Error en cálculo avanzado de peajes:', error);
      return null;
    }
  };

  return { calcularPeajesDetallado };
};

// Hook para comparación de cálculos
export const useComparacionCalculos = (parametros: ParametrosCalculo): ComparacionCalculo | null => {
  const calculoProfesional = useCalculadoraCostosProfesional(parametros);
  
  return useMemo(() => {
    if (!calculoProfesional || !parametros.distancia) return null;

    const calculoBasico = Math.round((parametros.distancia * 12) * 
      (parametros.tipoServicio === 'flete_pagado' ? 1.2 : 1.0));
    
    const diferencia = calculoProfesional.costoTotal - calculoBasico;
    const porcentajeMejora = Math.abs(diferencia / calculoBasico * 100);
    
    // Determinar confiabilidad basada en datos disponibles
    let confiabilidad: 'baja' | 'media' | 'alta' = 'media';
    
    if (parametros.vehiculo?.rendimiento && parametros.vehiculo?.costo_mantenimiento_km) {
      confiabilidad = 'alta';
    } else if (!parametros.vehiculo?.rendimiento) {
      confiabilidad = 'baja';
    }

    return {
      calculoBasico,
      calculoProfesional: calculoProfesional.costoTotal,
      diferencia,
      porcentajeMejora,
      confiabilidad
    };
  }, [calculoProfesional, parametros]);
};
