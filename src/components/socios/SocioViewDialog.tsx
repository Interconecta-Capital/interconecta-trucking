
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Users, Building, Calendar, FileText, Settings } from 'lucide-react';

interface Socio {
  id: string;
  nombre_razon_social: string;
  rfc: string;
  tipo_persona?: string;
  telefono?: string;
  email?: string;
  direccion?: any;
  estado: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

interface SocioViewDialogProps {
  socio: Socio | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

const ESTADOS_CONFIG = {
  activo: { label: 'Activo', color: 'bg-green-500 text-white' },
  inactivo: { label: 'Inactivo', color: 'bg-gray-500 text-white' },
  suspendido: { label: 'Suspendido', color: 'bg-red-500 text-white' }
};

export const SocioViewDialog = ({ socio, open, onOpenChange, onEdit }: SocioViewDialogProps) => {
  if (!socio) return null;

  const estadoConfig = ESTADOS_CONFIG[socio.estado as keyof typeof ESTADOS_CONFIG] || 
                      { label: socio.estado || 'Sin estado', color: 'bg-gray-500 text-white' };

  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  const getTipoPersona = (tipo: string | undefined): { label: string; icon: React.ReactNode } => {
    switch (tipo) {
      case 'fisica':
        return { label: 'Persona Física', icon: <Users className="h-4 w-4" /> };
      case 'moral':
        return { label: 'Persona Moral', icon: <Building className="h-4 w-4" /> };
      default:
        return { label: 'No especificado', icon: <FileText className="h-4 w-4" /> };
    }
  };

  const tipoPersona = getTipoPersona(socio.tipo_persona);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {tipoPersona.icon}
            {socio.nombre_razon_social}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Estado y acciones principales */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={estadoConfig.color}>
                {estadoConfig.label}
              </Badge>
              <Badge variant="outline">
                {tipoPersona.label}
              </Badge>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Settings className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </div>

          {/* Información básica */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">RFC</span>
                  <p className="font-medium font-mono">{socio.rfc}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Tipo de Persona</span>
                  <p className="font-medium">{tipoPersona.label}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Email</span>
                  <p className="font-medium">{socio.email || 'No especificado'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Teléfono</span>
                  <p className="font-medium">{socio.telefono || 'No especificado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dirección */}
          {socio.direccion && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Dirección
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {socio.direccion.calle && (
                    <p><span className="text-muted-foreground">Calle:</span> {socio.direccion.calle}</p>
                  )}
                  {socio.direccion.numero_exterior && (
                    <p><span className="text-muted-foreground">Número Exterior:</span> {socio.direccion.numero_exterior}</p>
                  )}
                  {socio.direccion.numero_interior && (
                    <p><span className="text-muted-foreground">Número Interior:</span> {socio.direccion.numero_interior}</p>
                  )}
                  {socio.direccion.colonia && (
                    <p><span className="text-muted-foreground">Colonia:</span> {socio.direccion.colonia}</p>
                  )}
                  {socio.direccion.municipio && (
                    <p><span className="text-muted-foreground">Municipio:</span> {socio.direccion.municipio}</p>
                  )}
                  {socio.direccion.estado && (
                    <p><span className="text-muted-foreground">Estado:</span> {socio.direccion.estado}</p>
                  )}
                  {socio.direccion.codigo_postal && (
                    <p><span className="text-muted-foreground">Código Postal:</span> {socio.direccion.codigo_postal}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información de registro */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información de Registro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Fecha de Registro</span>
                  <p className="font-medium">{formatDate(socio.created_at)}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Última Actualización</span>
                  <p className="font-medium">{formatDate(socio.updated_at)}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Estado del Registro</span>
                  <p className="font-medium">{socio.activo ? 'Activo' : 'Inactivo'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
