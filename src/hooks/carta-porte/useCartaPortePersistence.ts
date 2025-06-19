
import { useState, useCallback, useEffect } from 'react';

// Helper to convert Blob <-> base64
const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Error leyendo blob'));
    reader.readAsDataURL(blob);
  });
};

const dataURLToBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const bstr = atob(arr[arr.length - 1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

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

const STORAGE_KEY = 'carta-porte-local-data';

export function useCartaPortePersistence(cartaPorteId?: string) {
  const [persistenceData, setPersistenceData] = useState<PersistenceData>({});
  const [isRestoring, setIsRestoring] = useState(false);

  // Cargar datos persistidos al inicializar
  useEffect(() => {
    if (cartaPorteId) {
      restoreSessionData(cartaPorteId);
    }
  }, [cartaPorteId]);

  const saveToStorage = useCallback((key: string, data: any) => {
    if (!cartaPorteId) return;

    const storageKey = `${STORAGE_KEY}-${cartaPorteId}`;
    const currentData = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const updatedData = {
      ...currentData,
      [key]: data,
      lastUpdated: new Date().toISOString()
    };

    localStorage.setItem(storageKey, JSON.stringify(updatedData));
    setPersistenceData(prev => ({ ...prev, [key]: data }));
  }, [cartaPorteId]);

  const restoreSessionData = useCallback(async (id: string) => {
    setIsRestoring(true);
    try {
      const storageKey = `${STORAGE_KEY}-${id}`;
      const savedData = localStorage.getItem(storageKey);

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Convert base64 PDF back to Blob if present
        if (parsedData.pdfBlob && typeof parsedData.pdfBlob === 'string') {
          parsedData.pdfBlob = dataURLToBlob(parsedData.pdfBlob);
        }
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

    const storageKey = `${STORAGE_KEY}-${cartaPorteId}`;
    localStorage.removeItem(storageKey);
    setPersistenceData({});
  }, [cartaPorteId]);

  // Funciones específicas para cada tipo de dato
  const savePDF = useCallback(async (pdfUrl: string, pdfBlob?: Blob) => {
    saveToStorage('pdfUrl', pdfUrl);
    if (pdfBlob) {
      const dataUrl = await blobToDataURL(pdfBlob);
      saveToStorage('pdfBlob', dataUrl);
    }
  }, [saveToStorage]);

  const saveXML = useCallback((xml: string) => {
    saveToStorage('xmlGenerado', xml);
  }, [saveToStorage]);

  const saveRouteData = useCallback((routeData: any) => {
    saveToStorage('datosCalculoRuta', routeData);
  }, [saveToStorage]);

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
