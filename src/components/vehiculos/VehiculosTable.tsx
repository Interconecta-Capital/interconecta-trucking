import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, AlertTriangle, Clock, MapPin, Fuel, Settings, BarChart3, Truck, Route } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Vehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anio?: number;
  estado: string;
  activo: boolean;
  vigencia_seguro?: string;
  verificacion_vigencia?: string;
  kilometraje_actual?: number;
  fecha_proxima_disponibilidad?: string;
  conductor_asignado_id?: string;
  viaje_actual_id?: string;
  ubicacion_actual?: string;
}

interface VehiculosTableProps {
  vehiculos: Vehiculo[];
  loading: boolean;
  onEdit?: (vehiculo: Vehiculo) => void;
  onView?: (vehiculo: Vehiculo) => void;
  onDelete?: (vehiculo: Vehiculo) => void;
}

interface AnalysisData {
  totalViajes: number;
  viajesCompletados: number;
  distanciaTotal: number;
  ultimoViaje: string | null;
}

export function VehiculosTable({ vehiculos, loading, onEdit, onView, onDelete }: VehiculosTableProps) {
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Query para análisis de vehículo seleccionado
  const { data: analysisData, isLoading: isLoadingAnalysis } = useQuery({
    queryKey: ['vehiculo-analysis', selectedVehiculo?.id],
    queryFn: async (): Promise<AnalysisData> => {
      if (!selectedVehiculo) return { totalViajes: 0, viajesCompletados: 0, distanciaTotal: 0, ultimoViaje: null };

      // Obtener viajes asociados al vehículo
      const { data: viajes } = await supabase
        .from('viajes')
        .select('id, estado, distancia_km, created_at')
        .eq('vehiculo_id', selectedVehiculo.id);

      const totalViajes = viajes?.length || 0;
      const viajesCompletados = viajes?.filter(v => v.estado === 'completado').length || 0;
      const distanciaTotal = viajes?.reduce((acc, v) => acc + (v.distancia_km || 0), 0) || 0;
      const ultimoViaje = viajes?.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]?.created_at || null;

      return {
        totalViajes,
        viajesCompletados,
        distanciaTotal,
        ultimoViaje
      };
    },
    enabled: !!selectedVehiculo && showAnalysis
  });

  const handleAnalizar = (vehiculo: Vehiculo) => {
    setSelectedVehiculo(vehiculo);
    setShowAnalysis(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando vehículos...</div>
        </CardContent>
      </Card>
    );
  }

  if (vehiculos.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No hay vehículos registrados
          </div>
        </CardContent>
      </Card>
    );
  }

  const isDocumentExpiringSoon = (fecha: string | undefined, days = 30) => {
    if (!fecha) return false;
    const today = new Date();
    const expiryDate = new Date(fecha);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days && diffDays >= 0;
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'disponible':
        return 'bg-success text-success-foreground';
      case 'asignado':
        return 'bg-primary text-primary-foreground';
      case 'en_transito':
        return 'bg-info text-info-foreground';
      case 'mantenimiento':
        return 'bg-warning text-warning-foreground';
      case 'fuera_servicio':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'disponible':
        return <div className="w-2 h-2 bg-success rounded-full animate-pulse" />;
      case 'asignado':
        return <Clock className="h-3 w-3" />;
      case 'en_transito':
        return <MapPin className="h-3 w-3" />;
      case 'mantenimiento':
        return <Settings className="h-3 w-3" />;
      case 'fuera_servicio':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <div className="w-2 h-2 bg-muted rounded-full" />;
    }
  };

  return (
    <>
      <div className="space-y-4">
        {vehiculos.map((vehiculo) => {
          const seguroVencePronto = isDocumentExpiringSoon(vehiculo.vigencia_seguro);
          const verificacionVencePronto = isDocumentExpiringSoon(vehiculo.verificacion_vigencia);
          const hasAlerts = seguroVencePronto || verificacionVencePronto;

          return (
            <Card key={vehiculo.id} className={hasAlerts ? 'border-orange-200 bg-orange-50' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{vehiculo.placa}</CardTitle>
                    {hasAlerts && (
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getEstadoBadgeColor(vehiculo.estado)} flex items-center gap-1`}>
                      {getEstadoIcon(vehiculo.estado)}
                      {vehiculo.estado === 'disponible' ? 'Disponible' :
                       vehiculo.estado === 'asignado' ? 'Asignado' :
                       vehiculo.estado === 'en_transito' ? 'En Tránsito' :
                       vehiculo.estado === 'mantenimiento' ? 'Mantenimiento' :
                       vehiculo.estado === 'fuera_servicio' ? 'Fuera de Servicio' : vehiculo.estado}
                    </Badge>
                    {vehiculo.fecha_proxima_disponibilidad && vehiculo.estado !== 'disponible' && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(vehiculo.fecha_proxima_disponibilidad).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Marca</p>
                    <p className="font-medium">{vehiculo.marca || 'No especificada'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Modelo</p>
                    <p className="font-medium">{vehiculo.modelo || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Año</p>
                    <p className="font-medium">{vehiculo.anio || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Kilometraje</p>
                    <div className="flex items-center gap-1">
                      <Fuel className="h-3 w-3 text-muted-foreground" />
                      <p className="font-medium">{vehiculo.kilometraje_actual?.toLocaleString() || '0'} km</p>
                    </div>
                  </div>
                </div>

                {/* Información adicional de estado */}
                {(vehiculo.ubicacion_actual || vehiculo.conductor_asignado_id || vehiculo.viaje_actual_id) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-border">
                    {vehiculo.ubicacion_actual && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{vehiculo.ubicacion_actual}</span>
                      </div>
                    )}
                    {vehiculo.conductor_asignado_id && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        <span>Conductor asignado</span>
                      </div>
                    )}
                    {vehiculo.viaje_actual_id && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-2 h-2 bg-info rounded-full animate-pulse"></span>
                        <span>En viaje activo</span>
                      </div>
                    )}
                  </div>
                )}

                {hasAlerts && (
                  <div className="mt-3 p-2 bg-orange-100 rounded-md">
                    <div className="flex items-center gap-2 text-sm text-orange-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Documentos próximos a vencer:</span>
                    </div>
                    <ul className="text-sm text-orange-700 mt-1 ml-6">
                      {seguroVencePronto && <li>• Seguro</li>}
                      {verificacionVencePronto && <li>• Verificación</li>}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  {onView && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onView(vehiculo)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  )}
                  {onEdit && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onEdit(vehiculo)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAnalizar(vehiculo)}
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Analizar
                  </Button>
                  {onDelete && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onDelete(vehiculo)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog de Análisis */}
      <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Análisis de {selectedVehiculo?.placa}
            </DialogTitle>
          </DialogHeader>
          
          {isLoadingAnalysis ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  Total Viajes
                </div>
                <div className="text-2xl font-bold">{analysisData?.totalViajes || 0}</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Route className="h-4 w-4" />
                  Completados
                </div>
                <div className="text-2xl font-bold text-green-600">{analysisData?.viajesCompletados || 0}</div>
              </div>
              <div className="col-span-2 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Distancia Total Recorrida
                </div>
                <div className="text-2xl font-bold text-primary">
                  {(analysisData?.distanciaTotal || 0).toLocaleString('es-MX')} km
                </div>
              </div>
              {analysisData?.ultimoViaje && (
                <div className="col-span-2 text-sm text-muted-foreground">
                  Último viaje: {new Date(analysisData.ultimoViaje).toLocaleDateString('es-MX')}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
