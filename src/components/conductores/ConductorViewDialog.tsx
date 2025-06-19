
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, User, Phone, Mail, MapPin, IdCard, Shield, AlertTriangle } from 'lucide-react';
import { Conductor } from '@/types/cartaPorte';

interface ConductorViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conductor: Conductor | null;
  onEdit: (conductor: Conductor) => void;
}

export function ConductorViewDialog({ 
  open, 
  onOpenChange, 
  conductor,
  onEdit 
}: ConductorViewDialogProps) {
  if (!conductor) return null;

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'disponible':
        return <Badge className="bg-green-100 text-green-800">Disponible</Badge>;
      case 'en_viaje':
        return <Badge className="bg-blue-100 text-blue-800">En Viaje</Badge>;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Detalles del Conductor
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(conductor)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </DialogTitle>
          <DialogDescription>
            Información completa del conductor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Principal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {conductor.nombre}
                </span>
                {getEstadoBadge(conductor.estado || 'disponible')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">RFC</p>
                  <p className="font-mono">{conductor.rfc || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">CURP</p>
                  <p className="font-mono">{conductor.curp || 'No especificado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de Licencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IdCard className="h-5 w-5" />
                Información de Licencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Número de Licencia</p>
                  <p className="font-mono">{conductor.num_licencia || 'No especificada'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tipo de Licencia</p>
                  <p>{conductor.tipo_licencia ? `Tipo ${conductor.tipo_licencia}` : 'No especificado'}</p>
                </div>
              </div>
              
              {conductor.vigencia_licencia && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Vigencia</p>
                  <div className="flex items-center gap-2">
                    <p>{new Date(conductor.vigencia_licencia).toLocaleDateString()}</p>
                    {isLicenseExpired(conductor.vigencia_licencia) ? (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Vencida
                      </Badge>
                    ) : isLicenseExpiringSoon(conductor.vigencia_licencia) ? (
                      <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Por vencer
                      </Badge>
                    ) : null}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información de Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Teléfono</p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {conductor.telefono || 'No especificado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {conductor.email || 'No especificado'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dirección */}
          {conductor.direccion && Object.keys(conductor.direccion).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Dirección
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {conductor.direccion.calle && (
                    <p>{conductor.direccion.calle} {conductor.direccion.numero_exterior}</p>
                  )}
                  {conductor.direccion.colonia && (
                    <p>{conductor.direccion.colonia}</p>
                  )}
                  <p>
                    {conductor.direccion.municipio && `${conductor.direccion.municipio}, `}
                    {conductor.direccion.estado}
                    {conductor.direccion.codigo_postal && ` CP ${conductor.direccion.codigo_postal}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información SCT */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Información SCT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Operador SCT</p>
                  <Badge variant={conductor.operador_sct ? "default" : "secondary"}>
                    {conductor.operador_sct ? 'Sí' : 'No'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Residencia Fiscal</p>
                  <p>{conductor.residencia_fiscal || 'MEX'}</p>
                </div>
              </div>
              
              {conductor.num_reg_id_trib && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Registro ID Tributario</p>
                  <p className="font-mono">{conductor.num_reg_id_trib}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
