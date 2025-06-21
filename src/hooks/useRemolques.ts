
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Remolque {
  id: string;
  placa: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  num_serie?: string;
  tipo_remolque?: string;
  capacidad_carga?: number;
  estado: string;
  vehiculo_asignado_id?: string;
  activo: boolean;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export function useRemolques(userId?: string) {
  const [remolques, setRemolques] = useState<Remolque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarRemolques = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Usar la tabla remolques_ccp que existe en la base de datos
      const { data, error } = await supabase
        .from('remolques_ccp')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Mapear los datos de remolques_ccp al formato esperado
      const remolquesFormateados = (data || []).map(item => ({
        id: item.id,
        placa: item.placa || '',
        marca: '',
        modelo: '',
        anio: null,
        num_serie: '',
        tipo_remolque: item.subtipo_rem || '',
        capacidad_carga: null,
        estado: 'disponible',
        vehiculo_asignado_id: item.autotransporte_id || null,
        activo: true,
        user_id: userId,
        created_at: item.created_at,
        updated_at: item.created_at
      }));
      
      setRemolques(remolquesFormateados);
    } catch (error: any) {
      console.error('Error cargando remolques:', error);
      setError(error.message);
      toast.error('Error al cargar remolques');
    } finally {
      setLoading(false);
    }
  };

  const crearRemolque = async (remolqueData: Partial<Remolque>) => {
    try {
      // Mapear al formato de la tabla remolques_ccp
      const dataParaInsertar = {
        placa: remolqueData.placa || '',
        subtipo_rem: remolqueData.tipo_remolque || '',
        autotransporte_id: remolqueData.vehiculo_asignado_id || null
      };

      const { data, error } = await supabase
        .from('remolques_ccp')
        .insert([dataParaInsertar])
        .select()
        .single();

      if (error) throw error;
      
      // Formatear la respuesta
      const remolqueFormateado = {
        id: data.id,
        placa: data.placa,
        marca: '',
        modelo: '',
        anio: null,
        num_serie: '',
        tipo_remolque: data.subtipo_rem || '',
        capacidad_carga: null,
        estado: 'disponible',
        vehiculo_asignado_id: data.autotransporte_id,
        activo: true,
        user_id: userId || '',
        created_at: data.created_at,
        updated_at: data.created_at
      };
      
      setRemolques(prev => [remolqueFormateado, ...prev]);
      return remolqueFormateado;
    } catch (error: any) {
      console.error('Error creando remolque:', error);
      throw error;
    }
  };

  const actualizarRemolque = async (id: string, remolqueData: Partial<Remolque>) => {
    try {
      // Mapear al formato de la tabla remolques_ccp
      const dataParaActualizar = {
        placa: remolqueData.placa,
        subtipo_rem: remolqueData.tipo_remolque,
        autotransporte_id: remolqueData.vehiculo_asignado_id || null
      };

      const { data, error } = await supabase
        .from('remolques_ccp')
        .update(dataParaActualizar)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Formatear la respuesta
      const remolqueActualizado = {
        id: data.id,
        placa: data.placa,
        marca: '',
        modelo: '',
        anio: null,
        num_serie: '',
        tipo_remolque: data.subtipo_rem || '',
        capacidad_carga: null,
        estado: 'disponible',
        vehiculo_asignado_id: data.autotransporte_id,
        activo: true,
        user_id: userId || '',
        created_at: data.created_at,
        updated_at: data.created_at
      };
      
      setRemolques(prev => prev.map(r => r.id === id ? remolqueActualizado : r));
      return remolqueActualizado;
    } catch (error: any) {
      console.error('Error actualizando remolque:', error);
      throw error;
    }
  };

  const eliminarRemolque = async (id: string) => {
    try {
      const { error } = await supabase
        .from('remolques_ccp')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setRemolques(prev => prev.filter(r => r.id !== id));
      toast.success('Remolque eliminado exitosamente');
    } catch (error: any) {
      console.error('Error eliminando remolque:', error);
      throw error;
    }
  };

  useEffect(() => {
    cargarRemolques();
  }, [userId]);

  return {
    remolques,
    loading,
    error,
    crearRemolque,
    actualizarRemolque,
    eliminarRemolque,
    recargar: cargarRemolques
  };
}
