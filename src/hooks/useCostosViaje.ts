
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CostosViaje } from '@/types/viaje';
import { toast } from 'sonner';

export const useCostosViaje = (viajeId?: string) => {
  const [costos, setCostos] = useState<CostosViaje | null>(null);
  const [loading, setLoading] = useState(false);

  // Calcular costo estimado basado en parámetros del viaje
  const calcularCostoEstimado = (
    distanciaKm: number,
    tipoVehiculo: string = 'camion',
    incluirConductor: boolean = true
  ) => {
    if (!distanciaKm || distanciaKm <= 0) {
      return {
        combustible_estimado: 1000,
        peajes_estimados: 400,
        casetas_estimadas: 200,
        mantenimiento_estimado: 200,
        salario_conductor_estimado: incluirConductor ? 1200 : 0,
        otros_costos_estimados: 300,
        costo_total_estimado: 3100
      };
    }

    // Costos base por km según tipo de vehículo (actualizados 2024)
    const costosBase = {
      camion: 9.5,    // Incrementado por inflación
      pickup: 7.2,
      van: 6.8,
      trailer: 13.5
    };

    const costoPorKm = costosBase[tipoVehiculo as keyof typeof costosBase] || 9.5;
    
    // Cálculos más precisos
    const combustible = distanciaKm * 3.2; // $3.2 por km (diesel 2024)
    const peajes = distanciaKm * 1.0; // Incremento en peajes
    const casetas = peajes * 0.4; // 40% del costo de peajes
    const mantenimiento = distanciaKm * 0.6; // Desgaste del vehículo
    const salarioConductor = incluirConductor ? Math.max(1000, distanciaKm * 2.5) : 0; // Salario mínimo actualizado
    const otros = distanciaKm * 0.4; // Gastos varios

    const costosCalculados = {
      combustible_estimado: Math.round(combustible),
      peajes_estimados: Math.round(peajes),
      casetas_estimadas: Math.round(casetas),
      mantenimiento_estimado: Math.round(mantenimiento),
      salario_conductor_estimado: Math.round(salarioConductor),
      otros_costos_estimados: Math.round(otros),
      costo_total_estimado: Math.round(combustible + peajes + casetas + mantenimiento + salarioConductor + otros)
    };

    console.log('💰 Costos calculados para', distanciaKm, 'km:', costosCalculados);
    return costosCalculados;
  };

  // Sugerir precio basado en costos y margen objetivo
  const sugerirPrecio = (costoEstimado: number, margenObjetivo: number = 25) => {
    const factor = 1 + (margenObjetivo / 100);
    return Math.round(costoEstimado * factor);
  };

  // Obtener costos de un viaje específico
  const obtenerCostos = async (viajeId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('costos_viaje')
        .select('*')
        .eq('viaje_id', viajeId)
        .maybeSingle(); // Usar maybeSingle en lugar de single

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCostos(data as unknown as CostosViaje);
      return data;
    } catch (error) {
      console.error('Error obteniendo costos:', error);
      toast.error('Error al obtener costos del viaje');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Crear registro de costos inicial
  const crearCostosEstimados = async (
    viajeId: string,
    costosEstimados: Partial<CostosViaje>,
    precioCotizado: number
  ) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const margenEstimado = precioCotizado - (costosEstimados.costo_total_estimado || 0);
      
      const { data, error } = await supabase
        .from('costos_viaje')
        .insert({
          viaje_id: viajeId,
          user_id: user.id,
          precio_cotizado: precioCotizado,
          precio_final_cobrado: precioCotizado, // Inicialmente igual al cotizado
          margen_estimado: margenEstimado,
          margen_real: margenEstimado, // Inicialmente igual al estimado
          comprobantes_urls: [],
          ...costosEstimados
        })
        .select()
        .single();

      if (error) throw error;

      setCostos(data as unknown as CostosViaje);
      
      // También actualizar el viaje con el precio
      await supabase
        .from('viajes')
        .update({ 
          precio_cobrado: precioCotizado,
          costo_estimado: costosEstimados.costo_total_estimado,
          margen_estimado: margenEstimado
        })
        .eq('id', viajeId);

      console.log('✅ Costos creados y viaje actualizado:', data.id);
      toast.success('Costos estimados guardados correctamente');
      return data;
    } catch (error) {
      console.error('Error creando costos:', error);
      toast.error('Error al guardar costos estimados');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar costos reales al finalizar viaje
  const actualizarCostosReales = async (
    viajeId: string,
    costosReales: Partial<CostosViaje>,
    precioFinalCobrado?: number
  ) => {
    setLoading(true);
    try {
      const costoTotalReal = (
        (costosReales.combustible_real || 0) +
        (costosReales.peajes_reales || 0) +
        (costosReales.casetas_reales || 0) +
        (costosReales.mantenimiento_real || 0) +
        (costosReales.salario_conductor_real || 0) +
        (costosReales.otros_costos_reales || 0)
      );

      const updateData: any = {
        ...costosReales,
        costo_total_real: costoTotalReal > 0 ? costoTotalReal : undefined
      };

      if (precioFinalCobrado) {
        updateData.precio_final_cobrado = precioFinalCobrado;
        updateData.margen_real = precioFinalCobrado - (costoTotalReal || costos?.costo_total_estimado || 0);
      }

      const { data, error } = await supabase
        .from('costos_viaje')
        .update(updateData)
        .eq('viaje_id', viajeId)
        .select()
        .single();

      if (error) throw error;

      setCostos(data as unknown as CostosViaje);
      
      // Actualizar también el viaje
      if (precioFinalCobrado) {
        await supabase
          .from('viajes')
          .update({ 
            precio_cobrado: precioFinalCobrado,
            costo_real: costoTotalReal > 0 ? costoTotalReal : undefined,
            margen_real: updateData.margen_real
          })
          .eq('id', viajeId);
      }

      console.log('✅ Costos reales actualizados:', data.id);
      toast.success('Costos reales actualizados correctamente');
      return data;
    } catch (error) {
      console.error('Error actualizando costos reales:', error);
      toast.error('Error al actualizar costos reales');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Obtener costos al montar el componente si se proporciona viajeId
  useEffect(() => {
    if (viajeId) {
      obtenerCostos(viajeId);
    }
  }, [viajeId]);

  return {
    costos,
    loading,
    calcularCostoEstimado,
    sugerirPrecio,
    obtenerCostos,
    crearCostosEstimados,
    actualizarCostosReales
  };
};
