
import { useState, useCallback } from 'react';
import { setGlobalUpgradeModal } from './useAxiosInterceptor';

interface UpgradeModalProps {
  title?: string;
  description?: string;
  blockedAction?: string;
}

export const useGlobalUpgradeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalProps, setModalProps] = useState<UpgradeModalProps>({});

  const showModal = useCallback((props: UpgradeModalProps) => {
    console.log('[GlobalUpgradeModal] 📱 Mostrando modal:', props);
    setModalProps(props);
    setIsOpen(true);
  }, []);

  const hideModal = useCallback(() => {
    console.log('[GlobalUpgradeModal] ❌ Ocultando modal');
    setIsOpen(false);
    setModalProps({});
  }, []);

  // Registrar la función global
  React.useEffect(() => {
    setGlobalUpgradeModal(showModal);
    
    return () => {
      setGlobalUpgradeModal(() => {});
    };
  }, [showModal]);

  return {
    isOpen,
    modalProps,
    showModal,
    hideModal
  };
};
