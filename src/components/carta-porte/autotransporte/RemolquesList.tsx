
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Edit } from 'lucide-react';
import { RemolqueForm } from './RemolqueForm';
import { RemolqueData } from '@/hooks/useAutotransporte';

interface RemolquesListProps {
  remolques: RemolqueData[];
  onChange: (remolques: RemolqueData[]) => void;
}

export function RemolquesList({ remolques, onChange }: RemolquesListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddRemolque = (remolque: RemolqueData) => {
    const newRemolques = [...remolques, { ...remolque, id: Date.now().toString() }];
    onChange(newRemolques);
    setShowForm(false);
  };

  const handleEditRemolque = (remolque: RemolqueData) => {
    if (editingIndex !== null) {
      const newRemolques = [...remolques];
      newRemolques[editingIndex] = remolque;
      onChange(newRemolques);
      setEditingIndex(null);
    }
  };

  const handleDeleteRemolque = (index: number) => {
    const newRemolques = remolques.filter((_, i) => i !== index);
    onChange(newRemolques);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Remolques</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Agregar Remolque</span>
        </Button>
      </div>

      {remolques.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center text-muted-foreground">
            <p>No se han agregado remolques</p>
            <p className="text-sm">Los remolques son opcionales</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {remolques.map((remolque, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">Placa: {remolque.placa}</div>
                    <div className="text-sm text-muted-foreground">
                      Subtipo: {remolque.subtipo_rem}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(index)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRemolque(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <RemolqueForm
          remolque={editingIndex !== null ? remolques[editingIndex] : undefined}
          onSave={editingIndex !== null ? handleEditRemolque : handleAddRemolque}
          onCancel={cancelEdit}
        />
      )}
    </div>
  );
}
