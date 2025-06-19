
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
    const validations = {
      0: () => !!(configuracion.rfcEmisor && configuracion.rfcReceptor && configuracion.uso_cfdi),
      1: () => ubicaciones.length >= 2 && ubicaciones.some(u => u.tipo_ubicacion === 'Origen') && ubicaciones.some(u => u.tipo_ubicacion === 'Destino'),
      2: () => !!(autotransporte?.placa_vm && autotransporte?.config_vehicular),
      3: () => mercancias.length > 0,
      4: () => figuras.length > 0
    };

    const currentStepValid = validations[currentStep as keyof typeof validations]?.() ?? true;
    
    if (!currentStepValid) {
      return; // No permitir avanzar si el paso actual no es válido
    }

    setCurrentStep(targetStep);
  }, [currentStep, setCurrentStep, configuracion, ubicaciones, autotransporte, mercancias, figuras]);

  // Fix: Include version in configuracion object
  const enhancedConfiguracion = useMemo(() => ({
    ...configuracion,
    version: configuracion.cartaPorteVersion || '3.1'
  }), [configuracion]);

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

      {/* Indicador de progreso con validación mejorada */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border p-6">
        <CartaPorteProgressIndicator
          validationSummary={validationSummary || {
            sectionStatus: {},
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
          }}
          currentStep={currentStep}
          onStepClick={handleStepNavigation}
          xmlGenerado={xmlGenerado}
          configuracion={enhancedConfiguracion}
          ubicaciones={ubicaciones}
          mercancias={mercancias}
          autotransporte={autotransporte}
          figuras={figuras}
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
