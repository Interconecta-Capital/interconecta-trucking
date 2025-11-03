import { supabase } from "@/integrations/supabase/client";
import { useGlobalUpgradeModal } from "./useGlobalUpgradeModal";

export const useConsumoCreditos = () => {
  const { showUpgradeModal } = useGlobalUpgradeModal();

  const consumirCreditoParaTimbrar = async (cartaPorteId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('consume-credit', {
        body: { carta_porte_id: cartaPorteId }
      });

      if (error || data?.error) {
        if (data?.error === 'INSUFFICIENT_CREDITS' || data?.error === 'NO_CREDITS_ACCOUNT') {
          showUpgradeModal({
            title: '¡Agotaste tus créditos!',
            message: data?.message || 'Recarga tu saldo para seguir timbrando.',
            limitType: 'creditos',
            currentUsage: 0,
            limitValue: 0
          });
          return false;
        }
        throw new Error(data?.message || 'Error al consumir crédito');
      }

      console.log('[ConsumoCreditos] ✅ Crédito consumido:', data);
      return true;
    } catch (error) {
      console.error('[ConsumoCreditos] Error:', error);
      return false;
    }
  };

  return { consumirCreditoParaTimbrar };
};
