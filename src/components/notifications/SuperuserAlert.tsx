
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown } from 'lucide-react';

export function SuperuserAlert() {
  return (
    <Alert className="border-yellow-200 bg-yellow-50 mb-4">
      <Crown className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <strong>Modo Superuser:</strong> Acceso completo sin restricciones de plan o límites.
      </AlertDescription>
    </Alert>
  );
}
