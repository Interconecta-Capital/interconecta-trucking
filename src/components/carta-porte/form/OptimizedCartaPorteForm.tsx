
import React, { memo, useMemo, useCallback, useState } from 'react';
import { useCartaPorteFormManager } from '@/hooks/carta-porte/useCartaPorteFormManager';
import { useOptimizedFormData } from '@/hooks/carta-porte/useOptimizedFormData';
import { CartaPorteHeaderMejorado } from './CartaPorteHeaderMejorado';
import { CartaPorteProgressTracker } from './CartaPorteProgressTracker';
import { OptimizedCartaPorteStepContent } from './OptimizedCartaPorteStepContent';
import { CartaPorteAutoSaveIndicator } from './CartaPorteAutoSaveIndicator';
import { QuickStepNavigation } from '../navigation/QuickStepNavigation';
import { AutotransporteCompleto } from '@/types/cartaPorte';
import { BorradorServiceExtendido } from '@/services/borradorServiceExtendido';

interface OptimizedCartaPorteFormProps {
  cartaPorteId?: string;
}

const OptimizedCartaPorteForm = memo<OptimizedCartaPorteFormProps>(({ cartaPorteId }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showQuickNav, setShowQuickNav] = useState(false);
  
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
    setCurrentCartaPorteId,
    
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

  const steps = useMemo(() => [
    'Configuración',
    'Ubicaciones', 
    'Mercancías',
    'Autotransporte',
    'Figuras',
    'XML'
  ], []);

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

    if (!optimizedAutotransporte || Object.keys(optimizedAutotransporte).length === 0) {
      return defaultAutotransporte;
    }

    return {
      ...defaultAutotransporte,
      ...optimizedAutotransporte
    };
  }, [optimizedAutotransporte]);

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
      ...data
    };
    setAutotransporte(safeData);
  }, [setAutotransporte]);

  // Mejorado: Guardar borrador y continuar
  const handleGuardarBorradorMejorado = useCallback(async () => {
    setIsSaving(true);
    try {
      const id = await BorradorServiceExtendido.guardarBorradorSupabase(
        optimizedConfiguracion, 
        currentCartaPorteId || undefined
      );
      
      if (id && !currentCartaPorteId) {
        setCurrentCartaPorteId(id);
      }
    } catch (error) {
      console.error('Error guardando borrador:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [optimizedConfiguracion, currentCartaPorteId, setCurrentCartaPorteId]);

  const handleGuardarYSalir = useCallback(async () => {
    await handleGuardarBorradorMejorado();
  }, [handleGuardarBorradorMejorado]);

  const handleLimpiarBorradorMejorado = useCallback(async () => {
    try {
      await BorradorServiceExtendido.limpiarBorrador(currentCartaPorteId || undefined);
      handleLimpiarBorrador();
    } catch (error) {
      console.error('Error limpiando borrador:', error);
    }
  }, [currentCartaPorteId, handleLimpiarBorrador]);

  // Validación básica de pasos para navegación rápida
  const stepValidation = useMemo(() => {
    const validation: Record<number, 'valid' | 'invalid' | 'pending'> = {};
    
    // Paso 0: Configuración
    validation[0] = (optimizedConfiguracion.rfcEmisor && optimizedConfiguracion.rfcReceptor && optimizedConfiguracion.tipoCfdi) 
      ? 'valid' : 'pending';
    
    // Paso 1: Ubicaciones
    validation[1] = (optimizedUbicaciones.length >= 2) ? 'valid' : 'pending';
    
    // Paso 2: Mercancías
    validation[2] = (optimizedMercancias.length > 0) ? 'valid' : 'pending';
    
    // Paso 3: Autotransporte
    validation[3] = (safeOptimizedAutotransporte.placa_vm) ? 'valid' : 'pending';
    
    // Paso 4: Figuras
    validation[4] = (optimizedFiguras.length > 0) ? 'valid' : 'pending';
    
    return validation;
  }, [optimizedConfiguracion, optimizedUbicaciones, optimizedMercancias, safeOptimizedAutotransporte, optimizedFiguras]);

  return (
    <div className="min-h-screen bg-gray-50">
      <CartaPorteHeaderMejorado
        borradorCargado={borradorCargado}
        ultimoGuardado={ultimoGuardado}
        isSaving={isSaving}
        currentStep={currentStep}
        currentCartaPorteId={currentCartaPorteId || undefined}
        onGuardarBorrador={handleGuardarBorradorMejorado}
        onGuardarYSalir={handleGuardarYSalir}
        onLimpiarBorrador={handleLimpiarBorradorMejorado}
      />

      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        {/* Navegación rápida entre pasos */}
        <QuickStepNavigation
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          stepValidation={stepValidation}
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
    </div>
  );
});

OptimizedCartaPorteForm.displayName = 'OptimizedCartaPorteForm';

export { OptimizedCartaPorteForm };
