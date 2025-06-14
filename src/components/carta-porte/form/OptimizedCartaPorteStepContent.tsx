
import React, { memo, lazy, Suspense } from 'react';
import { CartaPorteData, AutotransporteCompleto, FiguraCompleta, MercanciaCompleta } from '@/types/cartaPorte';

// Lazy loading de componentes pesados con default export
const ConfiguracionInicial = lazy(() => import('../ConfiguracionInicial').then(module => ({ default: module.ConfiguracionInicial })));
const UbicacionesSection = lazy(() => import('../UbicacionesSection').then(module => ({ default: module.UbicacionesSection })));
const MercanciasSection = lazy(() => import('../MercanciasSection').then(module => ({ default: module.MercanciasSection })));
const AutotransporteSection = lazy(() => import('../AutotransporteSection').then(module => ({ default: module.AutotransporteSection })));
const FigurasTransporteSection = lazy(() => import('../FigurasTransporteSection').then(module => ({ default: module.FigurasTransporteSection })));
const XMLGenerationPanel = lazy(() => import('../xml/XMLGenerationPanel').then(module => ({ default: module.XMLGenerationPanel })));

interface OptimizedCartaPorteStepContentProps {
  currentStep: number;
  configuracion: CartaPorteData;
  ubicaciones: any[];
  mercancias: MercanciaCompleta[];
  autotransporte: AutotransporteCompleto;
  figuras: FiguraCompleta[];
  currentCartaPorteId: string | null;
  onConfiguracionChange: (data: Partial<CartaPorteData>) => void;
  onUbicacionesChange: (ubicaciones: any[]) => void;
  onMercanciasChange: (mercancias: MercanciaCompleta[]) => void;
  onAutotransporteChange: (autotransporte: AutotransporteCompleto) => void;
  onFigurasChange: (figuras: FiguraCompleta[]) => void;
  onStepChange: (step: number) => void;
  onXMLGenerated: (xml: string) => void;
  onTimbrado: (data: any) => void;
}

const LoadingFallback = memo(() => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <p className="ml-2">Cargando sección...</p>
  </div>
));

LoadingFallback.displayName = 'LoadingFallback';

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
}) => {
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ConfiguracionInicial
              data={configuracion}
              onChange={onConfiguracionChange}
              onNext={() => onStepChange(1)}
            />
          </Suspense>
        );
      case 1:
        return (
          <Suspense fallback={<LoadingFallback />}>
            <UbicacionesSection
              data={ubicaciones}
              onChange={onUbicacionesChange}
              onNext={() => onStepChange(2)}
              onPrev={() => onStepChange(0)}
            />
          </Suspense>
        );
      case 2:
        return (
          <Suspense fallback={<LoadingFallback />}>
            <MercanciasSection
              data={mercancias}
              onChange={onMercanciasChange}
              onNext={() => onStepChange(3)}
              onPrev={() => onStepChange(1)}
            />
          </Suspense>
        );
      case 3:
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AutotransporteSection
              data={autotransporte}
              onChange={onAutotransporteChange}
              onNext={() => onStepChange(4)}
              onPrev={() => onStepChange(2)}
            />
          </Suspense>
        );
      case 4:
        return (
          <Suspense fallback={<LoadingFallback />}>
            <FigurasTransporteSection
              data={figuras}
              onChange={onFigurasChange}
              onPrev={() => onStepChange(3)}
              onNext={() => onStepChange(5)}
            />
          </Suspense>
        );
      case 5:
        return (
          <Suspense fallback={<LoadingFallback />}>
            <XMLGenerationPanel
              cartaPorteData={configuracion}
              cartaPorteId={currentCartaPorteId}
              onXMLGenerated={onXMLGenerated}
              onTimbrado={onTimbrado}
            />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {renderStepContent()}
    </div>
  );
});

OptimizedCartaPorteStepContent.displayName = 'OptimizedCartaPorteStepContent';

export { OptimizedCartaPorteStepContent };
