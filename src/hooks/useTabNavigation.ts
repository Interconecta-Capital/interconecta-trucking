
import { useState, useCallback, useRef } from 'react';

interface UseTabNavigationOptions {
  initialTab?: string;
  persistInURL?: boolean;
}

export function useTabNavigation({ 
  initialTab = '', 
  persistInURL = false 
}: UseTabNavigationOptions = {}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const isInitialMount = useRef(true);

  const handleTabChange = useCallback((value: string) => {
    // Solo cambiar el tab localmente, sin URL
    setActiveTab(value);
    
    // Marcar que ya no es el primer montaje
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, []);

  const setTabSilently = useCallback((value: string) => {
    // Cambiar tab sin efectos secundarios
    setActiveTab(value);
  }, []);

  return {
    activeTab,
    handleTabChange,
    setTabSilently
  };
}
