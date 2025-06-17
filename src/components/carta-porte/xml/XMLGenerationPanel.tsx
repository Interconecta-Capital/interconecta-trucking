
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText } from 'lucide-react';
import { useCartaPorteXMLManager } from '@/hooks/xml/useCartaPorteXMLManager';
import { usePDFGeneration } from '@/hooks/usePDFGeneration';
import { useTrackingCartaPorte } from '@/hooks/useTrackingCartaPorte';
import { CartaPorteData } from '@/types/cartaPorte';
import { PDFPreviewDialog } from '../pdf/PDFPreviewDialog';
import { XMLSection } from './sections/XMLSection';
import { PDFSection } from './sections/PDFSection';
import { TimbradoSection } from './sections/TimbradoSection';
import { TimbradoAutomaticoSection } from './sections/TimbradoAutomaticoSection';
import { TrackingSection } from '../tracking/TrackingSection';
import { XMLPreviewSection } from './sections/XMLPreviewSection';

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
  const [autoTimbrado, setAutoTimbrado] = useState(true);
  
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
  } = useCartaPorteXMLManager();

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
    if (autoTimbrado && cartaPorteCompleta && xmlGenerado && !xmlTimbrado && !isTimbring) {
      console.log('Iniciando auto-timbrado...');
      handleTimbrar();
    }
  }, [autoTimbrado, cartaPorteCompleta, xmlGenerado, xmlTimbrado, isTimbring]);

  const handleGenerarXML = async () => {
    const resultado = await generarXML(cartaPorteData);
    if (resultado.success && resultado.xml && onXMLGenerated) {
      onXMLGenerated(resultado.xml);
      
      // Agregar evento de tracking
      if (cartaPorteId) {
        await agregarEvento({
          evento: 'xml_generado',
          descripcion: 'XML de Carta Porte generado correctamente'
        });
      }
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
      
      // Agregar evento de tracking
      await agregarEvento({
        evento: 'timbrado',
        descripcion: 'Carta Porte timbrada exitosamente con FISCAL API',
        metadata: {
          uuid: resultado.uuid,
          ambiente: 'test'
        }
      });
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
      <div className="space-y-6">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Generación XML y Timbrado FISCAL API</span>
              </CardTitle>
              {getStatusBadge()}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <XMLSection
              isGenerating={isGenerating}
              xmlGenerado={xmlGenerado}
              onGenerarXML={handleGenerarXML}
              onDescargarXML={() => descargarXML('generado')}
              onRegenerarXML={handleGenerarXML}
            />

            <XMLPreviewSection xmlGenerado={xmlGenerado} />

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
              xmlGenerado={xmlGenerado}
              xmlTimbrado={xmlTimbrado}
              datosTimbre={datosTimbre}
              isTimbring={isTimbring}
              cartaPorteId={cartaPorteId}
              onValidarConexionPAC={validarConexionPAC}
              onTimbrar={handleTimbrar}
              onDescargarTimbrado={() => descargarXML('timbrado')}
            />

            <Separator />

            <PDFSection
              isGeneratingPDF={isGeneratingPDF}
              pdfUrl={pdfUrl}
              onGenerarPDF={handleGenerarPDF}
              onVisualizarPDF={handleVisualizarPDF}
              onDescargarPDF={() => descargarPDF(`carta-porte-${Date.now()}.pdf`)}
            />
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
