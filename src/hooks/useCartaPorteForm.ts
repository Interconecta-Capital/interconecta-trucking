
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCartasPorte } from '@/hooks/useCartasPorte';
import { useUbicacionesPersistence } from '@/hooks/useUbicacionesPersistence';
import { useMercanciasPersistence } from '@/hooks/useMercanciasPersistence';
import { useAutoSave } from '@/hooks/useAutoSave';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';

interface UseCartaPorteFormOptions {
  cartaPorteId?: string;
}

export function useCartaPorteForm({ cartaPorteId }: UseCartaPorteFormOptions = {}) {
  const [currentCartaPorteId, setCurrentCartaPorteId] = useState<string | undefined>(cartaPorteId);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CartaPorteData>({
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
  });

  const { crearCartaPorte, actualizarCartaPorte, isCreating, isUpdating, cartasPorte } = useCartasPorte();
  const { guardarUbicaciones } = useUbicacionesPersistence(currentCartaPorteId);
  const { guardarMercancias } = useMercanciasPersistence(currentCartaPorteId);

  // Auto-guardado más conservador
  const { loadSavedData, clearSavedData } = useAutoSave({
    data: formData,
    key: `cartaporte-form-${currentCartaPorteId || 'new'}`,
    delay: 8000, // Aumentado a 8 segundos
    enabled: !!(formData.rfcEmisor && formData.rfcReceptor && !isLoading),
    useSessionStorage: true,
  });

  // Cargar datos guardados solo una vez al inicializar
  useEffect(() => {
    if (!cartaPorteId) {
      try {
        const savedFormData = loadSavedData();
        if (savedFormData && typeof savedFormData === 'object' && Object.keys(savedFormData).length > 0) {
          setFormData(prev => ({ ...prev, ...savedFormData }));
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, [cartaPorteId]); // Removido loadSavedData de deps para evitar re-renders

  // Cargar datos existentes si estamos editando
  useEffect(() => {
    if (cartaPorteId && cartasPorte.length > 0) {
      setIsLoading(true);
      try {
        const cartaExistente = cartasPorte.find(carta => carta.id === cartaPorteId);
        
        if (cartaExistente) {
          setFormData(prev => ({
            ...prev,
            rfcEmisor: cartaExistente.rfc_emisor || '',
            nombreEmisor: cartaExistente.nombre_emisor || '',
            rfcReceptor: cartaExistente.rfc_receptor || '',
            nombreReceptor: cartaExistente.nombre_receptor || '',
            tipoCfdi: cartaExistente.tipo_cfdi as 'Ingreso' | 'Traslado' || 'Traslado',
            transporteInternacional: cartaExistente.transporte_internacional || false,
            registroIstmo: cartaExistente.registro_istmo || false,
            entrada_salida_merc: cartaExistente.entrada_salida_merc || '',
            pais_origen_destino: cartaExistente.pais_origen_destino || '',
            via_entrada_salida: cartaExistente.via_entrada_salida || '',
            cartaPorteId: cartaExistente.id,
          }));
          setCurrentCartaPorteId(cartaExistente.id);
        }
      } catch (error) {
        console.error('Error loading existing carta porte:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [cartaPorteId, cartasPorte]);

  // Debounced creation - solo crear cuando realmente sea necesario
  const createCartaPorteDebounced = useCallback(() => {
    const timer = setTimeout(async () => {
      if (formData.rfcEmisor && formData.rfcReceptor && !currentCartaPorteId && !cartaPorteId) {
        try {
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
        } catch (error) {
          console.error('Error al crear carta porte:', error);
        }
      }
    }, 3000); // 3 segundos de debounce

    return () => clearTimeout(timer);
  }, [formData.rfcEmisor, formData.rfcReceptor, currentCartaPorteId, cartaPorteId, crearCartaPorte]);

  useEffect(() => {
    const cleanup = createCartaPorteDebounced();
    return cleanup;
  }, [createCartaPorteDebounced]);

  const updateFormData = useCallback((section: string, data: any) => {
    if (section === 'configuracion') {
      const newData = { ...formData, ...data };
      setFormData(newData);
      
      // Actualizar carta porte existente con menos frecuencia
      if (currentCartaPorteId) {
        const updateTimer = setTimeout(async () => {
          try {
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
            console.error('Error updating carta porte:', error);
          }
        }, 5000); // 5 segundos de debounce

        return () => clearTimeout(updateTimer);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: data,
      }));
    }
  }, [formData, currentCartaPorteId, actualizarCartaPorte]);

  // Auto-guardar ubicaciones y mercancías con menos frecuencia y mejor manejo de errores
  useEffect(() => {
    if (currentCartaPorteId && formData.ubicaciones.length > 0) {
      const timer = setTimeout(async () => {
        try {
          await guardarUbicaciones(formData.ubicaciones);
        } catch (error) {
          console.error('Error saving ubicaciones:', error);
        }
      }, 4000); // Aumentado a 4 segundos

      return () => clearTimeout(timer);
    }
  }, [formData.ubicaciones, currentCartaPorteId, guardarUbicaciones]);

  useEffect(() => {
    if (currentCartaPorteId && formData.mercancias.length > 0) {
      const timer = setTimeout(async () => {
        try {
          await guardarMercancias(formData.mercancias);
        } catch (error) {
          console.error('Error saving mercancias:', error);
        }
      }, 4000); // Aumentado a 4 segundos

      return () => clearTimeout(timer);
    }
  }, [formData.mercancias, currentCartaPorteId, guardarMercancias]);

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
