
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrackingEngine, TrackingEvent, TrackingStatus } from '@/services/tracking/trackingEngine';

export const useTrackingAdvanced = (cartaPorteId?: string) => {
  const [realtimeStatus, setRealtimeStatus] = useState<TrackingStatus | null>(null);
  const [alertas, setAlertas] = useState<string[]>([]);

  // Query para obtener eventos de tracking
  const { data: eventos = [], isLoading, refetch } = useQuery({
    queryKey: ['tracking-avanzado', cartaPorteId],
    queryFn: async () => {
      if (!cartaPorteId) return [];
      
      const { data, error } = await supabase
        .from('tracking_carta_porte')
        .select('*')
        .eq('carta_porte_id', cartaPorteId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tracking events:', error);
        throw error;
      }
      
      return (data || []).map(event => {
        // Safely parse metadata
        const metadata = event.metadata as Record<string, any> || {};
        
        return {
          id: event.id,
          cartaPorteId: event.carta_porte_id,
          evento: event.evento,
          descripcion: event.descripcion,
          timestamp: event.created_at,
          ubicacion: event.ubicacion,
          coordenadas: metadata.coordenadas,
          metadata: metadata,
          automatico: metadata.automatico || false,
          uuidFiscal: event.uuid_fiscal
        } as TrackingEvent;
      });
    },
    enabled: !!cartaPorteId,
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  // Calcular status en tiempo real cuando cambian los eventos
  useEffect(() => {
    if (eventos.length > 0) {
      const status = TrackingEngine.calcularStatus(eventos);
      setRealtimeStatus(status);
      
      const alertasGeneradas = TrackingEngine.generarAlertasAutomaticas(eventos);
      setAlertas(alertasGeneradas);
    }
  }, [eventos]);

  // Suscripción a cambios en tiempo real
  useEffect(() => {
    if (!cartaPorteId) return;

    console.log('Suscribiendo a cambios en tiempo real para carta porte:', cartaPorteId);

    const channel = supabase
      .channel('tracking-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tracking_carta_porte',
          filter: `carta_porte_id=eq.${cartaPorteId}`
        },
        (payload) => {
          console.log('Cambio en tracking detectado:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      console.log('Desuscribiendo del canal de tracking');
      supabase.removeChannel(channel);
    };
  }, [cartaPorteId, refetch]);

  const agregarEventoAvanzado = async (evento: {
    evento: string;
    descripcion: string;
    ubicacion?: string;
    coordenadas?: { lat: number; lng: number };
    metadata?: any;
    automatico?: boolean;
  }) => {
    if (!cartaPorteId) {
      console.error('cartaPorteId is required to add tracking event');
      return;
    }

    console.log('Adding advanced tracking event:', { cartaPorteId, evento });

    const { error } = await supabase
      .from('tracking_carta_porte')
      .insert({
        carta_porte_id: cartaPorteId,
        evento: evento.evento,
        descripcion: evento.descripcion,
        ubicacion: evento.ubicacion,
        metadata: {
          ...evento.metadata,
          coordenadas: evento.coordenadas,
          automatico: evento.automatico || false,
          timestamp_cliente: new Date().toISOString()
        }
      });

    if (error) {
      console.error('Error agregando evento de tracking avanzado:', error);
      throw error;
    }

    console.log('Advanced tracking event added successfully');
    refetch();
  };

  const generarEventosAutomaticos = async (cartaPorteData: any) => {
    const eventosAutomaticos = TrackingEngine.generarEventosAutomaticos(cartaPorteData);
    
    for (const evento of eventosAutomaticos) {
      await agregarEventoAvanzado({
        evento: evento.evento,
        descripcion: evento.descripcion,
        metadata: evento.metadata,
        automatico: true
      });
    }
  };

  const estimarTiempoEntrega = async (origen: string, destino: string) => {
    try {
      return await TrackingEngine.estimarTiempoEntrega(origen, destino);
    } catch (error) {
      console.error('Error estimando tiempo de entrega:', error);
      return null;
    }
  };

  const marcarInicioViaje = async (coordenadas?: { lat: number; lng: number }) => {
    await agregarEventoAvanzado({
      evento: 'iniciado',
      descripcion: 'Viaje iniciado desde ubicación de origen',
      coordenadas,
      automatico: false
    });
  };

  const marcarFinViaje = async (coordenadas?: { lat: number; lng: number }) => {
    await agregarEventoAvanzado({
      evento: 'entregado',
      descripcion: 'Mercancía entregada en destino',
      coordenadas,
      automatico: false
    });
  };

  return {
    // Datos básicos
    eventos,
    isLoading,
    refetch,
    
    // Datos avanzados
    realtimeStatus,
    alertas,
    
    // Funciones básicas
    agregarEvento: agregarEventoAvanzado,
    
    // Funciones avanzadas
    generarEventosAutomaticos,
    estimarTiempoEntrega,
    marcarInicioViaje,
    marcarFinViaje
  };
};
