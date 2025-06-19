import React from 'react';
import { ConfiguracionInicial } from '../ConfiguracionInicial';
import { UbicacionesSection } from '../UbicacionesSection';
import { MercanciasSection } from '../MercanciasSection';
import { AutotransporteSection } from '../AutotransporteSection';
import { FigurasTransporteSection } from '../FigurasTransporteSection';
import { XMLGenerationPanel } from '../xml/XMLGenerationPanel';
import { CartaPorteData, AutotransporteCompleto, FiguraCompleta, MercanciaCompleta } from '@/types/cartaPorte';

interface CartaPorteStepContentProps {
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

export function CartaPorteStepContent({
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
}: CartaPorteStepContentProps) {
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ConfiguracionInicial
            data={configuracion}
            onChange={onConfiguracionChange}
            onNext={() => onStepChange(1)}
          />
        );
      case 1:
        return (
          <UbicacionesSection
            data={ubicaciones}
            onChange={onUbicacionesChange}
            onNext={() => onStepChange(2)}
            onPrev={() => onStepChange(0)}
          />
        );
      case 2:
        return (
          <MercanciasSection
            data={mercancias}
            onChange={onMercanciasChange}
            onNext={() => onStepChange(3)}
            onPrev={() => onStepChange(1)}
          />
        );
      case 3:
        return (
          <AutotransporteSection
            data={autotransporte}
            onChange={onAutotransporteChange}
            onNext={() => onStepChange(4)}
            onPrev={() => onStepChange(2)}
          />
        );
      case 4:
        return (
          <FigurasTransporteSection
            data={figuras}
            onChange={onFigurasChange}
            onPrev={() => onStepChange(3)}
            onNext={() => onStepChange(5)}
          />
        );
      case 5:
        return (
          <XMLGenerationPanel
            cartaPorteData={configuracion}
            cartaPorteId={currentCartaPorteId}
            onXMLGenerated={onXMLGenerated}
            onTimbrado={onTimbrado}
          />
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
}
