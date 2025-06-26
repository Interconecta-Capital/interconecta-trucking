
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Route, Car, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';

export function QuickActionsCard() {
  const permissions = useUnifiedPermissionsV2();
  
  // Todos los usuarios autenticados pueden crear (solo con límites de cantidad en Plan Gratis)
  const canCreate = permissions.isAuthenticated && permissions.accessLevel !== 'blocked';
  
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Plus className="h-5 w-5 text-blue-600" />
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link to="/viajes/programar">
          <Button 
            variant="outline" 
            className="w-full justify-start h-12 gap-3 text-left"
            disabled={!canCreate}
          >
            <Route className="h-4 w-4 text-blue-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Programar Nuevo Viaje</div>
              <div className="text-xs text-gray-600">Crear operación logística completa</div>
            </div>
          </Button>
        </Link>
        
        <Link to="/cartas-porte">
          <Button 
            variant="outline" 
            className="w-full justify-start h-12 gap-3 text-left"
            disabled={!canCreate}
          >
            <FileText className="h-4 w-4 text-green-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Nueva Carta Porte</div>
              <div className="text-xs text-gray-600">Crear documento fiscal SAT</div>
            </div>
          </Button>
        </Link>
        
        <Link to="/vehiculos">
          <Button 
            variant="outline" 
            className="w-full justify-start h-12 gap-3 text-left"
            disabled={!canCreate}
          >
            <Car className="h-4 w-4 text-orange-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Registrar Vehículo</div>
              <div className="text-xs text-gray-600">Agregar nueva unidad</div>
            </div>
          </Button>
        </Link>
        
        <Link to="/conductores">
          <Button 
            variant="outline" 
            className="w-full justify-start h-12 gap-3 text-left"
            disabled={!canCreate}
          >
            <Users className="h-4 w-4 text-purple-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Registrar Conductor</div>
              <div className="text-xs text-gray-600">Agregar nuevo operador</div>
            </div>
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
