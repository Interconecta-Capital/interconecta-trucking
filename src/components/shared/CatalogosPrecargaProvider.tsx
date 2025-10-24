import { useEffect } from 'react';
import { usePrecargaCatalogos } from '@/hooks/useCatalogosOptimizado';

/**
 * Componente para precargar catálogos SAT al iniciar la aplicación
 * Mejora la experiencia del usuario al tener catálogos frecuentes listos
 */
export function CatalogosPrecargaProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, isError } = usePrecargaCatalogos();

  useEffect(() => {
    if (!isLoading && !isError) {
      console.log('✅ Catálogos SAT precargados y listos para usar');
    }
    if (isError) {
      console.warn('⚠️ Error al precargar catálogos SAT, se cargarán bajo demanda');
    }
  }, [isLoading, isError]);

  return <>{children}</>;
}
