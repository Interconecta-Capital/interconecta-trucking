
import { useMemo } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';

export const useCartaPorteValidation = () => {
  const validateBasic = (data: Partial<CartaPorteData>) => {
    const errors: string[] = [];
    
    if (!data.rfcEmisor) errors.push('RFC Emisor es requerido');
    if (!data.rfcReceptor) errors.push('RFC Receptor es requerido');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validateUbicaciones = (ubicaciones: any[] = []) => {
    const errors: string[] = [];
    
    if (ubicaciones.length === 0) {
      errors.push('Se requiere al menos una ubicación');
      return { isValid: false, errors };
    }

    const tiposUbicacion = ubicaciones.map(u => u.tipo_ubicacion);
    const hasOrigen = tiposUbicacion.includes('Origen');
    const hasDestino = tiposUbicacion.includes('Destino');

    if (!hasOrigen) errors.push('Se requiere al menos una ubicación de Origen');
    if (!hasDestino) errors.push('Se requiere al menos una ubicación de Destino');

    ubicaciones.forEach((ubicacion, index) => {
      if (!ubicacion.rfc) {
        errors.push(`RFC es requerido en ubicación ${index + 1}`);
      }
      if (!ubicacion.nombre) {
        errors.push(`Nombre es requerido en ubicación ${index + 1}`);
      }
      if (!ubicacion.domicilio?.codigo_postal) {
        errors.push(`Código postal es requerido en ubicación ${index + 1}`);
      }
      if (!ubicacion.fecha_hora_salida_llegada) {
        errors.push(`Fecha y hora es requerida en ubicación ${index + 1}`);
      }
      
      // Fixed comparison - removed invalid tipo_ubicacion check
      if (ubicacion.rfc_remitente_destinatario && ubicacion.tipo_ubicacion !== 'Origen' && ubicacion.tipo_ubicacion !== 'Destino') {
        errors.push(`RFC remitente/destinatario solo es válido para ubicaciones de Origen o Destino`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validateMercancias = (mercancias: any[] = []) => {
    const errors: string[] = [];
    
    if (mercancias.length === 0) {
      errors.push('Se requiere al menos una mercancía');
      return { isValid: false, errors };
    }

    mercancias.forEach((mercancia, index) => {
      if (!mercancia.bienes_transp) {
        errors.push(`Descripción de bienes es requerida en mercancía ${index + 1}`);
      }
      if (!mercancia.cantidad || mercancia.cantidad <= 0) {
        errors.push(`Cantidad debe ser mayor a 0 en mercancía ${index + 1}`);
      }
      if (!mercancia.peso_kg || mercancia.peso_kg <= 0) {
        errors.push(`Peso debe ser mayor a 0 en mercancía ${index + 1}`);
      }
      if (!mercancia.clave_unidad) {
        errors.push(`Clave de unidad es requerida en mercancía ${index + 1}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validateAutotransporte = (autotransporte: any) => {
    const errors: string[] = [];
    
    if (!autotransporte) {
      errors.push('Información de autotransporte es requerida');
      return { isValid: false, errors };
    }

    if (!autotransporte.placa_vm) {
      errors.push('Placa del vehículo es requerida');
    }
    if (!autotransporte.config_vehicular) {
      errors.push('Configuración vehicular es requerida');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validateFiguras = (figuras: any[] = []) => {
    const errors: string[] = [];
    
    if (figuras.length === 0) {
      errors.push('Se requiere al menos una figura de transporte');
      return { isValid: false, errors };
    }

    figuras.forEach((figura, index) => {
      if (!figura.tipo_figura) {
        errors.push(`Tipo de figura es requerido en figura ${index + 1}`);
      }
      if (!figura.rfc_figura) {
        errors.push(`RFC es requerido en figura ${index + 1}`);
      }
      if (!figura.nombre_figura) {
        errors.push(`Nombre es requerido en figura ${index + 1}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validateComplete = (data: Partial<CartaPorteData>) => {
    const basicValidation = validateBasic(data);
    const ubicacionesValidation = validateUbicaciones(data.ubicaciones);
    const mercanciasValidation = validateMercancias(data.mercancias);
    const autotransporteValidation = validateAutotransporte(data.autotransporte);
    const figurasValidation = validateFiguras(data.figuras);

    const allErrors = [
      ...basicValidation.errors,
      ...ubicacionesValidation.errors,
      ...mercanciasValidation.errors,
      ...autotransporteValidation.errors,
      ...figurasValidation.errors
    ];

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      sectionValidations: {
        basic: basicValidation.isValid,
        ubicaciones: ubicacionesValidation.isValid,
        mercancias: mercanciasValidation.isValid,
        autotransporte: autotransporteValidation.isValid,
        figuras: figurasValidation.isValid
      }
    };
  };

  return {
    validateBasic,
    validateUbicaciones,
    validateMercancias,
    validateAutotransporte,
    validateFiguras,
    validateComplete
  };
};
