import React from 'react';
import { useCartaPorteFormManager } from '@/hooks/carta-porte/useCartaPorteFormManager';
import { CartaPorteHeader } from './form/CartaPorteHeader';
import { CartaPorteProgressTracker } from './form/CartaPorteProgressTracker';
import { CartaPorteStepContent } from './form/CartaPorteStepContent';
import { CartaPorteAutoSaveIndicator } from './form/CartaPorteAutoSaveIndicator';
import { CartaPorteData } from '@/types/cartaPorte';

interface CartaPorteFormProps {
  cartaPorteId?: string;
}

export function CartaPorteForm({ cartaPorteId }: CartaPorteFormProps) {
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

  const steps = [
    'Configuración',
    'Ubicaciones', 
    'Mercancías',
    'Autotransporte',
    'Figuras',
    'XML'
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <CartaPorteHeader
        borradorCargado={borradorCargado}
        ultimoGuardado={ultimoGuardado}
        onGuardarBorrador={handleGuardarBorrador}
        onLimpiarBorrador={handleLimpiarBorrador}
      />

      <CartaPorteProgressTracker
        currentStep={currentStep}
        totalSteps={steps.length}
      />

      <CartaPorteStepContent
        currentStep={currentStep}
        configuracion={configuracion}
        ubicaciones={ubicaciones}
        mercancias={mercancias}
        autotransporte={autotransporte}
        figuras={figuras}
        currentCartaPorteId={currentCartaPorteId}
        onConfiguracionChange={handleConfiguracionChange}
        onUbicacionesChange={setUbicaciones}
        onMercanciasChange={setMercancias}
        onAutotransporteChange={setAutotransporte}
        onFigurasChange={setFiguras}
        onStepChange={setCurrentStep}
        onXMLGenerated={setXmlGenerated}
        onTimbrado={setTimbradoData}
      />

      <CartaPorteAutoSaveIndicator />
    </div>
  );
}

export { CartaPorteData };
export default CartaPorteForm;
