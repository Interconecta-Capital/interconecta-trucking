
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Truck, Calendar, MapPin, FileText, Settings, AlertTriangle } from 'lucide-react';
import { Vehiculo } from '@/hooks/useVehiculos';

interface VehiculoQuickViewProps {
  vehiculo: Vehiculo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onProgramar?: () => void;
}

const ESTADOS_CONFIG = {
  disponible: { label: 'Disponible', color: 'bg-green-500 text-white' },
  en_viaje: { label: 'En Viaje', color: 'bg-blue-500 text-white' },
  mantenimiento: { label: 'Mantenimiento', color: 'bg-orange-500 text-white' },
  revision: { label: 'Revisión', color: 'bg-yellow-500 text-white' },
  fuera_servicio: { label: 'Fuera de Servicio', color: 'bg-red-500 text-white' }
};

export const VehiculoQuickView = ({ vehiculo, open, onOpenChange, onEdit, onProgramar }: VehiculoQuickViewProps) => {
  if (!vehiculo) return null;

  const estadoConfig = ESTADOS_CONFIG[vehiculo.estado as keyof typeof ESTADOS_CONFIG] || 
                      { label: vehiculo.estado || 'Sin estado', color: 'bg-gray-500 text-white' };

  const documentosVencenPronto = [
    { nombre: 'Seguro', fecha: vehiculo.vigencia_seguro, alerta: isDateCloseToExpiry(vehiculo.vigencia_seguro) },
    { nombre: 'Verificación', fecha: vehiculo.verificacion_vigencia, alerta: isDateCloseToExpiry(vehiculo.verificacion_vigencia) }
  ].filter(doc => doc.fecha);

  // Helper function to get serial number from either field
  const getNumeroSerie = () => {
    return vehiculo.num_serie || vehiculo.numero_serie_vin || 'No especificado';
  };

  // Helper function to get insurance policy number
  const getPollizaSeguro = () => {
    return vehiculo.poliza_seguro || vehiculo.poliza_resp_civil || 'No especificada';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Vehículo {vehiculo.placa}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Estado y acciones principales */}
          <div className="flex items-center justify-between">
            <Badge className={estadoConfig.color}>
              {estadoConfig.label}
            </Badge>
            <div className="flex gap-2">
              {onProgramar && (
                <Button variant="outline" size="sm" onClick={onProgramar}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Programar
                </Button>
              )}
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Settings className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </div>

          {/* Información básica */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Marca</span>
                  <p className="font-medium">{vehiculo.marca || 'No especificada'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Modelo</span>
                  <p className="font-medium">{vehiculo.modelo || 'No especificado'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Año</span>
                  <p className="font-medium">{vehiculo.anio || 'No especificado'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Configuración</span>
                  <p className="font-medium">{vehiculo.config_vehicular || 'No especificada'}</p>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Número de Serie</span>
                <p className="font-medium font-mono text-sm">{getNumeroSerie()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Documentación */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {documentosVencenPronto.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{doc.nombre}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Vence: {formatDate(doc.fecha)}
                    </span>
                    {doc.alerta && (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                </div>
              ))}
              
              <div>
                <span className="text-sm text-muted-foreground">Póliza de Seguro</span>
                <p className="font-medium">{getPollizaSeguro()}</p>
              </div>
            </CardContent>
          </Card>

          {/* GPS y Tracking */}
          {(vehiculo.id_equipo_gps || vehiculo.fecha_instalacion_gps) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Información GPS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {vehiculo.id_equipo_gps && (
                  <div>
                    <span className="text-sm text-muted-foreground">ID Equipo GPS</span>
                    <p className="font-medium font-mono">{vehiculo.id_equipo_gps}</p>
                  </div>
                )}
                
                {vehiculo.fecha_instalacion_gps && (
                  <div>
                    <span className="text-sm text-muted-foreground">Fecha de Instalación</span>
                    <p className="font-medium">{formatDate(vehiculo.fecha_instalacion_gps)}</p>
                  </div>
                )}

                {vehiculo.acta_instalacion_gps && (
                  <div>
                    <span className="text-sm text-muted-foreground">Acta de Instalación</span>
                    <p className="font-medium">{vehiculo.acta_instalacion_gps}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return 'No especificada';
  return new Date(dateString).toLocaleDateString('es-MX');
}

function isDateCloseToExpiry(dateString: string | undefined | null, daysThreshold = 30): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= daysThreshold && diffDays >= 0;
}
