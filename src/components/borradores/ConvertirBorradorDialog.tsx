
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { BorradorCartaPorte } from '@/types/cartaPorteLifecycle';

interface ConvertirBorradorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  borrador: BorradorCartaPorte | null;
  onConfirmar: (nombreDocumento: string, validarDatos: boolean) => void;
}

export function ConvertirBorradorDialog({
  open,
  onOpenChange,
  borrador,
  onConfirmar
}: ConvertirBorradorDialogProps) {
  const [nombreDocumento, setNombreDocumento] = useState('');
  const [validarDatos, setValidarDatos] = useState(true);

  React.useEffect(() => {
    if (borrador && open) {
      setNombreDocumento(borrador.nombre_borrador);
    }
  }, [borrador, open]);

  const handleConfirmar = () => {
    onConfirmar(nombreDocumento, validarDatos);
    setNombreDocumento('');
    setValidarDatos(true);
  };

  if (!borrador) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convertir a Carta Porte</DialogTitle>
          <DialogDescription>
            El borrador se convertirá en una Carta Porte oficial con un IdCCP único.
            Este proceso no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre del documento</Label>
            <Input
              id="nombre"
              value={nombreDocumento}
              onChange={(e) => setNombreDocumento(e.target.value)}
              placeholder="Ingresa el nombre del documento"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="validar"
              checked={validarDatos}
              onCheckedChange={(checked) => setValidarDatos(checked === true)}
            />
            <Label htmlFor="validar" className="text-sm">
              Validar completitud de datos antes de convertir
            </Label>
          </div>

          <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
            <p><strong>Borrador:</strong> {borrador.nombre_borrador}</p>
            <p><strong>Última edición:</strong> {new Date(borrador.ultima_edicion).toLocaleString()}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmar}
            disabled={!nombreDocumento.trim()}
          >
            Convertir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
