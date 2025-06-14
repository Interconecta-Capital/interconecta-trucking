
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { RemolqueForm } from './RemolqueForm';

interface RemolquesFormProps {
  remolques: any[];
  onChange: (remolques: any[]) => void;
}

export function RemolquesForm({ remolques, onChange }: RemolquesFormProps) {
  const handleAddRemolque = () => {
    const newRemolque = {
      placa: '',
      subtipo_rem: ''
    };
    onChange([...remolques, newRemolque]);
  };

  const handleRemolqueChange = (index: number, field: string, value: any) => {
    const updatedRemolques = [...remolques];
    updatedRemolques[index] = { ...updatedRemolques[index], [field]: value };
    onChange(updatedRemolques);
  };

  const handleRemoveRemolque = (index: number) => {
    const updatedRemolques = remolques.filter((_, i) => i !== index);
    onChange(updatedRemolques);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Remolques</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddRemolque}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Remolque
        </Button>
      </div>
      
      {remolques.map((remolque, index) => (
        <RemolqueForm
          key={index}
          remolque={remolque}
          index={index}
          onChange={handleRemolqueChange}
          onRemove={handleRemoveRemolque}
        />
      ))}
    </div>
  );
}
