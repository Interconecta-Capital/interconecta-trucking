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
      
      // Validar datos mínimos requeridos
      if (!data.cliente || !data.origen || !data.destino) {
        throw new Error('Faltan datos obligatorios: cliente, origen o destino');
      }

      // Mapear datos del wizard a formato CartaPorte corregido
      const cartaPorteData = {
        cartaPorteVersion: '3.1',
        rfcEmisor: 'XEXX010101000', // Default temporal
        nombreEmisor: 'Transportista Demo',
        regimenFiscalEmisor: '601',
        rfcReceptor: data.cliente.rfc || 'XEXX010101000',
        nombreReceptor: data.cliente.nombre_razon_social || 'Cliente Demo',
        usoCfdi: 'S01',
        tipoCfdi: 'T',
        transporteInternacional: false,
        registroIstmo: false,
        viaTransporte: '01',
        mercancias: [{
          id: `mercancia-${Date.now()}`,
          bienes_transp: '99999999',
          descripcion: data.descripcionMercancia || 'Mercancía general',
          cantidad: 1,
          clave_unidad: 'H87',
          peso_kg: 100,
          valor_mercancia: 1000,
          moneda: 'MXN',
          material_peligroso: false,
          especie_protegida: false,
          fraccion_arancelaria: '99999999'
        }],
        ubicaciones: [
          {
            id: 'OR000001',
            tipo_ubicacion: 'Origen',
            rfc: data.cliente.rfc || 'XEXX010101000',
            nombre: 'Origen',
            fecha_llegada_salida: data.origen.fechaHoraSalidaLlegada || new Date().toISOString(),
            fecha_hora_salida_llegada: data.origen.fechaHoraSalidaLlegada || new Date().toISOString(),
            distancia_recorrida: 0,
            coordenadas: data.origen.coordenadas,
            domicilio: data.origen.domicilio
          },
          {
            id: 'DE000001',
            tipo_ubicacion: 'Destino',
            rfc: data.cliente.rfc || 'XEXX010101000',
            nombre: 'Destino',
            fecha_llegada_salida: data.destino.fechaHoraSalidaLlegada || new Date().toISOString(),
            fecha_hora_salida_llegada: data.destino.fechaHoraSalidaLlegada || new Date().toISOString(),
            distancia_recorrida: data.distanciaRecorrida || 0,
            coordenadas: data.destino.coordenadas,
            domicilio: data.destino.domicilio
          }
        ],
        autotransporte: {
          placa_vm: data.vehiculo?.placa || 'DEMO123',
          anio_modelo_vm: data.vehiculo?.anio || new Date().getFullYear(),
          config_vehicular: data.vehiculo?.configuracion_vehicular || 'C2',
          perm_sct: 'TPAF03',
          num_permiso_sct: 'SCT-123456',
          asegura_resp_civil: 'SEGUROS SA',
          poliza_resp_civil: 'POL123456',
          asegura_med_ambiente: 'SEGUROS SA',
          poliza_med_ambiente: 'POL123456',
          peso_bruto_vehicular: data.vehiculo?.peso_bruto_vehicular || 3500,
          tipo_carroceria: '01'
        },
        figuras: [{
          id: `figura-${Date.now()}`,
          tipo_figura: '01',
          rfc_figura: data.conductor?.rfc || 'XEXX010101000',
          nombre_figura: data.conductor?.nombre || 'Conductor Demo',
          num_licencia: data.conductor?.num_licencia || 'LIC123456',
          tipo_licencia: data.conductor?.tipo_licencia || 'C'
        }]
      };
      
      // Generar XML usando un generador simplificado
      const xmlContent = generateSimpleXML(cartaPorteData);
      setXmlGenerated(xmlContent);
      
      console.log('✅ XML generado exitosamente');
      
    } catch (error) {
      console.error('❌ Error generando XML:', error);
      setXmlError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsGeneratingXML(false);
    }
  };

  // Generador XML simplificado para borradores
  const generateSimpleXML = (data: any) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante 
  xmlns:cfdi="http://www.sat.gob.mx/cfd/4" 
  xmlns:cartaporte31="http://www.sat.gob.mx/CartaPorte31"
  Version="4.0"
  TipoDeComprobante="T">
  
  <cfdi:Emisor Rfc="${data.rfcEmisor}" Nombre="${data.nombreEmisor}" />
  <cfdi:Receptor Rfc="${data.rfcReceptor}" Nombre="${data.nombreReceptor}" UsoCFDI="${data.usoCfdi}" />
  
  <cfdi:Complemento>
    <cartaporte31:CartaPorte Version="3.1">
      
      <cartaporte31:Ubicaciones>
        ${data.ubicaciones.map((ub: any) => `
        <cartaporte31:Ubicacion 
          TipoUbicacion="${ub.tipo_ubicacion}"
          IDUbicacion="${ub.id}"
          RFCRemitenteDestinatario="${ub.rfc}"
          FechaHoraSalidaLlegada="${ub.fecha_hora_salida_llegada}"
          ${ub.distancia_recorrida > 0 ? `DistanciaRecorrida="${ub.distancia_recorrida}"` : ''}>
          
          <cartaporte31:Domicilio 
            Calle="${ub.domicilio.calle}"
            CodigoPostal="${ub.domicilio.codigoPostal}"
            Estado="${ub.domicilio.estado}"
            Pais="${ub.domicilio.pais}" />
            
        </cartaporte31:Ubicacion>`).join('')}
      </cartaporte31:Ubicaciones>
      
      <cartaporte31:Mercancias>
        ${data.mercancias.map((merc: any) => `
        <cartaporte31:Mercancia 
          BienesTransp="${merc.bienes_transp}"
          Descripcion="${merc.descripcion}"
          Cantidad="${merc.cantidad}"
          ClaveUnidad="${merc.clave_unidad}"
          PesoEnKg="${merc.peso_kg}"
          ValorMercancia="${merc.valor_mercancia}"
          Moneda="${merc.moneda}"
          FraccionArancelaria="${merc.fraccion_arancelaria}" />`).join('')}
      </cartaporte31:Mercancias>
      
      <cartaporte31:Autotransporte 
        PermSCT="${data.autotransporte.perm_sct}"
        NumPermisoSCT="${data.autotransporte.num_permiso_sct}">
        
        <cartaporte31:IdentificacionVehicular 
          ConfigVehicular="${data.autotransporte.config_vehicular}"
          PlacaVM="${data.autotransporte.placa_vm}"
          AnioModeloVM="${data.autotransporte.anio_modelo_vm}" />
          
      </cartaporte31:Autotransporte>
      
      <cartaporte31:FiguraTransporte>
        ${data.figuras.map((fig: any) => `
        <cartaporte31:TiposFigura 
          TipoFigura="${fig.tipo_figura}"
          RFCFigura="${fig.rfc_figura}"
          NombreFigura="${fig.nombre_figura}"
          NumLicencia="${fig.num_licencia}" />`).join('')}
      </cartaporte31:FiguraTransporte>
      
    </cartaporte31:CartaPorte>
  </cfdi:Complemento>
  
</cfdi:Comprobante>`;
  };

  const handleGeneratePDF = async () => {
    if (!xmlGenerated) {
      await handleGenerateXML();
    }
    
    try {
      // Crear datos simplificados para PDF
      const simplifiedData = {
        cartaPorteVersion: '3.1',
        rfcEmisor: data.cliente?.rfc || 'DEMO',
        nombreEmisor: 'Transportista Demo',
        rfcReceptor: data.cliente?.rfc || 'DEMO',
        nombreReceptor: data.cliente?.nombre_razon_social || 'Cliente',
        mercancias: [],
        ubicaciones: [],
        autotransporte: {},
        figuras: []
      };
      
      await generarPDF(simplifiedData as any);
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
          {/* Auto-generate documents on mount */}
          <div className="flex gap-2 mb-4">
            <Button 
              onClick={handleGenerateXML}
              disabled={isGeneratingXML}
              size="sm"
            >
              {isGeneratingXML ? 'Generando...' : 'Generar Documentos'}
            </Button>
          </div>

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
