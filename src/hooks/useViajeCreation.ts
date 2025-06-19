
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Ubicacion } from '@/types/ubicaciones';

interface CreateViajeParams {
  cartaPorteId: string;
  ubicaciones: Ubicacion[];
  distanciaTotal?: number;
  tiempoEstimado?: number;
}

export const useViajeCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const createViaje = useMutation({
    mutationFn: async (params: CreateViajeParams) => {
      setIsCreating(true);
      console.log('🚛 Creando viaje:', params);

      const origen = params.ubicaciones.find(u => u.tipoUbicacion === 'Origen');
      const destino = params.ubicaciones.find(u => u.tipoUbicacion === 'Destino');

      if (!origen || !destino) {
        throw new Error('Se requiere al menos un origen y un destino para crear el viaje');
      }

      // Calcular fechas programadas
      const fechaInicioProgramada = origen.fechaHoraSalidaLlegada 
        ? new Date(origen.fechaHoraSalidaLlegada).toISOString()
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Mañana por defecto

      const fechaFinProgramada = destino.fechaHoraSalidaLlegada
        ? new Date(destino.fechaHoraSalidaLlegada).toISOString()
        : new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // Pasado mañana por defecto

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
        distanciaTotal: params.distanciaTotal,
        tiempoEstimado: params.tiempoEstimado,
        fechaCalculada: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('viajes')
        .insert({
          carta_porte_id: params.cartaPorteId,
          origen: `${origen.domicilio.municipio}, ${origen.domicilio.estado}`,
          destino: `${destino.domicilio.municipio}, ${destino.domicilio.estado}`,
          estado: 'programado', // Estado inicial: programado (equivale a "planificación")
          fecha_inicio_programada: fechaInicioProgramada,
          fecha_fin_programada: fechaFinProgramada,
          observaciones: `Viaje creado desde Carta Porte. Distancia: ${params.distanciaTotal || 'No calculada'} km`,
          tracking_data: trackingData,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creando viaje:', error);
        throw error;
      }

      console.log('✅ Viaje creado exitosamente:', data);
      return data;
    },
    onSuccess: (viaje) => {
      toast({
        title: "Viaje creado",
        description: `El viaje desde ${viaje.origen} hasta ${viaje.destino} ha sido guardado en el módulo de Viajes.`,
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
