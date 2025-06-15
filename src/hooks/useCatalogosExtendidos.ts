
import { useQuery } from '@tanstack/react-query';
import { CatalogItem } from '@/utils/catalogAdapters';

// Mock hook for fracciones arancelarias - replace with real implementation
export function useFraccionesArancelarias(termino: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['fracciones-arancelarias', termino],
    queryFn: async (): Promise<CatalogItem[]> => {
      // Mock data - replace with real API call
      if (!termino || termino.length < 2) return [];
      
      return [
        { value: '01011000', label: '01011000 - Caballos reproductores de raza pura' },
        { value: '01012100', label: '01012100 - Caballos vivos excepto reproductores' }
      ];
    },
    enabled: enabled && termino.length >= 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
