
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Package, 
  MapPin, 
  Truck, 
  User, 
  FileText, 
  AlertTriangle,
  Clock,
  DollarSign,
  Route
} from 'lucide-react';
import { ViajeWizardData } from '../ViajeWizard';
import { useCalculadoraCostosProfesional } from '@/hooks/useCalculadoraCostosProfesional';
import { CostBreakdownCard } from './CostBreakdownCard';

interface ViajeWizardResumenProps {
  data: ViajeWizardData;
  onConfirm: () => void;
}

export function ViajeWizardResumen({ data, onConfirm }: ViajeWizardResumenProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error confirming viaje:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  // Cálculo básico original para compatibilidad
  const getEstimatedCost = () => {
    const baseCost = data.distanciaRecorrida ? data.distanciaRecorrida * 12 : 1000;
    const serviceFactor = data.tipoServicio === 'flete_pagado' ? 1.2 : 1.0;
    return Math.round(baseCost * serviceFactor);
  };

  // Preparar parámetros para el cálculo profesional
  const calculoProfesionalParams = {
    distancia: data.distanciaRecorrida || 0,
    tiempoEstimadoHoras: data.distanciaRecorrida ? Math.round(data.distanciaRecorrida / 60) : undefined,
    vehiculo: data.vehiculo ? {
      id: data.vehiculo.id,
      placa: data.vehiculo.placa,
      marca: data.vehiculo.marca || 'N/A',
      modelo: data.vehiculo.modelo || 'N/A',
      rendimiento: data.vehiculo.rendimiento || 3.5,
      tipo_combustible: data.vehiculo.tipo_combustible || 'Diesel',
      capacidad_carga: data.vehiculo.capacidad_carga || 28000,
      peso_bruto_vehicular: data.vehiculo.peso_bruto_vehicular,
      costo_mantenimiento_km: data.vehiculo.costo_mantenimiento_km || 2.07,
      costo_llantas_km: data.vehiculo.costo_llantas_km || 1.08,
      valor_vehiculo: data.vehiculo.valor_vehiculo || 1500000,
      configuracion_ejes: data.vehiculo.configuracion_ejes || 'T3S2',
      factor_peajes: data.vehiculo.factor_peajes || 2.0
    } : undefined,
    tipoServicio: data.tipoServicio
  };

  // Nuevo cálculo inteligente
  const costBreakdown = useCalculadoraCostosProfesional(calculoProfesionalParams);
  const basicCost = getEstimatedCost();

  const getEstimatedTime = () => {
    if (!data.distanciaRecorrida) return 'Por calcular';
    const hours = Math.round(data.distanciaRecorrida / 60);
    return `${hours} horas aproximadamente`;
  };

  const validateData = () => {
    const errors: string[] = [];
    
    if (!data.cliente) errors.push('Cliente no seleccionado');
    if (!data.tipoServicio) errors.push('Tipo de servicio no definido');
    if (!data.descripcionMercancia) errors.push('Descripción de mercancía faltante');
    if (!data.origen) errors.push('Origen no definido');
    if (!data.destino) errors.push('Destino no definido');
    if (!data.vehiculo) errors.push('Vehículo no asignado');
    if (!data.conductor) errors.push('Conductor no asignado');
    
    return errors;
  };

  const validationErrors = validateData();
  const canConfirm = validationErrors.length === 0;

  return (
    <div className="space-y-6">
      {/* Validación general */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Información Incompleta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  {error}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Resumen ejecutivo */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Route className="h-5 w-5" />
            Resumen del Viaje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{data.distanciaRecorrida || 'N/A'}</div>
              <div className="text-sm text-blue-600">Kilómetros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                ${costBreakdown ? costBreakdown.costoTotal.toLocaleString() : basicCost.toLocaleString()}
              </div>
              <div className="text-sm text-green-600">
                {costBreakdown ? 'Costo Inteligente' : 'Costo Estimado'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-700">{getEstimatedTime()}</div>
              <div className="text-sm text-orange-600">Tiempo Estimado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">
                {data.tipoServicio === 'flete_pagado' ? 'Flete' : 'Traslado'}
              </div>
              <div className="text-sm text-purple-600">Tipo de Servicio</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análisis Inteligente de Costos - NUEVA SECCIÓN */}
      {costBreakdown && (
        <CostBreakdownCard breakdown={costBreakdown} basicCost={basicCost} />
      )}

      {/* Detalles de la misión */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Misión del Viaje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="font-medium text-gray-700">Cliente:</label>
            <p className="text-gray-900">{data.cliente?.nombre_razon_social || 'No especificado'}</p>
            {data.cliente?.rfc && (
              <p className="text-sm text-gray-600">RFC: {data.cliente.rfc}</p>
            )}
          </div>
          
          <div>
            <label className="font-medium text-gray-700">Tipo de Servicio:</label>
            <Badge variant={data.tipoServicio === 'flete_pagado' ? 'default' : 'secondary'} className="ml-2">
              {data.tipoServicio === 'flete_pagado' ? 'Flete Pagado' : 'Traslado Propio'}
            </Badge>
          </div>
          
          <div>
            <label className="font-medium text-gray-700">Descripción de Mercancía:</label>
            <p className="text-gray-900 bg-gray-50 p-2 rounded text-sm">
              {data.descripcionMercancia || 'No especificada'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detalles de la ruta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ruta del Viaje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-gray-700 flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Origen:
              </label>
              <p className="text-gray-900">{data.origen?.domicilio?.calle || 'No especificado'}</p>
              {data.origen?.direccion && (
                <p className="text-sm text-gray-600">{data.origen.direccion}</p>
              )}
            </div>
            
            <div>
              <label className="font-medium text-gray-700 flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                Destino:
              </label>
              <p className="text-gray-900">{data.destino?.domicilio?.calle || 'No especificado'}</p>
              {data.destino?.direccion && (
                <p className="text-sm text-gray-600">{data.destino.direccion}</p>
              )}
            </div>
          </div>
          
          {data.distanciaRecorrida && (
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded">
              <div>
                <span className="font-medium">Distancia Total:</span>
                <span className="ml-2 text-lg font-bold">{data.distanciaRecorrida} km</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activos asignados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Activos Asignados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-gray-700 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Vehículo:
              </label>
              {data.vehiculo ? (
                <div className="mt-1 p-3 bg-gray-50 rounded">
                  <p className="font-medium">{data.vehiculo.marca || 'N/A'} {data.vehiculo.modelo || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Placas: {data.vehiculo.placa}</p>
                  <p className="text-sm text-gray-600">Tipo: {data.vehiculo.tipo_carroceria || 'N/A'}</p>
                  <p className="text-sm text-gray-600">
                    Capacidad: {data.vehiculo.capacidad_carga?.toLocaleString() || 'N/A'} kg
                  </p>
                </div>
              ) : (
                <p className="text-red-600">No asignado</p>
              )}
            </div>
            
            <div>
              <label className="font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4" />
                Conductor:
              </label>
              {data.conductor ? (
                <div className="mt-1 p-3 bg-gray-50 rounded">
                  <p className="font-medium">{data.conductor.nombre}</p>
                  <p className="text-sm text-gray-600">Licencia: {data.conductor.tipo_licencia}</p>
                  <p className="text-sm text-gray-600">
                    Vigencia: {data.conductor.vigencia_licencia ? new Date(data.conductor.vigencia_licencia).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              ) : (
                <p className="text-red-600">No asignado</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentos a generar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos a Generar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
              <span className="text-sm font-medium">Carta Porte XML (SAT 3.1)</span>
              <Badge variant="outline">Fiscal</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
              <span className="text-sm font-medium">Carta Porte PDF</span>
              <Badge variant="outline">Imprimible</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm font-medium">Hoja de Ruta</span>
              <Badge variant="secondary">Operativo</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón de confirmación */}
      <Card className={canConfirm ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
        <CardContent className="pt-6">
          {canConfirm ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Listo para Programar Viaje</span>
              </div>
              
              <p className="text-sm text-green-700">
                Se generarán automáticamente todos los documentos fiscales y operativos.
                Una vez confirmado, el viaje quedará programado en el sistema.
              </p>
              
              <Button
                onClick={handleConfirm}
                disabled={isConfirming}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
                size="lg"
              >
                {isConfirming ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generando Documentos...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Confirmar y Programar Viaje
                  </div>
                )}
              </Button>
              
              <p className="text-xs text-gray-600">
                Los documentos fiscales serán válidos ante el SAT
              </p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Información Incompleta</span>
              </div>
              
              <p className="text-sm text-red-600">
                Complete todos los campos requeridos antes de programar el viaje.
              </p>
              
              <Button variant="outline" disabled className="px-8 py-2" size="lg">
                Completar Información Faltante
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
