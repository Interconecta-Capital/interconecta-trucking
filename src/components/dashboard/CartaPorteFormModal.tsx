
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ModernCartaPorteEditor } from '@/components/carta-porte/editor/ModernCartaPorteEditor';
import { X, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';
import { useTrialManager } from '@/hooks/useTrialManager';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CartaPorteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartaPorteFormModal({ open, onOpenChange }: CartaPorteFormModalProps) {
  const { isSuperuser, hasFullAccess } = useEnhancedPermissions();
  const { getContextualMessage } = useTrialManager();

  // Si no es superuser y no tiene acceso completo, no mostrar el modal
  if (!isSuperuser && !hasFullAccess) {
    console.log('❌ CartaPorteFormModal blocked - no access');
    return null;
  }

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
        
        {!hasFullAccess && !isSuperuser ? (
          <div className="p-6">
            <Alert className="border-red-200 bg-red-50">
              <Lock className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {getContextualMessage()}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <ModernCartaPorteEditor />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
