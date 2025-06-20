
import { ReactNode } from 'react';
import { UnifiedProtectedContent } from './UnifiedProtectedContent';

interface ProtectedContentProps {
  children: ReactNode;
  requiredAction?: 'create' | 'read' | 'update' | 'delete';
  resource?: string;
  requiredFeature?: string; // Añadido para compatibilidad
  fallback?: ReactNode;
  showUpgrade?: boolean;
  blockOnRestriction?: boolean;
}

export const ProtectedContent = ({ 
  children, 
  requiredAction = 'read',
  resource,
  requiredFeature, // Mapear a resource si no hay resource específico
  fallback,
  showUpgrade = true,
  blockOnRestriction = false
}: ProtectedContentProps) => {
  // Si se usa requiredFeature pero no resource, mapear requiredFeature a resource
  const finalResource = resource || requiredFeature;
  
  return (
    <UnifiedProtectedContent
      requiredAction={requiredAction}
      resource={finalResource as any}
      fallback={fallback}
      showUpgradePrompt={showUpgrade}
      blockOnRestriction={blockOnRestriction}
    >
      {children}
    </UnifiedProtectedContent>
  );
};
