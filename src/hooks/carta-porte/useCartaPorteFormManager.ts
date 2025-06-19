import { useState, useCallback, useEffect } from 'react';
import { CartaPorteData, AutotransporteCompleto } from '@/types/cartaPorte';
import { BorradorService } from '@/services/borradorService';
import { useToast } from '@/hooks/use-toast';

const getDefaultAutotransporte = (): AutotransporteCompleto => ({
  placa_vm: '',
  anio_modelo_vm: new Date().getFullYear(),
  config_vehicular: '',
  perm_sct: '',
  num_permiso_sct: '',
  asegura_resp_civil: '',
  poliza_resp_civil: '',
  peso_bruto_vehicular: 0,
  remolques: []
});

const initialData: CartaPorteData = {
  cartaPorteVersion: '3.1',
  tipoCfdi: 'Traslado',
  rfcEmisor: '',
  nombreEmisor: '',
  rfcReceptor: '',
  nombreReceptor: '',
  transporteInternacional: false,
  registroIstmo: false,
  ubicaciones: [],
  mercancias: [],
  autotransporte: getDefaultAutotransporte(),
  figuras: [],
  currentStep: 0
};

export const useCartaPorteFormManager = (cartaPorteId?: string) => {
  const [data, setData] = useState<CartaPorteData>(initialData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const { toast } = useToast();
  
  // Estado para propiedades específicas del formulario optimizado
  const [borradorCargado, setBorradorCargado] = useState(false);
  const [ultimoGuardado, setUltimoGuardado] = useState<Date | null>(null);
  const [isGuardando, setIsGuardando] = useState(false);
  const [xmlGenerado, setXmlGenerado] = useState<string | null>(null);
  const [datosCalculoRuta, setDatosCalculoRuta] = useState<{
    distanciaTotal?: number;
    tiempoEstimado?: number;
  } | null>(null);
  
  // ID persistente y diálogo de recuperación
  const [currentCartaPorteId, setCurrentCartaPorteId] = useState<string | undefined>(cartaPorteId);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [borradorData, setBorradorData] = useState<any>(null);

  // Inicialización mejorada con manejo de errores robusto
  useEffect(() => {
    const initializeCartaPorte = async () => {
      if (!cartaPorteId && !currentCartaPorteId) {
        console.log('🚀 [CartaPorteFormManager] Inicializando nueva carta porte...');
        
        try {
          setIsLoading(true);
          
          // Generar ID único inmediatamente
          const newId = crypto.randomUUID();
          console.log('📋 [CartaPorteFormManager] ID generado:', newId);
          
          // Crear registro inicial en la base de datos
          const savedId = await BorradorService.guardarBorrador(initialData, newId);
          
          if (savedId) {
            setCurrentCartaPorteId(savedId);
            setBorradorCargado(true);
            setUltimoGuardado(new Date());
            
            console.log('✅ [CartaPorteFormManager] Carta porte inicializada con ID:', savedId);
            
            toast({
              title: "Nueva carta porte creada",
              description: "Se ha inicializado un nuevo borrador con auto-guardado activado",
            });
          } else {
            // Fallback a modo local
            setCurrentCartaPorteId(newId);
            console.log('⚠️ [CartaPorteFormManager] Modo local activado - sin conexión a base de datos');
            
            toast({
              title: "Modo offline activado",
              description: "Los datos se guardarán localmente hasta que se restablezca la conexión",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('❌ [CartaPorteFormManager] Error inicializando carta porte:', error);
          
          // Generar ID local y continuar
          const fallbackId = crypto.randomUUID();
          setCurrentCartaPorteId(fallbackId);
          
          toast({
            title: "Error de conexión",
            description: "Se usará modo offline. Los datos se sincronizarán cuando se restablezca la conexión.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else if (cartaPorteId) {
        console.log('📥 [CartaPorteFormManager] Cargando carta porte existente:', cartaPorteId);
        await loadExistingCartaPorte(cartaPorteId);
      }
    };

    initializeCartaPorte();
  }, [cartaPorteId]);

  // Función para cargar carta porte existente
  const loadExistingCartaPorte = async (id: string) => {
    try {
      setIsLoading(true);
      const borradorData = await BorradorService.cargarBorrador(id);
      
      if (borradorData) {
        setData(borradorData.datosFormulario);
        setCurrentCartaPorteId(id);
        setBorradorCargado(true);
        setUltimoGuardado(new Date(borradorData.ultimaModificacion));
        
        console.log('✅ [CartaPorteFormManager] Carta porte cargada:', id);
        
        toast({
          title: "Borrador cargado",
          description: "Se ha recuperado el borrador guardado anteriormente",
        });
      } else {
        console.log('⚠️ [CartaPorteFormManager] No se encontró borrador, iniciando nuevo');
        setData(initialData);
        setCurrentCartaPorteId(id);
      }
    } catch (error) {
      console.error('❌ [CartaPorteFormManager] Error cargando carta porte:', error);
      toast({
        title: "Error cargando borrador",
        description: "Se iniciará un nuevo formulario",
        variant: "destructive",
      });
      setData(initialData);
      setCurrentCartaPorteId(id);
    } finally {
      setIsLoading(false);
    }
  };

  const updateData = useCallback((updates: Partial<CartaPorteData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const resetForm = useCallback(() => {
    setData(initialData);
    setCurrentStep(0);
    setErrors({});
    setCurrentCartaPorteId(undefined);
    setBorradorCargado(false);
    setUltimoGuardado(null);
    setDatosCalculoRuta(null);
    setXmlGenerado(null);
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    const stepErrors: string[] = [];
    
    switch (step) {
      case 0: // Configuración
        if (!data.rfcEmisor) stepErrors.push('RFC del emisor es requerido');
        if (!data.rfcReceptor) stepErrors.push('RFC del receptor es requerido');
        break;
      case 1: // Ubicaciones
        if (!data.ubicaciones || data.ubicaciones.length < 2) {
          stepErrors.push('Se requieren al menos 2 ubicaciones');
        }
        break;
      case 2: // Mercancías
        if (!data.mercancias || data.mercancias.length === 0) {
          stepErrors.push('Se requiere al menos una mercancía');
        }
        break;
      case 3: // Autotransporte
        if (!data.autotransporte?.placa_vm) {
          stepErrors.push('Placa del vehículo es requerida');
        }
        break;
      case 4: // Figuras
        if (!data.figuras || data.figuras.length === 0) {
          stepErrors.push('Se requiere al menos una figura de transporte');
        }
        break;
    }

    setErrors(prev => ({ ...prev, [step]: stepErrors }));
    return stepErrors.length === 0;
  }, [data]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step <= 5) {
      setCurrentStep(step);
    }
  }, []);

  // Handler functions
  const handleConfiguracionChange = useCallback((config: Partial<CartaPorteData>) => {
    updateData(config);
  }, [updateData]);

  const setUbicaciones = useCallback((ubicaciones: any[]) => {
    updateData({ ubicaciones });
  }, [updateData]);

  const setMercancias = useCallback((mercancias: any[]) => {
    updateData({ mercancias });
  }, [updateData]);

  const setAutotransporte = useCallback((autotransporte: AutotransporteCompleto) => {
    updateData({ autotransporte });
  }, [updateData]);

  const setFiguras = useCallback((figuras: any[]) => {
    updateData({ figuras });
  }, [updateData]);

  // Guardado mejorado con reintentos
  const handleGuardarBorrador = useCallback(async (showToast = true) => {
    if (!currentCartaPorteId) {
      console.error('❌ [CartaPorteFormManager] No hay ID de carta porte para guardar');
      if (showToast) {
        toast({
          title: "Error",
          description: "No se puede guardar: falta ID de carta porte",
          variant: "destructive",
        });
      }
      return false;
    }

    setIsGuardando(true);
    
    try {
      console.log('💾 [CartaPorteFormManager] Guardando borrador...', currentCartaPorteId);
      
      const savedId = await BorradorService.guardarBorrador(data, currentCartaPorteId);
      
      if (savedId) {
        setUltimoGuardado(new Date());
        setBorradorCargado(true);
        
        console.log('✅ [CartaPorteFormManager] Borrador guardado exitosamente');
        
        if (showToast) {
          toast({
            title: "Guardado exitoso",
            description: "El borrador se ha guardado correctamente",
          });
        }
        
        return true;
      } else {
        throw new Error('No se recibió confirmación de guardado');
      }
    } catch (error) {
      console.error('❌ [CartaPorteFormManager] Error guardando borrador:', error);
      
      if (showToast) {
        toast({
          title: "Error de guardado",
          description: "No se pudo guardar el borrador. Los datos se mantienen en memoria.",
          variant: "destructive",
        });
      }
      
      return false;
    } finally {
      setIsGuardando(false);
    }
  }, [data, currentCartaPorteId, toast]);

  const handleGuardarCartaPorteOficial = useCallback(async () => {
    // TODO: Implementar guardado oficial/timbrado
    console.log('TODO: Implementar guardado oficial');
  }, []);

  const handleGuardarYSalir = useCallback(async () => {
    const saved = await handleGuardarBorrador(true);
    if (saved) {
      // TODO: Navegar a dashboard o lista de cartas porte
      console.log('Navegando a dashboard...');
    }
  }, [handleGuardarBorrador]);

  const handleLimpiarBorrador = useCallback(async () => {
    if (currentCartaPorteId) {
      try {
        await BorradorService.limpiarBorrador(currentCartaPorteId);
        
        toast({
          title: "Borrador eliminado",
          description: "El borrador se ha eliminado correctamente",
        });
      } catch (error) {
        console.error('❌ Error limpiando borrador:', error);
        
        toast({
          title: "Error",
          description: "No se pudo eliminar el borrador",
          variant: "destructive",
        });
      }
    }
    
    resetForm();
  }, [currentCartaPorteId, resetForm, toast]);

  const handleXMLGenerated = useCallback((xml: string) => {
    setXmlGenerado(xml);
  }, []);

  const handleCalculoRutaUpdate = useCallback((datos: {
    distanciaTotal?: number;
    tiempoEstimado?: number;
  }) => {
    console.log('🔄 [CartaPorteFormManager] Actualizando datos de ruta:', datos);
    setDatosCalculoRuta(datos);
  }, []);

  const handleAcceptBorrador = useCallback(() => {
    if (borradorData) {
      setData(borradorData);
      setBorradorCargado(true);
    }
    setShowRecoveryDialog(false);
  }, [borradorData]);

  const handleRejectBorrador = useCallback(() => {
    setShowRecoveryDialog(false);
    setBorradorData(null);
  }, []);

  // Auto-guardado mejorado con manejo de errores
  useEffect(() => {
    if (currentCartaPorteId && borradorCargado) {
      console.log('🔄 [CartaPorteFormManager] Iniciando auto-guardado cada 30 segundos');
      
      const autoSaveInterval = BorradorService.iniciarGuardadoAutomatico(
        (cartaPorteId) => {
          if (cartaPorteId) {
            setUltimoGuardado(new Date());
            console.log('✅ Auto-guardado completado silenciosamente');
          }
        },
        () => data,
        () => currentCartaPorteId,
        30000 // 30 segundos
      );

      return () => {
        console.log('⏹️ [CartaPorteFormManager] Deteniendo auto-guardado');
        BorradorService.detenerGuardadoAutomatico();
      };
    }
  }, [currentCartaPorteId, borradorCargado, data]);

  // Validación mejorada
  const validationSummary = {
    sectionStatus: {
      configuracion: data.rfcEmisor && data.rfcReceptor ? 'valid' : 'empty',
      ubicaciones: data.ubicaciones && data.ubicaciones.length >= 2 ? 'valid' : 'empty',
      mercancias: data.mercancias && data.mercancias.length > 0 ? 'valid' : 'empty',
      autotransporte: data.autotransporte?.placa_vm ? 'valid' : 'empty',
      figuras: data.figuras && data.figuras.length > 0 ? 'valid' : 'empty'
    }
  };

  return {
    // Structure for OptimizedCartaPorteForm
    configuracion: data,
    ubicaciones: data.ubicaciones || [],
    mercancias: data.mercancias || [],
    autotransporte: data.autotransporte || getDefaultAutotransporte(),
    figuras: data.figuras || [],
    currentStep,
    currentCartaPorteId,
    borradorCargado,
    ultimoGuardado,
    validationSummary,
    isGuardando,
    xmlGenerado,
    datosCalculoRuta,
    
    // Dialog de recuperación
    showRecoveryDialog,
    borradorData,
    handleAcceptBorrador,
    handleRejectBorrador,
    
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

    // Original structure for backward compatibility
    data,
    isLoading,
    errors,
    updateData,
    setIsLoading,
    nextStep,
    prevStep,
    goToStep,
    validateStep,
    resetForm
  };
};
