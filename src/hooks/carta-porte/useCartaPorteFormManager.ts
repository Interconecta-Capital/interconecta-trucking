import { useState, useCallback, useEffect } from 'react';
import { CartaPorteData, AutotransporteCompleto, FiguraCompleta, MercanciaCompleta, UbicacionCompleta } from '@/types/cartaPorte';
import { BorradorService } from '@/services/borradorService';
import { useCartaPorteValidation } from './useCartaPorteValidation';
import { toast } from 'sonner';
import { useCartaPorteAutoSave } from './useCartaPorteAutoSave';
import { useBorradorRecovery } from './useBorradorRecovery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';

// Extender CartaPorteData para incluir datos persistidos
interface CartaPorteDataWithPersistence extends CartaPorteData {
  currentStep?: number;
  xmlGenerado?: string;
  datosCalculoRuta?: {
    distanciaTotal?: number;
    tiempoEstimado?: number;
    calculadoEn?: string;
  };
}

// Estado inicial unificado y por defecto
const initialCartaPorteData: CartaPorteData = {
  tipoCfdi: 'Traslado',
  transporteInternacional: 'No',
  version: '4.0',
  cartaPorteVersion: '3.1',
  rfcEmisor: '',
  nombreEmisor: '',
  rfcReceptor: '',
  nombreReceptor: '',
  ubicaciones: [],
  mercancias: [],
  autotransporte: {
    placa_vm: '',
    anio_modelo_vm: new Date().getFullYear(),
    config_vehicular: '',
    perm_sct: '',
    num_permiso_sct: '',
    asegura_resp_civil: '',
    poliza_resp_civil: '',
    remolques: []
  },
  figuras: [],
};

export function useCartaPorteFormManager(cartaPorteId?: string) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CartaPorteData>(initialCartaPorteData);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentCartaPorteId, setCurrentCartaPorteId] = useState<string | null>(cartaPorteId || null);
  const [borradorCargado, setBorradorCargado] = useState(false);
  const [ultimoGuardado, setUltimoGuardado] = useState<Date | null>(null);
  const [isGuardando, setIsGuardando] = useState(false);
  
  // Estados para datos persistidos
  const [xmlGenerado, setXmlGenerado] = useState<string | null>(null);
  const [datosCalculoRuta, setDatosCalculoRuta] = useState<{
    distanciaTotal?: number;
    tiempoEstimado?: number;
    calculadoEn?: string;
  } | null>(null);
  
  const { getValidationSummary } = useCartaPorteValidation();

  // Auto-save mejorado - CORREGIDO para que funcione
  const { isAutoSaving, lastSaved } = useCartaPorteAutoSave({
    formData: {
      ...formData,
      xmlGenerado,
      datosCalculoRuta
    } as CartaPorteDataWithPersistence,
    currentCartaPorteId: currentCartaPorteId || undefined,
    onCartaPorteIdChange: (id) => setCurrentCartaPorteId(id),
    enabled: true
  });

  // Recuperación de borrador
  const { showRecoveryDialog, borradorData, acceptBorrador, rejectBorrador } = useBorradorRecovery(cartaPorteId);

  // El resumen de validación ahora depende directamente del estado unificado
  const validationSummary = getValidationSummary(formData);

  // Cargar datos existentes al montar el componente
  useEffect(() => {
    if (currentCartaPorteId && !borradorCargado) {
      loadCartaPorteData(currentCartaPorteId);
    }
  }, [currentCartaPorteId]);

  const loadCartaPorteData = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('cartas_porte')
        .select('datos_formulario')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data?.datos_formulario) {
        const savedData = data.datos_formulario as CartaPorteDataWithPersistence;
        
        // Restaurar datos del formulario
        setFormData({
          ...initialCartaPorteData,
          ...savedData
        });

        // Restaurar estados persistidos
        if (savedData.xmlGenerado) {
          setXmlGenerado(savedData.xmlGenerado);
        }
        
        if (savedData.datosCalculoRuta) {
          setDatosCalculoRuta(savedData.datosCalculoRuta);
        }

        if (savedData.currentStep !== undefined) {
          setCurrentStep(savedData.currentStep);
        }

        setBorradorCargado(true);
      }
    } catch (error) {
      console.error('Error cargando datos de carta porte:', error);
    }
  }, []);

  // Handler de cambio unificado y estable
  const handleConfiguracionChange = useCallback((updates: Partial<CartaPorteData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Setters estables para cada sección del formulario
  const setUbicaciones = useCallback((ubicaciones: UbicacionCompleta[]) => {
    setFormData(prev => ({ ...prev, ubicaciones }));
  }, []);

  const setMercancias = useCallback((mercancias: MercanciaCompleta[]) => {
    setFormData(prev => ({ ...prev, mercancias }));
  }, []);
  
  const setAutotransporte = useCallback((autotransporte: AutotransporteCompleto) => {
    setFormData(prev => ({ ...prev, autotransporte }));
  }, []);

  const setFiguras = useCallback((figuras: FiguraCompleta[]) => {
    setFormData(prev => ({ ...prev, figuras }));
  }, []);

  // Funciones para manejar XML generado
  const handleXMLGenerated = useCallback((xml: string) => {
    setXmlGenerado(xml);
    // Auto-guardar cuando se genera XML
    handleGuardarCartaPorteOficial();
  }, []);

  // Funciones para manejar cálculos de ruta
  const handleCalculoRutaUpdate = useCallback((datos: {
    distanciaTotal?: number;
    tiempoEstimado?: number;
  }) => {
    setDatosCalculoRuta({
      ...datos,
      calculadoEn: new Date().toISOString()
    });
    // Auto-guardar cuando se actualiza cálculo de ruta
    handleGuardarCartaPorteOficial();
  }, []);

  // Manejar aceptación de borrador
  const handleAcceptBorrador = useCallback(() => {
    const { data, id } = acceptBorrador();
    if (data) {
      const savedData = data as CartaPorteDataWithPersistence;
      setFormData(savedData);
      setCurrentCartaPorteId(id);
      setBorradorCargado(true);
      
      // Restaurar datos persistidos
      if (savedData.xmlGenerado) {
        setXmlGenerado(savedData.xmlGenerado);
      }
      
      if (savedData.datosCalculoRuta) {
        setDatosCalculoRuta(savedData.datosCalculoRuta);
      }
      
      if (savedData.currentStep !== undefined) {
        setCurrentStep(savedData.currentStep);
      }
    }
  }, [acceptBorrador]);

  // Manejar rechazo de borrador
  const handleRejectBorrador = useCallback(() => {
    rejectBorrador();
    setFormData(initialCartaPorteData);
    setCurrentStep(0);
    setCurrentCartaPorteId(null);
    setBorradorCargado(false);
    setXmlGenerado(null);
    setDatosCalculoRuta(null);
  }, [rejectBorrador]);
  
  // Guardar como carta porte oficial (no borrador) - MEJORADO
  const handleGuardarCartaPorteOficial = useCallback(async () => {
    if (!user?.id) {
      toast.error('Usuario no autenticado');
      return;
    }

    if (isGuardando) return;
    
    setIsGuardando(true);
    try {
      // Preparar datos completos incluyendo XML y cálculos de ruta
      const datosCompletos: CartaPorteDataWithPersistence = {
        ...formData,
        currentStep,
        xmlGenerado,
        datosCalculoRuta
      };
      
      // Preparar datos para la carta porte oficial
      const cartaPorteData = {
        folio: currentCartaPorteId ? undefined : `CP-${Date.now().toString().slice(-8)}`,
        tipo_cfdi: formData.tipoCfdi || 'Traslado',
        rfc_emisor: formData.rfcEmisor || 'TEMP',
        nombre_emisor: formData.nombreEmisor || 'Sin nombre',
        rfc_receptor: formData.rfcReceptor || 'TEMP', 
        nombre_receptor: formData.nombreReceptor || 'Sin nombre',
        transporte_internacional: Boolean(formData.transporteInternacional === 'Sí' || formData.transporteInternacional === true),
        registro_istmo: Boolean(formData.registroIstmo),
        status: xmlGenerado ? 'generado' : 'borrador',
        datos_formulario: datosCompletos,
        usuario_id: user.id,
        updated_at: new Date().toISOString()
      };

      let savedId = currentCartaPorteId;

      if (currentCartaPorteId) {
        // Actualizar carta porte existente
        console.log('Actualizando carta porte existente:', currentCartaPorteId);
        const { error } = await supabase
          .from('cartas_porte')
          .update(cartaPorteData)
          .eq('id', currentCartaPorteId)
          .eq('usuario_id', user.id);

        if (error) {
          console.error('Error actualizando carta porte:', error);
          throw error;
        }
      } else {
        // Crear nueva carta porte
        console.log('Creando nueva carta porte');
        const { data: nuevaCarta, error } = await supabase
          .from('cartas_porte')
          .insert({
            ...cartaPorteData,
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error creando carta porte:', error);
          throw error;
        }
        
        if (nuevaCarta?.id) {
          savedId = nuevaCarta.id;
          setCurrentCartaPorteId(nuevaCarta.id);
          console.log('Nueva carta porte creada:', nuevaCarta.id);
        }
      }
      
      setUltimoGuardado(new Date());
      toast.success('Carta porte guardada correctamente');
      
      return savedId;
    } catch (error: any) {
      console.error('Error guardando carta porte:', error);
      toast.error(`Error al guardar: ${error.message || 'Error desconocido'}`);
      throw error;
    } finally {
      setIsGuardando(false);
    }
  }, [formData, currentStep, xmlGenerado, datosCalculoRuta, currentCartaPorteId, user?.id, isGuardando]);

  // Guardar y salir - mejorado
  const handleGuardarYSalir = useCallback(async () => {
    try {
      await handleGuardarCartaPorteOficial();
      // Pequeño delay antes de navegar para asegurar que se guardó
      setTimeout(() => {
        window.location.href = '/cartas-porte';
      }, 1000);
    } catch (error) {
      console.error('Error guardando carta porte:', error);
      // No navegar si hay error
    }
  }, [handleGuardarCartaPorteOficial]);

  // Mejorar el guardado de borrador
  const handleGuardarBorrador = useCallback(async () => {
    if (isGuardando) return;
    
    setIsGuardando(true);
    try {
      const datosCompletos: CartaPorteDataWithPersistence = {
        ...formData,
        currentStep,
        xmlGenerado,
        datosCalculoRuta
      };
      
      // Usar la función oficial de guardado para asegurar consistencia
      const nuevoId = await handleGuardarCartaPorteOficial();
      
      if (nuevoId && nuevoId !== currentCartaPorteId) {
        setCurrentCartaPorteId(nuevoId);
      }
      
      setBorradorCargado(true);
      setUltimoGuardado(new Date());
      toast.success('Borrador guardado correctamente');
    } catch (error: any) {
      console.error('Error guardando borrador:', error);
      toast.error(`Error al guardar el borrador: ${error.message || 'Error desconocido'}`);
    } finally {  
      setIsGuardando(false);
    }
  }, [formData, currentStep, xmlGenerado, datosCalculoRuta, currentCartaPorteId, isGuardando, handleGuardarCartaPorteOficial]);

  // Actualizar último guardado cuando hay auto-save
  useEffect(() => {
    if (lastSaved) {
      setUltimoGuardado(lastSaved);
    }
  }, [lastSaved]);

  return {
    // Estado unificado
    configuracion: formData,
    ubicaciones: formData.ubicaciones,
    mercancias: formData.mercancias,
    autotransporte: formData.autotransporte,
    figuras: formData.figuras,
    
    // Estado de la UI
    currentStep,
    currentCartaPorteId,
    borradorCargado,
    ultimoGuardado,
    validationSummary,
    isGuardando: isGuardando || isAutoSaving,
    
    // Estados persistidos
    xmlGenerado,
    datosCalculoRuta,
    
    // Dialog de recuperación
    showRecoveryDialog,
    borradorData,
    handleAcceptBorrador,
    handleRejectBorrador,
    
    // Setters y Handlers estables
    setUbicaciones,
    setMercancias,
    setAutotransporte,
    setFiguras,
    setCurrentStep,
    handleConfiguracionChange,
    handleGuardarBorrador,
    handleGuardarCartaPorteOficial,
    handleGuardarYSalir,
    handleLimpiarBorrador,
    
    // Nuevos handlers para datos persistidos
    handleXMLGenerated,
    handleCalculoRutaUpdate,
  };
}
