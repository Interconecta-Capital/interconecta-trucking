
import React from 'react';
import { FormularioDomicilioUnificado, DomicilioUnificado } from '@/components/common/FormularioDomicilioUnificado';
import { Ubicacion } from '@/hooks/useUbicaciones';

interface UbicacionDomicilioFormOptimizadoProps {
  formData: Ubicacion;
  onFieldChange: (field: string, value: any) => void;
  onLocationUpdate: (locationData: any) => void;
}

export function UbicacionDomicilioFormOptimizado({
  formData,
  onFieldChange,
  onLocationUpdate
}: UbicacionDomicilioFormOptimizadoProps) {
  
  const handleDomicilioChange = React.useCallback((campo: keyof DomicilioUnificado, valor: string) => {
    onFieldChange(`domicilio.${campo}`, valor);
  }, [onFieldChange]);

  const handleDireccionCompleta = React.useCallback((direccion: DomicilioUnificado) => {
    console.log('[UbicacionDomicilio] Dirección completa:', direccion);
    onLocationUpdate(direccion);
  }, [onLocationUpdate]);

  const handleDistanciaChange = React.useCallback((distancia: number) => {
    onFieldChange('distanciaRecorrida', distancia);
  }, [onFieldChange]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Domicilio</h3>
      
      <FormularioDomicilioUnificado
        domicilio={formData.domicilio}
        onDomicilioChange={handleDomicilioChange}
        onDireccionCompleta={handleDireccionCompleta}
        mostrarDistancia={true}
        distanciaRecorrida={formData.distanciaRecorrida}
        onDistanciaChange={handleDistanciaChange}
        camposOpcionales={['numInterior', 'referencia']}
      />
    </div>
  );
}
