
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartaPorte {
  id: string;
  folio: string;
  rfc_emisor: string;
  rfc_receptor: string;
  status: string;
  created_at: string;
}

interface CartasPorteTableProps {
  cartasPorte: CartaPorte[];
  loading: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function CartasPorteTable({ cartasPorte, loading, onEdit, onDelete }: CartasPorteTableProps) {
  const navigate = useNavigate();

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id);
    } else {
      navigate(`/cartas-porte/${id}/editar`);
    }
  };

  const handleView = (id: string) => {
    navigate(`/cartas-porte/${id}`);
  };

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando cartas de porte...</div>
        </CardContent>
      </Card>
    );
  }

  if (cartasPorte.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No hay cartas de porte registradas
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {cartasPorte.map((carta) => (
        <Card key={carta.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Folio: {carta.folio || 'Sin folio'}
              </CardTitle>
              <Badge 
                variant={carta.status === 'borrador' ? 'secondary' : 'default'}
                className={carta.status === 'borrador' ? 'bg-yellow-100 text-yellow-800' : ''}
              >
                {carta.status === 'borrador' ? 'Borrador' : carta.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">RFC Emisor</p>
                <p className="font-medium">{carta.rfc_emisor || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">RFC Receptor</p>
                <p className="font-medium">{carta.rfc_receptor || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha</p>
                <p className="font-medium">{new Date(carta.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={() => handleView(carta.id)}>
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleEdit(carta.id)}>
                <Edit className="h-4 w-4 mr-1" />
                {carta.status === 'borrador' ? 'Continuar' : 'Editar'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDelete(carta.id)}>
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
