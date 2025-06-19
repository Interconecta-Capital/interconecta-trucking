
import { useState, useCallback } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';
import { toast } from 'sonner';
import { ProfessionalCartaPortePDF } from '@/services/pdfGenerator/ProfessionalCartaPortePDF';

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
    datosRuta?: { distanciaTotal?: number; tiempoEstimado?: number }
  ) => {
    if (isGenerating) return null;
    
    setIsGenerating(true);
    try {
      console.log('📄 Generando PDF profesional de carta porte...');
      
      const generator = new ProfessionalCartaPortePDF();
      const result = await generator.generatePDF(cartaPorteData, datosRuta);
      
      if (result.success && result.blob && result.pdfUrl) {
        const pdfResult = {
          url: result.pdfUrl,
          blob: result.blob,
          pages: result.pages || 1
        };
        
        setPdfData(pdfResult);
        
        console.log(`✅ PDF profesional generado: ${result.pages} páginas`);
        toast.success(`PDF profesional generado correctamente (${result.pages} páginas)`);
        
        return pdfResult;
      } else {
        throw new Error(result.error || 'Error generando PDF');
      }
      
    } catch (error) {
      console.error('❌ Error generando PDF profesional:', error);
      toast.error('Error al generar el PDF profesional');
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
