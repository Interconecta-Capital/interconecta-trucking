
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
  delay = 2000,
  onSave,
  enabled = true,
  useSessionStorage = true
}: UseAutoSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');
  const isInitialLoadRef = useRef(true);

  const saveData = useCallback(async () => {
    try {
      console.log('[AutoSave] Starting save for key:', key);
      
      if (onSave) {
        await onSave(data);
      } else {
        const storage = useSessionStorage ? sessionStorage : localStorage;
        storage.setItem(`autosave_${key}`, JSON.stringify(data));
      }
      lastSavedRef.current = JSON.stringify(data);
      console.log('[AutoSave] Save completed for key:', key);
    } catch (error) {
      console.error('[AutoSave] Save failed for key:', key, error);
    }
  }, [data, key, onSave, useSessionStorage]);

  useEffect(() => {
    if (!enabled) return;

    const currentData = JSON.stringify(data);
    
    if (isInitialLoadRef.current) {
      lastSavedRef.current = currentData;
      isInitialLoadRef.current = false;
      return;
    }
    
    if (currentData !== lastSavedRef.current && 
        data && 
        typeof data === 'object' &&
        Object.keys(data).length > 0 && 
        currentData !== '{}' &&
        currentData !== 'null') {
      
      console.log('[AutoSave] Data changed for key:', key, 'scheduling save in', delay, 'ms');
      
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
      console.log('[AutoSave] Loading saved data for key:', key, 'found:', !!saved);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('[AutoSave] Failed to load saved data for key:', key, error);
      return null;
    }
  }, [key, useSessionStorage]);

  const clearSavedData = useCallback(() => {
    try {
      const storage = useSessionStorage ? sessionStorage : localStorage;
      storage.removeItem(`autosave_${key}`);
      console.log('[AutoSave] Cleared saved data for key:', key);
    } catch (error) {
      console.error('[AutoSave] Failed to clear saved data for key:', key, error);
    }
  }, [key, useSessionStorage]);

  const forceSave = useCallback(() => {
    console.log('[AutoSave] Force save requested for key:', key);
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
