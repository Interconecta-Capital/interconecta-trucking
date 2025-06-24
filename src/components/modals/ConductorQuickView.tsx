
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Calendar, FileText, Phone, Mail, AlertTriangle } from 'lucide-react';
import { Conductor } from '@/hooks/useConductores';

interface ConductorQuickViewProps {
  conductor: Conductor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onProgramar?: () => void;
}

const ESTADOS_CONFIG = {
  disponible: { label: 'Disponible', color: 'bg-green-500 text-white' },
  en_viaje: { label: 'En Viaje', color: 'bg-blue-500 text-white' },
  descanso: { label: 'Descanso', color: 'bg-gray-500 text-white' },
  vacaciones: { label: 'Vacaciones', color: 'bg-purple-500 text-white' },
  baja_temporal: { label: 'Baja Temporal', color: 'bg-orange-500 text-white' },
  fuera_servicio: { label: 'Fuera de Servicio', color: 'bg-red-500 text-white' }
};

export const ConductorQuickView = ({ conductor, open, onOpenChange, onEdit, onProgramar }: ConductorQuickViewProps) => {
  if (!conductor) return null;

  // Use the estado from conductor or default to 'disponible'
  const conductorEstado = conductor.estado || 'disponible';
  const estadoConfig = ESTADOS_CONFIG[conductorEstado as keyof typeof ESTADOS_CONFIG] || 
                      { label: conductorEstado || 'Sin estado', color: 'bg-gray-500 text-white' };

  const licenciaVencePronto = isDateCloseToExpiry(conductor.vigencia_licencia);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {conductor.nombre}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Estado y acciones principales */}
          <div className="flex items-center justify-between">
            <Badge className={estadoConfig.color}>
              {estadoConfig.label}
            </Badge>
            <div className="flex gap-2">
              {onProgramar && (
                <Button variant="outline" size="sm" onClick={onProgramar}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Programar
                </Button>
              )}
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  Editar
                </Button>
              )}
            </div>
          </div>

          {/* Información personal */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {conductor.rfc && (
                  <div>
                    <span className="text-sm text-muted-foreground">RFC</span>
                    <p className="font-medium font-mono">{conductor.rfc}</p>
                  </div>
                )}
                {conductor.curp && (
                  <div>
                    <span className="text-sm text-muted-foreground">CURP</span>
                    <p className="font-medium font-mono">{conductor.curp}</p>
                  </div>
                )}
              </div>

              {/* Contacto */}
              <div className="space-y-2">
                {conductor.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{conductor.telefono}</span>
                  </div>
                )}
                {conductor.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{conductor.email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Licencia de conducir */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Licencia de Conducir
                {licenciaVencePronto && (
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {conductor.num_licencia && (
                  <div>
                    <span className="text-sm text-muted-foreground">Número</span>
                    <p className="font-medium font-mono">{conductor.num_licencia}</p>
                  </div>
                )}
                {conductor.tipo_licencia && (
                  <div>
                    <span className="text-sm text-muted-foreground">Tipo</span>
                    <p className="font-medium">{conductor.tipo_licencia}</p>
                  </div>
                )}
              </div>

              {conductor.vigencia_licencia && (
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">Vigencia</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {formatDate(conductor.vigencia_licencia)}
                    </span>
                    {licenciaVencePronto && (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        Por vencer
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dirección */}
          {conductor.direccion && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Dirección</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {renderDireccion(conductor.direccion)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return 'No especificada';
  return new Date(dateString).toLocaleDateString('es-MX');
}

function isDateCloseToExpiry(dateString: string | undefined | null, daysThreshold = 30): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= daysThreshold && diffDays >= 0;
}

function renderDireccion(direccion: any): string {
  if (typeof direccion === 'string') return direccion;
  if (typeof direccion === 'object' && direccion !== null) {
    const parts = [];
    if (direccion.calle) parts.push(direccion.calle);
    if (direccion.numero) parts.push(`#${direccion.numero}`);
    if (direccion.colonia) parts.push(direccion.colonia);
    if (direccion.ciudad) parts.push(direccion.ciudad);
    if (direccion.estado) parts.push(direccion.estado);
    if (direccion.codigo_postal) parts.push(`CP ${direccion.codigo_postal}`);
    return parts.join(', ');
  }
  return 'Dirección no disponible';
}
