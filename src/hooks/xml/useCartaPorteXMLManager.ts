
import { useXMLGeneration } from './useXMLGeneration';
import { useTimbrado } from './useTimbrado';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';
import { XMLGenerationResult } from '@/services/xml/xmlGenerator';
import { TimbradoResponse } from '@/services/timbradoService';

export const useCartaPorteXMLManager = () => {
  const {
    isGenerating,
    xmlGenerado,
    generarXML,
    descargarXML,
    limpiarXML
  } = useXMLGeneration();

  const {
    isTimbring,
    xmlTimbrado,
    datosTimbre,
    timbrarCartaPorte,
    descargarXMLTimbrado,
    validarConexionPAC,
    limpiarDatosTimbrado
  } = useTimbrado();

  const generarXMLCompleto = async (cartaPorteData: CartaPorteData): Promise<XMLGenerationResult> => {
    return await generarXML(cartaPorteData);
  };

  const timbrarCartaPorteCompleto = async (
    cartaPorteData: CartaPorteData, 
    cartaPorteId: string
  ): Promise<TimbradoResponse> => {
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

    return await timbrarCartaPorte(xml, cartaPorteData, cartaPorteId);
  };

  const descargarXMLSegunTipo = (tipo: 'generado' | 'timbrado' = 'generado') => {
    if (tipo === 'timbrado') {
      descargarXMLTimbrado();
    } else {
      descargarXML();
    }
  };

  const limpiarTodosLosDatos = () => {
    limpiarXML();
    limpiarDatosTimbrado();
  };

  return {
    // Estados combinados
    isGenerating,
    isTimbring,
    xmlGenerado,
    xmlTimbrado,
    datosTimbre,
    
    // Funciones principales
    generarXML: generarXMLCompleto,
    timbrarCartaPorte: timbrarCartaPorteCompleto,
    descargarXML: descargarXMLSegunTipo,
    limpiarDatos: limpiarTodosLosDatos,
    validarConexionPAC
  };
};
