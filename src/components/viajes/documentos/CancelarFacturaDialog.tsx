// ============================================
// FASE 7: Diálogo de Cancelación de Factura
// ISO 27001 A.12.4: Auditoría y registro
// ============================================

import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Ban, AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

// Motivos de cancelación según Anexo 20 del SAT
const MOTIVOS_CANCELACION = {
  '01': 'Comprobantes emitidos con errores con relación',
  '02': 'Comprobantes emitidos con errores sin relación',
  '03': 'No se llevó a cabo la operación',
  '04': 'Operación nominativa relacionada en la factura global'
};

interface CancelarFacturaDialogProps {
  open: boolean;
  onClose: () => void;
  facturaData: any;
  onConfirm: (motivo: string, detalles: string) => Promise<void>;
  isCancelling: boolean;
}

export function CancelarFacturaDialog({
  open,
  onClose,
  facturaData,
  onConfirm,
  isCancelling
}: CancelarFacturaDialogProps) {
  const [motivo, setMotivo] = useState('02');
  const [detalles, setDetalles] = useState('');

  const handleConfirm = async () => {
    if (!detalles.trim()) {
      return;
    }
    await onConfirm(motivo, detalles);
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <Ban className="h-5 w-5 text-red-600" />
            Cancelar Factura
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Información de la factura - ISO 27001 A.18.1.4 */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-semibold text-red-800 mb-2">Factura a cancelar:</p>
            <div className="space-y-1 text-sm text-red-700">
              <p><strong>Serie-Folio:</strong> {facturaData?.serie || 'N/A'}-{facturaData?.folio || 'N/A'}</p>
              {facturaData?.uuid_fiscal && (
                <p className="font-mono text-xs"><strong>UUID:</strong> {facturaData.uuid_fiscal}</p>
              )}
              <p><strong>Total:</strong> ${facturaData?.total?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '0.00'} MXN</p>
            </div>
          </div>

          {/* Motivo de cancelación - ISO 27001 A.12.4.1 */}
          <div className="space-y-2">
            <Label>Motivo de Cancelación (SAT) *</Label>
            <Select value={motivo} onValueChange={setMotivo} disabled={isCancelling}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MOTIVOS_CANCELACION).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {key} - {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Este motivo se enviará al SAT según el Anexo 20
            </p>
          </div>

          {/* Detalles adicionales */}
          <div className="space-y-2">
            <Label>Detalles Adicionales (Interno) *</Label>
            <Textarea
              placeholder="Explique el motivo de la cancelación para registros internos...&#10;&#10;Ej: Error en los datos del cliente, corrección de importes, etc."
              value={detalles}
              onChange={(e) => setDetalles(e.target.value)}
              rows={4}
              disabled={isCancelling}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Estos detalles se registrarán en el historial del viaje y <strong>NO</strong> se enviarán al SAT
            </p>
          </div>

          {/* Advertencia - ISO 27001 A.16.1.7 */}
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-red-800 space-y-2">
              <p><strong>⚠️ Advertencia:</strong> La cancelación es <strong>irreversible</strong>.</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>El conductor asignado quedará automáticamente disponible</li>
                <li>Se notificará al SAT de la cancelación</li>
                <li>Este evento quedará registrado en auditoría</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isCancelling}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            variant="destructive"
            onClick={handleConfirm}
            disabled={isCancelling || !detalles.trim()}
          >
            {isCancelling ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Cancelando...
              </>
            ) : (
              <>
                <Ban className="h-4 w-4 mr-2" />
                Confirmar Cancelación
              </>
            )}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
