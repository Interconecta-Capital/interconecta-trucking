
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface Vehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  año?: number;
  estado: string;
  activo: boolean;
}

interface VehiculosTableProps {
  vehiculos: Vehiculo[];
  loading: boolean;
}

export function VehiculosTable({ vehiculos, loading }: VehiculosTableProps) {
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

  return (
    <div className="space-y-4">
      {vehiculos.map((vehiculo) => (
        <Card key={vehiculo.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{vehiculo.placa}</CardTitle>
              <Badge variant={vehiculo.activo ? 'default' : 'secondary'}>
                {vehiculo.estado}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Marca</p>
                <p className="font-medium">{vehiculo.marca}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modelo</p>
                <p className="font-medium">{vehiculo.modelo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Año</p>
                <p className="font-medium">{vehiculo.año || 'No especificado'}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Button>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button size="sm" variant="outline">
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
