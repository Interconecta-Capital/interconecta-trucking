
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Eye, Loader2, CheckCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import { CartaPorteData } from '@/types/cartaPorte';
import { useCartaPorteFiscalPDF } from '@/hooks/useCartaPorteFiscalPDF';
import { toast } from 'sonner';

interface FiscalPDFSectionProps {
  cartaPorteData: CartaPorteData;
  datosTimbre?: {
    uuid?: string;
    idCCP?: string;
    selloDigital?: string;
    selloSAT?: string;
    cadenaOriginal?: string;
    fechaTimbrado?: string;
    noCertificadoSAT?: string;
    noCertificadoEmisor?: string;
  } | null;
  xmlTimbrado?: string | null;
  companyLogoUrl?: string;
}

export function FiscalPDFSection({ 
  cartaPorteData, 
  datosTimbre, 
  xmlTimbrado,
  companyLogoUrl 
}: FiscalPDFSectionProps) {
  const { isGenerating, pdfData, generateFiscalPDF, downloadPDF, clearPDF } = useCartaPorteFiscalPDF();

  const isFiscalDataComplete = Boolean(
    datosTimbre?.uuid && 
    datosTimbre?.idCCP && 
    datosTimbre?.selloDigital && 
    datosTimbre?.selloSAT && 
    datosTimbre?.cadenaOriginal &&
    datosTimbre?.fechaTimbrado
  );

  const handleGeneratePDF = async () => {
    if (!isFiscalDataComplete) {
      toast.error('Se requiere timbrado fiscal completo para generar el PDF');
      return;
    }

    const result = await generateFiscalPDF(cartaPorteData, {
      xmlTimbrado,
      datosTimbre: {
        uuid: datosTimbre!.uuid!,
        idCCP: datosTimbre!.idCCP!,
        selloDigital: datosTimbre!.selloDigital!,
        selloSAT: datosTimbre!.selloSAT!,
        cadenaOriginal: datosTimbre!.cadenaOriginal!,
        fechaTimbrado: datosTimbre!.fechaTimbrado!,
        noCertificadoSAT: datosTimbre?.noCertificadoSAT || '',
        noCertificadoEmisor: datosTimbre?.noCertificadoEmisor || ''
      },
      companyLogoUrl
    });

    if (result?.success) {
      console.log('✅ PDF fiscal generado exitosamente');
    }
  };

  const handlePreviewPDF = () => {
    if (pdfData.url) {
      window.open(pdfData.url, '_blank');
    }
  };

  const handleDownloadPDF = () => {
    const filename = `carta-porte-fiscal-${cartaPorteData.folio || Date.now()}.pdf`;
    downloadPDF(filename);
  };

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-800">
            <ShieldCheck className="h-5 w-5" />
            <span>Representación Impresa Fiscal (PDF Oficial)</span>
          </div>
          {pdfData.url && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              PDF Fiscal Listo
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estado de validación fiscal */}
        {isFiscalDataComplete ? (
          <Alert className="border-green-200 bg-green-50">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Datos fiscales completos:</strong> UUID, IdCCP, sellos digitales y cadena original verificados.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Timbrado requerido:</strong> Se necesita timbrado fiscal completo para generar el PDF oficial.
            </AlertDescription>
          </Alert>
        )}

        {/* Controles del PDF */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={handleGeneratePDF}
            disabled={isGenerating || !isFiscalDataComplete}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {isGenerating ? 'Generando...' : 'Generar PDF Fiscal'}
          </Button>
          
          {pdfData.url && (
            <>
              <Button
                variant="outline"
                onClick={handlePreviewPDF}
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

        {/* Información del PDF fiscal */}
        <div className="text-xs text-gray-700 bg-white p-3 rounded border space-y-2">
          <div className="font-semibold text-green-800">
            📋 Características del PDF Fiscal:
          </div>
          <ul className="space-y-1 ml-4">
            <li>• ✅ Código QR verificable en el portal del SAT</li>
            <li>• ✅ UUID (Folio Fiscal) y IdCCP visibles</li>
            <li>• ✅ Sellos digitales del CFDI y SAT</li>
            <li>• ✅ Cadena original del complemento</li>
            <li>• ✅ Datos completos de emisor, receptor y transporte</li>
            <li>• ✅ Formato profesional con marca corporativa</li>
          </ul>
          
          {datosTimbre?.uuid && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-600">
                <strong>UUID:</strong> {datosTimbre.uuid}<br/>
                <strong>IdCCP:</strong> {datosTimbre.idCCP}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
