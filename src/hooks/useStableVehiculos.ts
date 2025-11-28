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

      // Verify session first
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData?.session) {
        console.error('[StableVehiculos] No active session');
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
          initialized: true,
        }));
        return;
      }

      const loadData = async () => {
        const { data, error } = await supabase
          .from('vehiculos')
          .select('*')
          .eq('user_id', userId)
          .eq('activo', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[StableVehiculos] Database error:', error);
          
          if (error.code === 'PGRST301') {
            throw new Error('No tienes permisos para ver los vehículos');
          } else if (error.code === '406') {
            throw new Error('Error de permisos en la base de datos');
          } else if (error.code === 'PGRST116') {
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
        
        if (retryCountRef.current >= MAX_RETRIES) {
          toast.error(`Error cargando vehículos: ${errorMessage}`);
        }
        retryCountRef.current++;
      }
    }
  }, [userId, retryWithBackoff]);

  const agregarVehiculo = useCallback(async (vehiculoData: Omit<Vehiculo, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('[StableVehiculos] ===== ADDING VEHICLE =====');
    console.log('[StableVehiculos] User ID:', userId);
    console.log('[StableVehiculos] Data:', vehiculoData);

    if (!userId) {
      const error = new Error('Usuario no autenticado');
      toast.error(error.message);
      throw error;
    }

    // Verify session before insert
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData?.session) {
      const error = new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      toast.error(error.message);
      throw error;
    }

    console.log('[StableVehiculos] Session verified:', sessionData.session.user.id);

    try {
      const dataToInsert = {
        ...vehiculoData,
        user_id: userId,
        activo: true,
        estado: vehiculoData.estado || 'disponible',
        placa: vehiculoData.placa?.toUpperCase().trim(),
      };

      console.log('[StableVehiculos] Inserting:', dataToInsert);

      const { data, error } = await retryWithBackoff(async () => {
        return await supabase
          .from('vehiculos')
          .insert([dataToInsert])
          .select()
          .single();
      });

      if (error) {
        console.error('[StableVehiculos] Insert error:', error);
        
        if (error.code === '23505') {
          throw new Error('Ya existe un vehículo con esa placa o número de serie');
        }
        
        throw new Error(`Error al guardar: ${error.message}`);
      }

      if (!data) {
        console.error('[StableVehiculos] CRITICAL: No data returned from insert!');
        throw new Error('El vehículo no se guardó correctamente');
      }

      console.log('[StableVehiculos] SUCCESS! Vehicle created:', data.id);

      if (mountedRef.current && data) {
        setState(prev => ({
          ...prev,
          vehiculos: [data, ...prev.vehiculos],
        }));
        toast.success(`Vehículo ${data.placa} agregado exitosamente`);
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
    if (!userId) throw new Error('Usuario no autenticado');

    try {
      const { data, error } = await retryWithBackoff(async () => {
        return await supabase
          .from('vehiculos')
          .update({
            ...vehiculoData,
            placa: vehiculoData.placa?.toUpperCase().trim(),
          })
          .eq('id', id)
          .eq('user_id', userId) // Security check
          .select()
          .single();
      });

      if (error) throw new Error(`Error al actualizar: ${error.message}`);

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
  }, [userId, retryWithBackoff]);

  const eliminarVehiculo = useCallback(async (id: string) => {
    if (!userId) throw new Error('Usuario no autenticado');

    try {
      // Soft delete
      const { error } = await retryWithBackoff(async () => {
        return await supabase
          .from('vehiculos')
          .update({ activo: false })
          .eq('id', id)
          .eq('user_id', userId); // Security check
      });

      if (error) throw new Error(`Error al eliminar: ${error.message}`);

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
  }, [userId, retryWithBackoff]);

  // Load vehicles when userId changes
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
    mountedRef.current = true;
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
