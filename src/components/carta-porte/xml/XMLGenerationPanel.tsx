import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, AlertTriangle, CheckCircle } from 'lucide-react';
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
import { XMLGeneratorEnhanced } from '@/services/xml/xmlGeneratorEnhanced';
import { XMLFacturaCartaPorteGenerator, OpcionesXML } from '@/services/xml/xmlFacturaConCartaPorte';
import { PACServiceReal } from '@/services/xml/pacServiceReal';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [validationScore, setValidationScore] = useState<number>(0);
  const [fiscalData, setFiscalData] = useState<any>(null);
  const [tipoComprobante, setTipoComprobante] = useState<'T' | 'I'>('T');
  const [montoServicio, setMontoServicio] = useState<number>(0);
  
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
      console.log('🚀 Generando XML con validaciones mejoradas...');
      
      // Usar generador dual según el tipo seleccionado
      const opciones: OpcionesXML = {
        esFactura: tipoComprobante === 'I',
        montoServicio: tipoComprobante === 'I' ? montoServicio : undefined
      };
      
      const xmlGenerado = XMLFacturaCartaPorteGenerator.generarXML(cartaPorteData, opciones);
      
      // También validar con el generador enhanced
      const result = await XMLGeneratorEnhanced.generarXMLCompleto(cartaPorteData);
      
      if (result.success && xmlGenerado) {
        setGeneratedXML(xmlGenerado);
        setValidationScore(result.validationDetails?.score || 0);
        setFiscalData(result.fiscalData);
        
        onXMLGenerated?.(xmlGenerado);
        
        toast.success(
          `XML generado exitosamente (Score: ${result.validationDetails?.score || 0}%)`,
          {
            description: result.warnings?.length ? 
              `${result.warnings.length} advertencias encontradas` : 
              'Todas las validaciones pasaron'
          }
        );

        // Mostrar advertencias si las hay
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach(warning => {
            toast.warning('Advertencia', { description: warning });
          });
        }
      } else {
        const errorMsg = result.errors?.join(', ') || 'Error desconocido';
        toast.error('Error al generar XML', { description: errorMsg });
        console.error('Errores de validación:', result.errors);
      }
    } catch (error) {
      console.error('Error generando XML:', error);
      toast.error('Error al generar XML');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTimbrar = async () => {
    if (!cartaPorteId || !xmlActual) {
      console.error('ID de carta porte y XML requeridos para timbrado');
      return;
    }
    
    try {
      console.log('🔄 Iniciando timbrado real con PAC...');
      
      const resultado = await PACServiceReal.timbrarCartaPorte(xmlActual, 'sandbox');
      
      if (resultado.success) {
        onTimbrado?.(resultado);
        
        await agregarEvento({
          evento: 'timbrado',
          descripcion: `Carta Porte timbrada exitosamente con ${resultado.pac}`,
          metadata: {
            uuid: resultado.uuid,
            pac: resultado.pac,
            ambiente: 'sandbox'
          }
        });

        toast.success('Timbrado exitoso', {
          description: `UUID: ${resultado.uuid}`
        });
      } else {
        toast.error('Error en timbrado', {
          description: resultado.error
        });
      }
    } catch (error) {
      console.error('Error al timbrar:', error);
      toast.error('Error al timbrar la Carta Porte');
    }
  };

  const handleValidarPAC = async () => {
    try {
      const resultado = await PACServiceReal.validarConexion('sandbox');
      
      if (resultado.success) {
        toast.success('Conexión PAC válida', {
          description: resultado.message
        });
      } else {
        toast.error('Error de conexión PAC', {
          description: resultado.message
        });
      }
    } catch (error) {
      toast.error('Error validando PAC');
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

  const handleGenerarPDF = async () => {
    try {
      await generarPDF(cartaPorteData);
      toast.success('PDF generado correctamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error('Error al generar PDF');
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
      const color = validationScore >= 90 ? 'bg-green-100 text-green-800' : 
                   validationScore >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                   'bg-red-100 text-red-800';
      return <Badge className={color}>XML Generado ({validationScore}%)</Badge>;
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
                <span>Generación XML SAT 3.1 y Timbrado Fiscal</span>
              </CardTitle>
              {getStatusBadge()}
            </div>
            
            {/* Score de validación */}
            {validationScore > 0 && (
              <div className="flex items-center gap-2 text-sm">
                {validationScore >= 90 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                <span>Score de validación SAT: {validationScore}%</span>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Selector de tipo de comprobante */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-4">
              <h4 className="font-medium text-blue-900">Tipo de Comprobante</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de CFDI</Label>
                  <Select value={tipoComprobante} onValueChange={(v) => setTipoComprobante(v as 'T' | 'I')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="T">Traslado (T) - Sin cobro</SelectItem>
                      <SelectItem value="I">Ingreso (I) - Con factura</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {tipoComprobante === 'T' 
                      ? 'Para transporte propio sin cobro' 
                      : 'Para facturar servicio de transporte'}
                  </p>
                </div>
                
                {tipoComprobante === 'I' && (
                  <div className="space-y-2">
                    <Label>Monto del Servicio</Label>
                    <Input
                      type="number"
                      placeholder="5000.00"
                      value={montoServicio || ''}
                      onChange={(e) => setMontoServicio(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Monto antes de impuestos
                    </p>
                  </div>
                )}
              </div>
            </div>

            <XMLSection
              isGenerating={isGenerating}
              xmlGenerado={xmlActual}
              onGenerarXML={handleGenerateXML}
              onDescargarXML={() => descargarXML('generado')}
              onRegenerarXML={handleGenerateXML}
            />

            <XMLPreviewSection xmlGenerado={xmlActual} />

            {/* Mostrar información fiscal */}
            {fiscalData && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Información Fiscal</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Subtotal:</span>
                    <span className="ml-2 font-medium">${fiscalData.subtotal}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">IVA:</span>
                    <span className="ml-2 font-medium">${fiscalData.iva}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Total:</span>
                    <span className="ml-2 font-medium">${fiscalData.total}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Moneda:</span>
                    <span className="ml-2 font-medium">{fiscalData.moneda}</span>
                  </div>
                </div>
              </div>
            )}

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
              onValidarConexionPAC={handleValidarPAC}
              onTimbrar={handleTimbrar}
              onDescargarTimbrado={() => descargarXML('timbrado')}
            />

            <Separator />

            <PDFGenerationPanel
              cartaPorteData={cartaPorteData}
              xmlGenerado={xmlFirmado || xmlActual}
              datosRuta={datosCalculoRuta}
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
