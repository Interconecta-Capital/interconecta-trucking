import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Award, TrendingUp, AlertCircle } from 'lucide-react';
import { useCartaPorteMetrics } from '@/hooks/carta-porte/useCartaPorteMetrics';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function CartaPorteMetrics() {
  const { metrics, isLoading, error } = useCartaPorteMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="border-gray-20 shadow-xs">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-4 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Error al cargar las métricas. Intenta nuevamente.
        </AlertDescription>
      </Alert>
    );
  }

  const eficiencia = metrics?.cartasCreadas 
    ? Math.round((metrics.timbresConsumidos / metrics.cartasCreadas) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Cartas Porte Creadas */}
      <Card className="border-gray-20 shadow-xs bg-gradient-to-br from-blue-50 to-pure-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-70">
              Cartas Porte Creadas
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-gray-90">
              {metrics?.cartasCreadas || 0}
            </p>
            <p className="text-xs text-gray-60">
              Total de documentos generados
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Timbres Consumidos */}
      <Card className="border-gray-20 shadow-xs bg-gradient-to-br from-red-50 to-pure-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-70">
              Timbres Consumidos
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <Award className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-red-600">
              {metrics?.timbresConsumidos || 0}
            </p>
            <p className="text-xs text-gray-60">
              Solo al timbrar fiscalmente
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Eficiencia */}
      <Card className="border-gray-20 shadow-xs bg-gradient-to-br from-green-50 to-pure-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-70">
              Tasa de Timbrado
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-green-600">
              {eficiencia}%
            </p>
            <p className="text-xs text-gray-60">
              Documentos timbrados vs creados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
