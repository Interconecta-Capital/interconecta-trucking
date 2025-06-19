
import { CartaPorteData } from '@/types/cartaPorte';

export class XMLComplementoBuilder {
  static construirComplemento(data: CartaPorteData): string {
    const version = data.cartaPorteVersion || '3.1';
    const namespaceAlias = version === '3.1' ? 'cartaporte31' : 'cartaporte30';
    
    // Use total_distancia_recorrida instead of totalDistRec
    const totalDistancia = data.total_distancia_recorrida || 0;
    
    return `
<cfdi:Complemento>
  <${namespaceAlias}:CartaPorte 
    Version="${version}"
    TranspInternac="${data.transporteInternacional ? 'Sí' : 'No'}"
    ${data.registroIstmo ? `RegistroISTMO="${data.registroIstmo}"` : ''}
    TotalDistRec="${totalDistancia}">
    
    ${this.construirUbicaciones(data, namespaceAlias)}
    ${this.construirMercancias(data, namespaceAlias)}
    ${this.construirAutotransporte(data, namespaceAlias)}
    ${this.construirFiguras(data, namespaceAlias)}
    
  </${namespaceAlias}:CartaPorte>
</cfdi:Complemento>`;
  }

  private static construirUbicaciones(data: CartaPorteData, namespaceAlias: string): string {
    if (!data.ubicaciones || data.ubicaciones.length === 0) return '';

    const ubicacionesXML = data.ubicaciones.map(ubicacion => `
      <${namespaceAlias}:Ubicacion
        TipoUbicacion="${ubicacion.tipo_ubicacion}"
        ${ubicacion.id_ubicacion ? `IDUbicacion="${ubicacion.id_ubicacion}"` : ''}
        ${ubicacion.rfc_remitente_destinatario ? `RFCRemitenteDestinatario="${ubicacion.rfc_remitente_destinatario}"` : ''}
        ${ubicacion.fecha_hora_salida_llegada ? `FechaHoraSalidaLlegada="${ubicacion.fecha_hora_salida_llegada}"` : ''}
        ${ubicacion.distancia_recorrida ? `DistanciaRecorrida="${ubicacion.distancia_recorrida}"` : ''}>
        
        <${namespaceAlias}:Domicilio
          CodigoPostal="${ubicacion.domicilio.codigo_postal}"
          Estado="${ubicacion.domicilio.estado}"
          Pais="${ubicacion.domicilio.pais}"
          ${ubicacion.domicilio.calle ? `Calle="${ubicacion.domicilio.calle}"` : ''}
          ${ubicacion.domicilio.numero_exterior ? `NumeroExterior="${ubicacion.domicilio.numero_exterior}"` : ''}
          ${ubicacion.domicilio.colonia ? `Colonia="${ubicacion.domicilio.colonia}"` : ''}
          ${ubicacion.domicilio.municipio ? `Municipio="${ubicacion.domicilio.municipio}"` : ''} />
      </${namespaceAlias}:Ubicacion>`
    ).join('');

    return `<${namespaceAlias}:Ubicaciones>${ubicacionesXML}</${namespaceAlias}:Ubicaciones>`;
  }

  private static construirMercancias(data: CartaPorteData, namespaceAlias: string): string {
    if (!data.mercancias || data.mercancias.length === 0) return '';

    const mercanciasXML = data.mercancias.map(mercancia => `
      <${namespaceAlias}:Mercancia
        BienesTransp="${mercancia.bienes_transp}"
        ClaveUnidad="${mercancia.clave_unidad}"
        Descripcion="${mercancia.descripcion}"
        Cantidad="${mercancia.cantidad}"
        PesoEnKg="${mercancia.peso_kg}"
        ${mercancia.valor_mercancia ? `ValorMercancia="${mercancia.valor_mercancia}"` : ''}
        ${mercancia.fraccion_arancelaria ? `FraccionArancelaria="${mercancia.fraccion_arancelaria}"` : ''} />
    `).join('');

    return `<${namespaceAlias}:Mercancias>${mercanciasXML}</${namespaceAlias}:Mercancias>`;
  }

  private static construirAutotransporte(data: CartaPorteData, namespaceAlias: string): string {
    if (!data.autotransporte) return '';

    const auto = data.autotransporte;
    return `
<${namespaceAlias}:Autotransporte
  PermSCT="${auto.perm_sct}"
  NumPermisoSCT="${auto.num_permiso_sct}"
  ConfigVehicular="${auto.config_vehicular}"
  PlacaVM="${auto.placa_vm}"
  AnioModeloVM="${auto.anio_modelo_vm}"
  ${auto.peso_bruto_vehicular ? `PesoBrutoVehicular="${auto.peso_bruto_vehicular}"` : ''}>
  
  <${namespaceAlias}:IdentificacionVehicular
    ConfigVehicular="${auto.config_vehicular}"
    PlacaVM="${auto.placa_vm}"
    AnioModeloVM="${auto.anio_modelo_vm}" />
    
  <${namespaceAlias}:Seguros
    AseguraRespCivil="${auto.asegura_resp_civil}"
    PolizaRespCivil="${auto.poliza_resp_civil}" />
    
</${namespaceAlias}:Autotransporte>`;
  }

  private static construirFiguras(data: CartaPorteData, namespaceAlias: string): string {
    if (!data.figuras || data.figuras.length === 0) return '';

    const figurasXML = data.figuras.map(figura => `
      <${namespaceAlias}:Figura
        TipoFigura="${figura.tipo_figura}"
        ${figura.rfc_figura ? `RFCFigura="${figura.rfc_figura}"` : ''}
        ${figura.nombre_figura ? `NombreFigura="${figura.nombre_figura}"` : ''}
        ${figura.num_licencia ? `NumLicencia="${figura.num_licencia}"` : ''} />
    `).join('');

    return `<${namespaceAlias}:TiposFigura>${figurasXML}</${namespaceAlias}:TiposFigura>`;
  }
}
