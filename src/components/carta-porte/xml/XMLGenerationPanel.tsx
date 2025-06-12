import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye,
  Stamp,
  Shield,
  FileImage
} from 'lucide-react';
import { useXMLGeneration } from '@/hooks/useXMLGeneration';
import { usePDFGeneration } from '@/hooks/usePDFGeneration';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';
import { PDFPreviewDialog } from '../pdf/PDFPreviewDialog';

interface XMLGenerationPanelProps {
  cartaPorteData: CartaPorteData;
  cartaPorteId?: string;
  onXMLGenerated?: (xml: string) => void;
  onTimbrado?: (datos: any) => void;
}

export function XMLGenerationPanel({ 
  cartaPorteData, 
  cartaPorteId, 
  onXMLGenerated, 
  onTimbrado 
}: XMLGenerationPanelProps) {
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  
  const {
    isGenerating,
    isTimbring,
    xmlGenerado,
    xmlTimbrado,
    datosTimbre,
    generarXML,
    timbrarCartaPorte,
    descargarXML,
    validarConexionPAC
  } = useXMLGeneration();

  const {
    isGenerating: isGeneratingPDF,
    pdfUrl,
    generarPDF,
    descargarPDF,
    limpiarPDF
  } = usePDFGeneration();

  const handleGenerarXML = async () => {
    const resultado = await generarXML(cartaPorteData);
    if (resultado.success && resultado.xml && onXMLGenerated) {
      onXMLGenerated(resultado.xml);
    }
  };

  const handleTimbrar = async () => {
    if (!cartaPorteId) {
      console.error('ID de carta porte requerido para timbrado');
      return;
    }
    
    const resultado = await timbrarCartaPorte(cartaPorteData, cartaPorteId);
    if (resultado.success && onTimbrado) {
      onTimbrado(resultado);
    }
  };

  const handleGenerarPDF = async () => {
    const resultado = await generarPDF(cartaPorteData, datosTimbre);
    if (resultado.success) {
      console.log('PDF generado exitosamente');
    }
  };

  const handleVisualizarPDF = () => {
    if (!pdfUrl) {
      handleGenerarPDF();
    } else {
      setShowPDFPreview(true);
    }
  };

  const getStatusBadge = () => {
    if (xmlTimbrado) {
      return <Badge className="bg-green-100 text-green-800">Timbrado</Badge>;
    }
    if (xmlGenerado) {
      return <Badge className="bg-blue-100 text-blue-800">XML Generado</Badge>;
    }
    return <Badge variant="outline">Sin procesar</Badge>;
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Generación XML y PDF</span>
            </CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Sección de Generación XML */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Generación XML CCP 3.1</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleGenerarXML}
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
                  onClick={() => descargarXML('generado')}
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

          <Separator />

          {/* Sección de PDF */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <FileImage className="h-4 w-4" />
              <span>Representación Impresa PDF</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={handleGenerarPDF}
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
                    onClick={handleVisualizarPDF}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Previsualizar</span>
                  </Button>
                  
                  <Button
                    onClick={() => descargarPDF(`carta-porte-${Date.now()}.pdf`)}
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

          <Separator />

          {/* Sección de Timbrado */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Stamp className="h-4 w-4" />
              <span>Timbrado Fiscal</span>
            </h3>
            
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Funcionalidad en desarrollo:</strong> El timbrado está preparado para producción 
                pero requiere configuración del proveedor PAC.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={validarConexionPAC}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span>Validar PAC</span>
              </Button>
              
              <Button
                onClick={handleTimbrar}
                disabled={!xmlGenerado || isTimbring || !cartaPorteId}
                className="flex items-center space-x-2"
              >
                {isTimbring ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Stamp className="h-4 w-4" />
                )}
                <span>{isTimbring ? 'Timbrando...' : 'Timbrar'}</span>
              </Button>
              
              {xmlTimbrado && (
                <Button
                  variant="outline"
                  onClick={() => descargarXML('timbrado')}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Descargar Timbrado</span>
                </Button>
              )}
            </div>
            
            {datosTimbre && (
              <div className="space-y-2">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Carta Porte timbrada exitosamente
                  </AlertDescription>
                </Alert>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong>UUID:</strong> 
                      <code className="ml-2 text-sm bg-white px-2 py-1 rounded">
                        {datosTimbre.uuid}
                      </code>
                    </div>
                    {datosTimbre.folio && (
                      <div>
                        <strong>Folio:</strong> 
                        <span className="ml-2">{datosTimbre.folio}</span>
                      </div>
                    )}
                  </div>
                  
                  {datosTimbre.qrCode && (
                    <div className="mt-4">
                      <strong>Código QR:</strong>
                      <div className="mt-2">
                        <img 
                          src={datosTimbre.qrCode} 
                          alt="Código QR" 
                          className="w-32 h-32 border" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Vista previa del XML */}
          {xmlGenerado && (
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
          )}
        </CardContent>
      </Card>

      {/* Dialog de previsualización PDF */}
      {pdfUrl && (
        <PDFPreviewDialog
          open={showPDFPreview}
          onClose={() => setShowPDFPreview(false)}
          pdfUrl={pdfUrl}
          onDownload={() => descargarPDF(`carta-porte-${Date.now()}.pdf`)}
          title="Previsualización Carta Porte"
        />
      )}
    </>
  );
}
