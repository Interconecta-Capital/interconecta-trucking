
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Users, Truck, BarChart3, UserCheck, Wrench, MapPin, CheckCircle, CalendarIcon } from 'lucide-react';
import { ProtectedActions } from '@/components/ProtectedActions';
import { ProtectedFeature } from '@/components/ProtectedFeature';
import { ConductorFormModal } from './ConductorFormModal';
import { VehiculoFormModal } from './VehiculoFormModal';
import { SocioFormModal } from './SocioFormModal';
import { MantenimientoFormModal } from './MantenimientoFormModal';
import { VerificacionFormModal } from './VerificacionFormModal';
import { RevisionGPSFormModal } from './RevisionGPSFormModal';
import { CartaPorteFormModal } from './CartaPorteFormModal';

// Mock data para eventos próximos
const mockEventos = [
  {
    fecha: new Date(2024, 5, 15),
    tipo: 'viaje',
    titulo: 'Viaje CDMX - Guadalajara',
    color: 'bg-green-100 text-green-800'
  },
  {
    fecha: new Date(2024, 5, 18),
    tipo: 'mantenimiento',
    titulo: 'Mantenimiento Preventivo',
    color: 'bg-red-100 text-red-800'
  },
  {
    fecha: new Date(2024, 5, 20),
    tipo: 'entrega',
    titulo: 'Entrega Cliente XYZ',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    fecha: new Date(2024, 5, 22),
    tipo: 'revision_gps',
    titulo: 'Revisión GPS',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    fecha: new Date(2024, 5, 25),
    tipo: 'verificacion',
    titulo: 'Verificación Vehicular',
    color: 'bg-orange-100 text-orange-800'
  }
];

export function QuickActionsCard() {
  const navigate = useNavigate();
  const [showConductorForm, setShowConductorForm] = useState(false);
  const [showVehiculoForm, setShowVehiculoForm] = useState(false);
  const [showSocioForm, setShowSocioForm] = useState(false);
  const [showMantenimientoForm, setShowMantenimientoForm] = useState(false);
  const [showVerificacionForm, setShowVerificacionForm] = useState(false);
  const [showRevisionGPSForm, setShowRevisionGPSForm] = useState(false);
  const [showCartaPorteForm, setShowCartaPorteForm] = useState(false);

  const handleVerDocumentos = () => {
    navigate('/cartas-porte');
  };

  return (
    <>
      <div className="space-y-6">
        {/* Acciones Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ProtectedFeature blockOnRestriction={true}>
              <ProtectedActions 
                action="create" 
                resource="cartas_porte"
                onAction={() => setShowCartaPorteForm(true)}
                buttonText="Nueva Carta Porte"
                variant="default"
              />
            </ProtectedFeature>
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-10"
              onClick={handleVerDocumentos}
            >
              <FileText className="h-4 w-4 mr-2" />
              Ver Documentos
            </Button>
            
            <ProtectedFeature blockOnRestriction={true}>
              <ProtectedActions 
                action="create" 
                resource="conductores"
                onAction={() => setShowConductorForm(true)}
                buttonText="Nuevo Conductor"
                variant="outline"
              />
            </ProtectedFeature>
            
            <ProtectedFeature blockOnRestriction={true}>
              <ProtectedActions 
                action="create" 
                resource="vehiculos"
                onAction={() => setShowVehiculoForm(true)}
                buttonText="Nuevo Vehículo"
                variant="outline"
              />
            </ProtectedFeature>
            
            <ProtectedFeature blockOnRestriction={true}>
              <ProtectedActions 
                action="create" 
                resource="socios"
                onAction={() => setShowSocioForm(true)}
                buttonText="Nuevo Socio"
                variant="outline"
              />
            </ProtectedFeature>

            <ProtectedFeature blockOnRestriction={true}>
              <Button 
                variant="outline" 
                className="w-full justify-start h-10"
                onClick={() => setShowMantenimientoForm(true)}
                disabled
              >
                <Wrench className="h-4 w-4 mr-2" />
                Programar Mantenimiento
              </Button>
            </ProtectedFeature>

            <ProtectedFeature blockOnRestriction={true}>
              <Button 
                variant="outline" 
                className="w-full justify-start h-10"
                onClick={() => setShowVerificacionForm(true)}
                disabled
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Programar Verificación
              </Button>
            </ProtectedFeature>

            <ProtectedFeature blockOnRestriction={true}>
              <Button 
                variant="outline" 
                className="w-full justify-start h-10"
                onClick={() => setShowRevisionGPSForm(true)}
                disabled
              >
                <MapPin className="h-4 w-4 mr-2" />
                Revisión GPS
              </Button>
            </ProtectedFeature>
            
            <Button variant="outline" className="w-full justify-start h-10">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reportes
            </Button>
          </CardContent>
        </Card>

        {/* Próximos Eventos - Movido al final como resumen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Resumen de Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {mockEventos.slice(0, 3).map((evento, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    {evento.tipo === 'viaje' && <Truck className="h-3 w-3 text-green-600" />}
                    {evento.tipo === 'mantenimiento' && <Wrench className="h-3 w-3 text-red-600" />}
                    {evento.tipo === 'entrega' && <MapPin className="h-3 w-3 text-orange-600" />}
                    {evento.tipo === 'revision_gps' && <MapPin className="h-3 w-3 text-purple-600" />}
                    {evento.tipo === 'verificacion' && <CheckCircle className="h-3 w-3 text-orange-600" />}
                    <div>
                      <p className="text-xs font-medium">{evento.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        {evento.fecha.toLocaleDateString('es-ES', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`${evento.color} text-xs`}>
                    {evento.tipo.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full text-xs mt-2">
              Ver todos los eventos
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modales para formularios */}
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

      <CartaPorteFormModal 
        open={showCartaPorteForm}
        onOpenChange={setShowCartaPorteForm}
      />
    </>
  );
}
