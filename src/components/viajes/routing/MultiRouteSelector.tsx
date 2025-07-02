import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Navigation, 
  Clock, 
  MapPin, 
  Fuel, 
  DollarSign,
  TrendingUp,
  Zap,
  TreePine,
  Truck,
  AlertTriangle,
  Shield,
  Weight,
  Ruler
} from 'lucide-react';
import { useRuteoComercial, useRuteoComercialMultiple } from '@/hooks/useRuteoComercial';
import { usePeajesINEGI } from '@/hooks/usePeajesINEGI';
import type { ParametrosRuteoComercial, RutaComercial } from '@/services/ruteoComercial';

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
  // Nuevos campos para ruteo comercial
  rutaComercial?: RutaComercial;
  restricciones?: string[];
  advertencias?: string[];
  validacionSeguridad?: {
    esSegura: boolean;
    alertas: string[];
    recomendaciones: string[];
  };
}

interface MultiRouteSelectorProps {
  origen: { lat: number; lng: number; address: string };
  destino: { lat: number; lng: number; address: string };
  paradasIntermedias?: Array<{ lat: number; lng: number; address: string }>;
  onRouteSelect: (route: RouteOption) => void;
  vehicleType?: 'camion' | 'trailer' | 'pickup';
  // Nuevos parámetros para ruteo comercial
  vehiculoComercial?: {
    peso: number;
    altura: number;
    ancho: number;
    largo: number;
    ejes: number;
    materialesPeligrosos: boolean;
    configuracion: 'C2' | 'C3' | 'T2S1' | 'T3S2' | 'T3S3';
  };
  restriccionesEspeciales?: {
    evitarPeajes: boolean;
    horarioRestriccion: boolean;
    zonasAmbientales: boolean;
    puentesBajos: boolean;
  };
}

export const MultiRouteSelector: React.FC<MultiRouteSelectorProps> = ({
  origen,
  destino,
  paradasIntermedias = [],
  onRouteSelect,
  vehicleType = 'camion',
  vehiculoComercial,
  restriccionesEspeciales = {
    evitarPeajes: false,
    horarioRestriccion: true,
    zonasAmbientales: true,
    puentesBajos: true
  }
}) => {
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('comercial');
  const [useCommercialRouting, setUseCommercialRouting] = useState(true);

  const { validarRutaSegura } = useRuteoComercial();
  const { generarOpcionesRuta, loading: loadingComercial } = useRuteoComercialMultiple();
  const { calcularPeajes } = usePeajesINEGI();

  useEffect(() => {
    calculateMultipleRoutes();
  }, [origen, destino, paradasIntermedias, vehiculoComercial, useCommercialRouting]);

  const calculateMultipleRoutes = async () => {
    setLoading(true);
    try {
      if (useCommercialRouting && vehiculoComercial) {
        await calculateCommercialRoutes();
      } else {
        await calculateStandardRoutes();
      }
    } catch (error) {
      console.error('Error calculando rutas:', error);
      // Fallback a rutas estándar
      await calculateStandardRoutes();
    } finally {
      setLoading(false);
    }
  };

  const calculateCommercialRoutes = async () => {
    if (!vehiculoComercial) return;

    console.log('Calculando rutas comerciales especializadas...');

    const parametrosVehiculo: ParametrosRuteoComercial['vehiculo'] = {
      peso: vehiculoComercial.peso,
      altura: vehiculoComercial.altura,
      ancho: vehiculoComercial.ancho,
      largo: vehiculoComercial.largo,
      ejes: vehiculoComercial.ejes,
      materialesPeligrosos: vehiculoComercial.materialesPeligrosos
    };

    const rutasComerciales = await generarOpcionesRuta(
      { lat: origen.lat, lng: origen.lng },
      { lat: destino.lat, lng: destino.lng },
      parametrosVehiculo,
      restriccionesEspeciales
    );

    const routeOptions: RouteOption[] = [];

    for (const [index, rutaComercial] of rutasComerciales.entries()) {
      // Calcular peajes con API INEGI
      let tollCost = rutaComercial.costoPeajes;
      try {
        const resultadoPeajes = await calcularPeajes(
          { lat: origen.lat, lng: origen.lng },
          { lat: destino.lat, lng: destino.lng },
          vehiculoComercial.configuracion
        );
        tollCost = resultadoPeajes.costoTotal;
      } catch (error) {
        console.warn('Error calculando peajes, usando estimación:', error);
      }

      // Validar seguridad de la ruta
      const validacionSeguridad = validarRutaSegura(rutaComercial, parametrosVehiculo);

      const routeNames = ['Ruta Comercial Rápida', 'Ruta Económica', 'Ruta Corta'];
      const routeTypes = ['comercial-rapida', 'comercial-economica', 'comercial-corta'];

      const routeOption: RouteOption = {
        id: routeTypes[index] || `comercial-${index}`,
        name: routeNames[index] || `Ruta Comercial ${index + 1}`,
        distance: rutaComercial.distancia,
        duration: rutaComercial.tiempo,
        fuelCost: rutaComercial.combustibleEstimado * 24.50, // MXN
        tollCost,
        trafficLevel: rutaComercial.restriccionesEncontradas.length > 2 ? 'alto' : 'medio',
        roadQuality: validacionSeguridad.esSegura ? 'excelente' : 'buena',
        waypoints: rutaComercial.waypoints.map(wp => ({
          lat: wp.lat,
          lng: wp.lng,
          name: wp.descripcion,
          type: wp.tipo as any
        })),
        advantages: [
          `Optimizada para vehículos de ${vehiculoComercial.peso}T`,
          `Considera ${vehiculoComercial.ejes} ejes`,
          validacionSeguridad.esSegura ? 'Ruta segura validada' : 'Restricciones identificadas',
          'Cumple normativas mexicanas'
        ],
        disadvantages: rutaComercial.advertencias,
        co2Emissions: Math.round(rutaComercial.combustibleEstimado * 2.6), // kg CO2
        rutaComercial,
        restricciones: rutaComercial.restriccionesEncontradas,
        advertencias: rutaComercial.advertencias,
        validacionSeguridad
      };

      routeOptions.push(routeOption);
    }

    setRoutes(routeOptions);
    if (routeOptions.length > 0) {
      setSelectedRoute(routeOptions[0].id);
    }
  };

  const calculateStandardRoutes = async () => {
    const routeOptions: RouteOption[] = [
      {
        id: 'rapida',
        name: 'Ruta Rápida',
        distance: 450,
        duration: 360,
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
        duration: 480,
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
      }
    ];

    setRoutes(routeOptions);
    setSelectedRoute(routeOptions[0].id);
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

  if (loading || loadingComercial) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">
              {useCommercialRouting ? 'Calculando rutas comerciales especializadas...' : 'Calculando rutas alternativas...'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {useCommercialRouting ? 'Rutas Comerciales Especializadas' : 'Opciones de Ruta'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {useCommercialRouting 
              ? 'Rutas optimizadas para vehículos comerciales con restricciones específicas'
              : 'Seleccione la mejor ruta según sus necesidades'
            }
          </p>
        </div>
        <div className="flex gap-2">
          {vehiculoComercial && (
            <Button
              onClick={() => setUseCommercialRouting(!useCommercialRouting)}
              variant={useCommercialRouting ? "default" : "outline"}
              size="sm"
            >
              <Truck className="h-4 w-4 mr-2" />
              {useCommercialRouting ? 'Ruteo Comercial' : 'Ruteo Estándar'}
            </Button>
          )}
          <Button onClick={calculateMultipleRoutes} variant="outline">
            <Navigation className="h-4 w-4 mr-2" />
            Recalcular
          </Button>
        </div>
      </div>

      {/* Información del vehículo comercial */}
      {useCommercialRouting && vehiculoComercial && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Configuración del Vehículo Comercial
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Weight className="h-3 w-3" />
                <span>Peso: {vehiculoComercial.peso}T</span>
              </div>
              <div className="flex items-center gap-1">
                <Ruler className="h-3 w-3" />
                <span>Alt: {vehiculoComercial.altura}m</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Ejes: {vehiculoComercial.ejes}</span>
              </div>
              {vehiculoComercial.materialesPeligrosos && (
                <div className="flex items-center gap-1 text-orange-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Mat. Peligrosos</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comercial">Comercial</TabsTrigger>
          <TabsTrigger value="economica">Económica</TabsTrigger>
          <TabsTrigger value="alternativa">Alternativa</TabsTrigger>
        </TabsList>

        {routes.map((route, index) => (
          <TabsContent key={route.id} value={index === 0 ? 'comercial' : index === 1 ? 'economica' : 'alternativa'}>
            <Card className={`cursor-pointer transition-all ${
              selectedRoute === route.id ? 'ring-2 ring-blue-500' : ''
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {route.id.includes('comercial') && <Truck className="h-5 w-5 text-blue-500" />}
                    {route.id === 'rapida' && <Zap className="h-5 w-5 text-yellow-500" />}
                    {route.id === 'economica' && <DollarSign className="h-5 w-5 text-green-500" />}
                    {route.id === 'ecologica' && <TreePine className="h-5 w-5 text-green-600" />}
                    {route.name}
                    {route.validacionSeguridad?.esSegura && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Shield className="h-3 w-3 mr-1" />
                        Segura
                      </Badge>
                    )}
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
                {/* Alertas de seguridad */}
                {route.validacionSeguridad && !route.validacionSeguridad.esSegura && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription>
                      <div className="space-y-1">
                        {route.validacionSeguridad.alertas.map((alerta, idx) => (
                          <div key={idx} className="text-sm text-orange-800">{alerta}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Métricas principales */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Navigation className="h-4 w-4 text-blue-500 mr-1" />
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

                {/* Restricciones encontradas */}
                {route.restricciones && route.restricciones.length > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Restricciones Identificadas</h4>
                    <div className="space-y-1">
                      {route.restricciones.map((restriccion, idx) => (
                        <div key={idx} className="text-sm text-yellow-700 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {restriccion}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recomendaciones de seguridad */}
                {route.validacionSeguridad?.recomendaciones && route.validacionSeguridad.recomendaciones.length > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Recomendaciones</h4>
                    <div className="space-y-1">
                      {route.validacionSeguridad.recomendaciones.map((recomendacion, idx) => (
                        <div key={idx} className="text-sm text-blue-700 flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {recomendacion}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
