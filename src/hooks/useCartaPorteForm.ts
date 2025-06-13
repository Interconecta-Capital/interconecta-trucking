
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

  // Auto-guardado optimizado usando sessionStorage para datos temporales
  const { loadSavedData, clearSavedData } = useAutoSave({
    data: formData,
    key: `cartaporte-form-${currentCartaPorteId || 'new'}`,
    delay: 3000,
    enabled: !!(formData.rfcEmisor || formData.rfcReceptor),
    useSessionStorage: true, // Usar sessionStorage en lugar de localStorage
  });

  // Cargar datos guardados solo al inicializar
  useEffect(() => {
    if (!cartaPorteId) {
      const savedFormData = loadSavedData();
      if (savedFormData && Object.keys(savedFormData).length > 0) {
        setFormData(prev => ({ ...prev, ...savedFormData }));
      }
    }
  }, [cartaPorteId, loadSavedData]);

  // Cargar datos existentes si estamos editando
  useEffect(() => {
    if (cartaPorteId && cartasPorte.length > 0) {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  }, [cartaPorteId, cartasPorte]);

  // Auto-crear carta porte solo cuando sea necesario
  useEffect(() => {
    if (formData.rfcEmisor && formData.rfcReceptor && !currentCartaPorteId && !cartaPorteId) {
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

      crearCartaPorte(cartaPortePayload)
        .then((nuevaCartaPorte) => {
          setCurrentCartaPorteId(nuevaCartaPorte.id);
          setFormData(prev => ({ ...prev, cartaPorteId: nuevaCartaPorte.id }));
        })
        .catch((error) => {
          console.error('Error al crear carta porte:', error);
        });
    }
  }, [formData.rfcEmisor, formData.rfcReceptor, currentCartaPorteId, cartaPorteId, crearCartaPorte]);

  const updateFormData = useCallback((section: string, data: any) => {
    if (section === 'configuracion') {
      const newData = { ...formData, ...data };
      setFormData(newData);
      
      // Actualizar carta porte si ya existe, con debounce
      if (currentCartaPorteId) {
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
        
        // Usar timeout para evitar múltiples actualizaciones
        setTimeout(() => {
          actualizarCartaPorte({ id: currentCartaPorteId, data: updatePayload });
        }, 1000);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: data,
      }));
    }
  }, [formData, currentCartaPorteId, actualizarCartaPorte]);

  // Auto-guardar ubicaciones y mercancías con menos frecuencia
  useEffect(() => {
    if (currentCartaPorteId && formData.ubicaciones.length > 0) {
      const timer = setTimeout(() => {
        guardarUbicaciones(formData.ubicaciones);
      }, 2000); // Aumentado de 1000 a 2000ms

      return () => clearTimeout(timer);
    }
  }, [formData.ubicaciones, currentCartaPorteId, guardarUbicaciones]);

  useEffect(() => {
    if (currentCartaPorteId && formData.mercancias.length > 0) {
      const timer = setTimeout(() => {
        guardarMercancias(formData.mercancias);
      }, 2000); // Aumentado de 1000 a 2000ms

      return () => clearTimeout(timer);
    }
  }, [formData.mercancias, currentCartaPorteId, guardarMercancias]);

  // Memoizar validaciones para evitar cálculos innecesarios
  const stepValidations = useMemo(() => ({
    configuracion: formData.rfcEmisor && formData.rfcReceptor,
    ubicaciones: formData.ubicaciones.length >= 2,
    mercancias: formData.mercancias.length > 0,
    autotransporte: formData.autotransporte.placaVm,
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
