
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
}

interface SociosTableProps {
  socios: Socio[];
  loading: boolean;
}

export function SociosTable({ socios, loading }: SociosTableProps) {
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

  return (
    <div className="space-y-4">
      {socios.map((socio) => (
        <Card key={socio.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{socio.nombre_razon_social}</CardTitle>
              <Badge variant={socio.activo ? 'default' : 'secondary'}>
                {socio.estado}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">RFC</p>
                <p className="font-medium">{socio.rfc}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{socio.email}</p>
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
