
import { useEffect, useRef, useCallback } from 'react';

interface UseAutoSaveOptions {
  data: any;
  key: string;
  delay?: number;
  onSave?: (data: any) => Promise<void>;
  enabled?: boolean;
  useSessionStorage?: boolean;
}

export const useAutoSave = ({
  data,
  key,
  delay = 5000, // Aumentado a 5 segundos para reducir frecuencia
  onSave,
  enabled = true,
  useSessionStorage = false
}: UseAutoSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');
  const isInitialLoadRef = useRef(true);
  const saveInProgressRef = useRef(false);

  const saveData = useCallback(async () => {
    if (saveInProgressRef.current) return;
    
    try {
      saveInProgressRef.current = true;
      
      if (onSave) {
        await onSave(data);
      } else {
        const storage = useSessionStorage ? sessionStorage : localStorage;
        storage.setItem(`autosave_${key}`, JSON.stringify(data));
      }
      lastSavedRef.current = JSON.stringify(data);
    } catch (error) {
      console.error('Auto-save failed:', error);
      // No rethrow - solo log para evitar interrupciones
    } finally {
      saveInProgressRef.current = false;
    }
  }, [data, key, onSave, useSessionStorage]);

  useEffect(() => {
    if (!enabled || saveInProgressRef.current) return;

    const currentData = JSON.stringify(data);
    
    // Evitar guardado en la carga inicial
    if (isInitialLoadRef.current) {
      lastSavedRef.current = currentData;
      isInitialLoadRef.current = false;
      return;
    }
    
    // Solo guardar si los datos realmente cambiaron y son válidos
    if (currentData !== lastSavedRef.current && 
        data && 
        typeof data === 'object' &&
        Object.keys(data).length > 0 && 
        currentData !== '{}' &&
        currentData !== 'null') {
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        saveData();
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, delay, saveData]);

  const loadSavedData = useCallback(() => {
    try {
      const storage = useSessionStorage ? sessionStorage : localStorage;
      const saved = storage.getItem(`autosave_${key}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load saved data:', error);
      return null;
    }
  }, [key, useSessionStorage]);

  const clearSavedData = useCallback(() => {
    try {
      const storage = useSessionStorage ? sessionStorage : localStorage;
      storage.removeItem(`autosave_${key}`);
    } catch (error) {
      console.error('Failed to clear saved data:', error);
    }
  }, [key, useSessionStorage]);

  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveData();
  }, [saveData]);

  return {
    loadSavedData,
    clearSavedData,
    saveData: forceSave
  };
};
