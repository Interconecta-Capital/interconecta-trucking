
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Route, 
  Clock, 
  MapPin, 
  Fuel, 
  DollarSign,
  TrendingUp,
  Navigation,
  Zap,
  TreePine
} from 'lucide-react';
import { mapService } from '@/services/mapService';

interface RouteOption {
  id: string;
  name: string;
  distance: number;
  duration: number;
  fuelCost: number;
  tollCost: number;
  trafficLevel: 'bajo' | 'medio' | 'alto';
  roadQuality: 'excelente' | 'buena' | 'regular';
  waypoints: Array<{
    lat: number;
    lng: number;
    name: string;
    type: 'origen' | 'destino' | 'parada' | 'gasolinera' | 'descanso';
  }>;
  advantages: string[];
  disadvantages: string[];
  co2Emissions: number;
}

interface MultiRouteSelectorProps {
  origen: { lat: number; lng: number; address: string };
  destino: { lat: number; lng: number; address: string };
  paradasIntermedias?: Array<{ lat: number; lng: number; address: string }>;
  onRouteSelect: (route: RouteOption) => void;
  vehicleType?: 'camion' | 'trailer' | 'pickup';
}

export const MultiRouteSelector: React.FC<MultiRouteSelectorProps> = ({
  origen,
  destino,
  paradasIntermedias = [],
  onRouteSelect,
  vehicleType = 'camion'
}) => {
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('rapida');

  useEffect(() => {
    calculateMultipleRoutes();
  }, [origen, destino, paradasIntermedias]);

  const calculateMultipleRoutes = async () => {
    setLoading(true);
    try {
      // Simular cálculo de múltiples rutas
      const routeOptions: RouteOption[] = [
        {
          id: 'rapida',
          name: 'Ruta Rápida',
          distance: 450,
          duration: 360, // 6 horas
          fuelCost: 1200,
          tollCost: 350,
          trafficLevel: 'medio',
          roadQuality: 'excelente',
          waypoints: [
            { ...origen, name: 'Origen', type: 'origen' },
            { lat: 19.8, lng: -99.5, name: 'Caseta Palmillas', type: 'parada' },
            { lat: 20.2, lng: -100.1, name: 'Gasolinera San Juan', type: 'gasolinera' },
            { ...destino, name: 'Destino', type: 'destino' }
          ],
          advantages: [
            'Menor tiempo de viaje',
            'Carreteras en excelente estado',
            'Mejor conectividad'
          ],
          disadvantages: [
            'Mayor costo en casetas',
            'Más tráfico en horas pico'
          ],
          co2Emissions: 120
        },
        {
          id: 'economica',
          name: 'Ruta Económica',
          distance: 520,
          duration: 480, // 8 horas
          fuelCost: 1100,
          tollCost: 150,
          trafficLevel: 'bajo',
          roadQuality: 'buena',
          waypoints: [
            { ...origen, name: 'Origen', type: 'origen' },
            { lat: 19.6, lng: -99.8, name: 'Carretera Federal', type: 'parada' },
            { lat: 20.0, lng: -100.5, name: 'Área de descanso', type: 'descanso' },
            { lat: 20.4, lng: -101.0, name: 'Gasolinera Rural', type: 'gasolinera' },
            { ...destino, name: 'Destino', type: 'destino' }
          ],
          advantages: [
            'Menor costo total',
            'Menos casetas de peaje',
            'Menos tráfico'
          ],
          disadvantages: [
            'Mayor tiempo de viaje',
            'Carreteras de menor calidad'
          ],
          co2Emissions: 95
        },
        {
          id: 'ecologica',
          name: 'Ruta Ecológica',
          distance: 485,
          duration: 420, // 7 horas
          fuelCost: 1050,
          tollCost: 250,
          trafficLevel: 'bajo',
          roadQuality: 'buena',
          waypoints: [
            { ...origen, name: 'Origen', type: 'origen' },
            { lat: 19.7, lng: -99.6, name: 'Zona reforestada', type: 'parada' },
            { lat: 20.1, lng: -100.2, name: 'Estación verde', type: 'gasolinera' },
            { ...destino, name: 'Destino', type: 'destino' }
          ],
          advantages: [
            'Menor huella de carbono',
            'Rutas por zonas verdes',
            'Consumo optimizado'
          ],
          disadvantages: [
            'Limitaciones de horario',
            'Menos opciones de servicios'
          ],
          co2Emissions: 85
        }
      ];

      setRoutes(routeOptions);
      setSelectedRoute(routeOptions[0].id);
    } catch (error) {
      console.error('Error calculando rutas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRouteSelection = (route: RouteOption) => {
    setSelectedRoute(route.id);
    onRouteSelect(route);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'bajo': return 'text-green-600';
      case 'medio': return 'text-yellow-600';
      case 'alto': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excelente': return 'text-green-600';
      case 'buena': return 'text-blue-600';
      case 'regular': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Calculando rutas alternativas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Opciones de Ruta</h3>
          <p className="text-sm text-muted-foreground">
            Seleccione la mejor ruta según sus necesidades
          </p>
        </div>
        <Button onClick={calculateMultipleRoutes} variant="outline">
          <Navigation className="h-4 w-4 mr-2" />
          Recalcular
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rapida">Rápida</TabsTrigger>
          <TabsTrigger value="economica">Económica</TabsTrigger>
          <TabsTrigger value="ecologica">Ecológica</TabsTrigger>
        </TabsList>

        {routes.map((route) => (
          <TabsContent key={route.id} value={route.id}>
            <Card className={`cursor-pointer transition-all ${
              selectedRoute === route.id ? 'ring-2 ring-blue-500' : ''
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {route.id === 'rapida' && <Zap className="h-5 w-5 text-yellow-500" />}
                    {route.id === 'economica' && <DollarSign className="h-5 w-5 text-green-500" />}
                    {route.id === 'ecologica' && <TreePine className="h-5 w-5 text-green-600" />}
                    {route.name}
                  </CardTitle>
                  <Button
                    onClick={() => handleRouteSelection(route)}
                    variant={selectedRoute === route.id ? "default" : "outline"}
                  >
                    {selectedRoute === route.id ? 'Seleccionada' : 'Seleccionar'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Métricas principales */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Route className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm text-muted-foreground">Distancia</span>
                    </div>
                    <p className="text-lg font-semibold">{route.distance} km</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="h-4 w-4 text-orange-500 mr-1" />
                      <span className="text-sm text-muted-foreground">Tiempo</span>
                    </div>
                    <p className="text-lg font-semibold">{formatDuration(route.duration)}</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Fuel className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-muted-foreground">Combustible</span>
                    </div>
                    <p className="text-lg font-semibold">{formatCurrency(route.fuelCost)}</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <DollarSign className="h-4 w-4 text-purple-500 mr-1" />
                      <span className="text-sm text-muted-foreground">Casetas</span>
                    </div>
                    <p className="text-lg font-semibold">{formatCurrency(route.tollCost)}</p>
                  </div>
                </div>

                {/* Condiciones del viaje */}
                <div className="flex justify-between items-center py-2 border-t">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Tráfico: </span>
                      <span className={`font-medium ${getTrafficColor(route.trafficLevel)}`}>
                        {route.trafficLevel.charAt(0).toUpperCase() + route.trafficLevel.slice(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Carretera: </span>
                      <span className={`font-medium ${getQualityColor(route.roadQuality)}`}>
                        {route.roadQuality.charAt(0).toUpperCase() + route.roadQuality.slice(1)}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline">
                    CO₂: {route.co2Emissions}kg
                  </Badge>
                </div>

                {/* Ventajas y desventajas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">Ventajas</h4>
                    <ul className="text-sm space-y-1">
                      {route.advantages.map((advantage, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                          {advantage}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-700 mb-2">Consideraciones</h4>
                    <ul className="text-sm space-y-1">
                      {route.disadvantages.map((disadvantage, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1 h-1 bg-orange-500 rounded-full mr-2"></span>
                          {disadvantage}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Puntos de interés */}
                <div className="pt-2 border-t">
                  <h4 className="font-medium mb-2">Puntos de Interés</h4>
                  <div className="flex flex-wrap gap-2">
                    {route.waypoints.map((waypoint, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {waypoint.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Costo total */}
                <div className="bg-gray-50 rounded-lg p-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Costo Total Estimado:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(route.fuelCost + route.tollCost)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
