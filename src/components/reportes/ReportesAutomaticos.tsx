
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  Download,
  Mail,
  FileText,
  BarChart3,
  Calendar,
  Clock,
  Users,
  AlertTriangle
} from 'lucide-react';
import { useReportesAutomaticos, ConfiguracionReporte } from '@/hooks/useReportesAutomaticos';
import { ConfiguradorReporte } from './ConfiguradorReporte';
import { HistorialReportes } from './HistorialReportes';
import { PlantillasReporte } from './PlantillasReporte';

export default function ReportesAutomaticos() {
  const {
    reportes,
    historialReportes,
    loading,
    programarReporte,
    generarReporteAhora,
    obtenerReportes,
    actualizarReporte,
    eliminarReporte
  } = useReportesAutomaticos();

  const [mostrarConfigurador, setMostrarConfigurador] = useState(false);
  const [reporteEditando, setReporteEditando] = useState<ConfiguracionReporte | null>(null);

  useEffect(() => {
    obtenerReportes();
  }, [obtenerReportes]);

  const handleNuevoReporte = () => {
    setReporteEditando(null);
    setMostrarConfigurador(true);
  };

  const handleEditarReporte = (reporte: ConfiguracionReporte) => {
    setReporteEditando(reporte);
    setMostrarConfigurador(true);
  };

  const handleToggleReporte = async (id: string, activo: boolean) => {
    await actualizarReporte(id, { activo });
  };

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'diario': return <Calendar className="h-4 w-4" />;
      case 'semanal': return <BarChart3 className="h-4 w-4" />;
      case 'mensual': return <FileText className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'diario': return 'bg-blue-100 text-blue-800';
      case 'semanal': return 'bg-green-100 text-green-800';
      case 'mensual': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const reportesActivos = reportes.filter(r => r.activo);
  const reportesInactivos = reportes.filter(r => !r.activo);

  if (mostrarConfigurador) {
    return (
      <ConfiguradorReporte
        reporte={reporteEditando}
        onGuardar={async (configuracion) => {
          const exito = await programarReporte(configuracion);
          if (exito) {
            setMostrarConfigurador(false);
            setReporteEditando(null);
          }
        }}
        onCancelar={() => {
          setMostrarConfigurador(false);
          setReporteEditando(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes Automáticos</h1>
          <p className="text-muted-foreground mt-2">
            Configura y programa reportes automáticos para diferentes niveles organizacionales
          </p>
        </div>
        <Button onClick={handleNuevoReporte} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Reporte
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{reportes.length}</div>
                <div className="text-sm text-gray-600">Total Reportes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{reportesActivos.length}</div>
                <div className="text-sm text-gray-600">Activos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {historialReportes.filter(h => h.estado === 'completado').length}
                </div>
                <div className="text-sm text-gray-600">Generados</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {historialReportes.filter(h => h.estado === 'error').length}
                </div>
                <div className="text-sm text-gray-600">Con Errores</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="configurados" className="w-full">
        <TabsList>
          <TabsTrigger value="configurados">Reportes Configurados</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
        </TabsList>

        <TabsContent value="configurados" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : reportes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay reportes configurados</h3>
                <p className="text-gray-600 mb-4">
                  Crea tu primer reporte automático para comenzar a recibir información importante.
                </p>
                <Button onClick={handleNuevoReporte}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Reporte
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reportes.map((reporte) => (
                <Card key={reporte.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          {getIconoTipo(reporte.tipo)}
                          <div>
                            <h3 className="font-medium">{reporte.nombre}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getColorTipo(reporte.tipo)}>
                                {reporte.tipo}
                              </Badge>
                              <Badge variant="outline">
                                {reporte.formato.toUpperCase()}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Users className="h-3 w-3" />
                                {reporte.destinatarios.length}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generarReporteAhora(reporte.id!)}
                          disabled={loading}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditarReporte(reporte)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>

                        <Button
                          variant={reporte.activo ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleReporte(reporte.id!, !reporte.activo)}
                        >
                          {reporte.activo ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {reporte.horario.frecuencia}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {reporte.destinatarios.slice(0, 2).join(', ')}
                          {reporte.destinatarios.length > 2 && ` +${reporte.destinatarios.length - 2} más`}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="historial">
          <HistorialReportes historial={historialReportes} />
        </TabsContent>

        <TabsContent value="plantillas">
          <PlantillasReporte onSeleccionar={handleNuevoReporte} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
