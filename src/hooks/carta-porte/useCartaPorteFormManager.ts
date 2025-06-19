
import { useState, useCallback } from 'react';
import { CartaPorteData, AutotransporteCompleto } from '@/types/cartaPorte';

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
  
  // State for additional properties expected by OptimizedCartaPorteForm
  const [borradorCargado, setBorradorCargado] = useState(false);
  const [ultimoGuardado, setUltimoGuardado] = useState<Date | null>(null);
  const [isGuardando, setIsGuardando] = useState(false);
  const [xmlGenerado, setXmlGenerado] = useState<string | null>(null);
  const [datosCalculoRuta, setDatosCalculoRuta] = useState<{
    distanciaTotal?: number;
    tiempoEstimado?: number;
  } | null>(null);
  
  // Dialog de recuperación
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [borradorData, setBorradorData] = useState<any>(null);

  const updateData = useCallback((updates: Partial<CartaPorteData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const resetForm = useCallback(() => {
    setData(initialData);
    setCurrentStep(0);
    setErrors({});
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

  // Handler functions expected by OptimizedCartaPorteForm
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

  const handleGuardarBorrador = useCallback(async () => {
    setIsGuardando(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUltimoGuardado(new Date());
      setBorradorCargado(true);
    } finally {
      setIsGuardando(false);
    }
  }, []);

  const handleGuardarCartaPorteOficial = useCallback(async () => {
    // Implementar guardado oficial
  }, []);

  const handleGuardarYSalir = useCallback(async () => {
    await handleGuardarBorrador();
  }, [handleGuardarBorrador]);

  const handleLimpiarBorrador = useCallback(() => {
    resetForm();
    setBorradorCargado(false);
    setUltimoGuardado(null);
  }, [resetForm]);

  const handleXMLGenerated = useCallback((xml: string) => {
    setXmlGenerado(xml);
  }, []);

  const handleCalculoRutaUpdate = useCallback((datos: {
    distanciaTotal?: number;
    tiempoEstimado?: number;
  }) => {
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

  // Create validation summary
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
    // Structure expected by OptimizedCartaPorteForm
    configuracion: data,
    ubicaciones: data.ubicaciones || [],
    mercancias: data.mercancias || [],
    autotransporte: data.autotransporte || getDefaultAutotransporte(),
    figuras: data.figuras || [],
    currentStep,
    currentCartaPorteId: cartaPorteId,
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
