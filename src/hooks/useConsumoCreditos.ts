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
        if (data?.error === 'INSUFFICIENT_CREDITS') {
          showUpgradeModal({
            title: '¡Agotaste tus timbres del mes!',
            message: data?.message || 'Haz upgrade a un plan superior para seguir timbrando.',
            limitType: 'timbres',
            currentUsage: 0,
            limitValue: 0
          });
          return false;
        }
        if (data?.error === 'NO_CREDITS_ACCOUNT') {
          showUpgradeModal({
            title: 'No tienes cuenta de timbres',
            message: 'Contacta a soporte para activar tu cuenta.',
            limitType: 'timbres',
            currentUsage: 0,
            limitValue: 0
          });
          return false;
        }
        throw new Error(data?.message || 'Error al consumir timbre');
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
