
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface HistorialEstado {
  id: string;
  entidad_tipo: 'vehiculo' | 'conductor' | 'socio' | 'viaje';
  entidad_id: string;
  estado_anterior: string | null;
  estado_nuevo: string;
  motivo: string | null;
  observaciones: string | null;
  fecha_cambio: string;
  cambiado_por: string | null;
  automatico: boolean;
  user_id: string;
}

export interface Programacion {
  id: string;
  entidad_tipo: 'vehiculo' | 'conductor';
  entidad_id: string;
  tipo_programacion: 'mantenimiento' | 'revision' | 'verificacion' | 'seguro' | 'licencia';
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  sin_fecha_fin: boolean;
  estado: 'programado' | 'en_proceso' | 'completado' | 'cancelado';
  observaciones: string | null;
  costo: number | null;
  proveedor: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useEstadosInteligentes = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const cambiarEstado = async (
    entidadTipo: 'vehiculo' | 'conductor' | 'socio',
    entidadId: string,
    nuevoEstado: string,
    motivo?: string,
    observaciones?: string,
    automatico = false
  ) => {
    if (!user) return false;

    setIsLoading(true);
    try {
      // Obtener estado actual
      const tableName = entidadTipo === 'vehiculo' ? 'vehiculos' : 
                       entidadTipo === 'conductor' ? 'conductores' : 'socios';
      
      const { data: entidadActual, error: fetchError } = await supabase
        .from(tableName)
        .select('estado')
        .eq('id', entidadId)
        .single();

      if (fetchError) throw fetchError;

      const estadoAnterior = entidadActual?.estado;

      // Actualizar estado en la tabla principal
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
        .eq('id', entidadId);

      if (updateError) throw updateError;

      // Registrar en historial de estados
      const { error: historialError } = await supabase
        .from('historial_estados')
        .insert({
          entidad_tipo: entidadTipo,
          entidad_id: entidadId,
          estado_anterior: estadoAnterior,
          estado_nuevo: nuevoEstado,
          motivo,
          observaciones,
          automatico,
          cambiado_por: user.id,
          user_id: user.id
        });

      if (historialError) throw historialError;

      if (!automatico) {
        toast.success(`Estado cambiado a ${nuevoEstado}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      if (!automatico) {
        toast.error('Error al cambiar estado');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const crearProgramacion = async (programacion: Omit<Programacion, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('programaciones')
        .insert({
          ...programacion,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Cambiar estado automáticamente según el tipo de programación
      let nuevoEstado = '';
      if (programacion.tipo_programacion === 'mantenimiento') {
        nuevoEstado = 'mantenimiento';
      } else if (programacion.tipo_programacion === 'revision') {
        nuevoEstado = 'revision';
      }

      if (nuevoEstado) {
        await cambiarEstado(
          programacion.entidad_tipo,
          programacion.entidad_id,
          nuevoEstado,
          `Programación de ${programacion.tipo_programacion}: ${programacion.descripcion}`,
          null,
          true
        );
      }

      toast.success('Programación creada exitosamente');
      return data;
    } catch (error) {
      console.error('Error al crear programación:', error);
      toast.error('Error al crear programación');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const completarProgramacion = async (programacionId: string, observaciones?: string) => {
    if (!user) return false;

    try {
      // Obtener la programación
      const { data: programacion, error: fetchError } = await supabase
        .from('programaciones')
        .select('*')
        .eq('id', programacionId)
        .single();

      if (fetchError) throw fetchError;

      // Marcar como completada
      const { error: updateError } = await supabase
        .from('programaciones')
        .update({ 
          estado: 'completado', 
          observaciones: observaciones || programacion.observaciones,
          updated_at: new Date().toISOString()
        })
        .eq('id', programacionId);

      if (updateError) throw updateError;

      // Cambiar estado de la entidad de vuelta a disponible
      await cambiarEstado(
        programacion.entidad_tipo as 'vehiculo' | 'conductor',
        programacion.entidad_id,
        'disponible',
        `Programación completada: ${programacion.descripcion}`,
        observaciones,
        true
      );

      toast.success('Programación completada');
      return true;
    } catch (error) {
      console.error('Error al completar programación:', error);
      toast.error('Error al completar programación');
      return false;
    }
  };

  const obtenerHistorial = async (entidadTipo: 'vehiculo' | 'conductor' | 'socio', entidadId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('historial_estados')
        .select('*')
        .eq('entidad_tipo', entidadTipo)
        .eq('entidad_id', entidadId)
        .order('fecha_cambio', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener historial:', error);
      return [];
    }
  };

  const obtenerProgramaciones = async (entidadTipo?: 'vehiculo' | 'conductor', entidadId?: string) => {
    if (!user) return [];

    try {
      let query = supabase
        .from('programaciones')
        .select('*')
        .eq('user_id', user.id);

      if (entidadTipo) query = query.eq('entidad_tipo', entidadTipo);
      if (entidadId) query = query.eq('entidad_id', entidadId);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener programaciones:', error);
      return [];
    }
  };

  return {
    isLoading,
    cambiarEstado,
    crearProgramacion,
    completarProgramacion,
    obtenerHistorial,
    obtenerProgramaciones
  };
};
