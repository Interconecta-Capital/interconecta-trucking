
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TrackingEvent {
  id: string;
  evento: string;
  descripcion: string;
  fecha: string;
  ubicacion?: string;
  metadata?: any;
}

export const useTrackingCartaPorte = (cartaPorteId?: string) => {
  const { data: eventos = [], isLoading, refetch } = useQuery({
    queryKey: ['tracking-carta-porte', cartaPorteId],
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
      
      return (data || []).map(event => ({
        id: event.id,
        evento: event.evento,
        descripcion: event.descripcion,
        fecha: event.created_at,
        ubicacion: event.ubicacion,
        metadata: event.metadata
      })) as TrackingEvent[];
    },
    enabled: !!cartaPorteId,
  });

  const agregarEvento = async (evento: {
    evento: string;
    descripcion: string;
    ubicacion?: string;
    metadata?: any;
  }) => {
    if (!cartaPorteId) {
      console.error('cartaPorteId is required to add tracking event');
      return;
    }

    console.log('Adding tracking event:', { cartaPorteId, evento });

    const { error } = await supabase
      .from('tracking_carta_porte')
      .insert({
        carta_porte_id: cartaPorteId,
        evento: evento.evento,
        descripcion: evento.descripcion,
        ubicacion: evento.ubicacion,
        metadata: evento.metadata
      });

    if (error) {
      console.error('Error agregando evento de tracking:', error);
      throw error;
    }

    console.log('Tracking event added successfully');
    // Refrescar datos
    refetch();
  };

  return {
    eventos,
    isLoading,
    agregarEvento,
    refetch
  };
};
