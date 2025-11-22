import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface AnalisisFinancieroCardProps {
  precioFacturado: number;
  costoCalculado: number;
  precioSugeridoIA?: number;
}

export function AnalisisFinancieroCard({ 
  precioFacturado, 
  costoCalculado, 
  precioSugeridoIA 
}: AnalisisFinancieroCardProps) {
  const margenBruto = precioFacturado - costoCalculado;
  const margenPorcentaje = ((margenBruto / precioFacturado) * 100).toFixed(1);
  const rentabilidad = Number(margenPorcentaje);

  // Determinar rentabilidad (verde > 15%, amarillo 10-15%, rojo < 10%)
  const getRentabilidadColor = () => {
    if (rentabilidad >= 15) return 'text-green-600 bg-green-50 border-green-200';
    if (rentabilidad >= 10) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getRentabilidadIcon = () => {
    if (rentabilidad >= 15) return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (rentabilidad >= 10) return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <TrendingDown className="h-5 w-5 text-red-600" />;
  };

  // Comparación con precio sugerido por IA
  const diferenciaSugerido = precioSugeridoIA 
    ? precioFacturado - precioSugeridoIA 
    : null;
  
  const diferenciaRelativa = precioSugeridoIA 
    ? ((diferenciaSugerido! / precioSugeridoIA) * 100).toFixed(1)
    : null;

  const getRecomendacion = () => {
    if (rentabilidad < 10) {
      return '⚠️ Margen bajo. Considera ajustar el precio para asegurar rentabilidad.';
    }
    if (rentabilidad >= 15 && rentabilidad < 20) {
      return '✅ Margen saludable y competitivo en el mercado.';
    }
    if (rentabilidad >= 20) {
      return '💰 Excelente margen. Precio óptimo para rentabilidad.';
    }
    return '⚡ Margen aceptable, monitorear costos operativos.';
  };

  return (
    <Card className={`border-2 ${getRentabilidadColor()}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Análisis Financiero
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Precio Facturado */}
          <div className="bg-white/60 p-4 rounded-lg border">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Precio Facturado
            </label>
            <p className="text-2xl font-bold text-foreground mt-1">
              ${precioFacturado.toLocaleString('es-MX')}
            </p>
          </div>

          {/* Costo Calculado */}
          <div className="bg-white/60 p-4 rounded-lg border">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Costo Calculado
            </label>
            <p className="text-2xl font-bold text-foreground mt-1">
              ${costoCalculado.toLocaleString('es-MX')}
            </p>
          </div>

          {/* Margen */}
          <div className="bg-white/60 p-4 rounded-lg border">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Margen Bruto
            </label>
            <p className="text-2xl font-bold text-foreground mt-1 flex items-center gap-2">
              {getRentabilidadIcon()}
              {margenPorcentaje}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              ${margenBruto.toLocaleString('es-MX')}
            </p>
          </div>
        </div>

        {/* Comparación con IA (si está disponible) */}
        {precioSugeridoIA && diferenciaSugerido !== null && (
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-medium text-purple-700 uppercase tracking-wide">
                  Precio Sugerido IA
                </label>
                <p className="text-xl font-bold text-purple-900">
                  ${precioSugeridoIA.toLocaleString('es-MX')}
                </p>
              </div>
              <div className="text-right">
                <label className="text-xs font-medium text-purple-700 uppercase tracking-wide">
                  Diferencia
                </label>
                <Badge 
                  variant={Math.abs(Number(diferenciaRelativa)) <= 5 ? 'default' : 'secondary'}
                  className="mt-1"
                >
                  {diferenciaSugerido > 0 ? '+' : ''}{diferenciaRelativa}%
                </Badge>
                <p className="text-sm text-purple-700 mt-1">
                  {Math.abs(Number(diferenciaRelativa!)) <= 5 
                    ? '✨ Similar al óptimo' 
                    : diferenciaSugerido > 0 
                      ? '📈 Por encima del óptimo'
                      : '📉 Por debajo del óptimo'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recomendación */}
        <div className="bg-white/60 p-4 rounded-lg border">
          <p className="text-sm font-medium text-foreground">
            {getRecomendacion()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
