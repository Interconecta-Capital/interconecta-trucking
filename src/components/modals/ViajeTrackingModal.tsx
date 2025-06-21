
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Truck, MapPin, Edit, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { useViajesEstados, Viaje } from '@/hooks/useViajesEstados';
import { EstadosViajeManager } from '@/components/viajes/estados/EstadosViajeManager';
import { TrackingViajeRealTime } from '@/components/viajes/tracking/TrackingViajeRealTime';
import { ViajeEditor } from '@/components/viajes/editor/ViajeEditor';

interface ViajeTrackingModalProps {
  viaje: Viaje | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViajeTrackingModal = ({ viaje, open, onOpenChange }: ViajeTrackingModalProps) => {
  const [activeTab, setActiveTab] = useState('tracking');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viajeData, setViajeData] = useState<Viaje | null>(viaje);

  useEffect(() => {
    setViajeData(viaje);
    // Reset tab when opening new viaje
    if (viaje) {
      setActiveTab('tracking');
    }
  }, [viaje]);

  const handleViajeUpdate = () => {
    // Trigger refetch of viaje data
    console.log('Viaje updated, should refetch data');
    // In a real implementation, you would refetch the viaje data here
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!viajeData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`max-w-6xl ${isFullscreen ? 'fixed inset-4 max-w-none w-auto h-auto' : 'max-h-[90vh]'} overflow-hidden`}
      >
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Gestión de Viaje - {viajeData.carta_porte_id}
            </DialogTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleToggleFullscreen}
            >
              {isFullscreen ? 
                <Minimize2 className="h-4 w-4" /> : 
                <Maximize2 className="h-4 w-4" />
              }
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Tracking
            </TabsTrigger>
            <TabsTrigger value="estados" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Estados
            </TabsTrigger>
            <TabsTrigger value="editar" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Editar
            </TabsTrigger>
          </TabsList>

          <div className={`mt-6 ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'max-h-[70vh]'} overflow-y-auto`}>
            <TabsContent value="tracking" className="mt-0">
              <TrackingViajeRealTime 
                viaje={viajeData}
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
              />
            </TabsContent>

            <TabsContent value="estados" className="mt-0">
              <EstadosViajeManager 
                viaje={viajeData}
                onViajeUpdate={handleViajeUpdate}
              />
            </TabsContent>

            <TabsContent value="editar" className="mt-0">
              <ViajeEditor 
                viaje={viajeData}
                onViajeUpdate={handleViajeUpdate}
                onClose={() => onOpenChange(false)}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
