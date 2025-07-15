import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Calendar, CheckCircle, AlertTriangle, Clock, DollarSign } from 'lucide-react';

interface SocioHistorialProps {
  socio: any;
}

export function SocioHistorial({ socio }: SocioHistorialProps) {
  // Simulamos historial de actividades del socio
  const actividades = [
    {
      id: '1',
      tipo: 'carta_porte',
      descripcion: 'Carta Porte #CP-2024-0156 generada',
      fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      estado: 'completado',
      valor: 45000,
      detalles: 'Transporte México-Guadalajara'
    },
    {
      id: '2',
      tipo: 'documento',
      descripcion: 'Documentos fiscales actualizados',
      fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      estado: 'completado',
      detalles: 'RFC y constancia de situación fiscal'
    },
    {
      id: '3',
      tipo: 'carta_porte',
      descripcion: 'Carta Porte #CP-2024-0145 en proceso',
      fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      estado: 'pendiente',
      valor: 32000,
      detalles: 'Transporte Monterrey-Tijuana'
    },
    {
      id: '4',
      tipo: 'revision',
      descripcion: 'Revisión fiscal mensual',
      fecha: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      estado: 'completado',
      detalles: 'Cumplimiento normativo verificado'
    },
    {
      id: '5',
      tipo: 'carta_porte',
      descripcion: 'Carta Porte #CP-2024-0134 completada',
      fecha: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      estado: 'completado',
      valor: 28500,
      detalles: 'Transporte local CDMX'
    },
    {
      id: '6',
      tipo: 'alerta',
      descripcion: 'Documento próximo a vencer',
      fecha: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      estado: 'advertencia',
      detalles: 'Constancia de situación fiscal'
    }
  ];

  const getIconByType = (tipo: string) => {
    switch (tipo) {
      case 'carta_porte':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'documento':
        return <Calendar className="h-4 w-4 text-green-600" />;
      case 'revision':
        return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case 'alerta':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getBadgeByState = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completado</Badge>;
      case 'pendiente':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'advertencia':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">Advertencia</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  // Calculamos estadísticas del historial
  const estadisticas = {
    totalActividades: actividades.length,
    cartasPorte: actividades.filter(a => a.tipo === 'carta_porte').length,
    completadas: actividades.filter(a => a.estado === 'completado').length,
    valorTotal: actividades.filter(a => a.valor).reduce((sum, a) => sum + (a.valor || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas del historial */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{estadisticas.totalActividades}</div>
            <div className="text-sm text-muted-foreground">Total Actividades</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{estadisticas.cartasPorte}</div>
            <div className="text-sm text-muted-foreground">Cartas Porte</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{estadisticas.completadas}</div>
            <div className="text-sm text-muted-foreground">Completadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              ${estadisticas.valorTotal.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Valor Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline de actividades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historial de Actividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {actividades.map((actividad, index) => (
              <div key={actividad.id}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIconByType(actividad.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{actividad.descripcion}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {actividad.detalles}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {actividad.fecha.toLocaleDateString()} • {actividad.fecha.toLocaleTimeString()}
                          </span>
                          {actividad.valor && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3 text-green-600" />
                                <span className="text-xs font-medium text-green-600">
                                  ${actividad.valor.toLocaleString()}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {getBadgeByState(actividad.estado)}
                      </div>
                    </div>
                  </div>
                </div>
                {index < actividades.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}