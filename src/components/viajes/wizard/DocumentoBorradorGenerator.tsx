
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Eye, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { ViajeWizardData } from '../ViajeWizard';
import { usePDFGeneration } from '@/hooks/usePDFGeneration';
import { ViajeToCartaPorteMapper } from '@/services/viajes/ViajeToCartaPorteMapper';
import { XMLCartaPorteGenerator } from '@/services/xml/xmlGenerator';

interface DocumentoBorradorGeneratorProps {
  data: ViajeWizardData;
  onSaveDraft?: () => void;
  onExit?: () => void;
}

export function DocumentoBorradorGenerator({ 
  data, 
  onSaveDraft, 
  onExit 
}: DocumentoBorradorGeneratorProps) {
  const [xmlGenerated, setXmlGenerated] = useState<string | null>(null);
  const [isGeneratingXML, setIsGeneratingXML] = useState(false);
  const [xmlError, setXmlError] = useState<string | null>(null);
  
  const { generarPDF, isGenerating: isGeneratingPDF, pdfUrl, descargarPDF } = usePDFGeneration();

  const handleGenerateXML = async () => {
    setIsGeneratingXML(true);
    setXmlError(null);
    
    try {
      console.log('📄 Generando XML borrador...');
      
      // Mapear datos del wizard a formato CartaPorte
      const cartaPorteData = ViajeToCartaPorteMapper.mapToValidCartaPorteFormat(data);
      
      // Generar XML
      const xmlResult = await XMLCartaPorteGenerator.generarXML(cartaPorteData);
      
      if (xmlResult.success && xmlResult.xml) {
        setXmlGenerated(xmlResult.xml);
        console.log('✅ XML generado exitosamente');
      } else {
        throw new Error(xmlResult.errors?.join(', ') || 'Error generando XML');
      }
      
    } catch (error) {
      console.error('❌ Error generando XML:', error);
      setXmlError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsGeneratingXML(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!xmlGenerated) {
      await handleGenerateXML();
    }
    
    try {
      const cartaPorteData = ViajeToCartaPorteMapper.mapToValidCartaPorteFormat(data);
      await generarPDF(cartaPorteData);
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
    }
  };

  const handleViewXML = () => {
    if (xmlGenerated) {
      const blob = new Blob([xmlGenerated], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  const handleDownloadXML = () => {
    if (xmlGenerated) {
      const blob = new Blob([xmlGenerated], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CartaPorte_Borrador_${Date.now()}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSaveAndExit = () => {
    if (onSaveDraft) {
      onSaveDraft();
    }
    if (onExit) {
      onExit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Estado de generación de documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Estado de Documentos Borrador
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* XML Status */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">XML Carta Porte</h4>
                {xmlGenerated ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="space-y-2">
                {xmlGenerated ? (
                  <>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Generado
                    </Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleViewXML}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleDownloadXML}>
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="bg-gray-100 text-gray-600">
                      No generado
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={handleGenerateXML}
                      disabled={isGeneratingXML}
                    >
                      {isGeneratingXML ? 'Generando...' : 'Generar XML'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* PDF Status */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">PDF Imprimible</h4>
                {pdfUrl ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="space-y-2">
                {pdfUrl ? (
                  <>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Generado
                    </Badge>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => window.open(pdfUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => descargarPDF(`CartaPorte_Borrador_${Date.now()}.pdf`)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="bg-gray-100 text-gray-600">
                      No generado
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={handleGeneratePDF}
                      disabled={isGeneratingPDF}
                    >
                      {isGeneratingPDF ? 'Generando...' : 'Generar PDF'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Error de XML */}
          {xmlError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error generando XML: {xmlError}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Acciones de guardado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Opciones de Guardado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Puedes guardar este viaje como borrador y continuar editándolo más tarde, 
              o salir sin guardar los cambios.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onExit}>
              Salir sin Guardar
            </Button>
            <Button variant="outline" onClick={handleSaveAndExit}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Borrador y Salir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
