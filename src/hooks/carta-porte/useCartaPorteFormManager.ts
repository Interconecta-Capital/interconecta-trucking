
import { useState, useCallback, useEffect } from 'react';
import { CartaPorteData, AutotransporteCompleto, FiguraCompleta, MercanciaCompleta, UbicacionCompleta } from '@/types/cartaPorte';
import { BorradorService } from '@/services/borradorService';
import { useCartaPorteValidation } from './useCartaPorteValidation';
import { toast } from 'sonner';
import { useCartaPorteAutoSave } from './useCartaPorteAutoSave';
import { useBorradorRecovery } from './useBorradorRecovery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';

// Estado inicial simplificado y corregido
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
  
  // Estados para datos persistidos - CORREGIDO
  const [xmlGenerado, setXmlGenerado] = useState<string | null>(null);
  const [datosCalculoRuta, setDatosCalculoRuta] = useState<{
    distanciaTotal?: number;
    tiempoEstimado?: number;
    calculadoEn?: string;
  } | null>(null);
  
  const { getValidationSummary } = useCartaPorteValidation();

  // CORREGIDO: Auto-save mejorado sin causar loops
  const { isAutoSaving, lastSaved } = useCartaPorteAutoSave({
    formData: {
      ...formData,
      xmlGenerado,
      datosCalculoRuta
    },
    currentCartaPorteId: currentCartaPorteId || undefined,
    onCartaPorteIdChange: (id) => setCurrentCartaPorteId(id),
    enabled: true
  });

  // Recuperación de borrador - CORREGIDO
  const { showRecoveryDialog, borradorData, acceptBorrador, rejectBorrador } = useBorradorRecovery(cartaPorteId);

  const validationSummary = getValidationSummary(formData);

  // CORREGIDO: Cargar datos existentes al montar
  useEffect(() => {
    if (currentCartaPorteId && !borradorCargado) {
      loadCartaPorteData(currentCartaPorteId);
    }
  }, [currentCartaPorteId]);

  const loadCartaPorteData = useCallback(async (id: string) => {
    try {
      console.log('🔄 Cargando carta porte:', id);
      const { data, error } = await supabase
        .from('cartas_porte')
        .select('datos_formulario')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Error cargando carta porte:', error);
        return;
      }

      if (data?.datos_formulario) {
        // CORREGIDO: Manejo seguro de datos JSON
        const savedData = typeof data.datos_formulario === 'object' && data.datos_formulario !== null 
          ? data.datos_formulario as any 
          : {};
        
        // Restaurar datos del formulario
        setFormData({
          ...initialCartaPorteData,
          ...savedData
        });

        // CORREGIDO: Restaurar estados persistidos con validación
        if (savedData.xmlGenerado && typeof savedData.xmlGenerado === 'string') {
          setXmlGenerado(savedData.xmlGenerado);
        }
        
        if (savedData.datosCalculoRuta && typeof savedData.datosCalculoRuta === 'object') {
          setDatosCalculoRuta(savedData.datosCalculoRuta);
        }

        if (savedData.currentStep && typeof savedData.currentStep === 'number') {
          setCurrentStep(savedData.currentStep);
        }

        setBorradorCargado(true);
        console.log('✅ Datos cargados correctamente');
      }
    } catch (error) {
      console.error('❌ Error cargando datos de carta porte:', error);
    }
  }, []);

  // CORREGIDO: Handler de cambio estable
  const handleConfiguracionChange = useCallback((updates: Partial<CartaPorteData>) => {
    console.log('📝 Actualizando configuración:', updates);
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // CORREGIDO: Setters estables para cada sección
  const setUbicaciones = useCallback((ubicaciones: UbicacionCompleta[]) => {
    console.log('📍 Actualizando ubicaciones:', ubicaciones.length);
    setFormData(prev => ({ ...prev, ubicaciones }));
  }, []);

  const setMercancias = useCallback((mercancias: MercanciaCompleta[]) => {
    console.log('📦 Actualizando mercancías:', mercancias.length);
    setFormData(prev => ({ ...prev, mercancias }));
  }, []);
  
  const setAutotransporte = useCallback((autotransporte: AutotransporteCompleto) => {
    console.log('🚛 Actualizando autotransporte');
    setFormData(prev => ({ ...prev, autotransporte }));
  }, []);

  const setFiguras = useCallback((figuras: FiguraCompleta[]) => {
    console.log('👥 Actualizando figuras:', figuras.length);
    setFormData(prev => ({ ...prev, figuras }));
  }, []);

  // CORREGIDO: Función para manejar XML generado
  const handleXMLGenerated = useCallback((xml: string) => {
    console.log('📄 XML generado');
    setXmlGenerado(xml);
    handleGuardarCartaPorteOficial();
  }, []);

  // CORREGIDO: Funciones para manejar cálculos de ruta
  const handleCalculoRutaUpdate = useCallback((datos: {
    distanciaTotal?: number;
    tiempoEstimado?: number;
  }) => {
    console.log('🛣️ Actualizando cálculo de ruta:', datos);
    setDatosCalculoRuta({
      ...datos,
      calculadoEn: new Date().toISOString()
    });
  }, []);

  // CORREGIDO: Manejar aceptación de borrador
  const handleAcceptBorrador = useCallback(() => {
    const { data, id } = acceptBorrador();
    if (data) {
      setFormData(data);
      setCurrentCartaPorteId(id);
      setBorradorCargado(true);
      
      // CORREGIDO: Restaurar datos persistidos de manera segura
      if (data.xmlGenerado) {
        setXmlGenerado(data.xmlGenerado);
      }
      
      if (data.datosCalculoRuta) {
        setDatosCalculoRuta(data.datosCalculoRuta);
      }
      
      if (data.currentStep !== undefined) {
        setCurrentStep(data.currentStep);
      }
      
      console.log('✅ Borrador aceptado y cargado');
    }
  }, [acceptBorrador]);

  // CORREGIDO: Manejar rechazo de borrador
  const handleRejectBorrador = useCallback(() => {
    rejectBorrador();
    setFormData(initialCartaPorteData);
    setCurrentStep(0);
    setCurrentCartaPorteId(null);
    setBorradorCargado(false);
    setXmlGenerado(null);
    setDatosCalculoRuta(null);
    console.log('🗑️ Borrador rechazado, formulario limpiado');
  }, [rejectBorrador]);
  
  // CORREGIDO: Guardar como carta porte oficial - SIMPLIFICADO Y ROBUSTO
  const handleGuardarCartaPorteOficial = useCallback(async () => {
    if (!user?.id) {
      toast.error('Usuario no autenticado');
      return;
    }

    if (isGuardando) {
      console.log('⏳ Ya se está guardando, evitando duplicado');
      return;
    }
    
    setIsGuardando(true);
    try {
      console.log('💾 Iniciando guardado oficial...');
      
      // CORREGIDO: Preparar datos completos como JSON serializable
      const datosCompletos = JSON.parse(JSON.stringify({
        ...formData,
        currentStep,
        xmlGenerado,
        datosCalculoRuta
      }));
      
      // Preparar datos para la carta porte oficial
      const cartaPorteData = {
        tipo_cfdi: formData.tipoCfdi || 'Traslado',
        rfc_emisor: formData.rfcEmisor || 'TEMP',
        nombre_emisor: formData.nombreEmisor || 'Sin nombre',
        rfc_receptor: formData.rfcReceptor || 'TEMP', 
        nombre_receptor: formData.nombreReceptor || 'Sin nombre',
        transporte_internacional: Boolean(formData.transporteInternacional === 'Sí'),
        registro_istmo: Boolean(formData.registroIstmo),
        status: xmlGenerado ? 'generado' : 'borrador',
        datos_formulario: datosCompletos,
        usuario_id: user.id,
        updated_at: new Date().toISOString()
      };

      let savedId = currentCartaPorteId;

      if (currentCartaPorteId) {
        // Actualizar existente
        console.log('📝 Actualizando carta porte existente:', currentCartaPorteId);
        const { error } = await supabase
          .from('cartas_porte')
          .update(cartaPorteData)
          .eq('id', currentCartaPorteId)
          .eq('usuario_id', user.id);

        if (error) {
          console.error('❌ Error actualizando:', error);
          throw error;
        }
      } else {
        // Crear nueva
        console.log('➕ Creando nueva carta porte');
        const insertData = {
          ...cartaPorteData,
          created_at: new Date().toISOString(),
          folio: `CP-${Date.now().toString().slice(-8)}`
        };
        
        const { data: nuevaCarta, error } = await supabase
          .from('cartas_porte')
          .insert(insertData)
          .select('id')
          .single();

        if (error) {
          console.error('❌ Error creando:', error);
          throw error;
        }
        
        if (nuevaCarta?.id) {
          savedId = nuevaCarta.id;
          setCurrentCartaPorteId(nuevaCarta.id);
          console.log('✅ Nueva carta porte creada:', nuevaCarta.id);
        }
      }
      
      setUltimoGuardado(new Date());
      toast.success('Carta porte guardada correctamente');
      
      return savedId;
    } catch (error: any) {
      console.error('❌ Error guardando carta porte:', error);
      toast.error(`Error al guardar: ${error.message || 'Error desconocido'}`);
      throw error;
    } finally {
      setIsGuardando(false);
    }
  }, [formData, currentStep, xmlGenerado, datosCalculoRuta, currentCartaPorteId, user?.id, isGuardando]);

  // CORREGIDO: Guardar y salir
  const handleGuardarYSalir = useCallback(async () => {
    try {
      console.log('💾🚪 Guardando y saliendo...');
      await handleGuardarCartaPorteOficial();
      
      toast.success('Guardado exitoso. Redirigiendo...');
      
      // Delay para mostrar el toast
      setTimeout(() => {
        window.location.href = '/cartas-porte';
      }, 1500);
    } catch (error) {
      console.error('❌ Error guardando y saliendo:', error);
    }
  }, [handleGuardarCartaPorteOficial]);

  // CORREGIDO: Guardar borrador - SIMPLIFICADO
  const handleGuardarBorrador = useCallback(async () => {
    if (isGuardando) {
      console.log('⏳ Ya se está guardando borrador');
      return;
    }
    
    console.log('💾 Guardando borrador...');
    
    try {
      await handleGuardarCartaPorteOficial();
      setBorradorCargado(true);
      toast.success('Borrador guardado correctamente');
    } catch (error: any) {
      console.error('❌ Error guardando borrador:', error);
      toast.error(`Error al guardar el borrador: ${error.message}`);
    }
  }, [isGuardando, handleGuardarCartaPorteOficial]);

  // CORREGIDO: Limpiar borrador
  const handleLimpiarBorrador = useCallback(async () => {
    try {
      console.log('🗑️ Limpiando borrador...');
      
      if (currentCartaPorteId) {
        await BorradorService.limpiarBorrador(currentCartaPorteId);
      } else {
        localStorage.removeItem('carta_porte_borrador');
      }
      
      // Reset completo
      setFormData(initialCartaPorteData);
      setCurrentStep(0);
      setCurrentCartaPorteId(null);
      setBorradorCargado(false);
      setXmlGenerado(null);
      setDatosCalculoRuta(null);
      setUltimoGuardado(null);
      
      toast.success('Borrador limpiado correctamente');
      console.log('✅ Borrador limpiado');
    } catch (error: any) {
      console.error('❌ Error limpiando borrador:', error);
      toast.error(`Error al limpiar el borrador: ${error.message}`);
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
    
    // Setters y Handlers
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
    handleXMLGenerated,
    handleCalculoRutaUpdate,
  };
}
