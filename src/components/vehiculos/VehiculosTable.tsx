
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, AlertTriangle } from 'lucide-react';

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
}

interface VehiculosTableProps {
  vehiculos: Vehiculo[];
  loading: boolean;
  onEdit?: (vehiculo: Vehiculo) => void;
  onView?: (vehiculo: Vehiculo) => void;
  onDelete?: (vehiculo: Vehiculo) => void;
}

export function VehiculosTable({ vehiculos, loading, onEdit, onView, onDelete }: VehiculosTableProps) {
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
        return 'bg-green-500 text-white';
      case 'en_viaje':
        return 'bg-blue-500 text-white';
      case 'mantenimiento':
        return 'bg-orange-500 text-white';
      case 'fuera_servicio':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
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
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
                <Badge className={getEstadoBadgeColor(vehiculo.estado)}>
                  {vehiculo.estado === 'disponible' ? 'Disponible' :
                   vehiculo.estado === 'en_viaje' ? 'En Viaje' :
                   vehiculo.estado === 'mantenimiento' ? 'Mantenimiento' :
                   vehiculo.estado === 'fuera_servicio' ? 'Fuera de Servicio' : vehiculo.estado}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>

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
  );
}
