
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UbicacionCompleta } from '@/types/cartaPorte';
import { Ubicacion, Coordinates } from '@/types/ubicaciones';

export const useUbicacionesPersistence = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveUbicaciones = useCallback(async (ubicaciones: UbicacionCompleta[], cartaPorteId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Delete existing ubicaciones
      await supabase
        .from('ubicaciones')
        .delete()
        .eq('carta_porte_id', cartaPorteId);

      // Prepare data for insertion with proper Json conversion
      const ubicacionesData = ubicaciones.map(ubicacion => ({
        carta_porte_id: cartaPorteId,
        id_ubicacion: ubicacion.id_ubicacion,
        tipo_ubicacion: ubicacion.tipo_ubicacion,
        rfc_remitente_destinatario: ubicacion.rfc_remitente_destinatario || '',
        nombre_remitente_destinatario: ubicacion.nombre_remitente_destinatario || '',
        fecha_hora_salida_llegada: ubicacion.fecha_hora_salida_llegada,
        distancia_recorrida: ubicacion.distancia_recorrida || 0,
        tipo_estacion: ubicacion.tipo_estacion || '1',
        numero_estacion: ubicacion.numero_estacion,
        kilometro: ubicacion.kilometro,
        coordenadas: ubicacion.coordenadas ? JSON.parse(JSON.stringify(ubicacion.coordenadas)) : null,
        domicilio: JSON.parse(JSON.stringify(ubicacion.domicilio))
      }));

      const { error: insertError } = await supabase
        .from('ubicaciones')
        .insert(ubicacionesData);

      if (insertError) throw insertError;

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUbicaciones = useCallback(async (cartaPorteId: string): Promise<UbicacionCompleta[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('ubicaciones')
        .select('*')
        .eq('carta_porte_id', cartaPorteId)
        .order('tipo_ubicacion');

      if (fetchError) throw fetchError;

      const ubicaciones: UbicacionCompleta[] = (data || []).map(item => ({
        id: item.id,
        id_ubicacion: item.id_ubicacion,
        tipo_ubicacion: item.tipo_ubicacion,
        rfc_remitente_destinatario: item.rfc_remitente_destinatario,
        nombre_remitente_destinatario: item.nombre_remitente_destinatario,
        fecha_hora_salida_llegada: item.fecha_hora_salida_llegada,
        distancia_recorrida: item.distancia_recorrida,
        tipo_estacion: item.tipo_estacion || '1',
        numero_estacion: item.numero_estacion,
        kilometro: item.kilometro,
        coordenadas: item.coordenadas as Coordinates,
        domicilio: item.domicilio,
        carta_porte_id: item.carta_porte_id
      }));

      return ubicaciones;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    saveUbicaciones,
    loadUbicaciones,
    isLoading,
    error
  };
};
