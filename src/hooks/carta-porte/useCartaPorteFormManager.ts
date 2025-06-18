
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartaPorteData, AutotransporteCompleto, FiguraCompleta, MercanciaCompleta, UbicacionCompleta } from '@/types/cartaPorte';
import { BorradorService } from '@/services/borradorService';
import { useCartaPorteValidation } from './useCartaPorteValidation';
import { toast } from 'sonner';
import { useCartaPorteAutoSave } from './useCartaPorteAutoSave';
import { useBorradorRecovery } from './useBorradorRecovery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';

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
  
  // Estados para datos persistidos (ahora como parte del formData)
  const [xmlGenerado, setXmlGenerado] = useState<string | null>(formData.xmlGenerado || null);
  const [datosCalculoRuta, setDatosCalculoRuta] = useState<{
    distanciaTotal?: number;
    tiempoEstimado?: number;
    calculadoEn?: string;
  } | null>(formData.datosCalculoRuta || null);
  
  const { getValidationSummary } = useCartaPorteValidation();

  // Auto-save mejorado que incluye XML y cálculos de ruta
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

  // El resumen de validación ahora depende directamente del estado unificado
  const validationSummary = getValidationSummary(formData);

  // Cargar datos existentes al montar el componente
  useEffect(() => {
    if (currentCartaPorteId && !borradorCargado) {
      loadCartaPorteData(currentCartaPorteId);
    }
  }, [currentCartaPorteId]);

  // Sincronizar estados locales con formData cuando cambian
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
      console.log('🔄 Cargando datos de carta porte:', id);
      const { data, error } = await supabase
        .from('cartas_porte')
        .select('datos_formulario')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data?.datos_formulario) {
        const savedData = data.datos_formulario as CartaPorteData;
        
        console.log('✅ Datos cargados exitosamente:', {
          hasXML: !!savedData.xmlGenerado,
          hasRouteData: !!savedData.datosCalculoRuta,
          currentStep: savedData.currentStep
        });
        
        // Restaurar todos los datos incluidos XML y cálculos de ruta
        setFormData({
          ...initialCartaPorteData,
          ...savedData
        });

        // Restaurar estados locales desde los datos persistidos
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
      console.error('❌ Error cargando datos de carta porte:', error);
      toast.error('Error al cargar los datos de la carta porte');
    }
  }, []);

  // Handler de cambio unificado y estable
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

  // Crear un objeto Autotransporte por defecto para evitar errores de tipo
  const defaultAutotransporte = {
    placa_vm: '',
    anio_modelo_vm: new Date().getFullYear(),
    config_vehicular: '',
    perm_sct: '',
    num_permiso_sct: '',
    asegura_resp_civil: '',
    poliza_resp_civil: '',
    remolques: []
  };

  // Funciones para manejar XML generado con persistencia
  const handleXMLGenerated = useCallback((xml: string) => {
    console.log('📄 XML generado, guardando en estado...');
    setXmlGenerado(xml);
    // Auto-guardar inmediatamente cuando se genera XML
    setTimeout(() => handleGuardarCartaPorteOficial(), 100);
  }, []);

  // Funciones para manejar cálculos de ruta con persistencia
  const handleCalculoRutaUpdate = useCallback((datos: {
    distanciaTotal?: number;
    tiempoEstimado?: number;
  }) => {
    console.log('🗺️ Actualizando cálculo de ruta:', datos);
    const newDatosRuta = {
      ...datos,
      calculadoEn: new Date().toISOString()
    };
    setDatosCalculoRuta(newDatosRuta);
    // Auto-guardar cuando se actualiza cálculo de ruta
    setTimeout(() => handleGuardarCartaPorteOficial(), 100);
  }, []);

  // Manejar aceptación de borrador
  const handleAcceptBorrador = useCallback(() => {
    const { data, id } = acceptBorrador();
    if (data) {
      const savedData = data as CartaPorteData;
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
  
  // Guardar como carta porte oficial (mejorado con persistencia completa)
  const handleGuardarCartaPorteOficial = useCallback(async () => {
    if (!user?.id) {
      toast.error('Usuario no autenticado');
      return;
    }

    if (isGuardando) return;
    
    console.log('💾 Iniciando guardado de carta porte oficial...');
    setIsGuardando(true);
    
    try {
      // Preparar datos completos con estado actual
      const datosCompletos: CartaPorteData = {
        ...formData,
        currentStep,
        xmlGenerado,
        datosCalculoRuta
      };
      
      console.log('📊 Datos a guardar:', {
        hasXML: !!datosCompletos.xmlGenerado,
        hasRouteData: !!datosCompletos.datosCalculoRuta,
        currentStep: datosCompletos.currentStep,
        ubicacionesCount: datosCompletos.ubicaciones?.length || 0,
        mercanciasCount: datosCompletos.mercancias?.length || 0
      });

      // Generar folio único si no existe
      const folio = `CP-${Date.now().toString().slice(-8)}`;
      
      // Preparar datos para la carta porte oficial
      const cartaPorteData = {
        folio,
        tipo_cfdi: formData.tipoCfdi || 'Traslado',
        rfc_emisor: formData.rfcEmisor || '',
        nombre_emisor: formData.nombreEmisor || '',
        rfc_receptor: formData.rfcReceptor || '',
        nombre_receptor: formData.nombreReceptor || '',
        transporte_internacional: (formData.transporteInternacional === 'Sí' || formData.transporteInternacional === true) ? true : false,
        registro_istmo: formData.registroIstmo || false,
        status: xmlGenerado ? 'generado' : 'borrador',
        datos_formulario: datosCompletos, // Incluye XML y cálculos de ruta
        usuario_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let savedId = currentCartaPorteId;

      if (currentCartaPorteId) {
        // Actualizar carta porte existente
        const { error } = await supabase
          .from('cartas_porte')
          .update({
            ...cartaPorteData,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentCartaPorteId);

        if (error) throw error;
        console.log('✅ Carta porte actualizada exitosamente');
      } else {
        // Crear nueva carta porte
        const { data: nuevaCarta, error } = await supabase
          .from('cartas_porte')
          .insert(cartaPorteData)
          .select()
          .single();

        if (error) throw error;
        if (nuevaCarta) {
          savedId = nuevaCarta.id;
          setCurrentCartaPorteId(nuevaCarta.id);
          console.log('✅ Nueva carta porte creada:', savedId);
        }
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

  // Guardar y salir mejorado con navegación React Router
  const handleGuardarYSalir = useCallback(async () => {
    try {
      console.log('💾🚪 Guardando y saliendo...');
      await handleGuardarCartaPorteOficial();
      
      // Usar navegación React Router en lugar de window.location.href
      toast.success('Carta porte guardada. Redirigiendo...');
      setTimeout(() => {
        navigate('/cartas-porte', { replace: true });
      }, 500);
      
    } catch (error) {
      console.error('❌ Error guardando carta porte:', error);
      toast.error('Error al guardar. No se puede salir.');
    }
  }, [handleGuardarCartaPorteOficial, navigate]);

  // Lógica de borrador (mantenido para compatibilidad)
  const handleGuardarBorrador = useCallback(async () => {
    if (isGuardando) return;
    
    setIsGuardando(true);
    try {
      const datosCompletos: CartaPorteData = {
        ...formData,
        currentStep,
        xmlGenerado,
        datosCalculoRuta
      };
      
      const nuevoId = await BorradorService.guardarBorrador(datosCompletos, currentCartaPorteId || undefined);
      
      if (nuevoId && nuevoId !== currentCartaPorteId) {
        setCurrentCartaPorteId(nuevoId);
      }
      
      setUltimoGuardado(new Date());
      toast.success('Borrador guardado correctamente');
    } catch (error) {
      console.error('Error guardando borrador:', error);
      toast.error('Error al guardar el borrador');
    } finally {
      setIsGuardando(false);
    }
  }, [formData, currentStep, xmlGenerado, datosCalculoRuta, currentCartaPorteId, isGuardando]);

  const handleLimpiarBorrador = useCallback(async () => {
    try {
      await BorradorService.limpiarBorrador(currentCartaPorteId || undefined);
      
      setFormData(initialCartaPorteData);
      setCurrentStep(0);
      setCurrentCartaPorteId(null);
      setBorradorCargado(false);
      setUltimoGuardado(null);
      setXmlGenerado(null);
      setDatosCalculoRuta(null);
      
      toast.success('Borrador eliminado correctamente');
    } catch (error) {
      console.error('Error limpiando borrador:', error);
      toast.error('Error al eliminar el borrador');
    }
  }, [currentCartaPorteId]);

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
