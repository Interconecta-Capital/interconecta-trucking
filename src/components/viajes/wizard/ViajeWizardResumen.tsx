
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Package, MapPin, Route, Truck, User, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { ViajeWizardData } from '../ViajeWizard';
import { useState } from 'react';

interface ViajeWizardResumenProps {
  data: ViajeWizardData;
  onConfirm: () => void;
}

function Label({ className, children, ...props }: { className?: string; children: React.ReactNode }) {
  return <label className={`text-sm font-medium ${className || ''}`} {...props}>{children}</label>;
}

export function ViajeWizardResumen({ data, onConfirm }: ViajeWizardResumenProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  const tipoServicioLabel = data.tipoServicio === 'flete_pagado' 
    ? 'Flete Pagado (CFDI Ingreso)' 
    : 'Traslado Propio (CFDI Traslado)';

  const handleConfirmClick = async () => {
    if (isProcessing) {
      return; // Prevenir múltiples clics
    }

    setIsProcessing(true);
    
    try {
      setProcessingStep('Validando datos...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProcessingStep('Creando viaje...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProcessingStep('Generando documentos...');
      
      // Llamar a la función original
      await onConfirm();
      
    } catch (error) {
      console.error('Error en confirmación:', error);
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del Resumen */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Resumen del Viaje</h3>
        <p className="text-muted-foreground">
          Revisa toda la información antes de confirmar el viaje
        </p>
      </div>

      {/* Información de la Misión */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Información de la Misión
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Cliente</Label>
              <div className="font-medium">{data.cliente?.nombre_razon_social}</div>
              <div className="text-sm text-muted-foreground">RFC: {data.cliente?.rfc}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Tipo de Servicio</Label>
              <div className="font-medium">{tipoServicioLabel}</div>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Descripción de Mercancía</Label>
            <div className="font-medium">{data.descripcionMercancia}</div>
          </div>
        </CardContent>
      </Card>

      {/* Información de la Ruta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5 text-green-600" />
            Ruta del Viaje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="font-medium">Origen</div>
                <div className="text-sm text-muted-foreground">{data.origen?.direccion}</div>
              </div>
            </div>
            <MapPin className="h-4 w-4 text-green-600" />
          </div>
          
          <div className="flex items-center gap-3 pl-6">
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-sm text-muted-foreground">
              {data.distanciaRecorrida} km • {Math.floor((data.distanciaRecorrida || 0) / 80)} hrs estimadas
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <div className="font-medium">Destino</div>
                <div className="text-sm text-muted-foreground">{data.destino?.direccion}</div>
              </div>
            </div>
            <MapPin className="h-4 w-4 text-red-600" />
          </div>
        </CardContent>
      </Card>

      {/* Activos Asignados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-purple-600" />
            Activos Asignados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Vehículo
              </Label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">
                  {data.vehiculo?.marca} {data.vehiculo?.modelo}
                </div>
                <div className="text-sm text-muted-foreground">
                  Placa: {data.vehiculo?.placa}
                </div>
                <div className="text-sm text-muted-foreground">
                  Capacidad: {data.vehiculo?.capacidad_carga} kg
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Conductor
              </Label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">{data.conductor?.nombre}</div>
                <div className="text-sm text-muted-foreground">
                  Licencia: {data.conductor?.num_licencia || 'No registrada'}
                </div>
                {data.conductor?.operador_sct && (
                  <Badge variant="outline" className="text-xs mt-1">
                    Operador SCT
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentos que se generarán */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <FileText className="h-5 w-5" />
            Documentos a Generar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-blue-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Carta Porte CFDI 3.1</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>XML firmado digitalmente</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>PDF para impresión</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Registro del viaje en sistema</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advertencias Finales */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <div className="font-medium text-amber-900">Importante</div>
              <div className="text-sm text-amber-800">
                Al confirmar este viaje se generarán automáticamente todos los documentos fiscales requeridos. 
                Asegúrate de que toda la información sea correcta antes de proceder.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado de Procesamiento */}
      {isProcessing && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">Procesando Viaje</div>
                <div className="text-sm text-blue-700">{processingStep}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón de Confirmación con Estados */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleConfirmClick}
          disabled={isProcessing}
          className={`${
            isProcessing 
              ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          } px-8 py-3 text-lg font-semibold`}
          data-onboarding="confirm-viaje-btn"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              {processingStep || 'Procesando...'}
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Confirmar y Emitir Documentos
            </>
          )}
        </Button>
      </div>

      {/* Mensaje de Estado */}
      {isProcessing && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Por favor espera mientras procesamos tu viaje y generamos los documentos...
          </p>
        </div>
      )}
    </div>
  );
}
