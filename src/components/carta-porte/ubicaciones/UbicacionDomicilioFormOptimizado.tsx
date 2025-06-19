
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

  // Ensure domicilio has required properties for DomicilioUnificado
  const domicilioUnificado: DomicilioUnificado = {
    pais: formData.domicilio.pais,
    codigoPostal: formData.domicilio.codigoPostal,
    estado: formData.domicilio.estado,
    municipio: formData.domicilio.municipio,
    colonia: formData.domicilio.colonia,
    calle: formData.domicilio.calle,
    numExterior: formData.domicilio.numExterior || '', // Ensure required property
    numInterior: formData.domicilio.numInterior,
    localidad: formData.domicilio.localidad,
    referencia: formData.domicilio.referencia,
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Domicilio</h3>
      
      <FormularioDomicilioUnificado
        domicilio={domicilioUnificado}
        onDomicilioChange={handleDomicilioChange}
        onDireccionCompleta={handleDireccionCompleta}
        mostrarDistancia={
          formData.tipoUbicacion === 'Destino' ||
          formData.tipoUbicacion === 'Paso Intermedio'
        }
        distanciaRecorrida={formData.distanciaRecorrida}
        onDistanciaChange={handleDistanciaChange}
        camposOpcionales={['numInterior', 'referencia']}
      />
    </div>
  );
}
