
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

  // CORREGIDO: Autotransporte por defecto mejorado
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

  // CORREGIDO: Navegación mejorada con mejor validación
  const handleStepNavigation = useCallback((targetStep: number) => {
    console.log('🔄 Navegando al paso:', targetStep);
    
    // Permitir navegación hacia atrás siempre
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    // Para avanzar, verificar que el paso actual tenga datos mínimos
    const currentSectionKeys = ['configuracion', 'ubicaciones', 'mercancias', 'autotransporte', 'figuras'];
    const currentSectionKey = currentSectionKeys[currentStep];
    
    if (currentSectionKey && validationSummary.sectionStatus[currentSectionKey] === 'empty') {
      console.log('⚠️ No se puede avanzar, sección actual vacía:', currentSectionKey);
      return;
    }

    setCurrentStep(targetStep);
  }, [currentStep, setCurrentStep, validationSummary.sectionStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* CORREGIDO: Container principal con mejor diseño */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Dialog de recuperación de borrador */}
        <BorradorRecoveryDialog
          open={showRecoveryDialog}
          borradorData={borradorData}
          onAccept={handleAcceptBorrador}
          onReject={handleRejectBorrador}
        />

        {/* CORREGIDO: Header mejorado con mejor fondo */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-gray-50 to-blue-50 pb-4">
          <CartaPorteHeader
            borradorCargado={borradorCargado}
            ultimoGuardado={ultimoGuardado}
            onGuardarBorrador={handleGuardarBorrador}
            onLimpiarBorrador={handleLimpiarBorrador}
            onGuardarYSalir={handleGuardarYSalir}
            isGuardando={isGuardando}
          />

          {/* CORREGIDO: Indicador de progreso con mejor espaciado */}
          <div className="mt-4">
            <CartaPorteProgressIndicator
              validationSummary={validationSummary}
              currentStep={currentStep}
              onStepClick={handleStepNavigation}
              xmlGenerado={xmlGenerado}
            />
          </div>
        </div>

        {/* CORREGIDO: Contenido principal con sombra mejorada */}
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
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
          </div>
        </div>

        {/* CORREGIDO: Auto-save indicator mejorado */}
        <div className="fixed bottom-6 right-6 z-20">
          <CartaPorteAutoSaveIndicator />
        </div>
      </div>
    </div>
  );
});

OptimizedCartaPorteForm.displayName = 'OptimizedCartaPorteForm';

export { OptimizedCartaPorteForm };
