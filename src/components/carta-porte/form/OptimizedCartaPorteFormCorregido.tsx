
import React, { memo, useMemo, useCallback, useState } from 'react';
import { useCartaPorteFormManager } from '@/hooks/carta-porte/useCartaPorteFormManager';
import { useOptimizedFormData } from '@/hooks/carta-porte/useOptimizedFormData';
import { CartaPorteHeaderCorregido } from './CartaPorteHeaderCorregido';
import { CartaPorteProgressTracker } from './CartaPorteProgressTracker';
import { OptimizedCartaPorteStepContent } from './OptimizedCartaPorteStepContent';
import { CartaPorteAutoSaveIndicator } from './CartaPorteAutoSaveIndicator';
import { AutotransporteCompleto } from '@/types/cartaPorte';
import { BorradorServiceCorregido } from '@/services/borradorServiceCorregido';
import { toast } from 'sonner';

interface OptimizedCartaPorteFormCorregidoProps {
  cartaPorteId?: string;
}

const OptimizedCartaPorteFormCorregido = memo<OptimizedCartaPorteFormCorregidoProps>(({ cartaPorteId }) => {
  const [isSaving, setIsSaving] = useState(false);
  
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
    setUbicaciones,
    setMercancias,
    setAutotransporte,
    setFiguras,
    setCurrentStep,
    setXmlGenerated,
    setTimbradoData,
    setCurrentCartaPorteId,
    handleConfiguracionChange,
    handleGuardarBorrador,
    handleLimpiarBorrador,
  } = useCartaPorteFormManager();

  const {
    optimizedConfiguracion,
    optimizedUbicaciones,
    optimizedMercancias,
    optimizedAutotransporte,
    optimizedFiguras
  } = useOptimizedFormData(configuracion, {
    cacheTimeout: 5000,
    enableMemoization: true
  });

  const steps = useMemo(() => [
    'Configuración',
    'Ubicaciones', 
    'Mercancías',
    'Autotransporte',
    'Figuras',
    'XML'
  ], []);

  const safeOptimizedAutotransporte = useMemo(() => {
    const defaultAutotransporte: AutotransporteCompleto = {
      placa_vm: '',
      anio_modelo_vm: 2020,
      config_vehicular: '',
      perm_sct: '',
      num_permiso_sct: '',
      asegura_resp_civil: '',
      poliza_resp_civil: '',
      remolques: []
    };

    if (!optimizedAutotransporte || Object.keys(optimizedAutotransporte).length === 0) {
      return defaultAutotransporte;
    }

    return {
      ...defaultAutotransporte,
      ...optimizedAutotransporte
    };
  }, [optimizedAutotransporte]);

  const handleAutotransporteChange = useCallback((data: AutotransporteCompleto) => {
    const safeData: AutotransporteCompleto = {
      placa_vm: data.placa_vm || '',
      anio_modelo_vm: data.anio_modelo_vm || 2020,
      config_vehicular: data.config_vehicular || '',
      perm_sct: data.perm_sct || '',
      num_permiso_sct: data.num_permiso_sct || '',
      asegura_resp_civil: data.asegura_resp_civil || '',
      poliza_resp_civil: data.poliza_resp_civil || '',
      asegura_med_ambiente: data.asegura_med_ambiente,
      poliza_med_ambiente: data.poliza_med_ambiente,
      remolques: data.remolques || [],
      ...data
    };
    setAutotransporte(safeData);
  }, [setAutotransporte]);

  const handleGuardarBorradorMejorado = useCallback(async (): Promise<string | void> => {
    setIsSaving(true);
    try {
      console.log('🔄 Guardando borrador con servicio corregido...');
      const id = await BorradorServiceCorregido.guardarBorradorSupabase(
        optimizedConfiguracion, 
        currentCartaPorteId || undefined
      );
      
      if (id && !currentCartaPorteId) {
        setCurrentCartaPorteId(id);
      }
      
      console.log('✅ Borrador guardado exitosamente:', id);
      return id;
    } catch (error) {
      console.error('❌ Error guardando borrador:', error);
      toast.error('Error al guardar el borrador');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [optimizedConfiguracion, currentCartaPorteId, setCurrentCartaPorteId]);

  const handleGuardarYSalir = useCallback(async () => {
    try {
      await handleGuardarBorradorMejorado();
      console.log('✅ Borrador guardado, preparando navegación...');
    } catch (error) {
      console.error('❌ Error en guardar y salir:', error);
      throw error;
    }
  }, [handleGuardarBorradorMejorado]);

  const handleLimpiarBorradorMejorado = useCallback(async () => {
    try {
      console.log('🔄 Limpiando borrador...');
      await BorradorServiceCorregido.limpiarBorrador(currentCartaPorteId || undefined);
      handleLimpiarBorrador();
      console.log('✅ Borrador limpiado exitosamente');
    } catch (error) {
      console.error('❌ Error limpiando borrador:', error);
      toast.error('Error al eliminar el borrador');
    }
  }, [currentCartaPorteId, handleLimpiarBorrador]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <CartaPorteHeaderCorregido
        borradorCargado={borradorCargado}
        ultimoGuardado={ultimoGuardado}
        isSaving={isSaving}
        onGuardarBorrador={handleGuardarBorradorMejorado}
        onGuardarYSalir={handleGuardarYSalir}
        onLimpiarBorrador={handleLimpiarBorradorMejorado}
        currentCartaPorteId={currentCartaPorteId || undefined}
      />

      <CartaPorteProgressTracker
        currentStep={currentStep}
        totalSteps={steps.length}
      />

      <OptimizedCartaPorteStepContent
        currentStep={currentStep}
        configuracion={optimizedConfiguracion}
        ubicaciones={optimizedUbicaciones}
        mercancias={optimizedMercancias}
        autotransporte={safeOptimizedAutotransporte}
        figuras={optimizedFiguras}
        currentCartaPorteId={currentCartaPorteId}
        onConfiguracionChange={handleConfiguracionChange}
        onUbicacionesChange={setUbicaciones}
        onMercanciasChange={setMercancias}
        onAutotransporteChange={handleAutotransporteChange}
        onFigurasChange={setFiguras}
        onStepChange={setCurrentStep}
        onXMLGenerated={setXmlGenerated}
        onTimbrado={setTimbradoData}
      />

      <CartaPorteAutoSaveIndicator />
    </div>
  );
});

OptimizedCartaPorteFormCorregido.displayName = 'OptimizedCartaPorteFormCorregido';

export { OptimizedCartaPorteFormCorregido };
