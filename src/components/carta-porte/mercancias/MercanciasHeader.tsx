
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, Upload } from 'lucide-react';

interface MercanciasHeaderProps {
  showForm: boolean;
  onAddMercancia: () => void;
  onShowUploadDialog: () => void;
}

export function MercanciasHeader({ 
  showForm, 
  onAddMercancia, 
  onShowUploadDialog 
}: MercanciasHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Gestión de Mercancías</span>
        </CardTitle>
        
        {!showForm && (
          <div className="flex gap-2">
            <Button 
              type="button"
              variant="outline"
              onClick={onShowUploadDialog}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Importar desde Documento</span>
            </Button>
            
            <Button 
              type="button"
              onClick={onAddMercancia}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Mercancía</span>
            </Button>
          </div>
        )}
      </div>
    </CardHeader>
  );
}
