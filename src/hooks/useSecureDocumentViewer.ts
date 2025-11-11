import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OpenDocumentParams {
  tableName: 'conductores' | 'vehiculos' | 'remolques' | 'socios';
  recordId: string;
  columnName: string;
  documentLabel: string;
}

interface DocumentData extends OpenDocumentParams {
  // Datos adicionales del documento si se necesitan
}

export function useSecureDocumentViewer() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<DocumentData | null>(null);

  const openDocument = useCallback(async (params: OpenDocumentParams) => {
    try {
      // Registrar acceso en audit log
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from('security_audit_log').insert({
          user_id: user.id,
          event_type: 'document_view_requested',
          event_data: {
            table_name: params.tableName,
            record_id: params.recordId,
            column_name: params.columnName,
            document_label: params.documentLabel,
            timestamp: new Date().toISOString()
          },
          severity: 'info'
        });
      }

      setCurrentDocument(params);
      setIsOpen(true);
    } catch (error) {
      console.error('Error al abrir documento:', error);
      toast.error('Error al abrir el documento');
    }
  }, []);

  const closeDocument = useCallback(() => {
    // Limpiar datos sensibles
    setCurrentDocument(null);
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    currentDocument,
    openDocument,
    closeDocument
  };
}
