
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';
import { toast } from 'sonner';
import { LicenseValidator } from '@/utils/licenseValidation';

export interface Conductor {
  id: string;
  user_id: string;
  nombre: string;
  telefono?: string;
  email?: string;
  rfc?: string;
  curp?: string;
  num_licencia?: string;
  tipo_licencia?: string;
  vigencia_licencia?: string;
  num_reg_id_trib?: string;
  residencia_fiscal?: string;
  operador_sct?: boolean;
  direccion?: any;
  estado: 'disponible' | 'en_viaje' | 'descanso' | 'vacaciones' | 'baja_temporal' | 'fuera_servicio';
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export const useConductores = () => {
  const { user, session, initialized } = useUnifiedAuth();
  const queryClient = useQueryClient();

  const { data: conductores = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['conductores', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.warn('[useConductores] No user ID available for query');
        return [];
      }
      
      console.log('[useConductores] Fetching conductores for user:', user.id);
      
      const { data, error } = await supabase
        .from('conductores')
        .select('*')
        .eq('user_id', user.id)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useConductores] Query error:', error);
        throw error;
      }
      
      console.log('[useConductores] Fetched', data?.length || 0, 'conductores');
      return data || [];
    },
    enabled: !!user?.id && initialized,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Conductor, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      console.log('[useConductores] ===== CREATING CONDUCTOR =====');
      console.log('[useConductores] User ID:', user?.id);
      console.log('[useConductores] Session exists:', !!session);
      console.log('[useConductores] Data to insert:', data);

      // Step 1: Verify user authentication
      if (!user?.id) {
        console.error('[useConductores] CRITICAL: No user ID available!');
        throw new Error('Usuario no autenticado. Por favor, inicia sesión nuevamente.');
      }

      // Step 2: Verify active session
      const { data: currentSession, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[useConductores] Session verification failed:', sessionError);
        throw new Error('Error verificando sesión. Por favor, recarga la página.');
      }

      if (!currentSession?.session) {
        console.error('[useConductores] CRITICAL: No active session!');
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }

      // Step 3: Validate RFC uniqueness
      if (data.rfc && data.rfc.trim() !== '') {
        const rfcNormalizado = data.rfc.toUpperCase().trim();
        console.log('[useConductores] Checking RFC uniqueness:', rfcNormalizado);
        
        const { data: existingConductor, error: checkError } = await supabase
          .from('conductores')
          .select('id, nombre, rfc')
          .eq('user_id', user.id)
          .eq('rfc', rfcNormalizado)
          .eq('activo', true)
          .maybeSingle();

        if (checkError) {
          console.error('[useConductores] Error checking RFC:', checkError);
          // Don't throw, continue with insert
        }
        
        if (existingConductor) {
          console.warn('[useConductores] Duplicate RFC detected:', rfcNormalizado);
          throw new Error(
            `Ya existe un conductor con el RFC ${rfcNormalizado}: "${existingConductor.nombre}". ` +
            `Puedes editar ese conductor en lugar de crear uno nuevo.`
          );
        }
      }

      // Step 4: Validate CURP uniqueness
      if (data.curp && data.curp.trim() !== '') {
        const curpNormalizado = data.curp.toUpperCase().trim();
        
        const { data: existingCurp, error: curpError } = await supabase
          .from('conductores')
          .select('id, nombre')
          .eq('user_id', user.id)
          .eq('curp', curpNormalizado)
          .eq('activo', true)
          .maybeSingle();

        if (!curpError && existingCurp) {
          throw new Error(
            `Ya existe un conductor con el CURP ${curpNormalizado}: "${existingCurp.nombre}".`
          );
        }
      }

      // Step 5: Validate licencia
      if (data.num_licencia && data.tipo_licencia) {
        const licenciaValidation = LicenseValidator.validarLicencia(data.num_licencia, '01');
        
        if (!licenciaValidation.esValida) {
          throw new Error(licenciaValidation.errores[0] || 'Licencia inválida');
        }
      }

      // Step 6: Validate vigencia licencia
      if (data.vigencia_licencia) {
        const fechaVigencia = new Date(data.vigencia_licencia);
        const hoy = new Date();
        
        if (fechaVigencia < hoy) {
          // Create notification for expired license
          try {
            await supabase
              .from('notificaciones')
              .insert({
                user_id: user.id,
                tipo: 'error',
                titulo: 'Licencia de conductor vencida',
                mensaje: `No puedes registrar al conductor "${data.nombre}" porque su licencia está vencida desde el ${fechaVigencia.toLocaleDateString('es-MX')}.`,
                urgente: true,
                metadata: {
                  link: '/conductores',
                  entityType: 'licencia',
                  actionRequired: true,
                  icon: 'AlertTriangle',
                  conductorNombre: data.nombre,
                  numLicencia: data.num_licencia
                }
              });
          } catch (notifError) {
            console.warn('[useConductores] Error creating notification:', notifError);
          }
          
          throw new Error('La licencia de conducir está vencida');
        }

        // Warning if license expires soon
        const diasRestantes = Math.ceil((fechaVigencia.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        if (diasRestantes <= 30 && diasRestantes > 0) {
          try {
            await supabase
              .from('notificaciones')
              .insert({
                user_id: user.id,
                tipo: 'warning',
                titulo: 'Licencia próxima a vencer',
                mensaje: `La licencia del conductor "${data.nombre}" vencerá en ${diasRestantes} días.`,
                urgente: diasRestantes <= 7,
                metadata: {
                  link: '/conductores',
                  entityType: 'licencia',
                  conductorNombre: data.nombre,
                  diasRestantes
                }
              });
          } catch (notifError) {
            console.warn('[useConductores] Error creating warning notification:', notifError);
          }
        }
      }

      // Step 7: Insert with explicit user_id and defaults
      const insertData = {
        ...data,
        user_id: user.id,
        rfc: data.rfc?.toUpperCase().trim() || null,
        curp: data.curp?.toUpperCase().trim() || null,
        activo: true,
        estado: data.estado || 'disponible'
      };

      console.log('[useConductores] Inserting data:', insertData);

      const { data: result, error } = await supabase
        .from('conductores')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('[useConductores] INSERT ERROR:', error);
        console.error('[useConductores] Error code:', error.code);
        console.error('[useConductores] Error message:', error.message);
        
        // Handle specific error codes
        if (error.code === '23505') {
          if (error.message.includes('rfc')) {
            throw new Error('Ya existe un conductor con ese RFC');
          }
          if (error.message.includes('curp')) {
            throw new Error('Ya existe un conductor con ese CURP');
          }
          throw new Error('Ya existe un conductor con esos datos');
        }
        if (error.code === '42501') {
          throw new Error('No tienes permisos para crear conductores');
        }
        
        throw new Error(`Error al guardar: ${error.message}`);
      }

      if (!result) {
        console.error('[useConductores] CRITICAL: Insert returned no result!');
        throw new Error('El conductor no se guardó correctamente. Intenta nuevamente.');
      }

      console.log('[useConductores] SUCCESS! Created conductor:', result.id);
      return result;
    },
    onSuccess: (data) => {
      console.log('[useConductores] Mutation success, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['conductores'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-counts'] });
      toast.success(`Conductor "${data.nombre}" creado exitosamente`);
    },
    onError: (error: any) => {
      console.error('[useConductores] Mutation error:', error);
      toast.error(error.message || 'Error al crear conductor');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Conductor> }) => {
      console.log('[useConductores] Updating conductor:', id, data);
      
      if (!user?.id) throw new Error('Usuario no autenticado');

      // Verify session
      const { data: currentSession } = await supabase.auth.getSession();
      if (!currentSession?.session) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }

      // Validate RFC uniqueness if updating
      if (data.rfc && data.rfc.trim() !== '') {
        const rfcNormalizado = data.rfc.toUpperCase().trim();
        
        const { data: existingConductor } = await supabase
          .from('conductores')
          .select('id, nombre')
          .eq('user_id', user.id)
          .eq('rfc', rfcNormalizado)
          .eq('activo', true)
          .neq('id', id)
          .maybeSingle();
        
        if (existingConductor) {
          throw new Error(`Ya existe otro conductor con el RFC ${rfcNormalizado}`);
        }
      }

      // Validate licencia if updating
      if (data.num_licencia && data.tipo_licencia) {
        const licenciaValidation = LicenseValidator.validarLicencia(data.num_licencia, '01');
        
        if (!licenciaValidation.esValida) {
          throw new Error(licenciaValidation.errores[0] || 'Licencia inválida');
        }
      }

      if (data.vigencia_licencia) {
        const fechaVigencia = new Date(data.vigencia_licencia);
        const hoy = new Date();
        
        if (fechaVigencia < hoy) {
          throw new Error('La licencia de conducir está vencida');
        }
      }

      const updateData = {
        ...data,
        rfc: data.rfc?.toUpperCase().trim(),
        curp: data.curp?.toUpperCase().trim(),
      };

      const { data: result, error } = await supabase
        .from('conductores')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id) // Security: ensure user owns the conductor
        .select()
        .single();

      if (error) {
        console.error('[useConductores] Update error:', error);
        if (error.code === '23505') {
          throw new Error('Ya existe otro conductor con ese RFC o CURP');
        }
        throw new Error(`Error al actualizar: ${error.message}`);
      }

      if (!result) {
        throw new Error('No se pudo actualizar el conductor');
      }

      console.log('[useConductores] Conductor updated:', result.id);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conductores'] });
      toast.success('Conductor actualizado exitosamente');
    },
    onError: (error: any) => {
      console.error('[useConductores] Update mutation error:', error);
      toast.error(error.message || 'Error al actualizar conductor');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('conductores')
        .update({ activo: false })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('[useConductores] Delete error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conductores'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-counts'] });
      toast.success('Conductor eliminado exitosamente');
    },
    onError: (error: any) => {
      console.error('[useConductores] Delete mutation error:', error);
      toast.error(error.message || 'Error al eliminar conductor');
    }
  });

  const recargar = () => {
    queryClient.invalidateQueries({ queryKey: ['conductores'] });
  };

  return { 
    conductores, 
    loading,
    refetch,
    createConductor: createMutation.mutateAsync,
    updateConductor: updateMutation.mutateAsync,
    eliminarConductor: deleteMutation.mutateAsync,
    deleteConductor: deleteMutation.mutateAsync,
    recargar,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
