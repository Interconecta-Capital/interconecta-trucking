
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Mail, 
  FileText, 
  Calendar,
  Clock,
  Filter,
  Eye
} from 'lucide-react';
import { ConfiguracionReporte, SeccionReporte, useReportesAutomaticos } from '@/hooks/useReportesAutomaticos';

interface ConfiguradorReporteProps {
  reporte?: ConfiguracionReporte | null;
  onGuardar: (configuracion: ConfiguracionReporte) => void;
  onCancelar: () => void;
}

export function ConfiguradorReporte({ reporte, onGuardar, onCancelar }: ConfiguradorReporteProps) {
  const { obtenerPlantilla, validarConfiguracion } = useReportesAutomaticos();
  const [configuracion, setConfiguracion] = useState<ConfiguracionReporte>({
    nombre: '',
    tipo: 'diario',
    destinatarios: [],
    formato: 'pdf',
    secciones: [],
    horario: {
      frecuencia: '0 8 * * *', // 8 AM todos los días
      zona_horaria: 'America/Mexico_City'
    },
    filtros: {},
    activo: true
  });

  const [nuevoDestinatario, setNuevoDestinatario] = useState('');
  const [errores, setErrores] = useState<string[]>([]);

  useEffect(() => {
    if (reporte) {
      setConfiguracion(reporte);
    } else {
      // Si es nuevo, cargar plantilla predeterminada
      const secciones = obtenerPlantilla('diario');
      setConfiguracion(prev => ({ ...prev, secciones }));
    }
  }, [reporte, obtenerPlantilla]);

  const handleTipoChange = (tipo: string) => {
    const secciones = obtenerPlantilla(tipo);
    setConfiguracion(prev => ({
      ...prev,
      tipo: tipo as any,
      secciones,
      horario: {
        ...prev.horario,
        frecuencia: tipo === 'diario' ? '0 8 * * *' : 
                   tipo === 'semanal' ? '0 8 * * 1' : 
                   '0 8 1 * *'
      }
    }));
  };

  const agregarDestinatario = () => {
    if (nuevoDestinatario && !configuracion.destinatarios.includes(nuevoDestinatario)) {
      setConfiguracion(prev => ({
        ...prev,
        destinatarios: [...prev.destinatarios, nuevoDestinatario]
      }));
      setNuevoDestinatario('');
    }
  };

  const removerDestinatario = (email: string) => {
    setConfiguracion(prev => ({
      ...prev,
      destinatarios: prev.destinatarios.filter(d => d !== email)
    }));
  };

  const toggleSeccion = (seccionId: string) => {
    setConfiguracion(prev => ({
      ...prev,
      secciones: prev.secciones.map(s => 
        s.id === seccionId ? { ...s, activa: !s.activa } : s
      )
    }));
  };

  const handleGuardar = () => {
    const erroresValidacion = validarConfiguracion(configuracion);
    if (erroresValidacion.length > 0) {
      setErrores(erroresValidacion);
      return;
    }

    setErrores([]);
    onGuardar(configuracion);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onCancelar}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {reporte ? 'Editar Reporte' : 'Configurar Nuevo Reporte'}
            </h1>
            <p className="text-muted-foreground">
              Define la configuración y contenido de tu reporte automático
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar}>
            {reporte ? 'Actualizar' : 'Crear'} Reporte
          </Button>
        </div>
      </div>

      {/* Errores */}
      {errores.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
              <FileText className="h-4 w-4" />
              Errores de configuración:
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {errores.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="basico" className="w-full">
        <TabsList>
          <TabsTrigger value="basico">Información Básica</TabsTrigger>
          <TabsTrigger value="contenido">Contenido</TabsTrigger>
          <TabsTrigger value="programacion">Programación</TabsTrigger>
          <TabsTrigger value="destinatarios">Destinatarios</TabsTrigger>
        </TabsList>

        <TabsContent value="basico" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Configuración Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Reporte</Label>
                  <Input
                    id="nombre"
                    value={configuracion.nombre}
                    onChange={(e) => setConfiguracion(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej: Reporte Diario de Operaciones"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Reporte</Label>
                  <Select value={configuracion.tipo} onValueChange={handleTipoChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diario">Reporte Diario Operativo</SelectItem>
                      <SelectItem value="semanal">Reporte Semanal Gerencial</SelectItem>
                      <SelectItem value="mensual">Reporte Mensual Ejecutivo</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formato">Formato de Salida</Label>
                  <Select 
                    value={configuracion.formato} 
                    onValueChange={(value) => setConfiguracion(prev => ({ ...prev, formato: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Profesional</SelectItem>
                      <SelectItem value="excel">Excel con Datos</SelectItem>
                      <SelectItem value="email_html">Email HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="activo"
                      checked={configuracion.activo}
                      onCheckedChange={(checked) => 
                        setConfiguracion(prev => ({ ...prev, activo: !!checked }))
                      }
                    />
                    <Label htmlFor="activo">Reporte activo</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contenido" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Secciones del Reporte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {configuracion.secciones.map((seccion) => (
                  <div key={seccion.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={seccion.activa}
                        onCheckedChange={() => toggleSeccion(seccion.id)}
                      />
                      <div>
                        <h4 className="font-medium">{seccion.nombre}</h4>
                        <p className="text-sm text-gray-600">
                          Tipo: {seccion.tipo}
                        </p>
                      </div>
                    </div>
                    <Badge variant={seccion.activa ? "default" : "secondary"}>
                      {seccion.activa ? 'Incluida' : 'Opcional'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programacion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Programación de Ejecución
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frecuencia">Frecuencia (Cron)</Label>
                  <Input
                    id="frecuencia"
                    value={configuracion.horario.frecuencia}
                    onChange={(e) => setConfiguracion(prev => ({
                      ...prev,
                      horario: { ...prev.horario, frecuencia: e.target.value }
                    }))}
                    placeholder="0 8 * * *"
                  />
                  <p className="text-xs text-gray-600">
                    Ejemplos: "0 8 * * *" (8 AM diario), "0 8 * * 1" (8 AM lunes)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zona">Zona Horaria</Label>
                  <Select
                    value={configuracion.horario.zona_horaria}
                    onValueChange={(value) => setConfiguracion(prev => ({
                      ...prev,
                      horario: { ...prev.horario, zona_horaria: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Mexico_City">México (CDMX)</SelectItem>
                      <SelectItem value="America/Tijuana">Tijuana</SelectItem>
                      <SelectItem value="America/Cancun">Cancún</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="destinatarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Destinatarios del Reporte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={nuevoDestinatario}
                  onChange={(e) => setNuevoDestinatario(e.target.value)}
                  placeholder="email@ejemplo.com"
                  onKeyPress={(e) => e.key === 'Enter' && agregarDestinatario()}
                />
                <Button onClick={agregarDestinatario}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {configuracion.destinatarios.map((email) => (
                  <div key={email} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span>{email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removerDestinatario(email)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
