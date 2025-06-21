
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Package, MapPin, Truck, FileText, Save, Send } from 'lucide-react';
import { ViajeWizardData } from '../ViajeWizard';
import { DocumentoBorradorGenerator } from './DocumentoBorradorGenerator';

interface ViajeWizardResumenProps {
  data: ViajeWizardData;
  onConfirm: () => void;
  onSaveDraft?: () => void;
  onExit?: () => void;
}

export function ViajeWizardResumen({ data, onConfirm, onSaveDraft, onExit }: ViajeWizardResumenProps) {
  const formatFecha = (fecha: string) => {
    if (!fecha) return 'No definida';
    return new Date(fecha).toLocaleString('es-MX');
  };

  return (
    <div className="space-y-6">
      {/* Resumen del viaje */}
      <Card data-onboarding="confirm-viaje-btn">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Resumen del Viaje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cliente y Servicio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Package className="h-4 w-4" />
                Cliente y Mercancía
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Cliente:</span>
                  <p className="font-medium">{data.cliente?.nombre_razon_social || 'No seleccionado'}</p>
                  <p className="text-sm text-muted-foreground">{data.cliente?.rfc}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Tipo de servicio:</span>
                  <Badge variant="outline" className="ml-2">
                    {data.tipoServicio === 'flete_pagado' ? 'Flete Pagado' : 'Traslado Propio'}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Mercancía:</span>
                  <p className="text-sm">{data.descripcionMercancia || 'No especificada'}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4" />
                Ruta del Viaje
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Origen:</span>
                  <p className="text-sm">{data.origen?.domicilio?.calle || 'No definido'}</p>
                  <p className="text-xs text-muted-foreground">
                    Salida: {formatFecha(data.origen?.fechaHoraSalidaLlegada || '')}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Destino:</span>
                  <p className="text-sm">{data.destino?.domicilio?.calle || 'No definido'}</p>
                  <p className="text-xs text-muted-foreground">
                    Llegada: {formatFecha(data.destino?.fechaHoraSalidaLlegada || '')}
                  </p>
                </div>
                {data.distanciaRecorrida && (
                  <div>
                    <span className="text-sm text-muted-foreground">Distancia:</span>
                    <Badge variant="outline" className="ml-2">
                      {data.distanciaRecorrida} km
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Activos asignados */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-3">
              <Truck className="h-4 w-4" />
              Activos Asignados
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-muted-foreground">Vehículo:</span>
                <p className="font-medium">{data.vehiculo?.placa || 'No asignado'}</p>
                <p className="text-sm text-muted-foreground">
                  {data.vehiculo?.marca} {data.vehiculo?.modelo}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-muted-foreground">Conductor:</span>
                <p className="font-medium">{data.conductor?.nombre || 'No asignado'}</p>
                <p className="text-sm text-muted-foreground">
                  Lic: {data.conductor?.num_licencia || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Acciones principales */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button variant="outline" onClick={onExit}>
              Salir sin Guardar
            </Button>
            <Button variant="outline" onClick={onSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Borrador
            </Button>
            <Button 
              onClick={onConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Confirmar y Generar Documentos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generador de documentos borrador */}
      <DocumentoBorradorGenerator 
        data={data}
        onSaveDraft={onSaveDraft}
        onExit={onExit}
      />
    </div>
  );
}
