
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CartaPorteForm } from '@/components/carta-porte/CartaPorteForm';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartaPorteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartaPorteFormModal({ open, onOpenChange }: CartaPorteFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Nueva Carta Porte</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="p-6 pt-0">
          <CartaPorteForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
