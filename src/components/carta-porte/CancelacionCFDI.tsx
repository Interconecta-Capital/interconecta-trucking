
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, X } from 'lucide-react';
import { useCancelacionCFDI } from '@/hooks/useCancelacionCFDI';

interface CancelacionCFDIProps {
  uuid: string;
  folio: string;
  onCancel?: () => void;
}

const motivosCancelacion = [
  { value: '01', label: '01 - Comprobante emitido con errores con relación' },
  { value: '02', label: '02 - Comprobante emitido con errores sin relación' },
  { value: '03', label: '03 - No se llevó a cabo la operación' },
  { value: '04', label: '04 - Operación nominativa relacionada en una factura global' }
];

export const CancelacionCFDI = ({ uuid, folio, onCancel }: CancelacionCFDIProps) => {
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [folioSustitucion, setFolioSustitucion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  
  const { cancelarCFDI, isCancelling } = useCancelacionCFDI();

  const handleCancel = () => {
    if (!motivo) {
      return;
    }

    cancelarCFDI({
      uuid,
      motivo,
      folioSustitucion: folioSustitucion || undefined
    });

    setOpen(false);
    onCancel?.();
  };

  const requiresFolioSustitucion = motivo === '01';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <X className="h-4 w-4 mr-1" />
          Cancelar CFDI
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Cancelar CFDI
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              <strong>Advertencia:</strong> Esta acción cancelará permanentemente el CFDI.
              Una vez cancelado, no se puede revertir.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">CFDI a Cancelar</Label>
            <div className="bg-gray-50 p-3 rounded border">
              <p className="text-sm"><strong>Folio:</strong> {folio}</p>
              <p className="text-xs text-gray-600 mt-1 font-mono">{uuid}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo" className="text-sm font-medium">
              Motivo de Cancelación *
            </Label>
            <Select value={motivo} onValueChange={setMotivo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el motivo de cancelación" />
              </SelectTrigger>
              <SelectContent>
                {motivosCancelacion.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {requiresFolioSustitucion && (
            <div className="space-y-2">
              <Label htmlFor="folioSustitucion" className="text-sm font-medium">
                Folio de Sustitución *
              </Label>
              <Input
                id="folioSustitucion"
                value={folioSustitucion}
                onChange={(e) => setFolioSustitucion(e.target.value)}
                placeholder="UUID del CFDI que sustituye a este"
              />
              <p className="text-xs text-gray-600">
                Requerido cuando el motivo es "Comprobante emitido con errores con relación"
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="observaciones" className="text-sm font-medium">
              Observaciones (Opcional)
            </Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Observaciones adicionales sobre la cancelación"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancel}
              disabled={!motivo || (requiresFolioSustitucion && !folioSustitucion) || isCancelling}
              className="flex-1"
            >
              {isCancelling ? 'Cancelando...' : 'Confirmar Cancelación'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
