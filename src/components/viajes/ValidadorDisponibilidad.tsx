import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useDisponibilidad } from '@/hooks/useDisponibilidad';
import { ValidacionDisponibilidad, ConflictoDisponibilidad } from '@/types/viaje';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ValidadorDisponibilidadProps {
  conductorId?: string;
  vehiculoId?: string;
  remolqueId?: string;
  fechaInicio: string;
  fechaFin: string;
  onValidacionCompleta?: (disponible: boolean, conflictos: ConflictoDisponibilidad[]) => void;
}

export const ValidadorDisponibilidad = ({
  conductorId,
  vehiculoId,
  remolqueId,
  fechaInicio,
  fechaFin,
  onValidacionCompleta
}: ValidadorDisponibilidadProps) => {
  const { verificarMultipleDisponibilidad, loading } = useDisponibilidad();
  const [validaciones, setValidaciones] = useState<Array<{
    tipo: 'conductor' | 'vehiculo' | 'remolque';
    id: string;
    validacion: ValidacionDisponibilidad | null;
  }>>([]);

  const validarRecursos = async () => {
    const recursos = [];
    if (conductorId) recursos.push({ tipo: 'conductor' as const, id: conductorId });
    if (vehiculoId) recursos.push({ tipo: 'vehiculo' as const, id: vehiculoId });
    if (remolqueId) recursos.push({ tipo: 'remolque' as const, id: remolqueId });

    if (recursos.length === 0) return;

    console.log('🔍 [ValidadorDisponibilidad] Validando recursos:', {
      recursos,
      fechaInicio,
      fechaFin
    });

    const resultado = await verificarMultipleDisponibilidad(recursos, fechaInicio, fechaFin);
    
    console.log('📊 [ValidadorDisponibilidad] Resultado de validación:', resultado);
    
    if (resultado) {
      setValidaciones(resultado.resultados);
      onValidacionCompleta?.(resultado.disponible, resultado.conflictos);
      
      console.log('✅ [ValidadorDisponibilidad] Validaciones actualizadas:', {
        validaciones: resultado.resultados,
        disponible: resultado.disponible,
        conflictos: resultado.conflictos
      });
    } else {
      console.warn('⚠️ [ValidadorDisponibilidad] No se recibió resultado');
    }
  };

  useEffect(() => {
    if (fechaInicio && fechaFin && (conductorId || vehiculoId || remolqueId)) {
      validarRecursos();
    }
  }, [conductorId, vehiculoId, remolqueId, fechaInicio, fechaFin]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'disponible': return 'bg-success/10 text-success border-success/20';
      case 'asignado': case 'en_transito': return 'bg-warning/10 text-warning border-warning/20';
      case 'mantenimiento': case 'fuera_servicio': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getEstadoIcono = (disponible: boolean, conflictos: ConflictoDisponibilidad[]) => {
    if (disponible) return <CheckCircle className="h-4 w-4 text-success" />;
    if (conflictos.some(c => c.tipo === 'estado_no_disponible')) return <AlertCircle className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-warning" />;
  };

  const formatearFecha = (fecha: string) => {
    return format(new Date(fecha), "dd 'de' MMMM 'a las' HH:mm", { locale: es });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Verificando disponibilidad...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (validaciones.length === 0) {
    return null;
  }

  const todosDisponibles = validaciones.every(v => v.validacion?.disponible);
  const tieneConflictos = validaciones.some(v => v.validacion && !v.validacion.disponible);

  return (
    <Card className={`border-2 ${todosDisponibles ? 'border-success/20' : 'border-warning/20'}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {todosDisponibles ? (
              <CheckCircle className="h-5 w-5 text-success" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-warning" />
            )}
            Estado de Disponibilidad
          </span>
          <Badge variant={todosDisponibles ? "default" : "secondary"}>
            {todosDisponibles ? 'Todos disponibles' : 'Conflictos detectados'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumen del período */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Período solicitado:</strong>
          </p>
          <p className="text-sm">
            Del {formatearFecha(fechaInicio)} hasta {formatearFecha(fechaFin)}
          </p>
        </div>

        {/* Estado de cada recurso */}
        <div className="space-y-3">
          {validaciones.map((validacion) => (
            <div key={`${validacion.tipo}-${validacion.id}`} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getEstadoIcono(
                    validacion.validacion?.disponible || false,
                    validacion.validacion?.conflictos || []
                  )}
                  <span className="font-medium capitalize">{validacion.tipo}</span>
                </div>
                <Badge className={getEstadoColor(validacion.validacion?.estado_actual || 'disponible')}>
                  {validacion.validacion?.estado_actual || 'Disponible'}
                </Badge>
              </div>

              {/* Mostrar conflictos si existen */}
              {(validacion.validacion?.conflictos || []).map((conflicto, index) => (
                <Alert key={index} className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {conflicto.tipo === 'estado_no_disponible' ? (
                      <div>
                        <p>{conflicto.mensaje}</p>
                        {conflicto.fecha_disponible && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Próxima disponibilidad: {formatearFecha(conflicto.fecha_disponible)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p><strong>{conflicto.tipo_programacion}:</strong> {conflicto.descripcion}</p>
                        {conflicto.fecha_inicio && conflicto.fecha_fin && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Del {formatearFecha(conflicto.fecha_inicio)} al {formatearFecha(conflicto.fecha_fin)}
                          </p>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}

              {/* Mostrar mensaje de disponibilidad */}
              {validacion.validacion?.disponible && (
                <Alert className="mt-2 border-success/20 bg-success/5">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success">
                    Disponible para el período solicitado
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ))}
        </div>

        {/* Botón para revalidar */}
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={validarRecursos}
            disabled={loading}
          >
            <Clock className="h-4 w-4 mr-2" />
            Verificar nuevamente
          </Button>
        </div>

        {/* Mensaje de advertencia si hay conflictos */}
        {tieneConflictos && (
          <Alert className="border-warning/20 bg-warning/5">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning">
              <strong>Advertencia:</strong> Algunos recursos no están disponibles para las fechas seleccionadas. 
              Puedes continuar pero es recomendable resolver los conflictos primero.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};