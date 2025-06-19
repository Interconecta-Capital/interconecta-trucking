import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';

export class XMLComplemento {
  private static readonly PROVEEDOR_CERTIFICACION = 'AAA010101AAA';

  static generateCartaPorteComplement(cartaPorteData: CartaPorteData): string {
    let complement = '';

    try {
      complement = this.generateCartaPorteComplementInternal(cartaPorteData);
    } catch (error) {
      console.error('Error generando complemento Carta Porte:', error);
      complement = `<cfdi:Complemento><cartaporte31:CartaPorte xmlns:cartaporte31="http://www.sat.gob.mx/CartaPorte30" Version="3.0" /></cfdi:Complemento>`;
    }

    return complement;
  }

  private static generateCartaPorteComplementInternal(cartaPorteData: CartaPorteData): string {
    let ubicacionesXml = '';
    let mercanciasXml = '';
    let autotransporteXml = '';
    let figurasXml = '';

    // Encabezado del Complemento
    let complement = `<cfdi:Complemento>
      <cartaporte31:CartaPorte
        xmlns:cartaporte31="http://www.sat.gob.mx/CartaPorte30"
        Version="${cartaPorteData.cartaPorteVersion || '3.0'}"`;

    if (cartaPorteData.transporteInternacional) {
      complement += `
        TranspInternac="${cartaPorteData.transporteInternacional}"`;
    }

    if (cartaPorteData.entradaSalidaMerc) {
      complement += `
        EntradaSalidaMerc="${cartaPorteData.entradaSalidaMerc}"`;
    }

    if (cartaPorteData.viaTransporte) {
      complement += `
        ViaTransporte="${cartaPorteData.viaTransporte}"`;
    }

    if (cartaPorteData.pais_origen_destino) {
      complement += `
        PaisOrigenDestino="${cartaPorteData.pais_origen_destino}"`;
    }

    if (cartaPorteData.via_entrada_salida) {
      complement += `
        ViaEntradaSalida="${cartaPorteData.via_entrada_salida}"`;
    }

    complement += '>';

    // Ubicaciones
    if (cartaPorteData.ubicaciones && cartaPorteData.ubicaciones.length > 0) {
      ubicacionesXml += '<cartaporte31:Ubicaciones>';
      
      cartaPorteData.ubicaciones.forEach((ubicacion) => {
        ubicacionesXml += `<cartaporte31:Ubicacion TipoUbicacion="${ubicacion.tipo_ubicacion}"`;
        if (ubicacion.rfc) ubicacionesXml += ` RFCRemitenteDestinatario="${ubicacion.rfc}"`;
        if (ubicacion.nombre) ubicacionesXml += ` NombreRemitenteDestinatario="${ubicacion.nombre}"`;
        if (ubicacion.num_reg_id_trib) ubicacionesXml += ` NumRegIdTrib="${ubicacion.num_reg_id_trib}"`;
        if (ubicacion.residencia_fiscal) ubicacionesXml += ` ResidenciaFiscal="${ubicacion.residencia_fiscal}"`;
        ubicacionesXml += '>';

        if (ubicacion.domicilio) {
          ubicacionesXml += `<cartaporte31:Domicilio Calle="${ubicacion.domicilio.calle}"`;
          if (ubicacion.domicilio.numero_exterior) ubicacionesXml += ` NumeroExterior="${ubicacion.domicilio.numero_exterior}"`;
          if (ubicacion.domicilio.numero_interior) ubicacionesXml += ` NumeroInterior="${ubicacion.domicilio.numero_interior}"`;
          ubicacionesXml += ` Colonia="${ubicacion.domicilio.colonia}" CodigoPostal="${ubicacion.domicilio.codigo_postal}"`;
          ubicacionesXml += ` Municipio="${ubicacion.domicilio.municipio}" Estado="${ubicacion.domicilio.estado}" Pais="${ubicacion.domicilio.pais}"`;
          ubicacionesXml += '/>';
        }

        ubicacionesXml += `</cartaporte31:Ubicacion>`;
      });
      
      ubicacionesXml += '</cartaporte31:Ubicaciones>';
    }

    // Mercancías
    if (cartaPorteData.mercancias && cartaPorteData.mercancias.length > 0) {
      mercanciasXml += '<cartaporte31:Mercancias>';
      cartaPorteData.mercancias.forEach((mercancia) => {
        mercanciasXml += `<cartaporte31:Mercancia BienesTransp="${mercancia.bienes_transp}"`;
        if (mercancia.descripcion) mercanciasXml += ` Descripcion="${mercancia.descripcion}"`;
        mercanciasXml += ` Cantidad="${mercancia.cantidad}" ClaveUnidad="${mercancia.clave_unidad}"`;
        mercanciasXml += ` PesoEnKg="${mercancia.peso_kg}"`;
        mercanciasXml += '/>';
      });
      mercanciasXml += '</cartaporte31:Mercancias>';
    }

    // Autotransporte
    if (cartaPorteData.autotransporte) {
      autotransporteXml += '<cartaporte31:Autotransporte>';
      autotransporteXml += `<cartaporte31:IdentificacionVehicular PlacaVM="${cartaPorteData.autotransporte.placa_vm}"`;
      autotransporteXml += ` AnioModeloVM="${cartaPorteData.autotransporte.anio_modelo_vm}" ConfigVehicular="${cartaPorteData.autotransporte.config_vehicular}"`;
      autotransporteXml += '/>';
      autotransporteXml += `<cartaporte31:Seguros AseguraRespCivil="${cartaPorteData.autotransporte.asegura_resp_civil}" PolizaRespCivil="${cartaPorteData.autotransporte.poliza_resp_civil}"`;
      autotransporteXml += '/>';
      autotransporteXml += '</cartaporte31:Autotransporte>';
    }

    // FigurasTransporte
    if (cartaPorteData.figuras && cartaPorteData.figuras.length > 0) {
      figurasXml += '<cartaporte31:FigurasTransporte>';
      cartaPorteData.figuras.forEach((figura) => {
        figurasXml += `<cartaporte31:TiposFigura TipoFigura="${figura.tipo_figura}" RFCFigura="${figura.rfc_figura}" NombreFigura="${figura.nombre_figura}"`;
        figurasXml += '/>';
      });
      figurasXml += '</cartaporte31:FigurasTransporte>';
    }

    complement += ubicacionesXml;
    complement += mercanciasXml;
    complement += autotransporteXml;
    complement += figurasXml;

    complement += '</cartaporte31:CartaPorte></cfdi:Complemento>';

    return complement;
  }
}
