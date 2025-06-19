import { useState, useCallback } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { CartaPorteData } from '@/types/cartaPorte';

interface UseCartaPorteAutoPersistenceResult {
  isSaving: boolean;
  lastError: Error | null;
  saveBorrador: (data: CartaPorteData, cartaPorteId?: string) => Promise<any>;
  loadCartaPorte: (cartaPorteId: string) => Promise<CartaPorteData | null>;
  deleteCartaPorte: (cartaPorteId: string) => Promise<boolean>;
}

export const useCartaPorteAutoPersistence = (): UseCartaPorteAutoPersistenceResult => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  const user = useUser();

  const persistCartaPorte = useCallback(async (data: CartaPorteData) => {
    if (!user?.id) return null;

    try {
      setIsSaving(true);
      setLastError(null);

      const cartaPorteData = {
        ...data,
        version: data.version || data.cartaPorteVersion || '3.1',
        usuario_id: user.id,
        rfc_emisor: data.rfcEmisor,
        nombre_emisor: data.nombreEmisor,
        rfc_receptor: data.rfcReceptor,
        nombre_receptor: data.nombreReceptor,
        transporte_internacional: data.transporteInternacional,
        registro_istmo: data.registroIstmo,
        tipo_cfdi: data.tipoCfdi,
        status: 'borrador',
        datos_formulario: {
          version: data.version || data.cartaPorteVersion || '3.1',
          ...data
        }
      };

      const { data: cartaPorte, error } = await supabase
        .from('cartas_porte')
        .insert([cartaPorteData])
        .select()
        .single();

      if (error) {
        console.error('Error inserting carta porte:', error);
        setLastError(error as Error);
        throw error;
      }

      return cartaPorte;
    } catch (error) {
      console.error('Error saving carta porte:', error);
      setLastError(error as Error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id]);

  const updateCartaPorte = useCallback(async (id: string, data: CartaPorteData) => {
    if (!user?.id) return null;

    try {
      setIsSaving(true);
      setLastError(null);

      const updateData = {
        ...data,
        version: data.version || data.cartaPorteVersion || '3.1',
        updated_at: new Date().toISOString(),
        datos_formulario: {
          version: data.version || data.cartaPorteVersion || '3.1',
          ...data
        }
      };

      const { data: updatedCartaPorte, error } = await supabase
        .from('cartas_porte')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating carta porte:', error);
        setLastError(error as Error);
        throw error;
      }

      return updatedCartaPorte;
    } catch (error) {
      console.error('Error updating carta porte:', error);
      setLastError(error as Error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id]);

  const saveBorrador = useCallback(async (data: CartaPorteData, cartaPorteId?: string) => {
    try {
      const dataWithVersion = {
        ...data,
        version: data.version || data.cartaPorteVersion || '3.1'
      };

      if (cartaPorteId) {
        return await updateCartaPorte(cartaPorteId, dataWithVersion);
      } else {
        return await persistCartaPorte(dataWithVersion);
      }
    } catch (error) {
      console.error('Error saving borrador:', error);
      throw error;
    }
  }, [persistCartaPorte, updateCartaPorte]);

  const loadCartaPorte = useCallback(async (cartaPorteId: string): Promise<CartaPorteData | null> => {
    try {
      setIsSaving(true);
      setLastError(null);

      const { data, error } = await supabase
        .from('cartas_porte')
        .select('*')
        .eq('id', cartaPorteId)
        .single();

      if (error) {
        console.error('Error fetching carta porte:', error);
        setLastError(error as Error);
        return null;
      }

      if (!data) {
        console.warn('Carta porte not found:', cartaPorteId);
        return null;
      }

      return data.datos_formulario as CartaPorteData;
    } catch (error) {
      console.error('Error loading carta porte:', error);
      setLastError(error as Error);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const deleteCartaPorte = useCallback(async (cartaPorteId: string): Promise<boolean> => {
    try {
      setIsSaving(true);
      setLastError(null);

      const { error } = await supabase
        .from('cartas_porte')
        .delete()
        .eq('id', cartaPorteId);

      if (error) {
        console.error('Error deleting carta porte:', error);
        setLastError(error as Error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting carta porte:', error);
      setLastError(error as Error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    isSaving,
    lastError,
    saveBorrador,
    loadCartaPorte,
    deleteCartaPorte
  };
};
