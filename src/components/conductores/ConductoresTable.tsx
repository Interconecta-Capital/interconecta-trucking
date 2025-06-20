
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, Eye, Phone, Mail, AlertTriangle } from 'lucide-react';
import { Conductor } from '@/types/cartaPorte';

interface ConductoresTableProps {
  conductores: Conductor[];
  onEdit: (conductor: Conductor) => void;
  onDelete: (conductor: Conductor) => void;
  onView: (conductor: Conductor) => void;
}

export function ConductoresTable({ conductores, onEdit, onDelete, onView }: ConductoresTableProps) {
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'disponible':
        return <Badge variant="default" className="bg-green-100 text-green-800">Disponible</Badge>;
      case 'en_viaje':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">En Viaje</Badge>;
      case 'descanso':
        return <Badge variant="secondary">Descanso</Badge>;
      case 'inactivo':
        return <Badge variant="destructive">Inactivo</Badge>;
      default:
        return <Badge variant="outline">{estado || 'Sin estado'}</Badge>;
    }
  };

  const isLicenseExpiringSoon = (vigencia: string | null) => {
    if (!vigencia) return false;
    const today = new Date();
    const expiryDate = new Date(vigencia);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const isLicenseExpired = (vigencia: string | null) => {
    if (!vigencia) return false;
    const today = new Date();
    const expiryDate = new Date(vigencia);
    return expiryDate < today;
  };

  if (conductores.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 mb-2">No hay conductores registrados</p>
            <p className="text-gray-500">Comienza agregando tu primer conductor</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conductores Registrados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>RFC</TableHead>
                <TableHead>Licencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conductores.map((conductor) => (
                <TableRow key={conductor.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{conductor.nombre}</div>
                      {conductor.curp && (
                        <div className="text-sm text-gray-500">CURP: {conductor.curp}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm">
                      {conductor.rfc || 'No especificado'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {conductor.num_licencia || 'No especificada'}
                      </div>
                      {conductor.tipo_licencia && (
                        <div className="text-sm text-gray-500">
                          Tipo {conductor.tipo_licencia}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getEstadoBadge(conductor.estado || 'disponible')}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {conductor.telefono && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {conductor.telefono}
                        </div>
                      )}
                      {conductor.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {conductor.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {conductor.vigencia_licencia ? (
                      <div className="flex items-center gap-1">
                        {isLicenseExpired(conductor.vigencia_licencia) ? (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Vencida
                          </Badge>
                        ) : isLicenseExpiringSoon(conductor.vigencia_licencia) ? (
                          <Badge variant="default" className="bg-orange-100 text-orange-800 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Por vencer
                          </Badge>
                        ) : (
                          <div className="text-sm">
                            {new Date(conductor.vigencia_licencia).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No especificada</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(conductor)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(conductor)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(conductor)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
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
      </CardContent>
    </Card>
  );
}
