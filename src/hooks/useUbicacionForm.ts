
import { useState, useCallback } from 'react';
import { Ubicacion } from '@/types/ubicaciones';

export const useUbicacionForm = (initialData?: Partial<Ubicacion>) => {
  const [ubicacion, setUbicacion] = useState<Ubicacion>({
    id: initialData?.id || '',
    idUbicacion: initialData?.idUbicacion || '',
    tipoUbicacion: initialData?.tipoUbicacion || 'Origen',
    rfcRemitenteDestinatario: initialData?.rfcRemitenteDestinatario || '',
    nombreRemitenteDestinatario: initialData?.nombreRemitenteDestinatario || '',
    fechaHoraSalidaLlegada: initialData?.fechaHoraSalidaLlegada || '',
    distanciaRecorrida: initialData?.distanciaRecorrida || 0,
    ordenSecuencia: initialData?.ordenSecuencia || 1,
    coordenadas: initialData?.coordenadas,
    domicilio: {
      pais: 'México',
      codigoPostal: '',
      estado: '',
      municipio: '',
      colonia: '',
      calle: '',
      numExterior: '',
      numInterior: '',
      localidad: '',
      referencia: '',
      ...initialData?.domicilio
    }
  });

  const updateField = useCallback((field: string, value: any) => {
    setUbicacion(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else if (keys.length === 2 && keys[0] === 'domicilio') {
        return {
          ...prev,
          domicilio: {
            ...prev.domicilio,
            [keys[1]]: value
          }
        };
      }
      return prev;
    });
  }, []);

  const updateUbicacion = useCallback((newData: Partial<Ubicacion>) => {
    setUbicacion(prev => ({
      ...prev,
      ...newData,
      tipoUbicacion: newData.tipoUbicacion || prev.tipoUbicacion,
      idUbicacion: newData.idUbicacion || prev.idUbicacion,
      id: newData.id || prev.id
    }));
  }, []);

  return {
    ubicacion,
    setUbicacion,
    updateField,
    updateUbicacion
  };
};
