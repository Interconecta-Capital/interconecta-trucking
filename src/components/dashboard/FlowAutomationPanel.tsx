import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  PlayCircle, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Truck,
  BarChart3,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useAutomaticFlows } from '@/hooks/useAutomaticFlows';
import { useCotizaciones } from '@/hooks/useCotizaciones';
import { useViajesEstados } from '@/hooks/useViajesEstados';
import { useOptimizedCartaPorte } from '@/hooks/useOptimizedCartaPorte';
import { toast } from 'sonner';

export const FlowAutomationPanel = () => {
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const { 
    procesarCotizacionesAprobadas, 
    procesarViajesIniciados, 
    isProcessing 
  } = useAutomaticFlows();
  
  const { cotizaciones } = useCotizaciones();
  const { viajesActivos } = useViajesEstados();
  const { cartasPorte } = useOptimizedCartaPorte(1, 100);

  // Métricas de flujo
  const cotizacionesAprobadas = cotizaciones?.filter(c => c.estado === 'aprobada') || [];
  const viajesSinCartaPorte = viajesActivos?.filter(v => v.estado === 'en_transito' && !v.carta_porte_id) || [];
  const viajesCompletadosSinAnalisis = viajesActivos?.filter(v => v.estado === 'completado') || [];

  const procesarTodoAutomaticamente = async () => {
    setIsProcessingAll(true);
    try {
      toast.info('Iniciando procesamiento automático completo...');
      
      // Procesar cotizaciones aprobadas
      if (cotizacionesAprobadas.length > 0) {
        await procesarCotizacionesAprobadas.mutateAsync();
      }
      
      // Procesar viajes sin carta porte
      if (viajesSinCartaPorte.length > 0) {
        await procesarViajesIniciados.mutateAsync();
      }
      
      toast.success('Procesamiento automático completado');
    } catch (error) {
      console.error('Error en procesamiento completo:', error);
      toast.error('Error en el procesamiento automático');
    } finally {
      setIsProcessingAll(false);
    }
  };

  const flowSteps = [
    {
      id: 'cotizaciones',
      title: 'Cotizaciones Aprobadas',
      subtitle: 'Auto-conversión a viajes',
      icon: FileText,
      count: cotizacionesAprobadas.length,
      status: cotizacionesAprobadas.length > 0 ? 'pending' : 'completed',
      description: 'Cotizaciones aprobadas pendientes de conversión automática a viajes'
    },
    {
      id: 'viajes',
      title: 'Viajes en Tránsito',
      subtitle: 'Auto-generación de cartas porte',
      icon: Truck,
      count: viajesSinCartaPorte.length,
      status: viajesSinCartaPorte.length > 0 ? 'pending' : 'completed',
      description: 'Viajes en tránsito sin carta porte generada automáticamente'
    },
    {
      id: 'analisis',
      title: 'Análisis Automático',
      subtitle: 'Métricas y reportes',
      icon: BarChart3,
      count: viajesCompletadosSinAnalisis.length,
      status: viajesCompletadosSinAnalisis.length > 0 ? 'pending' : 'completed',
      description: 'Viajes completados con análisis automático de performance'
    }
  ];

  const totalPendiente = flowSteps.reduce((sum, step) => sum + step.count, 0);
  const completionRate = totalPendiente === 0 ? 100 : 
    ((flowSteps.filter(s => s.status === 'completed').length / flowSteps.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header con estado general */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Automatización de Flujos de Datos
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema automático de conversión: Cotizaciones → Viajes → Cartas Porte → Análisis
              </p>
            </div>
            <Button 
              onClick={procesarTodoAutomaticamente}
              disabled={isProcessingAll || isProcessing || totalPendiente === 0}
              className="gap-2"
            >
              {isProcessingAll || isProcessing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <PlayCircle className="h-4 w-4" />
              )}
              Procesar Todo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span>Automatización Completada</span>
                <span>{Math.round(completionRate)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            <Badge variant={totalPendiente > 0 ? "destructive" : "default"}>
              {totalPendiente} pendientes
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Flujo visual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {flowSteps.map((step, index) => (
          <div key={step.id} className="relative">
            <Card className={`transition-all duration-200 ${
              step.status === 'pending' ? 'border-orange-200 bg-orange-50/50' : 
              'border-green-200 bg-green-50/50'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      step.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                      'bg-green-100 text-green-600'
                    }`}>
                      <step.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{step.title}</h3>
                      <p className="text-xs text-muted-foreground">{step.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={step.status === 'pending' ? 'secondary' : 'default'}>
                      {step.count}
                    </Badge>
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{step.description}</p>
                
                {step.status === 'pending' && step.count > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={() => {
                        if (step.id === 'cotizaciones') {
                          procesarCotizacionesAprobadas.mutate();
                        } else if (step.id === 'viajes') {
                          procesarViajesIniciados.mutate();
                        }
                      }}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <PlayCircle className="h-3 w-3" />
                      )}
                      Procesar {step.count}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Flecha conectora */}
            {index < flowSteps.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                <div className="bg-background border rounded-full p-1">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detalles de procesos */}
      {totalPendiente > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Procesos Pendientes de Automatización</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cotizacionesAprobadas.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Cotizaciones Aprobadas</p>
                    <p className="text-xs text-muted-foreground">
                      {cotizacionesAprobadas.length} cotizaciones listas para conversión automática
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => procesarCotizacionesAprobadas.mutate()}
                  disabled={isProcessing}
                >
                  Convertir a Viajes
                </Button>
              </div>
            )}

            {viajesSinCartaPorte.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Viajes en Tránsito</p>
                    <p className="text-xs text-muted-foreground">
                      {viajesSinCartaPorte.length} viajes necesitan carta porte automática
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => procesarViajesIniciados.mutate()}
                  disabled={isProcessing}
                >
                  Generar Cartas Porte
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Estado de automatización */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Estado del Sistema Automático</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {cotizaciones?.filter(c => c.estado === 'aprobada').length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Cotizaciones Convertidas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {viajesActivos?.filter(v => v.carta_porte_id).length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Cartas Porte Auto-generadas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {viajesActivos?.filter(v => v.estado === 'completado').length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Viajes Analizados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {Math.round(completionRate)}%
              </p>
              <p className="text-xs text-muted-foreground">Automatización</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};