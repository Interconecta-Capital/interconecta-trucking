import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Activity, Calendar, FileText, DollarSign } from 'lucide-react';

interface SocioMetricasProps {
  socio: any;
}

export function SocioMetricas({ socio }: SocioMetricasProps) {
  // Simulamos métricas de rendimiento del socio
  const metricas = {
    cartasPorteGeneradas: Math.floor(Math.random() * 150) + 50,
    promedioDocumentosMes: Math.floor(Math.random() * 25) + 10,
    eficienciaDocumental: Math.floor(Math.random() * 30) + 70,
    cumplimientoFiscal: Math.floor(Math.random() * 20) + 80,
    transaccionesMes: Math.floor(Math.random() * 50) + 20,
    valorPromedio: Math.floor(Math.random() * 50000) + 25000,
    tendencia: Math.random() > 0.5 ? 'up' : 'down',
    cambioMensual: Math.floor(Math.random() * 20) + 5
  };

  const getTrendIcon = () => {
    return metricas.tendencia === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getTrendColor = () => {
    return metricas.tendencia === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cartas Porte</p>
                <p className="text-2xl font-bold">{metricas.cartasPorteGeneradas}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon()}
              <span className={`ml-1 text-sm ${getTrendColor()}`}>
                {metricas.cambioMensual}% vs mes anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Docs/Mes</p>
                <p className="text-2xl font-bold">{metricas.promedioDocumentosMes}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
            <div className="flex items-center mt-2">
              <Activity className="h-4 w-4 text-gray-600" />
              <span className="ml-1 text-sm text-muted-foreground">
                Promedio mensual
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transacciones</p>
                <p className="text-2xl font-bold">{metricas.transaccionesMes}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-muted-foreground">
                Este mes
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Promedio</p>
                <p className="text-2xl font-bold">${metricas.valorPromedio.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-muted-foreground">
                Por transacción
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores de rendimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Eficiencia Documental</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Documentos completos</span>
                  <span>{metricas.eficienciaDocumental}%</span>
                </div>
                <Progress value={metricas.eficienciaDocumental} className="h-2" />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={metricas.eficienciaDocumental >= 80 ? "default" : "secondary"}>
                  {metricas.eficienciaDocumental >= 80 ? "Excelente" : "Regular"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Calidad documental
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cumplimiento Fiscal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Normas cumplidas</span>
                  <span>{metricas.cumplimientoFiscal}%</span>
                </div>
                <Progress value={metricas.cumplimientoFiscal} className="h-2" />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={metricas.cumplimientoFiscal >= 90 ? "default" : "secondary"}>
                  {metricas.cumplimientoFiscal >= 90 ? "Excelente" : "Bueno"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Cumplimiento SAT
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información del Socio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo de Persona</p>
              <Badge variant="outline" className="mt-1">
                {socio.tipo_persona === 'fisica' ? 'Física' : 'Moral'}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estado</p>
              <Badge 
                variant={socio.estado === 'activo' ? 'default' : 'secondary'}
                className="mt-1"
              >
                {socio.estado}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de Registro</p>
              <p className="text-sm mt-1">
                {socio.created_at ? new Date(socio.created_at).toLocaleDateString() : 'No disponible'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}