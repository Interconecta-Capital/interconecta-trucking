
import { useState, useEffect } from 'react';
import { RFCValidator } from '@/utils/rfcValidation';
import { Ubicacion, UbicacionFrecuente } from '@/hooks/useUbicaciones';

export function useUbicacionForm(
  ubicacion?: Ubicacion,
  generarId?: (tipo: 'Origen' | 'Destino' | 'Paso Intermedio') => string
) {
  const [formData, setFormData] = useState<Ubicacion>({
    idUbicacion: '',
    tipoUbicacion: undefined as any,
    rfcRemitenteDestinatario: '',
    nombreRemitenteDestinatario: '',
    fechaHoraSalidaLlegada: '',
    distanciaRecorrida: 0,
    ordenSecuencia: 1,
    domicilio: {
      pais: 'México',
      codigoPostal: '',
      estado: '',
      municipio: '',
      localidad: '',
      colonia: '',
      calle: '',
      numExterior: '',
      numInterior: '',
      referencia: '',
    },
  });

  const [rfcValidation, setRfcValidation] = useState<ReturnType<typeof RFCValidator.validarRFC>>({
    esValido: true,
    errores: []
  });

  const [showFrecuentes, setShowFrecuentes] = useState(false);

  useEffect(() => {
    if (ubicacion) {
      setFormData(ubicacion);
    }
  }, [ubicacion]);

  const handleTipoChange = (tipo: 'Origen' | 'Destino' | 'Paso Intermedio') => {
    if (!generarId) return;
    
    const newId = generarId(tipo);
    
    setFormData(prev => ({
      ...prev,
      tipoUbicacion: tipo,
      idUbicacion: newId,
    }));
  };

  const handleRFCChange = (rfc: string) => {
    if (rfc.length > 0) {
      const rfcFormateado = RFCValidator.formatearRFC(rfc);
      const validation = RFCValidator.validarRFC(rfcFormateado);
      
      setFormData(prev => ({ 
        ...prev, 
        rfcRemitenteDestinatario: rfcFormateado 
      }));
      setRfcValidation(validation);
    } else {
      setFormData(prev => ({ 
        ...prev, 
        rfcRemitenteDestinatario: rfc 
      }));
      setRfcValidation({ esValido: true, errores: [] });
    }
  };

  const handleLocationUpdate = (locationData: any) => {
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio,
        estado: locationData.estado || '',
        municipio: locationData.municipio || '',
        localidad: locationData.localidad || '',
        colonia: locationData.colonia || '',
      }
    }));
  };

  const handleFieldChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        if (parent === 'domicilio') {
          return {
            ...prev,
            domicilio: {
              ...prev.domicilio,
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const cargarUbicacionFrecuente = (frecuente: UbicacionFrecuente) => {
    setFormData(prev => ({
      ...prev,
      rfcRemitenteDestinatario: frecuente.rfcAsociado,
      nombreRemitenteDestinatario: frecuente.nombreUbicacion,
      domicilio: frecuente.domicilio
    }));
    setShowFrecuentes(false);
  };

  const isFormValid = (): boolean => {
    const hasValidType = Boolean(formData.tipoUbicacion != null && formData.tipoUbicacion !== undefined);
    const hasValidRFC = Boolean(formData.rfcRemitenteDestinatario === '' || rfcValidation.esValido);
    const hasValidData = Boolean(
      formData.nombreRemitenteDestinatario && 
      formData.domicilio.codigoPostal &&
      formData.domicilio.estado &&
      formData.domicilio.calle
    );
    
    return hasValidType && hasValidRFC && hasValidData;
  };

  return {
    formData,
    rfcValidation,
    showFrecuentes,
    setShowFrecuentes,
    handleTipoChange,
    handleRFCChange,
    handleLocationUpdate,
    handleFieldChange,
    cargarUbicacionFrecuente,
    isFormValid
  };
}
