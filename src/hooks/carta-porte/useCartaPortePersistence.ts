
import { useState, useCallback, useEffect } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';

interface PersistenceData {
  xmlGenerado?: string;
  pdfUrl?: string;
  pdfBlob?: Blob;
  datosCalculoRuta?: {
    distanciaTotal?: number;
    tiempoEstimado?: number;
    calculadoEn?: string;
  };
  lastUpdated?: string;
}

const STORAGE_KEY = 'carta-porte-session-data';

export function useCartaPortePersistence(cartaPorteId?: string) {
  const [persistenceData, setPersistenceData] = useState<PersistenceData>({});
  const [isRestoring, setIsRestoring] = useState(false);

  // Cargar datos persistidos al inicializar
  useEffect(() => {
    if (cartaPorteId) {
      restoreSessionData(cartaPorteId);
    }
  }, [cartaPorteId]);

  const saveToSession = useCallback((key: string, data: any) => {
    if (!cartaPorteId) return;
    
    const sessionKey = `${STORAGE_KEY}-${cartaPorteId}`;
    const currentData = JSON.parse(sessionStorage.getItem(sessionKey) || '{}');
    const updatedData = {
      ...currentData,
      [key]: data,
      lastUpdated: new Date().toISOString()
    };
    
    sessionStorage.setItem(sessionKey, JSON.stringify(updatedData));
    setPersistenceData(prev => ({ ...prev, [key]: data }));
  }, [cartaPorteId]);

  const restoreSessionData = useCallback(async (id: string) => {
    setIsRestoring(true);
    try {
      const sessionKey = `${STORAGE_KEY}-${id}`;
      const savedData = sessionStorage.getItem(sessionKey);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setPersistenceData(parsedData);
        console.log('✅ Datos de sesión restaurados:', parsedData);
      }
    } catch (error) {
      console.error('Error restaurando datos de sesión:', error);
    } finally {
      setIsRestoring(false);
    }
  }, []);

  const clearSessionData = useCallback(() => {
    if (!cartaPorteId) return;
    
    const sessionKey = `${STORAGE_KEY}-${cartaPorteId}`;
    sessionStorage.removeItem(sessionKey);
    setPersistenceData({});
  }, [cartaPorteId]);

  // Funciones específicas para cada tipo de dato
  const savePDF = useCallback((pdfUrl: string, pdfBlob?: Blob) => {
    saveToSession('pdfUrl', pdfUrl);
    if (pdfBlob) {
      saveToSession('pdfBlob', pdfBlob);
    }
  }, [saveToSession]);

  const saveXML = useCallback((xml: string) => {
    saveToSession('xmlGenerado', xml);
  }, [saveToSession]);

  const saveRouteData = useCallback((routeData: any) => {
    saveToSession('datosCalculoRuta', routeData);
  }, [saveToSession]);

  return {
    persistenceData,
    isRestoring,
    savePDF,
    saveXML,
    saveRouteData,
    clearSessionData,
    // Getters específicos
    xmlGenerado: persistenceData.xmlGenerado,
    pdfUrl: persistenceData.pdfUrl,
    pdfBlob: persistenceData.pdfBlob,
    datosCalculoRuta: persistenceData.datosCalculoRuta
  };
}
