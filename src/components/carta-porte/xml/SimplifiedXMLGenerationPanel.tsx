
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Eye, Loader2, CheckCircle, Zap } from 'lucide-react';
import { useCartaPorteXMLManager } from '@/hooks/xml/useCartaPorteXMLManager';
import { useTrackingCartaPorte } from '@/hooks/useTrackingCartaPorte';
import { useEnhancedPDFGenerator } from '@/hooks/carta-porte/useEnhancedPDFGenerator';
import { useCartaPortePersistence } from '@/hooks/carta-porte/useCartaPortePersistence';
import { CartaPorteData } from '@/types/cartaPorte';
import { XMLSection } from './sections/XMLSection';
import { TimbradoSection } from './sections/TimbradoSection';
import { TimbradoAutomaticoSection } from './sections/TimbradoAutomaticoSection';
import { TrackingSection } from '../tracking/TrackingSection';
import { XMLPreviewSection } from './sections/XMLPreviewSection';

interface SimplifiedXMLGenerationPanelProps {
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

export function SimplifiedXMLGenerationPanel({ 
  cartaPorteData, 
  cartaPorteId: cartaPorteIdProp, 
  onXMLGenerated, 
  onTimbrado,
  xmlGenerado: xmlGeneradoProp,
  datosCalculoRuta
}: SimplifiedXMLGenerationPanelProps) {
  const [autoTimbrado, setAutoTimbrado] = useState(true);
  
  const {
    isGenerating,
    isTimbring,
    xmlGenerado: xmlGeneradoHook,
    xmlTimbrado,
    datosTimbre,
    generarXML,
    timbrarCartaPorte,
    descargarXML,
    validarConexionPAC
  } = useCartaPorteXMLManager();

  const { generateCompletePDF, isGenerating: isGeneratingPDF, pdfData } = useEnhancedPDFGenerator();
  const { saveXML, savePDF, xmlGenerado: xmlPersistido } = useCartaPortePersistence(cartaPorteIdProp);

  const {
    eventos,
    agregarEvento
  } = useTrackingCartaPorte(cartaPorteIdProp);

  // Usar XML del prop si existe, sino el del hook, sino el persistido
  const xmlActual = xmlGeneradoProp || xmlGeneradoHook || xmlPersistido;

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
    // Solo intentar auto-timbrado si tenemos cartaPorteId
    if (autoTimbrado && cartaPorteCompleta && xmlActual && !xmlTimbrado && !isTimbring && cartaPorteIdProp) {
      console.log('Iniciando auto-timbrado...');
      handleTimbrar();
    } else if (autoTimbrado && cartaPorteCompleta && xmlActual && !cartaPorteIdProp) {
      console.log('⚠️ Auto-timbrado no puede proceder: ID de carta porte requerido');
    }
  }, [autoTimbrado, cartaPorteCompleta, xmlActual, xmlTimbrado, isTimbring, cartaPorteIdProp]);

  const handleGenerarXML = async () => {
    const resultado = await generarXML(cartaPorteData);
    if (resultado.success && resultado.xml) {
      // Persistir XML inmediatamente si tenemos ID
      if (cartaPorteIdProp) {
        saveXML(resultado.xml);
      } else {
        // Guardar en localStorage como fallback
        localStorage.setItem('xml_generado_temp', resultado.xml);
        console.log('💾 XML guardado temporalmente en localStorage');
      }
      
      // Notificar al componente padre que se generó XML
      if (onXMLGenerated) {
        onXMLGenerated(resultado.xml);
      }
      
      // Agregar evento de tracking solo si tenemos ID
      if (cartaPorteIdProp) {
        await agregarEvento({
          evento: 'xml_generado',
          descripcion: 'XML de Carta Porte generado correctamente'
        });
      }
    }
  };

  const handleTimbrar = async () => {
    if (!cartaPorteIdProp) {
      console.error('ID de carta porte requerido para timbrado');
      return;
    }
    
    const resultado = await timbrarCartaPorte(cartaPorteData, cartaPorteIdProp);
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
    const resultado = await generateCompletePDF(cartaPorteData, datosCalculoRuta);
    if (resultado) {
      // Persistir PDF inmediatamente si tenemos ID
      if (cartaPorteIdProp) {
        savePDF(resultado.url, resultado.blob);
      } else {
        // Al menos mantener el URL en memoria
        console.log(`PDF generado sin ID: ${resultado.pages} páginas`);
      }
      console.log(`PDF completo generado: ${resultado.pages} páginas`);
    }
  };

  const handleDescargarPDF = () => {
    if (pdfData.url) {
      const link = document.createElement('a');
      link.href = pdfData.url;
      link.download = `carta-porte-completa-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleVisualizarPDF = () => {
    if (pdfData.url) {
      window.open(pdfData.url, '_blank');
    }
  };

  const getStatusBadge = () => {
    if (xmlTimbrado) {
      return <Badge className="bg-green-100 text-green-800">Timbrado</Badge>;
    }
    if (xmlActual) {
      return <Badge className="bg-blue-100 text-blue-800">XML Generado</Badge>;
    }
    return <Badge variant="outline">Sin procesar</Badge>;
  };

  return (
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
          {!cartaPorteIdProp && (
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              ⚠️ <strong>Advertencia:</strong> Sin ID de carta porte, la persistencia estará limitada. 
              Los datos se guardarán temporalmente en el navegador.
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          <XMLSection
            isGenerating={isGenerating}
            xmlGenerado={xmlActual}
            onGenerarXML={handleGenerarXML}
            onDescargarXML={() => descargarXML('generado')}
            onRegenerarXML={handleGenerarXML}
          />

          <XMLPreviewSection xmlGenerado={xmlActual} />

          <Separator />

          <TimbradoAutomaticoSection
            cartaPorteCompleta={cartaPorteCompleta}
            autoTimbrado={autoTimbrado}
            onToggleAutoTimbrado={setAutoTimbrado}
            onTimbrarManual={handleTimbrar}
            isTimbring={isTimbring}
            xmlTimbrado={xmlTimbrado}
            cartaPorteId={cartaPorteIdProp}
          />

          <Separator />

          <TimbradoSection
            xmlGenerado={xmlActual}
            xmlTimbrado={xmlTimbrado}
            datosTimbre={datosTimbre}
            isTimbring={isTimbring}
            cartaPorteId={cartaPorteIdProp}
            onValidarConexionPAC={validarConexionPAC}
            onTimbrar={handleTimbrar}
            onDescargarTimbrado={() => descargarXML('timbrado')}
          />

          <Separator />

          {/* Sección de PDF Mejorada */}
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-800">
                  <FileText className="h-5 w-5" />
                  <span>Representación Impresa Completa</span>
                </div>
                {pdfData.url && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {pdfData.pages} páginas
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  onClick={handleGenerarPDF}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  {isGeneratingPDF ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                  {isGeneratingPDF ? 'Generando...' : 'Generar PDF'}
                </Button>
                
                {pdfData.url && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleVisualizarPDF}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Previsualizar
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleDescargarPDF}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Descargar
                    </Button>
                  </>
                )}
              </div>

              {/* Mostrar información de cálculos de ruta si están disponibles */}
              {datosCalculoRuta && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Información de Ruta Incluida</h4>
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

              <div className="text-xs text-gray-600 bg-white p-3 rounded border">
                <strong>PDF Completo y Persistente:</strong> Este PDF incluye toda la información 
                de la Carta Porte en múltiples páginas organizadas. 
                {cartaPorteIdProp ? 
                  'Se mantiene disponible durante toda tu sesión y se guarda automáticamente.' : 
                  'Se mantiene disponible durante tu sesión actual.'
                }
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Tracking Section */}
      {cartaPorteIdProp && (
        <TrackingSection
          cartaPorteId={cartaPorteIdProp}
          eventos={eventos}
          uuidFiscal={datosTimbre?.uuid}
        />
      )}
    </div>
  );
}
