import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Vehiculo = Database['public']['Tables']['vehiculos']['Row'];

interface VehiculosState {
  vehiculos: Vehiculo[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const useStableVehiculos = (userId?: string) => {
  const [state, setState] = useState<VehiculosState>({
    vehiculos: [],
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
        console.warn(`[StableVehiculos] Retrying operation, ${retries} attempts left`, error);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)));
        return retryWithBackoff(fn, retries - 1);
      }
      throw error;
    }
  }, []);

  const cargarVehiculos = useCallback(async () => {
    if (!userId || !mountedRef.current) return;

    console.log('[StableVehiculos] Loading vehicles for user:', userId);

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const loadData = async () => {
        // Query using correct column names from database - REMOVED tarjeta_circulacion and aseguradora
        const { data, error } = await supabase
          .from('vehiculos')
          .select(`
            id,
            user_id,
            placa,
            num_serie,
            modelo,
            marca,
            anio,
            config_vehicular,
            peso_bruto_vehicular,
            capacidad_carga,
            numero_ejes,
            numero_llantas,
            perm_sct,
            num_permiso_sct,
            poliza_seguro,
            vigencia_seguro,
            estado,
            activo,
            created_at,
            updated_at
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[StableVehiculos] Database error:', error);
          
          // Handle specific error types for better user experience
          if (error.code === 'PGRST301') {
            // Table doesn't exist or permission denied
            throw new Error('No tienes permisos para ver los vehículos o la tabla no existe');
          } else if (error.code === '406') {
            // Not acceptable - likely RLS issue or column permission problem
            throw new Error('Error de permisos en la base de datos');
          } else if (error.code === 'PGRST116') {
            // Row not found - this is actually OK for an empty table
            return [];
          }
          
          throw new Error(`Error cargando vehículos: ${error.message}`);
        }

        return data || [];
      };

      const vehiculos = await retryWithBackoff(loadData);

      if (mountedRef.current) {
        setState({
          vehiculos,
          loading: false,
          error: null,
          initialized: true,
        });
        console.log('[StableVehiculos] Loaded', vehiculos.length, 'vehicles successfully');
      }
    } catch (error) {
      console.error('[StableVehiculos] Error loading vehicles:', error);
      if (mountedRef.current) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
          initialized: true,
        }));
        
        // Only show toast on final failure after all retries
        if (retryCountRef.current >= MAX_RETRIES) {
          toast.error(`Error cargando vehículos: ${errorMessage}`);
        }
        retryCountRef.current++;
      }
    }
  }, [userId, retryWithBackoff]);

  const agregarVehiculo = useCallback(async (vehiculoData: Omit<Vehiculo, 'id' | 'created_at' | 'updated_at'>) => {
    if (!userId) throw new Error('Usuario no autenticado');

    try {
      const dataToInsert = {
        ...vehiculoData,
        user_id: userId,
      };

      const { data, error } = await retryWithBackoff(async () => {
        return await supabase
          .from('vehiculos')
          .insert([dataToInsert])
          .select()
          .single();
      });

      if (error) throw error;

      if (mountedRef.current && data) {
        setState(prev => ({
          ...prev,
          vehiculos: [data, ...prev.vehiculos],
        }));
        toast.success('Vehículo agregado exitosamente');
      }

      return data;
    } catch (error) {
      console.error('[StableVehiculos] Error adding vehicle:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error agregando vehículo';
      toast.error(errorMessage);
      throw error;
    }
  }, [userId, retryWithBackoff]);

  const actualizarVehiculo = useCallback(async (id: string, vehiculoData: Partial<Vehiculo>) => {
    try {
      const { data, error } = await retryWithBackoff(async () => {
        return await supabase
          .from('vehiculos')
          .update(vehiculoData)
          .eq('id', id)
          .select()
          .single();
      });

      if (error) throw error;

      if (mountedRef.current && data) {
        setState(prev => ({
          ...prev,
          vehiculos: prev.vehiculos.map(v => v.id === id ? data : v),
        }));
        toast.success('Vehículo actualizado exitosamente');
      }

      return data;
    } catch (error) {
      console.error('[StableVehiculos] Error updating vehicle:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error actualizando vehículo';
      toast.error(errorMessage);
      throw error;
    }
  }, [retryWithBackoff]);

  const eliminarVehiculo = useCallback(async (id: string) => {
    try {
      const { error } = await retryWithBackoff(async () => {
        return await supabase
          .from('vehiculos')
          .delete()
          .eq('id', id);
      });

      if (error) throw error;

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          vehiculos: prev.vehiculos.filter(v => v.id !== id),
        }));
        toast.success('Vehículo eliminado exitosamente');
      }
    } catch (error) {
      console.error('[StableVehiculos] Error deleting vehicle:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error eliminando vehículo';
      toast.error(errorMessage);
      throw error;
    }
  }, [retryWithBackoff]);

  // Load vehicles when userId changes with enhanced error recovery
  useEffect(() => {
    if (userId) {
      retryCountRef.current = 0;
      cargarVehiculos();
    } else {
      setState({
        vehiculos: [],
        loading: false,
        error: null,
        initialized: true,
      });
    }
  }, [userId, cargarVehiculos]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    vehiculos: state.vehiculos,
    loading: state.loading,
    error: state.error,
    initialized: state.initialized,
    agregarVehiculo,
    actualizarVehiculo,
    eliminarVehiculo,
    recargar: cargarVehiculos,
  };
};
