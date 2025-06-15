
import { Suspense, lazy } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ConfiguracionInicial } from '../ConfiguracionInicial';
import { UbicacionesSection } from '../UbicacionesSection';
import { MercanciasSection } from '../MercanciasSection';
import { AutotransporteSection } from '../AutotransporteSection';
import { FigurasTransporteSection } from '../FigurasTransporteSection';
import { CartaPorteFormData } from '@/hooks/carta-porte/useCartaPorteMappers';
import { CartaPorteData } from '@/types/cartaPorte';

// Lazy loading del panel XML
const XMLGenerationPanel = lazy(() => import('../xml/XMLGenerationPanel').then(module => ({ default: module.XMLGenerationPanel })));

interface CartaPorteTabContentProps {
  cartaPorteData: CartaPorteData;
  cachedFormData: CartaPorteFormData;
  updateFormData: (section: string, data: any) => void;
  handleTabChange: (tab: string) => void;
  handleAutotransporteChange: (data: any) => void;
  handleFigurasChange: (data: any[]) => void;
  handleXMLGenerated: (xml: string) => void;
  handleTimbrado: (datos: any) => void;
  currentCartaPorteId?: string;
}

export function CartaPorteTabContent({
  cartaPorteData,
  cachedFormData,
  updateFormData,
  handleTabChange,
  handleAutotransporteChange,
  handleFigurasChange,
  handleXMLGenerated,
  handleTimbrado,
  currentCartaPorteId,
}: CartaPorteTabContentProps) {
  const handleNextStep = (targetStep: string) => {
    handleTabChange(targetStep);
  };

  const handlePrevStep = (targetStep: string) => {
    handleTabChange(targetStep);
  };

  return (
    <div className="p-6">
      <TabsContent value="configuracion">
        <ConfiguracionInicial
          data={cartaPorteData}
          onChange={(data) => updateFormData('configuracion', data)}
          onNext={() => handleNextStep('ubicaciones')}
        />
      </TabsContent>

      <TabsContent value="ubicaciones">
        <UbicacionesSection
          data={cachedFormData.ubicaciones}
          onChange={(data) => updateFormData('ubicaciones', data)}
          onNext={() => handleNextStep('mercancias')}
          onPrev={() => handlePrevStep('configuracion')}
        />
      </TabsContent>

      <TabsContent value="mercancias">
        <MercanciasSection
          data={cachedFormData.mercancias}
          onChange={(data) => updateFormData('mercancias', data)}
          onNext={() => handleNextStep('autotransporte')}
          onPrev={() => handlePrevStep('ubicaciones')}
        />
      </TabsContent>

      <TabsContent value="autotransporte">
        <AutotransporteSection
          data={cachedFormData.autotransporte}
          onChange={handleAutotransporteChange}
          onNext={() => handleNextStep('figuras')}
          onPrev={() => handlePrevStep('mercancias')}
        />
      </TabsContent>

      <TabsContent value="figuras">
        <FigurasTransporteSection
          data={cachedFormData.figuras}
          onChange={handleFigurasChange}
          onPrev={() => handlePrevStep('autotransporte')}
          onNext={() => handleNextStep('xml')}
        />
      </TabsContent>

      <TabsContent value="xml">
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="ml-2">Cargando panel XML...</p>
          </div>
        }>
          <XMLGenerationPanel
            cartaPorteData={cartaPorteData}
            cartaPorteId={currentCartaPorteId}
            onXMLGenerated={handleXMLGenerated}
            onTimbrado={handleTimbrado}
          />
        </Suspense>
      </TabsContent>
    </div>
  );
}
