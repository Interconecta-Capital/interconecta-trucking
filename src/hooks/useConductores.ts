
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
  const { user } = useUnifiedAuth(); // ✅ Directo desde UnifiedAuth, sin provider adicional
  const queryClient = useQueryClient();

  const { data: conductores = [], isLoading: loading } = useQuery({
    queryKey: ['conductores', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('conductores')
        .select('*')
        .eq('user_id', user.id)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    // ✅ Retry con backoff exponencial para evitar fallos transitorios
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Conductor, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      // Validar licencia si se proporciona
      if (data.num_licencia && data.tipo_licencia) {
        const licenciaValidation = LicenseValidator.validarLicencia(
          data.num_licencia,
          '01' // Tipo figura operador
        );
        
        if (!licenciaValidation.esValida) {
          throw new Error(licenciaValidation.errores[0] || 'Licencia inválida');
        }
      }

      // Validar vigencia de licencia
      if (data.vigencia_licencia) {
        const fechaVigencia = new Date(data.vigencia_licencia);
        const hoy = new Date();
        
        if (fechaVigencia < hoy) {
          // Crear notificación de licencia vencida
          try {
            await supabase
              .from('notificaciones')
              .insert({
                user_id: user.id,
                tipo: 'error',
                titulo: 'Licencia de conductor vencida',
                mensaje: `No puedes registrar al conductor "${data.nombre}" porque su licencia está vencida desde el ${fechaVigencia.toLocaleDateString('es-MX')}. Solicita renovación.`,
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
            console.warn('Error creando notificación de licencia vencida:', notifError);
          }
          
          throw new Error('La licencia de conducir está vencida');
        }

        // Advertencia si la licencia vence pronto (dentro de 30 días)
        const diasRestantes = Math.ceil((fechaVigencia.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        if (diasRestantes <= 30 && diasRestantes > 0) {
          try {
            await supabase
              .from('notificaciones')
              .insert({
                user_id: user.id,
                tipo: 'warning',
                titulo: 'Licencia de conductor próxima a vencer',
                mensaje: `La licencia del conductor "${data.nombre}" vencerá en ${diasRestantes} días (${fechaVigencia.toLocaleDateString('es-MX')}). Planifica su renovación.`,
                urgente: diasRestantes <= 7,
                metadata: {
                  link: '/conductores',
                  entityType: 'licencia',
                  actionRequired: true,
                  icon: 'Clock',
                  conductorNombre: data.nombre,
                  numLicencia: data.num_licencia,
                  diasRestantes
                }
              });
          } catch (notifError) {
            console.warn('Error creando notificación de licencia próxima a vencer:', notifError);
          }
        }
      }

      const { data: result, error } = await supabase
        .from('conductores')
        .insert({
          ...data,
          user_id: user.id,
          activo: data.activo ?? true,
          estado: data.estado || 'disponible'
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conductores'] });
      toast.success('Conductor creado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error creating conductor:', error);
      toast.error(`Error al crear conductor: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Conductor> }) => {
      // Validar licencia si se está actualizando
      if (data.num_licencia && data.tipo_licencia) {
        const licenciaValidation = LicenseValidator.validarLicencia(
          data.num_licencia,
          '01' // Tipo figura operador
        );
        
        if (!licenciaValidation.esValida) {
          throw new Error(licenciaValidation.errores[0] || 'Licencia inválida');
        }
      }

      // Validar vigencia de licencia
      if (data.vigencia_licencia) {
        const fechaVigencia = new Date(data.vigencia_licencia);
        const hoy = new Date();
        
        if (fechaVigencia < hoy) {
          throw new Error('La licencia de conducir está vencida');
        }
      }

      const { data: result, error } = await supabase
        .from('conductores')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conductores'] });
      toast.success('Conductor actualizado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error updating conductor:', error);
      toast.error(`Error al actualizar conductor: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('conductores')
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conductores'] });
      toast.success('Conductor eliminado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error deleting conductor:', error);
      toast.error(`Error al eliminar conductor: ${error.message}`);
    }
  });

  const recargar = () => {
    queryClient.invalidateQueries({ queryKey: ['conductores'] });
  };

  return { 
    conductores, 
    loading,
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
