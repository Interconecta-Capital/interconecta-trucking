
import { usePermissions } from './usePermissions';

// Re-export for compatibility
export const useUnifiedPermissions = usePermissions;

// Export the permission result type
export interface PermissionResult {
  allowed: boolean;
  reason: string;
  limit?: number;
  used?: number;
}

// Re-export everything from usePermissions for compatibility
export * from './usePermissions';
