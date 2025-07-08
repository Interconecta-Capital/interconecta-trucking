
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useViajes } from '@/hooks/useViajes';
import { ViajeWizardData } from './ViajeWizard';
import { toast } from 'sonner';
import { MapPin, User, Truck, Calendar, CheckCircle } from 'lucide-react';

interface ViajeConfirmationButtonProps {
  wizardData: ViajeWizardData;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export function ViajeConfirmationButton({ 
  wizardData, 
  onSuccess, 
  onError,
  disabled = false 
}: ViajeConfirmationButtonProps) {
  const { crearViaje, isCreatingViaje } = useViajes();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmarViaje = async () => {
    console.log('🎯 Iniciando confirmación de viaje:', wizardData);
    
    // Validaciones previas
    if (!wizardData.cliente) {
      const error = 'Debe seleccionar un cliente';
      toast.error(error);
      onError?.(error);
      return;
    }

    if (!wizardData.origen || !wizardData.destino) {
      const error = 'Debe definir origen y destino';
      toast.error(error);
      onError?.(error);
      return;
    }

    setIsConfirming(true);
    
    try {
      console.log('📊 Datos del wizard validados, creando viaje...');
      
      // Usar la función corregida que retorna Promise
      const viajeCreado = await crearViaje(wizardData);
      
      console.log('✅ Viaje creado exitosamente:', viajeCreado);
      
      // Llamar callback de éxito
      onSuccess?.();
      
    } catch (error: any) {
      console.error('❌ Error creando viaje:', error);
      const errorMessage = error.message || 'Error al crear el viaje';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsConfirming(false);
    }
  };

  const isLoading = isCreatingViaje || isConfirming;

  return (
    <div className="space-y-4">
      {/* Resumen del viaje */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Confirmar Viaje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cliente */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Cliente:</span>
              <Badge variant="outline">
                {wizardData.cliente?.nombre_razon_social || 'Sin seleccionar'}
              </Badge>
            </div>

            {/* Ruta */}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Ruta:</span>
              <span className="text-sm text-gray-600">
                {wizardData.origen?.domicilio?.calle || 'Origen'} → {wizardData.destino?.domicilio?.calle || 'Destino'}
              </span>
            </div>

            {/* Vehículo */}
            {wizardData.vehiculo && (
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Vehículo:</span>
                <Badge variant="secondary">
                  {wizardData.vehiculo.placa}
                </Badge>
              </div>
            )}

            {/* Fecha */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Fecha:</span>
              <span className="text-sm text-gray-600">
                {wizardData.origen?.fechaHoraSalidaLlegada 
                  ? new Date(wizardData.origen.fechaHoraSalidaLlegada).toLocaleDateString('es-MX')
                  : 'Hoy'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón de confirmación */}
      <Button 
        onClick={handleConfirmarViaje}
        disabled={disabled || isLoading || !wizardData.cliente || !wizardData.origen || !wizardData.destino}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
            Creando viaje...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirmar y Crear Viaje
          </>
        )}
      </Button>

      {isLoading && (
        <div className="text-center text-sm text-gray-500">
          Por favor espera mientras se crea el viaje...
        </div>
      )}
    </div>
  );
}
