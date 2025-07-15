
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Clock, Truck, ExternalLink, Maximize2, X } from 'lucide-react';
import { TrackingMapaMejorado } from '../tracking/TrackingMapaMejorado';
import { useState } from 'react';

interface TrackingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viaje: any;
}

export function TrackingModal({ open, onOpenChange, viaje }: TrackingModalProps) {
  if (!viaje) return null;

  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-background transition-all duration-300 ease-in-out animate-fade-in">
        <div className="w-full h-full flex flex-col">
          {/* Header optimizado para fullscreen */}
          <div className="flex items-center justify-between p-4 lg:p-6 border-b bg-card/95 backdrop-blur-sm flex-shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <Navigation className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-foreground">
                  Tracking en Tiempo Real
                </h2>
                <p className="text-sm text-muted-foreground">
                  {viaje.carta_porte_id}
                </p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              onClick={toggleFullscreen}
              className="flex items-center gap-2 hover:bg-destructive/90 transition-colors duration-200"
              size="lg"
            >
              <X className="h-5 w-5" />
              <span className="hidden sm:inline">Cerrar</span>
            </Button>
          </div>
          
          {/* Layout responsivo para fullscreen */}
          <div className="flex-1 p-4 lg:p-6 overflow-hidden">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6 h-full">
              {/* Panel de información - Responsivo */}
              <div className="xl:col-span-1 space-y-4 overflow-y-auto max-h-[40vh] xl:max-h-full">
                <div className="flex items-center justify-between bg-card/50 p-3 lg:p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-sm lg:text-base">Estado:</span>
                    <Badge className="bg-success/10 text-success border-success/20 text-xs lg:text-sm">
                      En Tránsito
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 bg-card/50 p-3 lg:p-4 rounded-lg">
                  <h4 className="font-semibold text-base lg:text-lg flex items-center gap-2">
                    <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                    Ruta
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-success mt-0.5" />
                      <div className="flex-1">
                        <span className="font-medium text-sm lg:text-base">Origen:</span>
                        <p className="text-xs lg:text-sm text-muted-foreground">{origen}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-primary mt-0.5" />
                      <div className="flex-1">
                        <span className="font-medium text-sm lg:text-base">Actual:</span>
                        <p className="text-xs lg:text-sm text-muted-foreground">{trackingData.ubicacionActual}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <span className="font-medium text-sm lg:text-base">Destino:</span>
                        <p className="text-xs lg:text-sm text-muted-foreground">{destino}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 bg-card/50 p-3 lg:p-4 rounded-lg">
                  <h4 className="font-semibold text-base lg:text-lg flex items-center gap-2">
                    <Navigation className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                    Información
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="font-medium text-sm">Velocidad:</span>
                      <p className="text-lg font-bold text-primary">{trackingData.velocidad}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Progreso:</span>
                      <p className="text-lg font-bold text-primary">{trackingData.progreso}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${trackingData.progreso}%` }}
                    ></div>
                  </div>
                </div>

                {/* Botón de Google Maps */}
                {googleMapsUrl && (
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(googleMapsUrl, '_blank')}
                    className="w-full flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Google Maps
                  </Button>
                )}
              </div>

              {/* Panel del mapa - Ocupa la mayor parte del espacio */}
              <div className="xl:col-span-3 h-full min-h-[60vh] xl:min-h-full">
                <TrackingMapaMejorado 
                  viaje={viaje}
                  ubicacionActual={trackingData.coordenadas}
                  enTiempoReal={true}
                  isFullscreen={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Tracking en Tiempo Real - {viaje.carta_porte_id}
            </DialogTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleFullscreen}
              className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
              title="Ver en pantalla completa"
            >
              <Maximize2 className="h-4 w-4" />
              <span className="hidden sm:inline">Expandir</span>
            </Button>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 h-[calc(90vh-140px)] transition-all duration-300">
          {/* Panel de información - Izquierda */}
          <div className="space-y-4 overflow-y-auto order-2 lg:order-1">
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
          <div className="h-full min-h-[300px] lg:min-h-full order-1 lg:order-2">
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
