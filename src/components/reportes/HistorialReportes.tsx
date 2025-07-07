
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Mail, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText
} from 'lucide-react';
import { ReporteGenerado } from '@/hooks/useReportesAutomaticos';

interface HistorialReportesProps {
  historial: ReporteGenerado[];
}

export function HistorialReportes({ historial }: HistorialReportesProps) {
  const getIconoEstado = (estado: string) => {
    switch (estado) {
      case 'completado': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'generando': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'completado': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'generando': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (historial.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay reportes generados</h3>
          <p className="text-gray-600">
            El historial de reportes aparecerá aquí una vez que se generen automáticamente o manualmente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {historial.map((reporte) => (
        <Card key={reporte.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getIconoEstado(reporte.estado)}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{reporte.tipo}</h4>
                    <Badge className={getColorEstado(reporte.estado)}>
                      {reporte.estado}
                    </Badge>
                    <Badge variant="outline">
                      {reporte.formato.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {new Date(reporte.fecha_generacion).toLocaleString('es-MX')}
                  </div>
                  {reporte.error_mensaje && (
                    <div className="text-sm text-red-600 mt-1">
                      Error: {reporte.error_mensaje}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {reporte.destinatarios_enviados.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Mail className="h-3 w-3" />
                    {reporte.destinatarios_enviados.length} enviados
                  </div>
                )}
                
                {reporte.archivo_url && reporte.estado === 'completado' && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={reporte.archivo_url} download>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
