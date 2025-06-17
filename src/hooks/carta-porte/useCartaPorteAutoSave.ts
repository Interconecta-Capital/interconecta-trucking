
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';

interface UseCartaPorteAutoSaveOptions {
  formData: any;
  currentCartaPorteId?: string;
  onCartaPorteIdChange: (id: string) => void;
  enabled: boolean;
  intervalMs?: number;
}

export const useCartaPorteAutoSave = ({
  formData,
  currentCartaPorteId,
  onCartaPorteIdChange,
  enabled,
  intervalMs = 30000 // 30 segundos
}: UseCartaPorteAutoSaveOptions) => {
  const { user } = useAuth();
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<string>('');

  const hasSignificantData = (data: any): boolean => {
    return !!(
      data.rfcEmisor || 
      data.rfcReceptor || 
      (data.ubicaciones && data.ubicaciones.length > 0) ||
      (data.mercancias && data.mercancias.length > 0) ||
      data.autotransporte?.placa_vm ||
      (data.figuras && data.figuras.length > 0)
    );
  };

  const autoSave = async () => {
    if (!enabled || !user?.id || isAutoSaving) {
      return;
    }

    // Verificar si hay datos significativos
    if (!hasSignificantData(formData)) {
      return;
    }

    // Verificar si los datos han cambiado
    const currentDataString = JSON.stringify(formData);
    if (lastDataRef.current === currentDataString) {
      return;
    }

    setIsAutoSaving(true);
    try {
      const cartaPorteData = {
        tipo_cfdi: formData.tipoCfdi || 'Traslado',
        rfc_emisor: formData.rfcEmisor || 'TEMP',
        nombre_emisor: formData.nombreEmisor || 'Sin nombre',
        rfc_receptor: formData.rfcReceptor || 'TEMP',
        nombre_receptor: formData.nombreReceptor || 'Sin nombre',
        transporte_internacional: Boolean(formData.transporteInternacional === 'Sí' || formData.transporteInternacional === true),
        registro_istmo: Boolean(formData.registroIstmo),
        status: 'borrador',
        datos_formulario: formData,
        usuario_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (currentCartaPorteId) {
        // Actualizar existente
        const { error } = await supabase
          .from('cartas_porte')
          .update(cartaPorteData)
          .eq('id', currentCartaPorteId)
          .eq('usuario_id', user.id);

        if (error) throw error;
      } else {
        // Crear nuevo
        const { data: newData, error } = await supabase
          .from('cartas_porte')
          .insert({
            ...cartaPorteData,
            created_at: new Date().toISOString(),
            folio: `CP-${Date.now().toString().slice(-8)}`
          })
          .select('id')
          .single();

        if (error) throw error;
        
        if (newData?.id) {
          onCartaPorteIdChange(newData.id);
        }
      }

      lastDataRef.current = currentDataString;
      setLastSaved(new Date());
      console.log('Auto-save completado exitosamente');
    } catch (error) {
      console.error('Error en auto-save:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Establecer nuevo timeout
    timeoutRef.current = setTimeout(autoSave, intervalMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, enabled, intervalMs]);

  return {
    isAutoSaving,
    lastSaved
  };
};
