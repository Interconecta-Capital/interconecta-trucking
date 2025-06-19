
import { useState, useCallback } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';
import { CartaPorteProfessionalPDF, ProfessionalPDFOptions } from '@/services/pdf/CartaPorteProfessionalPDF';
import { toast } from 'sonner';

export function useProfessionalPDFGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const generateProfessionalPDF = useCallback(async (
    cartaPorteData: CartaPorteData,
    options: ProfessionalPDFOptions = {}
  ) => {
    if (isGenerating) return null;
    
    setIsGenerating(true);
    try {
      console.log('📄 Generando PDF profesional de Carta Porte...');
      
      const result = await CartaPorteProfessionalPDF.generateProfessionalPDF(cartaPorteData, options);
      
      if (result.success && result.pdfBlob && result.pdfUrl) {
        setPdfBlob(result.pdfBlob);
        setPdfUrl(result.pdfUrl);
        
        toast.success('PDF profesional generado correctamente');
        console.log('✅ PDF profesional generado exitosamente');
        
        return result;
      } else {
        throw new Error(result.error || 'Error generando PDF profesional');
      }
    } catch (error) {
      console.error('❌ Error generando PDF profesional:', error);
      toast.error('Error al generar el PDF profesional');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating]);

  const downloadPDF = useCallback((filename?: string) => {
    if (pdfBlob) {
      CartaPorteProfessionalPDF.downloadPDF(pdfBlob, filename);
      toast.success('PDF descargado correctamente');
    }
  }, [pdfBlob]);

  const clearPDF = useCallback(() => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
    setPdfBlob(null);
  }, [pdfUrl]);

  return {
    isGenerating,
    pdfUrl,
    pdfBlob,
    generateProfessionalPDF,
    downloadPDF,
    clearPDF
  };
}
