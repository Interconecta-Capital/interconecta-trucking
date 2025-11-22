import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Receipt, Building2, User, Zap, X, Info, 
  Package, AlertTriangle, FileText, Ban 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TimbradoValidationErrors } from './TimbradoValidationErrors';
import { validateFacturaForTimbrado, parseSatError } from '@/utils/timbradoValidation';

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
    uuid_fiscal?: string | null;
  };
  viajeData?: {
    tipo_servicio?: string;
  };
  onTimbrar: (updatedData: { moneda: string; forma_pago: string; metodo_pago: string }) => Promise<void>;
  onCancelar?: () => Promise<void>;
  isTimbrando?: boolean;
  isCancelling?: boolean;
}

export function FacturaPreviewModal({
  open,
  onOpenChange,
  facturaData,
  viajeData,
  onTimbrar,
  onCancelar,
  isTimbrando = false,
  isCancelling = false
}: FacturaPreviewModalProps) {
  // Estados locales para campos editables
  const [moneda, setMoneda] = useState(facturaData.moneda || 'MXN');
  const [formaPago, setFormaPago] = useState(facturaData.forma_pago || '01');
  const [metodoPago, setMetodoPago] = useState(facturaData.metodo_pago || 'PUE');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [satError, setSatError] = useState<any>(null);

  // Validaciones de datos seguros
  const formatCurrency = (amount?: number | null) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: moneda
    }).format(amount || 0);
  };

  const formatSafeDate = (dateString?: string | null) => {
    if (!dateString) return 'Sin fecha';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return format(date, "dd/MM/yyyy", { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const handleTimbrar = async () => {
    // Limpiar errores previos
    setValidationErrors([]);
    setSatError(null);

    // Validar antes de timbrar
    const errors = validateFacturaForTimbrado(facturaData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await onTimbrar({ moneda, forma_pago: formaPago, metodo_pago: metodoPago });
    } catch (error: any) {
      // Parsear error del SAT si existe
      if (error?.message || error?.details) {
        setSatError(parseSatError(error));
      }
      throw error; // Re-lanzar para que el componente padre también lo maneje
    }
  };

  const handleCancelar = async () => {
    setShowCancelDialog(false);
    if (onCancelar) {
      await onCancelar();
    }
  };

  const esFletePageado = viajeData?.tipo_servicio === 'flete_pagado';
  const esTipoIngreso = facturaData.tipo_comprobante === 'I';
  const subtotal = facturaData.subtotal || 0;
  const total = facturaData.total || 0;
  const iva = facturaData.total_impuestos_trasladados || (total - subtotal);
  const isTimbrada = facturaData.status === 'timbrado';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              {isTimbrada ? 'Factura Timbrada' : 'Pre-visualización de Factura - Borrador'}
            </DialogTitle>
            <DialogDescription>
              {isTimbrada 
                ? 'Esta factura ya está timbrada. Puedes cancelarla si es necesario.'
                : 'Revisa los datos antes de timbrar. Esta acción no se puede deshacer.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Errores de validación y del SAT */}
            <TimbradoValidationErrors 
              errors={validationErrors}
              satError={satError}
            />

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
                      {formatSafeDate(facturaData.fecha_expedicion)}
                    </span>
                  </div>
                  {isTimbrada ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Moneda:</span>
                      <span className="font-medium">{moneda}</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Label htmlFor="moneda" className="text-xs text-muted-foreground">Moneda</Label>
                      <Select value={moneda} onValueChange={setMoneda}>
                        <SelectTrigger id="moneda" className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                          <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {esTipoIngreso && (
                    <>
                      {isTimbrada ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Forma Pago:</span>
                            <span className="font-medium">{formaPago}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Método:</span>
                            <span className="font-medium">{metodoPago}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <Label htmlFor="forma-pago" className="text-xs text-muted-foreground">Forma Pago</Label>
                            <Select value={formaPago} onValueChange={setFormaPago}>
                              <SelectTrigger id="forma-pago" className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="01">01 - Efectivo</SelectItem>
                                <SelectItem value="02">02 - Cheque</SelectItem>
                                <SelectItem value="03">03 - Transferencia</SelectItem>
                                <SelectItem value="04">04 - Tarjeta de Crédito</SelectItem>
                                <SelectItem value="28">28 - Tarjeta de Débito</SelectItem>
                                <SelectItem value="99">99 - Por definir</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="metodo-pago" className="text-xs text-muted-foreground">Método</Label>
                            <Select value={metodoPago} onValueChange={setMetodoPago}>
                              <SelectTrigger id="metodo-pago" className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PUE">PUE - Pago en una sola exhibición</SelectItem>
                                <SelectItem value="PPD">PPD - Pago en parcialidades o diferido</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
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
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
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
                      {formatCurrency(total)}
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
                  <p className="font-medium">{facturaData.nombre_emisor || 'Sin nombre'}</p>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RFC:</span>
                      <span className="font-mono">{facturaData.rfc_emisor || 'Sin RFC'}</span>
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
                  <p className="font-medium">{facturaData.nombre_receptor || 'Sin nombre'}</p>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RFC:</span>
                      <span className="font-mono">{facturaData.rfc_receptor || 'Sin RFC'}</span>
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
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Advertencia Final o Info de Timbrado */}
            {isTimbrada ? (
              <Alert className="border-green-500 bg-green-50">
                <Info className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-sm">
                  <strong>Factura Timbrada:</strong> UUID: {facturaData.uuid_fiscal || 'N/A'}
                  <br />
                  Esta factura ya está certificada ante el SAT. Solo puede cancelarse según las reglas fiscales.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-yellow-500 bg-yellow-50">
                <Info className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 text-sm">
                  <strong>Importante:</strong> Una vez timbrada, esta factura no podrá editarse. 
                  Solo podrás cancelarla según las reglas del SAT. Verifica que todos los datos sean correctos.
                </AlertDescription>
              </Alert>
            )}

            {/* Botones de Acción */}
            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isTimbrando || isCancelling}
              >
                <X className="h-4 w-4 mr-2" />
                Cerrar
              </Button>
              {isTimbrada ? (
                onCancelar && (
                  <Button
                    onClick={() => setShowCancelDialog(true)}
                    disabled={isCancelling}
                    variant="destructive"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    {isCancelling ? 'Cancelando...' : 'Cancelar Factura'}
                  </Button>
                )
              ) : (
                <Button
                  onClick={handleTimbrar}
                  disabled={isTimbrando}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {isTimbrando ? 'Timbrando...' : 'Timbrar Factura'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmación de Cancelación */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              ¿Cancelar Factura?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Estás a punto de <strong>cancelar esta factura</strong> ante el SAT. 
                Esta acción es permanente y no se puede deshacer.
              </p>
              <p className="text-sm">
                <strong>Datos de la factura:</strong>
              </p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Serie-Folio: {facturaData.serie}-{facturaData.folio}</li>
                <li>UUID: {facturaData.uuid_fiscal}</li>
                <li>Total: {formatCurrency(total)}</li>
                <li>Receptor: {facturaData.nombre_receptor}</li>
              </ul>
              <p className="text-sm font-semibold text-destructive mt-3">
                ⚠️ La cancelación será reportada al SAT y al cliente receptor.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              No, mantener activa
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelar}
              disabled={isCancelling}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isCancelling ? 'Cancelando...' : 'Sí, cancelar factura'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
