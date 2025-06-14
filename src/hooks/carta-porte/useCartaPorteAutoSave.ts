
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCartaPorteAutoSave = (formData: any, isDirty: boolean, cartaPorteId?: string) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    if (!isDirty || !formData) return;

    const currentDataString = JSON.stringify(formData);
    if (currentDataString === lastSavedRef.current) return;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      try {
        if (cartaPorteId) {
          // Update existing carta porte
          await supabase
            .from('cartas_porte')
            .update({
              datos_formulario: formData,
              updated_at: new Date().toISOString()
            })
            .eq('id', cartaPorteId);
        } else {
          // Create new draft
          const { data } = await supabase
            .from('cartas_porte')
            .insert({
              status: 'borrador',
              datos_formulario: formData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (data) {
            // Store the new ID somewhere accessible
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
  }, [formData, isDirty, cartaPorteId]);

  return null; // This hook doesn't return anything, just performs auto-save
};
