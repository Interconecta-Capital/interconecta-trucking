
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Truck, 
  Route, 
  DollarSign, 
  Settings,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Target
} from 'lucide-react';
import { useRecomendaciones } from '@/hooks/useRecomendaciones';
import { RecomendacionInteligente } from '@/types/recomendaciones';

interface RecomendacionesInteligentesProps {
  contexto?: any;
  limite?: number;
  mostrarSoloTop?: boolean;
  className?: string;
}

export const RecomendacionesInteligentes: React.FC<RecomendacionesInteligentesProps> = ({
  contexto,
  limite = 3,
  mostrarSoloTop = false,
  className = ""
}) => {
  const {
    recomendaciones,
    topRecomendaciones,
    generarRecomendaciones,
    obtenerTopRecomendaciones,
    marcarComoAplicada,
    filtrarPorTipo,
    calcularImpactoTotal,
    loading,
    error
  } = useRecomendaciones();

  const [tipoSeleccionado, setTipoSeleccionado] = useState<'todas' | RecomendacionInteligente['tipo']>('todas');

  useEffect(() => {
    if (contexto) {
      if (mostrarSoloTop) {
        obtenerTopRecomendaciones(contexto, limite);
      } else {
        generarRecomendaciones(contexto);
      }
    }
  }, [contexto, mostrarSoloTop, limite]);

  const getIconoPorTipo = (tipo: RecomendacionInteligente['tipo']) => {
    switch (tipo) {
      case 'vehiculo': return <Truck className="h-4 w-4" />;
      case 'ruta': return <Route className="h-4 w-4" />;
      case 'precio': return <DollarSign className="h-4 w-4" />;
      case 'operacion': return <Settings className="h-4 w-4" />;
    }
  };

  const getColorPorPrioridad = (prioridad: RecomendacionInteligente['prioridad']) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-yellow-500';
      case 'baja': return 'bg-green-500';
    }
  };

  const getColorPorTipo = (tipo: RecomendacionInteligente['tipo']) => {
    switch (tipo) {
      case 'vehiculo': return 'border-blue-200 bg-blue-50';
      case 'ruta': return 'border-green-200 bg-green-50';
      case 'precio': return 'border-purple-200 bg-purple-50';
      case 'operacion': return 'border-orange-200 bg-orange-50';
    }
  };

  const formatearImpacto = (impacto: RecomendacionInteligente['impactoEconomico']) => {
    const partes = [];
    if (impacto.ahorro) partes.push(`Ahorro: $${impacto.ahorro.toLocaleString()}`);
    if (impacto.ingresoAdicional) partes.push(`Ingreso: +$${impacto.ingresoAdicional.toLocaleString()}`);
    if (impacto.costoAdicional) partes.push(`Costo: -$${impacto.costoAdicional.toLocaleString()}`);
    return partes.join(' | ') || 'Sin impacto cuantificado';
  };

  const recsParaMostrar = mostrarSoloTop 
    ? topRecomendaciones 
    : (tipoSeleccionado === 'todas' ? recomendaciones : filtrarPorTipo(tipoSeleccionado));

  const impactoTotal = calcularImpactoTotal();

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2">Generando recomendaciones...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con resumen de impacto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            Recomendaciones Inteligentes
            {!mostrarSoloTop && (
              <Badge variant="outline" className="ml-2">
                {recsParaMostrar.length} recomendaciones
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        {!mostrarSoloTop && recsParaMostrar.length > 0 && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${impactoTotal.ahorro.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Ahorro Potencial</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ${impactoTotal.ingreso.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Ingreso Adicional</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ${(impactoTotal.ahorro + impactoTotal.ingreso - impactoTotal.costo).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Beneficio Neto</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {recsParaMostrar.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay recomendaciones disponibles</p>
            <p className="text-sm text-gray-400 mt-2">
              Proporciona más datos de viajes para obtener recomendaciones personalizadas
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filtros por tipo (solo si no es top) */}
          {!mostrarSoloTop && (
            <Tabs value={tipoSeleccionado} onValueChange={(value) => setTipoSeleccionado(value as any)}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="todas">Todas</TabsTrigger>
                <TabsTrigger value="vehiculo">Vehículo</TabsTrigger>
                <TabsTrigger value="ruta">Ruta</TabsTrigger>
                <TabsTrigger value="precio">Precio</TabsTrigger>
                <TabsTrigger value="operacion">Operación</TabsTrigger>
              </TabsList>
              
              <TabsContent value={tipoSeleccionado} className="mt-6">
                <div className="space-y-4">
                  {recsParaMostrar.map((recomendacion) => (
                    <RecomendacionCard 
                      key={recomendacion.id} 
                      recomendacion={recomendacion}
                      onMarcarAplicada={marcarComoAplicada}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Lista simple para top recomendaciones */}
          {mostrarSoloTop && (
            <div className="space-y-4">
              {recsParaMostrar.map((recomendacion) => (
                <RecomendacionCard 
                  key={recomendacion.id} 
                  recomendacion={recomendacion}
                  onMarcarAplicada={marcarComoAplicada}
                  compacta={true}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Componente para renderizar cada recomendación
interface RecomendacionCardProps {
  recomendacion: RecomendacionInteligente;
  onMarcarAplicada: (id: string) => void;
  compacta?: boolean;
}

const RecomendacionCard: React.FC<RecomendacionCardProps> = ({ 
  recomendacion, 
  onMarcarAplicada,
  compacta = false 
}) => {
  const getIconoPorTipo = (tipo: RecomendacionInteligente['tipo']) => {
    switch (tipo) {
      case 'vehiculo': return <Truck className="h-4 w-4" />;
      case 'ruta': return <Route className="h-4 w-4" />;
      case 'precio': return <DollarSign className="h-4 w-4" />;
      case 'operacion': return <Settings className="h-4 w-4" />;
    }
  };

  const getColorPorPrioridad = (prioridad: RecomendacionInteligente['prioridad']) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-yellow-500';
      case 'baja': return 'bg-green-500';
    }
  };

  const getColorPorTipo = (tipo: RecomendacionInteligente['tipo']) => {
    switch (tipo) {
      case 'vehiculo': return 'border-blue-200 bg-blue-50';
      case 'ruta': return 'border-green-200 bg-green-50';
      case 'precio': return 'border-purple-200 bg-purple-50';
      case 'operacion': return 'border-orange-200 bg-orange-50';
    }
  };

  const formatearImpacto = (impacto: RecomendacionInteligente['impactoEconomico']) => {
    const partes = [];
    if (impacto.ahorro) partes.push(`Ahorro: $${impacto.ahorro.toLocaleString()}`);
    if (impacto.ingresoAdicional) partes.push(`Ingreso: +$${impacto.ingresoAdicional.toLocaleString()}`);
    if (impacto.costoAdicional) partes.push(`Costo: -$${impacto.costoAdicional.toLocaleString()}`);
    return partes.join(' | ') || 'Sin impacto cuantificado';
  };

  return (
    <Card className={`${getColorPorTipo(recomendacion.tipo)} border-l-4 ${recomendacion.aplicada ? 'opacity-60' : ''}`}>
      <CardContent className={compacta ? "p-4" : "p-6"}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getIconoPorTipo(recomendacion.tipo)}
              <h3 className="font-semibold text-gray-900">{recomendacion.titulo}</h3>
              <Badge className={`${getColorPorPrioridad(recomendacion.prioridad)} text-white`}>
                {recomendacion.prioridad}
              </Badge>
              {recomendacion.aplicada && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Aplicada
                </Badge>
              )}
            </div>
            
            <p className="text-gray-700 mb-3">{recomendacion.descripcion}</p>
            
            {!compacta && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Impacto Económico:</p>
                    <p className="text-sm font-medium text-green-600">
                      {formatearImpacto(recomendacion.impactoEconomico)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Facilidad:</p>
                    <Badge variant="outline" className="capitalize">
                      {recomendacion.facilidadImplementacion}
                    </Badge>
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Acción Recomendada:</p>
                    <p className="text-sm font-medium">{recomendacion.accion}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Métrica:</p>
                    <p className="text-sm font-medium">{recomendacion.metrica}</p>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {!recomendacion.aplicada && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMarcarAplicada(recomendacion.id)}
              className="ml-4 shrink-0"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Aplicar
            </Button>
          )}
        </div>
        
        {compacta && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-green-600 font-medium">
              {formatearImpacto(recomendacion.impactoEconomico)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
