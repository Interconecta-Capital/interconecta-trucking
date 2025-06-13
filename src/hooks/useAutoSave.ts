
import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

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
  delay = 3000, // Aumentado de 2000 a 3000ms para reducir frecuencia
  onSave,
  enabled = true,
  useSessionStorage = false // Nueva opción para usar sessionStorage
}: UseAutoSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');
  const isInitialLoadRef = useRef(true);

  const saveData = useCallback(async () => {
    try {
      if (onSave) {
        await onSave(data);
      } else {
        const storage = useSessionStorage ? sessionStorage : localStorage;
        storage.setItem(`autosave_${key}`, JSON.stringify(data));
      }
      lastSavedRef.current = JSON.stringify(data);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [data, key, onSave, useSessionStorage]);

  useEffect(() => {
    if (!enabled) return;

    const currentData = JSON.stringify(data);
    
    // Evitar guardado en la carga inicial
    if (isInitialLoadRef.current) {
      lastSavedRef.current = currentData;
      isInitialLoadRef.current = false;
      return;
    }
    
    // Solo guardar si los datos realmente cambiaron y tienen contenido
    if (currentData !== lastSavedRef.current && 
        Object.keys(data).length > 0 && 
        currentData !== '{}') {
      
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
    const storage = useSessionStorage ? sessionStorage : localStorage;
    storage.removeItem(`autosave_${key}`);
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
