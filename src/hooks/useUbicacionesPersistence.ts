import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Ubicacion } from '@/types/ubicaciones';

interface UseUbicacionesPersistenceProps {
  cartaPorteId?: string;
}

export const useUbicacionesPersistence = ({ cartaPorteId }: UseUbicacionesPersistenceProps) => {
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(false);
  const [savingUbicaciones, setSavingUbicaciones] = useState(false);

  const loadUbicaciones = useCallback(async () => {
    if (!cartaPorteId) return [];

    setLoadingUbicaciones(true);
    try {
      const { data, error } = await supabase
        .from('ubicaciones')
        .select('*')
        .eq('carta_porte_id', cartaPorteId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching ubicaciones:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching ubicaciones:', error);
      return [];
    } finally {
      setLoadingUbicaciones(false);
    }
  }, [cartaPorteId]);

  const saveUbicaciones = useCallback(async (ubicaciones: Ubicacion[]) => {
    if (!cartaPorteId) return;

    setSavingUbicaciones(true);
    try {
      // Delete existing ubicaciones for this carta_porte_id
      const { error: deleteError } = await supabase
        .from('ubicaciones')
        .delete()
        .eq('carta_porte_id', cartaPorteId);

      if (deleteError) {
        console.error('Error deleting existing ubicaciones:', deleteError);
        throw deleteError;
      }

      // Map Ubicacion type to the structure expected by Supabase
      const ubicacionesToInsert = ubicaciones.map(ubicacion => mapUbicacionToSupabase(ubicacion, cartaPorteId));

      // Insert the new set of ubicaciones
      const { error: insertError } = await supabase
        .from('ubicaciones')
        .insert(ubicacionesToInsert);

      if (insertError) {
        console.error('Error inserting ubicaciones:', insertError);
        throw insertError;
      }
    } catch (error) {
      console.error('Error saving ubicaciones:', error);
    } finally {
      setSavingUbicaciones(false);
    }
  }, [cartaPorteId]);

  return {
    loadingUbicaciones,
    savingUbicaciones,
    loadUbicaciones,
    saveUbicaciones,
  };
};

const mapUbicacionToSupabase = (ubicacion: Ubicacion, cartaPorteId: string) => ({
  carta_porte_id: cartaPorteId,
  id_ubicacion: ubicacion.idUbicacion,
  tipo_ubicacion: ubicacion.tipoUbicacion,
  rfc_remitente_destinatario: ubicacion.rfcRemitenteDestinatario,
  nombre_remitente_destinatario: ubicacion.nombreRemitenteDestinatario,
  fecha_hora_salida_llegada: ubicacion.fechaHoraSalidaLlegada,
  distancia_recorrida: ubicacion.distanciaRecorrida,
  coordenadas: ubicacion.coordenadas,
  tipo_estacion: ubicacion.tipoEstacion,
  numero_estacion: ubicacion.numeroEstacion,
  kilometro: ubicacion.kilometro,
  domicilio: {
    pais: ubicacion.domicilio.pais,
    codigoPostal: ubicacion.domicilio.codigoPostal,
    estado: ubicacion.domicilio.estado,
    municipio: ubicacion.domicilio.municipio,
    colonia: ubicacion.domicilio.colonia,
    calle: ubicacion.domicilio.calle,
    numExterior: ubicacion.domicilio.numExterior,
    numInterior: ubicacion.domicilio.numInterior,
    referencia: ubicacion.domicilio.referencia,
    localidad: ubicacion.domicilio.localidad || '', // Add localidad with default
  }
});
