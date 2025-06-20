
import React, { useState } from 'react';
import { Truck } from 'lucide-react';
import { ProtectedRouteGuard } from '@/components/ProtectedRouteGuard';
import { ProtectedContent } from '@/components/ProtectedContent';
import { ProtectedActions } from '@/components/ProtectedActions';
import { PlanNotifications } from '@/components/common/PlanNotifications';

export default function Viajes() {
  const [showForm, setShowForm] = useState(false);

  const handleNewViaje = () => {
    setShowForm(true);
  };

  return (
    <ProtectedRouteGuard 
      requiredAction="read" 
      resource="cartas_porte"
      redirectTo="/dashboard"
    >
      <ProtectedContent requiredFeature="viajes">
        <div className="container mx-auto py-6 space-y-6">
          <PlanNotifications />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="h-6 w-6 text-blue-600" />
              <h1 className="text-3xl font-bold">Viajes</h1>
            </div>
            <ProtectedActions
              action="create"
              resource="cartas_porte"
              onAction={handleNewViaje}
              buttonText="Nuevo Viaje"
            />
          </div>

          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Gestión de Viajes</h3>
            <p className="text-muted-foreground">
              Funcionalidad disponible para usuarios con acceso completo
            </p>
          </div>
        </div>
      </ProtectedContent>
    </ProtectedRouteGuard>
  );
}
