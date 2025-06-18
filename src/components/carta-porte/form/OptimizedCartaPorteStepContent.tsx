
import React, { memo } from 'react';
import { ConfiguracionInicial } from '../ConfiguracionInicial';
import { UbicacionesSection } from '../UbicacionesSection';
import { MercanciasSection } from '../MercanciasSection';
import { AutotransporteSection } from '../AutotransporteSection';
import { FigurasTransporteSection } from '../FigurasTransporteSection';
import { SimplifiedXMLGenerationPanel } from '../xml/SimplifiedXMLGenerationPanel';
import { CartaPorteData, AutotransporteCompleto, FiguraCompleta, MercanciaCompleta, UbicacionCompleta } from '@/types/cartaPorte';

interface OptimizedCartaPorteStepContentProps {
  currentStep: number;
  configuracion: CartaPorteData;
  ubicaciones: UbicacionCompleta[];
  mercancias: MercanciaCompleta[];
  autotransporte: AutotransporteCompleto;
  figuras: FiguraCompleta[];
  currentCartaPorteId?: string | null;
  onConfiguracionChange: (config: Partial<CartaPorteData>) => void;
  onUbicacionesChange: (ubicaciones: UbicacionCompleta[]) => void;
  onMercanciasChange: (mercancias: MercanciaCompleta[]) => void;
  onAutotransporteChange: (autotransporte: AutotransporteCompleto) => void;
  onFigurasChange: (figuras: FiguraCompleta[]) => void;
  onStepChange: (step: number) => void;
  onXMLGenerated: (xml: string) => void;
  onTimbrado: () => void;
  xmlGenerado?: string | null;
  datosCalculoRuta?: {
    distanciaTotal?: number;
    tiempoEstimado?: number;
  } | null;
  onCalculoRutaUpdate: (datos: { distanciaTotal?: number; tiempoEstimado?: number }) => void;
}

const OptimizedCartaPorteStepContent = memo<OptimizedCartaPorteStepContentProps>(({
  currentStep,
  configuracion,
  ubicaciones,
  mercancias,
  autotransporte,
  figuras,
  currentCartaPorteId,
  onConfiguracionChange,
  onUbicacionesChange,
  onMercanciasChange,
  onAutotransporteChange,
  onFigurasChange,
  onStepChange,
  onXMLGenerated,
  onTimbrado,
  xmlGenerado,
  datosCalculoRuta,
  onCalculoRutaUpdate
}) => {

  const handleNextStep = () => {
    onStepChange(currentStep + 1);
  };

  const handlePrevStep = () => {
    onStepChange(currentStep - 1);
  };

  // Renderizar el contenido según el paso actual
  switch (currentStep) {
    case 0:
      return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
          <ConfiguracionInicial
            data={configuracion}
            onChange={onConfiguracionChange}
            onNext={handleNextStep}
          />
        </div>
      );

    case 1:
      return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
          <UbicacionesSection
            data={ubicaciones}
            onChange={(newUbicaciones) => {
              onUbicacionesChange(newUbicaciones);
              // Auto-calcular distancia si hay ubicaciones válidas
              if (newUbicaciones.length >= 2) {
                console.log('🔄 Ubicaciones actualizadas, preparando cálculo de ruta...');
              }
            }}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            cartaPorteId={currentCartaPorteId || undefined}
            // Pasar callback para persistir cálculos de ruta
            onDistanceCalculated={onCalculoRutaUpdate}
          />
        </div>
      );

    case 2:
      return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
          <MercanciasSection
            data={mercancias}
            onChange={onMercanciasChange}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        </div>
      );

    case 3:
      return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
          <AutotransporteSection
            data={autotransporte}
            onChange={onAutotransporteChange}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        </div>
      );

    case 4:
      return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
          <FigurasTransporteSection
            data={figuras}
            onChange={onFigurasChange}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        </div>
      );

    case 5:
      return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
          <SimplifiedXMLGenerationPanel
            cartaPorteData={configuracion}
            cartaPorteId={currentCartaPorteId || undefined}
            onXMLGenerated={onXMLGenerated}
            onTimbrado={onTimbrado}
            xmlGenerado={xmlGenerado}
            datosCalculoRuta={datosCalculoRuta}
          />
        </div>
      );

    default:
      return (
        <div className="text-center p-8">
          <p className="text-gray-500">Paso no encontrado</p>
        </div>
      );
  }
});

OptimizedCartaPorteStepContent.displayName = 'OptimizedCartaPorteStepContent';

export { OptimizedCartaPorteStepContent };
