
import { useState, useCallback, useRef, useEffect } from 'react';

interface UseTabNavigationOptions {
  initialTab?: string;
  persistInURL?: boolean;
  storageKey?: string;
}

export function useTabNavigation({ 
  initialTab = '', 
  persistInURL = false,
  storageKey
}: UseTabNavigationOptions = {}) {
  // Usar sessionStorage para persistir tab entre navegaciones
  const getStoredTab = useCallback(() => {
    if (storageKey) {
      try {
        return sessionStorage.getItem(`tab_${storageKey}`) || initialTab;
      } catch {
        return initialTab;
      }
    }
    return initialTab;
  }, [storageKey, initialTab]);

  const [activeTab, setActiveTab] = useState(getStoredTab());
  const isInitialMount = useRef(true);

  const handleTabChange = useCallback((value: string) => {
    console.log('[TabNavigation] Changing tab to:', value);
    
    // Guardar en sessionStorage si se especifica
    if (storageKey) {
      try {
        sessionStorage.setItem(`tab_${storageKey}`, value);
      } catch (error) {
        console.warn('[TabNavigation] Failed to save tab to storage:', error);
      }
    }
    
    // Solo cambiar el tab localmente, SIN URL
    setActiveTab(value);
    
    // Marcar que ya no es el primer montaje
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [storageKey]);

  const setTabSilently = useCallback((value: string) => {
    console.log('[TabNavigation] Setting tab silently to:', value);
    // Cambiar tab sin efectos secundarios
    setActiveTab(value);
  }, []);

  // Restaurar tab guardado al montar
  useEffect(() => {
    const storedTab = getStoredTab();
    if (storedTab !== activeTab) {
      setActiveTab(storedTab);
    }
  }, []);

  return {
    activeTab,
    handleTabChange,
    setTabSilently
  };
}
