
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
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
  num_serie?: string; // alias for numero_serie_vin
  config_vehicular?: string;
  tipo_carroceria?: string;
  capacidad_carga?: number;
  peso_bruto_vehicular?: number;
  rendimiento?: number;
  tipo_combustible?: 'diesel' | 'gasolina';
  poliza_resp_civil?: string;
  poliza_seguro?: string; // alias for poliza_resp_civil
  asegura_resp_civil?: string;
  poliza_med_ambiente?: string;
  asegura_med_ambiente?: string;
  vigencia_seguro?: string;
  verificacion_vigencia?: string;
  perm_sct?: string;
  num_permiso_sct?: string;
  vigencia_permiso?: string;
  // GPS fields
  id_equipo_gps?: string;
  fecha_instalacion_gps?: string;
  acta_instalacion_gps?: string;
  // Nuevos campos de costos
  costo_mantenimiento_km: number;
  costo_llantas_km: number;
  valor_vehiculo?: number;
  configuracion_ejes: 'C2' | 'C3' | 'T2S1' | 'T3S2' | 'T3S3';
  factor_peajes: number;
  estado: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export const useVehiculos = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: vehiculos = [], isLoading: loading } = useQuery({
    queryKey: ['vehiculos', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('vehiculos')
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
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Vehiculo, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      // Validar placa
      if (data.placa) {
        const placaValidation = VehicleValidator.validarPlaca(data.placa);
        if (!placaValidation.esValido) {
          throw new Error(placaValidation.errores[0] || 'Placa inválida');
        }

        // Verificar placa única
        const { data: existingVehiculos, error: checkError } = await supabase
          .from('vehiculos')
          .select('id')
          .eq('user_id', user.id)
          .eq('placa', data.placa)
          .eq('activo', true);

        if (checkError) throw checkError;
        
        if (existingVehiculos && existingVehiculos.length > 0) {
          // Crear notificación de placa duplicada
          try {
            await supabase
              .from('notificaciones')
              .insert({
                user_id: user.id,
                tipo: 'error',
                titulo: 'Placa duplicada detectada',
                mensaje: `Ya existe un vehículo registrado con la placa: ${data.placa}. No puedes crear duplicados.`,
                urgente: false,
                metadata: {
                  link: '/vehiculos',
                  entityType: 'vehiculo',
                  actionRequired: true,
                  icon: 'AlertTriangle',
                  placa: data.placa
                }
              });
          } catch (notifError) {
            console.warn('Error creando notificación de placa duplicada:', notifError);
          }
          
          throw new Error('Ya existe un vehículo con esta placa');
        }
      }

      // Validar año del modelo
      if (data.anio) {
        const anioValidation = VehicleValidator.validarAnioModelo(data.anio);
        if (!anioValidation.esValido) {
          throw new Error(anioValidation.errores[0] || 'Año del modelo inválido');
        }
      }

      // Validar vigencia del seguro
      if (data.vigencia_seguro) {
        const fechaVigencia = new Date(data.vigencia_seguro);
        const hoy = new Date();
        
        if (fechaVigencia < hoy) {
          throw new Error('La póliza de seguro está vencida');
        }
      }

      // Validar permiso SCT
      if (data.num_permiso_sct) {
        const permisoValidation = VehicleValidator.validarPermisoSCT(data.num_permiso_sct);
        if (!permisoValidation.esValido) {
          throw new Error(permisoValidation.errores[0] || 'Permiso SCT inválido');
        }
      }
      
      const { data: result, error } = await supabase
        .from('vehiculos')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      toast.success('Vehículo creado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error creating vehicle:', error);
      toast.error(`Error al crear vehículo: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Vehiculo> }) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      // Validar placa si se está actualizando
      if (data.placa) {
        const placaValidation = VehicleValidator.validarPlaca(data.placa);
        if (!placaValidation.esValido) {
          throw new Error(placaValidation.errores[0] || 'Placa inválida');
        }

        // Verificar placa única (excepto el vehículo actual)
        const { data: existingVehiculos, error: checkError } = await supabase
          .from('vehiculos')
          .select('id')
          .eq('user_id', user.id)
          .eq('placa', data.placa)
          .eq('activo', true)
          .neq('id', id);

        if (checkError) throw checkError;
        
        if (existingVehiculos && existingVehiculos.length > 0) {
          throw new Error('Ya existe otro vehículo con esta placa');
        }
      }

      // Validar año del modelo
      if (data.anio) {
        const anioValidation = VehicleValidator.validarAnioModelo(data.anio);
        if (!anioValidation.esValido) {
          throw new Error(anioValidation.errores[0] || 'Año del modelo inválido');
        }
      }

      // Validar vigencia del seguro
      if (data.vigencia_seguro) {
        const fechaVigencia = new Date(data.vigencia_seguro);
        const hoy = new Date();
        
        if (fechaVigencia < hoy) {
          throw new Error('La póliza de seguro está vencida');
        }
      }

      // Validar permiso SCT
      if (data.num_permiso_sct) {
        const permisoValidation = VehicleValidator.validarPermisoSCT(data.num_permiso_sct);
        if (!permisoValidation.esValido) {
          throw new Error(permisoValidation.errores[0] || 'Permiso SCT inválido');
        }
      }

      const { data: result, error } = await supabase
        .from('vehiculos')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      toast.success('Vehículo actualizado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error updating vehicle:', error);
      toast.error(`Error al actualizar vehículo: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vehiculos')
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      toast.success('Vehículo eliminado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error deleting vehicle:', error);
      toast.error(`Error al eliminar vehículo: ${error.message}`);
    }
  });

  return { 
    vehiculos, 
    loading,
    crearVehiculo: createMutation.mutateAsync,
    actualizarVehiculo: updateMutation.mutateAsync,
    eliminarVehiculo: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
