
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';

export function HistorialViajes() {
  // Mock data para el historial - en el futuro se conectará con la API
  const historialViajes = [
    {
      id: '1',
      carta_porte_id: 'CP-001',
      origen: 'Ciudad de México',
      destino: 'Guadalajara',
      estado: 'completado',
      fecha_inicio: '2024-06-10T08:00:00Z',
      fecha_fin: '2024-06-10T18:00:00Z',
      conductor: 'Juan Pérez',
      vehiculo: 'ABC-123'
    },
    {
      id: '2',
      carta_porte_id: 'CP-002',
      origen: 'Monterrey',
      destino: 'Tijuana',
      estado: 'cancelado',
      fecha_inicio: '2024-06-09T06:00:00Z',
      fecha_fin: null,
      conductor: 'María García',
      vehiculo: 'XYZ-789'
    }
  ];

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelado':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historial de Viajes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {historialViajes.map((viaje) => (
              <Card key={viaje.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getEstadoIcon(viaje.estado)}
                      <h3 className="font-semibold">Carta Porte: {viaje.carta_porte_id}</h3>
                      {getEstadoBadge(viaje.estado)}
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
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
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Inicio:</span> 
                        {new Date(viaje.fecha_inicio).toLocaleString()}
                      </div>
                      {viaje.fecha_fin && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Fin:</span> 
                          {new Date(viaje.fecha_fin).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <span><span className="font-medium">Conductor:</span> {viaje.conductor}</span>
                    <span><span className="font-medium">Vehículo:</span> {viaje.vehiculo}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
