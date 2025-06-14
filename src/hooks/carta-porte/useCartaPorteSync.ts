
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCartaPorteSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const syncToDatabase = useCallback(async (formData: any, cartaPorteId?: string) => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      if (cartaPorteId) {
        // Update existing
        const { error } = await supabase
          .from('cartas_porte')
          .update({
            datos_formulario: formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', cartaPorteId);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('cartas_porte')
          .insert({
            status: 'borrador',
            datos_formulario: formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data.id;
      }
    } catch (error: any) {
      setSyncError(error.message);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const loadFromDatabase = useCallback(async (cartaPorteId: string) => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      const { data, error } = await supabase
        .from('cartas_porte')
        .select('datos_formulario')
        .eq('id', cartaPorteId)
        .single();

      if (error) throw error;
      return data.datos_formulario;
    } catch (error: any) {
      setSyncError(error.message);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return {
    isSyncing,
    syncError,
    syncToDatabase,
    loadFromDatabase
  };
};
