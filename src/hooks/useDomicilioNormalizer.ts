/**
 * Hook para normalizar campos de domicilio entre camelCase y snake_case
 * Proporciona compatibilidad bidireccional durante la migración
 */

import { useCallback } from 'react';

export const useDomicilioNormalizer = () => {
  
  // Convierte de cualquier formato a snake_case (nuevo estándar)
  const toSnakeCase = useCallback((domicilio: any) => {
    if (!domicilio) return domicilio;
    
    const normalized: any = { ...domicilio };
    
    // Mapeos de camelCase -> snake_case
    const mappings = {
      codigoPostal: 'codigo_postal',
      numExterior: 'num_exterior',
      numInterior: 'num_interior'
    };
    
    Object.entries(mappings).forEach(([camel, snake]) => {
      if (camel in normalized) {
        normalized[snake] = normalized[camel];
        delete normalized[camel];
      }
    });
    
    return normalized;
  }, []);
  
  // Convierte de snake_case a camelCase (para APIs antiguas si es necesario)
  const toCamelCase = useCallback((domicilio: any) => {
    if (!domicilio) return domicilio;
    
    const normalized: any = { ...domicilio };
    
    // Mapeos de snake_case -> camelCase
    const mappings = {
      codigo_postal: 'codigoPostal',
      num_exterior: 'numExterior',
      num_interior: 'numInterior'
    };
    
    Object.entries(mappings).forEach(([snake, camel]) => {
      if (snake in normalized) {
        normalized[camel] = normalized[snake];
        delete normalized[snake];
      }
    });
    
    return normalized;
  }, []);
  
  // Normaliza una ubicación completa
  const normalizeUbicacion = useCallback((ubicacion: any) => {
    if (!ubicacion) return ubicacion;
    
    return {
      ...ubicacion,
      domicilio: toSnakeCase(ubicacion.domicilio)
    };
  }, [toSnakeCase]);
  
  // Normaliza un array de ubicaciones
  const normalizeUbicaciones = useCallback((ubicaciones: any[]) => {
    if (!Array.isArray(ubicaciones)) return ubicaciones;
    
    return ubicaciones.map(normalizeUbicacion);
  }, [normalizeUbicacion]);
  
  // Obtiene el valor de un campo sin importar el formato
  const getDomicilioField = useCallback((domicilio: any, field: string): any => {
    if (!domicilio) return undefined;
    
    // Intentar ambos formatos
    const snakeCase = field.replace(/([A-Z])/g, '_$1').toLowerCase();
    const camelCase = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    return domicilio[field] || domicilio[snakeCase] || domicilio[camelCase];
  }, []);
  
  return {
    toSnakeCase,
    toCamelCase,
    normalizeUbicacion,
    normalizeUbicaciones,
    getDomicilioField
  };
};
