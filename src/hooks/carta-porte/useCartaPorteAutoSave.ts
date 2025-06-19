
import { useEffect, useRef, useCallback, useState } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';
import { BorradorService } from '@/services/borradorService';
import { toast } from 'sonner';

interface UseCartaPorteAutoSaveOptions {
  formData: CartaPorteData;
  currentCartaPorteId?: string;
  onCartaPorteIdChange?: (id: string) => void;
  enabled?: boolean;
}

export const useCartaPorteAutoSave = ({ 
  formData, 
  currentCartaPorteId,
  onCartaPorteIdChange,
  enabled = true
}: UseCartaPorteAutoSaveOptions) => {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<string>('');
  
  // Auto-guardado mejorado
  const autoSave = useCallback(async () => {
    if (!enabled || isAutoSaving) return;
    
    const currentDataString = JSON.stringify(formData);
    if (currentDataString === lastDataRef.current || !formData) return;
    
    // Verificar que hay datos significativos
    const hasSignificantData = !!(
      formData.rfcEmisor || 
      formData.rfcReceptor || 
      (formData.ubicaciones && formData.ubicaciones.length > 0) ||
      (formData.mercancias && formData.mercancias.length > 0) ||
      formData.autotransporte?.placa_vm ||
      (formData.figuras && formData.figuras.length > 0)
    );
    
    if (!hasSignificantData) return;
    
    setIsAutoSaving(true);
    try {
      const result = await BorradorService.guardarBorrador(formData);
      
      if (result && typeof result === 'string' && result !== currentCartaPorteId && onCartaPorteIdChange) {
        onCartaPorteIdChange(result);
      }
      
      lastDataRef.current = currentDataString;
      setLastSaved(new Date());
      console.log('Auto-guardado completado:', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error en auto-guardado:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [formData, currentCartaPorteId, enabled, isAutoSaving, onCartaPorteIdChange]);

  // Efecto para auto-guardado con debounce
  useEffect(() => {
    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      autoSave();
    }, 3000); // Auto-guardar cada 3 segundos

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, autoSave, enabled]);

  // Guardar antes de salir de la página
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (enabled && formData) {
        // Intentar guardado síncrono antes de salir
        try {
          BorradorService.guardarBorrador(formData);
        } catch (error) {
          console.error('Error guardando antes de salir:', error);
        }
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, currentCartaPorteId, enabled]);

  // Función para forzar guardado manual
  const forceSave = useCallback(async () => {
    await autoSave();
  }, [autoSave]);

  return {
    isAutoSaving,
    lastSaved,
    forceSave
  };
};
