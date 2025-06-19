
import { useState, useEffect, useCallback } from 'react';
import { BorradorService } from '@/services/borradorService';
import { CartaPorteData } from '@/types/cartaPorte';

interface BorradorRecoveryState {
  showDialog: boolean;
  borradorData: CartaPorteData | null;
  borradorId: string | null;
}

export const useBorradorRecovery = (cartaPorteId?: string) => {
  const [recoveryState, setRecoveryState] = useState<BorradorRecoveryState>({
    showDialog: false,
    borradorData: null,
    borradorId: null
  });

  const checkForBorrador = useCallback(async () => {
    try {
      // Si ya tenemos un cartaPorteId específico, intentar cargarlo
      if (cartaPorteId) {
        const result = await BorradorService.cargarBorrador(cartaPorteId);
        if (result.success && result.data) {
          return {
            data: result.data,
            id: cartaPorteId,
            found: true
          };
        }
      }

      // Buscar último borrador guardado localmente
      const ultimoBorrador = BorradorService.cargarUltimoBorrador();
      if (ultimoBorrador?.datosFormulario) {
        // Verificar que tiene datos significativos
        const data = ultimoBorrador.datosFormulario;
        const hasSignificantData = !!(
          data.rfcEmisor || 
          data.rfcReceptor || 
          (data.ubicaciones && data.ubicaciones.length > 0) ||
          (data.mercancias && data.mercancias.length > 0) ||
          data.autotransporte?.placa_vm ||
          (data.figuras && data.figuras.length > 0)
        );

        if (hasSignificantData) {
          return {
            data: ultimoBorrador.datosFormulario,
            id: ultimoBorrador.cartaPorteId || null,
            found: true
          };
        }
      }

      return { data: null, id: null, found: false };
    } catch (error) {
      console.error('Error checking for borrador:', error);
      return { data: null, id: null, found: false };
    }
  }, [cartaPorteId]);

  useEffect(() => {
    const initializeRecovery = async () => {
      const result = await checkForBorrador();
      
      if (result.found && result.data) {
        setRecoveryState({
          showDialog: true,
          borradorData: result.data,
          borradorId: result.id
        });
      }
    };

    // Solo verificar si no tenemos un cartaPorteId específico (nuevo documento)
    if (!cartaPorteId) {
      initializeRecovery();
    }
  }, [cartaPorteId, checkForBorrador]);

  const acceptBorrador = useCallback(() => {
    setRecoveryState(prev => ({ ...prev, showDialog: false }));
    return {
      data: recoveryState.borradorData,
      id: recoveryState.borradorId
    };
  }, [recoveryState.borradorData, recoveryState.borradorId]);

  const rejectBorrador = useCallback(async () => {
    try {
      // Limpiar borrador rechazado
      if (recoveryState.borradorId) {
        await BorradorService.eliminarBorrador(recoveryState.borradorId);
      } else {
        // Limpiar localStorage
        BorradorService.limpiarBorrador();
      }
    } catch (error) {
      console.error('Error clearing rejected borrador:', error);
    }
    
    setRecoveryState({
      showDialog: false,
      borradorData: null,
      borradorId: null
    });
  }, [recoveryState.borradorId]);

  return {
    showRecoveryDialog: recoveryState.showDialog,
    borradorData: recoveryState.borradorData,
    acceptBorrador,
    rejectBorrador
  };
};
