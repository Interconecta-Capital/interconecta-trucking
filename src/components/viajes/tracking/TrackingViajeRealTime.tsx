import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Clock, Route as RouteIcon, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TrackingViajeRealTimeProps {
  viaje: any; // Viaje completo con tracking_data desde la función RPC
}

export const TrackingViajeRealTime: React.FC<TrackingViajeRealTimeProps> = ({ viaje }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [rutaInfo, setRutaInfo] = useState<any>(null);
  const [loadingMap, setLoadingMap] = useState(true);
  
  // Obtener datos de tracking_data
  const viajeData = viaje.viaje || viaje;
  const trackingData = viajeData.tracking_data || {};
  const ubicacionOrigen = trackingData.ubicaciones?.origen;
  const ubicacionDestino = trackingData.ubicaciones?.destino;
  
  // Helper: Calcular tiempo estimado basado en distancia
  const calcularTiempoEstimado = (distanciaKm: number): string => {
    if (!distanciaKm || distanciaKm <= 0) return '0h 0m';
    
    const velocidadPromedio = 80; // km/h (velocidad promedio en carretera)
    const totalMinutos = Math.round((distanciaKm / velocidadPromedio) * 60);
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    
    return `${horas}h ${minutos}m`;
  };
  
  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current || map || !(window as any).google) return;
    
    if (!ubicacionOrigen?.coordenadas || !ubicacionDestino?.coordenadas) {
      console.warn('No hay coordenadas para mostrar el mapa');
      setLoadingMap(false);
      return;
    }
    
    const centerLat = (ubicacionOrigen.coordenadas.lat + ubicacionDestino.coordenadas.lat) / 2;
    const centerLng = (ubicacionOrigen.coordenadas.lng + ubicacionDestino.coordenadas.lng) / 2;
    
    const googleMap = new (window as any).google.maps.Map(mapRef.current, {
      center: { lat: centerLat, lng: centerLng },
      zoom: 6,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true
    });
    
    setMap(googleMap);
    
    const renderer = new (window as any).google.maps.DirectionsRenderer({
      map: googleMap,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#2563eb',
        strokeWeight: 5,
        strokeOpacity: 0.8
      }
    });
    
    setDirectionsRenderer(renderer);
    setLoadingMap(false);
  }, [mapRef.current, ubicacionOrigen, ubicacionDestino]);
  
  // Calcular ruta
  useEffect(() => {
    if (!map || !directionsRenderer || !(window as any).google) return;
    if (!ubicacionOrigen?.coordenadas || !ubicacionDestino?.coordenadas) return;
    
    const directionsService = new (window as any).google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: { lat: ubicacionOrigen.coordenadas.lat, lng: ubicacionOrigen.coordenadas.lng },
        destination: { lat: ubicacionDestino.coordenadas.lat, lng: ubicacionDestino.coordenadas.lng },
        travelMode: (window as any).google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true
      },
      (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
          const route = result.routes[0];
          const leg = route.legs[0];
          
          setRutaInfo({
            distancia: leg.distance?.text,
            distanciaMetros: leg.distance?.value,
            duracion: leg.duration?.text,
            duracionSegundos: leg.duration?.value,
            pasos: leg.steps.map(step => ({
              instruccion: step.instructions,
              distancia: step.distance?.text,
              duracion: step.duration?.text
            }))
          });
        }
      }
    );
  }, [map, directionsRenderer, ubicacionOrigen, ubicacionDestino]);
  
  if (!ubicacionOrigen?.coordenadas || !ubicacionDestino?.coordenadas) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No hay coordenadas disponibles para mostrar el tracking</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Información de la Ruta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <RouteIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Distancia</p>
                <p className="text-lg font-semibold">
                  {rutaInfo?.distancia || `${viajeData.distancia_km || 0} km`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tiempo Estimado</p>
                <p className="text-lg font-semibold">
                  {rutaInfo?.duracion || calcularTiempoEstimado(viajeData.distancia_km || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Navigation className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <Badge className={
                  viajeData.estado === 'en_transito' ? 'bg-green-100 text-green-800' :
                  viajeData.estado === 'programado' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {viajeData.estado === 'en_transito' ? 'En Tránsito' :
                   viajeData.estado === 'programado' ? 'Programado' :
                   viajeData.estado}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Mapa */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Visualización de Ruta
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => {
              const url = `https://www.google.com/maps/dir/${ubicacionOrigen?.coordenadas?.lat},${ubicacionOrigen?.coordenadas?.lng}/${ubicacionDestino?.coordenadas?.lat},${ubicacionDestino?.coordenadas?.lng}`;
              window.open(url, '_blank');
            }}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir en Google Maps
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div ref={mapRef} style={{ width: '100%', height: '500px' }} className="rounded-lg border" />
        </CardContent>
      </Card>
      
      {/* Instrucciones de Ruta */}
      {rutaInfo?.pasos && (
        <Card>
          <CardHeader>
            <CardTitle>Instrucciones de Ruta ({rutaInfo.pasos.length} pasos)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {rutaInfo.pasos.map((paso: any, index: number) => (
                <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm" dangerouslySetInnerHTML={{ __html: paso.instruccion }} />
                    <div className="flex gap-3 mt-1 text-xs text-gray-600">
                      <span>{paso.distancia}</span>
                      <span>•</span>
                      <span>{paso.duracion}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Ubicaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              Origen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Dirección:</span> {viajeData.origen}</p>
              {ubicacionOrigen?.domicilio && (
                <>
                  {ubicacionOrigen.domicilio.calle && <p><span className="font-medium">Calle:</span> {ubicacionOrigen.domicilio.calle}</p>}
                  <p><span className="font-medium">CP:</span> {ubicacionOrigen.domicilio.codigoPostal}</p>
                  <p><span className="font-medium">Municipio:</span> {ubicacionOrigen.domicilio.municipio}</p>
                  <p><span className="font-medium">Estado:</span> {ubicacionOrigen.domicilio.estado}</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-600" />
              Destino
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Dirección:</span> {viajeData.destino}</p>
              {ubicacionDestino?.domicilio && (
                <>
                  {ubicacionDestino.domicilio.calle && <p><span className="font-medium">Calle:</span> {ubicacionDestino.domicilio.calle}</p>}
                  <p><span className="font-medium">CP:</span> {ubicacionDestino.domicilio.codigoPostal}</p>
                  <p><span className="font-medium">Municipio:</span> {ubicacionDestino.domicilio.municipio}</p>
                  <p><span className="font-medium">Estado:</span> {ubicacionDestino.domicilio.estado}</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
