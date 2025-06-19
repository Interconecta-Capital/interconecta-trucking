import { useState, useCallback } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';
import { toast } from 'sonner';
import { CartaPorteProfessionalPDF } from '@/services/pdf/CartaPorteProfessionalPDF';

export function useEnhancedPDFGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfData, setPdfData] = useState<{
    url: string | null;
    blob: Blob | null;
    pages: number;
  }>({
    url: null,
    blob: null,
    pages: 0
  });

  const generateCompletePDF = useCallback(async (
    cartaPorteData: CartaPorteData,
    _datosRuta?: { distanciaTotal?: number; tiempoEstimado?: number }
  ) => {
    if (isGenerating) return null;

    setIsGenerating(true);
    try {
      console.log('📄 Generando PDF completo de carta porte...');

      const result = await CartaPorteProfessionalPDF.generateProfessionalPDF(cartaPorteData);

      if (result.success && result.pdfBlob && result.pdfUrl) {
        const pages = result.pages || 1;
        setPdfData({ url: result.pdfUrl, blob: result.pdfBlob, pages });
        console.log(`✅ PDF completo generado: ${pages} páginas`);
        toast.success(`PDF generado correctamente (${pages} páginas)`);
        return { url: result.pdfUrl, blob: result.pdfBlob, pages };
      }

      throw new Error(result.error || 'Error generando PDF');
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      toast.error('Error al generar el PDF');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating]);

  const clearPDF = useCallback(() => {
    if (pdfData.url) {
      URL.revokeObjectURL(pdfData.url);
    }
    setPdfData({ url: null, blob: null, pages: 0 });
  }, [pdfData.url]);

  return {
    isGenerating,
    pdfData,
    generateCompletePDF,
    clearPDF
  };
}
