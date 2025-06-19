
import React from 'react';
import { Button } from '@/components/ui/button';
import { Package, Plus, Upload } from 'lucide-react';

interface MercanciasEmptyStateProps {
  onAddMercancia: () => void;
  onShowUploadDialog: () => void;
}

export function MercanciasEmptyState({ 
  onAddMercancia, 
  onShowUploadDialog 
}: MercanciasEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground mb-4">
        No hay mercancías agregadas. Agrega mercancías manualmente o importa desde un documento.
      </p>
      <div className="flex gap-2 justify-center">
        <Button variant="outline" onClick={onShowUploadDialog}>
          <Upload className="h-4 w-4 mr-2" />
          Importar Documento
        </Button>
        <Button onClick={onAddMercancia}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Manualmente
        </Button>
      </div>
    </div>
  );
}
