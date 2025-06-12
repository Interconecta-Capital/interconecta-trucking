import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { XMLCartaPorteGenerator, XMLGenerationResult } from '@/services/xml/xmlGenerator';
import { TimbradoService, TimbradoResponse } from '@/services/timbradoService';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';
import { supabase } from '@/integrations/supabase/client';

export const useXMLGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTimbring, setIsTimbring] = useState(false);
  const [xmlGenerado, setXmlGenerado] = useState<string | null>(null);
  const [xmlTimbrado, setXmlTimbrado] = useState<string | null>(null);
  const [datosTimbre, setDatosTimbre] = useState<any>(null);
  const { toast } = useToast();

  const generarXML = async (cartaPorteData: CartaPorteData): Promise<XMLGenerationResult> => {
    setIsGenerating(true);
    try {
      console.log('Iniciando generación de XML para Carta Porte');
      
      const resultado = await XMLCartaPorteGenerator.generarXML(cartaPorteData);
      
      if (resultado.success && resultado.xml) {
        setXmlGenerado(resultado.xml);
        
        // Guardar XML en base de datos si hay un ID de carta porte
        if (cartaPorteData.cartaPorteId) {
          await guardarXMLEnBaseDatos(cartaPorteData.cartaPorteId, resultado.xml);
        }
        
        toast({
          title: "XML generado correctamente",
          description: "El XML de la Carta Porte ha sido generado según especificaciones SAT 3.1",
        });
        
        if (resultado.warnings && resultado.warnings.length > 0) {
          toast({
            title: "Advertencias encontradas",
            description: resultado.warnings.join(', '),
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error en generación XML",
          description: resultado.errors?.join(', ') || 'Error desconocido',
          variant: "destructive",
        });
      }
      
      return resultado;
    } catch (error) {
      console.error('Error generando XML:', error);
      toast({
        title: "Error crítico",
        description: "No se pudo generar el XML",
        variant: "destructive",
      });
      return {
        success: false,
        errors: ['Error crítico en la generación']
      };
    } finally {
      setIsGenerating(false);
    }
  };

  const timbrarCartaPorte = async (
    cartaPorteData: CartaPorteData, 
    cartaPorteId: string
  ): Promise<TimbradoResponse> => {
    setIsTimbring(true);
    try {
      // Primero generar XML si no existe
      let xml = xmlGenerado;
      if (!xml) {
        console.log('Generando XML antes del timbrado...');
        const xmlResult = await generarXML(cartaPorteData);
        if (!xmlResult.success || !xmlResult.xml) {
          return {
            success: false,
            error: 'No se pudo generar el XML para timbrado'
          };
        }
        xml = xmlResult.xml;
      }

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
        xml: TimbradoService.formatearXMLParaTimbrado(xml),
        cartaPorteId,
        rfcEmisor: cartaPorteData.rfcEmisor,
        rfcReceptor: cartaPorteData.rfcReceptor
      };

      console.log('Iniciando proceso de timbrado...');
      const resultado = await TimbradoService.timbrarCartaPorte(timbradoRequest);

      if (resultado.success) {
        setXmlTimbrado(resultado.xmlTimbrado || null);
        setDatosTimbre({
          uuid: resultado.uuid,
          qrCode: resultado.qrCode,
          cadenaOriginal: resultado.cadenaOriginal,
          selloDigital: resultado.selloDigital,
          folio: resultado.folio
        });

        toast({
          title: "Carta Porte timbrada exitosamente",
          description: `UUID: ${resultado.uuid}`,
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

  const descargarXML = (tipo: 'generado' | 'timbrado' = 'generado') => {
    const xml = tipo === 'timbrado' ? xmlTimbrado : xmlGenerado;
    if (!xml) {
      toast({
        title: "Error",
        description: `No hay XML ${tipo} disponible para descargar`,
        variant: "destructive",
      });
      return;
    }

    try {
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carta-porte-${tipo}-${Date.now()}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Descarga iniciada",
        description: `XML ${tipo} descargado correctamente`,
      });
    } catch (error) {
      toast({
        title: "Error en descarga",
        description: "No se pudo descargar el archivo XML",
        variant: "destructive",
      });
    }
  };

  const limpiarDatos = () => {
    setXmlGenerado(null);
    setXmlTimbrado(null);
    setDatosTimbre(null);
  };

  const guardarXMLEnBaseDatos = async (cartaPorteId: string, xml: string) => {
    try {
      const { error } = await supabase
        .from('cartas_porte')
        .update({
          xml_generado: xml,
          status: 'xml_generado',
          updated_at: new Date().toISOString()
        })
        .eq('id', cartaPorteId);

      if (error) {
        console.error('Error guardando XML en base de datos:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error en guardarXMLEnBaseDatos:', error);
      // No lanzar error para no interrumpir el flujo principal
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

  return {
    // Estados
    isGenerating,
    isTimbring,
    xmlGenerado,
    xmlTimbrado,
    datosTimbre,
    
    // Funciones
    generarXML,
    timbrarCartaPorte,
    descargarXML,
    limpiarDatos,
    validarConexionPAC
  };
};
