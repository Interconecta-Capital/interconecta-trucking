
import { ReactNode } from 'react';
import { usePermisosSubscripcion } from '@/hooks/usePermisosSubscripcion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProtectedFeatureProps {
  children: ReactNode;
  feature: string;
  fallback?: ReactNode;
}

export const ProtectedFeature = ({ children, feature, fallback }: ProtectedFeatureProps) => {
  const { puedeAcceder } = usePermisosSubscripcion();
  const navigate = useNavigate();
  
  const { puede, razon } = puedeAcceder(feature);

  if (puede) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Alert>
      <Lock className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{razon}</span>
        <Button 
          size="sm" 
          onClick={() => navigate('/planes')}
          className="ml-4"
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          Actualizar Plan
        </Button>
      </AlertDescription>
    </Alert>
  );
};
