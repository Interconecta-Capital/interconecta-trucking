
import React from 'react';
import { useGlobalUpgradeModal } from '@/hooks/useGlobalUpgradeModal';
import { useAxiosInterceptor } from '@/hooks/useAxiosInterceptor';
import { UpgradeModal } from './UpgradeModal';

interface GlobalUpgradeModalProviderProps {
  children: React.ReactNode;
}

export const GlobalUpgradeModalProvider: React.FC<GlobalUpgradeModalProviderProps> = ({ 
  children 
}) => {
  const { isOpen, context, hideUpgradeModal } = useGlobalUpgradeModal();
  
  // Configurar el interceptor de Axios
  useAxiosInterceptor();

  return (
    <>
      {children}
      
      {/* Modal Global de Upgrade */}
      {context && (
        <UpgradeModal
          isOpen={isOpen}
          onClose={hideUpgradeModal}
          title={context.title}
          description={context.message}
          blockedAction={`${context.limitType}: ${context.currentUsage}/${context.limitValue}`}
        />
      )}
    </>
  );
};
