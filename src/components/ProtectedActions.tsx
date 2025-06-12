
import { ReactNode } from 'react';
import { usePermisosSubscripcion } from '@/hooks/usePermisosSubscripcion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ProtectedActionsProps {
  children: ReactNode;
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
  const { puedeCrear } = usePermisosSubscripcion();
  
  const handleAction = () => {
    const { puede, razon } = puedeCrear(resource);
    
    if (!puede) {
      toast.error(razon);
      return;
    }
    
    if (onAction) {
      onAction();
    }
  };

  if (action === 'create') {
    return (
      <Button onClick={handleAction} variant={variant} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        {buttonText}
      </Button>
    );
  }

  return <>{children}</>;
};
