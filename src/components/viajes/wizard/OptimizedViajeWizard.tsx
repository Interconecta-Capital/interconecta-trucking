
import React, { useState, useCallback, useMemo } from 'react';
import { ViajeWizardData } from '../ViajeWizard';
import { useOptimizedViajes } from '@/hooks/useOptimizedViajes';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface OptimizedViajeWizardProps {
  data: ViajeWizardData;
  onSuccess: () => void;
}

export function OptimizedViajeWizard({ data, onSuccess }: OptimizedViajeWizardProps) {
  const { crearViajeOptimizado, isCreating, getCacheStats } = useOptimizedViajes();
  const [lastError, setLastError] = useState<string | null>(null);

  // Validación optimizada con memoización
  const validationResult = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validaciones críticas
    if (!data.cliente?.rfc) errors.push('RFC del cliente requerido');
    if (!data.origen) errors.push('Origen requerido');
    if (!data.destino) errors.push('Destino requerido');
    if (!data.vehiculo) errors.push('Vehículo requerido');
    if (!data.conductor) errors.push('Conductor requerido');

    // Validaciones de advertencia
    if (!data.descripcionMercancia) warnings.push('Descripción de mercancía recomendada');
    if (!data.distanciaRecorrida || data.distanciaRecorrida === 0) {
      warnings.push('Distancia no calculada');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, 100 - (errors.length * 25) - (warnings.length * 10))
    };
  }, [data]);

  const handleCreateViaje = useCallback(async () => {
    if (!validationResult.isValid) {
      setLastError('Complete los campos requeridos antes de continuar');
      return;
    }

    setLastError(null);

    try {
      await crearViajeOptimizado(data);
      onSuccess();
    } catch (error: any) {
      console.error('Error creando viaje:', error);
      setLastError(error.message || 'Error creando viaje');
    }
  }, [data, validationResult.isValid, crearViajeOptimizado, onSuccess]);

  const stats = getCacheStats();

  return (
    <div className="space-y-6">
      {/* Performance Stats */}
      <Alert className="border-blue-200 bg-blue-50">
        <TrendingUp className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="flex gap-4 text-sm">
            <span>Cache: {stats.cacheSize} entradas</span>
            <span>Cola: {stats.queueSize} requests</span>
            <span>Estado: {stats.isProcessing ? 'Procesando' : 'Disponible'}</span>
          </div>
        </AlertDescription>
      </Alert>

      {/* Validation Summary */}
      <Alert className={validationResult.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        {validationResult.isValid ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-red-600" />
        )}
        <AlertDescription>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                Validación: {validationResult.score}% completo
              </span>
            </div>
            
            {validationResult.errors.length > 0 && (
              <div>
                <strong className="text-red-700">Errores:</strong>
                <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                  {validationResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validationResult.warnings.length > 0 && (
              <div>
                <strong className="text-yellow-700">Advertencias:</strong>
                <ul className="list-disc list-inside text-sm text-yellow-600 mt-1">
                  {validationResult.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {/* Error Display */}
      {lastError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{lastError}</AlertDescription>
        </Alert>
      )}

      {/* Create Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleCreateViaje}
          disabled={!validationResult.isValid || isCreating}
          size="lg"
          className="min-w-48"
        >
          {isCreating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creando Viaje...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Crear Viaje Optimizado
            </div>
          )}
        </Button>
      </div>

      {/* Performance Tips */}
      {stats.queueSize > 10 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Sistema bajo alta carga ({stats.queueSize} requests en cola). 
            Los viajes se procesarán automáticamente en orden.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
