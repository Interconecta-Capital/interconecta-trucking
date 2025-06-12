
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, CheckCircle, Loader2 } from 'lucide-react';

interface XMLSectionProps {
  isGenerating: boolean;
  xmlGenerado: string | null;
  onGenerarXML: () => void;
  onDescargarXML: () => void;
}

export function XMLSection({ 
  isGenerating, 
  xmlGenerado, 
  onGenerarXML, 
  onDescargarXML 
}: XMLSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center space-x-2">
        <FileText className="h-4 w-4" />
        <span>Generación XML CCP 3.1</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={onGenerarXML}
          disabled={isGenerating}
          className="flex items-center space-x-2"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          <span>{isGenerating ? 'Generando...' : 'Generar XML'}</span>
        </Button>
        
        {xmlGenerado && (
          <Button
            variant="outline"
            onClick={onDescargarXML}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Descargar XML</span>
          </Button>
        )}
      </div>
      
      {xmlGenerado && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            XML generado correctamente según especificaciones SAT CCP 3.1
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
