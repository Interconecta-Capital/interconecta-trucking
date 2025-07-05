
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  MapPin, 
  Package, 
  Calendar,
  User,
  Star,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { useGestionOperadores } from '@/hooks/useGestionOperadores';
import { AsignacionInteligente as AsignacionType } from '@/types/operadores';

export function AsignacionInteligente() {
  const { conductores, obtenerAsignacionInteligente, loading } = useGestionOperadores();
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [tipoCarga, setTipoCarga] = useState('');
  const [fechaRequerida, setFechaRequerida] = useState('');
  const [asignaciones, setAsignaciones] = useState<AsignacionType[]>([]);
  const [buscando, setBuscando] = useState(false);

  const buscarAsignaciones = async () => {
    if (!origen || !destino || !tipoCarga) {
      return;
    }

    setBuscando(true);
    try {
      const resultados = await obtenerAsignacionInteligente(
        origen,
        destino,
        tipoCarga,
        fechaRequerida || new Date().toISOString().split('T')[0]
      );
      setAsignaciones(resultados);
    } catch (error) {
      console.error('Error en asignación inteligente:', error);
    } finally {
      setBuscando(false);
    }
  };

  const getRecomendacionColor = (recomendacion: string) => {
    switch (recomendacion) {
      case 'alta': return 'bg-green-100 text-green-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baja': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConductorNombre = (conductorId: string) => {
    const conductor = conductores.find(c => c.id === conductorId);
    return conductor ? conductor.nombre : 'Conductor no encontrado';
  };

  return (
    <div className="space-y-6">
      {/* Formulario de búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Asignación Inteligente de Conductores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origen" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Origen
              </Label>
              <Input
                id="origen"
                placeholder="Ciudad de origen"
                value={origen}
                onChange={(e) => setOrigen(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="destino" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Destino
              </Label>
              <Input
                id="destino"
                placeholder="Ciudad de destino"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tipoCarga" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Tipo de Carga
              </Label>
              <Input
                id="tipoCarga"
                placeholder="Ej: General, Especializada"
                value={tipoCarga}
                onChange={(e) => setTipoCarga(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fechaRequerida" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha Requerida
              </Label>
              <Input
                id="fechaRequerida"
                type="date"
                value={fechaRequerida}
                onChange={(e) => setFechaRequerida(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Button 
              onClick={buscarAsignaciones}
              disabled={!origen || !destino || !tipoCarga || buscando}
              className="w-full md:w-auto"
            >
              {buscando ? 'Buscando...' : 'Buscar Conductores Óptimos'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados de asignación */}
      {asignaciones.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Conductores Recomendados ({asignaciones.length})
          </h3>
          
          {asignaciones.map((asignacion, index) => {
            const conductorNombre = getConductorNombre(asignacion.conductor_id);
            
            return (
              <Card key={asignacion.conductor_id} className="relative">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {conductorNombre}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Score de compatibilidad: {asignacion.score_compatibilidad}%
                        </p>
                      </div>
                    </div>
                    
                    <Badge className={getRecomendacionColor(asignacion.recomendacion)}>
                      {asignacion.recomendacion.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Barra de score general */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Compatibilidad General</span>
                      <span>{asignacion.score_compatibilidad}%</span>
                    </div>
                    <Progress value={asignacion.score_compatibilidad} className="h-2" />
                  </div>

                  {/* Factores detallados */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-sm font-medium">Distancia</div>
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round(asignacion.factores.distancia)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">Especialización</div>
                      <div className="text-lg font-bold text-green-600">
                        {Math.round(asignacion.factores.especializacion)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">Disponibilidad</div>
                      <div className="text-lg font-bold text-purple-600">
                        {Math.round(asignacion.factores.disponibilidad)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">Performance</div>
                      <div className="text-lg font-bold text-orange-600">
                        {Math.round(asignacion.factores.performance)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">Preferencias</div>
                      <div className="text-lg font-bold text-pink-600">
                        {Math.round(asignacion.factores.preferencias)}%
                      </div>
                    </div>
                  </div>

                  {/* Observaciones */}
                  {asignacion.observaciones.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Observaciones
                      </h5>
                      <div className="space-y-1">
                        {asignacion.observaciones.map((obs, obsIndex) => (
                          <div key={obsIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            <span>{obs}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full md:w-auto"
                    >
                      Asignar a {conductorNombre}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Estado vacío */}
      {asignaciones.length === 0 && origen && destino && tipoCarga && !buscando && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron conductores disponibles para esta ruta.</p>
              <p className="text-sm mt-2">
                Verifica que tengas conductores activos y disponibles.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
