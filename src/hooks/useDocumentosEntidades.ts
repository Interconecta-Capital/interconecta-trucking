
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface DocumentoEntidad {
  id: string;
  user_id: string;
  entidad_tipo: string;
  entidad_id: string;
  tipo_documento: string;
  nombre_archivo: string;
  ruta_archivo: string;
  fecha_vencimiento?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

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

  const subirDocumento = async (
    file: File,
    entidadTipo: string,
    entidadId: string,
    tipoDocumento: string,
    fechaVencimiento?: string
  ) => {
    if (!user?.id) throw new Error('Usuario no autenticado');

    // Upload file to storage
    const fileName = `${entidadId}/${tipoDocumento}/${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documentos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Save document metadata
    const { data, error } = await supabase
      .from('documentos_entidades')
      .insert({
        user_id: user.id,
        entidad_tipo: entidadTipo,
        entidad_id: entidadId,
        tipo_documento: tipoDocumento,
        nombre_archivo: file.name,
        ruta_archivo: uploadData.path,
        fecha_vencimiento: fechaVencimiento,
        activo: true,
      })
      .select()
      .single();

    if (error) throw error;

    queryClient.invalidateQueries({ queryKey: ['documentos-entidades'] });
    toast.success('Documento subido exitosamente');
    
    return data;
  };

  const eliminarDocumento = async (documentoId: string) => {
    const { error } = await supabase
      .from('documentos_entidades')
      .update({ activo: false })
      .eq('id', documentoId);

    if (error) throw error;

    queryClient.invalidateQueries({ queryKey: ['documentos-entidades'] });
    toast.success('Documento eliminado exitosamente');
  };

  return {
    documentos: [],
    cargarDocumentos,
    subirDocumento,
    eliminarDocumento,
    isLoading: false,
  };
};
