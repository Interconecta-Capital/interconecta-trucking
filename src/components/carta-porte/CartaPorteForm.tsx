
import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GuardarPlantillaDialog } from './plantillas/GuardarPlantillaDialog';
import { AIValidationAlerts } from '@/components/ai/AIValidationAlerts';
import { useCartaPorteForm } from '@/hooks/useCartaPorteForm';
import { useCartaPorteFormSimplified } from '@/hooks/useCartaPorteFormSimplified';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { useCartaPorteCache } from '@/hooks/carta-porte/useCartaPorteCache';
import { useCartaPortePerformance } from '@/hooks/carta-porte/useCartaPortePerformance';
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

export function CartaPorteForm({ cartaPorteId, simplified }: CartaPorteFormProps) {
  const [showGuardarPlantilla, setShowGuardarPlantilla] = useState(false);
  const [showAIAlerts, setShowAIAlerts] = useState(true);
  
  // Performance hooks
  const cache = useCartaPorteCache();
  const performance = useCartaPortePerformance();
  
  // Usar hook optimizado para el manejo del formulario con IA
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
  } = (
    simplified || import.meta.env.VITE_SIMPLIFIED_CARTA_PORTE === 'true'
      ? useCartaPorteFormSimplified({ cartaPorteId })
      : useCartaPorteForm({ cartaPorteId })
  );

  // Usar hook optimizado para navegación de pestañas
  const { activeTab, handleTabChange } = useTabNavigation({
    initialTab: 'configuracion',
    persistInURL: false,
  });

  // Nuevo handler para aplicar fixes de IA
  const handleApplyAIFix = useCallback((fix: any) => {
    console.log('[CartaPorteForm] Aplicando fix de IA:', fix);
    if (fix.field && fix.suggestedValue) {
      console.log(`Aplicando fix en ${fix.field}: ${fix.suggestedValue}`);
    }
  }, []);

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

  // Handlers específicos para cada sección con tipos extendidos
  const handleAutotransporteChange = useCallback((data: any) => {
    updateFormData('autotransporte', data);
  }, [updateFormData]);

  const handleFigurasChange = useCallback((data: any[]) => {
    updateFormData('figuras', data);
  }, [updateFormData]);

  // Validaciones complejas memoizadas
  const canSaveAsTemplate = useMemo(() => {
    return stepValidations.configuracion && formData.ubicaciones?.length > 0;
  }, [stepValidations.configuracion, formData.ubicaciones]);

  const canGenerateXML = useMemo(() => {
    return Object.entries(stepValidations)
      .every(([, isValid]) => isValid);
  }, [stepValidations]);

  // Convertir formData a CartaPorteData cuando sea necesario
  const cartaPorteData = useMemo(() => {
    return formDataToCartaPorteData();
  }, [formDataToCartaPorteData]);

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
      {/* Header con progreso mejorado */}
      <CartaPorteHeader
        cartaPorteId={cartaPorteId}
        cartaPorteVersion={formData.cartaPorteVersion || '3.1'}
        hasAIEnhancements={hasAIEnhancements}
        showAIAlerts={showAIAlerts}
        onToggleAIAlerts={() => setShowAIAlerts(!showAIAlerts)}
        canSaveAsTemplate={canSaveAsTemplate}
        onSaveTemplate={handleSaveTemplate}
        validationMode={validationMode}
        overallScore={overallScore}
        totalProgress={totalProgress}
        currentCartaPorteId={currentCartaPorteId}
      />

      {/* Alertas de IA */}
      {showAIAlerts && aiValidation && hasAIEnhancements && (
        <AIValidationAlerts
          validation={aiValidation}
          onDismiss={() => setShowAIAlerts(false)}
          onApplyFix={handleApplyAIFix}
        />
      )}

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
            cartaPorteData={cartaPorteData}
            cachedFormData={formData}
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

      {/* Acciones finales mejoradas con IA */}
      <CartaPorteCompletionCard
        canGenerateXML={canGenerateXML}
        hasAIEnhancements={hasAIEnhancements}
        onSaveTemplate={handleSaveTemplate}
        onGenerateXML={() => handleTabChange('xml')}
      />

      <GuardarPlantillaDialog
        open={showGuardarPlantilla}
        onClose={() => setShowGuardarPlantilla(false)}
        cartaPorteData={cartaPorteData}
      />
    </div>
  );
}
