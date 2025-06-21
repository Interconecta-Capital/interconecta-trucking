
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useRemolques(userId?: string) {
  const [remolques, setRemolques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarRemolques = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('remolques')
        .select('*')
        .eq('user_id', userId)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRemolques(data || []);
    } catch (error: any) {
      console.error('Error cargando remolques:', error);
      setError(error.message);
      toast.error('Error al cargar remolques');
    } finally {
      setLoading(false);
    }
  };

  const crearRemolque = async (remolqueData: any) => {
    try {
      const { data, error } = await supabase
        .from('remolques')
        .insert([remolqueData])
        .select()
        .single();

      if (error) throw error;
      
      setRemolques(prev => [data, ...prev]);
      return data;
    } catch (error: any) {
      console.error('Error creando remolque:', error);
      throw error;
    }
  };

  const actualizarRemolque = async (id: string, remolqueData: any) => {
    try {
      const { data, error } = await supabase
        .from('remolques')
        .update({ ...remolqueData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setRemolques(prev => prev.map(r => r.id === id ? data : r));
      return data;
    } catch (error: any) {
      console.error('Error actualizando remolque:', error);
      throw error;
    }
  };

  const eliminarRemolque = async (id: string) => {
    try {
      const { error } = await supabase
        .from('remolques')
        .update({ activo: false })
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
