
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';
import { Ubicacion } from '@/types/ubicaciones';
import { SATValidation } from '@/utils/satValidation';

export interface XMLGenerationResult {
  success: boolean;
  xml?: string;
  errors?: string[];
  warnings?: string[];
}

export interface TimbradoConfig {
  produccion: boolean;
  usuario: string;
  password: string;
  url?: string;
}

export class XMLCartaPorteGenerator {
  private static readonly NAMESPACE = {
    cfdi: 'http://www.sat.gob.mx/cfd/4',
    cartaporte31: 'http://www.sat.gob.mx/CartaPorte31',
    xsi: 'http://www.w3.org/2001/XMLSchema-instance'
  };

  static async generarXML(data: CartaPorteData): Promise<XMLGenerationResult> {
    try {
      // Validar datos antes de generar XML
      const erroresValidacion = await SATValidation.validarCartaPorteCompleta(data);
      if (erroresValidacion.some(e => !e.isValid)) {
        return {
          success: false,
          errors: erroresValidacion.filter(e => !e.isValid).map(e => e.message || 'Error de validación')
        };
      }

      const xml = this.construirXML(data);
      
      return {
        success: true,
        xml,
        warnings: this.obtenerAdvertencias(data)
      };
    } catch (error) {
      console.error('Error generando XML:', error);
      return {
        success: false,
        errors: [`Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`]
      };
    }
  }

  private static construirXML(data: CartaPorteData): string {
    const fechaActual = new Date().toISOString();
    const folio = this.generarFolio();
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante 
  xmlns:cfdi="${this.NAMESPACE.cfdi}"
  xmlns:cartaporte31="${this.NAMESPACE.cartaporte31}"
  xmlns:xsi="${this.NAMESPACE.xsi}"
  xsi:schemaLocation="${this.NAMESPACE.cfdi} http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd ${this.NAMESPACE.cartaporte31} http://www.sat.gob.mx/sitio_internet/cfd/CartaPorte31/CartaPorte31.xsd"
  Version="4.0"
  Serie="CP"
  Folio="${folio}"
  Fecha="${fechaActual}"
  TipoDeComprobante="${data.tipoCfdi === 'Traslado' ? 'T' : 'I'}"
  SubTotal="0"
  Total="0"
  Moneda="XXX"
  LugarExpedicion="${this.obtenerCodigoPostalExpedicion(data)}">
  
  ${this.construirEmisor(data)}
  ${this.construirReceptor(data)}
  ${this.construirConceptos(data)}
  ${this.construirComplemento(data)}
  
</cfdi:Comprobante>`;
  }

  private static construirEmisor(data: CartaPorteData): string {
    return `<cfdi:Emisor 
    Rfc="${data.rfcEmisor}" 
    Nombre="${data.nombreEmisor}"
    RegimenFiscal="601" />`;
  }

  private static construirReceptor(data: CartaPorteData): string {
    return `<cfdi:Receptor 
    Rfc="${data.rfcReceptor}" 
    Nombre="${data.nombreReceptor}"
    DomicilioFiscalReceptor="${this.obtenerCodigoPostalReceptor(data)}"
    RegimenFiscalReceptor="601"
    UsoCFDI="S01" />`;
  }

  private static construirConceptos(data: CartaPorteData): string {
    const conceptos = data.mercancias.map((mercancia, index) => {
      return `<cfdi:Concepto 
        ClaveProdServ="${mercancia.bienes_transp || '78101800'}"
        Cantidad="${mercancia.cantidad || 1}"
        ClaveUnidad="${mercancia.clave_unidad || 'KGM'}"
        Descripcion="${mercancia.descripcion || 'Servicio de transporte de carga'}"
        ValorUnitario="0"
        Importe="0"
        ObjetoImp="01" />`;
    }).join('\n    ');

    return `<cfdi:Conceptos>
    ${conceptos}
  </cfdi:Conceptos>`;
  }

  private static construirComplemento(data: CartaPorteData): string {
    return `<cfdi:Complemento>
    ${this.construirCartaPorte(data)}
  </cfdi:Complemento>`;
  }

  private static construirCartaPorte(data: CartaPorteData): string {
    const distanciaTotal = this.calcularDistanciaTotal(data.ubicaciones);
    
    return `<cartaporte31:CartaPorte 
      Version="3.1" 
      TranspInternac="${data.transporteInternacional ? 'Sí' : 'No'}"
      ${data.transporteInternacional ? this.construirAtributosInternacionales(data) : ''}
      TotalDistRec="${distanciaTotal}">
      
      ${this.construirUbicaciones(data.ubicaciones)}
      ${this.construirMercancias(data.mercancias)}
      ${this.construirFiguraTransporte(data.figuras)}
      ${this.construirAutotransporte(data.autotransporte)}
      
    </cartaporte31:CartaPorte>`;
  }

  private static construirUbicaciones(ubicaciones: Ubicacion[]): string {
    if (!ubicaciones || ubicaciones.length === 0) return '';
    
    const ubicacionesXML = ubicaciones.map((ubicacion, index) => {
      return `<cartaporte31:Ubicacion
        TipoUbicacion="${ubicacion.tipoUbicacion}"
        IDUbicacion="${ubicacion.idUbicacion}"
        RFCRemitenteDestinatario="${ubicacion.rfcRemitenteDestinatario || ''}"
        NombreRemitenteDestinatario="${ubicacion.nombreRemitenteDestinatario || ''}"
        ${ubicacion.fechaHoraSalidaLlegada ? `FechaHoraSalidaLlegada="${ubicacion.fechaHoraSalidaLlegada}"` : ''}
        ${ubicacion.distanciaRecorrida ? `DistanciaRecorrida="${ubicacion.distanciaRecorrida}"` : ''}>
        
        ${this.construirDomicilio(ubicacion.domicilio)}
        
      </cartaporte31:Ubicacion>`;
    }).join('\n      ');

    return `<cartaporte31:Ubicaciones>
      ${ubicacionesXML}
    </cartaporte31:Ubicaciones>`;
  }

  private static construirDomicilio(domicilio: any): string {
    if (!domicilio) return '';
    
    return `<cartaporte31:Domicilio
      Calle="${domicilio.calle || ''}"
      ${domicilio.numExterior ? `NumeroExterior="${domicilio.numExterior}"` : ''}
      ${domicilio.numInterior ? `NumeroInterior="${domicilio.numInterior}"` : ''}
      Colonia="${domicilio.colonia || ''}"
      Localidad="${domicilio.localidad || ''}"
      Municipio="${domicilio.municipio || ''}"
      Estado="${domicilio.estado || ''}"
      Pais="${domicilio.pais || 'MEX'}"
      CodigoPostal="${domicilio.codigoPostal || ''}" />`;
  }

  private static construirMercancias(mercancias: any[]): string {
    if (!mercancias || mercancias.length === 0) return '';
    
    const pesoTotal = mercancias.reduce((total, m) => total + (parseFloat(m.peso_kg) || 0), 0);
    const cantidadTotal = mercancias.reduce((total, m) => total + (parseFloat(m.cantidad) || 0), 0);
    
    const mercanciasXML = mercancias.map((mercancia, index) => {
      return `<cartaporte31:Mercancia
        BienesTransp="${mercancia.bienes_transp}"
        Descripcion="${mercancia.descripcion}"
        Cantidad="${mercancia.cantidad}"
        ClaveUnidad="${mercancia.clave_unidad}"
        ${mercancia.peso_kg ? `PesoEnKg="${mercancia.peso_kg}"` : ''}
        ${mercancia.valor_mercancia ? `ValorMercancia="${mercancia.valor_mercancia}"` : ''}
        ${mercancia.moneda ? `Moneda="${mercancia.moneda}"` : ''}
        ${mercancia.material_peligroso ? `MaterialPeligroso="Sí"` : ''}
        ${mercancia.cve_material_peligroso ? `CveMaterialPeligroso="${mercancia.cve_material_peligroso}"` : ''}
        ${mercancia.embalaje ? `Embalaje="${mercancia.embalaje}"` : ''} />`;
    }).join('\n      ');

    return `<cartaporte31:Mercancias
      PesoBrutoTotal="${pesoTotal}"
      UnidadPeso="KGM"
      PesoNetoTotal="${pesoTotal}"
      NumTotalMercancias="${cantidadTotal}">
      
      ${mercanciasXML}
      
    </cartaporte31:Mercancias>`;
  }

  private static construirFiguraTransporte(figuras: any[]): string {
    if (!figuras || figuras.length === 0) return '';
    
    const figurasXML = figuras.map((figura, index) => {
      return `<cartaporte31:TiposFigura>
        <cartaporte31:Figura
          TipoFigura="${figura.tipoFigura}"
          RFCFigura="${figura.rfcFigura || ''}"
          NombreFigura="${figura.nombreFigura || ''}"
          ${figura.numLicencia ? `NumLicencia="${figura.numLicencia}"` : ''}
          ${figura.residenciaFiscal ? `ResidenciaFiscalFigura="${figura.residenciaFiscal}"` : ''}>
          
          ${figura.domicilio ? this.construirDomicilioFigura(figura.domicilio) : ''}
          
        </cartaporte31:Figura>
      </cartaporte31:TiposFigura>`;
    }).join('\n    ');

    return `<cartaporte31:FiguraTransporte>
    ${figurasXML}
  </cartaporte31:FiguraTransporte>`;
  }

  private static construirDomicilioFigura(domicilio: any): string {
    return `<cartaporte31:Domicilio
      Calle="${domicilio.calle || ''}"
      ${domicilio.numExterior ? `NumeroExterior="${domicilio.numExterior}"` : ''}
      Colonia="${domicilio.colonia || ''}"
      Municipio="${domicilio.municipio || ''}"
      Estado="${domicilio.estado || ''}"
      Pais="${domicilio.pais || 'MEX'}"
      CodigoPostal="${domicilio.codigoPostal || ''}" />`;
  }

  private static construirAutotransporte(autotransporte: any): string {
    if (!autotransporte) return '';
    
    return `<cartaporte31:Autotransporte
      PermSCT="${autotransporte.perm_sct || ''}"
      NumPermisoSCT="${autotransporte.num_permiso_sct || ''}">
      
      <cartaporte31:IdentificacionVehicular
        ConfigVehicular="${autotransporte.config_vehicular || ''}"
        PlacaVM="${autotransporte.placa_vm || ''}"
        AnioModeloVM="${autotransporte.anio_modelo_vm || ''}" />
        
      ${this.construirSeguros(autotransporte)}
      ${this.construirRemolques(autotransporte.remolques)}
      
    </cartaporte31:Autotransporte>`;
  }

  private static construirSeguros(autotransporte: any): string {
    let segurosXML = '';
    
    if (autotransporte.asegura_resp_civil && autotransporte.poliza_resp_civil) {
      segurosXML += `<cartaporte31:Seguros
        AseguraRespCivil="${autotransporte.asegura_resp_civil}"
        PolizaRespCivil="${autotransporte.poliza_resp_civil}"
        ${autotransporte.asegura_med_ambiente ? `AseguraMedAmbiente="${autotransporte.asegura_med_ambiente}"` : ''}
        ${autotransporte.poliza_med_ambiente ? `PolizaMedAmbiente="${autotransporte.poliza_med_ambiente}"` : ''} />`;
    }
    
    return segurosXML;
  }

  private static construirRemolques(remolques: any[]): string {
    if (!remolques || remolques.length === 0) return '';
    
    const remolquesXML = remolques.map((remolque, index) => {
      return `<cartaporte31:Remolque
        SubTipoRem="${remolque.subtipo_rem || ''}"
        Placa="${remolque.placa || ''}" />`;
    }).join('\n      ');

    return `<cartaporte31:Remolques>
      ${remolquesXML}
    </cartaporte31:Remolques>`;
  }

  private static construirAtributosInternacionales(data: CartaPorteData): string {
    let attrs = '';
    if (data.transporteInternacional) {
      attrs += `EntradaSalidaMerc="${data.entrada_salida_merc || ''}" `;
      attrs += `PaisOrigenDestino="${data.pais_origen_destino || ''}" `;
      attrs += `ViaEntradaSalida="${data.via_entrada_salida || ''}" `;
    }
    return attrs;
  }

  private static obtenerCodigoPostalExpedicion(data: CartaPorteData): string {
    // Usar el código postal del origen o un valor por defecto
    const origen = data.ubicaciones?.find(u => u.tipoUbicacion === 'Origen');
    return origen?.domicilio?.codigoPostal || '01000';
  }

  private static obtenerCodigoPostalReceptor(data: CartaPorteData): string {
    // Usar el código postal del destino o un valor por defecto
    const destino = data.ubicaciones?.find(u => u.tipoUbicacion === 'Destino');
    return destino?.domicilio?.codigoPostal || '01000';
  }

  private static calcularDistanciaTotal(ubicaciones: Ubicacion[]): number {
    return ubicaciones?.reduce((total, ubicacion) => {
      return total + (ubicacion.distanciaRecorrida || 0);
    }, 0) || 0;
  }

  private static generarFolio(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${timestamp}${random}`;
  }

  private static obtenerAdvertencias(data: CartaPorteData): string[] {
    const advertencias: string[] = [];
    
    if (!data.mercancias || data.mercancias.length === 0) {
      advertencias.push('No se han especificado mercancías');
    }
    
    if (!data.ubicaciones || data.ubicaciones.length < 2) {
      advertencias.push('Se requieren al menos 2 ubicaciones (origen y destino)');
    }
    
    if (!data.figuras || data.figuras.length === 0) {
      advertencias.push('No se han especificado figuras de transporte');
    }
    
    return advertencias;
  }
}
