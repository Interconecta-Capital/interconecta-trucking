import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Truck, User, FileText, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { VehiculoFormModal } from '../forms/VehiculoFormModal';
import { ConductorFormModal } from '../forms/ConductorFormModal';
import { SocioFormModal } from '../forms/SocioFormModal';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useConductores } from '@/hooks/useConductores';
import { useSocios } from '@/hooks/useSocios';

export function QuickActionsCard() {
  const [showVehiculoForm, setShowVehiculoForm] = useState(false);
  const [showConductorForm, setShowConductorForm] = useState(false);
  const [showSocioForm, setShowSocioForm] = useState(false);
  const { crearVehiculo } = useVehiculos();
  const { crearConductor } = useConductores();
  const { crearSocio } = useSocios();

  const handleCreateVehiculo = async (data: any) => {
    await crearVehiculo(data);
    setShowVehiculoForm(false);
  };

  const handleCreateConductor = async (data: any) => {
    await crearConductor(data);
    setShowConductorForm(false);
  };

  const handleCreateSocio = async (data: any) => {
    await crearSocio(data);
    setShowSocioForm(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
          <CardDescription>
            Accesos directos a las funciones principales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            asChild 
            className="w-full justify-start bg-blue-600 hover:bg-blue-700"
          >
            <Link to="/cartas-porte/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Carta Porte
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setShowVehiculoForm(true)}
          >
            <Truck className="h-4 w-4 mr-2" />
            Registrar Vehículo
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setShowConductorForm(true)}
          >
            <User className="h-4 w-4 mr-2" />
            Registrar Conductor
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setShowSocioForm(true)}
          >
            <Building className="h-4 w-4 mr-2" />
            Registrar Socio
          </Button>
          
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/cartas-porte">
              <FileText className="h-4 w-4 mr-2" />
              Ver Cartas Porte
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Modales */}
      <VehiculoFormModal
        open={showVehiculoForm}
        onOpenChange={setShowVehiculoForm}
        onSubmit={handleCreateVehiculo}
      />
      
      <ConductorFormModal
        open={showConductorForm}
        onOpenChange={setShowConductorForm}
        onSubmit={handleCreateConductor}
      />
      
      <SocioFormModal
        open={showSocioForm}
        onOpenChange={setShowSocioForm}
        onSubmit={handleCreateSocio}
      />
    </>
  );
}
