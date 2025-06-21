
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Link } from 'lucide-react';

interface Remolque {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anio?: number;
  estado: string;
  activo: boolean;
  vehiculo_asignado_id?: string;
  tipo_remolque?: string;
  capacidad_carga?: number;
}

interface RemolquesTableProps {
  remolques: Remolque[];
  loading: boolean;
  onEdit?: (remolque: Remolque) => void;
  onDelete?: (remolque: Remolque) => void;
}

export function RemolquesTable({ remolques, loading, onEdit, onDelete }: RemolquesTableProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando remolques...</div>
        </CardContent>
      </Card>
    );
  }

  if (remolques.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No hay remolques registrados
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'disponible':
        return 'bg-green-500 text-white';
      case 'en_uso':
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
      {remolques.map((remolque) => (
        <Card key={remolque.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{remolque.placa}</CardTitle>
                {remolque.vehiculo_asignado_id && (
                  <Link className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <Badge className={getEstadoBadgeColor(remolque.estado)}>
                {remolque.estado === 'disponible' ? 'Disponible' :
                 remolque.estado === 'en_uso' ? 'En Uso' :
                 remolque.estado === 'mantenimiento' ? 'Mantenimiento' :
                 remolque.estado === 'fuera_servicio' ? 'Fuera de Servicio' : remolque.estado}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Marca</p>
                <p className="font-medium">{remolque.marca || 'No especificada'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modelo</p>
                <p className="font-medium">{remolque.modelo || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Año</p>
                <p className="font-medium">{remolque.anio || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Capacidad</p>
                <p className="font-medium">{remolque.capacidad_carga ? `${remolque.capacidad_carga} kg` : 'No especificada'}</p>
              </div>
            </div>

            {remolque.vehiculo_asignado_id && (
              <div className="mt-3 p-2 bg-blue-50 rounded-md">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <Link className="h-4 w-4" />
                  <span>Asignado a vehículo</span>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              {onEdit && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onEdit(remolque)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onDelete(remolque)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
