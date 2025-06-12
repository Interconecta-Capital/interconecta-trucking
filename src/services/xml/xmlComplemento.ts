
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';
import { Ubicacion } from '@/types/ubicaciones';
import { XMLUtils } from './xmlUtils';

export class XMLComplementoBuilder {
  static construirComplemento(data: CartaPorteData): string {
    return `<cfdi:Complemento>
    ${this.construirCartaPorte(data)}
  </cfdi:Complemento>`;
  }

  private static construirCartaPorte(data: CartaPorteData): string {
    const distanciaTotal = XMLUtils.calcularDistanciaTotal(data.ubicaciones);
    
    return `<cartaporte31:CartaPorte 
      Version="3.1" 
      TranspInternac="${data.transporteInternacional ? 'Sí' : 'No'}"
      ${data.transporteInternacional ? XMLUtils.construirAtributosInternacionales(data) : ''}
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
}
