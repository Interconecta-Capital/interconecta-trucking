
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
    tipoUbicacion: initialData?.tipoUbicacion || '', // Vacío por defecto
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
    if (!tipo || tipo === '') {
      // Limpiar ID si se deselecciona el tipo
      setFormData(prev => ({
        ...prev,
        tipoUbicacion: '',
        idUbicacion: ''
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
    
    // Basic RFC validation
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

  // Nuevo: Manejar selección de dirección desde Mapbox
  const handleMapboxAddressSelect = useCallback((addressData: any) => {
    console.log('Dirección seleccionada desde Mapbox:', addressData);
    
    // Extraer componentes de la dirección de Mapbox
    const components = addressData.place_name ? addressData.place_name.split(', ') : [];
    let calle = '';
    let colonia = '';
    let municipio = '';
    let estado = '';
    let codigoPostal = '';

    // Parsear la dirección de Mapbox (formato típico: "Calle Número, Colonia, Municipio, Estado CP, País")
    if (components.length >= 4) {
      calle = components[0] || '';
      colonia = components[1] || '';
      municipio = components[2] || '';
      
      // El estado y CP suelen venir juntos en el último componente antes del país
      const estadoCP = components[components.length - 2] || '';
      const cpMatch = estadoCP.match(/(\d{5})/);
      if (cpMatch) {
        codigoPostal = cpMatch[1];
        estado = estadoCP.replace(cpMatch[0], '').trim();
      } else {
        estado = estadoCP;
      }
    }

    // Actualizar el formulario con los datos de Mapbox
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio,
        calle: calle,
        colonia: colonia,
        municipio: municipio,
        estado: estado,
        codigoPostal: codigoPostal
      },
      coordenadas: addressData.center ? {
        latitud: addressData.center[1],
        longitud: addressData.center[0]
      } : prev.coordenadas
    }));
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

  const isFormValid = useCallback(() => {
    return !!(
      formData.tipoUbicacion && // Ahora requerimos que se seleccione un tipo
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
    handleMapboxAddressSelect,
    cargarUbicacionFrecuente,
    isFormValid
  };
};
