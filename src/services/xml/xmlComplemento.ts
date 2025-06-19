
import { CartaPorteData } from '@/types/cartaPorte';

export class XMLComplementoBuilder {
  static construirComplemento(data: CartaPorteData): string {
    const version = data.cartaPorteVersion || '3.1';
    const namespaceAlias = version === '3.1' ? 'cartaporte31' : 'cartaporte30';
    
    return `
  <cfdi:Complemento>
    <${namespaceAlias}:CartaPorte Version="${version}" 
      ${data.transporteInternacional ? `TranspInternac="${data.transporteInternacional}"` : ''}
      ${data.entradaSalidaMerc ? `EntradaSalidaMerc="${data.entradaSalidaMerc}"` : ''}
      ${data.pais_origen_destino ? `PaisOrigenDestino="${data.pais_origen_destino}"` : ''}
      ${data.via_entrada_salida ? `ViaEntradaSalida="${data.via_entrada_salida}"` : ''}>
      
      ${this.construirUbicaciones(data, namespaceAlias)}
      ${this.construirMercancias(data, namespaceAlias)}
      ${this.construirFiguraTransporte(data, namespaceAlias)}
      ${this.construirAutotransporte(data, namespaceAlias)}
      
    </${namespaceAlias}:CartaPorte>
  </cfdi:Complemento>`;
  }

  private static construirUbicaciones(data: CartaPorteData, namespaceAlias: string): string {
    if (!data.ubicaciones || data.ubicaciones.length === 0) return '';
    
    return `
      <${namespaceAlias}:Ubicaciones>
        ${data.ubicaciones.map(ubicacion => `
        <${namespaceAlias}:Ubicacion TipoUbicacion="${ubicacion.tipo_ubicacion}"
          ${ubicacion.rfc ? `RFCRemitente="${ubicacion.rfc}"` : ''}
          ${ubicacion.nombre ? `NombreRemitente="${ubicacion.nombre}"` : ''}
          ${ubicacion.fecha_llegada_salida ? `FechaHoraSalidaLlegada="${ubicacion.fecha_llegada_salida}"` : ''}
          ${ubicacion.distancia_recorrida ? `DistanciaRecorrida="${ubicacion.distancia_recorrida}"` : ''}>
          ${ubicacion.domicilio ? this.construirDomicilio(ubicacion.domicilio, namespaceAlias) : ''}
        </${namespaceAlias}:Ubicacion>`).join('')}
      </${namespaceAlias}:Ubicaciones>`;
  }

  private static construirMercancias(data: CartaPorteData, namespaceAlias: string): string {
    if (!data.mercancias || data.mercancias.length === 0) return '';
    
    const pesoTotal = data.mercancias.reduce((total, m) => total + (m.peso_kg || 0), 0);
    
    return `
      <${namespaceAlias}:Mercancias PesoBrutoTotal="${pesoTotal}" UnidadPeso="KGM" NumTotalMercancias="${data.mercancias.length}">
        ${data.mercancias.map(mercancia => `
        <${namespaceAlias}:Mercancia BienesTransp="${mercancia.bienes_transp}"
          Descripcion="${mercancia.descripcion}"
          Cantidad="${mercancia.cantidad}"
          ClaveUnidad="${mercancia.clave_unidad}"
          PesoEnKg="${mercancia.peso_kg}"
          ${mercancia.valor_mercancia ? `ValorMercancia="${mercancia.valor_mercancia}"` : ''}
          ${mercancia.moneda ? `Moneda="${mercancia.moneda}"` : ''}
          ${mercancia.fraccion_arancelaria ? `FraccionArancelaria="${mercancia.fraccion_arancelaria}"` : ''}
          ${mercancia.material_peligroso ? `MaterialPeligroso="Sí"` : ''}
          ${mercancia.especie_protegida ? `EspecieProtegida="Sí"` : ''} />
        `).join('')}
      </${namespaceAlias}:Mercancias>`;
  }

  private static construirFiguraTransporte(data: CartaPorteData, namespaceAlias: string): string {
    if (!data.figuras || data.figuras.length === 0) return '';
    
    return `
      <${namespaceAlias}:FiguraTransporte>
        ${data.figuras.map(figura => `
        <${namespaceAlias}:TiposFigura TipoFigura="${figura.tipo_figura}"
          RFCFigura="${figura.rfc_figura}"
          NombreFigura="${figura.nombre_figura}"
          ${figura.num_licencia ? `NumLicencia="${figura.num_licencia}"` : ''}
          ${figura.residencia_fiscal_figura ? `ResidenciaFiscalFigura="${figura.residencia_fiscal_figura}"` : ''} />
        `).join('')}
      </${namespaceAlias}:FiguraTransporte>`;
  }

  private static construirAutotransporte(data: CartaPorteData, namespaceAlias: string): string {
    if (!data.autotransporte) return '';
    
    return `
      <${namespaceAlias}:Autotransporte PermSCT="${data.autotransporte.perm_sct || ''}"
        NumPermisoSCT="${data.autotransporte.num_permiso_sct || ''}">
        <${namespaceAlias}:IdentificacionVehicular ConfigVehicular="${data.autotransporte.config_vehicular || ''}"
          PlacaVM="${data.autotransporte.placa_vm}"
          AnioModeloVM="${data.autotransporte.anio_modelo_vm}" />
        ${data.autotransporte.asegura_resp_civil ? `
        <${namespaceAlias}:Seguros AseguraRespCivil="${data.autotransporte.asegura_resp_civil}"
          PolizaRespCivil="${data.autotransporte.poliza_resp_civil || ''}"
          ${data.autotransporte.asegura_med_ambiente ? `AseguraMedAmbiente="${data.autotransporte.asegura_med_ambiente}"` : ''}
          ${data.autotransporte.poliza_med_ambiente ? `PolizaMedAmbiente="${data.autotransporte.poliza_med_ambiente}"` : ''} />
        ` : ''}
      </${namespaceAlias}:Autotransporte>`;
  }

  private static construirDomicilio(domicilio: any, namespaceAlias: string): string {
    return `
          <${namespaceAlias}:Domicilio
            ${domicilio.calle ? `Calle="${domicilio.calle}"` : ''}
            ${domicilio.numero_exterior ? `NumeroExterior="${domicilio.numero_exterior}"` : ''}
            ${domicilio.colonia ? `Colonia="${domicilio.colonia}"` : ''}
            ${domicilio.municipio ? `Municipio="${domicilio.municipio}"` : ''}
            ${domicilio.estado ? `Estado="${domicilio.estado}"` : ''}
            ${domicilio.pais ? `Pais="${domicilio.pais}"` : ''}
            ${domicilio.codigo_postal ? `CodigoPostal="${domicilio.codigo_postal}"` : ''} />`;
  }
}
