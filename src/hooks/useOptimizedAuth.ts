
import { useUnifiedAuth } from './useUnifiedAuth';

// Re-exportar el hook unificado con el nombre que se espera
export const useAuth = useUnifiedAuth;

// Hook de compatibilidad para mantener la interfaz existente
export const useOptimizedAuth = useUnifiedAuth;
