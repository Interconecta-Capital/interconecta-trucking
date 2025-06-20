
import { ReactNode } from 'react';
import { UnifiedProtectedContent } from './UnifiedProtectedContent';

interface ProtectedContentProps {
  children: ReactNode;
  requiredAction?: 'create' | 'read' | 'update' | 'delete';
  resource?: string;
  fallback?: ReactNode;
  showUpgrade?: boolean;
  blockOnRestriction?: boolean;
}

export const ProtectedContent = ({ 
  children, 
  requiredAction = 'read',
  resource,
  fallback,
  showUpgrade = true,
  blockOnRestriction = false
}: ProtectedContentProps) => {
  return (
    <UnifiedProtectedContent
      requiredAction={requiredAction}
      resource={resource as any}
      fallback={fallback}
      showUpgradePrompt={showUpgrade}
      blockOnRestriction={blockOnRestriction}
    >
      {children}
    </UnifiedProtectedContent>
  );
};
