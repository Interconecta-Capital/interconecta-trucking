
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileImage, Download, CheckCircle, Loader2, Eye } from 'lucide-react';

interface PDFSectionProps {
  isGeneratingPDF: boolean;
  pdfUrl: string | null;
  onGenerarPDF: () => void;
  onVisualizarPDF: () => void;
  onDescargarPDF: () => void;
}

export function PDFSection({ 
  isGeneratingPDF, 
  pdfUrl, 
  onGenerarPDF, 
  onVisualizarPDF, 
  onDescargarPDF 
}: PDFSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center space-x-2">
        <FileImage className="h-4 w-4" />
        <span>Representación Impresa PDF</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={onGenerarPDF}
          disabled={isGeneratingPDF}
          variant="outline"
          className="flex items-center space-x-2"
        >
          {isGeneratingPDF ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileImage className="h-4 w-4" />
          )}
          <span>{isGeneratingPDF ? 'Generando...' : 'Generar PDF'}</span>
        </Button>
        
        {pdfUrl && (
          <>
            <Button
              onClick={onVisualizarPDF}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>Previsualizar</span>
            </Button>
            
            <Button
              onClick={onDescargarPDF}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Descargar PDF</span>
            </Button>
          </>
        )}
      </div>
      
      {pdfUrl && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Representación impresa PDF generada correctamente
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
