import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { usePDFGeneratorSW } from '@/hooks/carta-porte/usePDFGeneratorSW';
import { CartaPorteData } from '@/types/cartaPorte';
import { useEnhancedPDFGenerator } from '@/hooks/carta-porte/useEnhancedPDFGenerator';

interface PDFGenerationPanelProps {
  // Opción 1: Usar SmartWeb con IDs
  cartaPorteId?: string;
  facturaId?: string;
  
  // Opción 2: Usar generador local con data completa
  cartaPorteData?: CartaPorteData;
  datosRuta?: { distanciaTotal?: number; tiempoEstimado?: number };
  
  xmlGenerado?: string | null;
  onPDFGenerated?: (pdfUrl: string) => void;
}

export function PDFGenerationPanel({ 
  cartaPorteId,
  facturaId,
  cartaPorteData,
  datosRuta,
  xmlGenerado,
  onPDFGenerated
}: PDFGenerationPanelProps) {
  const useSW = !!(cartaPorteId || facturaId);
  const { isGenerating: isGeneratingSW, pdfUrl: pdfUrlSW, generatePDF: generatePDFSW, downloadPDF: downloadPDFSW } = usePDFGeneratorSW();
  const { isGenerating: isGeneratingLocal, pdfData: pdfDataLocal, generateCompletePDF } = useEnhancedPDFGenerator();

  const isGenerating = useSW ? isGeneratingSW : isGeneratingLocal;
  const pdfUrl = useSW ? pdfUrlSW : pdfDataLocal.url;

  const handleGeneratePDF = async () => {
    if (isGenerating) return;
    
    try {
      if (useSW) {
        console.log('📄 Generando PDF con SmartWeb...');
        const result = await generatePDFSW({
          cartaPorteId,
          facturaId,
          ambiente: 'sandbox'
        });
        
        if (result.success && result.pdfUrl && onPDFGenerated) {
          onPDFGenerated(result.pdfUrl);
        }
      } else if (cartaPorteData) {
        console.log('📄 Generando PDF local...');
        const result = await generateCompletePDF(cartaPorteData, datosRuta);
        
        if (result && result.url && onPDFGenerated) {
          onPDFGenerated(result.url);
        }
      }
      
    } catch (error: any) {
      console.error('❌ Error generando PDF:', error);
      toast.error('Error al generar el PDF');
    }
  };

  const handleDownloadPDF = () => {
    if (useSW) {
      downloadPDFSW();
    } else if (pdfDataLocal.url && pdfDataLocal.blob) {
      const link = document.createElement('a');
      link.href = pdfDataLocal.url;
      link.download = `carta-porte-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('PDF descargado');
    }
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
            <span>Generación de PDF {useSW ? '(SmartWeb)' : 'Profesional'}</span>
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
                onClick={handleDownloadPDF}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar
              </Button>
            </>
          )}
        </div>

        <div className="text-xs text-gray-600 bg-white p-3 rounded border">
          {useSW ? (
            <>
              <strong>PDF Profesional con SmartWeb:</strong> Este PDF es generado 
              automáticamente por SmartWeb con formato oficial del SAT, incluye código QR,
              código de barras y cumple con todas las especificaciones fiscales.
            </>
          ) : (
            <>
              <strong>PDF Profesional:</strong> Este PDF utiliza un diseño profesional con 
              los colores corporativos de Interconecta, tipografías modernas y un layout 
              optimizado que incluye todos los datos fiscales y de trazabilidad.
              {datosRuta?.distanciaTotal && (
                <span className="block mt-1 text-blue-600">
                  ✓ Incluye distancia calculada: {datosRuta.distanciaTotal} km
                </span>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
