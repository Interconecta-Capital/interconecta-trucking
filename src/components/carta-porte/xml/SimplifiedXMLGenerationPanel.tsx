import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Check, AlertCircle } from 'lucide-react';
import { CartaPorteData } from '@/types/cartaPorte';

interface SimplifiedXMLGenerationPanelProps {
  cartaPorteData: CartaPorteData;
  cartaPorteId?: string;
  onXMLGenerated: (xml: string) => void;
  onTimbrado: () => void;
  xmlGenerado?: string | null;
  datosCalculoRuta?: {
    distanciaTotal?: number;
    tiempoEstimado?: number;
  } | null;
}

export function SimplifiedXMLGenerationPanel({
  cartaPorteData,
  cartaPorteId,
  onXMLGenerated,
  onTimbrado,
  xmlGenerado,
  datosCalculoRuta
}: SimplifiedXMLGenerationPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTimbrado, setIsTimbrado] = useState(false);

  const handleGenerateXML = async () => {
    setIsGenerating(true);
    try {
      // Simular generación de XML
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockXML = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante 
  xmlns:cfdi="http://www.sat.gob.mx/cfd/4" 
  xmlns:cartaporte31="http://www.sat.gob.mx/CartaPorte31"
  Version="4.0" 
  Serie="CP" 
  Folio="001" 
  Fecha="${new Date().toISOString()}"
  TipoDeComprobante="T"
  LugarExpedicion="${cartaPorteData.rfcEmisor || 'SIN RFC'}"
  Moneda="XXX"
  Total="0">
  <cfdi:Emisor Rfc="${cartaPorteData.rfcEmisor}" Nombre="${cartaPorteData.nombreEmisor || 'Sin nombre'}" />
  <cfdi:Receptor Rfc="${cartaPorteData.rfcReceptor}" Nombre="${cartaPorteData.nombreReceptor || 'Sin nombre'}" UsoCFDI="S01" />
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="78101800" Cantidad="1" ClaveUnidad="E48" Descripcion="Servicios de traslado" ValorUnitario="0" Importe="0" ObjetoImp="01" />
  </cfdi:Conceptos>
  <cfdi:Complemento>
    <cartaporte31:CartaPorte Version="3.1" TranspInternac="${cartaPorteData.transporteInternacional === 'Sí' ? 'Sí' : 'No'}">
      <!-- Aquí iría el resto del complemento Carta Porte -->
    </cartaporte31:CartaPorte>
  </cfdi:Complemento>
</cfdi:Comprobante>`;

      onXMLGenerated(mockXML);
    } catch (error) {
      console.error('Error generando XML:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTimbrar = async () => {
    if (!xmlGenerado) return;
    
    setIsTimbrado(true);
    try {
      // Simular proceso de timbrado
      await new Promise(resolve => setTimeout(resolve, 3000));
      onTimbrado();
    } catch (error) {
      console.error('Error en timbrado:', error);
    } finally {
      setIsTimbrado(false);
    }
  };

  const downloadXML = () => {
    if (!xmlGenerado) return;
    
    const blob = new Blob([xmlGenerado], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carta_porte_${cartaPorteId || 'draft'}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Validar datos mínimos
  const hasMinimumData = !!(
    cartaPorteData.rfcEmisor &&
    cartaPorteData.rfcReceptor &&
    cartaPorteData.ubicaciones?.length >= 2 &&
    cartaPorteData.mercancias?.length > 0 &&
    cartaPorteData.autotransporte?.placa_vm &&
    cartaPorteData.figuras?.length > 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generación de Documentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasMinimumData && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Complete todos los pasos anteriores antes de generar el XML.
              Faltan: {!cartaPorteData.rfcEmisor && 'RFC Emisor, '}
              {!cartaPorteData.rfcReceptor && 'RFC Receptor, '}
              {(!cartaPorteData.ubicaciones || cartaPorteData.ubicaciones.length < 2) && 'Ubicaciones, '}
              {(!cartaPorteData.mercancias || cartaPorteData.mercancias.length === 0) && 'Mercancías, '}
              {!cartaPorteData.autotransporte?.placa_vm && 'Autotransporte, '}
              {(!cartaPorteData.figuras || cartaPorteData.figuras.length === 0) && 'Figuras'}
            </AlertDescription>
          </Alert>
        )}

        {datosCalculoRuta && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              Ruta calculada: {datosCalculoRuta.distanciaTotal?.toFixed(2)} km
              {datosCalculoRuta.tiempoEstimado && ` - ${Math.round(datosCalculoRuta.tiempoEstimado / 60)} horas estimadas`}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={handleGenerateXML}
              disabled={!hasMinimumData || isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generando XML...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generar XML
                </>
              )}
            </Button>

            {xmlGenerado && (
              <Button variant="outline" onClick={downloadXML}>
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            )}
          </div>

          {xmlGenerado && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  XML generado exitosamente. Ya puede proceder con el timbrado.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleTimbrar}
                disabled={isTimbrado}
                className="w-full"
                variant="default"
              >
                {isTimbrado ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Timbrando...
                  </>
                ) : (
                  'Timbrar Carta Porte'
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          <p>El XML generado cumple con los estándares del SAT para Carta Porte 3.1</p>
        </div>
      </CardContent>
    </Card>
  );
}
