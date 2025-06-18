
import React, { memo, useMemo, useCallback } from 'react';
import { useCartaPorteFormManager } from '@/hooks/carta-porte/useCartaPorteFormManager';
import { CartaPorteHeader } from './CartaPorteHeader';
import { CartaPorteProgressIndicator } from './CartaPorteProgressIndicator';
import { OptimizedCartaPorteStepContent } from './OptimizedCartaPorteStepContent';
import { CartaPorteAutoSaveIndicator } from './CartaPorteAutoSaveIndicator';
import { BorradorRecoveryDialog } from '../BorradorRecoveryDialog';
import { AutotransporteCompleto, FiguraCompleta, MercanciaCompleta, UbicacionCompleta } from '@/types/cartaPorte';

interface OptimizedCartaPorteFormProps {
  cartaPorteId?: string;
}

const OptimizedCartaPorteForm = memo<OptimizedCartaPorteFormProps>(({ cartaPorteId }) => {
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

  // Manejar navegación entre pasos con validación mejorada
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
      {/* Dialog de recuperación de borrador */}
      <BorradorRecoveryDialog
        open={showRecoveryDialog}
        borradorData={borradorData}
        onAccept={handleAcceptBorrador}
        onReject={handleRejectBorrador}
      />

      {/* Header con mejor espaciado */}
      <div className="mb-8">
        <CartaPorteHeader
          borradorCargado={borradorCargado}
          ultimoGuardado={ultimoGuardado}
          onGuardarBorrador={handleGuardarBorrador}
          onLimpiarBorrador={handleLimpiarBorrador}
          onGuardarYSalir={handleGuardarYSalir}
          isGuardando={isGuardando}
        />
      </div>

      {/* Indicador de progreso con más margen */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border p-6">
        <CartaPorteProgressIndicator
          validationSummary={validationSummary}
          currentStep={currentStep}
          onStepClick={handleStepNavigation}
          xmlGenerado={xmlGenerado}
        />
      </div>

      {/* Contenido del paso actual */}
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
        onXMLGenerated={handleXMLGenerated}
        onTimbrado={() => {}}
        xmlGenerado={xmlGenerado}
        datosCalculoRuta={datosCalculoRuta}
        onCalculoRutaUpdate={handleCalculoRutaUpdate}
      />

      {/* Indicador de auto-guardado */}
      <div className="mt-8">
        <CartaPorteAutoSaveIndicator />
      </div>
    </div>
  );
});

OptimizedCartaPorteForm.displayName = 'OptimizedCartaPorteForm';

export { OptimizedCartaPorteForm };
