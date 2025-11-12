
import { CartaPorteData } from '@/types/cartaPorte';

export class XMLComplementoBuilder {
  static construirComplemento(data: CartaPorteData): string {
    const alias = 'cartaporte31';
    
    return `<cfdi:Complemento>
    <${alias}:CartaPorte 
      Version="3.1"
      IdCCP="${data.cartaPorteId}"
      TranspInternac="${data.transporteInternacional ? 'Sí' : 'No'}"
      ${data.registroIstmo ? 'RegistroISTMO="Sí"' : ''}
      ${data.entradaSalidaMerc ? `EntradaSalidaMerc="${data.entradaSalidaMerc}"` : ''}
      ${data.pais_origen_destino ? `PaisOrigenDestino="${data.pais_origen_destino}"` : ''}
      ${data.via_entrada_salida ? `ViaEntradaSalida="${data.via_entrada_salida}"` : ''}
      TotalDistRec="${this.calcularDistanciaTotal(data)}">
      
      ${this.construirUbicaciones(data)}
      ${this.construirMercancias(data)}
      ${this.construirFiguraTransporte(data)}
      ${this.construirAutotransporte(data)}
      
    </${alias}:CartaPorte>
  </cfdi:Complemento>`;
  }

  // ✅ FASE 1: Helper para buscar campos en ambos formatos (snake_case y camelCase)
  private static getFieldValue(obj: any, ...fieldNames: string[]): any {
    for (const fieldName of fieldNames) {
      if (obj?.[fieldName] !== undefined && obj[fieldName] !== null && obj[fieldName] !== '') {
        return obj[fieldName];
      }
    }
    return undefined;
  }

  private static construirUbicaciones(data: CartaPorteData): string {
    if (!data.ubicaciones || data.ubicaciones.length === 0) {
      return '';
    }

    const alias = 'cartaporte31';
    
    console.log('📄 [XML] Construyendo ubicaciones XML:', {
      total: data.ubicaciones.length,
      ubicaciones: data.ubicaciones.map(u => ({
        tipo: this.getFieldValue(u, 'tipo_ubicacion', 'tipoUbicacion'),
        distancia: this.getFieldValue(u, 'distancia_recorrida', 'distanciaRecorrida')
      }))
    });
    
    const ubicacionesXML = data.ubicaciones.map(ubicacion => {
      // ✅ FASE 1: Buscar en ambos formatos
      const tipoUbicacion = this.getFieldValue(ubicacion, 'tipo_ubicacion', 'tipoUbicacion');
      const idUbicacion = this.getFieldValue(ubicacion, 'id_ubicacion', 'idUbicacion', 'id');
      const rfc = this.getFieldValue(ubicacion, 'rfc', 'rfcRemitenteDestinatario', 'rfc_remitente_destinatario');
      const nombre = this.getFieldValue(ubicacion, 'nombre', 'nombreRemitenteDestinatario', 'nombre_remitente_destinatario');
      const fechaHora = this.getFieldValue(ubicacion, 'fecha_llegada_salida', 'fechaHoraSalidaLlegada', 'fecha_hora_salida_llegada');
      const distancia = this.getFieldValue(ubicacion, 'distancia_recorrida', 'distanciaRecorrida');
      
      console.log('📍 [XML] Ubicación procesada:', {
        tipo: tipoUbicacion,
        id: idUbicacion,
        distancia: distancia
      });
      
      return `<${alias}:Ubicacion
        TipoUbicacion="${tipoUbicacion}"
        IDUbicacion="${idUbicacion}"
        RFCRemitenteDestinatario="${rfc}"
        NombreRemitenteDestinatario="${nombre}"
        FechaHoraSalidaLlegada="${fechaHora}"
        ${distancia ? `DistanciaRecorrida="${distancia}"` : ''}>
        
        ${this.construirDomicilio(ubicacion.domicilio, alias)}
        
      </${alias}:Ubicacion>`;
    }).join('\n      ');

    return `<${alias}:Ubicaciones>
      ${ubicacionesXML}
    </${alias}:Ubicaciones>`;
  }

  private static construirDomicilio(domicilio: any, alias: string): string {
    if (!domicilio) return '';

    // ✅ FASE 1: Buscar en ambos formatos
    const codigoPostal = this.getFieldValue(domicilio, 'codigo_postal', 'codigoPostal');
    const estado = this.getFieldValue(domicilio, 'estado');
    const pais = this.getFieldValue(domicilio, 'pais') || 'MEX';
    const municipio = this.getFieldValue(domicilio, 'municipio');
    const colonia = this.getFieldValue(domicilio, 'colonia');
    const calle = this.getFieldValue(domicilio, 'calle');
    const numeroExterior = this.getFieldValue(domicilio, 'numero_exterior', 'numExterior');

    return `<${alias}:Domicilio
      CodigoPostal="${codigoPostal || ''}"
      ${estado ? `Estado="${estado}"` : ''}
      ${pais ? `Pais="${pais}"` : ''}
      ${municipio ? `Municipio="${municipio}"` : ''}
      ${colonia ? `Colonia="${colonia}"` : ''}
      ${calle ? `Calle="${calle}"` : ''}
      ${numeroExterior ? `NumeroExterior="${numeroExterior}"` : ''} />`;
  }

  private static construirMercancias(data: CartaPorteData): string {
    if (!data.mercancias || data.mercancias.length === 0) {
      return '';
    }

    const alias = 'cartaporte31';
    const pesoTotal = data.mercancias.reduce((sum, m) => sum + (m.peso_kg || 0), 0);
    const numTotal = data.mercancias.reduce((sum, m) => sum + (m.cantidad || 0), 0);

    const mercanciasXML = data.mercancias.map(mercancia => {
      return `<${alias}:Mercancia
        BienesTransp="${mercancia.bienes_transp}"
        Descripcion="${mercancia.descripcion}"
        Cantidad="${mercancia.cantidad}"
        ClaveUnidad="${mercancia.clave_unidad}"
        ${mercancia.peso_kg ? `PesoEnKg="${mercancia.peso_kg}"` : ''}
        ${mercancia.valor_mercancia ? `ValorMercancia="${mercancia.valor_mercancia}"` : ''}
        Moneda="${mercancia.moneda || 'MXN'}"
        ${mercancia.fraccion_arancelaria ? `FraccionArancelaria="${mercancia.fraccion_arancelaria}"` : ''}
        ${mercancia.material_peligroso ? 'MaterialPeligroso="Sí"' : ''}
        ${mercancia.cve_material_peligroso ? `CveMaterialPeligroso="${mercancia.cve_material_peligroso}"` : ''} />`;
    }).join('\n        ');

    return `<${alias}:Mercancias
      PesoBrutoTotal="${pesoTotal.toFixed(3)}"
      UnidadPeso="KGM"
      NumTotalMercancias="${numTotal}">
      
        ${mercanciasXML}
        
    </${alias}:Mercancias>`;
  }

  private static construirFiguraTransporte(data: CartaPorteData): string {
    if (!data.figuras || data.figuras.length === 0) {
      return '';
    }

    const alias = 'cartaporte31';
    const figurasXML = data.figuras.map(figura => {
      return `<${alias}:TiposFigura>
        <${alias}:TipoFigura
          TipoFigura="${figura.tipo_figura}"
          RFCFigura="${figura.rfc_figura}"
          NombreFigura="${figura.nombre_figura}"
          ${figura.num_licencia ? `NumLicencia="${figura.num_licencia}"` : ''}
          ${figura.tipo_licencia ? `TipoLicencia="${figura.tipo_licencia}"` : ''}
          ${figura.vigencia_licencia ? `VigenciaLicencia="${figura.vigencia_licencia}"` : ''}
          ${figura.operador_sct ? 'OperadorSCT="Sí"' : ''} />
      </${alias}:TiposFigura>`;
    }).join('\n      ');

    return `<${alias}:FiguraTransporte>
      ${figurasXML}
    </${alias}:FiguraTransporte>`;
  }

  private static construirAutotransporte(data: CartaPorteData): string {
    if (!data.autotransporte) {
      return '';
    }

    const alias = 'cartaporte31';
    const auto = data.autotransporte;

    return `<${alias}:Autotransporte
      PermSCT="${auto.perm_sct}"
      NumPermisoSCT="${auto.num_permiso_sct}">
      
      <${alias}:IdentificacionVehicular
        ConfigVehicular="${auto.config_vehicular}"
        PlacaVM="${auto.placa_vm}"
        AnioModeloVM="${auto.anio_modelo_vm}"
        ${auto.tipo_carroceria ? `TipoCarroceria="${auto.tipo_carroceria}"` : ''} />
        
      <${alias}:Seguros
        AseguraRespCivil="${auto.asegura_resp_civil}"
        PolizaRespCivil="${auto.poliza_resp_civil}"
        ${auto.asegura_med_ambiente ? `AseguraMedAmbiente="${auto.asegura_med_ambiente}"` : ''}
        ${auto.poliza_med_ambiente ? `PolizaMedAmbiente="${auto.poliza_med_ambiente}"` : ''} />
        
    </${alias}:Autotransporte>`;
  }

  private static calcularDistanciaTotal(data: CartaPorteData): string {
    const destino = data.ubicaciones?.find(u => u.tipo_ubicacion === 'Destino');
    return (destino?.distancia_recorrida || 0).toString();
  }
}
