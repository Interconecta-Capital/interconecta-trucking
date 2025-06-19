
import { useState } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';
import { toast } from 'sonner';

export function usePDFGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const generarPDF = async (data: CartaPorteData) => {
    setIsGenerating(true);
    try {
      // Simular generación de PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Crear un blob simulado para el PDF
      const blob = new Blob(['PDF Content'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setPdfBlob(blob);
      setPdfUrl(url);
      
      toast.success('PDF generado correctamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error('Error generando PDF');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const descargarPDF = (filename: string) => {
    if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('PDF descargado');
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
    isGenerating,
    pdfUrl,
    pdfBlob,
    generarPDF,
    descargarPDF,
    limpiarPDF
  };
}
