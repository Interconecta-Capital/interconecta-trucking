
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, FileText, Users, Truck, BarChart3, UserCheck, Wrench, MapPin, CheckCircle } from 'lucide-react';
import { ConductorFormModal } from './ConductorFormModal';
import { VehiculoFormModal } from './VehiculoFormModal';
import { SocioFormModal } from './SocioFormModal';
import { MantenimientoFormModal } from './MantenimientoFormModal';
import { VerificacionFormModal } from './VerificacionFormModal';
import { RevisionGPSFormModal } from './RevisionGPSFormModal';

export function QuickActionsCard() {
  const [showConductorForm, setShowConductorForm] = useState(false);
  const [showVehiculoForm, setShowVehiculoForm] = useState(false);
  const [showSocioForm, setShowSocioForm] = useState(false);
  const [showMantenimientoForm, setShowMantenimientoForm] = useState(false);
  const [showVerificacionForm, setShowVerificacionForm] = useState(false);
  const [showRevisionGPSForm, setShowRevisionGPSForm] = useState(false);

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link to="/cartas-porte" className="block">
            <Button 
              className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white h-10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Carta Porte
            </Button>
          </Link>
          
          <Link to="/cartas-porte" className="block">
            <Button variant="outline" className="w-full justify-start h-10">
              <FileText className="h-4 w-4 mr-2" />
              Ver Documentos
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            className="w-full justify-start h-10"
            onClick={() => setShowConductorForm(true)}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Nuevo Conductor
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start h-10"
            onClick={() => setShowVehiculoForm(true)}
          >
            <Truck className="h-4 w-4 mr-2" />
            Nuevo Vehículo
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start h-10"
            onClick={() => setShowSocioForm(true)}
          >
            <Users className="h-4 w-4 mr-2" />
            Nuevo Socio
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start h-10"
            onClick={() => setShowMantenimientoForm(true)}
          >
            <Wrench className="h-4 w-4 mr-2" />
            Programar Mantenimiento
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start h-10"
            onClick={() => setShowVerificacionForm(true)}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Programar Verificación
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start h-10"
            onClick={() => setShowRevisionGPSForm(true)}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Revisión GPS
          </Button>
          
          <Button variant="outline" className="w-full justify-start h-10">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reportes
          </Button>
        </CardContent>
      </Card>

      {/* Modales para formularios in-situ */}
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

      <MantenimientoFormModal 
        open={showMantenimientoForm}
        onOpenChange={setShowMantenimientoForm}
      />

      <VerificacionFormModal 
        open={showVerificacionForm}
        onOpenChange={setShowVerificacionForm}
      />

      <RevisionGPSFormModal 
        open={showRevisionGPSForm}
        onOpenChange={setShowRevisionGPSForm}
      />
    </>
  );
}
