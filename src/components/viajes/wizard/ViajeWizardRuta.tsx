
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Route, Navigation, AlertCircle } from 'lucide-react';
import { ViajeWizardData } from '../ViajeWizard';

interface ViajeWizardRutaProps {
  data: ViajeWizardData;
  updateData: (updates: Partial<ViajeWizardData>) => void;
}

export function ViajeWizardRuta({ data, updateData }: ViajeWizardRutaProps) {
  const [origenInput, setOrigenInput] = useState('');
  const [destinoInput, setDestinoInput] = useState('');
  const [calculandoRuta, setCalculandoRuta] = useState(false);

  // Simular autocompletado de direcciones
  const handleOrigenSearch = async (valor: string) => {
    setOrigenInput(valor);
    // Aquí se integraría con el componente de autocompletado existente
  };

  const handleDestinoSearch = async (valor: string) => {
    setDestinoInput(valor);
    // Aquí se integraría con el componente de autocompletado existente
  };

  const establecerOrigen = () => {
    if (origenInput.trim()) {
      const ubicacion = {
        direccion: origenInput,
        coordenadas: { lat: 19.4326, lng: -99.1332 }, // Simulado
        codigoPostal: '01000'
      };
      updateData({ origen: ubicacion });
      setOrigenInput('');
    }
  };

  const establecerDestino = () => {
    if (destinoInput.trim()) {
      const ubicacion = {
        direccion: destinoInput,
        coordenadas: { lat: 20.6597, lng: -103.3496 }, // Simulado
        codigoPostal: '44100'
      };
      updateData({ destino: ubicacion });
      setDestinoInput('');
    }
  };

  // Calcular ruta automáticamente cuando se tienen origen y destino
  useEffect(() => {
    if (data.origen && data.destino && !data.distanciaRecorrida) {
      calcularRuta();
    }
  }, [data.origen, data.destino]);

  const calcularRuta = async () => {
    setCalculandoRuta(true);
    
    // Simular cálculo de ruta (aquí se integraría con RouteOptimizer real)
    setTimeout(() => {
      const distancia = Math.floor(Math.random() * 500) + 100; // Simulado
      updateData({ distanciaRecorrida: distancia });
      setCalculandoRuta(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Sección Origen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-green-600" />
            Punto de Origen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!data.origen ? (
            <div className="space-y-3">
              <Label htmlFor="origen">Dirección de origen</Label>
              <div className="flex gap-2">
                <Input
                  id="origen"
                  placeholder="Ingresa la dirección de origen..."
                  value={origenInput}
                  onChange={(e) => handleOrigenSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && establecerOrigen()}
                />
                <Button onClick={establecerOrigen} disabled={!origenInput.trim()}>
                  Establecer
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <div className="font-medium">{data.origen.direccion}</div>
                <div className="text-sm text-muted-foreground">CP: {data.origen.codigoPostal}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateData({ origen: undefined, distanciaRecorrida: undefined })}
              >
                Cambiar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección Destino */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-red-600" />
            Punto de Destino
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!data.destino ? (
            <div className="space-y-3">
              <Label htmlFor="destino">Dirección de destino</Label>
              <div className="flex gap-2">
                <Input
                  id="destino"
                  placeholder="Ingresa la dirección de destino..."
                  value={destinoInput}
                  onChange={(e) => handleDestinoSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && establecerDestino()}
                />
                <Button onClick={establecerDestino} disabled={!destinoInput.trim()}>
                  Establecer
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <div className="font-medium">{data.destino.direccion}</div>
                <div className="text-sm text-muted-foreground">CP: {data.destino.codigoPostal}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateData({ destino: undefined, distanciaRecorrida: undefined })}
              >
                Cambiar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección Cálculo de Ruta */}
      {data.origen && data.destino && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Route className="h-5 w-5" />
              Información de la Ruta
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calculandoRuta ? (
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-800">Calculando la mejor ruta...</span>
              </div>
            ) : data.distanciaRecorrida ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Distancia</div>
                    <div className="text-lg font-semibold">{data.distanciaRecorrida} km</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Tiempo estimado</div>
                    <div className="text-lg font-semibold">
                      {Math.floor(data.distanciaRecorrida / 80)} hrs
                    </div>
                  </div>
                </div>
                
                {/* Visualización del mapa (simulada) */}
                <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center text-muted-foreground">
                    <Navigation className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Mapa de la ruta</p>
                    <p className="text-xs">Integración con Mapbox pendiente</p>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={calcularRuta}
                >
                  <Route className="h-4 w-4 mr-2" />
                  Recalcular Ruta
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-amber-800">Error calculando la ruta. Inténtalo de nuevo.</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resumen de la sección */}
      {data.origen && data.destino && data.distanciaRecorrida && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Ruta Establecida
              </Badge>
            </div>
            <p className="text-sm text-green-800">
              Ruta de {data.distanciaRecorrida} km calculada exitosamente
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
