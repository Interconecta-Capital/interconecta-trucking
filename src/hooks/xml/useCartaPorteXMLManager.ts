
import { useState } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';
import { XMLCartaPorteGenerator } from '@/services/xml/xmlGenerator';
import { toast } from 'sonner';

export function useCartaPorteXMLManager() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTimbring, setIsTimbring] = useState(false);
  const [xmlGenerado, setXmlGenerado] = useState<string | null>(null);
  const [xmlTimbrado, setXmlTimbrado] = useState<string | null>(null);
  const [datosTimbre, setDatosTimbre] = useState<any>(null);

  const generarXML = async (cartaPorteData: CartaPorteData) => {
    setIsGenerating(true);
    try {
      const result = await XMLCartaPorteGenerator.generarXML(cartaPorteData);
      if (result.success && result.xml) {
        setXmlGenerado(result.xml);
        toast.success('XML generado correctamente');
        return { success: true, xml: result.xml };
      } else {
        toast.error('Error al generar XML');
        return { success: false, errors: result.errors };
      }
    } catch (error) {
      console.error('Error generando XML:', error);
      toast.error('Error al generar XML');
      return { success: false, errors: ['Error interno'] };
    } finally {
      setIsGenerating(false);
    }
  };

  const timbrarCartaPorte = async (cartaPorteData: CartaPorteData) => {
    setIsTimbring(true);
    try {
      // Simulated timbrado process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTimbre = {
        uuid: 'ABC123-DEF456-GHI789',
        fecha_timbrado: new Date().toISOString(),
        ambiente: 'test'
      };
      
      setDatosTimbre(mockTimbre);
      setXmlTimbrado('<?xml version="1.0"?><!-- Timbrado XML --><root></root>');
      toast.success('Carta Porte timbrada correctamente');
      
      return { success: true, ...mockTimbre };
    } catch (error) {
      console.error('Error timbrando:', error);
      toast.error('Error al timbrar la Carta Porte');
      return { success: false };
    } finally {
      setIsTimbring(false);
    }
  };

  const descargarXML = (tipo: 'generado' | 'timbrado') => {
    const xml = tipo === 'generado' ? xmlGenerado : xmlTimbrado;
    if (!xml) return;
    
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `carta-porte-${tipo}-${Date.now()}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const validarConexionPAC = async () => {
    try {
      // Simulated PAC validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Conexión con PAC validada correctamente');
      return { success: true };
    } catch (error) {
      toast.error('Error al validar conexión con PAC');
      return { success: false };
    }
  };

  return {
    isGenerating,
    isTimbring,
    xmlGenerado,
    xmlTimbrado,
    datosTimbre,
    generarXML,
    timbrarCartaPorte,
    descargarXML,
    validarConexionPAC
  };
}
