
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Truck, Users, FileText, Route } from 'lucide-react';
import { useLimitChecker } from '@/hooks/useLimitChecker';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { toast } from 'sonner';

export const FreemiumTestButtons: React.FC = () => {
  const { simulateApiCall } = useLimitChecker();
  const permissions = useUnifiedPermissionsV2();

  const handleTestAction = async (resourceType: string, actionName: string) => {
    try {
      await simulateApiCall(resourceType);
      toast.success(`${actionName} creado exitosamente`);
    } catch (error: any) {
      // El interceptor de Axios manejará el error y mostrará el modal
      if (!error.handled) {
        toast.error('Error inesperado al crear ' + actionName.toLowerCase());
      }
    }
  };

  // Solo mostrar si está en plan Freemium
  if (permissions.accessLevel !== 'freemium') {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Panel de Pruebas - Plan Freemium
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Usa estos botones para probar los límites del plan Freemium
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Button
            onClick={() => handleTestAction('vehiculos', 'Vehículo')}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            <Car className="h-4 w-4" />
            Crear Vehículo
          </Button>
          <p className="text-xs text-muted-foreground">
            Límite: 3 vehículos (actual: 2)
          </p>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => handleTestAction('remolques', 'Remolque')}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            <Truck className="h-4 w-4" />
            Crear Remolque
          </Button>
          <p className="text-xs text-muted-foreground">
            Límite: 2 remolques (actual: 1)
          </p>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => handleTestAction('socios', 'Socio')}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            <Users className="h-4 w-4" />
            Crear Socio
          </Button>
          <p className="text-xs text-muted-foreground">
            Límite: 5 socios (actual: 4)
          </p>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => handleTestAction('viajes', 'Viaje')}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            <Route className="h-4 w-4" />
            Crear Viaje
          </Button>
          <p className="text-xs text-muted-foreground">
            Límite: 5/mes (actual: 4)
          </p>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => handleTestAction('cartas_porte', 'Carta Porte')}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            <FileText className="h-4 w-4" />
            Timbrar Carta
          </Button>
          <p className="text-xs text-muted-foreground">
            Límite: 5/mes (actual: 3)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
