
import { useState } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';
import { XMLCartaPorteGenerator } from '@/services/xml/xmlGenerator';
import { toast } from 'sonner';

export interface XMLGenerationResult {
  success: boolean;
  xml?: string;
  errors?: string[];
  warnings?: string[];
}

export function useXMLGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [xmlGenerado, setXMLGenerado] = useState<string | null>(null);

  const generarXML = async (cartaPorteData: CartaPorteData): Promise<XMLGenerationResult> => {
    setIsGenerating(true);
    try {
      const resultado = await XMLCartaPorteGenerator.generarXML(cartaPorteData);
      
      if (resultado.success && resultado.xml) {
        setXMLGenerado(resultado.xml);
        toast.success('XML generado correctamente');
      } else {
        toast.error('Error al generar XML');
      }
      
      return resultado;
    } catch (error) {
      console.error('Error generando XML:', error);
      const errorResult = {
        success: false,
        errors: [`Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`]
      };
      toast.error('Error al generar XML');
      return errorResult;
    } finally {
      setIsGenerating(false);
    }
  };

  const descargarXML = (tipo: 'generado' | 'firmado' | 'timbrado' = 'generado') => {
    if (!xmlGenerado) {
      toast.error('No hay XML disponible para descargar');
      return;
    }

    const blob = new Blob([xmlGenerado], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `carta-porte-${tipo}-${Date.now()}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    isGenerating,
    xmlGenerado,
    generarXML,
    descargarXML
  };
}
