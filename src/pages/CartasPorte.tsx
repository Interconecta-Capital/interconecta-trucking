
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Plus, Search, Edit, Eye, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useCartasPorte } from '@/hooks/useCartasPorte';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function CartasPorte() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    cartasPorte, 
    loading, 
    eliminarCartaPorte,
    isDeleting
  } = useCartasPorte();

  const handleDeleteCartaPorte = async (id) => {
    await eliminarCartaPorte(id);
  };

  const filteredCartasPorte = cartasPorte.filter(carta =>
    carta.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    carta.rfc_emisor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    carta.nombre_emisor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    carta.rfc_receptor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    carta.nombre_receptor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estadísticas dinámicas
  const totalCartas = cartasPorte.length;
  const pendientes = cartasPorte.filter(c => c.status === 'borrador' || c.status === 'pendiente').length;
  const completadas = cartasPorte.filter(c => c.status === 'timbrada' || c.status === 'completada').length;
  const canceladas = cartasPorte.filter(c => c.status === 'cancelada').length;

  const getStatusBadge = (status) => {
    const variants = {
      'borrador': 'outline',
      'pendiente': 'secondary',
      'timbrada': 'default',
      'completada': 'default',
      'cancelada': 'destructive'
    };
    
    const labels = {
      'borrador': 'Borrador',
      'pendiente': 'Pendiente',
      'timbrada': 'Timbrada',
      'completada': 'Completada',
      'cancelada': 'Cancelada'
    };

    const icons = {
      'borrador': <Edit className="h-3 w-3 mr-1" />,
      'pendiente': <Clock className="h-3 w-3 mr-1" />,
      'timbrada': <CheckCircle className="h-3 w-3 mr-1" />,
      'completada': <CheckCircle className="h-3 w-3 mr-1" />,
      'cancelada': <AlertCircle className="h-3 w-3 mr-1" />
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {icons[status]}
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Cartas Porte</h1>
          <p className="text-muted-foreground">
            Gestiona tus cartas de porte electrónicas
          </p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link to="/cartas-porte/nueva">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Carta Porte
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cartas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCartas}</div>
            <p className="text-xs text-muted-foreground">
              {totalCartas === 0 ? 'Sin cartas registradas' : 'Cartas de porte generadas'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendientes}</div>
            <p className="text-xs text-muted-foreground">
              Por procesar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completadas}</div>
            <p className="text-xs text-muted-foreground">
              Cartas finalizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{canceladas}</div>
            <p className="text-xs text-muted-foreground">
              Cartas canceladas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle>Lista de Cartas Porte</CardTitle>
              <CardDescription>
                Gestiona todas tus cartas de porte
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por folio, RFC o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-muted-foreground">Cargando cartas porte...</p>
            </div>
          ) : filteredCartasPorte.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No se encontraron cartas porte' : 'No hay cartas registradas'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza creando tu primera carta de porte'
                }
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link to="/cartas-porte/nueva">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Carta
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folio</TableHead>
                  <TableHead>Emisor</TableHead>
                  <TableHead>Receptor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCartasPorte.map((carta) => (
                  <TableRow key={carta.id}>
                    <TableCell className="font-mono font-medium">{carta.folio}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{carta.nombre_emisor || 'Sin nombre'}</div>
                        <div className="text-sm text-muted-foreground font-mono">{carta.rfc_emisor}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{carta.nombre_receptor || 'Sin nombre'}</div>
                        <div className="text-sm text-muted-foreground font-mono">{carta.rfc_receptor}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(carta.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(carta.created_at).toLocaleDateString('es-MX')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(carta.created_at).toLocaleTimeString('es-MX')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={isDeleting}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar carta porte?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. La carta porte {carta.folio} será eliminada permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCartaPorte(carta.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
