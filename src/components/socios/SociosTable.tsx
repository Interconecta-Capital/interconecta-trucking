
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface Socio {
  id: string;
  nombre_razon_social: string;
  rfc: string;
  email: string;
  estado: string;
  activo: boolean;
  tipo_persona?: string;
}

interface SociosTableProps {
  socios: Socio[];
  loading: boolean;
  onEdit?: (socio: Socio) => void;
  onView?: (socio: Socio) => void;
  onDelete?: (socio: Socio) => void;
}

export function SociosTable({ socios, loading, onEdit, onView, onDelete }: SociosTableProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando socios...</div>
        </CardContent>
      </Card>
    );
  }

  if (socios.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No hay socios registrados
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-500 text-white';
      case 'inactivo':
        return 'bg-gray-500 text-white';
      case 'suspendido':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTipoPersonaBadge = (tipo: string | undefined) => {
    switch (tipo) {
      case 'fisica':
        return { label: 'Persona Física', variant: 'outline' as const };
      case 'moral':
        return { label: 'Persona Moral', variant: 'secondary' as const };
      default:
        return { label: 'No especificado', variant: 'outline' as const };
    }
  };

  return (
    <div className="space-y-4">
      {socios.map((socio) => {
        const tipoBadge = getTipoPersonaBadge(socio.tipo_persona);

        return (
          <Card key={socio.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{socio.nombre_razon_social}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={getEstadoBadgeColor(socio.estado)}>
                    {socio.estado}
                  </Badge>
                  <Badge variant={tipoBadge.variant}>
                    {tipoBadge.label}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">RFC</p>
                  <p className="font-medium font-mono">{socio.rfc}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{socio.email || 'No especificado'}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                {onView && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onView(socio)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                )}
                {onEdit && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onEdit(socio)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                )}
                {onDelete && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onDelete(socio)}
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
