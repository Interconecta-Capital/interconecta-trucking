
import { useState, useEffect, useCallback } from 'react';

interface PersistenceOptions {
  key: string;
  storage?: 'localStorage' | 'sessionStorage';
  serializer?: {
    stringify: (value: any) => string;
    parse: (value: string) => any;
  };
}

const defaultSerializer = {
  stringify: JSON.stringify,
  parse: JSON.parse,
};

export function useStatePersistence<T>(
  initialValue: T,
  options: PersistenceOptions
) {
  const {
    key,
    storage = 'sessionStorage',
    serializer = defaultSerializer,
  } = options;

  const storageObject = storage === 'localStorage' ? localStorage : sessionStorage;

  // Get initial value from storage or use provided initial value
  const [state, setState] = useState<T>(() => {
    try {
      const item = storageObject.getItem(key);
      if (item !== null) {
        const parsed = serializer.parse(item);
        console.log(`[StatePersistence] Restored state for ${key}:`, parsed);
        return parsed;
      }
    } catch (error) {
      console.warn(`[StatePersistence] Failed to restore state for ${key}:`, error);
    }
    return initialValue;
  });

  // Save state to storage whenever it changes
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
      
      try {
        storageObject.setItem(key, serializer.stringify(newValue));
        console.log(`[StatePersistence] Saved state for ${key}:`, newValue);
      } catch (error) {
        console.warn(`[StatePersistence] Failed to save state for ${key}:`, error);
      }
      
      return newValue;
    });
  }, [key, storageObject, serializer]);

  // Clear persisted state
  const clearPersistedState = useCallback(() => {
    try {
      storageObject.removeItem(key);
      console.log(`[StatePersistence] Cleared state for ${key}`);
    } catch (error) {
      console.warn(`[StatePersistence] Failed to clear state for ${key}:`, error);
    }
  }, [key, storageObject]);

  return [state, setValue, clearPersistedState] as const;
}
