
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import { Conductor } from '@/types/cartaPorte';
import { MoreHorizontal, Eye, Edit, Trash2, User, IdCard, Phone, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ConductoresTableProps {
  conductores: Conductor[];
  onEdit: (conductor: Conductor) => void;
  onDelete: (conductor: Conductor) => void;
  onView: (conductor: Conductor) => void;
}

export function ConductoresTable({ conductores, onEdit, onDelete, onView }: ConductoresTableProps) {
  const getEstadoBadge = (estado: string) => {
    const variants = {
      disponible: 'bg-green-50 text-green-700 border-green-200',
      en_viaje: 'bg-blue-50 text-blue-700 border-blue-200',
      descanso: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      inactivo: 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return variants[estado as keyof typeof variants] || variants.inactivo;
  };

  const isLicenseExpiringSoon = (vigencia: string | null) => {
    if (!vigencia) return false;
    const today = new Date();
    const expiryDate = new Date(vigencia);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  if (conductores.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-90 mb-2">No hay conductores registrados</h3>
          <p className="text-gray-60">Comienza agregando el primer conductor al sistema.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {conductores.map((conductor) => (
        <Card key={conductor.id} className="group hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-light text-blue-interconecta font-semibold">
                    {conductor.nombre.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-90 group-hover:text-blue-interconecta transition-colors">
                    {conductor.nombre}
                  </h3>
                  <p className="text-sm text-gray-60">
                    {conductor.rfc || 'Sin RFC'}
                  </p>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-pure-white border-gray-20">
                  <DropdownMenuItem onClick={() => onView(conductor)} className="cursor-pointer">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver detalles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(conductor)} className="cursor-pointer">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(conductor)} 
                    className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-60">Estado</span>
                <Badge className={getEstadoBadge(conductor.estado)}>
                  {conductor.estado?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              {conductor.num_licencia && (
                <div className="flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-gray-50" />
                  <span className="text-sm text-gray-70">
                    Licencia: {conductor.num_licencia}
                    {conductor.tipo_licencia && ` (${conductor.tipo_licencia})`}
                  </span>
                </div>
              )}

              {conductor.telefono && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-50" />
                  <span className="text-sm text-gray-70">{conductor.telefono}</span>
                </div>
              )}

              {isLicenseExpiringSoon(conductor.vigencia_licencia) && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-700">Licencia próxima a vencer</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-10">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onView(conductor)}
                  className="flex-1"
                >
                  Ver Detalles
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEdit(conductor)}
                  className="flex-1"
                >
                  Editar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
