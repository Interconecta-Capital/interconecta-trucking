
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useDocumentosEntidades = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const cargarDocumentos = async (entidadTipo: string, entidadId: string) => {
    if (!user?.id) return [];

    const { data, error } = await supabase
      .from('documentos_entidades')
      .select('*')
      .eq('user_id', user.id)
      .eq('entidad_tipo', entidadTipo)
      .eq('entidad_id', entidadId)
      .eq('activo', true);

    if (error) throw error;
    return data || [];
  };

  return {
    documentos: [],
    cargarDocumentos,
  };
};
