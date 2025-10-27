import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartaPorteData, AutotransporteCompleto, FiguraCompleta, MercanciaCompleta, UbicacionCompleta } from '@/types/cartaPorte';
import { useCartaPorteValidation } from './useCartaPorteValidation';
import { useCartaPortePersistence } from './useCartaPortePersistence';
import { toast } from 'sonner';
import { useCartaPorteAutoSave } from './useCartaPorteAutoSave';
import { useBorradorRecovery } from './useBorradorRecovery';
import { useAuth } from '../useAuth';
import { UUIDService } from '@/services/uuid/UUIDService';
import { CartaPorteLifecycleManager } from '@/services/cartaPorte/CartaPorteLifecycleManager';
import { supabase } from '@/integrations/supabase/client';

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
    asegura_med_ambiente: '',
    poliza_med_ambiente: '',
    peso_bruto_vehicular: 0,
    tipo_carroceria: '',
    remolques: []
  },
  figuras: [],
  currentStep: 0,
  xmlGenerado: undefined,
  datosCalculoRuta: undefined,
};

export function useCartaPorteFormManager(cartaPorteId?: string) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CartaPorteData>(initialCartaPorteData);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentCartaPorteId, setCurrentCartaPorteId] = useState<string | null>(cartaPorteId || null);
  const [borradorCargado, setBorradorCargado] = useState(false);
  const [ultimoGuardado, setUltimoGuardado] = useState<Date | null>(null);
  const [isGuardando, setIsGuardando] = useState(false);
  const [idCCP, setIdCCP] = useState<string>('');
  
  // Estados para datos persistidos
  const {
    xmlGenerado,
    datosCalculoRuta,
    saveXML,
    saveRouteData,
    clearSessionData
  } = useCartaPortePersistence(currentCartaPorteId || undefined);
  
  const { getValidationSummary } = useCartaPorteValidation();

  // Auto-save mejorado
  const { isAutoSaving, lastSaved } = useCartaPorteAutoSave({
    formData: {
      ...formData,
      xmlGenerado,
      datosCalculoRuta,
      currentStep
    },
    currentCartaPorteId: currentCartaPorteId || undefined,
    onCartaPorteIdChange: (id) => setCurrentCartaPorteId(id),
    enabled: true
  });

  // Recuperación de borrador
  const { showRecoveryDialog, borradorData, acceptBorrador, rejectBorrador } = useBorradorRecovery(cartaPorteId);

  // Generate IdCCP when creating new carta porte
  useEffect(() => {
    if (!currentCartaPorteId && !idCCP) {
      const newIdCCP = UUIDService.generateValidIdCCP();
      setIdCCP(newIdCCP);
      console.log('[CartaPorteForm] IdCCP generado automáticamente:', newIdCCP);
    }
  }, [currentCartaPorteId, idCCP]);

  // El resumen de validación
  const validationSummary = getValidationSummary(formData);

  // Cargar datos existentes al montar el componente
  useEffect(() => {
    if (currentCartaPorteId && !borradorCargado) {
      loadCartaPorteData(currentCartaPorteId);
    }
  }, [currentCartaPorteId]);

  // Sincronizar estados locales con formData
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      xmlGenerado,
      datosCalculoRuta,
      currentStep
    }));
  }, [xmlGenerado, datosCalculoRuta, currentStep]);

  const loadCartaPorteData = useCallback(async (id: string) => {
    try {
      console.log('🔄 Cargando datos:', id);
      
      // Primero intentar cargar como borrador
      const borrador = await CartaPorteLifecycleManager.cargarBorrador(id);
      if (borrador) {
        console.log('✅ Borrador cargado:', borrador.id);
        
        let savedData = {
          ...borrador.datos_formulario,
          currentStep: borrador.datos_formulario?.currentStep || 0
        };

        // FASE 5: Si el borrador proviene de un viaje, enriquecer con datos del viaje
        try {
          const { data: viaje } = await supabase
            .from('viajes')
            .select('*')
            .eq('tracking_data->>borrador_carta_porte_id', borrador.id)
            .single();

          if (viaje) {
            console.log('✅ Borrador vinculado a viaje, cargando datos del cliente...');
            
            // Cargar datos del cliente desde tracking_data
            const trackingData = viaje.tracking_data as any;
            const datosCliente = trackingData?.datos_cliente;
            
            if (datosCliente) {
              // Enriquecer con datos del cliente almacenados
              savedData = {
                ...savedData,
                rfcReceptor: savedData.rfcReceptor || datosCliente.rfc || '',
                nombreReceptor: savedData.nombreReceptor || datosCliente.nombre || '',
                // Agregar metadatos del viaje
                metadata: {
                  ...savedData.metadata,
                  viaje_id: viaje.id,
                  origen_viaje: true,
                  viaje_origen: viaje.origen,
                  viaje_destino: viaje.destino
                }
              };

              console.log('✅ Datos enriquecidos con información del viaje');
            }
          }
        } catch (viajeError) {
          console.log('ℹ️ No se encontró viaje vinculado al borrador (es normal si se creó manualmente)');
        }
        
        setFormData(savedData);

        // Persistir datos en sesión
        if (savedData.xmlGenerado) {
          saveXML(savedData.xmlGenerado);
        }
        
        if (savedData.datosCalculoRuta) {
          saveRouteData(savedData.datosCalculoRuta);
        }

        if (savedData.currentStep !== undefined) {
          setCurrentStep(savedData.currentStep);
        }

        setBorradorCargado(true);
        return;
      }

      // Si no es borrador, intentar cargar como carta porte
      const cartaPorte = await CartaPorteLifecycleManager.obtenerCartaPorte(id);
      if (cartaPorte) {
        console.log('✅ Carta porte cargada:', cartaPorte.id);
        
        const savedData = {
          ...cartaPorte.datos_formulario,
          currentStep: cartaPorte.datos_formulario?.currentStep || 0
        };
        
        setFormData(savedData);
        setIdCCP(cartaPorte.id_ccp);
        setBorradorCargado(true);
      }
      
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    }
  }, [saveXML, saveRouteData]);

  // Handler de cambio unificado
  const handleConfiguracionChange = useCallback((updates: Partial<CartaPorteData>) => {
    console.log('🔄 Actualizando configuración:', updates);
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

  // Crear un objeto Autotransporte por defecto
  const defaultAutotransporte: AutotransporteCompleto = {
    placa_vm: '',
    anio_modelo_vm: new Date().getFullYear(),
    config_vehicular: '',
    perm_sct: '',
    num_permiso_sct: '',
    asegura_resp_civil: '',
    poliza_resp_civil: '',
    asegura_med_ambiente: '',
    poliza_med_ambiente: '',
    peso_bruto_vehicular: 0,
    tipo_carroceria: '',
    remolques: []
  };

  // Funciones para manejar XML generado
  const handleXMLGenerated = useCallback((xml: string) => {
    console.log('📄 XML generado, guardando...');
    saveXML(xml);
    setTimeout(() => handleGuardarCartaPorteOficial(), 100);
  }, [saveXML]);

  // Funciones para manejar cálculos de ruta
  const handleCalculoRutaUpdate = useCallback((datos: {
    distanciaTotal?: number;
    tiempoEstimado?: number;
  }) => {
    console.log('🗺️ Actualizando cálculo de ruta:', datos);
    const newDatosRuta = {
      ...datos,
      calculadoEn: new Date().toISOString()
    };
    
    saveRouteData(newDatosRuta);
    
    setFormData(prev => ({
      ...prev,
      datosCalculoRuta: newDatosRuta
    }));
    
    setTimeout(() => handleGuardarCartaPorteOficial(), 100);
  }, [saveRouteData]);

  // Manejar aceptación de borrador
  const handleAcceptBorrador = useCallback(() => {
    const { data, id } = acceptBorrador();
    if (data) {
      setFormData(data);
      setCurrentCartaPorteId(id);
      setBorradorCargado(true);
      
      if (data.xmlGenerado) {
        saveXML(data.xmlGenerado);
      }
      
      if (data.datosCalculoRuta) {
        saveRouteData(data.datosCalculoRuta);
      }
      
      if (data.currentStep !== undefined) {
        setCurrentStep(data.currentStep);
      }
    }
  }, [acceptBorrador, saveXML, saveRouteData]);

  // Manejar rechazo de borrador
  const handleRejectBorrador = useCallback(() => {
    rejectBorrador();
    setFormData(initialCartaPorteData);
    setCurrentStep(0);
    setCurrentCartaPorteId(null);
    setBorradorCargado(false);
    clearSessionData();
  }, [rejectBorrador, clearSessionData]);
  
  // Guardar como borrador usando el nuevo sistema
  const handleGuardarBorrador = useCallback(async (): Promise<string> => {
    if (isGuardando) return '';
    
    setIsGuardando(true);
    try {
      const datosCompletos = {
        ...formData,
        currentStep,
        xmlGenerado,
        datosCalculoRuta
      };

      let savedId: string;
      
      if (currentCartaPorteId) {
        // Actualizar borrador existente
        await CartaPorteLifecycleManager.guardarBorrador(currentCartaPorteId, {
          datos_formulario: datosCompletos,
          auto_saved: false
        });
        savedId = currentCartaPorteId;
      } else {
        // Crear nuevo borrador
        const nuevoBorrador = await CartaPorteLifecycleManager.crearBorrador({
          nombre_borrador: `Borrador ${new Date().toLocaleDateString()}`,
          datos_formulario: datosCompletos,
          version_formulario: '3.1'
        });
        savedId = nuevoBorrador.id;
        setCurrentCartaPorteId(savedId);
      }
      
      setUltimoGuardado(new Date());
      toast.success('Borrador guardado correctamente');
      
      return savedId;
    } catch (error) {
      console.error('Error guardando borrador:', error);
      toast.error('Error al guardar el borrador');
      throw error;
    } finally {
      setIsGuardando(false);
    }
  }, [formData, currentStep, xmlGenerado, datosCalculoRuta, currentCartaPorteId, isGuardando]);

  // Guardar como carta porte oficial usando el nuevo sistema
  const handleGuardarCartaPorteOficial = useCallback(async (): Promise<string> => {
    if (!user?.id || isGuardando) return '';
    
    setIsGuardando(true);
    try {
      const datosCompletos = {
        ...formData,
        currentStep,
        xmlGenerado,
        datosCalculoRuta
      };

      let savedId: string;

      if (currentCartaPorteId) {
        // Si ya tenemos un ID, convertir borrador a carta porte
        const cartaPorte = await CartaPorteLifecycleManager.convertirBorradorACartaPorte({
          borradorId: currentCartaPorteId,
          nombre_documento: formData.nombreEmisor ? 
            `Carta Porte - ${formData.nombreEmisor}` : 
            'Carta Porte',
          validarDatos: true
        });
        savedId = cartaPorte.id;
        setIdCCP(cartaPorte.id_ccp);
      } else {
        // Crear nuevo borrador y luego convertirlo
        const nuevoBorrador = await CartaPorteLifecycleManager.crearBorrador({
          nombre_borrador: 'Borrador temporal',
          datos_formulario: datosCompletos,
          version_formulario: '3.1'
        });
        
        const cartaPorte = await CartaPorteLifecycleManager.convertirBorradorACartaPorte({
          borradorId: nuevoBorrador.id,
          nombre_documento: formData.nombreEmisor ? 
            `Carta Porte - ${formData.nombreEmisor}` : 
            'Carta Porte',
          validarDatos: false // Skip validation for auto-generated
        });
        
        savedId = cartaPorte.id;
        setIdCCP(cartaPorte.id_ccp);
        setCurrentCartaPorteId(savedId);
      }
      
      setUltimoGuardado(new Date());
      toast.success('Carta porte guardada correctamente');
      
      return savedId;
    } catch (error) {
      console.error('❌ Error guardando carta porte:', error);
      toast.error('Error al guardar la carta porte');
      throw error;
    } finally {
      setIsGuardando(false);
    }
  }, [formData, currentStep, xmlGenerado, datosCalculoRuta, currentCartaPorteId, user?.id, isGuardando]);

  // Guardar y salir
  const handleGuardarYSalir = useCallback(async (): Promise<void> => {
    try {
      console.log('💾🚪 Guardando y saliendo...');
      const savedId = await handleGuardarCartaPorteOficial();
      
      if (savedId) {
        clearSessionData();
        toast.success('Carta porte guardada exitosamente');
        
        setTimeout(() => {
          navigate('/borradores', { replace: true });
        }, 1000);
      }
      
    } catch (error) {
      console.error('❌ Error guardando:', error);
      toast.error('Error al guardar. Verifica los datos.');
    }
  }, [handleGuardarCartaPorteOficial, navigate, clearSessionData]);

  // Limpiar borrador
  const handleLimpiarBorrador = useCallback(async () => {
    try {
      if (currentCartaPorteId) {
        await CartaPorteLifecycleManager.eliminarBorrador(currentCartaPorteId);
      }
      
      setFormData(initialCartaPorteData);
      setCurrentStep(0);
      setCurrentCartaPorteId(null);
      setBorradorCargado(false);
      setUltimoGuardado(null);
      clearSessionData();
      
      toast.success('Borrador eliminado correctamente');
    } catch (error) {
      console.error('Error limpiando borrador:', error);
      toast.error('Error al eliminar el borrador');
    }
  }, [currentCartaPorteId, clearSessionData]);

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
    autotransporte: formData.autotransporte || defaultAutotransporte,
    figuras: formData.figuras,
    
    // Estado de la UI
    currentStep,
    currentCartaPorteId,
    idCCP,
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
