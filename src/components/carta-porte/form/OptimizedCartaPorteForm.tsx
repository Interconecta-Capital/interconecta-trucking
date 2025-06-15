import React, { memo, useMemo, useCallback } from 'react';
import { useCartaPorteFormManager } from '@/hooks/carta-porte/useCartaPorteFormManager';
import { useOptimizedFormData } from '@/hooks/carta-porte/useOptimizedFormData';
import { CartaPorteHeader } from './CartaPorteHeader';
import { CartaPorteProgressTracker } from './CartaPorteProgressTracker';
import { OptimizedCartaPorteStepContent } from './OptimizedCartaPorteStepContent';
import { CartaPorteAutoSaveIndicator } from './CartaPorteAutoSaveIndicator';
import { AutotransporteCompleto } from '@/types/cartaPorte';
import { useNavigate } from 'react-router-dom';

interface OptimizedCartaPorteFormProps {
  cartaPorteId?: string;
}

const OptimizedCartaPorteForm = memo<OptimizedCartaPorteFormProps>(({ cartaPorteId }) => {
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

  // Guardar y salir: guarda el borrador y navega al listado
  const navigate = useNavigate();
  const handleGuardarYSalir = async () => {
    if (typeof handleGuardarBorrador === 'function') {
      await handleGuardarBorrador();
    }
    navigate('/cartas-porte');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <CartaPorteHeader
        borradorCargado={borradorCargado}
        ultimoGuardado={ultimoGuardado}
        onGuardarBorrador={handleGuardarBorrador}
        onLimpiarBorrador={handleLimpiarBorrador}
        onGuardarYSalir={handleGuardarYSalir}
      />

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
