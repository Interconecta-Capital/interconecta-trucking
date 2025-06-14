
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CartaPorteFormData } from './useCartaPorteMappers';

interface UseCartaPorteAutoSaveOptions {
  formData: CartaPorteFormData;
  currentCartaPorteId?: string;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
}

export const useCartaPorteAutoSave = ({ 
  formData, 
  currentCartaPorteId, 
  isLoading,
  isCreating,
  isUpdating 
}: UseCartaPorteAutoSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    // No auto-save if loading or already creating/updating
    if (isLoading || isCreating || isUpdating || !formData) return;

    const currentDataString = JSON.stringify(formData);
    if (currentDataString === lastSavedRef.current) return;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      try {
        if (currentCartaPorteId) {
          // Update existing carta porte
          await supabase
            .from('cartas_porte')
            .update({
              datos_formulario: formData as any,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentCartaPorteId);
        } else {
          // Create new draft
          const { data } = await supabase
            .from('cartas_porte')
            .insert({
              status: 'borrador',
              datos_formulario: formData as any,
              rfc_emisor: formData.rfcEmisor || formData.configuracion.emisor.rfc,
              rfc_receptor: formData.rfcReceptor || formData.configuracion.receptor.rfc,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (data) {
            console.log('Draft saved with ID:', data.id);
          }
        }

        lastSavedRef.current = currentDataString;
        console.log('Auto-saved at', new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, currentCartaPorteId, isLoading, isCreating, isUpdating]);

  const clearSavedData = useCallback(() => {
    lastSavedRef.current = '';
  }, []);

  return { clearSavedData };
};
