
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Truck, 
  MapPin, 
  Edit, 
  Settings, 
  Maximize2, 
  Minimize2, 
  FileText, 
  Calendar,
  User,
  Package,
  Route,
  AlertCircle,
  CheckCircle2,
  Clock,
  Navigation
} from 'lucide-react';
import { useViajesEstados, Viaje } from '@/hooks/useViajesEstados';
import { useQueryClient } from '@tanstack/react-query';
import { EstadosViajeManager } from '@/components/viajes/estados/EstadosViajeManager';
import { TrackingViajeRealTime } from '@/components/viajes/tracking/TrackingViajeRealTime';
import { ViajeEditor } from '@/components/viajes/editor/ViajeEditor';

interface ViajeTrackingModalProps {
  viaje: Viaje | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViajeTrackingModal = ({ viaje, open, onOpenChange }: ViajeTrackingModalProps) => {
  const [activeTab, setActiveTab] = useState('resumen');
  const queryClient = useQueryClient();
  const [viajeData, setViajeData] = useState<Viaje | null>(viaje);

  useEffect(() => {
    setViajeData(viaje);
    if (viaje) {
      setActiveTab('resumen');
    }
  }, [viaje]);

  const handleViajeUpdate = () => {
    // Invalidar queries para obtener datos actualizados
    queryClient.invalidateQueries({ queryKey: ['viajes'] });
    queryClient.invalidateQueries({ queryKey: ['viajes-activos'] });
    queryClient.invalidateQueries({ queryKey: ['eventos-viaje'] });
    
    // Cerrar modal para que se vuelva a abrir con datos frescos
    setTimeout(() => {
      onOpenChange(false);
    }, 500);
  };


  const getEstadoBadge = (estado: string) => {
    const configs = {
      programado: { 
        label: 'Programado', 
        className: 'bg-blue-100 text-blue-800',
        icon: Calendar
      },
      en_transito: { 
        label: 'En Tránsito', 
        className: 'bg-green-100 text-green-800',
        icon: Navigation
      },
      completado: { 
        label: 'Completado', 
        className: 'bg-gray-100 text-gray-800',
        icon: CheckCircle2
      },
      retrasado: { 
        label: 'Retrasado', 
        className: 'bg-orange-100 text-orange-800',
        icon: AlertCircle
      },
      cancelado: { 
        label: 'Cancelado', 
        className: 'bg-red-100 text-red-800',
        icon: AlertCircle
      }
    };
    
    const config = configs[estado as keyof typeof configs] || 
                  { label: estado, className: 'bg-gray-100 text-gray-800', icon: Clock };
    
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.className}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!viajeData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-6xl max-h-[90vh] overflow-hidden"
      >
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-blue-600" />
              <div>
                <DialogTitle className="text-xl">
                  {viajeData.carta_porte_id}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  {getEstadoBadge(viajeData.estado)}
                  <span className="text-sm text-gray-500">
                    Creado: {formatDateTime(viajeData.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="resumen" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Tracking
            </TabsTrigger>
            <TabsTrigger value="documentos" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="estados" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Estados
            </TabsTrigger>
            <TabsTrigger value="editar" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Editar
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 max-h-[70vh] overflow-y-auto">
            
            {/* Tab Resumen - Nueva vista principal */}
            <TabsContent value="resumen" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Información del Viaje */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Route className="h-4 w-4" />
                      Información del Viaje
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <div>
                          <span className="font-medium">Origen:</span>
                          <p className="text-sm text-gray-600">{viajeData.origen}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <div>
                          <span className="font-medium">Destino:</span>
                          <p className="text-sm text-gray-600">{viajeData.destino}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cronología */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Cronología
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Inicio programado:</span>
                        <p>{formatDateTime(viajeData.fecha_inicio_programada)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Fin programado:</span>
                        <p>{formatDateTime(viajeData.fecha_fin_programada)}</p>
                      </div>
                      {viajeData.fecha_inicio_real && (
                        <div>
                          <span className="font-medium text-gray-600">Inicio real:</span>
                          <p>{formatDateTime(viajeData.fecha_inicio_real)}</p>
                        </div>
                      )}
                      {viajeData.fecha_fin_real && (
                        <div>
                          <span className="font-medium text-gray-600">Fin real:</span>
                          <p>{formatDateTime(viajeData.fecha_fin_real)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recursos Asignados */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Recursos Asignados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {viajeData.vehiculo_id && (
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Vehículo:</span>
                        <span className="text-sm">ID: {viajeData.vehiculo_id.slice(-8)}</span>
                      </div>
                    )}
                    {viajeData.conductor_id && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Conductor:</span>
                        <span className="text-sm">ID: {viajeData.conductor_id.slice(-8)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Documentos Generados */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Documentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">Carta Porte XML</span>
                        <Button size="sm" variant="outline">Descargar</Button>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">Carta Porte PDF</span>
                        <Button size="sm" variant="outline">Ver/Descargar</Button>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">Hoja de Ruta</span>
                        <Button size="sm" variant="outline">Imprimir</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Acciones Rápidas */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      onClick={() => setActiveTab('tracking')}
                      className="flex-1 min-w-[200px]"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Ver Tracking en Tiempo Real
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('documentos')}
                      className="flex-1 min-w-[200px]"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Gestionar Documentos
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('estados')}
                      className="flex-1 min-w-[200px]"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Cambiar Estado
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tracking" className="mt-0">
              <TrackingViajeRealTime 
                viaje={viajeData}
              />
            </TabsContent>

            <TabsContent value="documentos" className="mt-0">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Documentos del Viaje</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-medium">Documentos Fiscales</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">Carta Porte XML</p>
                              <p className="text-sm text-gray-500">CFDI 4.0 - Carta Porte 3.1</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Ver</Button>
                              <Button size="sm">Descargar</Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">Carta Porte PDF</p>
                              <p className="text-sm text-gray-500">Representación impresa</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Ver</Button>
                              <Button size="sm">Descargar</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Documentos Operativos</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">Hoja de Ruta</p>
                              <p className="text-sm text-gray-500">Instrucciones del viaje</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Ver</Button>
                              <Button size="sm">Imprimir</Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">Lista de Verificación</p>
                              <p className="text-sm text-gray-500">Checklist pre-viaje</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Ver</Button>
                              <Button size="sm">Generar</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="estados" className="mt-0">
              <EstadosViajeManager 
                viaje={viajeData}
                onViajeUpdate={handleViajeUpdate}
              />
            </TabsContent>

            <TabsContent value="editar" className="mt-0">
              <ViajeEditor 
                viaje={viajeData}
                onViajeUpdate={handleViajeUpdate}
                onClose={() => onOpenChange(false)}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
