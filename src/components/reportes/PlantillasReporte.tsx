
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  BarChart3, 
  FileText, 
  Settings,
  Clock,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface PlantillasReporteProps {
  onSeleccionar: () => void;
}

export function PlantillasReporte({ onSeleccionar }: PlantillasReporteProps) {
  const plantillas = [
    {
      id: 'diario',
      nombre: 'Reporte Diario Operativo',
      descripcion: 'Monitoreo diario de operaciones, viajes y alertas',
      icono: Calendar,
      color: 'bg-blue-50 border-blue-200',
      secciones: [
        'Viajes del día',
        'Alertas activas',
        'Performance en tiempo real',
        'Incidencias reportadas'
      ],
      recomendado: 'Operadores y Supervisores'
    },
    {
      id: 'semanal',
      nombre: 'Reporte Semanal Gerencial',
      descripcion: 'Análisis semanal de KPIs y tendencias',
      icono: BarChart3,
      color: 'bg-green-50 border-green-200',
      secciones: [
        'KPIs de la semana',
        'Análisis de tendencias',
        'Cumplimiento de objetivos',
        'Planes de acción recomendados'
      ],
      recomendado: 'Gerentes y Coordinadores'
    },
    {
      id: 'mensual',
      nombre: 'Reporte Mensual Ejecutivo',
      descripcion: 'Análisis financiero y estratégico completo',
      icono: TrendingUp,
      color: 'bg-purple-50 border-purple-200',
      secciones: [
        'P&L completo',
        'Análisis de rentabilidad por unidad',
        'Benchmarking vs mercado',
        'Estrategias de crecimiento'
      ],
      recomendado: 'Directivos y C-Level'
    },
    {
      id: 'personalizado',
      nombre: 'Reporte Personalizado',
      descripcion: 'Configura tu propio reporte con secciones específicas',
      icono: Settings,
      color: 'bg-gray-50 border-gray-200',
      secciones: [
        'Secciones personalizables',
        'Filtros específicos',
        'Métricas a medida',
        'Formato adaptable'
      ],
      recomendado: 'Usuarios Avanzados'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Plantillas Predefinidas</h3>
        <p className="text-gray-600">
          Selecciona una plantilla base para comenzar rápidamente con tu reporte automático
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plantillas.map((plantilla) => {
          const Icono = plantilla.icono;
          return (
            <Card key={plantilla.id} className={`hover:shadow-md transition-shadow ${plantilla.color}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Icono className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{plantilla.nombre}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{plantilla.descripcion}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Secciones incluidas:</h4>
                  <div className="space-y-1">
                    {plantilla.secciones.map((seccion, index) => (
                      <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        {seccion}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Badge variant="secondary" className="text-xs">
                    {plantilla.recomendado}
                  </Badge>
                  <Button size="sm" onClick={onSeleccionar}>
                    Usar Plantilla
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Información adicional */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Formatos Disponibles</h4>
              <p className="text-sm text-blue-700 mt-1">
                Todos los reportes pueden generarse en PDF profesional, Excel con datos detallados 
                o HTML responsivo para email.
              </p>
              <div className="flex gap-2 mt-2">
                <Badge className="bg-blue-100 text-blue-800">PDF</Badge>
                <Badge className="bg-blue-100 text-blue-800">Excel</Badge>
                <Badge className="bg-blue-100 text-blue-800">HTML</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
