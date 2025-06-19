
import { useState } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';
import { useXMLGeneration } from './useXMLGeneration';
import { useTimbrado } from './useTimbrado';
import { toast } from 'sonner';

export function useXMLGenerationAdvanced() {
  const [xmlFirmado, setXMLFirmado] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  
  const xmlGeneration = useXMLGeneration();
  const timbrado = useTimbrado();

  const firmarXML = async (xml: string): Promise<{ success: boolean; xmlFirmado?: string }> => {
    setIsSigning(true);
    try {
      // Simular firmado digital
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const xmlConFirma = xml.replace('</cfdi:Comprobante>', `
        <cfdi:Complemento>
          <tfd:TimbreFiscalDigital 
            xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital"
            Version="1.1"
            UUID="MOCK-${Date.now()}"
            FechaTimbrado="${new Date().toISOString()}"
            SelloCFD="MOCK_SELLO"
            NoCertificadoSAT="MOCK_CERT"/>
        </cfdi:Complemento>
      </cfdi:Comprobante>`);
      
      setXMLFirmado(xmlConFirma);
      toast.success('XML firmado digitalmente');
      return { success: true, xmlFirmado: xmlConFirma };
    } catch (error) {
      toast.error('Error al firmar XML');
      return { success: false };
    } finally {
      setIsSigning(false);
    }
  };

  const procesarCompleto = async (cartaPorteData: CartaPorteData) => {
    try {
      // 1. Generar XML
      const xmlResult = await xmlGeneration.generarXML(cartaPorteData);
      if (!xmlResult.success || !xmlResult.xml) {
        throw new Error('Error generando XML');
      }

      // 2. Firmar XML
      const firmaResult = await firmarXML(xmlResult.xml);
      if (!firmaResult.success || !firmaResult.xmlFirmado) {
        throw new Error('Error firmando XML');
      }

      // 3. Timbrar
      const timbradoResult = await timbrado.timbrarCartaPorte(cartaPorteData);
      if (!timbradoResult.success) {
        throw new Error('Error timbrando');
      }

      toast.success('Proceso completo: XML generado, firmado y timbrado');
      return {
        success: true,
        xml: xmlResult.xml,
        xmlFirmado: firmaResult.xmlFirmado,
        datosTimbre: timbradoResult
      };
    } catch (error) {
      console.error('Error en proceso completo:', error);
      toast.error(`Error en proceso: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return { success: false };
    }
  };

  return {
    ...xmlGeneration,
    ...timbrado,
    xmlFirmado,
    isSigning,
    firmarXML,
    procesarCompleto
  };
}
