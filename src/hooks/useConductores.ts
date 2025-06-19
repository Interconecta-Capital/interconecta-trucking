
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

  const createConductor = async (conductorData: Omit<Conductor, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return;
    
    try {
      // Ensure required fields are present based on actual database schema
      const conductorForSupabase = {
        nombre: conductorData.nombre || 'Sin nombre',
        user_id: user.id,
        activo: conductorData.activo ?? true,
        estado: conductorData.estado || 'disponible',
        rfc: conductorData.rfc || null,
        curp: conductorData.curp || null,
        num_licencia: conductorData.num_licencia || null,
        tipo_licencia: conductorData.tipo_licencia || null,
        vigencia_licencia: conductorData.vigencia_licencia || null,
        operador_sct: conductorData.operador_sct ?? false,
        telefono: conductorData.telefono || null,
        email: conductorData.email || null,
        direccion: conductorData.direccion || null,
        residencia_fiscal: conductorData.residencia_fiscal || 'MEX',
        num_reg_id_trib: conductorData.num_reg_id_trib || null
      };

      const { data, error } = await supabase
        .from('conductores')
        .insert(conductorForSupabase)
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

  const createMultipleConductores = async (conductoresData: Array<Omit<Conductor, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const results = [];
      
      // Insert each conductor individually for better error handling
      for (const conductorData of conductoresData) {
        const result = await createConductor(conductorData);
        if (result) {
          results.push(result);
        }
      }
      
      toast.success(`${results.length} conductores creados exitosamente`);
      await fetchConductores();
      return results;
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
