
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { XMLCartaPorteGenerator, XMLGenerationResult } from '@/services/xml/xmlGenerator';
import { XMLValidatorSAT } from '@/services/xml/xmlValidatorSAT';
import { PACManager } from '@/services/xml/pacManager';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';
import { supabase } from '@/integrations/supabase/client';

export const useXMLGenerationAdvanced = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTimbring, setIsTimbring] = useState(false);
  const [xmlGenerado, setXmlGenerado] = useState<string | null>(null);
  const [xmlTimbrado, setXmlTimbrado] = useState<string | null>(null);
  const [datosTimbre, setDatosTimbre] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const { toast } = useToast();

  const generarXMLConValidacion = async (cartaPorteData: CartaPorteData): Promise<XMLGenerationResult> => {
    setIsGenerating(true);
    try {
      console.log('Iniciando validación SAT antes de generar XML');
      
      // Validación previa
      const validacion = await XMLValidatorSAT.validateCartaPorteCompliance(cartaPorteData);
      setValidationResult(validacion);
      
      if (!validacion.isValid) {
        toast({
          title: "Errores de validación SAT",
          description: `${validacion.errors.length} errores encontrados: ${validacion.errors.slice(0, 2).join(', ')}${validacion.errors.length > 2 ? '...' : ''}`,
          variant: "destructive",
        });
        return {
          success: false,
          errors: validacion.errors,
          warnings: validacion.warnings
        };
      }

      // Mostrar advertencias si las hay
      if (validacion.warnings.length > 0) {
        toast({
          title: "Advertencias encontradas",
          description: `${validacion.warnings.length} advertencias: ${validacion.warnings.slice(0, 2).join(', ')}`,
          variant: "default",
        });
      }

      // Generar XML usando el servicio existente
      const resultado = await XMLCartaPorteGenerator.generarXML(cartaPorteData);
      
      if (resultado.success && resultado.xml) {
        // Validar estructura XML
        const validacionXML = XMLValidatorSAT.validateXMLStructure(resultado.xml);
        
        if (!validacionXML.isValid) {
          toast({
            title: "XML inválido",
            description: validacionXML.errors.join(', '),
            variant: "destructive",
          });
          return {
            success: false,
            errors: validacionXML.errors
          };
        }

        setXmlGenerado(resultado.xml);
        
        // Guardar XML en base de datos si hay un ID de carta porte
        if (cartaPorteData.cartaPorteId) {
          await guardarXMLEnBaseDatos(cartaPorteData.cartaPorteId, resultado.xml);
        }
        
        toast({
          title: "XML generado correctamente",
          description: "XML de Carta Porte generado y validado según especificaciones SAT CCP 3.1",
        });
      }
      
      return resultado;
    } catch (error) {
      console.error('Error en generación avanzada de XML:', error);
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

  const timbrarConPACManager = async (
    cartaPorteData: CartaPorteData, 
    cartaPorteId: string,
    ambiente: 'sandbox' | 'production' = 'sandbox'
  ) => {
    setIsTimbring(true);
    try {
      let xml = xmlGenerado;
      
      // Generar XML si no existe
      if (!xml) {
        const xmlResult = await generarXMLConValidacion(cartaPorteData);
        if (!xmlResult.success || !xmlResult.xml) {
          return {
            success: false,
            error: 'No se pudo generar el XML para timbrado'
          };
        }
        xml = xmlResult.xml;
      }

      console.log('Iniciando timbrado con PAC Manager');
      
      // Usar el nuevo PAC Manager
      const resultado = await PACManager.timbrarConReintentos(xml, ambiente);
      
      if (resultado.success) {
        setXmlTimbrado(resultado.xmlTimbrado || null);
        setDatosTimbre({
          uuid: resultado.uuid,
          qrCode: resultado.qrCode,
          cadenaOriginal: resultado.cadenaOriginal,
          selloDigital: resultado.selloDigital,
          folio: resultado.folio,
          proveedor: resultado.proveedor
        });

        // Actualizar carta porte en base de datos
        await actualizarCartaPorteTimbrada(cartaPorteId, resultado);

        toast({
          title: "Carta Porte timbrada exitosamente",
          description: `UUID: ${resultado.uuid} | Proveedor: ${resultado.proveedor}`,
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
      console.error('Error en proceso de timbrado avanzado:', error);
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
    setValidationResult(null);
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
    }
  };

  const actualizarCartaPorteTimbrada = async (cartaPorteId: string, datosTimbre: any) => {
    try {
      const { error } = await supabase
        .from('cartas_porte')
        .update({
          status: 'timbrado',
          uuid_fiscal: datosTimbre.uuid,
          xml_generado: datosTimbre.xmlTimbrado,
          fecha_timbrado: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', cartaPorteId);

      if (error) {
        console.error('Error actualizando carta porte timbrada:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error en actualizarCartaPorteTimbrada:', error);
    }
  };

  return {
    // Estados
    isGenerating,
    isTimbring,
    xmlGenerado,
    xmlTimbrado,
    datosTimbre,
    validationResult,
    
    // Funciones mejoradas
    generarXML: generarXMLConValidacion,
    timbrarCartaPorte: timbrarConPACManager,
    descargarXML,
    limpiarDatos
  };
};
