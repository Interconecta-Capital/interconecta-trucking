import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DecryptDocumentParams {
  tableName: 'conductores' | 'vehiculos' | 'remolques' | 'socios';
  recordId: string;
  columnName: string;
}

interface DecryptResult {
  success: boolean;
  documentData?: string;
  error?: string;
}

export function useDecryptDocument() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decryptDocument = async ({
    tableName,
    recordId,
    columnName
  }: DecryptDocumentParams): Promise<DecryptResult> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('decrypt-document', {
        body: { tableName, recordId, columnName }
      });

      if (fnError) {
        console.error('[useDecryptDocument] Edge function error:', fnError);
        const errorMessage = 'Error al descifrar documento';
        setError(errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      if (!data || !data.success) {
        const errorMessage = data?.error || 'No se pudo descifrar el documento';
        console.error('[useDecryptDocument] Decryption failed:', errorMessage);
        setError(errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      console.log('[useDecryptDocument] Document decrypted successfully');
      return { 
        success: true, 
        documentData: data.documentData 
      };

    } catch (err) {
      console.error('[useDecryptDocument] Unexpected error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
      setError(errorMessage);
      toast.error('Error al descifrar documento: ' + errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    decryptDocument,
    loading,
    error
  };
}
