
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface CartaPorte {
  id: string;
  usuario_id: string;
  folio?: string;
  tipo_cfdi?: string;
  rfc_emisor: string;
  nombre_emisor?: string;
  rfc_receptor: string;
  nombre_receptor?: string;
  entrada_salida_merc?: string;
  pais_origen_destino?: string;
  via_entrada_salida?: string;
  ubicacion_polo_origen?: string;
  ubicacion_polo_destino?: string;
  transporte_internacional?: boolean;
  registro_istmo?: boolean;
  status?: string;
  xml_generado?: string;
  uuid_fiscal?: string;
  fecha_timbrado?: string;
  tenant_id?: string;
  created_at: string;
  updated_at: string;
}

export const useCartasPorte = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cartasPorte = [], isLoading: loading } = useQuery({
    queryKey: ['cartas-porte', user?.usuario?.id],
    queryFn: async () => {
      if (!user?.usuario?.id) return [];
      
      const { data, error } = await supabase
        .from('cartas_porte')
        .select('*')
        .eq('usuario_id', user.usuario!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.usuario?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<CartaPorte, 'id' | 'usuario_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.usuario?.id) throw new Error('Usuario no autenticado');
      
      const { data: result, error } = await supabase
        .from('cartas_porte')
        .insert({
          ...data,
          usuario_id: user.usuario!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte'] });
      toast.success('Carta porte creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al crear carta porte: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CartaPorte> }) => {
      const { data: result, error } = await supabase
        .from('cartas_porte')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte'] });
      toast.success('Carta porte actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al actualizar carta porte: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cartas_porte')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartas-porte'] });
      toast.success('Carta porte eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al eliminar carta porte: ${error.message}`);
    }
  });

  return { 
    cartasPorte, 
    loading,
    crearCartaPorte: createMutation.mutateAsync,
    actualizarCartaPorte: updateMutation.mutateAsync,
    eliminarCartaPorte: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
