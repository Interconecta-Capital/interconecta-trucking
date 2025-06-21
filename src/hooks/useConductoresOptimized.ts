
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';
import { Conductor } from '@/types/cartaPorte';
import { toast } from 'sonner';

export function useConductoresOptimized() {
  const { user, initialized } = useUnifiedAuth();
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConductores = useCallback(async () => {
    if (!user?.id || !initialized) {
      console.log('[useConductoresOptimized] No user or not initialized, skipping fetch');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('[useConductoresOptimized] Fetching conductores for user:', user.id);
      
      // Optimized query with direct RLS policy evaluation
      const { data, error } = await supabase
        .from('conductores')
        .select(`
          id,
          nombre,
          rfc,
          curp,
          telefono,
          email,
          num_licencia,
          tipo_licencia,
          vigencia_licencia,
          estado,
          activo,
          operador_sct,
          residencia_fiscal,
          num_reg_id_trib,
          direccion,
          created_at,
          updated_at,
          user_id
        `)
        .eq('user_id', user.id)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useConductoresOptimized] Fetch error:', error);
        throw error;
      }

      console.log('[useConductoresOptimized] Fetched conductores:', data?.length || 0);
      setConductores(data || []);
    } catch (error) {
      console.error('[useConductoresOptimized] Error fetching conductores:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      toast.error('Error cargando conductores: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id, initialized]);

  const createConductor = useCallback(async (conductorData: Omit<Conductor, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }
    
    try {
      console.log('[useConductoresOptimized] Creating conductor for user:', user.id);
      
      // Ensure required fields with proper defaults
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

      if (error) {
        console.error('[useConductoresOptimized] Create error:', error);
        throw error;
      }

      console.log('[useConductoresOptimized] Conductor created:', data.id);
      setConductores(prev => [data, ...prev]);
      toast.success('Conductor creado exitosamente');
      return data;
    } catch (error) {
      console.error('[useConductoresOptimized] Error creating conductor:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error creando conductor';
      toast.error(errorMessage);
      throw error;
    }
  }, [user?.id]);

  const updateConductor = useCallback(async (id: string, updates: Partial<Conductor>) => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    try {
      console.log('[useConductoresOptimized] Updating conductor:', id);
      
      const { data, error } = await supabase
        .from('conductores')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id) // Extra security check
        .select()
        .single();

      if (error) {
        console.error('[useConductoresOptimized] Update error:', error);
        throw error;
      }

      setConductores(prev => prev.map(c => c.id === id ? data : c));
      toast.success('Conductor actualizado exitosamente');
      return data;
    } catch (error) {
      console.error('[useConductoresOptimized] Error updating conductor:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error actualizando conductor';
      toast.error(errorMessage);
      throw error;
    }
  }, [user?.id]);

  const deleteConductor = useCallback(async (id: string) => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    try {
      console.log('[useConductoresOptimized] Deleting conductor:', id);
      
      const { error } = await supabase
        .from('conductores')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Extra security check

      if (error) {
        console.error('[useConductoresOptimized] Delete error:', error);
        throw error;
      }

      setConductores(prev => prev.filter(c => c.id !== id));
      toast.success('Conductor eliminado exitosamente');
    } catch (error) {
      console.error('[useConductoresOptimized] Error deleting conductor:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error eliminando conductor';
      toast.error(errorMessage);
      throw error;
    }
  }, [user?.id]);

  // Auto-fetch when user is available and initialized
  useEffect(() => {
    if (user?.id && initialized) {
      fetchConductores();
    }
  }, [user?.id, initialized, fetchConductores]);

  return {
    conductores,
    loading,
    error,
    fetchConductores,
    createConductor,
    updateConductor,
    deleteConductor,
    // Export user info for convenience
    user,
    isAuthenticated: !!user?.id
  };
}
