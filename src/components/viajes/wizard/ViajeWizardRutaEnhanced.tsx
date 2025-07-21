
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Route, AlertTriangle } from 'lucide-react';
import { ViajeWizardData } from '../ViajeWizard';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { useDebounce } from '@/hooks/useDebounce';
import { OptimizedAutoRouteCalculator } from '@/components/carta-porte/ubicaciones/OptimizedAutoRouteCalculator';
import { Ubicacion } from '@/types/ubicaciones';

interface ViajeWizardRutaEnhancedProps {
  data: ViajeWizardData;
  updateData: (updates: Partial<ViajeWizardData>) => void;
}

export function ViajeWizardRutaEnhanced({ data, updateData }: ViajeWizardRutaEnhancedProps) {
  // Estados locales para optimización de UX
  const [localOrigen, setLocalOrigen] = useState(data.origen?.domicilio?.calle || '');
  const [localDestino, setLocalDestino] = useState(data.destino?.domicilio?.calle || '');
  const [localDistancia, setLocalDistancia] = useState(data.distanciaRecorrida || 0);

  // Debounce para evitar actualizaciones excesivas
  const debouncedOrigen = useDebounce(localOrigen, 500);
  const debouncedDestino = useDebounce(localDestino, 500);
  const debouncedDistancia = useDebounce(localDistancia, 300);

  // Sincronizar con data principal solo cuando sea necesario
  React.useEffect(() => {
    if (debouncedOrigen !== data.origen?.domicilio?.calle) {
      updateData({
        origen: {
          ...data.origen,
          domicilio: {
            ...data.origen?.domicilio,
            calle: debouncedOrigen,
            municipio: debouncedOrigen.split(',')[0] || debouncedOrigen,
            estado: debouncedOrigen.split(',')[1]?.trim() || 'México'
          }
        }
      });
    }
  }, [debouncedOrigen]);

  React.useEffect(() => {
    if (debouncedDestino !== data.destino?.domicilio?.calle) {
      updateData({
        destino: {
          ...data.destino,
          domicilio: {
            ...data.destino?.domicilio,
            calle: debouncedDestino,
            municipio: debouncedDestino.split(',')[0] || debouncedDestino,
            estado: debouncedDestino.split(',')[1]?.trim() || 'México'
          }
        }
      });
    }
  }, [debouncedDestino]);

  React.useEffect(() => {
    if (debouncedDistancia !== data.distanciaRecorrida) {
      updateData({
        distanciaRecorrida: debouncedDistancia
      });
    }
  }, [debouncedDistancia]);

  // Manejo de fechas sin conversiones problemáticas
  const handleFechaSalidaChange = useCallback((fecha: Date | undefined) => {
    if (fecha) {
      updateData({
        origen: {
          ...data.origen,
          fechaHoraSalidaLlegada: fecha.toISOString()
        }
      });
    }
  }, [data.origen, updateData]);

  const handleFechaLlegadaChange = useCallback((fecha: Date | undefined) => {
    if (fecha) {
      updateData({
        destino: {
          ...data.destino,
          fechaHoraSalidaLlegada: fecha.toISOString()
        }
      });
    }
  }, [data.destino, updateData]);

  // Validaciones computadas
  const validation = useMemo(() => {
    const errors: string[] = [];
    
    if (!localOrigen.trim()) {
      errors.push('El origen es requerido');
    }
    
    if (!localDestino.trim()) {
      errors.push('El destino es requerido');
    }
    
    if (localDistancia <= 0) {
      errors.push('La distancia debe ser mayor a 0');
    }

    const fechaSalida = data.origen?.fechaHoraSalidaLlegada ? new Date(data.origen.fechaHoraSalidaLlegada) : null;
    const fechaLlegada = data.destino?.fechaHoraSalidaLlegada ? new Date(data.destino.fechaHoraSalidaLlegada) : null;

    if (fechaSalida && fechaLlegada && fechaLlegada <= fechaSalida) {
      errors.push('La fecha de llegada debe ser posterior a la fecha de salida');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [localOrigen, localDestino, localDistancia, data.origen?.fechaHoraSalidaLlegada, data.destino?.fechaHoraSalidaLlegada]);

  // Sincronizar validación con el wizard principal
  React.useEffect(() => {
    updateData({ isValid: validation.isValid });
  }, [validation.isValid, updateData]);

  // Crear ubicaciones para el calculador de rutas
  const ubicaciones: Ubicacion[] = useMemo(() => {
    const locations: Ubicacion[] = [];
    
    if (localOrigen) {
      locations.push({
        id: 'origen-wizard',
        idUbicacion: 'origen-wizard',
        tipoUbicacion: 'Origen',
        domicilio: {
          pais: 'Mexico',
          codigoPostal: '01000', // Código postal por defecto para Ciudad de México
          calle: localOrigen,
          municipio: localOrigen.split(',')[0] || localOrigen,
          estado: localOrigen.split(',')[1]?.trim() || 'México',
          colonia: 'Centro'
        }
      });
    }
    
    if (localDestino) {
      locations.push({
        id: 'destino-wizard',
        idUbicacion: 'destino-wizard',
        tipoUbicacion: 'Destino',
        domicilio: {
          pais: 'Mexico',
          codigoPostal: '01000', // Código postal por defecto para Ciudad de México
          calle: localDestino,
          municipio: localDestino.split(',')[0] || localDestino,
          estado: localDestino.split(',')[1]?.trim() || 'México',
          colonia: 'Centro'
        }
      });
    }
    
    return locations;
  }, [localOrigen, localDestino]);

  // Manejo de distancia calculada automáticamente
  const handleDistanceCalculated = useCallback((distancia: number, tiempo: number, geometry: any) => {
    console.log('📊 Distancia calculada automáticamente:', { distancia, tiempo });
    setLocalDistancia(distancia);
    updateData({
      distanciaRecorrida: distancia
    });
  }, [updateData]);

  const fechaSalida = data.origen?.fechaHoraSalidaLlegada ? new Date(data.origen.fechaHoraSalidaLlegada) : undefined;
  const fechaLlegada = data.destino?.fechaHoraSalidaLlegada ? new Date(data.destino.fechaHoraSalidaLlegada) : undefined;
  const minFechaLlegada = fechaSalida ? new Date(fechaSalida.getTime() + 60 * 60 * 1000) : new Date();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Información de la Ruta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ubicaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origen" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                Origen *
              </Label>
              <Input
                id="origen"
                value={localOrigen}
                onChange={(e) => setLocalOrigen(e.target.value)}
                placeholder="Ciudad o dirección de origen"
                className="border-green-200 focus:border-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destino" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-600" />
                Destino *
              </Label>
              <Input
                id="destino"
                value={localDestino}
                onChange={(e) => setLocalDestino(e.target.value)}
                placeholder="Ciudad o dirección de destino"
                className="border-red-200 focus:border-red-500"
              />
            </div>
          </div>

          {/* Fechas y Horarios */}
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateTimePicker
              label="Fecha y Hora de Salida"
              date={fechaSalida}
              onDateChange={handleFechaSalidaChange}
              placeholder="Selecciona fecha de salida"
              required
              minDate={new Date()}
              className="border-green-200 focus:border-green-500"
            />

            <DateTimePicker
              label="Fecha y Hora de Llegada"
              date={fechaLlegada}
              onDateChange={handleFechaLlegadaChange}
              placeholder="Selecciona fecha de llegada"
              required
              minDate={minFechaLlegada}
              className="border-red-200 focus:border-red-500"
            />
          </div>

          {/* Distancia */}
          <div className="space-y-2">
            <Label htmlFor="distancia">Distancia Estimada (km) *</Label>
            <Input
              id="distancia"
              type="number"
              min="1"
              value={localDistancia || ''}
              onChange={(e) => setLocalDistancia(Number(e.target.value))}
              placeholder="Distancia en kilómetros"
            />
          </div>

          {/* Resumen de validación */}
          {!validation.isValid && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-800">Errores en la ruta:</p>
                <ul className="text-sm text-red-700 space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {validation.isValid && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <Badge variant="default" className="bg-green-100 text-green-800">
                Ruta válida
              </Badge>
              <span className="text-sm text-green-700">
                {localDistancia}km • {localOrigen} → {localDestino}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calculador automático de ruta */}
      {ubicaciones.length >= 2 && (
        <OptimizedAutoRouteCalculator
          ubicaciones={ubicaciones}
          onDistanceCalculated={handleDistanceCalculated}
          distanciaTotal={localDistancia}
          tiempoEstimado={data.distanciaRecorrida ? Math.round(data.distanciaRecorrida * 1.2) : undefined}
        />
      )}
    </div>
  );
}
