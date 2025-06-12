
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, MapPin, Clock, User, Truck } from 'lucide-react';

export function ProgramacionViajes() {
  // Mock data para viajes programados - en el futuro se conectará con la API
  const viajesProgramados = [
    {
      id: '1',
      carta_porte_id: 'CP-003',
      origen: 'Guadalajara',
      destino: 'Cancún',
      fecha_programada: '2024-06-15T10:00:00Z',
      conductor_asignado: 'Carlos López',
      vehiculo_asignado: 'DEF-456',
      estado: 'confirmado'
    },
    {
      id: '2',
      carta_porte_id: 'CP-004',
      origen: 'Puebla',
      destino: 'Mérida',
      fecha_programada: '2024-06-16T08:00:00Z',
      conductor_asignado: null,
      vehiculo_asignado: null,
      estado: 'pendiente'
    }
  ];

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'confirmado':
        return <Badge className="bg-green-100 text-green-800">Confirmado</Badge>;
      case 'pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Viajes Programados
            </CardTitle>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Programar Viaje
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {viajesProgramados.map((viaje) => (
              <Card key={viaje.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">Carta Porte: {viaje.carta_porte_id}</h3>
                      {getEstadoBadge(viaje.estado)}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        Asignar Recursos
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Origen:</span> {viaje.origen}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <span className="font-medium">Destino:</span> {viaje.destino}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Fecha programada:</span> 
                        {new Date(viaje.fecha_programada).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">Conductor:</span> 
                        {viaje.conductor_asignado || (
                          <Badge variant="outline" className="text-red-600">Sin asignar</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Vehículo:</span> 
                        {viaje.vehiculo_asignado || (
                          <Badge variant="outline" className="text-red-600">Sin asignar</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {(!viaje.conductor_asignado || !viaje.vehiculo_asignado) && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                      ⚠️ Este viaje necesita asignación de recursos antes de poder ejecutarse
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
