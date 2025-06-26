
import { create } from 'zustand';

interface UpgradeModalContext {
  title: string;
  message: string;
  limitType: string;
  currentUsage?: number;
  limitValue?: number;
}

interface UpgradeModalStore {
  isOpen: boolean;
  context: UpgradeModalContext | null;
  showUpgradeModal: (context: UpgradeModalContext) => void;
  hideUpgradeModal: () => void;
}

const useUpgradeModalStore = create<UpgradeModalStore>((set) => ({
  isOpen: false,
  context: null,
  showUpgradeModal: (context) => {
    console.log('[UpgradeModal] 📢 Mostrando modal:', context);
    set({ isOpen: true, context });
  },
  hideUpgradeModal: () => {
    console.log('[UpgradeModal] ❌ Ocultando modal');
    set({ isOpen: false, context: null });
  },
}));

export const useGlobalUpgradeModal = () => {
  const { isOpen, context, showUpgradeModal, hideUpgradeModal } = useUpgradeModalStore();

  return {
    isOpen,
    context,
    showUpgradeModal,
    hideUpgradeModal,
  };
};
