
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, FileEdit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartaPorte {
  id: string;
  folio: string;
  rfc_emisor: string;
  rfc_receptor: string;
  status: string;
  created_at: string;
  nombre_emisor?: string;
  nombre_receptor?: string;
}

interface CartasPorteTableProps {
  cartasPorte: CartaPorte[];
  loading: boolean;
  onDelete?: (id: string) => void;
}

export function CartasPorteTable({ cartasPorte, loading, onDelete }: CartasPorteTableProps) {
  const navigate = useNavigate();

  const handleContinuarBorrador = (carta: CartaPorte) => {
    navigate(`/cartas-porte/editar/${carta.id}`);
  };

  const handleEditarCompleta = (carta: CartaPorte) => {
    navigate(`/cartas-porte/editar/${carta.id}`);
  };

  const handleVer = (carta: CartaPorte) => {
    // TODO: Implementar vista de solo lectura
    console.log('Ver carta porte:', carta.id);
  };

  const handleEliminar = (carta: CartaPorte) => {
    if (onDelete && confirm('¿Estás seguro de que deseas eliminar esta carta de porte?')) {
      onDelete(carta.id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'borrador':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Borrador</Badge>;
      case 'timbrada':
        return <Badge variant="default" className="bg-green-100 text-green-800">Timbrada</Badge>;
      case 'cancelada':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
        <Card key={carta.id} className={carta.status === 'borrador' ? 'border-orange-200' : ''}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {carta.status === 'borrador' ? (
                  <span className="flex items-center gap-2">
                    <FileEdit className="h-4 w-4 text-orange-600" />
                    Borrador {carta.folio ? `- ${carta.folio}` : ''}
                  </span>
                ) : (
                  `Folio: ${carta.folio}`
                )}
              </CardTitle>
              {getStatusBadge(carta.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {carta.status === 'borrador' ? 'Emisor' : 'RFC Emisor'}
                </p>
                <p className="font-medium">
                  {carta.nombre_emisor || carta.rfc_emisor}
                  {carta.nombre_emisor && (
                    <span className="text-sm text-muted-foreground block">
                      {carta.rfc_emisor}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {carta.status === 'borrador' ? 'Receptor' : 'RFC Receptor'}
                </p>
                <p className="font-medium">
                  {carta.nombre_receptor || carta.rfc_receptor}
                  {carta.nombre_receptor && (
                    <span className="text-sm text-muted-foreground block">
                      {carta.rfc_receptor}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {carta.status === 'borrador' ? 'Última modificación' : 'Fecha'}
                </p>
                <p className="font-medium">
                  {new Date(carta.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              {carta.status === 'borrador' ? (
                <>
                  <Button 
                    size="sm" 
                    onClick={() => handleContinuarBorrador(carta)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <FileEdit className="h-4 w-4 mr-1" />
                    Continuar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEliminar(carta)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => handleVer(carta)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEditarCompleta(carta)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEliminar(carta)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
