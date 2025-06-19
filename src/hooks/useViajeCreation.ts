
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UbicacionCompleta } from '@/types/cartaPorte';
import { Coordinates } from '@/types/ubicaciones';

interface ViajeData {
  cartaPorteId: string;
  conductorId?: string;
  vehiculoId?: string;
  ubicaciones: UbicacionCompleta[];
  distanciaTotal: number;
  tiempoEstimado: number;
}

export const useViajeCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createViaje = async (data: ViajeData) => {
    setIsCreating(true);
    setError(null);

    try {
      const origen = data.ubicaciones.find(u => u.tipo_ubicacion === 'Origen');
      const destino = data.ubicaciones.find(u => u.tipo_ubicacion === 'Destino');

      if (!origen || !destino) {
        throw new Error('Se requiere al menos un origen y un destino');
      }

      // Convert Coordinates to Json compatible format
      const rutaCalculada = {
        ubicaciones: data.ubicaciones.map(ubicacion => ({
          tipo: ubicacion.tipo_ubicacion,
          nombre: ubicacion.nombre_remitente_destinatario || 'Sin nombre',
          direccion: `${ubicacion.domicilio.calle}, ${ubicacion.domicilio.colonia}, ${ubicacion.domicilio.municipio}`,
          codigoPostal: ubicacion.domicilio.codigo_postal,
          fechaEstimada: ubicacion.fecha_hora_salida_llegada || new Date().toISOString(),
          coordenadas: ubicacion.coordenadas ? JSON.parse(JSON.stringify(ubicacion.coordenadas)) : null
        })),
        distanciaTotal: data.distanciaTotal,
        tiempoEstimado: data.tiempoEstimado,
        fechaCalculada: new Date().toISOString()
      };

      const viajeData = {
        carta_porte_id: data.cartaPorteId,
        conductor_id: data.conductorId,
        vehiculo_id: data.vehiculoId,
        origen: `${origen.domicilio.municipio}, ${origen.domicilio.estado}`,
        destino: `${destino.domicilio.municipio}, ${destino.domicilio.estado}`,
        fecha_inicio_programada: origen.fecha_hora_salida_llegada || new Date().toISOString(),
        fecha_fin_programada: destino.fecha_hora_salida_llegada || new Date().toISOString(),
        distancia_km: data.distanciaTotal,
        tiempo_estimado_horas: Math.round(data.tiempoEstimado / 60),
        estado: 'programado',
        ruta_calculada: JSON.parse(JSON.stringify(rutaCalculada))
      };

      const { data: viaje, error: insertError } = await supabase
        .from('viajes')
        .insert([viajeData])
        .select()
        .single();

      if (insertError) throw insertError;

      return viaje;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating viaje';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createViaje,
    isCreating,
    error
  };
};
