
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface DocumentoEntidad {
  id: string;
  entidad_tipo: 'vehiculo' | 'conductor' | 'socio';
  entidad_id: string;
  tipo_documento: string;
  nombre_archivo: string;
  ruta_archivo: string;
  fecha_vencimiento?: string;
  activo: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useDocumentosEntidades = () => {
  const [documentos, setDocumentos] = useState<DocumentoEntidad[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const cargarDocumentos = async (entidadTipo: string, entidadId: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documentos_entidades')
        .select('*')
        .eq('entidad_tipo', entidadTipo)
        .eq('entidad_id', entidadId)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocumentos((data || []) as DocumentoEntidad[]);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      toast.error('Error al cargar documentos');
    } finally {
      setIsLoading(false);
    }
  };

  const subirDocumento = async (
    file: File,
    entidadTipo: 'vehiculo' | 'conductor' | 'socio',
    entidadId: string,
    tipoDocumento: string,
    fechaVencimiento?: string
  ) => {
    if (!user) return null;

    setIsLoading(true);
    try {
      // Subir archivo a Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${entidadTipo}/${entidadId}/${tipoDocumento}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Guardar referencia en la base de datos
      const { data, error } = await supabase
        .from('documentos_entidades')
        .insert({
          entidad_tipo: entidadTipo,
          entidad_id: entidadId,
          tipo_documento: tipoDocumento,
          nombre_archivo: file.name,
          ruta_archivo: uploadData.path,
          fecha_vencimiento: fechaVencimiento || null,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Documento subido correctamente');
      await cargarDocumentos(entidadTipo, entidadId);
      return data;
    } catch (error) {
      console.error('Error al subir documento:', error);
      toast.error('Error al subir documento');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const eliminarDocumento = async (documentoId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('documentos_entidades')
        .update({ activo: false })
        .eq('id', documentoId);

      if (error) throw error;
      
      toast.success('Documento eliminado');
      setDocumentos(prev => prev.filter(doc => doc.id !== documentoId));
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      toast.error('Error al eliminar documento');
    }
  };

  return {
    documentos,
    isLoading,
    cargarDocumentos,
    subirDocumento,
    eliminarDocumento
  };
};
