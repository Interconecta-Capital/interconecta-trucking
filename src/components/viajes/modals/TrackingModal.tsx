
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Clock, Truck } from 'lucide-react';

interface TrackingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viaje: any;
}

export function TrackingModal({ open, onOpenChange, viaje }: TrackingModalProps) {
  if (!viaje) return null;

  // Mock data para el tracking - en el futuro se conectará con un servicio real
  const trackingData = {
    ubicacionActual: "Carretera México-Guadalajara, Km 25",
    coordenadas: { lat: 19.4326, lng: -99.1332 },
    velocidad: "85 km/h",
    ultimaActualizacion: new Date().toLocaleTimeString(),
    progreso: 35,
    tiempoEstimadoLlegada: "2024-06-12T16:30:00Z"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Tracking en Tiempo Real - {viaje.carta_porte_id}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">Estado:</span>
              <Badge className="bg-green-100 text-green-800">En Tránsito</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Última actualización: {trackingData.ultimaActualizacion}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-base">Ruta</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Origen:</span> {viaje.origen}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Ubicación actual:</span> {trackingData.ubicacionActual}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Destino:</span> {viaje.destino}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-base">Información de Viaje</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Velocidad:</span> {trackingData.velocidad}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="font-medium">ETA:</span>
                  <span className="text-sm">{new Date(trackingData.tiempoEstimadoLlegada).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Progreso del viaje</span>
              <span className="text-sm text-muted-foreground">{trackingData.progreso}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${trackingData.progreso}%` }}
              ></div>
            </div>
          </div>

          {/* Área del mapa (placeholder) */}
          <div className="space-y-2">
            <h4 className="font-semibold text-base">Mapa de Seguimiento</h4>
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center text-gray-500">
                <MapPin className="h-8 w-8 mx-auto mb-2" />
                <p>Mapa de tracking en tiempo real</p>
                <p className="text-sm">(Integración pendiente con servicio de mapas)</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
