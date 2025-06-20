
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Route, Car, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export function QuickActionsCard() {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Plus className="h-5 w-5 text-blue-primary" />
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link to="/viajes/programar">
          <Button 
            variant="outline" 
            className="w-full justify-start h-12 gap-3 text-left"
          >
            <Route className="h-4 w-4 text-blue-primary" />
            <div className="text-left">
              <div className="font-medium text-primary">Programar Nuevo Viaje</div>
              <div className="text-xs text-secondary">Crear operación logística completa</div>
            </div>
          </Button>
        </Link>
        
        <Link to="/carta-porte/editor">
          <Button 
            variant="outline" 
            className="w-full justify-start h-12 gap-3 text-left"
          >
            <FileText className="h-4 w-4 text-green-primary" />
            <div className="text-left">
              <div className="font-medium text-primary">Nueva Carta Porte</div>
              <div className="text-xs text-secondary">Crear documento fiscal SAT</div>
            </div>
          </Button>
        </Link>
        
        <Link to="/vehiculos">
          <Button 
            variant="outline" 
            className="w-full justify-start h-12 gap-3 text-left"
          >
            <Car className="h-4 w-4 text-orange-primary" />
            <div className="text-left">
              <div className="font-medium text-primary">Registrar Vehículo</div>
              <div className="text-xs text-secondary">Agregar nueva unidad</div>
            </div>
          </Button>
        </Link>
        
        <Link to="/conductores">
          <Button 
            variant="outline" 
            className="w-full justify-start h-12 gap-3 text-left"
          >
            <Users className="h-4 w-4 text-purple-primary" />
            <div className="text-left">
              <div className="font-medium text-primary">Registrar Conductor</div>
              <div className="text-xs text-secondary">Agregar nuevo operador</div>
            </div>
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
