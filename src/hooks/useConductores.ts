
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Conductor {
  id: string;
  nombre: string;
  rfc?: string;
  curp?: string;
  num_licencia?: string;
  tipo_licencia?: string;
  vigencia_licencia?: string;
  operador_sct?: boolean;
  residencia_fiscal?: string;
  telefono?: string;
  email?: string;
  estado: string;
  direccion?: any;
  created_at: string;
  updated_at: string;
}

export function useConductores() {
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [loading, setLoading] = useState(true);
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
    deleteConductor
  };
}
