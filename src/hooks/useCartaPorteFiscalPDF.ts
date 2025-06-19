
import { useState, useCallback } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';
import { CartaPorteFiscalPDF, FiscalPDFOptions, FiscalPDFResult } from '@/services/pdf/CartaPorteFiscalPDF';
import { toast } from 'sonner';

export function useCartaPorteFiscalPDF() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfData, setPdfData] = useState<{
    url: string | null;
    blob: Blob | null;
  }>({
    url: null,
    blob: null
  });

  const generateFiscalPDF = useCallback(async (
    cartaPorteData: CartaPorteData,
    options: FiscalPDFOptions
  ): Promise<FiscalPDFResult | null> => {
    if (isGenerating) return null;

    // Validar datos críticos
    if (!options.datosTimbre.uuid || !options.datosTimbre.idCCP) {
      toast.error('UUID e IdCCP son obligatorios para generar PDF fiscal');
      return null;
    }

    if (!options.datosTimbre.selloDigital || !options.datosTimbre.selloSAT || !options.datosTimbre.cadenaOriginal) {
      toast.error('Sellos digitales y cadena original son obligatorios para PDF fiscal');
      return null;
    }

    setIsGenerating(true);
    try {
      console.log('📄 Generando PDF fiscal de Carta Porte...');

      const result = await CartaPorteFiscalPDF.generateFiscalPDF(cartaPorteData, options);

      if (result.success && result.pdfBlob && result.pdfUrl) {
        setPdfData({ url: result.pdfUrl, blob: result.pdfBlob });
        console.log('✅ PDF fiscal generado correctamente');
        toast.success('PDF fiscal generado correctamente');
        return result;
      }

      throw new Error(result.error || 'Error generando PDF fiscal');
    } catch (error) {
      console.error('❌ Error generando PDF fiscal:', error);
      toast.error('Error al generar el PDF fiscal');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating]);

  const downloadPDF = useCallback((filename?: string) => {
    if (pdfData.blob) {
      CartaPorteFiscalPDF.downloadPDF(pdfData.blob, filename);
      toast.success('PDF fiscal descargado correctamente');
    }
  }, [pdfData.blob]);

  const clearPDF = useCallback(() => {
    if (pdfData.url) {
      URL.revokeObjectURL(pdfData.url);
    }
    setPdfData({ url: null, blob: null });
  }, [pdfData.url]);

  return {
    isGenerating,
    pdfData,
    generateFiscalPDF,
    downloadPDF,
    clearPDF
  };
}
