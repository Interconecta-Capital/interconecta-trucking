
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Clock, 
  Wrench, 
  FileText, 
  TrendingDown,
  CheckCircle
} from 'lucide-react';
import { useDocumentosEntidades } from '@/hooks/useDocumentosEntidades';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useConductores } from '@/hooks/useConductores';
import { differenceInDays } from 'date-fns';

export function OperationalAlertsPanel() {
  const { documentos } = useDocumentosEntidades();
  const { vehiculos } = useVehiculos();
  const { conductores } = useConductores();

  // Detectar documentos próximos a vencer (30 días)
  const documentosProximosVencer = documentos.filter(doc => {
    if (!doc.fecha_vencimiento) return false;
    const diasRestantes = differenceInDays(new Date(doc.fecha_vencimiento), new Date());
    return diasRestantes <= 30 && diasRestantes > 0;
  });

  // Detectar documentos vencidos
  const documentosVencidos = documentos.filter(doc => {
    if (!doc.fecha_vencimiento) return false;
    return new Date(doc.fecha_vencimiento) < new Date();
  });

  // Detectar vehículos que requieren mantenimiento
  const vehiculosMantenimiento = vehiculos.filter(v => 
    v.estado === 'mantenimiento' || v.estado === 'revision'
  );

  // Detectar conductores con licencias próximas a vencer
  const conductoresLicenciaVence = conductores.filter(c => {
    if (!c.vigencia_licencia) return false;
    const diasRestantes = differenceInDays(new Date(c.vigencia_licencia), new Date());
    return diasRestantes <= 30 && diasRestantes > 0;
  });

  const totalAlertas = documentosProximosVencer.length + documentosVencidos.length + 
                      vehiculosMantenimiento.length + conductoresLicenciaVence.length;

  if (totalAlertas === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Estado Operacional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-700">
            ✅ Todas las operaciones están funcionando correctamente. No hay alertas activas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          Alertas Operacionales
          <Badge variant="destructive" className="ml-auto">
            {totalAlertas}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {/* Documentos vencidos - Prioridad alta */}
            {documentosVencidos.map((doc) => (
              <Alert key={doc.id} className="border-red-300 bg-red-100">
                <FileText className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <span className="font-medium">VENCIDO:</span> {doc.tipo_documento} 
                  {doc.entidad_tipo === 'vehiculo' ? ' de vehículo' : ' de conductor'} 
                  (Venció el {new Date(doc.fecha_vencimiento!).toLocaleDateString('es-MX')})
                </AlertDescription>
              </Alert>
            ))}

            {/* Documentos próximos a vencer */}
            {documentosProximosVencer.map((doc) => (
              <Alert key={doc.id} className="border-orange-300 bg-orange-100">
                <Clock className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <span className="font-medium">Vence pronto:</span> {doc.tipo_documento} 
                  {doc.entidad_tipo === 'vehiculo' ? ' de vehículo' : ' de conductor'} 
                  (Vence el {new Date(doc.fecha_vencimiento!).toLocaleDateString('es-MX')})
                </AlertDescription>
              </Alert>
            ))}

            {/* Vehículos en mantenimiento */}
            {vehiculosMantenimiento.map((vehiculo) => (
              <Alert key={vehiculo.id} className="border-blue-300 bg-blue-100">
                <Wrench className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <span className="font-medium">Mantenimiento:</span> Vehículo {vehiculo.placa} 
                  está en {vehiculo.estado}
                </AlertDescription>
              </Alert>
            ))}

            {/* Licencias de conducir próximas a vencer */}
            {conductoresLicenciaVence.map((conductor) => (
              <Alert key={conductor.id} className="border-yellow-300 bg-yellow-100">
                <FileText className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <span className="font-medium">Licencia vence:</span> {conductor.nombre} 
                  (Vence el {new Date(conductor.vigencia_licencia!).toLocaleDateString('es-MX')})
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
