
import { useState, useCallback } from 'react';
import { Ubicacion, UbicacionFrecuente } from '@/types/ubicaciones';

export interface RFCValidationResult {
  isValid: boolean;
  message: string;
  esValido: boolean;
  errores: string[];
}

export const useUbicacionForm = (initialData?: Partial<Ubicacion>, generarId?: (tipo: 'Origen' | 'Destino' | 'Paso Intermedio') => string) => {
  const [formData, setFormData] = useState<Ubicacion>({
    id: initialData?.id || '',
    idUbicacion: initialData?.idUbicacion || '',
    // CAMBIO: valor por defecto vacío, obliga a usuario a seleccionar
    tipoUbicacion: initialData?.tipoUbicacion || '',
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

  const [rfcValidation, setRfcValidation] = useState<RFCValidationResult>({ 
    isValid: true, 
    message: '',
    esValido: true,
    errores: []
  });
  const [showFrecuentes, setShowFrecuentes] = useState(false);

  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData(prev => {
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

  const handleTipoChange = useCallback((tipo: string) => {
    // CAMBIO: Solo permite selecciona si es O, D o PI (y generaId sigue funcionando)
    if (!tipo) {
      setFormData(prev => ({
        ...prev,
        tipoUbicacion: ''
      }));
      return;
    }
    const newId = generarId ? generarId(tipo as 'Origen' | 'Destino' | 'Paso Intermedio') : `${tipo}_${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      tipoUbicacion: tipo as 'Origen' | 'Destino' | 'Paso Intermedio',
      idUbicacion: newId
    }));
  }, [generarId]);

  const handleRFCChange = useCallback((rfc: string) => {
    setFormData(prev => ({ ...prev, rfcRemitenteDestinatario: rfc.toUpperCase() }));
    const rfcRegex = /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    if (rfc && !rfcRegex.test(rfc.toUpperCase())) {
      setRfcValidation({ 
        isValid: false, 
        message: 'RFC inválido',
        esValido: false,
        errores: ['RFC inválido']
      });
    } else {
      setRfcValidation({ 
        isValid: true, 
        message: '',
        esValido: true,
        errores: []
      });
    }
  }, []);

  const handleLocationUpdate = useCallback((locationData: any) => {
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio,
        ...locationData
      }
    }));
  }, []);

  const cargarUbicacionFrecuente = useCallback((ubicacionFrecuente: UbicacionFrecuente) => {
    setFormData(prev => ({
      ...prev,
      rfcRemitenteDestinatario: ubicacionFrecuente.rfcAsociado,
      nombreRemitenteDestinatario: ubicacionFrecuente.nombreUbicacion,
      domicilio: ubicacionFrecuente.domicilio
    }));
  }, []);

  // CAMBIO: Validar que tipoUbicacion está seleccionado explícitamente
  const isFormValid = useCallback(() => {
    return !!(
      formData.tipoUbicacion && // Obligatorio para avanzar
      formData.rfcRemitenteDestinatario &&
      formData.nombreRemitenteDestinatario &&
      formData.domicilio.codigoPostal &&
      formData.domicilio.calle &&
      rfcValidation.isValid
    );
  }, [formData, rfcValidation]);

  return {
    formData,
    setFormData,
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
};
