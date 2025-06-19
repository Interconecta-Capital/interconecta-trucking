
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Eye, CheckCircle, Loader2, Shield, QrCode } from 'lucide-react';
import { CartaPorteData } from '@/types/cartaPorte';
import { useProfessionalPDFGeneration } from '@/hooks/useProfessionalPDFGeneration';

interface ProfessionalPDFSectionProps {
  cartaPorteData: CartaPorteData;
  xmlTimbrado?: string | null;
  datosTimbre?: {
    uuid?: string;
    selloDigital?: string;
    selloSAT?: string;
    cadenaOriginal?: string;
    fechaTimbrado?: string;
    idCCP?: string;
    noCertificadoSAT?: string;
    noCertificadoEmisor?: string;
  } | null;
  /** URL del logo de la empresa emisora */
  companyLogoUrl?: string;
  /** URL del logo del cliente opcional */
  clientLogoUrl?: string;
  onPDFGenerated?: (pdfUrl: string) => void;
}

export function ProfessionalPDFSection({
  cartaPorteData,
  xmlTimbrado,
  datosTimbre,
  companyLogoUrl,
  clientLogoUrl,
  onPDFGenerated
}: ProfessionalPDFSectionProps) {
  const {
    isGenerating,
    pdfUrl,
    generateProfessionalPDF,
    downloadPDF,
    clearPDF
  } = useProfessionalPDFGeneration();

  const handleGeneratePDF = async () => {
    const result = await generateProfessionalPDF(cartaPorteData, {
      xmlTimbrado: xmlTimbrado || undefined,
      datosTimbre: datosTimbre || undefined,
      companyLogoUrl,
      clientLogoUrl
    });
    
    if (result?.success && result.pdfUrl && onPDFGenerated) {
      onPDFGenerated(result.pdfUrl);
    }
  };

  const handleDownload = () => {
    const filename = `carta-porte-profesional-${cartaPorteData.folio || Date.now()}.pdf`;
    downloadPDF(filename);
  };

  const handlePreview = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const isTimbreFiscalCompleto = datosTimbre?.uuid && datosTimbre?.idCCP;

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-800">
            <Shield className="h-5 w-5" />
            <span>Representación Impresa Profesional</span>
          </div>
          <div className="flex gap-2">
            {isTimbreFiscalCompleto && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <QrCode className="h-3 w-3 mr-1" />
                QR Válido
              </Badge>
            )}
            {pdfUrl && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Disponible
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert className="border-green-200 bg-green-50">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>PDF Completo y Legal:</strong> Este PDF cumple con todos los requisitos del SAT para Carta Porte 3.1, 
            incluyendo UUID, IdCCP, código QR funcional y sellos digitales.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
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
                onClick={handlePreview}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Previsualizar
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar
              </Button>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-3 rounded border">
            <h4 className="font-semibold text-green-800 mb-2">✅ Incluye</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• UUID (Folio Fiscal) y IdCCP</li>
              <li>• Código QR funcional del SAT</li>
              <li>• Sellos digitales completos</li>
              <li>• Todas las secciones requeridas</li>
            </ul>
          </div>
          
          <div className="bg-white p-3 rounded border">
            <h4 className="font-semibold text-green-800 mb-2">🎨 Características</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Diseño profesional</li>
              <li>• Tablas organizadas y legibles</li>
              <li>• Cumplimiento normativo</li>
              <li>• Listo para inspecciones</li>
            </ul>
          </div>
        </div>

        {!isTimbreFiscalCompleto && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertDescription className="text-amber-800">
              <strong>Nota:</strong> Para generar el código QR funcional y obtener el PDF completamente legal, 
              es necesario tener el XML timbrado con UUID e IdCCP.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
