
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';
import { ViajeCompleto } from '@/hooks/useViajesCompletos';
import { TrackingViajeRealTime } from '@/components/viajes/tracking/TrackingViajeRealTime';

interface ViajeTrackingModalProps {
  viaje: ViajeCompleto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViajeTrackingModal = ({ viaje, open, onOpenChange }: ViajeTrackingModalProps) => {
  if (!viaje) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Tracking - {viaje.carta_porte_id}
          </DialogTitle>
        </DialogHeader>
        
        <TrackingViajeRealTime viaje={viaje} />

        <div className="flex gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
