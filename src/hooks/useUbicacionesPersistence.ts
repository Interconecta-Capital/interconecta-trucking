
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Ubicacion } from '@/types/ubicaciones';

export const useUbicacionesPersistence = (cartaPorteId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Guardar ubicación en la base de datos
  const guardarUbicacion = useMutation({
    mutationFn: async (ubicacion: Ubicacion) => {
      if (!cartaPorteId) throw new Error('ID de carta porte requerido');

      const { data, error } = await supabase
        .from('ubicaciones')
        .insert({
          carta_porte_id: cartaPorteId,
          id_ubicacion: ubicacion.idUbicacion,
          tipo_ubicacion: ubicacion.tipoUbicacion,
          rfc_remitente_destinatario: ubicacion.rfcRemitenteDestinatario,
          nombre_remitente_destinatario: ubicacion.nombreRemitenteDestinatario,
          fecha_hora_salida_llegada: ubicacion.fechaHoraSalidaLlegada,
          distancia_recorrida: ubicacion.distanciaRecorrida,
          orden_secuencia: ubicacion.ordenSecuencia,
          domicilio: ubicacion.domicilio,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte'] });
      toast({
        title: "Éxito",
        description: "Ubicación guardada correctamente",
      });
    },
    onError: (error) => {
      console.error('Error guardando ubicación:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la ubicación",
        variant: "destructive",
      });
    },
  });

  // Actualizar ubicación existente
  const actualizarUbicacion = useMutation({
    mutationFn: async ({ id, ubicacion }: { id: string; ubicacion: Ubicacion }) => {
      const { data, error } = await supabase
        .from('ubicaciones')
        .update({
          id_ubicacion: ubicacion.idUbicacion,
          tipo_ubicacion: ubicacion.tipoUbicacion,
          rfc_remitente_destinatario: ubicacion.rfcRemitenteDestinatario,
          nombre_remitente_destinatario: ubicacion.nombreRemitenteDestinatario,
          fecha_hora_salida_llegada: ubicacion.fechaHoraSalidaLlegada,
          distancia_recorrida: ubicacion.distanciaRecorrida,
          orden_secuencia: ubicacion.ordenSecuencia,
          domicilio: ubicacion.domicilio,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte'] });
      toast({
        title: "Éxito",
        description: "Ubicación actualizada correctamente",
      });
    },
  });

  // Eliminar ubicación
  const eliminarUbicacion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ubicaciones')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte'] });
      toast({
        title: "Éxito",
        description: "Ubicación eliminada correctamente",
      });
    },
  });

  // Guardar múltiples ubicaciones
  const guardarUbicaciones = useCallback(async (ubicaciones: Ubicacion[]) => {
    if (!cartaPorteId) throw new Error('ID de carta porte requerido');

    setLoading(true);
    try {
      // Primero eliminar ubicaciones existentes
      await supabase
        .from('ubicaciones')
        .delete()
        .eq('carta_porte_id', cartaPorteId);

      // Luego insertar las nuevas
      const ubicacionesParaInsertar = ubicaciones.map(ubicacion => ({
        carta_porte_id: cartaPorteId,
        id_ubicacion: ubicacion.idUbicacion,
        tipo_ubicacion: ubicacion.tipoUbicacion,
        rfc_remitente_destinatario: ubicacion.rfcRemitenteDestinatario,
        nombre_remitente_destinatario: ubicacion.nombreRemitenteDestinatario,
        fecha_hora_salida_llegada: ubicacion.fechaHoraSalidaLlegada,
        distancia_recorrida: ubicacion.distanciaRecorrida,
        orden_secuencia: ubicacion.ordenSecuencia,
        domicilio: ubicacion.domicilio,
      }));

      const { error } = await supabase
        .from('ubicaciones')
        .insert(ubicacionesParaInsertar);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['cartas-porte'] });
      toast({
        title: "Éxito",
        description: "Ubicaciones guardadas correctamente",
      });
    } catch (error) {
      console.error('Error guardando ubicaciones:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las ubicaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [cartaPorteId, toast, queryClient]);

  return {
    loading: loading || guardarUbicacion.isPending || actualizarUbicacion.isPending,
    guardarUbicacion: guardarUbicacion.mutate,
    actualizarUbicacion: actualizarUbicacion.mutate,
    eliminarUbicacion: eliminarUbicacion.mutate,
    guardarUbicaciones,
  };
};
