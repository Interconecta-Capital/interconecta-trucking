import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Conductor } from '@/hooks/useConductores';

interface ConductoresTableProps {
  conductores: Conductor[];
  loading: boolean;
  onView?: (conductor: Conductor) => void;
  onEdit?: (conductor: Conductor) => void;
  onDelete?: (id: string) => void;
}

export function ConductoresTable({ conductores, loading, onView, onEdit, onDelete }: ConductoresTableProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando conductores...</div>
        </CardContent>
      </Card>
    );
  }

  if (conductores.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No hay conductores registrados
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {conductores.map((conductor) => (
        <Card key={conductor.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{conductor.nombre}</CardTitle>
              <Badge variant={conductor.activo ? 'default' : 'secondary'}>
                {conductor.estado}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">RFC</p>
                <p className="font-medium">{conductor.rfc || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Licencia</p>
                <p className="font-medium">{conductor.num_licencia || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{conductor.telefono || 'No especificado'}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onView?.(conductor)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onEdit?.(conductor)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onDelete?.(conductor.id)}
                disabled={conductor.estado === 'en_viaje'}
              >
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
