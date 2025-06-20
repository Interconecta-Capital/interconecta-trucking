
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown } from 'lucide-react';

export function SuperuserAlert() {
  return (
    <Alert className="border-yellow-300 bg-yellow-50 mb-4">
      <Crown className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <span className="font-medium">Modo Superusuario Activo</span>
        <div className="text-sm mt-1">
          Tienes acceso completo sin restricciones a todas las funciones del sistema.
        </div>
      </AlertDescription>
    </Alert>
  );
}
