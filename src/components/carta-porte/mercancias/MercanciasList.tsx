
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Mercancia } from '@/hooks/useMercancias';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';

interface MercanciasListProps {
  mercancias: Mercancia[];
  onEdit: (mercancia: Mercancia) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const MercanciasList: React.FC<MercanciasListProps> = ({
  mercancias,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    mercancia?: Mercancia;
  }>({ open: false });

  const handleDelete = () => {
    if (deleteDialog.mercancia?.id) {
      onDelete(deleteDialog.mercancia.id);
      setDeleteDialog({ open: false });
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  const formatWeight = (value?: number) => {
    if (!value) return '-';
    return `${value.toLocaleString('es-MX')} kg`;
  };

  if (mercancias.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="text-4xl mb-4">📦</div>
        <p className="text-lg mb-2">No hay mercancías agregadas</p>
        <p className="text-sm">Agrega mercancías individualmente o importa desde Excel/CSV</p>
      </div>
    );
  }

  const totalCantidad = mercancias.reduce((sum, m) => sum + (m.cantidad || 0), 0);
  const totalPeso = mercancias.reduce((sum, m) => sum + (m.peso_kg || 0), 0);
  const totalValor = mercancias.reduce((sum, m) => sum + (m.valor_mercancia || 0), 0);
  const materialesPeligrosos = mercancias.filter(m => m.material_peligroso).length;

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{mercancias.length}</div>
          <div className="text-sm text-blue-600">Mercancías</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{totalCantidad.toLocaleString()}</div>
          <div className="text-sm text-green-600">Cantidad Total</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{formatWeight(totalPeso)}</div>
          <div className="text-sm text-purple-600">Peso Total</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalValor)}</div>
          <div className="text-sm text-orange-600">Valor Total</div>
        </div>
      </div>

      {/* Alertas */}
      {materialesPeligrosos > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">
              Esta carga incluye {materialesPeligrosos} material(es) peligroso(s)
            </span>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clave/Descripción</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Peso</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Material Peligroso</TableHead>
              <TableHead className="w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mercancias.map((mercancia) => (
              <TableRow key={mercancia.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">
                      <Badge variant="outline" className="mr-2 text-xs">
                        {mercancia.bienes_transp}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {mercancia.descripcion}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {mercancia.cantidad?.toLocaleString('es-MX')}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {mercancia.clave_unidad}
                  </Badge>
                </TableCell>
                <TableCell>{formatWeight(mercancia.peso_kg)}</TableCell>
                <TableCell>{formatCurrency(mercancia.valor_mercancia)}</TableCell>
                <TableCell>
                  {mercancia.material_peligroso ? (
                    <div className="space-y-1">
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Peligroso
                      </Badge>
                      {mercancia.cve_material_peligroso && (
                        <div className="text-xs text-muted-foreground">
                          {mercancia.cve_material_peligroso}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">No</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(mercancia)}
                      disabled={isLoading}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteDialog({ open: true, mercancia })}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de confirmación para eliminar */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar la mercancía "{deleteDialog.mercancia?.descripcion}"?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false })}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
