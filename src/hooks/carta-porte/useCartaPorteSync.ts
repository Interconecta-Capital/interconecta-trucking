
import { useEffect, useCallback } from 'react';
import { useCartasPorte } from '@/hooks/useCartasPorte';
import { useUbicacionesPersistence } from '@/hooks/useUbicacionesPersistence';
import { useMercanciasPersistence } from '@/hooks/useMercanciasPersistence';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';

interface UseCartaPorteSyncOptions {
  formData: CartaPorteData;
  currentCartaPorteId?: string;
  cartaPorteId?: string;
  isLoading: boolean;
  setFormData: (data: CartaPorteData | ((prev: CartaPorteData) => CartaPorteData)) => void;
  setCurrentCartaPorteId: (id: string) => void;
}

export function useCartaPorteSync({
  formData,
  currentCartaPorteId,
  cartaPorteId,
  isLoading,
  setFormData,
  setCurrentCartaPorteId,
}: UseCartaPorteSyncOptions) {
  
  const { crearCartaPorte, actualizarCartaPorte, isCreating, isUpdating, cartasPorte } = useCartasPorte();
  const { guardarUbicaciones } = useUbicacionesPersistence(currentCartaPorteId);
  const { guardarMercancias } = useMercanciasPersistence(currentCartaPorteId);

  // Cargar datos existentes si estamos editando
  useEffect(() => {
    if (cartaPorteId && cartasPorte.length > 0) {
      try {
        const cartaExistente = cartasPorte.find(carta => carta.id === cartaPorteId);
        
        if (cartaExistente) {
          console.log('[CartaPorteSync] Loading existing carta porte:', cartaPorteId);
          setFormData({
            tipoCreacion: 'manual',
            tipoCfdi: cartaExistente.tipo_cfdi as 'Ingreso' | 'Traslado' || 'Traslado',
            rfcEmisor: cartaExistente.rfc_emisor || '',
            nombreEmisor: cartaExistente.nombre_emisor || '',
            rfcReceptor: cartaExistente.rfc_receptor || '',
            nombreReceptor: cartaExistente.nombre_receptor || '',
            transporteInternacional: cartaExistente.transporte_internacional || false,
            registroIstmo: cartaExistente.registro_istmo || false,
            entrada_salida_merc: cartaExistente.entrada_salida_merc || '',
            pais_origen_destino: cartaExistente.pais_origen_destino || '',
            via_entrada_salida: cartaExistente.via_entrada_salida || '',
            ubicaciones: [],
            mercancias: [],
            autotransporte: {},
            figuras: [],
            cartaPorteId: cartaExistente.id,
          });
          setCurrentCartaPorteId(cartaExistente.id);
        }
      } catch (error) {
        console.error('[CartaPorteSync] Error loading existing carta porte:', error);
      }
    }
  }, [cartaPorteId, cartasPorte, setFormData, setCurrentCartaPorteId]);

  // Debounced creation con manejo de errores mejorado
  const createCartaPorteDebounced = useCallback(() => {
    let timeoutId: NodeJS.Timeout;
    
    const createFn = async () => {
      if (formData.rfcEmisor && formData.rfcReceptor && !currentCartaPorteId && !cartaPorteId && !isCreating) {
        try {
          console.log('[CartaPorteSync] Creating new carta porte');
          const cartaPortePayload = {
            tipo_cfdi: formData.tipoCfdi,
            rfc_emisor: formData.rfcEmisor,
            nombre_emisor: formData.nombreEmisor,
            rfc_receptor: formData.rfcReceptor,
            nombre_receptor: formData.nombreReceptor,
            transporte_internacional: formData.transporteInternacional,
            registro_istmo: formData.registroIstmo,
            entrada_salida_merc: formData.entrada_salida_merc,
            pais_origen_destino: formData.pais_origen_destino,
            via_entrada_salida: formData.via_entrada_salida,
          };

          const nuevaCartaPorte = await crearCartaPorte(cartaPortePayload);
          setCurrentCartaPorteId(nuevaCartaPorte.id);
          setFormData(prev => ({ ...prev, cartaPorteId: nuevaCartaPorte.id }));
          console.log('[CartaPorteSync] Carta porte created successfully:', nuevaCartaPorte.id);
        } catch (error) {
          console.error('[CartaPorteSync] Error creating carta porte:', error);
        }
      }
    };

    timeoutId = setTimeout(createFn, 3000);
    return () => clearTimeout(timeoutId);
  }, [formData.rfcEmisor, formData.rfcReceptor, currentCartaPorteId, cartaPorteId, isCreating, crearCartaPorte, setFormData, setCurrentCartaPorteId]);

  useEffect(() => {
    const cleanup = createCartaPorteDebounced();
    return cleanup;
  }, [createCartaPorteDebounced]);

  // Actualizar carta porte existente
  const updateCartaPorte = useCallback(async (data: any) => {
    if (currentCartaPorteId && !isUpdating) {
      const updateTimer = setTimeout(async () => {
        try {
          console.log('[CartaPorteSync] Updating existing carta porte:', currentCartaPorteId);
          const updatePayload = {
            tipo_cfdi: data.tipoCfdi,
            rfc_emisor: data.rfcEmisor,
            nombre_emisor: data.nombreEmisor,
            rfc_receptor: data.rfcReceptor,
            nombre_receptor: data.nombreReceptor,
            transporte_internacional: data.transporteInternacional,
            registro_istmo: data.registroIstmo,
            entrada_salida_merc: data.entrada_salida_merc,
            pais_origen_destino: data.pais_origen_destino,
            via_entrada_salida: data.via_entrada_salida,
          };
          
          await actualizarCartaPorte({ id: currentCartaPorteId, data: updatePayload });
        } catch (error) {
          console.error('[CartaPorteSync] Error updating carta porte:', error);
        }
      }, 3000);

      return () => clearTimeout(updateTimer);
    }
  }, [currentCartaPorteId, actualizarCartaPorte, isUpdating]);

  // Auto-guardar ubicaciones y mercancías con mejor control
  useEffect(() => {
    if (currentCartaPorteId && formData.ubicaciones.length > 0 && !isLoading) {
      const timer = setTimeout(async () => {
        try {
          console.log('[CartaPorteSync] Saving ubicaciones for carta porte:', currentCartaPorteId);
          await guardarUbicaciones(formData.ubicaciones);
        } catch (error) {
          console.error('[CartaPorteSync] Error saving ubicaciones:', error);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [formData.ubicaciones, currentCartaPorteId, guardarUbicaciones, isLoading]);

  useEffect(() => {
    if (currentCartaPorteId && formData.mercancias.length > 0 && !isLoading) {
      const timer = setTimeout(async () => {
        try {
          console.log('[CartaPorteSync] Saving mercancias for carta porte:', currentCartaPorteId);
          await guardarMercancias(formData.mercancias);
        } catch (error) {
          console.error('[CartaPorteSync] Error saving mercancias:', error);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [formData.mercancias, currentCartaPorteId, guardarMercancias, isLoading]);

  return {
    isCreating,
    isUpdating,
    updateCartaPorte,
  };
}
