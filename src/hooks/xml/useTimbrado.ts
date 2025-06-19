
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TimbradoService, TimbradoResponse } from '@/services/timbradoService';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';

export const useTimbrado = () => {
  const [isTimbring, setIsTimbring] = useState(false);
  const [xmlTimbrado, setXmlTimbrado] = useState<string | null>(null);
  const [datosTimbre, setDatosTimbre] = useState<any>(null);
  const { toast } = useToast();

  const timbrarCartaPorte = async (
    xml: string,
    cartaPorteData: CartaPorteData, 
    cartaPorteId: string,
    usarCSD: boolean = true
  ): Promise<TimbradoResponse> => {
    setIsTimbring(true);
    try {
      // Validar XML antes del timbrado
      const validacion = TimbradoService.validarXMLAntesDelTimbrado(xml);
      if (!validacion.isValid) {
        toast({
          title: "XML inválido para timbrado",
          description: validacion.errors.join(', '),
          variant: "destructive",
        });
        return {
          success: false,
          error: `XML inválido: ${validacion.errors.join(', ')}`
        };
      }

      // Preparar datos para timbrado
      const timbradoRequest = {
        xmlContent: TimbradoService.formatearXMLParaTimbrado(xml),
        cartaPorteId,
        rfcEmisor: cartaPorteData.rfcEmisor,
        usarCSD // Nueva opción para usar CSD
      };

      console.log('Iniciando proceso de timbrado con CSD:', usarCSD);
      const resultado = await TimbradoService.timbrarCartaPorte(timbradoRequest);

      if (resultado.success) {
        setXmlTimbrado(resultado.xmlTimbrado || null);
        setDatosTimbre({
          uuid: resultado.uuid,
          qrCode: resultado.qrCode,
          cadenaOriginal: resultado.cadenaOriginal,
          selloDigital: resultado.selloDigital,
          folio: resultado.folio,
          certificadoUsado: resultado.certificadoUsado
        });

        const descripcion = resultado.certificadoUsado 
          ? `UUID: ${resultado.uuid} | Certificado: ${resultado.certificadoUsado.numero}`
          : `UUID: ${resultado.uuid}`;

        toast({
          title: "Carta Porte timbrada exitosamente",
          description: descripcion,
        });
      } else {
        toast({
          title: "Error en timbrado",
          description: resultado.error || 'Error desconocido en el timbrado',
          variant: "destructive",
        });
      }

      return resultado;
    } catch (error) {
      console.error('Error en proceso de timbrado:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error crítico en timbrado",
        description: errorMsg,
        variant: "destructive",
      });
      return {
        success: false,
        error: errorMsg
      };
    } finally {
      setIsTimbring(false);
    }
  };

  const descargarXMLTimbrado = () => {
    if (!xmlTimbrado) {
      toast({
        title: "Error",
        description: "No hay XML timbrado disponible para descargar",
        variant: "destructive",
      });
      return;
    }

    try {
      const blob = new Blob([xmlTimbrado], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carta-porte-timbrado-${Date.now()}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Descarga iniciada",
        description: "XML timbrado descargado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error en descarga",
        description: "No se pudo descargar el archivo XML",
        variant: "destructive",
      });
    }
  };

  const validarConexionPAC = async () => {
    try {
      const resultado = await TimbradoService.validarConexionPAC();
      
      toast({
        title: resultado.success ? "Conexión exitosa" : "Error de conexión",
        description: resultado.message,
        variant: resultado.success ? "default" : "destructive",
      });
      
      return resultado;
    } catch (error) {
      toast({
        title: "Error validando conexión",
        description: "No se pudo validar la conexión con el PAC",
        variant: "destructive",
      });
      return { success: false, message: 'Error de validación' };
    }
  };

  const limpiarDatosTimbrado = () => {
    setXmlTimbrado(null);
    setDatosTimbre(null);
  };

  return {
    // Estados
    isTimbring,
    xmlTimbrado,
    datosTimbre,
    
    // Funciones
    timbrarCartaPorte,
    descargarXMLTimbrado,
    validarConexionPAC,
    limpiarDatosTimbrado
  };
};
