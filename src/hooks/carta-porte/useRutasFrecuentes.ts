import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RutaFrecuente {
  id: string;
  usuario_id: string;
  nombre_ruta: string;
  descripcion?: string;
  ubicacion_origen: any;
  ubicacion_destino: any;
  distancia_km?: number;
  tiempo_estimado_minutos?: number;
  uso_count: number;
  created_at: string;
  updated_at: string;
}

export function useRutasFrecuentes() {
  const [rutas, setRutas] = useState<RutaFrecuente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarRutas = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('rutas_frecuentes')
        .select('*')
        .order('uso_count', { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;

      setRutas(data || []);
    } catch (err) {
      console.error('Error cargando rutas frecuentes:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarRutas();
  }, []);

  const guardarRuta = async (
    origen: any,
    destino: any,
    nombre: string,
    descripcion?: string,
    distanciaKm?: number,
    tiempoMinutos?: number
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuario no autenticado');

      const { data, error: insertError } = await supabase
        .from('rutas_frecuentes')
        .insert({
          usuario_id: userData.user.id,
          nombre_ruta: nombre,
          descripcion,
          ubicacion_origen: origen,
          ubicacion_destino: destino,
          distancia_km: distanciaKm,
          tiempo_estimado_minutos: tiempoMinutos,
          uso_count: 1
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('Ruta guardada exitosamente');
      await cargarRutas();
      return data;
    } catch (err) {
      console.error('Error guardando ruta:', err);
      const errorMsg = err instanceof Error ? err.message : 'Error guardando ruta';
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarRuta = async (rutaId: string): Promise<{ origen: any; destino: any } | null> => {
    try {
      const ruta = rutas.find(r => r.id === rutaId);
      if (!ruta) throw new Error('Ruta no encontrada');

      // Incrementar contador de uso
      await supabase
        .from('rutas_frecuentes')
        .update({ uso_count: ruta.uso_count + 1 })
        .eq('id', rutaId);

      await cargarRutas();

      return {
        origen: ruta.ubicacion_origen,
        destino: ruta.ubicacion_destino
      };
    } catch (err) {
      console.error('Error aplicando ruta:', err);
      toast.error('Error aplicando ruta');
      return null;
    }
  };

  const eliminarRuta = async (rutaId: string) => {
    try {
      setIsLoading(true);
      const { error: deleteError } = await supabase
        .from('rutas_frecuentes')
        .delete()
        .eq('id', rutaId);

      if (deleteError) throw deleteError;

      toast.success('Ruta eliminada');
      await cargarRutas();
    } catch (err) {
      console.error('Error eliminando ruta:', err);
      toast.error('Error eliminando ruta');
    } finally {
      setIsLoading(false);
    }
  };

  const getRutasMasUsadas = (limit = 5) => {
    return rutas.slice(0, limit);
  };

  return {
    rutas,
    isLoading,
    error,
    guardarRuta,
    aplicarRuta,
    eliminarRuta,
    getRutasMasUsadas,
    recargarRutas: cargarRutas
  };
}
