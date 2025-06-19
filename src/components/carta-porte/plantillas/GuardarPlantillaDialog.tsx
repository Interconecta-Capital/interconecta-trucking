import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { CartaPorteData } from '@/types/cartaPorte';

interface GuardarPlantillaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CartaPorteData;
  onSave: (name: string) => void;
}

export function GuardarPlantillaDialog({ open, onOpenChange, data, onSave }: GuardarPlantillaDialogProps) {
  const [name, setName] = useState('');
  const { toast } = useToast();

  const handleSave = () => {
    if (!name) {
      toast({
        title: "Error",
        description: "Por favor, introduce un nombre para la plantilla.",
        variant: "destructive",
      });
      return;
    }
    onSave(name);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Guardar como Plantilla</AlertDialogTitle>
          <AlertDialogDescription>
            Introduce un nombre para guardar la configuración actual como plantilla.
            <br />
            <br />
            Resumen de la configuración:
            <br />
            {data.rfcEmisor && (
              <p className="text-sm text-gray-600">
                Emisor: {data.nombreEmisor} ({data.rfcEmisor})
              </p>
            )}
            {data.rfcReceptor && (
              <p className="text-sm text-gray-600">
                Receptor: {data.nombreReceptor} ({data.rfcReceptor})
              </p>
            )}
            {data.autotransporte && (
              <p className="text-sm text-gray-600">
                Vehículo: {data.autotransporte.placa_vm}
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="name">Nombre de la plantilla</Label>
          <Input
            id="name"
            placeholder="Nombre de la plantilla"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleSave}>Guardar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
