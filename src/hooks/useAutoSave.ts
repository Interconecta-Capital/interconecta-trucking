
import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseAutoSaveOptions {
  data: any;
  key: string;
  delay?: number;
  onSave?: (data: any) => Promise<void>;
  enabled?: boolean;
}

export const useAutoSave = ({
  data,
  key,
  delay = 2000,
  onSave,
  enabled = true
}: UseAutoSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');

  const saveData = useCallback(async () => {
    try {
      if (onSave) {
        await onSave(data);
      } else {
        localStorage.setItem(`autosave_${key}`, JSON.stringify(data));
      }
      lastSavedRef.current = JSON.stringify(data);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [data, key, onSave]);

  useEffect(() => {
    if (!enabled) return;

    const currentData = JSON.stringify(data);
    
    if (currentData !== lastSavedRef.current && Object.keys(data).length > 0) {
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
      const saved = localStorage.getItem(`autosave_${key}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load saved data:', error);
      return null;
    }
  }, [key]);

  const clearSavedData = useCallback(() => {
    localStorage.removeItem(`autosave_${key}`);
  }, [key]);

  return {
    loadSavedData,
    clearSavedData,
    saveData
  };
};
