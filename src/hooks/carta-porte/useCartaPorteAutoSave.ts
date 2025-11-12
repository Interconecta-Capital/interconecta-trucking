
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
    if (!enabled || isAutoSaving) {
      console.log('⏸️ Auto-save deshabilitado:', { enabled, isAutoSaving });
      return;
    }
    
    const currentDataString = JSON.stringify(formData);
    if (currentDataString === lastDataRef.current || !formData) return;
    
    // ✅ FASE 1: Validar que hay datos reales antes de guardar
    const tieneContenidoReal = (
      formData.rfcEmisor || 
      formData.rfcReceptor || 
      (formData.ubicaciones && formData.ubicaciones.length > 0) ||
      (formData.mercancias && formData.mercancias.length > 0) ||
      formData.autotransporte?.placa_vm ||
      (formData.figuras && formData.figuras.length > 0)
    );
    
    if (!tieneContenidoReal) {
      console.warn('⚠️ Auto-save cancelado: no hay contenido real para guardar');
      return;
    }
    
    // ✅ FASE 6: Log detallado para debugging
    console.log('💾 [DEBUG] Auto-save ejecutándose:', {
      cartaPorteId: currentCartaPorteId,
      timestamp: new Date().toISOString(),
      ubicaciones: formData.ubicaciones?.length || 0,
      destino: formData.ubicaciones?.find(u => 
        u.tipo_ubicacion === 'Destino' || (u as any).tipoUbicacion === 'Destino'
      ),
      distanciaEnDestino: formData.ubicaciones?.find(u => 
        u.tipo_ubicacion === 'Destino' || (u as any).tipoUbicacion === 'Destino'
      )?.distancia_recorrida,
      mercancias: formData.mercancias?.length || 0,
      rfcEmisor: formData.rfcEmisor || 'vacío',
      rfcReceptor: formData.rfcReceptor || 'vacío'
    });
    
    setIsAutoSaving(true);
    try {
      const nuevoId = await BorradorService.guardarBorrador(formData, currentCartaPorteId);
      
      if (nuevoId && nuevoId !== currentCartaPorteId && onCartaPorteIdChange) {
        onCartaPorteIdChange(nuevoId);
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
        BorradorService.guardarBorradorAutomatico(formData, currentCartaPorteId);
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
