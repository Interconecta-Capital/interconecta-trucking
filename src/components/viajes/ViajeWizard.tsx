import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ViajeConfirmationButton } from './ViajeConfirmationButton';

export interface ViajeWizardData {
  currentStep: number;
  isValid: boolean;
  cliente?: {
    id: string;
    nombre_razon_social: string;
    rfc: string;
  };
  origen?: {
    domicilio: {
      calle: string;
    };
    direccion?: string;
    codigoPostal?: string;
    coordenadas?: {
      lat: number;
      lng: number;
    };
    fechaHoraSalidaLlegada: string;
  };
  destino?: {
    domicilio: {
      calle: string;
    };
    direccion?: string;
    codigoPostal?: string;
    coordenadas?: {
      lat: number;
      lng: number;
    };
    fechaHoraSalidaLlegada: string;
  };
  distanciaRecorrida?: number;
  vehiculo?: {
    id: string;
    placa: string;
    configuracion_vehicular: string;
    peso_bruto_vehicular: number;
    anio: number;
    marca?: string;
    modelo?: string;
    tipo_carroceria?: string;
    capacidad_carga?: number;
    rendimiento?: number;
    tipo_combustible?: string;
    costo_mantenimiento_km?: number;
    costo_llantas_km?: number;
    valor_vehiculo?: number;
    configuracion_ejes?: string;
    factor_peajes?: number;
  };
  conductor?: {
    id: string;
    nombre: string;
    rfc?: string;
    num_licencia?: string;
    tipo_licencia?: string;
    vigencia_licencia?: string;
  };
  mercancias?: any[];
  descripcionMercancia?: string;
  tipoServicio?: string;
}

interface ViajeWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export interface ViajeWizardHandle {
  nextStep: () => void;
  prevStep: () => void;
  requestClose: () => void;
}

export const ViajeWizard = forwardRef<ViajeWizardHandle, ViajeWizardProps>(
  ({ onComplete, onCancel }, ref) => {
    const [formData, setFormData] = useState({
      clienteNombre: '',
      clienteRfc: '',
      origen: '',
      destino: '',
      vehiculoPlaca: '',
      conductorNombre: '',
      descripcionMercancia: '',
      observaciones: ''
    });

    useImperativeHandle(ref, () => ({
      nextStep: () => {},
      prevStep: () => {},
      requestClose: () => {
        if (window.confirm('¿Estás seguro de que quieres cancelar? Perderás los datos no guardados.')) {
          onCancel?.();
        }
      },
    }));

    const handleInputChange = (field: string, value: string) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const isFormValid = () => {
      return formData.clienteNombre && 
             formData.clienteRfc && 
             formData.origen && 
             formData.destino &&
             formData.vehiculoPlaca &&
             formData.conductorNombre;
    };

    const getWizardData = (): ViajeWizardData => {
      return {
        currentStep: 0,
        isValid: true,
        cliente: {
          id: `cliente-${Date.now()}`,
          nombre_razon_social: formData.clienteNombre,
          rfc: formData.clienteRfc
        },
        origen: {
          domicilio: {
            calle: formData.origen
          },
          fechaHoraSalidaLlegada: new Date().toISOString()
        },
        destino: {
          domicilio: {
            calle: formData.destino
          },
          fechaHoraSalidaLlegada: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        vehiculo: {
          id: `vehiculo-${Date.now()}`,
          placa: formData.vehiculoPlaca,
          configuracion_vehicular: 'C2',
          peso_bruto_vehicular: 3500,
          anio: 2020
        },
        conductor: {
          id: `conductor-${Date.now()}`,
          nombre: formData.conductorNombre
        },
        descripcionMercancia: formData.descripcionMercancia,
        distanciaRecorrida: 100
      };
    };

    const handleViajeCreado = () => {
      console.log('🎉 Viaje creado exitosamente');
      onComplete?.();
    };

    const handleErrorCreacion = (error: string) => {
      console.error('❌ Error creando viaje:', error);
    };

    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Crear Nuevo Viaje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clienteNombre">Cliente / Empresa</Label>
                <Input
                  id="clienteNombre"
                  value={formData.clienteNombre}
                  onChange={(e) => handleInputChange('clienteNombre', e.target.value)}
                  placeholder="Nombre del cliente"
                />
              </div>
              <div>
                <Label htmlFor="clienteRfc">RFC del Cliente</Label>
                <Input
                  id="clienteRfc"
                  value={formData.clienteRfc}
                  onChange={(e) => handleInputChange('clienteRfc', e.target.value)}
                  placeholder="RFC"
                />
              </div>
            </div>

            {/* Ruta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origen">Origen</Label>
                <Input
                  id="origen"
                  value={formData.origen}
                  onChange={(e) => handleInputChange('origen', e.target.value)}
                  placeholder="Ciudad o dirección de origen"
                />
              </div>
              <div>
                <Label htmlFor="destino">Destino</Label>
                <Input
                  id="destino"
                  value={formData.destino}
                  onChange={(e) => handleInputChange('destino', e.target.value)}
                  placeholder="Ciudad o dirección de destino"
                />
              </div>
            </div>

            {/* Recursos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehiculoPlaca">Placa del Vehículo</Label>
                <Input
                  id="vehiculoPlaca"
                  value={formData.vehiculoPlaca}
                  onChange={(e) => handleInputChange('vehiculoPlaca', e.target.value)}
                  placeholder="ABC-123"
                />
              </div>
              <div>
                <Label htmlFor="conductorNombre">Conductor</Label>
                <Input
                  id="conductorNombre"
                  value={formData.conductorNombre}
                  onChange={(e) => handleInputChange('conductorNombre', e.target.value)}
                  placeholder="Nombre del conductor"
                />
              </div>
            </div>

            {/* Mercancía */}
            <div>
              <Label htmlFor="descripcionMercancia">Descripción de Mercancía</Label>
              <Textarea
                id="descripcionMercancia"
                value={formData.descripcionMercancia}
                onChange={(e) => handleInputChange('descripcionMercancia', e.target.value)}
                placeholder="Describe la mercancía a transportar"
                rows={3}
              />
            </div>

            {/* Observaciones */}
            <div>
              <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                placeholder="Observaciones adicionales"
                rows={2}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-between gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
              >
                Cancelar
              </Button>
              
              <div className="flex-1">
                <ViajeConfirmationButton
                  wizardData={getWizardData()}
                  onSuccess={handleViajeCreado}
                  onError={handleErrorCreacion}
                  disabled={!isFormValid()}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

ViajeWizard.displayName = 'ViajeWizard';