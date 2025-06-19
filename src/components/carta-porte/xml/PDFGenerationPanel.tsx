
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Loader2, CheckCircle } from 'lucide-react';
import { CartaPorteData } from '@/types/cartaPorte';
import { toast } from 'sonner';
import { CartaPortePDFService } from '@/services/CartaPortePDFService';

interface PDFGenerationPanelProps {
  cartaPorteData: CartaPorteData;
  xmlGenerado?: string | null;
  onPDFGenerated?: (pdfUrl: string) => void;
}

export function PDFGenerationPanel({ 
  cartaPorteData, 
  xmlGenerado,
  onPDFGenerated 
}: PDFGenerationPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const generatePDF = async () => {
    if (isGenerating) return;

    const cartaPorteId = cartaPorteData.cartaPorteId || cartaPorteData.idCCP;
    if (!cartaPorteId) {
      toast.error('ID de Carta Porte requerido para generar el PDF');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await CartaPortePDFService.generate(cartaPorteId);

      if (result.success && result.pdfUrl) {
        setPdfUrl(result.pdfUrl);
        onPDFGenerated?.(result.pdfUrl);
        toast.success('PDF generado correctamente');
      } else {
        throw new Error(result.error || 'PDF no generado');
      }
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      toast.error('Error al generar el PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!pdfUrl) return;
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `carta-porte-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('PDF descargado');
  };

  const previewPDF = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <Card className="border-purple-200 bg-purple-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-800">
            <FileText className="h-5 w-5" />
            <span>Generación de PDF</span>
          </div>
          {pdfUrl && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Disponible
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={generatePDF}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {isGenerating ? 'Generando...' : 'Generar PDF'}
          </Button>
          
          {pdfUrl && (
            <>
              <Button
                variant="outline"
                onClick={previewPDF}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Previsualizar
              </Button>
              
              <Button
                variant="outline"
                onClick={downloadPDF}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar
              </Button>
            </>
          )}
        </div>

        <div className="text-xs text-gray-600 bg-white p-3 rounded border">
          <strong>Representación Impresa:</strong> Este PDF contiene una representación 
          visual de la Carta Porte con todos los datos capturados en el formulario.
        </div>
      </CardContent>
    </Card>
  );
}
