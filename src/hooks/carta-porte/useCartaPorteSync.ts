
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CartaPorteFormData } from './useCartaPorteMappers';

interface UseCartaPorteSyncOptions {
  formData: CartaPorteFormData;
  currentCartaPorteId?: string;
  cartaPorteId?: string;
  isLoading: boolean;
  setFormData: (data: CartaPorteFormData) => void;
  setCurrentCartaPorteId: (id: string | undefined) => void;
}

export const useCartaPorteSync = ({
  formData,
  currentCartaPorteId,
  cartaPorteId,
  isLoading,
  setFormData,
  setCurrentCartaPorteId,
}: UseCartaPorteSyncOptions) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const syncToDatabase = useCallback(async (data: CartaPorteFormData, id?: string) => {
    if (id) {
      setIsUpdating(true);
    } else {
      setIsCreating(true);
    }
    setSyncError(null);

    try {
      if (id) {
        // Update existing
        const { error } = await supabase
          .from('cartas_porte')
          .update({
            datos_formulario: data as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        // Create new
        const { data: newData, error } = await supabase
          .from('cartas_porte')
          .insert({
            status: 'borrador',
            datos_formulario: data as any,
            rfc_emisor: data.rfcEmisor || data.configuracion.emisor.rfc,
            rfc_receptor: data.rfcReceptor || data.configuracion.receptor.rfc,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return newData.id;
      }
    } catch (error: any) {
      setSyncError(error.message);
      throw error;
    } finally {
      setIsCreating(false);
      setIsUpdating(false);
    }
  }, []);

  const loadFromDatabase = useCallback(async (id: string) => {
    setIsUpdating(true);
    setSyncError(null);

    try {
      const { data, error } = await supabase
        .from('cartas_porte')
        .select('datos_formulario')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data.datos_formulario;
    } catch (error: any) {
      setSyncError(error.message);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const updateCartaPorte = useCallback(async (data: CartaPorteFormData) => {
    if (currentCartaPorteId) {
      await syncToDatabase(data, currentCartaPorteId);
    } else {
      const newId = await syncToDatabase(data);
      if (newId) {
        setCurrentCartaPorteId(newId);
      }
    }
  }, [currentCartaPorteId, syncToDatabase, setCurrentCartaPorteId]);

  return {
    isCreating,
    isUpdating,
    syncError,
    syncToDatabase,
    loadFromDatabase,
    updateCartaPorte,
  };
};
