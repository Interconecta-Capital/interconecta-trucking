import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CartaPorteData } from '@/types/cartaPorte';
import { useToast } from '@/hooks/use-toast';

interface AutoPersistenceOptions {
  cartaPorteId?: string;
  autoSaveInterval?: number;
  onSaveSuccess?: () => void;
  onSaveError?: (error: string) => void;
}

export function useCartaPorteAutoPersistence(
  formData: CartaPorteData,
  options: AutoPersistenceOptions = {}
) {
  const { 
    cartaPorteId, 
    autoSaveInterval = 30000,
    onSaveSuccess,
    onSaveError 
  } = options;
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const lastSavedRef = useRef<string>('');
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();
  const isSavingRef = useRef(false);

  const generateDataSignature = useCallback((data: CartaPorteData): string => {
    return JSON.stringify({
      rfcEmisor: data.rfcEmisor,
      rfcReceptor: data.rfcReceptor,
      nombreEmisor: data.nombreEmisor,
      nombreReceptor: data.nombreReceptor,
      ubicacionesCount: data.ubicaciones?.length || 0,
      mercanciasCount: data.mercancias?.length || 0,
      autotransporte: data.autotransporte?.placa_vm,
      figurasCount: data.figuras?.length || 0,
      xmlGenerado: !!data.xmlGenerado,
      datosCalculoRuta: data.datosCalculoRuta
    });
  }, []);

  const saveToSupabase = useCallback(async (data: CartaPorteData): Promise<boolean> => {
    if (!user || !cartaPorteId || isSavingRef.current) {
      return false;
    }

    isSavingRef.current = true;

    try {
      // Serializar datos de forma segura para Supabase
      const serializedData = {
        tipoCreacion: data.tipoCreacion || 'manual',
        tipoCfdi: data.tipoCfdi || 'Traslado',
        rfcEmisor: data.rfcEmisor || '',
        nombreEmisor: data.nombreEmisor || '',
        rfcReceptor: data.rfcReceptor || '',
        nombreReceptor: data.nombreReceptor || '',
        transporteInternacional: Boolean(data.transporteInternacional === 'Sí' || data.transporteInternacional === true),
        registroIstmo: Boolean(data.registroIstmo),
        cartaPorteVersion: data.cartaPorteVersion || '3.1',
        ubicaciones: JSON.parse(JSON.stringify(data.ubicaciones || [])),
        mercancias: JSON.parse(JSON.stringify(data.mercancias || [])),
        autotransporte: JSON.parse(JSON.stringify(data.autotransporte || {})),
        figuras: JSON.parse(JSON.stringify(data.figuras || [])),
        xmlGenerado: data.xmlGenerado,
        datosCalculoRuta: data.datosCalculoRuta
      };

      const { error } = await supabase
        .from('cartas_porte')
        .update({
          datos_formulario: serializedData,
          rfc_emisor: data.rfcEmisor || 'TEMP',
          nombre_emisor: data.nombreEmisor,
          rfc_receptor: data.rfcReceptor || 'TEMP',
          nombre_receptor: data.nombreReceptor,
          tipo_cfdi: data.tipoCfdi,
          transporte_internacional: Boolean(data.transporteInternacional === 'Sí' || data.transporteInternacional === true),
          registro_istmo: Boolean(data.registroIstmo),
          updated_at: new Date().toISOString()
        })
        .eq('id', cartaPorteId)
        .eq('usuario_id', user.id);

      if (error) {
        console.error('Error en auto-guardado:', error);
        onSaveError?.(`Error al guardar: ${error.message}`);
        return false;
      }

      console.log('✅ Auto-guardado exitoso');
      onSaveSuccess?.();
      return true;

    } catch (error: any) {
      console.error('Error en auto-persistencia:', error);
      onSaveError?.(error.message);
      return false;
    } finally {
      isSavingRef.current = false;
    }
  }, [user, cartaPorteId, onSaveSuccess, onSaveError]);

  // Auto-guardado basado en cambios
  useEffect(() => {
    const currentSignature = generateDataSignature(formData);
    
    if (currentSignature !== lastSavedRef.current && cartaPorteId) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        saveToSupabase(formData).then(success => {
          if (success) {
            lastSavedRef.current = currentSignature;
          }
        });
      }, autoSaveInterval);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData, generateDataSignature, saveToSupabase, autoSaveInterval, cartaPorteId]);

  // Guardado manual
  const saveManually = useCallback(async (): Promise<boolean> => {
    const success = await saveToSupabase(formData);
    if (success) {
      lastSavedRef.current = generateDataSignature(formData);
      toast({
        title: "Guardado exitoso",
        description: "Los datos se han guardado correctamente",
      });
    }
    return success;
  }, [formData, saveToSupabase, generateDataSignature, toast]);

  // Recuperación de sesión
  const recoverSession = useCallback(async (id: string): Promise<CartaPorteData | null> => {
    try {
      const { data, error } = await supabase
        .from('cartas_porte')
        .select('datos_formulario, xml_generado')
        .eq('id', id)
        .single();

      if (error || !data?.datos_formulario) {
        return null;
      }

      const recoveredData: CartaPorteData = {
        ...data.datos_formulario,
        xmlGenerado: data.xml_generado,
        cartaPorteId: id
      };

      return recoveredData;

    } catch (error) {
      console.error('Error recovering session:', error);
      return null;
    }
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  return {
    saveManually,
    recoverSession,
    isSaving: isSavingRef.current,
    lastSaved: lastSavedRef.current
  };
}
