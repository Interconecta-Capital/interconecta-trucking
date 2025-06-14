
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface DocumentoProcessado {
  id: string;
  user_id: string;
  file_path: string;
  document_type: string;
  extracted_text?: string;
  confidence: number;
  mercancias_count: number;
  errors?: string;
  carta_porte_id?: string;
  documento_original_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

interface DocumentosProcesadosResponse {
  id: string;
  user_id: string;
  file_path: string;
  document_type: string;
  extracted_text?: string;
  confidence: number;
  mercancias_count: number;
  errors?: string;
  carta_porte_id?: string;
  documento_original_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export const useDocumentosProcesados = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ['documentos-procesados'],
    queryFn: async (): Promise<DocumentoProcessado[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('documentos_procesados')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .returns<DocumentosProcesadosResponse[]>();

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const eliminarDocumentoMutation = useMutation({
    mutationFn: async (documentoId: string) => {
      const { error } = await supabase
        .from('documentos_procesados')
        .delete()
        .eq('id', documentoId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos-procesados'] });
      toast.success('Documento eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting document:', error);
      toast.error('Error al eliminar el documento');
    },
  });

  const getDocumentosByCartaPorte = (cartaPorteId: string) => {
    return documentos.filter(doc => doc.carta_porte_id === cartaPorteId);
  };

  const getDocumentosRecientes = (limit: number = 10) => {
    return documentos.slice(0, limit);
  };

  const getEstadisticas = () => {
    const total = documentos.length;
    const exitosos = documentos.filter(doc => doc.confidence > 0.7).length;
    const conErrores = documentos.filter(doc => doc.errors).length;
    
    return {
      total,
      exitosos,
      conErrores,
      tasaExito: total > 0 ? (exitosos / total) * 100 : 0
    };
  };

  return {
    documentos,
    isLoading,
    eliminarDocumento: eliminarDocumentoMutation.mutate,
    isDeleting: eliminarDocumentoMutation.isPending,
    getDocumentosByCartaPorte,
    getDocumentosRecientes,
    getEstadisticas,
  };
};
