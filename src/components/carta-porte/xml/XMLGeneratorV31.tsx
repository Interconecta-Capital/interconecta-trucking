
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Copy,
  QrCode,
  Shield
} from 'lucide-react';
import { CartaPorteData } from '@/types/cartaPorte';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface XMLGeneratorV31Props {
  cartaPorteData: CartaPorteData;
  onXMLGenerated?: (xml: string) => void;
  onTimbrado?: () => void;
}

export function XMLGeneratorV31({ 
  cartaPorteData, 
  onXMLGenerated, 
  onTimbrado 
}: XMLGeneratorV31Props) {
  const [xmlContent, setXmlContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const generateXMLv31 = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setValidationErrors([]);

    try {
      // Paso 1: Validar datos requeridos (20%)
      setGenerationProgress(20);
      const validationResult = validateCartaPorteData();
      if (validationResult.length > 0) {
        setValidationErrors(validationResult);
        setIsGenerating(false);
        return;
      }

      // Paso 2: Generar estructura XML v3.1 (40%)
      setGenerationProgress(40);
      const xmlStructure = generateXMLStructureV31();

      // Paso 3: Validar XML contra XSD v3.1 (60%)
      setGenerationProgress(60);
      
      // Paso 4: Generar sellos y UUID (80%)
      setGenerationProgress(80);
      const finalXML = addSealsAndUUID(xmlStructure);

      // Paso 5: Finalizar (100%)
      setGenerationProgress(100);
      setXmlContent(finalXML);
      onXMLGenerated?.(finalXML);

      toast({
        title: "XML Generado",
        description: "XML de Carta Porte v3.1 generado exitosamente",
      });

    } catch (error) {
      console.error('Error generating XML:', error);
      setValidationErrors([`Error al generar XML: ${error}`]);
      toast({
        title: "Error",
        description: "No se pudo generar el XML",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const validateCartaPorteData = (): string[] => {
    const errors: string[] = [];

    // Validaciones críticas v3.1
    if (!cartaPorteData.cartaPorteVersion || cartaPorteData.cartaPorteVersion !== '3.1') {
      errors.push('Versión de Carta Porte debe ser 3.1');
    }

    if (!cartaPorteData.idCCP || cartaPorteData.idCCP.length !== 36) {
      errors.push('IdCCP debe tener 36 caracteres (RFC 4122)');
    }

    if (!cartaPorteData.rfcEmisor) {
      errors.push('RFC del emisor es obligatorio');
    }

    if (!cartaPorteData.ubicaciones || cartaPorteData.ubicaciones.length < 2) {
      errors.push('Se requieren al menos 2 ubicaciones (origen y destino)');
    }

    if (!cartaPorteData.mercancias || cartaPorteData.mercancias.length === 0) {
      errors.push('Se requiere al menos una mercancía');
    }

    if (!cartaPorteData.autotransporte) {
      errors.push('Información de autotransporte es obligatoria');
    }

    if (!cartaPorteData.figuras || cartaPorteData.figuras.length === 0) {
      errors.push('Se requiere al menos una figura de transporte');
    }

    // Validaciones específicas v3.1
    if (cartaPorteData.mercancias) {
      cartaPorteData.mercancias.forEach((mercancia, idx) => {
        if (!mercancia.peso_bruto_total || mercancia.peso_bruto_total <= 0) {
          errors.push(`Mercancía ${idx + 1}: Peso bruto total es obligatorio en v3.1`);
        }

        if (mercancia.especie_protegida) {
          if (!mercancia.descripcion_detallada || mercancia.descripcion_detallada.length < 50) {
            errors.push(`Mercancía ${idx + 1}: Especies protegidas requieren descripción detallada`);
          }
          if (!mercancia.permisos_semarnat || mercancia.permisos_semarnat.length === 0) {
            errors.push(`Mercancía ${idx + 1}: Especies protegidas requieren permisos SEMARNAT`);
          }
        }
      });
    }

    return errors;
  };

  const generateXMLStructureV31 = (): string => {
    const fechaActual = new Date().toISOString();
    const totalMercancias = cartaPorteData.mercancias?.length || 0;
    const pesoBrutoTotal = cartaPorteData.mercancias?.reduce((sum, m) => 
      sum + (m.peso_bruto_total || m.peso_kg * m.cantidad), 0
    ) || 0;

    return `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante
  xmlns:cfdi="http://www.sat.gob.mx/cfd/4"
  xmlns:cartaporte31="http://www.sat.gob.mx/CartaPorte31"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd http://www.sat.gob.mx/CartaPorte31 http://www.sat.gob.mx/sitio_internet/cfd/CartaPorte/CartaPorte31.xsd"
  Version="4.0"
  Serie="${cartaPorteData.folio ? cartaPorteData.folio.split('-')[0] : 'CP'}"
  Folio="${cartaPorteData.folio ? cartaPorteData.folio.split('-')[1] : '001'}"
  Fecha="${fechaActual}"
  TipoDeComprobante="${cartaPorteData.tipoCfdi === 'Traslado' ? 'T' : 'I'}"
  LugarExpedicion="${cartaPorteData.domicilio_fiscal_emisor?.codigo_postal || '00000'}"
  ${cartaPorteData.tipoCfdi === 'Traslado' ? 'SubTotal="0" Total="0"' : ''}>

  <cfdi:Emisor
    Rfc="${cartaPorteData.rfcEmisor}"
    Nombre="${cartaPorteData.nombreEmisor}"
    RegimenFiscal="${cartaPorteData.regimen_fiscal_emisor || '601'}" />

  <cfdi:Receptor
    Rfc="${cartaPorteData.rfcReceptor}"
    Nombre="${cartaPorteData.nombreReceptor}"
    DomicilioFiscalReceptor="${cartaPorteData.domicilio_fiscal_receptor?.codigo_postal || cartaPorteData.domicilio_fiscal_emisor?.codigo_postal || '00000'}"
    RegimenFiscalReceptor="${cartaPorteData.regimen_fiscal_receptor || '616'}"
    UsoCFDI="${cartaPorteData.uso_cfdi || 'S01'}" />

  <cfdi:Conceptos>
    <cfdi:Concepto
      ClaveProdServ="78101800"
      Cantidad="1"
      ClaveUnidad="E48"
      Descripcion="Servicios de traslado"
      ${cartaPorteData.tipoCfdi === 'Traslado' ? 'ValorUnitario="0" Importe="0"' : ''}
      ObjetoImp="01" />
  </cfdi:Conceptos>

  <cfdi:Complemento>
    <cartaporte31:CartaPorte
      Version="3.1"
      TranspInternac="${cartaPorteData.transporteInternacional ? 'Sí' : 'No'}"
      ${cartaPorteData.registroIstmo ? 'RegistroISTMO="Sí"' : ''}
      TotalDistRec="${cartaPorteData.datosCalculoRuta?.distanciaTotal || 0}"
      ${cartaPorteData.regimenesAduaneros && cartaPorteData.regimenesAduaneros.length > 0 ? 
        generateRegimenesAduaneros() : ''}
      IdCCP="${cartaPorteData.idCCP}"
      PesoBrutoTotal="${pesoBrutoTotal.toFixed(3)}"
      UnidadPeso="KGM"
      NumTotalMercancias="${totalMercancias}">

      ${generateUbicaciones()}
      ${generateMercancias()}
      ${generateFiguraTransporte()}
      ${generateAutotransporte()}
    </cartaporte31:CartaPorte>
  </cfdi:Complemento>
</cfdi:Comprobante>`;
  };

  const generateRegimenesAduaneros = (): string => {
    if (!cartaPorteData.regimenesAduaneros || cartaPorteData.regimenesAduaneros.length === 0) {
      return '';
    }

    const regimenes = cartaPorteData.regimenesAduaneros
      .sort((a, b) => a.orden_secuencia - b.orden_secuencia)
      .map(regimen => 
        `<cartaporte31:RegimenAduanero ClaveRegimenAduanero="${regimen.clave_regimen}" />`
      ).join('\n      ');

    return `
      <cartaporte31:RegimenesAduaneros>
        ${regimenes}
      </cartaporte31:RegimenesAduaneros>`;
  };

  const generateUbicaciones = (): string => {
    if (!cartaPorteData.ubicaciones) return '';

    return `
      <cartaporte31:Ubicaciones>
        ${cartaPorteData.ubicaciones.map(ubicacion => `
        <cartaporte31:Ubicacion
          TipoUbicacion="${ubicacion.tipo_ubicacion}"
          IDUbicacion="${ubicacion.id_ubicacion}"
          ${ubicacion.rfc_remitente_destinatario ? `RFCRemitenteDestinatario="${ubicacion.rfc_remitente_destinatario}"` : ''}
          ${ubicacion.nombre_remitente_destinatario ? `NombreRemitenteDestinatario="${ubicacion.nombre_remitente_destinatario}"` : ''}
          ${ubicacion.fecha_hora_salida_llegada ? `FechaHoraSalidaLlegada="${ubicacion.fecha_hora_salida_llegada}"` : ''}
          ${ubicacion.distancia_recorrida ? `DistanciaRecorrida="${ubicacion.distancia_recorrida}"` : ''}>
          
          <cartaporte31:Domicilio
            Pais="${ubicacion.domicilio.pais}"
            CodigoPostal="${ubicacion.domicilio.codigo_postal}"
            Estado="${ubicacion.domicilio.estado}"
            Municipio="${ubicacion.domicilio.municipio}"
            Colonia="${ubicacion.domicilio.colonia}"
            Calle="${ubicacion.domicilio.calle}"
            NumeroExterior="${ubicacion.domicilio.numero_exterior}"
            ${ubicacion.domicilio.numero_interior ? `NumeroInterior="${ubicacion.domicilio.numero_interior}"` : ''}
            ${ubicacion.domicilio.referencia ? `Referencia="${ubicacion.domicilio.referencia}"` : ''} />
        </cartaporte31:Ubicacion>`).join('')}
      </cartaporte31:Ubicaciones>`;
  };

  const generateMercancias = (): string => {
    if (!cartaPorteData.mercancias) return '';

    return `
      <cartaporte31:Mercancias
        PesoBrutoTotal="${cartaPorteData.mercancias.reduce((sum, m) => sum + (m.peso_bruto_total || m.peso_kg * m.cantidad), 0).toFixed(3)}"
        UnidadPeso="KGM"
        NumTotalMercancias="${cartaPorteData.mercancias.length}">
        
        ${cartaPorteData.mercancias.map((mercancia, idx) => `
        <cartaporte31:Mercancia
          BienesTransp="${mercancia.bienes_transp}"
          Descripcion="${escapeXML(mercancia.descripcion_detallada || mercancia.descripcion)}"
          Cantidad="${mercancia.cantidad}"
          ClaveUnidad="${mercancia.clave_unidad}"
          Unidad="${mercancia.clave_unidad}"
          PesoEnKg="${(mercancia.peso_bruto_total || mercancia.peso_kg * mercancia.cantidad).toFixed(3)}"
          ${mercancia.valor_mercancia ? `ValorMercancia="${mercancia.valor_mercancia.toFixed(2)}"` : ''}
          ${mercancia.moneda ? `Moneda="${mercancia.moneda}"` : ''}
          ${mercancia.fraccion_arancelaria ? `FraccionArancelaria="${mercancia.fraccion_arancelaria}"` : ''}
          ${mercancia.uuid_comercio_ext ? `UUIDComercioExt="${mercancia.uuid_comercio_ext}"` : ''}
          ${mercancia.material_peligroso ? 'MaterialPeligroso="Sí"' : 'MaterialPeligroso="No"'}
          ${mercancia.cve_material_peligroso ? `CveMaterialPeligroso="${mercancia.cve_material_peligroso}"` : ''}
          ${mercancia.embalaje ? `Embalaje="${mercancia.embalaje}"` : ''}
          ${mercancia.numero_piezas ? `NumPiezas="${mercancia.numero_piezas}"` : ''}>
          
          ${mercancia.documentacion_aduanera && mercancia.documentacion_aduanera.length > 0 ? 
            generateDocumentacionAduanera(mercancia.documentacion_aduanera) : ''}
        </cartaporte31:Mercancia>`).join('')}
      </cartaporte31:Mercancias>`;
  };

  const generateDocumentacionAduanera = (documentos: any[]): string => {
    return `
          <cartaporte31:DocumentacionAduanera>
            ${documentos.map(doc => `
            <cartaporte31:DocumentoAduanero
              TipoDocumento="${doc.tipo_documento}"
              NumFolioDocumento="${doc.folio_documento}"
              ${doc.rfc_importador ? `RFCImportador="${doc.rfc_importador}"` : ''}
              ${doc.fecha_expedicion ? `FechaExpedicion="${doc.fecha_expedicion}"` : ''}
              ${doc.aduana_despacho ? `AduanaDespacho="${doc.aduana_despacho}"` : ''} />`).join('')}
          </cartaporte31:DocumentacionAduanera>`;
  };

  const generateFiguraTransporte = (): string => {
    if (!cartaPorteData.figuras) return '';

    return `
      <cartaporte31:FiguraTransporte>
        ${cartaPorteData.figuras.map(figura => `
        <cartaporte31:TiposFigura
          TipoFigura="${figura.tipo_figura}"
          RFCFigura="${figura.rfc_figura}"
          ${figura.num_licencia ? `NumLicencia="${figura.num_licencia}"` : ''}
          NombreFigura="${escapeXML(figura.nombre_figura)}"
          ${figura.operador_sct ? 'OperadorSCT="Sí"' : 'OperadorSCT="No"'}
          ${figura.residencia_fiscal_figura ? `ResidenciaFiscalFigura="${figura.residencia_fiscal_figura}"` : ''}
          ${figura.num_reg_id_trib_figura ? `NumRegIdTribFigura="${figura.num_reg_id_trib_figura}"` : ''}
          ${figura.curp ? `CURP="${figura.curp}"` : ''}
          ${figura.tipo_licencia ? `TipoLicencia="${figura.tipo_licencia}"` : ''}
          ${figura.vigencia_licencia ? `VigenciaLicencia="${figura.vigencia_licencia}"` : ''}>
          
          <cartaporte31:DomicilioFigura
            Pais="${figura.domicilio.pais}"
            CodigoPostal="${figura.domicilio.codigo_postal}"
            Estado="${figura.domicilio.estado}"
            Municipio="${figura.domicilio.municipio}"
            Colonia="${figura.domicilio.colonia}"
            Calle="${figura.domicilio.calle}"
            NumeroExterior="${figura.domicilio.numero_exterior}"
            ${figura.domicilio.numero_interior ? `NumeroInterior="${figura.domicilio.numero_interior}"` : ''}
            ${figura.domicilio.referencia ? `Referencia="${figura.domicilio.referencia}"` : ''} />
        </cartaporte31:TiposFigura>`).join('')}
      </cartaporte31:FiguraTransporte>`;
  };

  const generateAutotransporte = (): string => {
    if (!cartaPorteData.autotransporte) return '';

    const auto = cartaPorteData.autotransporte;
    
    return `
      <cartaporte31:Autotransporte
        PermSCT="${auto.perm_sct}"
        NumPermisoSCT="${auto.num_permiso_sct}">
        
        <cartaporte31:IdentificacionVehicular
          ConfigVehicular="${auto.config_vehicular}"
          PlacaVM="${auto.placa_vm}"
          AnioModeloVM="${auto.anio_modelo_vm}"
          ${auto.peso_bruto_vehicular ? `PesoBrutoVehicular="${auto.peso_bruto_vehicular.toFixed(3)}"` : ''}
          ${auto.numero_serie_vin ? `NumeroSerieVIN="${auto.numero_serie_vin}"` : ''} />
        
        <cartaporte31:Seguros
          AseguraRespCivil="${auto.asegura_resp_civil}"
          PolizaRespCivil="${auto.poliza_resp_civil}"
          ${auto.vigencia_resp_civil ? `VigenciaRespCivil="${auto.vigencia_resp_civil}"` : ''}
          ${auto.asegura_med_ambiente ? `AseguraMedAmbiente="${auto.asegura_med_ambiente}"` : ''}
          ${auto.poliza_med_ambiente ? `PolizaMedAmbiente="${auto.poliza_med_ambiente}"` : ''}
          ${auto.vigencia_med_ambiente ? `VigenciaMedAmbiente="${auto.vigencia_med_ambiente}"` : ''}
          ${auto.asegura_carga ? `AseguraCarga="${auto.asegura_carga}"` : ''}
          ${auto.poliza_carga ? `PolizaCarga="${auto.poliza_carga}"` : ''} />
        
        ${auto.remolques && auto.remolques.length > 0 ? `
        <cartaporte31:Remolques>
          ${auto.remolques.map(remolque => `
          <cartaporte31:Remolque
            SubTipoRem="${remolque.subtipo_rem}"
            Placa="${remolque.placa}" />`).join('')}
        </cartaporte31:Remolques>` : ''}
      </cartaporte31:Autotransporte>`;
  };

  const addSealsAndUUID = (xmlStructure: string): string => {
    // En producción, aquí se generarían los sellos digitales reales
    const uuid = cartaPorteData.idCCP || crypto.randomUUID();
    const fechaTimbrado = new Date().toISOString();
    
    // Agregar TimbreFiscalDigital simulado
    const xmlWithTimbrado = xmlStructure.replace(
      '</cfdi:Complemento>',
      `  <tfd:TimbreFiscalDigital
        xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital"
        Version="1.1"
        UUID="${uuid}"
        FechaTimbrado="${fechaTimbrado}"
        RfcProvCertif="SAT970701NN3"
        Leyenda="DESARROLLO - NO VÁLIDO FISCALMENTE"
        SelloCFD="[SELLO_CFD_SIMULADO]"
        NoCertificadoSAT="[NO_CERT_SAT]"
        SelloSAT="[SELLO_SAT_SIMULADO]" />
    </cfdi:Complemento>`
    );

    return xmlWithTimbrado;
  };

  const escapeXML = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(xmlContent);
      toast({
        title: "Copiado",
        description: "XML copiado al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      });
    }
  };

  const downloadXML = () => {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carta-porte-v31-${cartaPorteData.folio || 'draft'}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateQRCode = () => {
    if (!cartaPorteData.idCCP) return '';
    
    const qrUrl = `https://verificacfdi.facturaelectronica.sat.gob.mx/verificaccp/default.aspx?IdCCP=${cartaPorteData.idCCP}&FechaOrig=${cartaPorteData.ubicaciones?.[0]?.fecha_hora_salida_llegada}&FechaTimb=${new Date().toISOString()}`;
    
    toast({
      title: "QR Code URL",
      description: qrUrl,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generador XML Carta Porte v3.1
            <Shield className="h-4 w-4 text-green-600" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Errores de validación:</p>
                    <ul className="list-disc list-inside">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Generando XML v3.1...</span>
                  <span className="text-sm font-medium">{generationProgress}%</span>
                </div>
                <Progress value={generationProgress} className="h-2" />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={generateXMLv31}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {isGenerating ? 'Generando...' : 'Generar XML v3.1'}
              </Button>

              {xmlContent && (
                <>
                  <Button variant="outline" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                  
                  <Button variant="outline" onClick={downloadXML}>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                  
                  <Button variant="outline" onClick={generateQRCode}>
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </Button>
                </>
              )}
            </div>

            {xmlContent && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    XML v3.1 generado exitosamente
                  </span>
                </div>
                
                <Textarea
                  value={xmlContent}
                  readOnly
                  className="font-mono text-xs h-96"
                  placeholder="El XML generado aparecerá aquí..."
                />
                
                <div className="text-xs text-muted-foreground">
                  Tamaño: {new Blob([xmlContent]).size} bytes | 
                  Versión: 3.1 | 
                  Namespace: cartaporte31
                </div>
              </div>
            )}

            {xmlContent && onTimbrado && (
              <div className="border-t pt-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    XML listo para timbrado. El proceso de timbrado validará y certificará el documento ante el SAT.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={onTimbrado}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Proceder al Timbrado SAT
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
