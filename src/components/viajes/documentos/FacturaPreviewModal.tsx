import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Receipt, Building2, User, Zap, X, Info, 
  Package, AlertTriangle, FileText 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface FacturaPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facturaData: {
    id: string;
    serie: string | null;
    folio: string | null;
    rfc_emisor: string;
    nombre_emisor: string;
    regimen_fiscal_emisor: string | null;
    rfc_receptor: string;
    nombre_receptor: string;
    regimen_fiscal_receptor: string | null;
    uso_cfdi: string | null;
    subtotal: number;
    total: number;
    total_impuestos_trasladados?: number | null;
    status: 'draft' | 'timbrado';
    tiene_carta_porte: boolean;
    tipo_comprobante: string;
    fecha_expedicion: string;
    moneda: string | null;
    forma_pago?: string | null;
    metodo_pago?: string | null;
  };
  viajeData?: {
    tipo_servicio?: string;
  };
  onTimbrar: () => Promise<void>;
  isTimbrando?: boolean;
}

export function FacturaPreviewModal({
  open,
  onOpenChange,
  facturaData,
  viajeData,
  onTimbrar,
  isTimbrando = false
}: FacturaPreviewModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: facturaData.moneda || 'MXN'
    }).format(amount);
  };

  const esFletePageado = viajeData?.tipo_servicio === 'flete_pagado';
  const esTipoIngreso = facturaData.tipo_comprobante === 'I';
  const iva = facturaData.total_impuestos_trasladados || (facturaData.total - facturaData.subtotal);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Pre-visualización de Factura - Borrador
          </DialogTitle>
          <DialogDescription>
            Revisa los datos antes de timbrar. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Alertas importantes */}
          {esFletePageado && (
            <Alert className="border-amber-500 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Flete Pagado:</strong> La Carta Porte se timbrará después de esta factura.
              </AlertDescription>
            </Alert>
          )}

          {facturaData.tiene_carta_porte && (
            <Alert className="border-blue-500 bg-blue-50">
              <Package className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Esta factura incluye <strong>Complemento Carta Porte</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Información Fiscal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Datos Generales */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Datos del Comprobante
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serie-Folio:</span>
                  <span className="font-mono font-medium">
                    {facturaData.serie || 'N/A'}-{facturaData.folio || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <Badge variant="outline">
                    {esTipoIngreso ? 'Ingreso' : 'Traslado'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="font-medium">
                    {format(new Date(facturaData.fecha_expedicion), "dd/MM/yyyy", { locale: es })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Moneda:</span>
                  <span className="font-medium">{facturaData.moneda || 'MXN'}</span>
                </div>
                {esTipoIngreso && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Forma Pago:</span>
                      <span className="font-medium">{facturaData.forma_pago || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Método:</span>
                      <span className="font-medium">{facturaData.metodo_pago || 'N/A'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Importes */}
            <div className="space-y-3 p-4 border rounded-lg bg-gradient-to-br from-primary/5 to-primary/10">
              <h3 className="font-semibold text-sm">Importes</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(facturaData.subtotal)}</span>
                </div>
                {esTipoIngreso && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IVA (16%):</span>
                    <span className="font-medium">{formatCurrency(iva)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(facturaData.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Emisor y Receptor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emisor */}
            <div className="space-y-3 p-4 border rounded-lg">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                Emisor
              </h3>
              <div className="space-y-2">
                <p className="font-medium">{facturaData.nombre_emisor}</p>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RFC:</span>
                    <span className="font-mono">{facturaData.rfc_emisor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Régimen:</span>
                    <span className="text-xs">{facturaData.regimen_fiscal_emisor || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Receptor */}
            <div className="space-y-3 p-4 border rounded-lg">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-green-600" />
                Receptor
              </h3>
              <div className="space-y-2">
                <p className="font-medium">{facturaData.nombre_receptor}</p>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RFC:</span>
                    <span className="font-mono">{facturaData.rfc_receptor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Régimen:</span>
                    <span className="text-xs">{facturaData.regimen_fiscal_receptor || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uso CFDI:</span>
                    <span className="text-xs">{facturaData.uso_cfdi || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conceptos (simplificado) */}
          <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
            <h3 className="font-semibold text-sm">Conceptos</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descripción:</span>
                <span className="font-medium">
                  {esTipoIngreso ? 'Servicio de transporte de carga' : 'Traslado de mercancía'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Clave Prod/Serv:</span>
                <span className="font-mono text-xs">78101800</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cantidad:</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Importe:</span>
                <span className="font-medium">{formatCurrency(facturaData.subtotal)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Advertencia Final */}
          <Alert className="border-yellow-500 bg-yellow-50">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 text-sm">
              <strong>Importante:</strong> Una vez timbrada, esta factura no podrá editarse. 
              Solo podrás cancelarla según las reglas del SAT. Verifica que todos los datos sean correctos.
            </AlertDescription>
          </Alert>

          {/* Botones de Acción */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isTimbrando}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={onTimbrar}
              disabled={isTimbrando}
              className="bg-green-600 hover:bg-green-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isTimbrando ? 'Timbrando...' : 'Timbrar Factura'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
