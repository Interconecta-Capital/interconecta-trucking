
import { ReactNode } from 'react';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ProtectedActionsProps {
  children?: ReactNode;
  action: 'create';
  resource: 'conductores' | 'vehiculos' | 'socios' | 'cartas_porte';
  onAction?: () => void;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export const ProtectedActions = ({ 
  children, 
  action, 
  resource, 
  onAction,
  buttonText = 'Crear',
  variant = 'default'
}: ProtectedActionsProps) => {
  const { puedeCrear, isSuperuser } = useEnhancedPermissions();
  
  const handleAction = () => {
    // Superusers can always create
    if (isSuperuser) {
      if (onAction) {
        onAction();
      }
      return;
    }

    const result = puedeCrear(resource);
    const puede = result?.puede ?? false;
    const razon = result?.razon;
    
    if (!puede && razon) {
      toast.error(razon);
      return;
    }
    
    if (onAction) {
      onAction();
    }
  };

  // Si no hay children, renderizar como botón
  if (!children && action === 'create') {
    return (
      <Button onClick={handleAction} variant={variant} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        {buttonText}
      </Button>
    );
  }

  // Si hay children, renderizar como wrapper
  return <>{children}</>;
};
