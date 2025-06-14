
// Re-exportar todo desde el hook real para mantener compatibilidad
export * from './useCatalogosReal';

// Hook de compatibilidad que redirige al servicio real
import { useCatalogosReal } from './useCatalogosReal';

export const useCatalogos = useCatalogosReal;

// Alias para mantener compatibilidad con código existente
export const useBuscarTipoPermiso = (busqueda?: string) => {
  const { useTiposPermiso } = require('./useCatalogosReal');
  return useTiposPermiso(busqueda);
};

export const useBuscarConfigVehicular = (busqueda?: string) => {
  const { useConfiguracionesVehiculo } = require('./useCatalogosReal');
  return useConfiguracionesVehiculo(busqueda);
};
