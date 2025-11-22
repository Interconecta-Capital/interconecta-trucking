
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { RFCValidator } from '@/utils/rfcValidation';
import { propagarCambiosSocio } from '@/utils/socioDataSync';

export interface Socio {
  id: string;
  user_id: string;
  nombre_razon_social: string;
  rfc: string;
  tipo_persona?: string;
  telefono?: string;
  email?: string;
  direccion?: any;
  estado: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export const useSocios = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: socios = [], isLoading: loading } = useQuery({
    queryKey: ['socios', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('socios')
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
    mutationFn: async (data: Omit<Socio, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      // Validar formato de RFC
      if (data.rfc) {
        const rfcValidation = RFCValidator.validarRFC(data.rfc);
        if (!rfcValidation.esValido) {
          throw new Error(rfcValidation.errores[0] || 'RFC inválido');
        }
      }

      // Verificar RFC único
      const { data: existingSocios, error: checkError } = await supabase
        .from('socios')
        .select('id')
        .eq('user_id', user.id)
        .eq('rfc', data.rfc)
        .eq('activo', true);

      if (checkError) throw checkError;
      
      if (existingSocios && existingSocios.length > 0) {
        // Crear notificación de RFC duplicado
        try {
          await supabase
            .from('notificaciones')
            .insert({
              user_id: user.id,
              tipo: 'error',
              titulo: 'RFC duplicado detectado',
              mensaje: `Ya existe un socio registrado con el RFC: ${data.rfc}. No puedes crear duplicados.`,
              urgente: false,
              metadata: {
                link: '/socios',
                entityType: 'socio',
                actionRequired: true,
                icon: 'AlertTriangle',
                rfc: data.rfc
              }
            });
        } catch (notifError) {
          console.warn('Error creando notificación de RFC duplicado:', notifError);
        }
        
        throw new Error('Ya existe un socio con este RFC');
      }

      const { data: result, error } = await supabase
        .from('socios')
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
      queryClient.invalidateQueries({ queryKey: ['socios'] });
      toast.success('Socio creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al crear socio: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Socio> }) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      // Obtener datos anteriores del socio para comparación
      const { data: socioAnterior } = await supabase
        .from('socios')
        .select('rfc, direccion, direccion_fiscal, regimen_fiscal, uso_cfdi')
        .eq('id', id)
        .single();

      // Validar formato de RFC si se está actualizando
      if (data.rfc) {
        const rfcValidation = RFCValidator.validarRFC(data.rfc);
        if (!rfcValidation.esValido) {
          throw new Error(rfcValidation.errores[0] || 'RFC inválido');
        }

        // Verificar RFC único (excepto el socio actual)
        const { data: existingSocios, error: checkError } = await supabase
          .from('socios')
          .select('id')
          .eq('user_id', user.id)
          .eq('rfc', data.rfc)
          .eq('activo', true)
          .neq('id', id);

        if (checkError) throw checkError;
        
        if (existingSocios && existingSocios.length > 0) {
          throw new Error('Ya existe otro socio con este RFC');
        }
      }

      const { data: result, error } = await supabase
        .from('socios')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Propagar cambios a documentos relacionados
      if (socioAnterior && result) {
        const cambios = await propagarCambiosSocio({
          socioId: id,
          userId: user.id,
          rfcAnterior: socioAnterior.rfc,
          rfcNuevo: result.rfc,
          direccionActualizada: (data as any).direccion,
          direccionFiscalActualizada: (data as any).direccion_fiscal,
          regimenFiscalActualizado: (data as any).regimen_fiscal,
          usoCfdiActualizado: (data as any).uso_cfdi
        });

        // Notificar sincronización
        if (cambios.success) {
          const totalActualizados = 
            cambios.viajesActualizados + 
            cambios.facturasBorradorActualizadas + 
            cambios.cartasPorteBorradorActualizadas;
          
          if (totalActualizados > 0) {
            toast.info(`Se actualizaron ${totalActualizados} documentos relacionados`, {
              description: `Viajes: ${cambios.viajesActualizados}, Facturas: ${cambios.facturasBorradorActualizadas}, Cartas Porte: ${cambios.cartasPorteBorradorActualizadas}`
            });
          }
        } else if (cambios.errores.length > 0) {
          toast.warning('Socio actualizado pero hubo errores en sincronización', {
            description: cambios.errores[0]
          });
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socios'] });
      toast.success('Socio actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al actualizar socio: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('socios')
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socios'] });
      toast.success('Socio eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al eliminar socio: ${error.message}`);
    }
  });

  return { 
    socios, 
    loading,
    crearSocio: createMutation.mutateAsync,
    actualizarSocio: updateMutation.mutateAsync,
    eliminarSocio: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
