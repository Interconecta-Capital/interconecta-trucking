
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';
import { toast } from 'sonner';
import { VehicleValidator } from '@/utils/vehicleValidation';

export interface Vehiculo {
  id: string;
  user_id: string;
  placa: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  numero_serie_vin?: string;
  num_serie?: string;
  config_vehicular?: string;
  tipo_carroceria?: string;
  capacidad_carga?: number;
  peso_bruto_vehicular?: number;
  rendimiento?: number;
  tipo_combustible?: 'diesel' | 'gasolina';
  poliza_resp_civil?: string;
  poliza_seguro?: string;
  asegura_resp_civil?: string;
  poliza_med_ambiente?: string;
  asegura_med_ambiente?: string;
  vigencia_seguro?: string;
  verificacion_vigencia?: string;
  perm_sct?: string;
  num_permiso_sct?: string;
  vigencia_permiso?: string;
  id_equipo_gps?: string;
  fecha_instalacion_gps?: string;
  acta_instalacion_gps?: string;
  costo_mantenimiento_km: number;
  costo_llantas_km: number;
  valor_vehiculo?: number;
  configuracion_ejes: 'C2' | 'C3' | 'T2S1' | 'T3S2' | 'T3S3';
  factor_peajes: number;
  estado: 'disponible' | 'en_viaje' | 'mantenimiento' | 'revision' | 'fuera_servicio';
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export const useVehiculos = () => {
  const { user, session, initialized } = useUnifiedAuth();
  const queryClient = useQueryClient();

  const { data: vehiculos = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['vehiculos', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.warn('[useVehiculos] No user ID available for query');
        return [];
      }
      
      console.log('[useVehiculos] Fetching vehicles for user:', user.id);
      
      const { data, error } = await supabase
        .from('vehiculos')
        .select('*')
        .eq('user_id', user.id)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useVehiculos] Query error:', error);
        throw error;
      }
      
      console.log('[useVehiculos] Fetched', data?.length || 0, 'vehicles');
      return data || [];
    },
    enabled: !!user?.id && initialized,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Vehiculo, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      console.log('[useVehiculos] ===== CREATING VEHICLE =====');
      console.log('[useVehiculos] User ID:', user?.id);
      console.log('[useVehiculos] Session exists:', !!session);
      console.log('[useVehiculos] Initialized:', initialized);
      console.log('[useVehiculos] Data to insert:', data);

      // Step 1: Verify user authentication
      if (!user?.id) {
        console.error('[useVehiculos] CRITICAL: No user ID available!');
        throw new Error('Usuario no autenticado. Por favor, inicia sesión nuevamente.');
      }

      // Step 2: Verify active session
      const { data: currentSession, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[useVehiculos] Session verification failed:', sessionError);
        throw new Error('Error verificando sesión. Por favor, recarga la página.');
      }

      if (!currentSession?.session) {
        console.error('[useVehiculos] CRITICAL: No active session!');
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }

      console.log('[useVehiculos] Session verified, user:', currentSession.session.user.id);

      // Step 3: Validate placa
      if (data.placa) {
        const placaValidation = VehicleValidator.validarPlaca(data.placa);
        if (!placaValidation.esValido) {
          throw new Error(placaValidation.errores[0] || 'Placa inválida');
        }

        // Check for duplicate placa
        const { data: existingVehiculos, error: checkError } = await supabase
          .from('vehiculos')
          .select('id, placa')
          .eq('user_id', user.id)
          .eq('placa', data.placa.toUpperCase().trim())
          .eq('activo', true);

        if (checkError) {
          console.error('[useVehiculos] Error checking duplicate placa:', checkError);
          throw checkError;
        }
        
        if (existingVehiculos && existingVehiculos.length > 0) {
          console.warn('[useVehiculos] Duplicate placa detected:', data.placa);
          throw new Error(`Ya existe un vehículo con la placa ${data.placa}`);
        }
      }

      // Step 4: Validate año
      if (data.anio) {
        const anioValidation = VehicleValidator.validarAnioModelo(data.anio);
        if (!anioValidation.esValido) {
          throw new Error(anioValidation.errores[0] || 'Año del modelo inválido');
        }
      }

      // Step 5: Validate vigencia seguro (solo advertencia, no bloquear)
      if (data.vigencia_seguro) {
        const fechaVigencia = new Date(data.vigencia_seguro);
        const hoy = new Date();
        
        if (fechaVigencia < hoy) {
          console.warn('[useVehiculos] ADVERTENCIA: La póliza de seguro está vencida');
          // Solo advertir, no bloquear el guardado
          toast.warning('Advertencia: La póliza de seguro está vencida');
        }
      }

      // Step 6: Validate permiso SCT
      if (data.num_permiso_sct) {
        const permisoValidation = VehicleValidator.validarPermisoSCT(data.num_permiso_sct);
        if (!permisoValidation.esValido) {
          throw new Error(permisoValidation.errores[0] || 'Permiso SCT inválido');
        }
      }

      // Step 7: Insert with explicit user_id and default values
      const insertData = {
        ...data,
        user_id: user.id,
        placa: data.placa?.toUpperCase().trim(),
        activo: true,
        estado: data.estado || 'disponible',
      };

      console.log('[useVehiculos] Inserting data:', insertData);
      
      const { data: result, error } = await supabase
        .from('vehiculos')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('[useVehiculos] INSERT ERROR:', error);
        console.error('[useVehiculos] Error code:', error.code);
        console.error('[useVehiculos] Error message:', error.message);
        console.error('[useVehiculos] Error details:', error.details);
        
        // Handle specific error codes
        if (error.code === '23505') {
          throw new Error('Ya existe un vehículo con esa placa o número de serie');
        }
        if (error.code === '23503') {
          throw new Error('Error de referencia en la base de datos');
        }
        if (error.code === '42501') {
          throw new Error('No tienes permisos para crear vehículos');
        }
        
        throw new Error(`Error al guardar: ${error.message}`);
      }

      if (!result) {
        console.error('[useVehiculos] CRITICAL: Insert returned no result!');
        throw new Error('El vehículo no se guardó correctamente. Intenta nuevamente.');
      }

      console.log('[useVehiculos] SUCCESS! Created vehicle:', result.id);
      
      // Post-insert verification
      const { data: verificacion, error: verifyError } = await supabase
        .from('vehiculos')
        .select('id, placa, user_id, activo')
        .eq('id', result.id)
        .single();
      
      if (verifyError) {
        console.error('[useVehiculos] POST-INSERT VERIFICATION FAILED:', verifyError);
      } else {
        console.log('[useVehiculos] POST-INSERT VERIFICATION SUCCESS:', verificacion);
      }
      
      return result;
    },
    onSuccess: (data) => {
      console.log('[useVehiculos] Mutation success, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-counts'] });
      toast.success(`Vehículo ${data.placa} creado exitosamente`);
    },
    onError: (error: any) => {
      console.error('[useVehiculos] Mutation error:', error);
      toast.error(error.message || 'Error al crear vehículo');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Vehiculo> }) => {
      console.log('[useVehiculos] Updating vehicle:', id, data);
      
      if (!user?.id) throw new Error('Usuario no autenticado');

      // Verify session
      const { data: currentSession } = await supabase.auth.getSession();
      if (!currentSession?.session) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }

      // Validate placa if updating
      if (data.placa) {
        const placaValidation = VehicleValidator.validarPlaca(data.placa);
        if (!placaValidation.esValido) {
          throw new Error(placaValidation.errores[0] || 'Placa inválida');
        }

        const { data: existingVehiculos, error: checkError } = await supabase
          .from('vehiculos')
          .select('id')
          .eq('user_id', user.id)
          .eq('placa', data.placa.toUpperCase().trim())
          .eq('activo', true)
          .neq('id', id);

        if (checkError) throw checkError;
        
        if (existingVehiculos && existingVehiculos.length > 0) {
          throw new Error('Ya existe otro vehículo con esta placa');
        }
      }

      if (data.anio) {
        const anioValidation = VehicleValidator.validarAnioModelo(data.anio);
        if (!anioValidation.esValido) {
          throw new Error(anioValidation.errores[0] || 'Año del modelo inválido');
        }
      }

      if (data.vigencia_seguro) {
        const fechaVigencia = new Date(data.vigencia_seguro);
        const hoy = new Date();
        
        if (fechaVigencia < hoy) {
          console.warn('[useVehiculos] ADVERTENCIA: La póliza de seguro está vencida');
          toast.warning('Advertencia: La póliza de seguro está vencida');
        }
      }

      if (data.num_permiso_sct) {
        const permisoValidation = VehicleValidator.validarPermisoSCT(data.num_permiso_sct);
        if (!permisoValidation.esValido) {
          throw new Error(permisoValidation.errores[0] || 'Permiso SCT inválido');
        }
      }

      const updateData = {
        ...data,
        placa: data.placa?.toUpperCase().trim(),
      };

      const { data: result, error } = await supabase
        .from('vehiculos')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id) // Security: ensure user owns the vehicle
        .select()
        .single();

      if (error) {
        console.error('[useVehiculos] Update error:', error);
        throw new Error(`Error al actualizar: ${error.message}`);
      }

      if (!result) {
        throw new Error('No se pudo actualizar el vehículo');
      }

      console.log('[useVehiculos] Vehicle updated:', result.id);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      toast.success('Vehículo actualizado exitosamente');
    },
    onError: (error: any) => {
      console.error('[useVehiculos] Update mutation error:', error);
      toast.error(error.message || 'Error al actualizar vehículo');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('vehiculos')
        .update({ activo: false })
        .eq('id', id)
        .eq('user_id', user.id); // Security: ensure user owns the vehicle

      if (error) {
        console.error('[useVehiculos] Delete error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-counts'] });
      toast.success('Vehículo eliminado exitosamente');
    },
    onError: (error: any) => {
      console.error('[useVehiculos] Delete mutation error:', error);
      toast.error(error.message || 'Error al eliminar vehículo');
    }
  });

  return { 
    vehiculos, 
    loading,
    refetch,
    crearVehiculo: createMutation.mutateAsync,
    actualizarVehiculo: updateMutation.mutateAsync,
    eliminarVehiculo: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
