
import { useState, useCallback } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';
import { CartaPorteLegalPDF, LegalPDFOptions, LegalPDFResult } from '@/services/pdf/CartaPorteLegalPDF';
import { toast } from 'sonner';

export function useCartaPorteLegalPDF() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfData, setPdfData] = useState<{
    url: string | null;
    blob: Blob | null;
  }>({
    url: null,
    blob: null
  });

  const generateLegalPDF = useCallback(async (
    cartaPorteData: CartaPorteData,
    options: LegalPDFOptions
  ): Promise<LegalPDFResult | null> => {
    if (isGenerating) return null;

    // Validar datos críticos obligatorios
    if (!options.datosTimbre.uuid || !options.datosTimbre.idCCP) {
      toast.error('UUID e IdCCP son obligatorios para generar PDF legal');
      return null;
    }

    if (!options.datosTimbre.selloDigital || !options.datosTimbre.selloSAT) {
      toast.error('Sellos digitales son obligatorios para PDF legal');
      return null;
    }

    if (!options.datosTimbre.cadenaOriginal) {
      toast.error('Cadena original es obligatoria para PDF legal');
      return null;
    }

    setIsGenerating(true);
    try {
      console.log('📄 Generando PDF legal de Carta Porte...');

      const result = await CartaPorteLegalPDF.generateLegalPDF(cartaPorteData, options);

      if (result.success && result.pdfBlob && result.pdfUrl) {
        setPdfData({ url: result.pdfUrl, blob: result.pdfBlob });
        console.log('✅ PDF legal generado correctamente');
        toast.success('PDF legal generado correctamente con sellos digitales');
        return result;
      }

      throw new Error(result.error || 'Error generando PDF legal');
    } catch (error) {
      console.error('❌ Error generando PDF legal:', error);
      toast.error('Error al generar el PDF legal');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating]);

  const downloadPDF = useCallback((filename?: string) => {
    if (pdfData.blob) {
      CartaPorteLegalPDF.downloadPDF(pdfData.blob, filename);
      toast.success('PDF legal descargado correctamente');
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
    generateLegalPDF,
    downloadPDF,
    clearPDF
  };
}
