
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useViajes } from '@/hooks/useViajes';
import { useCostosViaje } from '@/hooks/useCostosViaje';
import { toast } from 'sonner';
import { Navigation, Calculator, DollarSign, Truck } from 'lucide-react';

interface ViajeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ViajeFormDialog({ open, onOpenChange, onSuccess }: ViajeFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const { crearViaje } = useViajes();
  const { calcularCostoEstimado, sugerirPrecio } = useCostosViaje();
  
  const [formData, setFormData] = useState({
    origen: '',
    destino: '',
    fecha_programada: '',
    distancia_km: 0,
    tiempo_estimado: 0,
    precio_cliente_deseado: 0,
    observaciones: ''
  });

  // Calcular costos y precios inteligentes
  const costosEstimados = formData.distancia_km > 0 
    ? calcularCostoEstimado(formData.distancia_km, 'camion', true)
    : null;
  
  const precioSugerido = costosEstimados 
    ? sugerirPrecio(costosEstimados.costo_total_estimado, 25)
    : 0;

  const margenEstimado = formData.precio_cliente_deseado > 0 && costosEstimados
    ? formData.precio_cliente_deseado - costosEstimados.costo_total_estimado
    : 0;

  const margenPorcentaje = costosEstimados && costosEstimados.costo_total_estimado > 0 && formData.precio_cliente_deseado > 0
    ? ((margenEstimado / costosEstimados.costo_total_estimado) * 100).toFixed(1)
    : '0';

  const handleDistanciaChange = (distancia: number) => {
    setFormData(prev => ({
      ...prev,
      distancia_km: distancia,
      tiempo_estimado: Math.round(distancia / 60), // Estimación básica: 60 km/h promedio
      precio_cliente_deseado: prev.precio_cliente_deseado || precioSugerido
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create a wizard data structure for the viaje with cost information
      const wizardData = {
        currentStep: 0,
        isValid: true,
        origen: {
          domicilio: {
            calle: formData.origen,
            municipio: formData.origen.split(',')[0] || formData.origen,
            estado: formData.origen.split(',')[1]?.trim() || 'México'
          },
          fechaHoraSalidaLlegada: formData.fecha_programada || new Date().toISOString(),
          nombreRemitenteDestinatario: 'Cliente'
        },
        destino: {
          domicilio: {
            calle: formData.destino,
            municipio: formData.destino.split(',')[0] || formData.destino,
            estado: formData.destino.split(',')[1]?.trim() || 'México'
          },
          fechaHoraSalidaLlegada: formData.fecha_programada || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          nombreRemitenteDestinatario: 'Destinatario'
        },
        cliente: {
          nombre_razon_social: 'Cliente Directo',
          rfc: 'XAXX010101000'
        },
        distanciaRecorrida: formData.distancia_km,
        tipoServicio: 'flete_pagado' as 'flete_pagado' | 'traslado_propio',
        // Información adicional para costos
        precioClienteDeseado: formData.precio_cliente_deseado,
        observacionesCostos: formData.observaciones
      };

      await crearViaje(wizardData);
      
      toast.success('Viaje programado exitosamente con costos calculados');
      setFormData({ 
        origen: '', 
        destino: '', 
        fecha_programada: '',
        distancia_km: 0,
        tiempo_estimado: 0,
        precio_cliente_deseado: 0,
        observaciones: ''
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error('Error al programar viaje: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Programar Nuevo Viaje
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica del viaje */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origen">Origen *</Label>
              <Input
                id="origen"
                value={formData.origen}
                onChange={(e) => setFormData(prev => ({ ...prev, origen: e.target.value }))}
                placeholder="Ciudad o dirección de origen"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destino">Destino *</Label>
              <Input
                id="destino"
                value={formData.destino}
                onChange={(e) => setFormData(prev => ({ ...prev, destino: e.target.value }))}
                placeholder="Ciudad o dirección de destino"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_programada">Fecha Programada</Label>
              <Input
                id="fecha_programada"
                type="datetime-local"
                value={formData.fecha_programada}
                onChange={(e) => setFormData(prev => ({ ...prev, fecha_programada: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distancia">Distancia (km)</Label>
              <Input
                id="distancia"
                type="number"
                min="0"
                value={formData.distancia_km || ''}
                onChange={(e) => handleDistanciaChange(Number(e.target.value))}
                placeholder="Distancia en kilómetros"
              />
            </div>
          </div>

          {/* Cálculo de costos inteligente */}
          {costosEstimados && (
            <>
              <Separator />
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">Cálculo Inteligente de Costos</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="text-xs text-muted-foreground">Combustible</p>
                      <p className="font-semibold">${costosEstimados.combustible_estimado.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <p className="text-xs text-muted-foreground">Peajes</p>
                      <p className="font-semibold">${costosEstimados.peajes_estimados.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="text-xs text-muted-foreground">Conductor</p>
                      <p className="font-semibold">${costosEstimados.salario_conductor_estimado.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <p className="text-xs text-muted-foreground">Otros</p>
                      <p className="font-semibold">${(costosEstimados.mantenimiento_estimado + costosEstimados.otros_costos_estimados).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded mb-4">
                    <span className="font-medium">Costo Total Estimado:</span>
                    <span className="font-bold text-lg">${costosEstimados.costo_total_estimado.toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        Precio Sugerido (25% margen)
                      </Label>
                      <div className="text-xl font-bold text-green-600 mt-1">
                        ${precioSugerido.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="precio_cliente">Precio Cliente *</Label>
                      <Input
                        id="precio_cliente"
                        type="number"
                        min="0"
                        value={formData.precio_cliente_deseado || precioSugerido}
                        onChange={(e) => setFormData(prev => ({ ...prev, precio_cliente_deseado: Number(e.target.value) }))}
                        placeholder="Precio acordado con cliente"
                        required
                      />
                      {margenEstimado !== 0 && (
                        <div className="flex items-center gap-2">
                          <Badge variant={parseFloat(margenPorcentaje) >= 15 ? 'default' : 'destructive'}>
                            Margen: {margenPorcentaje}%
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            ${margenEstimado.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              placeholder="Detalles adicionales, condiciones especiales, etc."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Truck className="h-4 w-4 mr-2" />
              {loading ? 'Programando...' : 'Programar Viaje'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
