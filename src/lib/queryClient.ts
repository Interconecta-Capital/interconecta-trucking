
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuración global para reducir requests duplicados
      staleTime: 5 * 60 * 1000, // 5 minutos - los datos se consideran frescos
      gcTime: 10 * 60 * 1000, // 10 minutos - tiempo en cache después de no usar
      refetchOnWindowFocus: false, // No refetch al cambiar ventana
      refetchOnMount: false, // No refetch al montar si hay cache
      refetchInterval: false, // No refetch automático
      retry: (failureCount, error: any) => {
        // No retry en errores 4xx (problemas de permisos/RLS)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2; // Max 2 intentos para otros errores
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});
