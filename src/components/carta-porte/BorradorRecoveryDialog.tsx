
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, RefreshCw, Trash2 } from 'lucide-react';
import { CartaPorteData } from '@/types/cartaPorte';

interface BorradorRecoveryDialogProps {
  open: boolean;
  borradorData: CartaPorteData | null;
  onAccept: () => void;
  onReject: () => void;
}

export function BorradorRecoveryDialog({
  open,
  borradorData,
  onAccept,
  onReject
}: BorradorRecoveryDialogProps) {
  if (!borradorData) return null;

  const getDataSummary = () => {
    const summary = [];
    
    if (borradorData.rfcEmisor) summary.push(`Emisor: ${borradorData.rfcEmisor}`);
    if (borradorData.rfcReceptor) summary.push(`Receptor: ${borradorData.rfcReceptor}`);
    if (borradorData.ubicaciones?.length) summary.push(`${borradorData.ubicaciones.length} ubicaciones`);
    if (borradorData.mercancias?.length) summary.push(`${borradorData.mercancias.length} mercancías`);
    if (borradorData.autotransporte?.placa_vm) summary.push(`Vehículo: ${borradorData.autotransporte.placa_vm}`);
    if (borradorData.figuras?.length) summary.push(`${borradorData.figuras.length} figuras`);
    
    return summary;
  };

  const dataSummary = getDataSummary();

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Borrador Encontrado
          </DialogTitle>
          <DialogDescription>
            Se encontró un borrador de carta porte con datos no guardados. ¿Qué deseas hacer?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Datos encontrados:</p>
                <ul className="text-sm space-y-1">
                  {dataSummary.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-current rounded-full"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onReject}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Descartar y Empezar Nuevo
          </Button>
          <Button
            onClick={onAccept}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Continuar con Borrador
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
