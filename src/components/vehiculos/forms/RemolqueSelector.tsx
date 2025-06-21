
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';
import { useRemolques } from '@/hooks/useRemolques';
import { Plus, Truck } from 'lucide-react';

interface RemolqueSelectorProps {
  vehiculoId?: string;
  onRemolqueChange?: (remolqueId: string | null) => void;
}

export function RemolqueSelector({ vehiculoId, onRemolqueChange }: RemolqueSelectorProps) {
  const { 
    remolquesDisponibles, 
    crearRemolque, 
    asignarRemolque,
    isCreating,
    isAssigning 
  } = useRemolques();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRemolqueData, setNewRemolqueData] = useState({
    placa: '',
    subtipo_rem: ''
  });

  const handleCreateRemolque = async () => {
    if (!newRemolqueData.placa.trim() || !newRemolqueData.subtipo_rem) {
      return;
    }

    const remolqueToCreate = {
      ...newRemolqueData,
      autotransporte_id: vehiculoId || undefined
    };

    crearRemolque(remolqueToCreate);
    setShowCreateDialog(false);
    setNewRemolqueData({ placa: '', subtipo_rem: '' });
  };

  const handleSelectRemolque = (remolqueId: string) => {
    if (remolqueId === 'sin-remolque') {
      onRemolqueChange?.(null);
      return;
    }

    if (remolqueId === 'crear-nuevo') {
      setShowCreateDialog(true);
      return;
    }

    if (vehiculoId) {
      asignarRemolque({ remolqueId, autotransporteId: vehiculoId });
    }
    onRemolqueChange?.(remolqueId);
  };

  return (
    <div className="space-y-2">
      <Label>Remolque Asociado</Label>
      <div className="flex gap-2">
        <Select onValueChange={handleSelectRemolque}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Seleccionar remolque..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sin-remolque">Sin remolque</SelectItem>
            <SelectItem value="crear-nuevo">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Crear nuevo remolque
              </div>
            </SelectItem>
            {remolquesDisponibles.map((remolque) => (
              <SelectItem key={remolque.id} value={remolque.id}>
                {remolque.placa} - {remolque.subtipo_rem}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Crear Nuevo Remolque
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Placa del Remolque</Label>
              <Input
                value={newRemolqueData.placa}
                onChange={(e) => setNewRemolqueData(prev => ({ 
                  ...prev, 
                  placa: e.target.value.toUpperCase() 
                }))}
                placeholder="Ej: REM-123"
                maxLength={10}
              />
            </div>
            
            <CatalogoSelectorMejorado
              tipo="remolques"
              label="Subtipo de Remolque"
              value={newRemolqueData.subtipo_rem}
              onValueChange={(value) => setNewRemolqueData(prev => ({ 
                ...prev, 
                subtipo_rem: value 
              }))}
              placeholder="Seleccionar subtipo..."
            />
            
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateRemolque}
                disabled={!newRemolqueData.placa.trim() || !newRemolqueData.subtipo_rem || isCreating}
                className="flex-1"
              >
                {isCreating ? 'Creando...' : 'Crear Remolque'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
