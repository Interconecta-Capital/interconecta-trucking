
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Conductor } from '@/types/cartaPorte';
import { toast } from 'sonner';

export function useConductores() {
  const { user } = useAuth();
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConductores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conductores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setConductores(data || []);
    } catch (error) {
      console.error('Error fetching conductores:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      toast.error('Error cargando conductores');
    } finally {
      setLoading(false);
    }
  };

  const createConductor = async (conductorData: Partial<Conductor>) => {
    try {
      const { data, error } = await supabase
        .from('conductores')
        .insert([conductorData])
        .select()
        .single();

      if (error) throw error;

      setConductores(prev => [data, ...prev]);
      toast.success('Conductor creado exitosamente');
      return data;
    } catch (error) {
      console.error('Error creating conductor:', error);
      toast.error('Error creando conductor');
      throw error;
    }
  };

  const updateConductor = async (id: string, updates: Partial<Conductor>) => {
    try {
      const { data, error } = await supabase
        .from('conductores')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setConductores(prev => prev.map(c => c.id === id ? data : c));
      toast.success('Conductor actualizado exitosamente');
      return data;
    } catch (error) {
      console.error('Error updating conductor:', error);
      toast.error('Error actualizando conductor');
      throw error;
    }
  };

  const deleteConductor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('conductores')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setConductores(prev => prev.filter(c => c.id !== id));
      toast.success('Conductor eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting conductor:', error);
      toast.error('Error eliminando conductor');
      throw error;
    }
  };

  const createMultipleConductores = async (conductoresData: Partial<Conductor>[]) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Ensure each conductor has required fields and proper structure
      const conductoresWithDefaults = conductoresData.map(conductor => ({
        nombre: conductor.nombre || '',
        user_id: user.id,
        activo: conductor.activo ?? true,
        estado: conductor.estado || 'disponible',
        rfc: conductor.rfc || null,
        curp: conductor.curp || null,
        num_licencia: conductor.num_licencia || null,
        tipo_licencia: conductor.tipo_licencia || null,
        vigencia_licencia: conductor.vigencia_licencia || null,
        operador_sct: conductor.operador_sct ?? false,
        telefono: conductor.telefono || null,
        email: conductor.email || null,
        direccion: conductor.direccion || null,
        residencia_fiscal: conductor.residencia_fiscal || 'MEX',
        num_reg_id_trib: conductor.num_reg_id_trib || null
      }));

      const { data, error } = await supabase
        .from('conductores')
        .insert(conductoresWithDefaults)
        .select();

      if (error) throw error;
      
      toast.success(`${data.length} conductores creados exitosamente`);
      await fetchConductores();
      return data;
    } catch (err) {
      console.error('Error creating multiple conductores:', err);
      setError('Error al crear conductores');
      toast.error('Error al crear conductores');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConductores();
  }, []);

  return {
    conductores,
    loading,
    error,
    fetchConductores,
    createConductor,
    updateConductor,
    deleteConductor,
    createMultipleConductores
  };
}

// Export the Conductor type for external use
export type { Conductor };
