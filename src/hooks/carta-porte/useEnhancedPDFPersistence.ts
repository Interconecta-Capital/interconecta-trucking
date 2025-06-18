import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CartaPorteData } from '@/types/cartaPorte';
import { CartaPortePDFAdvanced } from '@/services/pdfGenerator/CartaPortePDFAdvanced';

export function useEnhancedPDFPersistence(cartaPorteId?: string) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const restorePDF = useCallback(async (id: string) => {
    setIsRestoring(true);
    try {
      const { data, error } = await supabase
        .from('cartas_porte')
        .select('pdf_url')
        .eq('id', id)
        .single();
      if (error) throw error;
      if (data?.pdf_url) {
        setPdfUrl(data.pdf_url);
      }
    } catch (err) {
      console.error('Error restaurando PDF:', err);
    } finally {
      setIsRestoring(false);
    }
  }, []);

  useEffect(() => {
    if (cartaPorteId) {
      restorePDF(cartaPorteId);
    }
  }, [cartaPorteId, restorePDF]);

  const savePDF = useCallback(
    async (blob: Blob) => {
      if (!cartaPorteId) return;
      setIsSaving(true);
      try {
        const path = `${cartaPorteId}/carta-porte.pdf`;
        const { error } = await supabase.storage
          .from('cartas-porte-pdf')
          .upload(path, blob, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage
          .from('cartas-porte-pdf')
          .getPublicUrl(path);
        await supabase
          .from('cartas_porte')
          .update({ pdf_url: data.publicUrl })
          .eq('id', cartaPorteId);
        setPdfUrl(data.publicUrl);
      } catch (err) {
        console.error('Error guardando PDF:', err);
      } finally {
        setIsSaving(false);
      }
    },
    [cartaPorteId]
  );

  const generateAndPersistPDF = useCallback(
    async (
      data: CartaPorteData,
      routeData?: { distanciaTotal?: number; tiempoEstimado?: number }
    ) => {
      const result = await CartaPortePDFAdvanced.generarPDF(data);
      if (result.success && result.pdfBlob) {
        await savePDF(result.pdfBlob);
      }
      return result;
    },
    [savePDF]
  );

  return { pdfUrl, isRestoring, isSaving, generateAndPersistPDF };
}

