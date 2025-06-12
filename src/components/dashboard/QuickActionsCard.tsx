
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, FileText, Users, Truck, BarChart3, UserCheck } from 'lucide-react';
import { ConductorFormModal } from './ConductorFormModal';
import { VehiculoFormModal } from './VehiculoFormModal';
import { SocioFormModal } from './SocioFormModal';

export function QuickActionsCard() {
  const [showConductorForm, setShowConductorForm] = useState(false);
  const [showVehiculoForm, setShowVehiculoForm] = useState(false);
  const [showSocioForm, setShowSocioForm] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link to="/cartas-porte" className="block">
            <Button 
              className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Carta Porte
            </Button>
          </Link>
          
          <Link to="/cartas-porte" className="block">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Ver Documentos
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setShowConductorForm(true)}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Nuevo Conductor
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setShowVehiculoForm(true)}
          >
            <Truck className="h-4 w-4 mr-2" />
            Nuevo Vehículo
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setShowSocioForm(true)}
          >
            <Users className="h-4 w-4 mr-2" />
            Nuevo Socio
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reportes
          </Button>
        </CardContent>
      </Card>

      <ConductorFormModal 
        open={showConductorForm}
        onOpenChange={setShowConductorForm}
      />
      
      <VehiculoFormModal 
        open={showVehiculoForm}
        onOpenChange={setShowVehiculoForm}
      />
      
      <SocioFormModal 
        open={showSocioForm}
        onOpenChange={setShowSocioForm}
      />
    </>
  );
}
