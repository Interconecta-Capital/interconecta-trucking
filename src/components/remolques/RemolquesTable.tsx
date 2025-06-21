
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Link, Unlink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Remolque {
  id: string;
  placa: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  subtipo_rem?: string; // Added this property
  estado: string;
  vehiculo_asignado_id?: string;
  activo: boolean;
}

interface RemolquesTableProps {
  remolques: Remolque[];
  loading: boolean;
  onEdit?: (remolque: Remolque) => void;
  onView?: (remolque: Remolque) => void;
  onDelete: (remolque: Remolque) => void;
  onVincular?: (remolque: Remolque) => void; // Added this prop
  onLink?: (remolque: Remolque) => void;
  onUnlink?: (remolque: Remolque) => void;
}

const ESTADOS_CONFIG = {
  disponible: { label: 'Disponible', color: 'bg-green-500 text-white' },
  vinculado: { label: 'Vinculado', color: 'bg-blue-500 text-white' },
  mantenimiento: { label: 'Mantenimiento', color: 'bg-orange-500 text-white' },
  fuera_servicio: { label: 'Fuera de Servicio', color: 'bg-red-500 text-white' }
};

export function RemolquesTable({ 
  remolques, 
  loading, 
  onEdit, 
  onView, 
  onDelete, 
  onVincular,
  onLink, 
  onUnlink 
}: RemolquesTableProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (remolques.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay remolques registrados</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Placa</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Vehículo Vinculado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {remolques.map((remolque) => {
            const estadoConfig = ESTADOS_CONFIG[remolque.estado as keyof typeof ESTADOS_CONFIG] || 
                               { label: remolque.estado || 'Sin estado', color: 'bg-gray-500 text-white' };
            
            return (
              <TableRow key={remolque.id}>
                <TableCell className="font-medium">{remolque.placa}</TableCell>
                <TableCell>{remolque.subtipo_rem || 'No especificado'}</TableCell>
                <TableCell>
                  <Badge className={estadoConfig.color}>
                    {estadoConfig.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {remolque.vehiculo_asignado_id ? (
                    <span className="text-blue-600">Vinculado</span>
                  ) : (
                    <span className="text-gray-500">Sin vincular</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(remolque)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(remolque)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {remolque.vehiculo_asignado_id ? (
                      onUnlink && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onUnlink(remolque)}
                        >
                          <Unlink className="h-4 w-4" />
                        </Button>
                      )
                    ) : (
                      (onLink || onVincular) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onLink ? onLink(remolque) : onVincular?.(remolque)}
                        >
                          <Link className="h-4 w-4" />
                        </Button>
                      )
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(remolque)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
