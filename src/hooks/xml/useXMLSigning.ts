
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CSDSigningService, XMLSigningResult } from '@/services/csd/CSDSigningService';
import { useCertificadosDigitales } from '@/hooks/useCertificadosDigitales';

export const useXMLSigning = () => {
  const [isSigning, setIsSigning] = useState(false);
  const [xmlFirmado, setXmlFirmado] = useState<string | null>(null);
  const [infoFirmado, setInfoFirmado] = useState<any>(null);
  const { toast } = useToast();
  const { certificadoActivo } = useCertificadosDigitales();

  const firmarXML = async (xmlContent: string): Promise<XMLSigningResult> => {
    if (!certificadoActivo) {
      toast({
        title: "Certificado requerido",
        description: "Necesitas tener un certificado digital activo para firmar XML",
        variant: "destructive",
      });
      return {
        success: false,
        error: 'No hay certificado activo'
      };
    }

    setIsSigning(true);
    try {
      console.log('Iniciando firmado de XML con CSD...');
      
      const resultado = await CSDSigningService.firmarXML(xmlContent);
      
      if (resultado.success && resultado.xmlFirmado) {
        setXmlFirmado(resultado.xmlFirmado);
        setInfoFirmado({
          certificado: resultado.certificadoUsado,
          fechaFirmado: new Date().toISOString(),
          tipoFirmado: 'CSD'
        });
        
        toast({
          title: "XML firmado exitosamente",
          description: `Firmado con certificado: ${resultado.certificadoUsado?.numero}`,
        });
      } else {
        toast({
          title: "Error en firmado",
          description: resultado.error || 'Error desconocido',
          variant: "destructive",
        });
      }
      
      return resultado;
    } catch (error) {
      console.error('Error firmando XML:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error crítico en firmado",
        description: errorMsg,
        variant: "destructive",
      });
      return {
        success: false,
        error: errorMsg
      };
    } finally {
      setIsSigning(false);
    }
  };

  const validarXMLFirmado = async (xmlContent: string) => {
    try {
      const resultado = await CSDSigningService.validarXMLFirmado(xmlContent);
      
      if (resultado.esValido) {
        toast({
          title: "XML válido",
          description: "El XML tiene un firmado digital válido",
        });
      } else {
        toast({
          title: "XML inválido",
          description: resultado.errores.join(', '),
          variant: "destructive",
        });
      }
      
      return resultado;
    } catch (error) {
      toast({
        title: "Error en validación",
        description: "No se pudo validar el XML",
        variant: "destructive",
      });
      return {
        esValido: false,
        errores: ['Error en validación']
      };
    }
  };

  const descargarXMLFirmado = () => {
    if (!xmlFirmado) {
      toast({
        title: "Error",
        description: "No hay XML firmado disponible para descargar",
        variant: "destructive",
      });
      return;
    }

    try {
      const blob = new Blob([xmlFirmado], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carta-porte-firmado-${Date.now()}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Descarga iniciada",
        description: "XML firmado descargado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error en descarga",
        description: "No se pudo descargar el archivo XML",
        variant: "destructive",
      });
    }
  };

  const limpiarDatosFirmado = () => {
    setXmlFirmado(null);
    setInfoFirmado(null);
  };

  return {
    // Estados
    isSigning,
    xmlFirmado,
    infoFirmado,
    certificadoActivo,
    
    // Funciones
    firmarXML,
    validarXMLFirmado,
    descargarXMLFirmado,
    limpiarDatosFirmado
  };
};
