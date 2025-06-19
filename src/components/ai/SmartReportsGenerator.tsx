
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Brain,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportConfig {
  type: 'executive' | 'operational' | 'compliance' | 'financial' | 'predictive';
  timeframe: 'week' | 'month' | 'quarter' | 'year';
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeRecommendations: boolean;
  includeAIInsights: boolean;
  customFilters?: {
    clients?: string[];
    routes?: string[];
    drivers?: string[];
    vehicles?: string[];
  };
}

export function SmartReportsGenerator() {
  const [config, setConfig] = useState<ReportConfig>({
    type: 'executive',
    timeframe: 'month',
    format: 'pdf',
    includeCharts: true,
    includeRecommendations: true,
    includeAIInsights: true
  });
  
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [availableReports, setAvailableReports] = useState<Array<{
    id: string;
    name: string;
    type: string;
    generated: Date;
    size: string;
    insights: number;
  }>>([]);

  const { toast } = useToast();

  const reportTypes = [
    { 
      value: 'executive', 
      label: 'Ejecutivo', 
      description: 'Resumen ejecutivo con KPIs principales y insights estratégicos',
      icon: <TrendingUp className="h-4 w-4" />
    },
    { 
      value: 'operational', 
      label: 'Operacional', 
      description: 'Análisis detallado de operaciones diarias y eficiencia',
      icon: <BarChart3 className="h-4 w-4" />
    },
    { 
      value: 'compliance', 
      label: 'Cumplimiento', 
      description: 'Estado de cumplimiento normativo y SAT',
      icon: <CheckCircle className="h-4 w-4" />
    },
    { 
      value: 'financial', 
      label: 'Financiero', 
      description: 'Análisis financiero, costos e ingresos',
      icon: <PieChart className="h-4 w-4" />
    },
    { 
      value: 'predictive', 
      label: 'Predictivo', 
      description: 'Proyecciones y análisis predictivo con IA',
      icon: <Brain className="h-4 w-4" />
    }
  ];

  const handleConfigChange = (key: keyof ReportConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const generateReport = async () => {
    setGenerating(true);
    
    try {
      console.log('🤖 Generando reporte inteligente:', config);
      
      // Simular generación del reporte
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newReport = {
        id: `report-${Date.now()}`,
        name: `Reporte ${reportTypes.find(t => t.value === config.type)?.label} - ${new Date().toLocaleDateString()}`,
        type: config.type,
        generated: new Date(),
        size: `${Math.floor(Math.random() * 5 + 1)}.${Math.floor(Math.random() * 10)}MB`,
        insights: Math.floor(Math.random() * 15 + 5)
      };
      
      setAvailableReports(prev => [newReport, ...prev]);
      setLastGenerated(new Date());
      
      toast({
        title: "Reporte generado exitosamente",
        description: `Reporte ${config.type} generado con ${newReport.insights} insights de IA`,
      });
      
    } catch (error) {
      console.error('Error generando reporte:', error);
      toast({
        title: "Error generando reporte",
        description: "No se pudo generar el reporte. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = (reportId: string) => {
    toast({
      title: "Descargando reporte",
      description: "El reporte se descargará en breve",
    });
  };

  const getReportTypeInfo = (type: string) => {
    return reportTypes.find(t => t.value === type);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generador de Reportes Inteligentes
          </h3>
          <p className="text-sm text-muted-foreground">
            Genera reportes automatizados con análisis de IA y insights personalizados
          </p>
        </div>
      </div>

      <Tabs defaultValue="generator" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generator">Generar Reporte</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuración del Reporte */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Reporte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Reporte</Label>
                  <Select value={config.type} onValueChange={(value: any) => handleConfigChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            {type.icon}
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getReportTypeInfo(config.type) && (
                    <p className="text-xs text-muted-foreground">
                      {getReportTypeInfo(config.type)?.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Período</Label>
                    <Select value={config.timeframe} onValueChange={(value: any) => handleConfigChange('timeframe', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Esta Semana</SelectItem>
                        <SelectItem value="month">Este Mes</SelectItem>
                        <SelectItem value="quarter">Este Trimestre</SelectItem>
                        <SelectItem value="year">Este Año</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Formato</Label>
                    <Select value={config.format} onValueChange={(value: any) => handleConfigChange('format', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Opciones Avanzadas</Label>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeCharts"
                      checked={config.includeCharts}
                      onChange={(e) => handleConfigChange('includeCharts', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="includeCharts" className="text-sm">Incluir gráficos y visualizaciones</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeRecommendations"
                      checked={config.includeRecommendations}
                      onChange={(e) => handleConfigChange('includeRecommendations', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="includeRecommendations" className="text-sm">Incluir recomendaciones</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeAIInsights"
                      checked={config.includeAIInsights}
                      onChange={(e) => handleConfigChange('includeAIInsights', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="includeAIInsights" className="text-sm">Incluir insights de IA</Label>
                  </div>
                </div>

                <Button 
                  onClick={generateReport} 
                  disabled={generating}
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generando Reporte...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generar Reporte con IA
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Preview del Reporte */}
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                    {getReportTypeInfo(config.type)?.icon}
                    <h4 className="font-medium mt-2">
                      Reporte {getReportTypeInfo(config.type)?.label}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Período: {config.timeframe} | Formato: {config.format.toUpperCase()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Contenido Incluido:</h5>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary">Métricas principales</Badge>
                      {config.includeCharts && <Badge variant="secondary">Gráficos</Badge>}
                      {config.includeRecommendations && <Badge variant="secondary">Recomendaciones</Badge>}
                      {config.includeAIInsights && <Badge variant="secondary">Insights IA</Badge>}
                    </div>
                  </div>

                  {lastGenerated && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Último reporte generado: {lastGenerated.toLocaleString()}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Generados</CardTitle>
            </CardHeader>
            <CardContent>
              {availableReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>No hay reportes generados aún</p>
                  <p className="text-sm">Genera tu primer reporte en la pestaña anterior</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getReportTypeInfo(report.type)?.icon}
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>📅 {report.generated.toLocaleDateString()}</span>
                            <span>📊 {report.size}</span>
                            <span>🧠 {report.insights} insights</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getReportTypeInfo(report.type)?.label}
                        </Badge>
                        <Button size="sm" onClick={() => downloadReport(report.id)}>
                          <Download className="h-4 w-4 mr-1" />
                          Descargar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
