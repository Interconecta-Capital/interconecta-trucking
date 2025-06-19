import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Conductor } from '@/types/cartaPorte';

interface ConductoresTableProps {
  conductores: Conductor[];
  onEdit: (conductor: Conductor) => void;
  onDelete: (id: string) => void;
  onView: (conductor: Conductor) => void;
}

export function ConductoresTable({ conductores, onEdit, onDelete, onView }: ConductoresTableProps) {
  const getEstadoBadge = (estado: string, activo: boolean = true) => {
    // Use activo property with default value
    if (!activo) {
      return <Badge variant="secondary">Inactivo</Badge>;
    }
    
    switch (estado) {
      case 'disponible':
        return <Badge variant="default" className="bg-green-100 text-green-800">Disponible</Badge>;
      case 'en_viaje':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">En Viaje</Badge>;
      case 'descanso':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Descanso</Badge>;
      case 'mantenimiento':
        return <Badge variant="destructive">Mantenimiento</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableHead>Nombre</TableHead>
        <TableHead>RFC</TableHead>
        <TableHead>Licencia</TableHead>
        <TableHead>Estado</TableHead>
        <TableHead className="text-right">Acciones</TableHead>
      </TableHeader>
      <TableBody>
        {conductores.map((conductor) => (
          <TableRow key={conductor.id}>
            <TableCell>{conductor.nombre}</TableCell>
            <TableCell>{conductor.rfc}</TableCell>
            <TableCell>{conductor.num_licencia}</TableCell>
            <TableCell>{getEstadoBadge(conductor.estado, conductor.activo)}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(conductor)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(conductor)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(conductor.id)} className="text-red-600">
                    <Trash className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
