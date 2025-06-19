
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
      rfcEmisor: data.rfcEmisor || '',
      rfcReceptor: data.rfcReceptor || '',
      nombreEmisor: data.nombreEmisor || '',
      nombreReceptor: data.nombreReceptor || '',
      ubicacionesCount: data.ubicaciones?.length || 0,
      mercanciasCount: data.mercancias?.length || 0,
      autotransporte: data.autotransporte?.placa_vm || '',
      figurasCount: data.figuras?.length || 0,
      xmlGenerado: !!data.xmlGenerado,
      datosCalculoRuta: data.datosCalculoRuta || null
    });
  }, []);

  const saveToSupabase = useCallback(async (data: CartaPorteData): Promise<boolean> => {
    if (!user || !cartaPorteId || isSavingRef.current) {
      return false;
    }

    isSavingRef.current = true;

    try {
      // Usar auth.uid() directamente en lugar de user.id para evitar conflictos de FK
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        console.error('❌ Usuario no autenticado:', userError);
        return false;
      }

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
        ubicaciones: data.ubicaciones ? JSON.parse(JSON.stringify(data.ubicaciones)) : [],
        mercancias: data.mercancias ? JSON.parse(JSON.stringify(data.mercancias)) : [],
        autotransporte: data.autotransporte ? JSON.parse(JSON.stringify(data.autotransporte)) : null,
        figuras: data.figuras ? JSON.parse(JSON.stringify(data.figuras)) : [],
        xmlGenerado: data.xmlGenerado || null,
        datosCalculoRuta: data.datosCalculoRuta || null
      };

      // Usar usuario_id en lugar de user_id para coincidir con la FK
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
          xml_generado: data.xmlGenerado,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartaPorteId)
        .eq('usuario_id', userData.user.id);

      if (error) {
        console.error('❌ Error en auto-guardado Supabase:', error);
        
        // Fallback a localStorage
        const fallbackData = {
          ...data,
          cartaPorteId,
          lastSaved: new Date().toISOString()
        };
        localStorage.setItem(`carta_porte_${cartaPorteId}`, JSON.stringify(fallbackData));
        console.log('💾 Guardado en localStorage como fallback');
        
        onSaveError?.(`Error de persistencia: ${error.message}`);
        return false;
      }

      console.log('✅ Auto-guardado Supabase exitoso');
      onSaveSuccess?.();
      return true;

    } catch (error: any) {
      console.error('❌ Error en auto-persistencia:', error);
      
      // Fallback a localStorage en caso de error
      try {
        const fallbackData = {
          ...data,
          cartaPorteId,
          lastSaved: new Date().toISOString()
        };
        localStorage.setItem(`carta_porte_${cartaPorteId}`, JSON.stringify(fallbackData));
        console.log('💾 Guardado en localStorage por error de red');
      } catch (storageError) {
        console.error('❌ Error guardando en localStorage:', storageError);
      }
      
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

  // Recuperación de sesión mejorada
  const recoverSession = useCallback(async (id: string): Promise<CartaPorteData | null> => {
    try {
      // Intentar cargar desde Supabase primero
      const { data, error } = await supabase
        .from('cartas_porte')
        .select('datos_formulario, xml_generado')
        .eq('id', id)
        .single();

      if (error || !data?.datos_formulario) {
        // Fallback a localStorage
        const fallbackData = localStorage.getItem(`carta_porte_${id}`);
        if (fallbackData) {
          const parsed = JSON.parse(fallbackData);
          console.log('🔄 Datos recuperados desde localStorage');
          return parsed;
        }
        return null;
      }

      const recoveredData: CartaPorteData = {
        ...(data.datos_formulario as CartaPorteData),
        xmlGenerado: data.xml_generado,
        cartaPorteId: id
      };

      console.log('🔄 Datos recuperados desde Supabase');
      return recoveredData;

    } catch (error) {
      console.error('❌ Error recovering session:', error);
      
      // Último intento con localStorage
      try {
        const fallbackData = localStorage.getItem(`carta_porte_${id}`);
        if (fallbackData) {
          return JSON.parse(fallbackData);
        }
      } catch (storageError) {
        console.error('❌ Error en localStorage recovery:', storageError);
      }
      
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
