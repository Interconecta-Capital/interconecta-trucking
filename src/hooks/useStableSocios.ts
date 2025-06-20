
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Socio = Database['public']['Tables']['socios']['Row'];

interface SociosState {
  socios: Socio[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const useStableSocios = (userId?: string) => {
  const [state, setState] = useState<SociosState>({
    socios: [],
    loading: true,
    error: null,
    initialized: false,
  });

  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);

  const retryWithBackoff = useCallback(async (fn: () => Promise<any>, retries = MAX_RETRIES): Promise<any> => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        console.warn(`[StableSocios] Retrying operation, ${retries} attempts left`, error);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)));
        return retryWithBackoff(fn, retries - 1);
      }
      throw error;
    }
  }, []);

  const cargarSocios = useCallback(async () => {
    if (!userId || !mountedRef.current) return;

    console.log('[StableSocios] Loading partners for user:', userId);

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const loadData = async () => {
        // Simple query without complex joins that might cause 406 errors
        const { data, error } = await supabase
          .from('socios')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[StableSocios] Database error:', error);
          throw new Error(`Error cargando socios: ${error.message}`);
        }

        return data || [];
      };

      const socios = await retryWithBackoff(loadData);

      if (mountedRef.current) {
        setState({
          socios,
          loading: false,
          error: null,
          initialized: true,
        });
        console.log('[StableSocios] Loaded', socios.length, 'partners successfully');
      }
    } catch (error) {
      console.error('[StableSocios] Error loading partners:', error);
      if (mountedRef.current) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
          initialized: true,
        }));
        
        // Only show toast on final failure
        if (retryCountRef.current >= MAX_RETRIES) {
          toast.error(`Error cargando socios: ${errorMessage}`);
        }
        retryCountRef.current++;
      }
    }
  }, [userId, retryWithBackoff]);

  const agregarSocio = useCallback(async (socioData: Omit<Socio, 'id' | 'created_at' | 'updated_at'>) => {
    if (!userId) throw new Error('Usuario no autenticado');

    try {
      const dataToInsert = {
        ...socioData,
        user_id: userId,
      };

      const { data, error } = await retryWithBackoff(async () => {
        return await supabase
          .from('socios')
          .insert([dataToInsert])
          .select()
          .single();
      });

      if (error) throw error;

      if (mountedRef.current && data) {
        setState(prev => ({
          ...prev,
          socios: [data, ...prev.socios],
        }));
        toast.success('Socio agregado exitosamente');
      }

      return data;
    } catch (error) {
      console.error('[StableSocios] Error adding partner:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error agregando socio';
      toast.error(errorMessage);
      throw error;
    }
  }, [userId, retryWithBackoff]);

  const actualizarSocio = useCallback(async (id: string, socioData: Partial<Socio>) => {
    try {
      const { data, error } = await retryWithBackoff(async () => {
        return await supabase
          .from('socios')
          .update(socioData)
          .eq('id', id)
          .select()
          .single();
      });

      if (error) throw error;

      if (mountedRef.current && data) {
        setState(prev => ({
          ...prev,
          socios: prev.socios.map(s => s.id === id ? data : s),
        }));
        toast.success('Socio actualizado exitosamente');
      }

      return data;
    } catch (error) {
      console.error('[StableSocios] Error updating partner:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error actualizando socio';
      toast.error(errorMessage);
      throw error;
    }
  }, [retryWithBackoff]);

  const eliminarSocio = useCallback(async (id: string) => {
    try {
      const { error } = await retryWithBackoff(async () => {
        return await supabase
          .from('socios')
          .delete()
          .eq('id', id);
      });

      if (error) throw error;

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          socios: prev.socios.filter(s => s.id !== id),
        }));
        toast.success('Socio eliminado exitosamente');
      }
    } catch (error) {
      console.error('[StableSocios] Error deleting partner:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error eliminando socio';
      toast.error(errorMessage);
      throw error;
    }
  }, [retryWithBackoff]);

  // Load partners when userId changes
  useEffect(() => {
    if (userId) {
      retryCountRef.current = 0;
      cargarSocios();
    } else {
      setState({
        socios: [],
        loading: false,
        error: null,
        initialized: true,
      });
    }
  }, [userId, cargarSocios]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    socios: state.socios,
    loading: state.loading,
    error: state.error,
    initialized: state.initialized,
    agregarSocio,
    actualizarSocio,
    eliminarSocio,
    recargar: cargarSocios,
  };
};
