
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLimitChecker } from '@/hooks/useLimitChecker';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { toast } from 'sonner';

export const FreemiumTestButtons = () => {
  const { simulateCreateVehicle, simulateCreateTrip, simulateCreatePartner } = useLimitChecker();
  const permissions = useUnifiedPermissionsV2();

  const handleTest = async (testFunction: () => Promise<any>, actionName: string) => {
    try {
      const result = await testFunction();
      toast.success(result.message);
    } catch (error: any) {
      // El interceptor debería manejar el error 402
      console.log(`[FreemiumTest] Error en ${actionName}:`, error);
      
      // Si no es un error 402, mostrar toast de error genérico
      if (error.response?.status !== 402) {
        toast.error(`Error al ${actionName.toLowerCase()}`);
      }
    }
  };

  // Solo mostrar si el usuario está en plan freemium
  if (permissions.accessLevel !== 'freemium') {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">🧪 Pruebas Plan Freemium</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTest(simulateCreateVehicle, 'Crear Vehículo')}
          >
            Probar Crear Vehículo
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTest(simulateCreateTrip, 'Crear Viaje')}
          >
            Probar Crear Viaje
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTest(simulateCreatePartner, 'Crear Socio')}
          >
            Probar Crear Socio
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground mt-2">
          Estos botones simulan las acciones que activarían los límites del plan freemium.
        </div>
      </CardContent>
    </Card>
  );
};
