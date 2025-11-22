import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Info } from 'lucide-react';
import { ViajeWizardData } from '../ViajeWizard';
import { supabase } from '@/integrations/supabase/client';

interface ViajeWizardFacturaProps {
  data: ViajeWizardData;
  onChange: (data: Partial<ViajeWizardData>) => void;
}

export function ViajeWizardFactura({ data, onChange }: ViajeWizardFacturaProps) {
  const esFletePageado = data.tipoServicio === 'flete_pagado';

  // Auto-llenar serie y folio desde configuración empresarial
  useEffect(() => {
    const cargarConfiguracion = async () => {
      if (!esFletePageado || data.facturaData?.serie) return;

      try {
        const { data: config, error } = await supabase
          .from('configuracion_empresa')
          .select('serie_factura, folio_actual')
          .single();

        if (error) throw error;

        if (config) {
          const serieFactura = config.serie_factura || 'ZS';
          const folioSiguiente = config.folio_actual || 1;

          onChange({
            facturaData: {
              ...data.facturaData,
              serie: serieFactura,
              folio: String(folioSiguiente).padStart(3, '0')
            }
          });

          console.log(`📄 Serie y folio auto-asignados: ${serieFactura}-${folioSiguiente}`);
        }
      } catch (error) {
        console.error('Error cargando configuración:', error);
      }
    };

    cargarConfiguracion();
  }, [esFletePageado, data.facturaData?.serie, onChange]);

  if (!esFletePageado) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Facturación No Requerida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Este viaje es de tipo "Traslado Propio", por lo que solo se generará la Carta Porte (CFDI Tipo T).
              No es necesario capturar datos de facturación.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Este viaje es de tipo "Flete Pagado", se generará una Factura (CFDI Tipo I) con complemento Carta Porte.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Datos de Facturación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Serie y Folio - Auto-generados */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serie">Serie (Auto)</Label>
              <Input
                id="serie"
                value={data.facturaData?.serie || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Se asigna automáticamente desde configuración
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="folio">Folio (Auto)</Label>
              <Input
                id="folio"
                value={data.facturaData?.folio || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Se incrementa automáticamente
              </p>
            </div>
          </div>

          {/* Forma de Pago */}
          <div className="space-y-2">
            <Label htmlFor="formaPago">Forma de Pago</Label>
            <Select
              value={data.facturaData?.formaPago || '01'}
              onValueChange={(value) => onChange({
                facturaData: { ...data.facturaData, formaPago: value }
              })}
            >
              <SelectTrigger id="formaPago">
                <SelectValue placeholder="Seleccionar forma de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="01">01 - Efectivo</SelectItem>
                <SelectItem value="03">03 - Transferencia electrónica</SelectItem>
                <SelectItem value="04">04 - Tarjeta de crédito</SelectItem>
                <SelectItem value="28">28 - Tarjeta de débito</SelectItem>
                <SelectItem value="99">99 - Por definir</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Método de Pago */}
          <div className="space-y-2">
            <Label htmlFor="metodoPago">Método de Pago</Label>
            <Select
              value={data.facturaData?.metodoPago || 'PUE'}
              onValueChange={(value) => onChange({
                facturaData: { ...data.facturaData, metodoPago: value }
              })}
            >
              <SelectTrigger id="metodoPago">
                <SelectValue placeholder="Seleccionar método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUE">PUE - Pago en una sola exhibición</SelectItem>
                <SelectItem value="PPD">PPD - Pago en parcialidades o diferido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Uso CFDI */}
          <div className="space-y-2">
            <Label htmlFor="usoCfdi">Uso del CFDI</Label>
            <Select
              value={data.facturaData?.usoCfdi || 'G03'}
              onValueChange={(value) => onChange({
                facturaData: { ...data.facturaData, usoCfdi: value }
              })}
            >
              <SelectTrigger id="usoCfdi">
                <SelectValue placeholder="Seleccionar uso del CFDI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="G03">G03 - Gastos en general</SelectItem>
                <SelectItem value="G01">G01 - Adquisición de mercancías</SelectItem>
                <SelectItem value="D10">D10 - Pagos por servicios educativos</SelectItem>
                <SelectItem value="P01">P01 - Por definir</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conceptos - Precio del servicio */}
          <div className="space-y-2">
            <Label htmlFor="subtotal">Subtotal (sin IVA)</Label>
            <Input
              id="subtotal"
              type="number"
              step="0.01"
              placeholder="10000.00"
              value={data.facturaData?.subtotal || ''}
              onChange={(e) => {
                const subtotal = parseFloat(e.target.value) || 0;
                const iva = subtotal * 0.16;
                const total = subtotal + iva;
                onChange({
                  facturaData: { 
                    ...data.facturaData, 
                    subtotal,
                    iva,
                    total
                  }
                });
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>IVA (16%)</Label>
              <Input
                type="number"
                disabled
                value={(data.facturaData?.iva || 0).toFixed(2)}
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Total</Label>
              <Input
                type="number"
                disabled
                value={(data.facturaData?.total || 0).toFixed(2)}
                className="bg-muted font-bold"
              />
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (opcional)</Label>
            <Textarea
              id="observaciones"
              placeholder="Notas adicionales para la factura..."
              value={data.facturaData?.observaciones || ''}
              onChange={(e) => onChange({
                facturaData: { ...data.facturaData, observaciones: e.target.value }
              })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
