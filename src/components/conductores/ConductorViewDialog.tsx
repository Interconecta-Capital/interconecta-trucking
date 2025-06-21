
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { Separator } from '@/components/ui/separator';
import { Conductor } from '@/types/cartaPorte';
import { User, IdCard, Phone, Calendar, Shield, MapPin } from 'lucide-react';

interface ConductorViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conductor: Conductor | null;
  onEdit?: (conductor: Conductor) => void;
}

export function ConductorViewDialog({
  open,
  onOpenChange,
  conductor,
  onEdit
}: ConductorViewDialogProps) {
  if (!conductor) return null;

  const getEstadoBadge = (estado: string) => {
    const variants = {
      disponible: 'bg-green-50 text-green-700 border-green-200',
      en_viaje: 'bg-blue-50 text-blue-700 border-blue-200',
      descanso: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      inactivo: 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return variants[estado as keyof typeof variants] || variants.inactivo;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <SectionHeader
            title={conductor.nombre}
            icon={User}
            badge={
              <Badge className={getEstadoBadge(conductor.estado)}>
                {conductor.estado?.replace('_', ' ').toUpperCase()}
              </Badge>
            }
            actions={
              <Button onClick={() => onEdit?.(conductor)} variant="outline">
                Editar
              </Button>
            }
            className="border-0 pb-0"
          />
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-blue-interconecta" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-60">RFC</p>
                  <p className="text-gray-90">{conductor.rfc || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-60">CURP</p>
                  <p className="text-gray-90">{conductor.curp || 'No especificado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Licencia de Conducir */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <IdCard className="h-5 w-5 text-blue-interconecta" />
                Licencia de Conducir
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-60">Número de Licencia</p>
                  <p className="text-gray-90">{conductor.num_licencia || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-60">Tipo</p>
                  <p className="text-gray-90">{conductor.tipo_licencia || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-60">Vigencia</p>
                  <p className="text-gray-90">
                    {conductor.vigencia_licencia 
                      ? new Date(conductor.vigencia_licencia).toLocaleDateString()
                      : 'No especificada'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="h-5 w-5 text-blue-interconecta" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-60">Teléfono</p>
                  <p className="text-gray-90">{conductor.telefono || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-60">Email</p>
                  <p className="text-gray-90">{conductor.email || 'No especificado'}</p>
                </div>
              </div>

              {conductor.direccion && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-blue-interconecta" />
                      <p className="text-sm font-medium text-gray-60">Dirección</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <p><span className="font-medium">Calle:</span> {conductor.direccion.calle || 'N/A'}</p>
                      <p><span className="font-medium">Número:</span> {conductor.direccion.numero_exterior || 'N/A'}</p>
                      <p><span className="font-medium">Colonia:</span> {conductor.direccion.colonia || 'N/A'}</p>
                      <p><span className="font-medium">C.P.:</span> {conductor.direccion.codigo_postal || 'N/A'}</p>
                      <p><span className="font-medium">Municipio:</span> {conductor.direccion.municipio || 'N/A'}</p>
                      <p><span className="font-medium">Estado:</span> {conductor.direccion.estado || 'N/A'}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Información SCT */}
          {conductor.operador_sct && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-blue-interconecta" />
                  Información SCT
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-60">Residencia Fiscal</p>
                    <p className="text-gray-90">{conductor.residencia_fiscal || 'No especificada'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-60">Registro ID Tributario</p>
                    <p className="text-gray-90">{conductor.num_reg_id_trib || 'No especificado'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fechas del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-blue-interconecta" />
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-60">Fecha de Registro</p>
                  <p className="text-gray-90">
                    {conductor.created_at 
                      ? new Date(conductor.created_at).toLocaleDateString()
                      : 'No disponible'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-60">Última Actualización</p>
                  <p className="text-gray-90">
                    {conductor.updated_at 
                      ? new Date(conductor.updated_at).toLocaleDateString()
                      : 'No disponible'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-20">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
