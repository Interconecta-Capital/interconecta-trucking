
import React, { memo, useMemo, useCallback } from 'react';
import { useOptimizedCartaPorteFormManager } from '@/hooks/carta-porte/useOptimizedCartaPorteFormManager';
import { CartaPorteHeader } from './CartaPorteHeader';
import { CartaPorteProgressIndicator } from './CartaPorteProgressIndicator';
import { OptimizedCartaPorteStepContent } from './OptimizedCartaPorteStepContent';
import { CartaPorteAutoSaveIndicator } from './CartaPorteAutoSaveIndicator';
import { BorradorRecoveryDialog } from '../BorradorRecoveryDialog';
import { AutotransporteCompleto } from '@/types/cartaPorte';

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
  } = useOptimizedCartaPorteFormManager(cartaPorteId);

  // Crear un objeto Autotransporte por defecto para evitar errores de tipo
  const defaultAutotransporte = useMemo((): AutotransporteCompleto => ({
    placa_vm: '',
    anio_modelo_vm: new Date().getFullYear(),
    config_vehicular: '',
    perm_sct: '',
    num_permiso_sct: '',
    asegura_resp_civil: '',
    poliza_resp_civil: '',
    peso_bruto_vehicular: 0,
    capacidad_carga: 0,
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
    
    if (currentSectionKey && validationSummary?.sectionStatus[currentSectionKey] === 'empty') {
      // No permitir avanzar si la sección actual está vacía
      return;
    }

    setCurrentStep(targetStep);
  }, [currentStep, setCurrentStep, validationSummary]);

  // Fix: Include version in configuracion object
  const enhancedConfiguracion = useMemo(() => ({
    ...configuracion,
    version: configuracion.cartaPorteVersion || '3.1'
  }), [configuracion]);

  // Create a proper ValidationSummary object with all required properties
  const enhancedValidationSummary = useMemo(() => {
    const baseValidation = validationSummary || { sectionStatus: {} };
    
    return {
      sectionStatus: {
        configuracion: (baseValidation.sectionStatus as any)?.configuracion || 'empty',
        ubicaciones: (baseValidation.sectionStatus as any)?.ubicaciones || 'empty',
        mercancias: (baseValidation.sectionStatus as any)?.mercancias || 'empty',
        autotransporte: (baseValidation.sectionStatus as any)?.autotransporte || 'empty',
        figuras: (baseValidation.sectionStatus as any)?.figuras || 'empty',
        xml: 'empty' as const
      },
      overallProgress: 0,
      completionPercentage: 0,
      missingFields: {
        configuracion: [],
        ubicaciones: [],
        mercancias: [],
        autotransporte: [],
        figuras: []
      },
      completedSections: 0,
      totalSections: 5
    };
  }, [validationSummary]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Dialog de recuperación de borrador */}
      {showRecoveryDialog && (
        <BorradorRecoveryDialog
          open={showRecoveryDialog}
          borradorData={borradorData}
          onAccept={handleAcceptBorrador}
          onReject={handleRejectBorrador}
        />
      )}

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
          validationSummary={enhancedValidationSummary}
          currentStep={currentStep}
          onStepClick={handleStepNavigation}
          xmlGenerado={xmlGenerado}
        />
      </div>

      {/* Contenido del paso actual */}
      <OptimizedCartaPorteStepContent
        currentStep={currentStep}
        configuracion={enhancedConfiguracion}
        ubicaciones={ubicaciones}
        mercancias={mercancias}
        autotransporte={autotransporte || defaultAutotransporte}
        figuras={figuras}
        currentCartaPorteId={currentCartaPorteId || undefined}
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
