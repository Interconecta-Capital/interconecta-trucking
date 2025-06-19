import { useState, useEffect, useCallback } from 'react';
import { CartaPorteFormData } from './useCartaPorteMappers';
import { generateId } from '@/utils/generateId';
import { CartaPorteData } from '@/types/cartaPorte';

const STORAGE_KEY_PREFIX = 'cartaPorteData';

interface AutoPersistenceOptions {
  debounceInterval?: number;
}

export const useCartaPorteAutoPersistence = (formData: CartaPorteFormData) => {
  const [xmlData, setXMLData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const storageKey = `${STORAGE_KEY_PREFIX}-${formData.cartaPorteId || 'new'}`;

  // Load data from session storage on mount
  useEffect(() => {
    const storedData = sessionStorage.getItem(storageKey);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setXMLData(parsedData.xmlGenerado || null);
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    }
  }, [storageKey]);

  // Debounced save to session storage
  useEffect(() => {
    const saveData = () => {
      try {
        const dataToStore = {
          xmlGenerado: xmlData,
          cartaPorteId: formData.cartaPorteId || generateId()
        };
        sessionStorage.setItem(storageKey, JSON.stringify(dataToStore));
      } catch (error) {
        console.error('Error saving data to session storage:', error);
      }
    };

    const timerId = setTimeout(saveData, 500); // Debounce interval: 500ms

    return () => clearTimeout(timerId);
  }, [xmlData, formData.cartaPorteId, storageKey]);

  const updateXMLData = useCallback(async (xmlData: string) => {
    try {
      const updatedData: CartaPorteData = {
        ...formData,
        version: formData.cartaPorteVersion || '3.1',
        xmlGenerado: xmlData,
        cartaPorteId: formData.cartaPorteId || generateId()
      };
      
      setXMLData(xmlData);

      const dataToStore = {
        xmlGenerado: xmlData,
        cartaPorteId: formData.cartaPorteId || generateId()
      };
      sessionStorage.setItem(storageKey, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Error updating XML data:', error);
    }
  }, [formData]);

  return {
    xmlData,
    updateXMLData,
    isLoading
  };
};
