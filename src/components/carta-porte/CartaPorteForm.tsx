
import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GuardarPlantillaDialog } from './plantillas/GuardarPlantillaDialog';
import { useCartaPorteFormSimplified } from '@/hooks/useCartaPorteFormSimplified';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { CartaPorteVersion } from '@/types/cartaPorteVersions';
import { CartaPorteHeader } from './form/CartaPorteHeader';
import { CartaPorteTabNavigation } from './form/CartaPorteTabNavigation';
import { CartaPorteTabContent } from './form/CartaPorteTabContent';
import { CartaPorteCompletionCard } from './form/CartaPorteCompletionCard';

export interface CartaPorteData {
  // Configuración inicial
  tipoCreacion: 'plantilla' | 'carga' | 'manual';
  tipoCfdi: 'Ingreso' | 'Traslado';
  rfcEmisor: string;
  nombreEmisor: string;
  rfcReceptor: string;
  nombreReceptor: string;
  transporteInternacional: boolean;
  registroIstmo: boolean;
  cartaPorteVersion: CartaPorteVersion;
  ubicaciones: any[];
  mercancias: any[];
  autotransporte: any;
  figuras: any[];
  entrada_salida_merc?: string;
  pais_origen_destino?: string;
  via_entrada_salida?: string;
  regimenesAduaneros?: string[];
  version31Fields?: {
    transporteEspecializado?: boolean;
    tipoCarroceria?: string;
    registroISTMO?: boolean;
    [key: string]: any;
  };
  regimenAduanero?: string;
  cartaPorteId?: string;
}

interface CartaPorteFormProps {
  cartaPorteId?: string;
  simplified?: boolean;
}

export function CartaPorteForm({ cartaPorteId, simplified = true }: CartaPorteFormProps) {
  const [showGuardarPlantilla, setShowGuardarPlantilla] = useState(false);
  
  // Usar siempre el hook simplificado para evitar bucles infinitos
  const {
    formData,
    currentCartaPorteId,
    isLoading,
    updateFormData,
    stepValidations,
    totalProgress,
    clearSavedData,
    isCreating,
    isUpdating,
    aiValidation,
    hasAIEnhancements,
    validationMode,
    overallScore,
    formDataToCartaPorteData,
    formAutotransporteToData,
    formFigurasToData,
  } = useCartaPorteFormSimplified({ cartaPorteId });

  // Usar hook optimizado para navegación de pestañas
  const { activeTab, handleTabChange } = useTabNavigation({
    initialTab: 'configuracion',
    persistInURL: false,
  });

  const handleSaveTemplate = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowGuardarPlantilla(true);
  }, []);

  const handleXMLGenerated = useCallback((xml: string) => {
    console.log('XML generado exitosamente', xml.length, 'caracteres');
  }, []);

  const handleTimbrado = useCallback((datos: any) => {
    console.log('Carta Porte timbrada exitosamente:', datos);
  }, []);

  // Handlers específicos para cada sección
  const handleAutotransporteChange = useCallback((data: any) => {
    updateFormData('autotransporte', data);
  }, [updateFormData]);

  const handleFigurasChange = useCallback((data: any[]) => {
    updateFormData('figuras', data);
  }, [updateFormData]);

  // Validaciones simplificadas
  const canSaveAsTemplate = useMemo(() => {
    return Boolean(stepValidations.configuracion && formData.ubicaciones?.length > 0);
  }, [stepValidations.configuracion, formData.ubicaciones?.length]);

  const canGenerateXML = useMemo(() => {
    return Object.values(stepValidations).every(isValid => Boolean(isValid));
  }, [stepValidations]);

  // Create extended form data structure for compatibility
  const cachedFormData = useMemo(() => ({
    ...formData,
    configuracion: {
      version: formData.cartaPorteVersion || '3.1',
      tipoComprobante: formData.tipoCfdi === 'Traslado' ? 'T' : 'I',
      emisor: {
        rfc: formData.rfcEmisor || '',
        nombre: formData.nombreEmisor || '',
        regimenFiscal: '',
      },
      receptor: {
        rfc: formData.rfcReceptor || '',
        nombre: formData.nombreReceptor || '',
      },
    },
  }), [formData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2">Cargando carta porte...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header con progreso */}
      <CartaPorteHeader
        cartaPorteId={cartaPorteId}
        cartaPorteVersion={formData.cartaPorteVersion || '3.1'}
        hasAIEnhancements={hasAIEnhancements}
        showAIAlerts={false}
        onToggleAIAlerts={() => {}}
        canSaveAsTemplate={canSaveAsTemplate}
        onSaveTemplate={handleSaveTemplate}
        validationMode={validationMode}
        overallScore={overallScore}
        totalProgress={totalProgress}
        currentCartaPorteId={currentCartaPorteId}
      />

      {/* Navegación por pasos */}
      <Card>
        <CardContent className="p-0">
          <CartaPorteTabNavigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
            stepValidations={stepValidations}
            canGenerateXML={canGenerateXML}
          />

          <CartaPorteTabContent
            cartaPorteData={formData}
            cachedFormData={cachedFormData}
            updateFormData={updateFormData}
            handleTabChange={handleTabChange}
            handleAutotransporteChange={handleAutotransporteChange}
            handleFigurasChange={handleFigurasChange}
            handleXMLGenerated={handleXMLGenerated}
            handleTimbrado={handleTimbrado}
            currentCartaPorteId={currentCartaPorteId}
          />
        </CardContent>
      </Card>

      {/* Acciones finales */}
      <CartaPorteCompletionCard
        canGenerateXML={canGenerateXML}
        hasAIEnhancements={hasAIEnhancements}
        onSaveTemplate={handleSaveTemplate}
        onGenerateXML={() => handleTabChange('xml')}
      />

      <GuardarPlantillaDialog
        open={showGuardarPlantilla}
        onClose={() => setShowGuardarPlantilla(false)}
        cartaPorteData={formData}
      />
    </div>
  );
}
