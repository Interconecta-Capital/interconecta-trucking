import { CartaPorteData } from '@/types/cartaPorte';

/**
 * Generador de XML para 2 casos de uso:
 * 
 * CASO 1: Factura con Complemento Carta Porte (TipoDeComprobante = "I")
 *   - Cuando hay cobro por servicio de transporte
 *   - Genera conceptos con valores reales
 *   - Calcula IVA y totales
 * 
 * CASO 2: CFDI de Traslado con Complemento Carta Porte (TipoDeComprobante = "T")
 *   - Cuando es transporte propio (sin cobro)
 *   - Conceptos con valor $0
 *   - Sin impuestos
 */

export interface OpcionesXML {
  esFactura: boolean;           // true = Factura (I), false = Traslado (T)
  montoServicio?: number;       // Solo si esFactura = true
  conceptosFactura?: ConceptoFactura[];
  tasaIVA?: number;             // Default 16%
}

export interface ConceptoFactura {
  claveProdServ: string;
  cantidad: number;
  claveUnidad: string;
  unidad: string;
  descripcion: string;
  valorUnitario: number;
  importe: number;
}

export class XMLFacturaCartaPorteGenerator {
  
  /**
   * Genera XML según el tipo de comprobante
   */
  static generarXML(data: CartaPorteData, opciones: OpcionesXML): string {
    if (opciones.esFactura) {
      return this.generarFacturaConCP(data, opciones);
    } else {
      return this.generarTrasladoConCP(data);
    }
  }

  /**
   * Genera Factura (Tipo I) con Complemento Carta Porte
   */
  private static generarFacturaConCP(data: CartaPorteData, opciones: OpcionesXML): string {
    const conceptos = opciones.conceptosFactura || this.generarConceptosDefault(opciones.montoServicio || 0);
    const subtotal = conceptos.reduce((sum, c) => sum + c.importe, 0);
    const tasaIVA = opciones.tasaIVA || 0.16;
    const iva = subtotal * tasaIVA;
    const total = subtotal + iva;
    const dataAny = data as any;

    return `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante
  xmlns:cfdi="http://www.sat.gob.mx/cfd/4"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:cartaporte31="http://www.sat.gob.mx/CartaPorte31"
  xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd http://www.sat.gob.mx/CartaPorte31 http://www.sat.gob.mx/sitio_internet/cfd/CartaPorte/CartaPorte31.xsd"
  Version="4.0"
  Serie="CP"
  Folio="${dataAny.folio || Date.now().toString().slice(-6)}"
  Fecha="${new Date().toISOString()}"
  FormaPago="99"
  SubTotal="${subtotal.toFixed(2)}"
  Moneda="MXN"
  Total="${total.toFixed(2)}"
  TipoDeComprobante="I"
  MetodoPago="PUE"
  LugarExpedicion="${dataAny.codigoPostalEmisor || '00000'}"
  Exportacion="01">
  
  <cfdi:Emisor
    Rfc="${data.rfcEmisor}"
    Nombre="${data.nombreEmisor}"
    RegimenFiscal="${data.regimenFiscalEmisor || '601'}" />
  
  <cfdi:Receptor
    Rfc="${data.rfcReceptor}"
    Nombre="${data.nombreReceptor}"
    DomicilioFiscalReceptor="${dataAny.codigoPostalReceptor || '00000'}"
    RegimenFiscalReceptor="${dataAny.regimenFiscalReceptor || '601'}"
    UsoCFDI="G03" />
  
  <cfdi:Conceptos>
    ${conceptos.map(c => `
    <cfdi:Concepto
      ClaveProdServ="${c.claveProdServ}"
      Cantidad="${c.cantidad}"
      ClaveUnidad="${c.claveUnidad}"
      Unidad="${c.unidad}"
      Descripcion="${c.descripcion}"
      ValorUnitario="${c.valorUnitario.toFixed(2)}"
      Importe="${c.importe.toFixed(2)}"
      ObjetoImp="02">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado
            Base="${c.importe.toFixed(2)}"
            Impuesto="002"
            TipoFactor="Tasa"
            TasaOCuota="${tasaIVA.toFixed(6)}"
            Importe="${(c.importe * tasaIVA).toFixed(2)}" />
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>`).join('')}
  </cfdi:Conceptos>
  
  <cfdi:Impuestos TotalImpuestosTrasladados="${iva.toFixed(2)}">
    <cfdi:Traslados>
      <cfdi:Traslado
        Base="${subtotal.toFixed(2)}"
        Impuesto="002"
        TipoFactor="Tasa"
        TasaOCuota="${tasaIVA.toFixed(6)}"
        Importe="${iva.toFixed(2)}" />
    </cfdi:Traslados>
  </cfdi:Impuestos>
  
  <cfdi:Complemento>
    ${this.generarComplementoCartaPorte(data)}
  </cfdi:Complemento>
</cfdi:Comprobante>`;
  }

  /**
   * Genera Traslado (Tipo T) con Complemento Carta Porte
   */
  private static generarTrasladoConCP(data: CartaPorteData): string {
    const dataAny = data as any;
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante
  xmlns:cfdi="http://www.sat.gob.mx/cfd/4"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:cartaporte31="http://www.sat.gob.mx/CartaPorte31"
  xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd http://www.sat.gob.mx/CartaPorte31 http://www.sat.gob.mx/sitio_internet/cfd/CartaPorte/CartaPorte31.xsd"
  Version="4.0"
  Serie="CP"
  Folio="${dataAny.folio || Date.now().toString().slice(-6)}"
  Fecha="${new Date().toISOString()}"
  SubTotal="0"
  Moneda="XXX"
  Total="0"
  TipoDeComprobante="T"
  LugarExpedicion="${dataAny.codigoPostalEmisor || '00000'}"
  Exportacion="01">
  
  <cfdi:Emisor
    Rfc="${data.rfcEmisor}"
    Nombre="${data.nombreEmisor}"
    RegimenFiscal="${data.regimenFiscalEmisor || '601'}" />
  
  <cfdi:Receptor
    Rfc="${data.rfcReceptor}"
    Nombre="${data.nombreReceptor}"
    DomicilioFiscalReceptor="${dataAny.codigoPostalReceptor || '00000'}"
    RegimenFiscalReceptor="${dataAny.regimenFiscalReceptor || '601'}"
    UsoCFDI="G03" />
  
  <cfdi:Conceptos>
    <cfdi:Concepto
      ClaveProdServ="78101800"
      Cantidad="1"
      ClaveUnidad="E48"
      Unidad="Servicio"
      Descripcion="Servicio de transporte de carga"
      ValorUnitario="0"
      Importe="0"
      ObjetoImp="01" />
  </cfdi:Conceptos>
  
  <cfdi:Complemento>
    ${this.generarComplementoCartaPorte(data)}
  </cfdi:Complemento>
</cfdi:Comprobante>`;
  }

  /**
   * Genera el complemento de Carta Porte (común para ambos tipos)
   */
  private static generarComplementoCartaPorte(data: CartaPorteData): string {
    const dataAny = data as any;
    const idCCP = dataAny.cartaPorteId || `CCP${Date.now().toString().slice(-8)}`;
    
    return `<cartaporte31:CartaPorte
      Version="3.1"
      TranspInternac="${dataAny.transporteInternacional ? 'Sí' : 'No'}"
      IdCCP="${idCCP}">
      ${this.generarUbicaciones(data)}
      ${this.generarMercancias(data)}
      ${this.generarFiguraTransporte(data)}
    </cartaporte31:CartaPorte>`;
  }

  /**
   * Genera nodo de Ubicaciones
   */
  private static generarUbicaciones(data: CartaPorteData): string {
    const ubicaciones = data.ubicaciones || [];
    return `<cartaporte31:Ubicaciones>
      ${ubicaciones.map((ub: any, index: number) => {
        const tipo = ub.tipo_ubicacion || ub.tipoUbicacion || 'Origen';
        const domicilio = ub.domicilio || {};
        return `<cartaporte31:Ubicacion
          TipoUbicacion="${tipo}"
          IDUbicacion="${ub.id_ubicacion || ub.idUbicacion || `UB${(index + 1).toString().padStart(6, '0')}`}"
          RFCRemitenteDestinatario="${ub.rfc_remitente_destinatario || 'XAXX010101000'}"
          ${tipo === 'Destino' ? `DistanciaRecorrida="${ub.distancia_recorrida || ub.distanciaRecorrida || 0}"` : ''}>
          <cartaporte31:Domicilio
            Calle="${domicilio.calle || 'Sin calle'}"
            CodigoPostal="${domicilio.codigo_postal || domicilio.codigoPostal || '00000'}"
            Estado="${domicilio.estado || 'Sin estado'}"
            Pais="MEX" />
        </cartaporte31:Ubicacion>`;
      }).join('\n      ')}
    </cartaporte31:Ubicaciones>`;
  }

  /**
   * Genera nodo de Mercancías
   */
  private static generarMercancias(data: CartaPorteData): string {
    const mercancias = data.mercancias || [];
    const pesoTotal = mercancias.reduce((sum: number, m: any) => sum + (m.peso_kg || 0), 0);
    
    return `<cartaporte31:Mercancias
      PesoBrutoTotal="${pesoTotal.toFixed(2)}"
      UnidadPeso="KGM"
      NumTotalMercancias="${mercancias.length}">
      ${mercancias.map((m: any, index: number) => `
      <cartaporte31:Mercancia
        BienesTransp="${m.bienes_transp || '10101500'}"
        Descripcion="${m.descripcion || 'Mercancía general'}"
        Cantidad="${m.cantidad || 1}"
        ClaveUnidad="${m.clave_unidad || 'KGM'}"
        PesoEnKg="${m.peso_kg || 1}" />`).join('')}
      ${this.generarAutotransporte(data)}
    </cartaporte31:Mercancias>`;
  }

  /**
   * Genera nodo de Autotransporte
   */
  private static generarAutotransporte(data: CartaPorteData): string {
    const auto = data.autotransporte;
    if (!auto) return '';
    
    return `<cartaporte31:Autotransporte
      PermSCT="${auto.perm_sct || 'TPAF01'}"
      NumPermisoSCT="${auto.num_permiso_sct || 'SIN-PERMISO'}">
      <cartaporte31:IdentificacionVehicular
        ConfigVehicular="${auto.config_vehicular || 'C2'}"
        PlacaVM="${auto.placa_vm || 'SIN-PLACA'}"
        AnioModeloVM="${auto.anio_modelo_vm || new Date().getFullYear()}" />
      <cartaporte31:Seguros
        AseguraRespCivil="${auto.asegura_resp_civil || 'Sin aseguradora'}"
        PolizaRespCivil="${auto.poliza_resp_civil || 'SIN-POLIZA'}" />
    </cartaporte31:Autotransporte>`;
  }

  /**
   * Genera nodo de FiguraTransporte
   */
  private static generarFiguraTransporte(data: CartaPorteData): string {
    const figuras = data.figuras || [];
    if (figuras.length === 0) return '';
    
    return `<cartaporte31:FiguraTransporte>
      ${figuras.map((f: any) => `
      <cartaporte31:TiposFigura
        TipoFigura="${f.tipo_figura || '01'}"
        RFCFigura="${f.rfc_figura}"
        NombreFigura="${f.nombre_figura}" />`).join('')}
    </cartaporte31:FiguraTransporte>`;
  }

  /**
   * Genera conceptos por defecto para facturas
   */
  private static generarConceptosDefault(monto: number): ConceptoFactura[] {
    return [{
      claveProdServ: '78101800',
      cantidad: 1,
      claveUnidad: 'E48',
      unidad: 'Servicio',
      descripcion: 'Servicio de transporte de carga por carretera',
      valorUnitario: monto,
      importe: monto
    }];
  }

  /**
   * Valida el tipo de comprobante según el contexto
   */
  static validarTipoComprobante(data: CartaPorteData): {
    tipoRecomendado: 'I' | 'T';
    razon: string;
  } {
    // Si hay un monto de servicio o concepto con valor, debe ser Ingreso (I)
    const tieneValorMonetario = (data as any).montoServicio && (data as any).montoServicio > 0;
    
    if (tieneValorMonetario) {
      return {
        tipoRecomendado: 'I',
        razon: 'Existe un cobro por servicio de transporte'
      };
    }
    
    return {
      tipoRecomendado: 'T',
      razon: 'Es transporte propio sin cobro (traslado)'
    };
  }
}
