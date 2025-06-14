
import React, { memo, useMemo, useCallback } from 'react';
import { useCartaPorteFormManager } from '@/hooks/carta-porte/useCartaPorteFormManager';
import { CartaPorteHeader } from './CartaPorteHeader';
import { CartaPorteProgressIndicator } from './CartaPorteProgressIndicator';
import { OptimizedCartaPorteStepContent } from './OptimizedCartaPorteStepContent';
import { CartaPorteAutoSaveIndicator } from './CartaPorteAutoSaveIndicator';
import { AutotransporteCompleto, FiguraCompleta, MercanciaCompleta, UbicacionCompleta } from '@/types/cartaPorte';
import { useNavigate } from 'react-router-dom';

interface OptimizedCartaPorteFormProps {
  cartaPorteId?: string;
}

const OptimizedCartaPorteForm = memo<OptimizedCartaPorteFormProps>(({ cartaPorteId }) => {
  const navigate = useNavigate();
  
  const {
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
    
    setUbicaciones,
    setMercancias,
    setAutotransporte,
    setFiguras,
    setCurrentStep,
    handleConfiguracionChange,
    handleGuardarBorrador,
    handleLimpiarBorrador,
  } = useCartaPorteFormManager(cartaPorteId);


  // Crear un objeto Autotransporte por defecto para evitar errores de tipo
  const defaultAutotransporte = useMemo((): AutotransporteCompleto => ({
    placa_vm: '',
    anio_modelo_vm: new Date().getFullYear(),
    config_vehicular: '',
    perm_sct: '',
    num_permiso_sct: '',
    asegura_resp_civil: '',
    poliza_resp_civil: '',
    remolques: []
  }), []);

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


      <OptimizedCartaPorteStepContent
        currentStep={currentStep}
        configuracion={configuracion}
        ubicaciones={ubicaciones}
        mercancias={mercancias}
        autotransporte={autotransporte || defaultAutotransporte}
        figuras={figuras}
        currentCartaPorteId={currentCartaPorteId}
        onConfiguracionChange={handleConfiguracionChange}
        onUbicacionesChange={setUbicaciones}
        onMercanciasChange={setMercancias}
        onAutotransporteChange={setAutotransporte}
        onFigurasChange={setFiguras}
        onStepChange={setCurrentStep}
        onXMLGenerated={() => {}}
        onTimbrado={() => {}}
      />

      <CartaPorteAutoSaveIndicator />
    </div>
  );
});

OptimizedCartaPorteForm.displayName = 'OptimizedCartaPorteForm';

export { OptimizedCartaPorteForm };
