
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Clock, Truck, ExternalLink } from 'lucide-react';
import { TrackingMapaMejorado } from '../tracking/TrackingMapaMejorado';
import { useState } from 'react';

interface TrackingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viaje: any;
}

export function TrackingModal({ open, onOpenChange, viaje }: TrackingModalProps) {
  if (!viaje) return null;

  // Extraer datos reales del viaje usando tracking_data
  const trackingRealData = viaje.tracking_data || {};
  const origen = trackingRealData.origen?.direccion || viaje.origen || 'Origen no especificado';
  const destino = trackingRealData.destino?.direccion || viaje.destino || 'Destino no especificado';
  
  // Mock data para el tracking en tiempo real - se puede mejorar conectando con GPS real
  const trackingData = {
    ubicacionActual: "En ruta hacia destino",
    coordenadas: { lat: 19.4326, lng: -99.1332 },
    velocidad: "75 km/h",
    ultimaActualizacion: new Date().toLocaleTimeString(),
    progreso: viaje.estado === 'en_transito' ? 45 : viaje.estado === 'completado' ? 100 : 15,
    tiempoEstimadoLlegada: viaje.fecha_fin_programada || new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
  };

  // Generar enlace de Google Maps
  const generateGoogleMapsLink = () => {
    if (!origen || !destino) return null;
    const baseUrl = 'https://www.google.com/maps/dir/';
    const origenEncoded = encodeURIComponent(origen);
    const destinoEncoded = encodeURIComponent(destino);
    return `${baseUrl}${origenEncoded}/${destinoEncoded}`;
  };

  const googleMapsUrl = generateGoogleMapsLink();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            Tracking en Tiempo Real - {viaje.carta_porte_id}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(90vh-120px)]">
          {/* Panel de información - Izquierda */}
          <div className="space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <span className="font-semibold">Estado:</span>
                <Badge className="bg-success/10 text-success border-success/20">En Tránsito</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Última actualización: {trackingData.ultimaActualizacion}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Ruta
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-success" />
                  <span className="font-medium">Origen:</span> 
                  <span className="text-sm">{origen}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">Ubicación actual:</span> 
                  <span className="text-sm">{trackingData.ubicacionActual}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-destructive" />
                  <span className="font-medium">Destino:</span> 
                  <span className="text-sm">{destino}</span>
                </div>
                
                {/* Botón de Google Maps */}
                {googleMapsUrl && (
                  <div className="pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(googleMapsUrl, '_blank')}
                      className="w-full flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Abrir ruta en Google Maps
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-base flex items-center gap-2">
                <Navigation className="h-4 w-4 text-primary" />
                Información de Viaje
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-primary" />
                  <span className="font-medium">Velocidad:</span> {trackingData.velocidad}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-success" />
                  <span className="font-medium">ETA:</span>
                  <span className="text-sm">{new Date(trackingData.tiempoEstimadoLlegada).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Progreso del viaje</span>
                <span className="text-sm text-muted-foreground">{trackingData.progreso}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${trackingData.progreso}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Panel del mapa - Derecha */}
          <div className="h-full">
            <TrackingMapaMejorado 
              viaje={viaje}
              ubicacionActual={trackingData.coordenadas}
              enTiempoReal={true}
              isFullscreen={false}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
