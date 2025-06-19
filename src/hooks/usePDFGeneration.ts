
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CartaPortePDFGenerator, PDFGenerationResult } from '@/services/pdfGenerator';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';

export const usePDFGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const { toast } = useToast();

  const generarPDF = async (
    cartaPorteData: CartaPorteData,
    datosTimbre?: any
  ): Promise<PDFGenerationResult> => {
    setIsGenerating(true);
    try {
      console.log('Iniciando generación de PDF para Carta Porte');
      
      const resultado = await CartaPortePDFGenerator.generarPDF(cartaPorteData, datosTimbre);
      
      if (resultado.success && resultado.pdfBlob && resultado.pdfUrl) {
        setPdfBlob(resultado.pdfBlob);
        setPdfUrl(resultado.pdfUrl);
        
        toast({
          title: "PDF generado correctamente",
          description: "La representación impresa está lista para visualizar",
        });
      } else {
        toast({
          title: "Error generando PDF",
          description: resultado.error || 'Error desconocido',
          variant: "destructive",
        });
      }
      
      return resultado;
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast({
        title: "Error crítico",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
      return {
        success: false,
        error: 'Error crítico en la generación'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  const descargarPDF = (filename?: string) => {
    if (!pdfBlob) {
      toast({
        title: "Error",
        description: "No hay PDF disponible para descargar",
        variant: "destructive",
      });
      return;
    }

    try {
      CartaPortePDFGenerator.descargarPDF(pdfBlob, filename);
      
      toast({
        title: "Descarga iniciada",
        description: "PDF descargado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error en descarga",
        description: "No se pudo descargar el archivo PDF",
        variant: "destructive",
      });
    }
  };

  const limpiarPDF = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
    setPdfBlob(null);
  };

  return {
    // Estados
    isGenerating,
    pdfUrl,
    pdfBlob,
    
    // Funciones
    generarPDF,
    descargarPDF,
    limpiarPDF
  };
};
