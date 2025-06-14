
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';
import { X } from 'lucide-react';

interface RemolqueFormProps {
  remolque: any;
  index: number;
  onChange: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
}

export function RemolqueForm({ remolque, index, onChange, onRemove }: RemolqueFormProps) {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Remolque {index + 1}</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onRemove(index)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Placa del Remolque</Label>
          <Input
            value={remolque.placa || ''}
            onChange={(e) => onChange(index, 'placa', e.target.value)}
            placeholder="ABC-123"
          />
        </div>
        
        <CatalogoSelectorMejorado
          tipo="remolques"
          label="Subtipo de Remolque"
          value={remolque.subtipo_rem || ''}
          onValueChange={(value) => onChange(index, 'subtipo_rem', value)}
          placeholder="Seleccionar subtipo..."
        />
      </div>
    </div>
  );
}
