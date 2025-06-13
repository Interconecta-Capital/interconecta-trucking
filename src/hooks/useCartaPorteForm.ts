
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCartasPorte } from '@/hooks/useCartasPorte';
import { useUbicacionesPersistence } from '@/hooks/useUbicacionesPersistence';
import { useMercanciasPersistence } from '@/hooks/useMercanciasPersistence';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useStatePersistence } from '@/hooks/useStatePeristence';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';

interface UseCartaPorteFormOptions {
  cartaPorteId?: string;
}

export function useCartaPorteForm({ cartaPorteId }: UseCartaPorteFormOptions = {}) {
  const [currentCartaPorteId, setCurrentCartaPorteId] = useState<string | undefined>(cartaPorteId);
  const [isLoading, setIsLoading] = useState(false);
  
  // Usar persistencia mejorada para mantener estado del formulario
  const [formData, setFormData] = useStatePersistence({
    tipoCreacion: 'manual',
    tipoCfdi: 'Traslado',
    rfcEmisor: '',
    nombreEmisor: '',
    rfcReceptor: '',
    nombreReceptor: '',
    transporteInternacional: false,
    registroIstmo: false,
    ubicaciones: [],
    mercancias: [],
    autotransporte: {},
    figuras: [],
  } as CartaPorteData, {
    key: `cartaporte-form-${currentCartaPorteId || 'new'}`,
    storage: 'sessionStorage'
  });

  const { crearCartaPorte, actualizarCartaPorte, isCreating, isUpdating, cartasPorte } = useCartasPorte();
  const { guardarUbicaciones } = useUbicacionesPersistence(currentCartaPorteId);
  const { guardarMercancias } = useMercanciasPersistence(currentCartaPorteId);

  // Auto-guardado más conservador con mejor control
  const { loadSavedData, clearSavedData } = useAutoSave({
    data: formData,
    key: `cartaporte-form-${currentCartaPorteId || 'new'}`,
    delay: 5000, // Reducido para mejor UX
    enabled: !!(formData.rfcEmisor && formData.rfcReceptor && !isLoading && !isCreating && !isUpdating),
    useSessionStorage: true,
  });

  // Cargar datos existentes si estamos editando
  useEffect(() => {
    if (cartaPorteId && cartasPorte.length > 0) {
      setIsLoading(true);
      try {
        const cartaExistente = cartasPorte.find(carta => carta.id === cartaPorteId);
        
        if (cartaExistente) {
          console.log('[CartaPorteForm] Loading existing carta porte:', cartaPorteId);
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
        console.error('[CartaPorteForm] Error loading existing carta porte:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [cartaPorteId, cartasPorte, setFormData]);

  // Debounced creation con manejo de errores mejorado
  const createCartaPorteDebounced = useCallback(() => {
    let timeoutId: NodeJS.Timeout;
    
    const createFn = async () => {
      if (formData.rfcEmisor && formData.rfcReceptor && !currentCartaPorteId && !cartaPorteId && !isCreating) {
        try {
          console.log('[CartaPorteForm] Creating new carta porte');
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
          console.log('[CartaPorteForm] Carta porte created successfully:', nuevaCartaPorte.id);
        } catch (error) {
          console.error('[CartaPorteForm] Error creating carta porte:', error);
        }
      }
    };

    timeoutId = setTimeout(createFn, 3000); // Reducido para mejor UX

    return () => clearTimeout(timeoutId);
  }, [formData.rfcEmisor, formData.rfcReceptor, currentCartaPorteId, cartaPorteId, isCreating, crearCartaPorte, setFormData]);

  useEffect(() => {
    const cleanup = createCartaPorteDebounced();
    return cleanup;
  }, [createCartaPorteDebounced]);

  const updateFormData = useCallback((section: string, data: any) => {
    console.log('[CartaPorteForm] Updating section:', section);
    
    if (section === 'configuracion') {
      const newData = { ...formData, ...data };
      setFormData(newData);
      
      // Actualizar carta porte existente con debounce más corto
      if (currentCartaPorteId && !isUpdating) {
        const updateTimer = setTimeout(async () => {
          try {
            console.log('[CartaPorteForm] Updating existing carta porte:', currentCartaPorteId);
            const updatePayload = {
              tipo_cfdi: newData.tipoCfdi,
              rfc_emisor: newData.rfcEmisor,
              nombre_emisor: newData.nombreEmisor,
              rfc_receptor: newData.rfcReceptor,
              nombre_receptor: newData.nombreReceptor,
              transporte_internacional: newData.transporteInternacional,
              registro_istmo: newData.registroIstmo,
              entrada_salida_merc: newData.entrada_salida_merc,
              pais_origen_destino: newData.pais_origen_destino,
              via_entrada_salida: newData.via_entrada_salida,
            };
            
            await actualizarCartaPorte({ id: currentCartaPorteId, data: updatePayload });
          } catch (error) {
            console.error('[CartaPorteForm] Error updating carta porte:', error);
          }
        }, 3000); // Reducido para mejor UX

        return () => clearTimeout(updateTimer);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: data,
      }));
    }
  }, [formData, currentCartaPorteId, actualizarCartaPorte, isUpdating, setFormData]);

  // Auto-guardar ubicaciones y mercancías con mejor control
  useEffect(() => {
    if (currentCartaPorteId && formData.ubicaciones.length > 0 && !isLoading) {
      const timer = setTimeout(async () => {
        try {
          console.log('[CartaPorteForm] Saving ubicaciones for carta porte:', currentCartaPorteId);
          await guardarUbicaciones(formData.ubicaciones);
        } catch (error) {
          console.error('[CartaPorteForm] Error saving ubicaciones:', error);
        }
      }, 3000); // Reducido

      return () => clearTimeout(timer);
    }
  }, [formData.ubicaciones, currentCartaPorteId, guardarUbicaciones, isLoading]);

  useEffect(() => {
    if (currentCartaPorteId && formData.mercancias.length > 0 && !isLoading) {
      const timer = setTimeout(async () => {
        try {
          console.log('[CartaPorteForm] Saving mercancias for carta porte:', currentCartaPorteId);
          await guardarMercancias(formData.mercancias);
        } catch (error) {
          console.error('[CartaPorteForm] Error saving mercancias:', error);
        }
      }, 3000); // Reducido

      return () => clearTimeout(timer);
    }
  }, [formData.mercancias, currentCartaPorteId, guardarMercancias, isLoading]);

  // Memoizar validaciones para evitar cálculos innecesarios
  const stepValidations = useMemo(() => ({
    configuracion: !!(formData.rfcEmisor && formData.rfcReceptor),
    ubicaciones: formData.ubicaciones.length >= 2,
    mercancias: formData.mercancias.length > 0,
    autotransporte: !!(formData.autotransporte && formData.autotransporte.placaVm),
    figuras: formData.figuras.length > 0,
  }), [formData]);

  const totalProgress = useMemo(() => {
    const completedSteps = Object.values(stepValidations).filter(Boolean).length;
    return (completedSteps / Object.keys(stepValidations).length) * 100;
  }, [stepValidations]);

  return {
    formData,
    currentCartaPorteId,
    isLoading,
    updateFormData,
    stepValidations,
    totalProgress,
    clearSavedData,
    isCreating,
    isUpdating,
  };
}
