
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Loader2, CheckCircle } from 'lucide-react';
import { CartaPorteData } from '@/types/cartaPorte';
import { toast } from 'sonner';
import { useEnhancedPDFGenerator } from '@/hooks/carta-porte/useEnhancedPDFGenerator';

interface PDFGenerationPanelProps {
  cartaPorteData: CartaPorteData;
  xmlGenerado?: string | null;
  onPDFGenerated?: (pdfUrl: string) => void;
  datosRuta?: { distanciaTotal?: number; tiempoEstimado?: number };
}

export function PDFGenerationPanel({ 
  cartaPorteData, 
  xmlGenerado,
  onPDFGenerated,
  datosRuta
}: PDFGenerationPanelProps) {
  const { isGenerating, pdfData, generateCompletePDF } = useEnhancedPDFGenerator();

  const handleGeneratePDF = async () => {
    if (isGenerating) return;
    
    try {
      console.log('📄 Iniciando generación de PDF profesional...');
      
      const result = await generateCompletePDF(cartaPorteData, datosRuta);
      
      if (result && result.url) {
        if (onPDFGenerated) {
          onPDFGenerated(result.url);
        }
        toast.success('PDF profesional generado correctamente');
      }
      
    } catch (error) {
      console.error('❌ Error generando PDF profesional:', error);
      toast.error('Error al generar el PDF profesional');
    }
  };

  const downloadPDF = () => {
    if (!pdfData.url || !pdfData.blob) return;
    
    const link = document.createElement('a');
    link.href = pdfData.url;
    link.download = `carta-porte-profesional-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('PDF profesional descargado');
  };

  const previewPDF = () => {
    if (pdfData.url) {
      window.open(pdfData.url, '_blank');
    }
  };

  return (
    <Card className="border-purple-200 bg-purple-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-800">
            <FileText className="h-5 w-5" />
            <span>Generación de PDF Profesional</span>
          </div>
          {pdfData.url && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Disponible ({pdfData.pages} páginas)
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={handleGeneratePDF}
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
          
          {pdfData.url && (
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
          <strong>PDF Profesional:</strong> Este PDF utiliza un diseño profesional con 
          los colores corporativos de Interconecta, tipografías modernas y un layout 
          optimizado que incluye todos los datos fiscales y de trazabilidad.
          {datosRuta?.distanciaTotal && (
            <span className="block mt-1 text-blue-600">
              ✓ Incluye distancia calculada automáticamente: {datosRuta.distanciaTotal} km
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
