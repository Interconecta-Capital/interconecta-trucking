
import { useState } from 'react';
import { useSimpleAuth } from './useSimpleAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Programacion {
  entidad_tipo: 'vehiculo' | 'conductor';
  entidad_id: string;
  tipo_programacion: 'mantenimiento' | 'revision' | 'verificacion' | 'seguro' | 'licencia' | 'capacitacion';
  descripcion: string;
  fecha_inicio: string;
  fecha_fin?: string | null;
  sin_fecha_fin: boolean;
  estado: 'programado' | 'en_proceso' | 'completado' | 'cancelado';
  observaciones?: string | null;
  costo?: number | null;
  proveedor?: string | null;
}

export const useEstadosInteligentes = () => {
  const { user } = useSimpleAuth();
  const [isLoading, setIsLoading] = useState(false);

  const cambiarEstado = async (
    entidadTipo: 'vehiculo' | 'conductor' | 'socio',
    entidadId: string,
    nuevoEstado: string,
    motivo?: string,
    observaciones?: string
  ) => {
    if (!user?.id) {
      toast.error('Usuario no autenticado');
      return false;
    }

    setIsLoading(true);
    try {
      const tabla = entidadTipo === 'vehiculo' ? 'vehiculos' : 
                   entidadTipo === 'conductor' ? 'conductores' : 'socios';

      const { error } = await supabase
        .from(tabla)
        .update({ estado: nuevoEstado })
        .eq('id', entidadId);

      if (error) throw error;

      // Registrar el cambio de estado
      await supabase
        .from('historial_estados')
        .insert({
          user_id: user.id,
          entidad_tipo: entidadTipo,
          entidad_id: entidadId,
          estado_anterior: '', // Se podría obtener del estado actual
          estado_nuevo: nuevoEstado,
          motivo: motivo || 'Cambio manual',
          observaciones
        });

      toast.success('Estado cambiado exitosamente');
      return true;
    } catch (error) {
      console.error('Error changing state:', error);
      toast.error('Error al cambiar estado');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const crearProgramacion = async (programacion: Programacion) => {
    if (!user?.id) {
      toast.error('Usuario no autenticado');
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('programaciones')
        .insert({
          ...programacion,
          user_id: user.id
        });

      if (error) throw error;

      toast.success('Programación creada exitosamente');
      return true;
    } catch (error) {
      console.error('Error creating programacion:', error);
      toast.error('Error al crear programación');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    cambiarEstado,
    crearProgramacion
  };
};
