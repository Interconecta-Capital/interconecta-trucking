/**
 * Script de migración temporal para actualizar nombres de campos
 * de camelCase a snake_case en domicilios
 * 
 * Ejecuta este mapper en runtime para compatibilidad
 */

export const migrateDomicilioFields = (domicilio: any): any => {
  if (!domicilio) return domicilio;
  
  const migrated: any = { ...domicilio };
  
  // Migrar codigoPostal -> codigo_postal
  if ('codigoPostal' in migrated && !('codigo_postal' in migrated)) {
    migrated.codigo_postal = migrated.codigoPostal;
    delete migrated.codigoPostal;
  }
  
  // Migrar numExterior -> num_exterior
  if ('numExterior' in migrated && !('num_exterior' in migrated)) {
    migrated.num_exterior = migrated.numExterior;
    delete migrated.numExterior;
  }
  
  // Migrar numInterior -> num_interior
  if ('numInterior' in migrated && !('num_interior' in migrated)) {
    migrated.num_interior = migrated.numInterior;
    delete migrated.numInterior;
  }
  
  return migrated;
};

export const migrateUbicacion = (ubicacion: any): any => {
  if (!ubicacion) return ubicacion;
  
  return {
    ...ubicacion,
    domicilio: migrateDomicilioFields(ubicacion.domicilio)
  };
};

export const migrateUbicaciones = (ubicaciones: any[]): any[] => {
  if (!Array.isArray(ubicaciones)) return ubicaciones;
  
  return ubicaciones.map(migrateUbicacion);
};
