
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { XMLPreviewDialog } from '../../XMLPreviewDialog';

interface XMLPreviewSectionProps {
  xmlGenerado: string | null;
}

export function XMLPreviewSection({ xmlGenerado }: XMLPreviewSectionProps) {
  const [showPreview, setShowPreview] = useState(false);

  if (!xmlGenerado) return null;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Vista Previa XML</span>
          </h3>
          
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>Ver XML Completo</span>
          </Button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-xs overflow-x-auto max-h-32 whitespace-pre-wrap">
            {xmlGenerado.substring(0, 500)}
            {xmlGenerado.length > 500 && '...'}
          </pre>
        </div>
      </div>

      <XMLPreviewDialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        xmlContent={xmlGenerado}
      />
    </>
  );
}
