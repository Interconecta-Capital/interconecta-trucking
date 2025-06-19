
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText } from 'lucide-react';
import { useCartaPorteXMLManager } from '@/hooks/xml/useCartaPorteXMLManager';
import { useXMLSigning } from '@/hooks/xml/useXMLSigning';
import { usePDFGeneration } from '@/hooks/usePDFGeneration';
import { useTrackingCartaPorte } from '@/hooks/useTrackingCartaPorte';
import { CartaPorteData } from '@/types/cartaPorte';
import { PDFPreviewDialog } from '../pdf/PDFPreviewDialog';
import { XMLSection } from './sections/XMLSection';
import { CSDSigningSection } from './sections/CSDSigningSection';
import { PDFSection } from './sections/PDFSection';
import { TimbradoSection } from './sections/TimbradoSection';
import { TimbradoAutomaticoSection } from './sections/TimbradoAutomaticoSection';
import { TrackingSection } from '../tracking/TrackingSection';
import { XMLPreviewSection } from './sections/XMLPreviewSection';
import { PDFGenerationPanel } from './PDFGenerationPanel';
import { XMLCartaPorteGenerator } from '@/services/xml/xmlGenerator';
import { toast } from 'sonner';

interface XMLGenerationPanelProps {
  cartaPorteData: CartaPorteData;
  cartaPorteId?: string;
  onXMLGenerated?: (xml: string) => void;
  onTimbrado?: (datos: any) => void;
  xmlGenerado?: string | null;
  datosCalculoRuta?: {
    distanciaTotal?: number;
    tiempoEstimado?: number;
  } | null;
}

export function XMLGenerationPanel({ 
  cartaPorteData, 
  cartaPorteId, 
  onXMLGenerated, 
  onTimbrado,
  xmlGenerado: xmlGeneradoProp,
  datosCalculoRuta
}: XMLGenerationPanelProps) {
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [autoTimbrado, setAutoTimbrado] = useState(true);
  const [generatedXML, setGeneratedXML] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const {
    isTimbring,
    xmlGenerado: xmlGeneradoHook,
    xmlTimbrado,
    datosTimbre,
    generarXML,
    timbrarCartaPorte,
    descargarXML,
    validarConexionPAC
  } = useCartaPorteXMLManager();

  // Hook para firmado CSD
  const {
    isSigning,
    xmlFirmado,
    infoFirmado,
    certificadoActivo,
    firmarXML,
    validarXMLFirmado,
    descargarXMLFirmado,
    limpiarDatosFirmado
  } = useXMLSigning();

  // Usar XML del prop si existe, sino el del hook
  const xmlActual = xmlGeneradoProp || xmlGeneradoHook || generatedXML;

  const {
    isGenerating: isGeneratingPDF,
    pdfUrl,
    generarPDF,
    descargarPDF,
    limpiarPDF
  } = usePDFGeneration();

  const {
    eventos,
    agregarEvento
  } = useTrackingCartaPorte(cartaPorteId);

  // Verificar si la carta porte está completa
  const cartaPorteCompleta = !!(
    cartaPorteData.rfcEmisor &&
    cartaPorteData.rfcReceptor &&
    cartaPorteData.ubicaciones?.length >= 2 &&
    cartaPorteData.mercancias?.length > 0 &&
    cartaPorteData.autotransporte?.placa_vm &&
    cartaPorteData.figuras?.length > 0
  );

  // Auto-timbrado cuando se completan los datos
  useEffect(() => {
    if (autoTimbrado && cartaPorteCompleta && xmlActual && !xmlTimbrado && !isTimbring) {
      console.log('Iniciando auto-timbrado...');
      handleTimbrar();
    }
  }, [autoTimbrado, cartaPorteCompleta, xmlActual, xmlTimbrado, isTimbring]);

  const handleGenerateXML = async () => {
    if (!cartaPorteData) return;
    
    setIsGenerating(true);
    try {
      const result = await XMLCartaPorteGenerator.generarXML(cartaPorteData);
      
      if (result.success && result.xml) {
        setGeneratedXML(result.xml);
        onXMLGenerated?.(result.xml);
        toast.success('XML generado correctamente');
      } else {
        toast.error('Error al generar XML: ' + (result.errors?.join(', ') || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error generando XML:', error);
      toast.error('Error al generar XML');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFirmarXML = async () => {
    const xmlParaFirmar = xmlActual;
    if (!xmlParaFirmar) {
      console.error('No hay XML disponible para firmar');
      return;
    }
    
    const resultado = await firmarXML(xmlParaFirmar);
    if (resultado.success && cartaPorteId) {
      await agregarEvento({
        evento: 'xml_firmado',
        descripcion: 'XML firmado digitalmente con CSD',
        metadata: {
          certificado: resultado.certificadoUsado?.numero,
          rfc: resultado.certificadoUsado?.rfc
        }
      });
    }
  };

  const handleTimbrar = async () => {
    if (!cartaPorteId) {
      console.error('ID de carta porte requerido para timbrado');
      return;
    }
    
    try {
      const resultado = await timbrarCartaPorte(cartaPorteData);
      if (resultado && resultado.success) {
        onTimbrado?.(resultado);
        
        // Agregar evento de tracking solo si el resultado incluye uuid
        if ('uuid' in resultado) {
          await agregarEvento({
            evento: 'timbrado',
            descripcion: 'Carta Porte timbrada exitosamente con FISCAL API',
            metadata: {
              uuid: resultado.uuid,
              ambiente: 'test'
            }
          });
        }
      }
    } catch (error) {
      console.error('Error al timbrar:', error);
      toast.error('Error al timbrar la Carta Porte');
    }
  };

  const handleGenerarPDF = async () => {
    const resultado = await generarPDF(cartaPorteData);
    if (resultado && resultado.success) {
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
    if (xmlFirmado) {
      return <Badge className="bg-blue-100 text-blue-800">Firmado CSD</Badge>;
    }
    if (xmlActual) {
      return <Badge className="bg-gray-100 text-gray-800">XML Generado</Badge>;
    }
    return <Badge variant="outline">Sin procesar</Badge>;
  };

  return (
    <>
      <div className="space-y-6">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Generación XML y Firmado Digital</span>
              </CardTitle>
              {getStatusBadge()}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <XMLSection
              isGenerating={isGenerating}
              xmlGenerado={xmlActual}
              onGenerarXML={handleGenerateXML}
              onDescargarXML={() => descargarXML('generado')}
              onRegenerarXML={handleGenerateXML}
            />

            <XMLPreviewSection xmlGenerado={xmlActual} />

            <Separator />

            <CSDSigningSection
              xmlGenerado={xmlActual}
              xmlFirmado={xmlFirmado}
              certificadoActivo={certificadoActivo}
              isSigning={isSigning}
              infoFirmado={infoFirmado}
              onFirmarXML={handleFirmarXML}
              onDescargarFirmado={descargarXMLFirmado}
              onValidarFirmado={() => xmlFirmado && validarXMLFirmado(xmlFirmado)}
            />

            <Separator />

            <TimbradoAutomaticoSection
              cartaPorteCompleta={cartaPorteCompleta}
              autoTimbrado={autoTimbrado}
              onToggleAutoTimbrado={setAutoTimbrado}
              onTimbrarManual={handleTimbrar}
              isTimbring={isTimbring}
              xmlTimbrado={xmlTimbrado}
            />

            <Separator />

            <TimbradoSection
              xmlGenerado={xmlFirmado || xmlActual}
              xmlTimbrado={xmlTimbrado}
              datosTimbre={datosTimbre}
              isTimbring={isTimbring}
              cartaPorteId={cartaPorteId}
              onValidarConexionPAC={validarConexionPAC}
              onTimbrar={handleTimbrar}
              onDescargarTimbrado={() => descargarXML('timbrado')}
            />

            <Separator />

            <PDFGenerationPanel
              cartaPorteData={cartaPorteData}
              xmlGenerado={xmlFirmado || xmlActual}
            />

            <Separator />

            <PDFSection
              isGeneratingPDF={isGeneratingPDF}
              pdfUrl={pdfUrl}
              onGenerarPDF={handleGenerarPDF}
              onVisualizarPDF={handleVisualizarPDF}
              onDescargarPDF={() => descargarPDF(`carta-porte-${Date.now()}.pdf`)}
            />

            {/* Mostrar información de cálculos de ruta si están disponibles */}
            {datosCalculoRuta && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Información de Ruta</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {datosCalculoRuta.distanciaTotal && (
                    <div>
                      <span className="text-blue-700">Distancia Total:</span>
                      <span className="ml-2 font-medium">{datosCalculoRuta.distanciaTotal} km</span>
                    </div>
                  )}
                  {datosCalculoRuta.tiempoEstimado && (
                    <div>
                      <span className="text-blue-700">Tiempo Estimado:</span>
                      <span className="ml-2 font-medium">{Math.round(datosCalculoRuta.tiempoEstimado / 60)} horas</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tracking Section */}
        {cartaPorteId && (
          <TrackingSection
            cartaPorteId={cartaPorteId}
            eventos={eventos}
            uuidFiscal={datosTimbre?.uuid}
          />
        )}
      </div>

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
