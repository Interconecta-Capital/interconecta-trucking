
import { useState } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';
import { XMLGeneratorEnhanced } from '@/services/xml/xmlGeneratorEnhanced';
import { PACServiceReal } from '@/services/xml/pacServiceReal';
import { toast } from 'sonner';

export interface TimbradoResult {
  success: boolean;
  uuid?: string;
  xmlTimbrado?: string;
  qrCode?: string;
  cadenaOriginal?: string;
  selloDigital?: string;
  folio?: string;
  fechaTimbrado?: string;
  pac?: string;
  error?: string;
}

export function useCartaPorteXMLManager(userId?: string) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTimbring, setIsTimbring] = useState(false);
  const [xmlGenerado, setXMLGenerado] = useState<string | null>(null);
  const [xmlTimbrado, setXMLTimbrado] = useState<string | null>(null);
  const [datosTimbre, setDatosTimbre] = useState<any>(null);

  const generarXML = async (cartaPorteData: CartaPorteData) => {
    setIsGenerating(true);
    try {
      console.log('🚀 Generando XML con validaciones SAT 3.1...');
      
      const result = await XMLGeneratorEnhanced.generarXMLCompleto(cartaPorteData);
      
      if (result.success && result.xml) {
        setXMLGenerado(result.xml);
        
        const score = result.validationDetails?.score || 0;
        toast.success(
          `XML generado exitosamente (Score: ${score}%)`,
          {
            description: result.warnings?.length ? 
              `${result.warnings.length} advertencias encontradas` : 
              'Todas las validaciones pasaron'
          }
        );

        // Mostrar advertencias si las hay
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.slice(0, 3).forEach(warning => {
            toast.warning('Advertencia SAT', { description: warning });
          });
        }

        return result;
      } else {
        const errorMsg = result.errors?.join(', ') || 'Error desconocido';
        toast.error('Error al generar XML', { description: errorMsg });
        console.error('Errores de validación:', result.errors);
        return result;
      }
    } catch (error) {
      console.error('💥 Error generando XML:', error);
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

  const timbrarCartaPorte = async (cartaPorteData: CartaPorteData): Promise<TimbradoResult> => {
    console.log('🚀 [TIMBRADO] === INICIO ===');
    console.log('📋 [TIMBRADO] Datos de entrada:', {
      rfcEmisor: cartaPorteData.rfcEmisor,
      rfcReceptor: cartaPorteData.rfcReceptor,
      ubicaciones: cartaPorteData.ubicaciones?.length,
      mercancias: cartaPorteData.mercancias?.length,
      autotransporte: !!cartaPorteData.autotransporte?.placa_vm,
      figuras: cartaPorteData.figuras?.length
    });

    const xmlParaTimbrar = xmlGenerado;
    
    if (!xmlParaTimbrar) {
      const errorResult = {
        success: false,
        error: 'No hay XML generado para timbrar'
      };
      console.error('❌ [TIMBRADO] Error:', errorResult.error);
      toast.error('Error', { description: errorResult.error });
      return errorResult;
    }

    console.log('✅ [TIMBRADO] XML disponible, longitud:', xmlParaTimbrar.length);

    setIsTimbring(true);
    try {
      console.log('🔄 [TIMBRADO] Iniciando proceso de timbrado PAC...');

      // Validar certificado CSD antes de timbrar
      if (!userId) {
        const errorResult = {
          success: false,
          error: 'Se requiere autenticación para timbrar'
        };
        toast.error('Error', { description: errorResult.error });
        return errorResult;
      }

      const { CertificadoValidator } = await import('@/services/certificados/CertificadoValidator');
      const validacionCertificado = await CertificadoValidator.validarCertificadoParaTimbrado(userId);
      
      if (!validacionCertificado.isValid) {
        toast.error('Error de certificado', {
          description: validacionCertificado.error
        });
        return {
          success: false,
          error: validacionCertificado.error
        };
      }

      // Advertencia si el certificado está próximo a vencer
      if (validacionCertificado.diasRestantes && validacionCertificado.diasRestantes <= 7) {
        toast.warning('Certificado próximo a vencer', {
          description: validacionCertificado.error
        });
      }
      // Llamar directamente al adaptador de Supabase con datos completos de Carta Porte
      const { SupabaseFunctionsAdapter } = await import('@/services/api/supabaseFunctionsAdapter');
      
      // Obtener o generar cartaPorteId
      const cartaPorteId = cartaPorteData.id || crypto.randomUUID();
      
      console.log(`🔄 Timbrando Carta Porte ${cartaPorteId} con Conectia...`);
      
      const resultado = await SupabaseFunctionsAdapter.timbrarCartaPorte(
        cartaPorteData,
        cartaPorteId, 
        'sandbox'
      );
      
      if (resultado.success) {
        setXMLTimbrado(resultado.xmlTimbrado || null);
        setDatosTimbre({
          uuid: resultado.uuid,
          folio: resultado.folio,
          qrCode: resultado.qrCode,
          cadenaOriginal: resultado.cadenaOriginal,
          selloDigital: resultado.selloDigital,
          fechaTimbrado: resultado.fechaTimbrado,
          pac: resultado.pac
        });

        toast.success('Timbrado exitoso', {
          description: `UUID: ${resultado.uuid}`,
          duration: 5000
        });

        return resultado;
      } else {
        const errorMsg = resultado.error || 'Error en timbrado';
        toast.error('Error en timbrado PAC', { description: errorMsg });
        return resultado;
      }
    } catch (error) {
      console.error('💥 Error al timbrar:', error);
      const errorResult = {
        success: false,
        error: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
      toast.error('Error al timbrar');
      return errorResult;
    } finally {
      setIsTimbring(false);
    }
  };

  const validarConexionPAC = async () => {
    try {
      console.log('🔍 Validando conexión con PAC...');
      const resultado = await PACServiceReal.validarConexion('sandbox');
      
      if (resultado.success) {
        toast.success('Conexión PAC válida', {
          description: resultado.message
        });
      } else {
        toast.error('Error de conexión PAC', {
          description: resultado.message
        });
      }
      
      return resultado;
    } catch (error) {
      console.error('💥 Error validando PAC:', error);
      toast.error('Error validando conexión PAC');
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  };

  const descargarXML = (tipo: 'generado' | 'firmado' | 'timbrado' = 'generado') => {
    let xmlContent = '';
    let fileName = '';

    switch (tipo) {
      case 'timbrado':
        xmlContent = xmlTimbrado || '';
        fileName = `carta-porte-timbrada-${Date.now()}.xml`;
        break;
      case 'generado':
      default:
        xmlContent = xmlGenerado || '';
        fileName = `carta-porte-generada-${Date.now()}.xml`;
        break;
    }

    if (!xmlContent) {
      toast.error(`No hay XML ${tipo} disponible para descargar`);
      return;
    }

    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`XML ${tipo} descargado correctamente`);
  };

  return {
    isGenerating,
    isTimbring,
    xmlGenerado,
    xmlTimbrado,
    datosTimbre,
    generarXML,
    timbrarCartaPorte,
    validarConexionPAC,
    descargarXML
  };
}
