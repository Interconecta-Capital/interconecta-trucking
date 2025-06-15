
import React, { memo, useMemo, useCallback } from 'react';
import { useCartaPorteFormManager } from '@/hooks/carta-porte/useCartaPorteFormManager';
import { useOptimizedFormData } from '@/hooks/carta-porte/useOptimizedFormData';
import { CartaPorteHeader } from './CartaPorteHeader';
import { CartaPorteProgressTracker } from './CartaPorteProgressTracker';
import { CartaPorteProgressIndicator } from './CartaPorteProgressIndicator';
import { OptimizedCartaPorteStepContent } from './OptimizedCartaPorteStepContent';
import { CartaPorteAutoSaveIndicator } from './CartaPorteAutoSaveIndicator';
import { AutotransporteCompleto } from '@/types/cartaPorte';
import { useNavigate } from 'react-router-dom';

interface OptimizedCartaPorteFormProps {
  cartaPorteId?: string;
}

const OptimizedCartaPorteForm = memo<OptimizedCartaPorteFormProps>(({ cartaPorteId }) => {
  const navigate = useNavigate();
  
  const {
    // State
    configuracion,
    ubicaciones,
    mercancias,
    autotransporte,
    figuras,
    currentStep,
    currentCartaPorteId,
    borradorCargado,
    ultimoGuardado,
    validationSummary,
    isGuardando,
    
    // Setters
    setUbicaciones,
    setMercancias,
    setAutotransporte,
    setFiguras,
    setCurrentStep,
    setXmlGenerated,
    setTimbradoData,
    
    // Handlers
    handleConfiguracionChange,
    handleGuardarBorrador,
    handleLimpiarBorrador,
    cargarBorrador,
  } = useCartaPorteFormManager();

  // Optimizar datos del formulario con memoización inteligente
  const {
    optimizedConfiguracion,
    optimizedUbicaciones,
    optimizedMercancias,
    optimizedAutotransporte,
    optimizedFiguras
  } = useOptimizedFormData(configuracion, {
    cacheTimeout: 5000,
    enableMemoization: true
  });

  // Memoizar lista de pasos para evitar re-renders innecesarios
  const steps = useMemo(() => [
    'Configuración',
    'Ubicaciones', 
    'Mercancías',
    'Autotransporte',
    'Figuras',
    'XML'
  ], []);

  // Asegurar que autotransporte tenga valores por defecto
  const safeAutotransporte = useMemo(() => {
    return autotransporte || {
      placa_vm: '',
      anio_modelo_vm: 2020,
      config_vehicular: '',
      perm_sct: '',
      num_permiso_sct: '',
      asegura_resp_civil: '',
      poliza_resp_civil: '',
      remolques: []
    };
  }, [autotransporte]);

  const safeOptimizedAutotransporte = useMemo(() => {
    // Ensure we always return a complete AutotransporteCompleto object
    const defaultAutotransporte: AutotransporteCompleto = {
      placa_vm: '',
      anio_modelo_vm: 2020,
      config_vehicular: '',
      perm_sct: '',
      num_permiso_sct: '',
      asegura_resp_civil: '',
      poliza_resp_civil: '',
      remolques: []
    };

    // If optimizedAutotransporte is empty or missing properties, use defaults
    if (!optimizedAutotransporte || Object.keys(optimizedAutotransporte).length === 0) {
      return defaultAutotransporte;
    }

    // Merge optimized data with defaults to ensure all required properties exist
    return {
      ...defaultAutotransporte,
      ...optimizedAutotransporte
    };
  }, [optimizedAutotransporte]);

  // Create a safe handler for autotransporte changes
  const handleAutotransporteChange = useCallback((data: AutotransporteCompleto) => {
    const safeData: AutotransporteCompleto = {
      placa_vm: data.placa_vm || '',
      anio_modelo_vm: data.anio_modelo_vm || 2020,
      config_vehicular: data.config_vehicular || '',
      perm_sct: data.perm_sct || '',
      num_permiso_sct: data.num_permiso_sct || '',
      asegura_resp_civil: data.asegura_resp_civil || '',
      poliza_resp_civil: data.poliza_resp_civil || '',
      asegura_med_ambiente: data.asegura_med_ambiente,
      poliza_med_ambiente: data.poliza_med_ambiente,
      remolques: data.remolques || [],
      ...data // Spread any additional properties
    };
    setAutotransporte(safeData);
  }, [setAutotransporte]);

  // Guardar y salir mejorado
  const handleGuardarYSalir = useCallback(async () => {
    try {
      await handleGuardarBorrador();
      navigate('/cartas-porte');
    } catch (error) {
      console.error('Error guardando antes de salir:', error);
      // Permitir salir aunque falle el guardado
      navigate('/cartas-porte');
    }
  }, [handleGuardarBorrador, navigate]);

  // Manejar navegación entre pasos con validación
  const handleStepNavigation = useCallback((targetStep: number) => {
    // Permitir navegación hacia atrás siempre
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    // Para avanzar, verificar que el paso actual tenga datos mínimos
    const currentSectionKeys = ['configuracion', 'ubicaciones', 'mercancias', 'autotransporte', 'figuras'];
    const currentSectionKey = currentSectionKeys[currentStep];
    
    if (currentSectionKey && validationSummary.sectionStatus[currentSectionKey] === 'empty') {
      // No permitir avanzar si la sección actual está vacía
      return;
    }

    setCurrentStep(targetStep);
  }, [currentStep, setCurrentStep, validationSummary.sectionStatus]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <CartaPorteHeader
        borradorCargado={borradorCargado}
        ultimoGuardado={ultimoGuardado}
        onGuardarBorrador={handleGuardarBorrador}
        onLimpiarBorrador={handleLimpiarBorrador}
        onGuardarYSalir={handleGuardarYSalir}
        isGuardando={isGuardando}
      />

      {/* Indicador de progreso mejorado */}
      <div className="mb-6">
        <CartaPorteProgressIndicator
          validationSummary={validationSummary}
          currentStep={currentStep}
          onStepClick={handleStepNavigation}
        />
      </div>

      {/* Tracker de progreso original */}
      <CartaPorteProgressTracker
        currentStep={currentStep}
        totalSteps={steps.length}
      />

      <OptimizedCartaPorteStepContent
        currentStep={currentStep}
        configuracion={optimizedConfiguracion}
        ubicaciones={optimizedUbicaciones}
        mercancias={optimizedMercancias}
        autotransporte={safeOptimizedAutotransporte}
        figuras={optimizedFiguras}
        currentCartaPorteId={currentCartaPorteId}
        onConfiguracionChange={handleConfiguracionChange}
        onUbicacionesChange={setUbicaciones}
        onMercanciasChange={setMercancias}
        onAutotransporteChange={handleAutotransporteChange}
        onFigurasChange={setFiguras}
        onStepChange={setCurrentStep}
        onXMLGenerated={setXmlGenerated}
        onTimbrado={setTimbradoData}
      />

      <CartaPorteAutoSaveIndicator />
    </div>
  );
});

OptimizedCartaPorteForm.displayName = 'OptimizedCartaPorteForm';

export { OptimizedCartaPorteForm };
