import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ValidacionDisponibilidad } from '@/types/viaje';
import { toast } from 'sonner';

export const useDisponibilidad = () => {
  const [loading, setLoading] = useState(false);

  const verificarDisponibilidad = async (
    entidadTipo: 'conductor' | 'vehiculo' | 'remolque',
    entidadId: string,
    fechaInicio: string,
    fechaFin: string
  ): Promise<ValidacionDisponibilidad | null> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      console.log('🔍 DEBUG: Verificando disponibilidad:', {
        entidadTipo,
        entidadId,
        fechaInicio,
        fechaFin,
        user_id: user.id
      });

      const { data, error } = await supabase.rpc('verificar_disponibilidad_recurso', {
        p_recurso_tipo: entidadTipo,
        p_recurso_id: entidadId,
        p_fecha_inicio: fechaInicio,
        p_fecha_fin: fechaFin
      });

      if (error) {
        console.error('Error verificando disponibilidad:', error);
        toast.error('Error al verificar disponibilidad');
        return null;
      }

      return data as unknown as ValidacionDisponibilidad;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al verificar disponibilidad');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verificarMultipleDisponibilidad = async (
    recursos: Array<{
      tipo: 'conductor' | 'vehiculo' | 'remolque';
      id: string;
    }>,
    fechaInicio: string,
    fechaFin: string
  ) => {
    setLoading(true);
    try {
      const resultados = await Promise.all(
        recursos.map(recurso => 
          verificarDisponibilidad(recurso.tipo, recurso.id, fechaInicio, fechaFin)
        )
      );

      const conflictos = resultados.filter(r => r && !r.disponible);
      const todosDisponibles = conflictos.length === 0;

      return {
        disponible: todosDisponibles,
        resultados: resultados.map((resultado, index) => ({
          ...recursos[index],
          validacion: resultado
        })),
        conflictos: conflictos.flatMap(c => c?.conflictos || [])
      };
    } catch (error) {
      console.error('Error verificando múltiple disponibilidad:', error);
      toast.error('Error al verificar disponibilidad de recursos');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    verificarDisponibilidad,
    verificarMultipleDisponibilidad,
    loading
  };
};