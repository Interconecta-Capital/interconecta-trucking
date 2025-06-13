
import { useState, useCallback } from 'react';

interface UseTabNavigationOptions {
  initialTab: string;
  persistInURL?: boolean;
  storageKey?: string;
}

export function useTabNavigation({ 
  initialTab, 
  persistInURL = false, 
  storageKey 
}: UseTabNavigationOptions) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    
    if (storageKey) {
      try {
        sessionStorage.setItem(`${storageKey}-active-tab`, tab);
      } catch (error) {
        console.warn('Failed to save tab state:', error);
      }
    }
  }, [storageKey]);

  return {
    activeTab,
    handleTabChange
  };
}
