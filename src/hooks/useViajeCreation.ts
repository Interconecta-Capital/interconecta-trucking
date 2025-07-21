
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Ubicacion } from '@/types/ubicaciones';
import { useCostosViaje } from './useCostosViaje';
import { useIntelligentCostCalculator } from './useIntelligentCostCalculator';

interface CreateViajeParams {
  cartaPorteId: string;
  ubicaciones: Ubicacion[];
  distanciaTotal?: number;
  tiempoEstimado?: number;
  precioClienteDeseado?: number;
  vehiculoInfo?: any;
  tipoServicio?: string;
}

export const useViajeCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { calcularCostoEstimado, crearCostosEstimados } = useCostosViaje();

  const createViaje = useMutation({
    mutationFn: async (params: CreateViajeParams) => {
      setIsCreating(true);
      console.log('🚛 Creando viaje con costos inteligentes:', params);

      const origen = params.ubicaciones.find(u => u.tipoUbicacion === 'Origen');
      const destino = params.ubicaciones.find(u => u.tipoUbicacion === 'Destino');

      if (!origen || !destino) {
        throw new Error('Se requiere al menos un origen y un destino para crear el viaje');
      }

      // Calcular fechas programadas
      const fechaInicioProgramada = origen.fechaHoraSalidaLlegada 
        ? new Date(origen.fechaHoraSalidaLlegada).toISOString()
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const fechaFinProgramada = destino.fechaHoraSalidaLlegada
        ? new Date(destino.fechaHoraSalidaLlegada).toISOString()
        : new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

      // Calcular costos estimados inteligentes
      const distanciaKm = params.distanciaTotal || 0;
      const tiempoHoras = params.tiempoEstimado || Math.round(distanciaKm / 60);
      
      const costosEstimados = calcularCostoEstimado(
        distanciaKm,
        params.vehiculoInfo?.tipo || 'camion',
        true // incluir conductor
      );

      // Precio sugerido con margen del 25%
      const precioSugerido = Math.round(costosEstimados.costo_total_estimado * 1.25);
      const precioFinal = params.precioClienteDeseado || precioSugerido;

      // Crear tracking data con información de la ruta
      const trackingData = {
        ubicaciones: params.ubicaciones.map(ub => ({
          tipo: ub.tipoUbicacion,
          nombre: ub.nombreRemitenteDestinatario,
          direccion: `${ub.domicilio.calle} ${ub.domicilio.numExterior}, ${ub.domicilio.municipio}, ${ub.domicilio.estado}`,
          codigoPostal: ub.domicilio.codigoPostal,
          fechaEstimada: ub.fechaHoraSalidaLlegada,
          coordenadas: ub.coordenadas
        })),
        distanciaTotal: distanciaKm,
        tiempoEstimado: tiempoHoras,
        fechaCalculada: new Date().toISOString(),
        costos: {
          estimados: costosEstimados,
          precioSugerido,
          precioClienteDeseado: params.precioClienteDeseado,
          margenEstimado: precioFinal - costosEstimados.costo_total_estimado
        }
      };

      // Crear el viaje
      const { data: viaje, error } = await supabase
        .from('viajes')
        .insert({
          carta_porte_id: params.cartaPorteId,
          origen: `${origen.domicilio.municipio}, ${origen.domicilio.estado}`,
          destino: `${destino.domicilio.municipio}, ${destino.domicilio.estado}`,
          estado: 'programado',
          fecha_inicio_programada: fechaInicioProgramada,
          fecha_fin_programada: fechaFinProgramada,
          distancia_km: distanciaKm,
          tiempo_estimado_horas: tiempoHoras,
          precio_cobrado: precioFinal,
          costo_estimado: costosEstimados.costo_total_estimado,
          margen_estimado: precioFinal - costosEstimados.costo_total_estimado,
          observaciones: `Viaje creado con costos inteligentes. Precio sugerido: $${precioSugerido.toLocaleString()}. Distancia: ${distanciaKm} km`,
          tracking_data: trackingData,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creando viaje:', error);
        throw error;
      }

      console.log('✅ Viaje creado:', viaje.id);

      // Crear registro de costos detallado
      try {
        await crearCostosEstimados(
          viaje.id,
          costosEstimados,
          precioFinal
        );
        console.log('✅ Costos registrados para viaje:', viaje.id);
      } catch (costError) {
        console.error('Error registrando costos:', costError);
        // No fallar el viaje si hay error en costos, pero notificar
        toast({
          title: "Advertencia",
          description: "Viaje creado pero hubo un error registrando los costos detallados",
          variant: "destructive"
        });
      }

      return viaje;
    },
    onSuccess: (viaje) => {
      const trackingData = viaje.tracking_data as any;
      const costos = trackingData?.costos;
      
      toast({
        title: "Viaje creado exitosamente",
        description: `${viaje.origen} → ${viaje.destino}. Precio: $${viaje.precio_cobrado?.toLocaleString()} ${costos?.precioClienteDeseado ? '(ajustado por cliente)' : '(sugerido)'}`,
      });
    },
    onError: (error: Error) => {
      console.error('Error al crear viaje:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el viaje",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsCreating(false);
    }
  });

  return {
    createViaje: createViaje.mutate,
    isCreating,
    viajeCreado: createViaje.data
  };
};
