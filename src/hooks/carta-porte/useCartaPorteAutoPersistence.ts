
import { useEffect, useCallback } from 'react';
import { useCartaPortePersistence } from './useCartaPortePersistence';
import { CartaPorteFormData } from './types/useCartaPorteFormTypes';
import { useDebounce } from '../useDebounce';

interface AutoPersistenceOptions {
  cartaPorteId?: string;
  formData: CartaPorteFormData;
  xmlGenerado?: string | null;
  pdfUrl?: string | null;
  pdfBlob?: Blob | null;
  datosCalculoRuta?: {
    distanciaTotal?: number;
    tiempoEstimado?: number;
  } | null;
}

export function useCartaPorteAutoPersistence({
  cartaPorteId,
  formData,
  xmlGenerado,
  pdfUrl,
  pdfBlob,
  datosCalculoRuta
}: AutoPersistenceOptions) {
  
  const { savePDF, saveXML, saveRouteData } = useCartaPortePersistence(cartaPorteId);
  
  // Debounce para evitar múltiples guardados
  const debouncedFormData = useDebounce(formData, 2000);
  const debouncedXmlGenerado = useDebounce(xmlGenerado, 1000);
  const debouncedRouteData = useDebounce(datosCalculoRuta, 1000);

  // Auto-guardar XML cuando se genera
  useEffect(() => {
    if (debouncedXmlGenerado && cartaPorteId) {
      console.log('💾 Auto-guardando XML generado...');
      saveXML(debouncedXmlGenerado);
    }
  }, [debouncedXmlGenerado, cartaPorteId, saveXML]);

  // Auto-guardar PDF cuando se genera
  useEffect(() => {
    if (pdfUrl && pdfBlob && cartaPorteId) {
      console.log('💾 Auto-guardando PDF generado...');
      savePDF(pdfUrl, pdfBlob);
    }
  }, [pdfUrl, pdfBlob, cartaPorteId, savePDF]);

  // Auto-guardar datos de cálculo de ruta
  useEffect(() => {
    if (debouncedRouteData && cartaPorteId) {
      console.log('💾 Auto-guardando datos de cálculo de ruta...');
      saveRouteData(debouncedRouteData);
    }
  }, [debouncedRouteData, cartaPorteId, saveRouteData]);

  // Función manual para forzar guardado
  const forceSave = useCallback(() => {
    if (!cartaPorteId) return;

    if (xmlGenerado) {
      saveXML(xmlGenerado);
    }
    
    if (pdfUrl && pdfBlob) {
      savePDF(pdfUrl, pdfBlob);
    }
    
    if (datosCalculoRuta) {
      saveRouteData(datosCalculoRuta);
    }

    console.log('💾 Guardado manual completado');
  }, [cartaPorteId, xmlGenerado, pdfUrl, pdfBlob, datosCalculoRuta, saveXML, savePDF, saveRouteData]);

  return {
    forceSave
  };
}
