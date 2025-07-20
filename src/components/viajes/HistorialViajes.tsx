
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { ViajeDetalleModal } from './modals/ViajeDetalleModal';
import { useViajesEstados } from '@/hooks/useViajesEstados';

export function HistorialViajes() {
  const { viajesActivos, isLoading } = useViajesEstados();
  const [detalleModal, setDetalleModal] = useState<{ open: boolean; viaje: any }>({
    open: false,
    viaje: null
  });
  const [historialViajes, setHistorialViajes] = useState<any[]>([]);

  useEffect(() => {
    // Usar los viajes reales del hook, incluyendo completados y otros estados
    const viajesConHistorial = viajesActivos.map(viaje => ({
      id: viaje.id,
      carta_porte_id: viaje.carta_porte_id || `CP-${viaje.id.slice(0, 8)}`,
      origen: viaje.origen,
      destino: viaje.destino,
      estado: viaje.estado,
      fecha_inicio_programada: viaje.fecha_inicio_programada,
      fecha_inicio_real: viaje.fecha_inicio_real,
      fecha_fin: viaje.fecha_fin_real || viaje.fecha_fin_programada,
      conductor: viaje.conductor_id ? `Conductor ID: ${viaje.conductor_id.slice(0, 8)}` : 'No asignado',
      vehiculo: viaje.vehiculo_id ? `Vehículo ID: ${viaje.vehiculo_id.slice(0, 8)}` : 'No asignado',
      observaciones: viaje.observaciones || 'Sin observaciones'
    }));

    setHistorialViajes(viajesConHistorial);
  }, [viajesActivos]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando historial...</span>
      </div>
    );
  }

  const handleVerDetalles = (viaje: any) => {
    setDetalleModal({ open: true, viaje });
  };

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
    <>
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleVerDetalles(viaje)}
                      >
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
                          {new Date(viaje.fecha_inicio_programada).toLocaleString()}
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

      <ViajeDetalleModal
        open={detalleModal.open}
        onOpenChange={(open) => setDetalleModal({ open, viaje: detalleModal.viaje })}
        viaje={detalleModal.viaje}
      />
    </>
  );
}
