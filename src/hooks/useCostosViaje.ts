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
    // Costos base por km según tipo de vehículo
    const costosBase = {
      camion: 8.5,
      pickup: 6.2,
      van: 5.8,
      trailer: 12.0
    };

    const costoPorKm = costosBase[tipoVehiculo as keyof typeof costosBase] || 8.5;
    
    const combustible = distanciaKm * 2.8; // $2.8 por km promedio
    const peajes = distanciaKm * 0.8; // Estimado de peajes
    const mantenimiento = distanciaKm * 0.5; // Desgaste del vehículo
    const salarioConductor = incluirConductor ? Math.max(800, distanciaKm * 2) : 0;
    const otros = distanciaKm * 0.3; // Gastos varios

    return {
      combustible_estimado: combustible,
      peajes_estimados: peajes,
      casetas_estimadas: 0, // Se puede agregar lógica específica
      mantenimiento_estimado: mantenimiento,
      salario_conductor_estimado: salarioConductor,
      otros_costos_estimados: otros,
      costo_total_estimado: combustible + peajes + mantenimiento + salarioConductor + otros
    };
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
        .single();

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
          margen_estimado: margenEstimado,
          ...costosEstimados
        })
        .select()
        .single();

      if (error) throw error;

      setCostos(data as unknown as CostosViaje);
      toast.success('Costos estimados guardados');
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
        costo_total_real: costoTotalReal
      };

      if (precioFinalCobrado) {
        updateData.precio_final_cobrado = precioFinalCobrado;
        updateData.margen_real = precioFinalCobrado - costoTotalReal;
      }

      const { data, error } = await supabase
        .from('costos_viaje')
        .update(updateData)
        .eq('viaje_id', viajeId)
        .select()
        .single();

      if (error) throw error;

      setCostos(data as unknown as CostosViaje);
      toast.success('Costos reales actualizados');
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