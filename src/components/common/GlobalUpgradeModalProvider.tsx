
import React from 'react';
import { useGlobalUpgradeModal } from '@/hooks/useGlobalUpgradeModal';
import { UpgradeModal } from './UpgradeModal';

interface GlobalUpgradeModalProviderProps {
  children: React.ReactNode;
}

export const GlobalUpgradeModalProvider = ({ children }: GlobalUpgradeModalProviderProps) => {
  const { isOpen, modalProps, hideModal } = useGlobalUpgradeModal();

  return (
    <>
      {children}
      <UpgradeModal
        isOpen={isOpen}
        onClose={hideModal}
        title={modalProps.title}
        description={modalProps.description}
        blockedAction={modalProps.blockedAction}
      />
    </>
  );
};
