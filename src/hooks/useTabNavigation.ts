
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
    // Solo cambiar el tab sin actualizar la URL inmediatamente
    setActiveTab(value);
    
    // Solo actualizar URL si es absolutamente necesario y después del primer render
    if (persistInURL && !isInitialMount.current) {
      // Usar replaceState en lugar de pushState para evitar entradas en el historial
      const url = new URL(window.location.href);
      url.searchParams.set('tab', value);
      window.history.replaceState({}, '', url.toString());
    }
    
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [persistInURL]);

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
