
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Eye } from 'lucide-react';

interface XMLPreviewSectionProps {
  xmlGenerado: string | null;
}

export function XMLPreviewSection({ xmlGenerado }: XMLPreviewSectionProps) {
  if (!xmlGenerado) return null;

  return (
    <>
      <Separator />
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center space-x-2">
          <Eye className="h-4 w-4" />
          <span>Vista Previa XML</span>
        </h3>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-xs overflow-x-auto max-h-64 whitespace-pre-wrap">
            {xmlGenerado.substring(0, 1000)}
            {xmlGenerado.length > 1000 && '...'}
          </pre>
        </div>
      </div>
    </>
  );
}
