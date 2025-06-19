
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ModernCartaPorteEditor } from '@/components/carta-porte/editor/ModernCartaPorteEditor';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartaPorteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartaPorteFormModal({ open, onOpenChange }: CartaPorteFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0">
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
        <div className="flex-1 overflow-hidden">
          <ModernCartaPorteEditor />
        </div>
      </DialogContent>
    </Dialog>
  );
}
