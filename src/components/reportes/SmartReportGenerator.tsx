
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSmartReportGenerator } from '@/hooks/useSmartReportGenerator';
import { Calendar, FileText, Download, Clock, Settings } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export function SmartReportGenerator() {
  const { generarReporteInteligente, programarReporteAutomatico, isGenerating } = useSmartReportGenerator();
  
  const [reportConfig, setReportConfig] = useState({
    periodo: {
      inicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      fin: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    },
    tipo: 'mensual' as 'semanal' | 'mensual' | 'trimestral' | 'anual',
    incluirSecciones: {
      resumenEjecutivo: true,
      metricasFinancieras: true,
      analisisOperacional: true,
      performanceFlota: true,
      recomendaciones: true
    }
  });

  const [automaticConfig, setAutomaticConfig] = useState({
    nombre: '',
    tipo: 'mensual' as 'semanal' | 'mensual' | 'trimestral',
    horario: {
      hora: 9,
      minuto: 0,
      diaDelMes: 1
    },
    destinatarios: [''],
    activo: true
  });

  const handleGenerarReporte = () => {
    generarReporteInteligente.mutate(reportConfig);
  };

  const handleProgramarReporte = () => {
    programarReporteAutomatico.mutate({
      ...automaticConfig,
      secciones: Object.entries(reportConfig.incluirSecciones)
        .filter(([_, incluido]) => incluido)
        .map(([seccion]) => seccion)
    });
  };

  const aplicarPeriodoPredefinido = (tipo: string) => {
    const ahora = new Date();
    let inicio: Date, fin: Date;

    switch (tipo) {
      case 'semana_actual':
        inicio = new Date(ahora);
        inicio.setDate(ahora.getDate() - ahora.getDay());
        fin = new Date(inicio);
        fin.setDate(inicio.getDate() + 6);
        break;
      case 'mes_actual':
        inicio = startOfMonth(ahora);
        fin = endOfMonth(ahora);
        break;
      case 'mes_anterior':
        inicio = startOfMonth(subMonths(ahora, 1));
        fin = endOfMonth(subMonths(ahora, 1));
        break;
      case 'trimestre_actual':
        const mesActual = ahora.getMonth();
        const inicioTrimestre = Math.floor(mesActual / 3) * 3;
        inicio = new Date(ahora.getFullYear(), inicioTrimestre, 1);
        fin = new Date(ahora.getFullYear(), inicioTrimestre + 3, 0);
        break;
      default:
        return;
    }

    setReportConfig(prev => ({
      ...prev,
      periodo: {
        inicio: format(inicio, 'yyyy-MM-dd'),
        fin: format(fin, 'yyyy-MM-dd')
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Generador de Reportes Inteligente</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generación manual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Generar Reporte Ahora
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Período */}
            <div className="space-y-2">
              <Label>Período del Reporte</Label>
              <div className="flex gap-2">
                <Select onValueChange={aplicarPeriodoPredefinido}>
                  <SelectTrigger>
                    <SelectValue placeholder="Período predefinido" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semana_actual">Semana Actual</SelectItem>
                    <SelectItem value="mes_actual">Mes Actual</SelectItem>
                    <SelectItem value="mes_anterior">Mes Anterior</SelectItem>
                    <SelectItem value="trimestre_actual">Trimestre Actual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="fecha-inicio">Desde</Label>
                  <Input
                    id="fecha-inicio"
                    type="date"
                    value={reportConfig.periodo.inicio}
                    onChange={(e) => setReportConfig(prev => ({
                      ...prev,
                      periodo: { ...prev.periodo, inicio: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="fecha-fin">Hasta</Label>
                  <Input
                    id="fecha-fin"
                    type="date"
                    value={reportConfig.periodo.fin}
                    onChange={(e) => setReportConfig(prev => ({
                      ...prev,
                      periodo: { ...prev.periodo, fin: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Tipo de reporte */}
            <div className="space-y-2">
              <Label>Tipo de Reporte</Label>
              <Select 
                value={reportConfig.tipo}
                onValueChange={(value: any) => setReportConfig(prev => ({ ...prev, tipo: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Secciones a incluir */}
            <div className="space-y-3">
              <Label>Secciones a Incluir</Label>
              <div className="space-y-2">
                {Object.entries(reportConfig.incluirSecciones).map(([seccion, incluido]) => (
                  <div key={seccion} className="flex items-center justify-between">
                    <Label className="text-sm capitalize">
                      {seccion.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </Label>
                    <Switch
                      checked={incluido}
                      onCheckedChange={(checked) => 
                        setReportConfig(prev => ({
                          ...prev,
                          incluirSecciones: {
                            ...prev.incluirSecciones,
                            [seccion]: checked
                          }
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleGenerarReporte} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generar Reporte PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Programación automática */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Programar Reporte Automático
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre-automatico">Nombre del Reporte</Label>
              <Input
                id="nombre-automatico"
                placeholder="Ej: Reporte Mensual de Rentabilidad"
                value={automaticConfig.nombre}
                onChange={(e) => setAutomaticConfig(prev => ({ ...prev, nombre: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Frecuencia</Label>
              <Select 
                value={automaticConfig.tipo}
                onValueChange={(value: any) => setAutomaticConfig(prev => ({ ...prev, tipo: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Hora</Label>
                <Select 
                  value={automaticConfig.horario.hora.toString()}
                  onValueChange={(value) => setAutomaticConfig(prev => ({
                    ...prev,
                    horario: { ...prev.horario, hora: parseInt(value) }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i.toString().padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {automaticConfig.tipo === 'mensual' && (
                <div className="space-y-2">
                  <Label>Día del Mes</Label>
                  <Select 
                    value={automaticConfig.horario.diaDelMes?.toString()}
                    onValueChange={(value) => setAutomaticConfig(prev => ({
                      ...prev,
                      horario: { ...prev.horario, diaDelMes: parseInt(value) }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          Día {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Destinatarios (Email)</Label>
              {automaticConfig.destinatarios.map((email, index) => (
                <Input
                  key={index}
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => {
                    const newDestinatarios = [...automaticConfig.destinatarios];
                    newDestinatarios[index] = e.target.value;
                    setAutomaticConfig(prev => ({ ...prev, destinatarios: newDestinatarios }));
                  }}
                />
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutomaticConfig(prev => ({
                  ...prev,
                  destinatarios: [...prev.destinatarios, '']
                }))}
              >
                Agregar Email
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <Label>Activar Reporte Automático</Label>
              <Switch
                checked={automaticConfig.activo}
                onCheckedChange={(checked) => setAutomaticConfig(prev => ({ ...prev, activo: checked }))}
              />
            </div>

            <Button 
              onClick={handleProgramarReporte} 
              className="w-full"
              disabled={!automaticConfig.nombre.trim()}
            >
              <Settings className="h-4 w-4 mr-2" />
              Programar Reporte
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
