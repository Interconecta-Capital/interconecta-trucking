/**
 * SwPayloadValidator - Validador de payload para SmartWeb
 * 
 * Valida la estructura del payload antes de enviar al PAC
 * Opcionalmente llama al endpoint de validación de SW
 * 
 * @see FASE_3_IMPLEMENTACION.md
 */

import { CartaPorteData } from '@/types/cartaPorte';
import { supabase } from '@/integrations/supabase/client';
import logger from '@/utils/logger';

export interface SwValidationResult {
  isValid: boolean;
  errors: SwValidationError[];
  warnings: SwValidationWarning[];
  payload?: any;
  timestamp: string;
}

export interface SwValidationError {
  code: string;
  message: string;
  field?: string;
  severity: 'critical' | 'error';
}

export interface SwValidationWarning {
  code: string;
  message: string;
  field?: string;
}

// Estructura del payload esperado por SmartWeb
interface SwCfdiPayload {
  Version: string;
  Serie?: string;
  Folio?: string;
  Fecha: string;
  FormaPago?: string;
  SubTotal: string;
  Moneda: string;
  Total: string;
  TipoDeComprobante: string;
  MetodoPago?: string;
  LugarExpedicion: string;
  Exportacion: string;
  Emisor: {
    Rfc: string;
    Nombre: string;
    RegimenFiscal: string;
  };
  Receptor: {
    Rfc: string;
    Nombre: string;
    DomicilioFiscalReceptor: string;
    RegimenFiscalReceptor: string;
    UsoCFDI: string;
  };
  Conceptos: Array<{
    ClaveProdServ: string;
    Cantidad: string;
    ClaveUnidad: string;
    Descripcion: string;
    ValorUnitario: string;
    Importe: string;
    ObjetoImp: string;
  }>;
  Complemento?: {
    CartaPorte31?: SwCartaPortePayload;
  };
}

interface SwCartaPortePayload {
  Version: string;
  IdCCP: string;
  TranspInternac: string;
  EntradaSalidaMerc?: string;
  PaisOrigenDestino?: string;
  ViaEntradaSalida?: string;
  TotalDistRec: string;
  Ubicaciones: SwUbicacion[];
  Mercancias: {
    PesoBrutoTotal: string;
    UnidadPeso: string;
    NumTotalMercancias: string;
    Mercancia: SwMercancia[];
    Autotransporte: SwAutotransporte;
  };
  FiguraTransporte: SwFigura[];
}

interface SwUbicacion {
  TipoUbicacion: string;
  IDUbicacion: string;
  RFCRemitenteDestinatario?: string;
  NombreRemitenteDestinatario?: string;
  FechaHoraSalidaLlegada: string;
  DistanciaRecorrida?: string;
  Domicilio: {
    Pais: string;
    CodigoPostal: string;
    Estado: string;
    Municipio: string;
    Colonia?: string;
    Localidad?: string;
    Calle?: string;
    NumeroExterior?: string;
  };
}

interface SwMercancia {
  BienesTransp: string;
  Descripcion: string;
  Cantidad: string;
  ClaveUnidad: string;
  PesoEnKg: string;
  ValorMercancia?: string;
  Moneda?: string;
  MaterialPeligroso?: string;
  FraccionArancelaria?: string;
}

interface SwAutotransporte {
  PermSCT: string;
  NumPermisoSCT: string;
  IdentificacionVehicular: {
    ConfigVehicular: string;
    PesoBrutoVehicular: string;
    PlacaVM: string;
    AnioModeloVM: string;
  };
  Seguros: {
    AseguraRespCivil: string;
    PolizaRespCivil: string;
    AseguraMedAmbiente?: string;
    PolizaMedAmbiente?: string;
  };
  Remolques?: Array<{
    SubTipoRem: string;
    Placa: string;
  }>;
}

interface SwFigura {
  TipoFigura: string;
  RFCFigura: string;
  NombreFigura: string;
  NumLicencia?: string;
  Domicilio?: {
    Pais: string;
    CodigoPostal: string;
    Estado?: string;
    Municipio?: string;
  };
}

/**
 * Validador de payload para SmartWeb PAC
 */
export class SwPayloadValidator {
  
  /**
   * Validar y construir payload para SmartWeb
   */
  static async validateAndBuildPayload(
    cartaPorteData: CartaPorteData,
    options?: { callSwValidation?: boolean }
  ): Promise<SwValidationResult> {
    const errors: SwValidationError[] = [];
    const warnings: SwValidationWarning[] = [];

    logger.info('sw-validator', 'Iniciando validación de payload SW', {
      tieneData: !!cartaPorteData,
      callSwValidation: options?.callSwValidation
    });

    try {
      // 1. Validar estructura básica
      this.validateBasicStructure(cartaPorteData, errors);

      // 2. Construir payload
      const payload = this.buildSwPayload(cartaPorteData, errors, warnings);

      // 3. Validar payload construido
      this.validateBuiltPayload(payload, errors, warnings);

      // 4. Opcionalmente llamar a SW para validación
      if (options?.callSwValidation && errors.filter(e => e.severity === 'critical').length === 0) {
        await this.callSwValidationEndpoint(payload, errors, warnings);
      }

      const result: SwValidationResult = {
        isValid: errors.filter(e => e.severity === 'critical').length === 0,
        errors,
        warnings,
        payload: errors.length === 0 ? payload : undefined,
        timestamp: new Date().toISOString()
      };

      logger.info('sw-validator', 'Validación completada', {
        isValid: result.isValid,
        errores: errors.length,
        advertencias: warnings.length
      });

      return result;

    } catch (error: any) {
      logger.error('sw-validator', 'Error en validación', { error: error.message });
      
      return {
        isValid: false,
        errors: [{
          code: 'SW_VALIDATION_ERROR',
          message: `Error interno de validación: ${error.message}`,
          severity: 'critical'
        }],
        warnings: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Validar estructura básica requerida
   */
  private static validateBasicStructure(
    data: CartaPorteData,
    errors: SwValidationError[]
  ): void {
    // RFC Emisor
    if (!data.rfcEmisor || data.rfcEmisor.length < 12) {
      errors.push({
        code: 'MISSING_RFC_EMISOR',
        message: 'RFC del emisor es obligatorio',
        field: 'rfcEmisor',
        severity: 'critical'
      });
    }

    // RFC Receptor
    if (!data.rfcReceptor || data.rfcReceptor.length < 12) {
      errors.push({
        code: 'MISSING_RFC_RECEPTOR',
        message: 'RFC del receptor es obligatorio',
        field: 'rfcReceptor',
        severity: 'critical'
      });
    }

    // Ubicaciones
    if (!data.ubicaciones || data.ubicaciones.length < 2) {
      errors.push({
        code: 'MISSING_UBICACIONES',
        message: 'Se requieren mínimo 2 ubicaciones',
        field: 'ubicaciones',
        severity: 'critical'
      });
    }

    // Mercancías
    if (!data.mercancias || data.mercancias.length === 0) {
      errors.push({
        code: 'MISSING_MERCANCIAS',
        message: 'Se requiere al menos una mercancía',
        field: 'mercancias',
        severity: 'critical'
      });
    }

    // Autotransporte
    if (!data.autotransporte) {
      errors.push({
        code: 'MISSING_AUTOTRANSPORTE',
        message: 'Información de autotransporte es obligatoria',
        field: 'autotransporte',
        severity: 'critical'
      });
    }

    // Figuras
    if (!data.figuras || data.figuras.length === 0) {
      errors.push({
        code: 'MISSING_FIGURAS',
        message: 'Se requiere al menos una figura de transporte',
        field: 'figuras',
        severity: 'critical'
      });
    }
  }

  /**
   * Construir payload en formato SmartWeb
   */
  private static buildSwPayload(
    data: CartaPorteData,
    errors: SwValidationError[],
    warnings: SwValidationWarning[]
  ): SwCfdiPayload | null {
    try {
      const now = new Date();
      const fechaFormateada = now.toISOString().replace('Z', '');

      // Calcular totales
      const subtotal = data.mercancias?.reduce((sum, m) => sum + (m.valor_mercancia || 0), 0) || 0;
      const total = subtotal; // Sin IVA para traslados

      // Calcular distancia total
      const distanciaTotal = data.ubicaciones?.reduce((sum, u) => {
        const dist = u.distancia_recorrida || (u as any).distanciaRecorrida || 0;
        return sum + dist;
      }, 0) || 0;

      // Calcular peso total
      const pesoTotal = data.mercancias?.reduce((sum, m) => sum + (m.peso_kg || 0), 0) || 0;

      // IdCCP
      const idCCP = (data.idCCP || data.cartaPorteId || '').replace(/-/g, '');

      const payload: SwCfdiPayload = {
        Version: '4.0',
        Fecha: fechaFormateada,
        SubTotal: data.tipoCfdi === 'Traslado' ? '0' : subtotal.toFixed(2),
        Moneda: data.tipoCfdi === 'Traslado' ? 'XXX' : 'MXN',
        Total: data.tipoCfdi === 'Traslado' ? '0' : total.toFixed(2),
        TipoDeComprobante: data.tipoCfdi === 'Traslado' ? 'T' : 'I',
        LugarExpedicion: this.getCodigoPostalEmisor(data),
        Exportacion: '01',
        Emisor: {
          Rfc: data.rfcEmisor || '',
          Nombre: data.nombreEmisor || '',
          RegimenFiscal: data.regimenFiscalEmisor || '601'
        },
        Receptor: {
          Rfc: data.rfcReceptor || '',
          Nombre: data.nombreReceptor || '',
          DomicilioFiscalReceptor: this.getCodigoPostalReceptor(data),
          RegimenFiscalReceptor: '616', // Sin obligaciones fiscales por defecto
          UsoCFDI: data.usoCfdi || 'S01'
        },
        Conceptos: this.buildConceptos(data),
        Complemento: {
          CartaPorte31: {
            Version: '3.1',
            IdCCP: idCCP,
            TranspInternac: data.transporteInternacional ? 'Sí' : 'No',
            TotalDistRec: distanciaTotal.toFixed(2),
            Ubicaciones: this.buildUbicaciones(data),
            Mercancias: {
              PesoBrutoTotal: pesoTotal.toFixed(3),
              UnidadPeso: 'KGM',
              NumTotalMercancias: String(data.mercancias?.length || 0),
              Mercancia: this.buildMercancias(data),
              Autotransporte: this.buildAutotransporte(data)
            },
            FiguraTransporte: this.buildFiguras(data)
          }
        }
      };

      // Agregar campos opcionales para transporte internacional
      if (data.transporteInternacional) {
        const cartaPorte = payload.Complemento!.CartaPorte31!;
        cartaPorte.EntradaSalidaMerc = data.entradaSalidaMerc || 'Salida';
        cartaPorte.PaisOrigenDestino = data.pais_origen_destino || 'USA';
        cartaPorte.ViaEntradaSalida = data.via_entrada_salida || '01';
      }

      return payload;

    } catch (error: any) {
      errors.push({
        code: 'PAYLOAD_BUILD_ERROR',
        message: `Error construyendo payload: ${error.message}`,
        severity: 'critical'
      });
      return null;
    }
  }

  /**
   * Construir conceptos para CFDI
   */
  private static buildConceptos(data: CartaPorteData): SwCfdiPayload['Conceptos'] {
    if (data.tipoCfdi === 'Traslado') {
      return [{
        ClaveProdServ: '78101800',
        Cantidad: '1',
        ClaveUnidad: 'E48',
        Descripcion: 'Servicio de transporte de carga',
        ValorUnitario: '0',
        Importe: '0',
        ObjetoImp: '01'
      }];
    }

    return (data.mercancias || []).map(m => ({
      ClaveProdServ: m.bienes_transp || '78101800',
      Cantidad: String(m.cantidad || 1),
      ClaveUnidad: m.clave_unidad || 'KGM',
      Descripcion: m.descripcion || 'Mercancía',
      ValorUnitario: (m.valor_mercancia || 0).toFixed(2),
      Importe: ((m.valor_mercancia || 0) * (m.cantidad || 1)).toFixed(2),
      ObjetoImp: '02'
    }));
  }

  /**
   * Construir ubicaciones para Carta Porte
   */
  private static buildUbicaciones(data: CartaPorteData): SwUbicacion[] {
    return (data.ubicaciones || []).map((ub, index) => {
      const tipoUb = ub.tipo_ubicacion || (ub as any).tipoUbicacion || 'Origen';
      const domicilio = ub.domicilio as any;
      const cp = domicilio?.codigoPostal || domicilio?.codigo_postal || ub.codigo_postal || '01000';

      const ubicacion: SwUbicacion = {
        TipoUbicacion: tipoUb,
        IDUbicacion: ub.id_ubicacion || `${tipoUb === 'Origen' ? 'OR' : 'DE'}${String(index + 1).padStart(6, '0')}`,
        RFCRemitenteDestinatario: ub.rfc_remitente_destinatario || ub.rfc,
        NombreRemitenteDestinatario: ub.nombre_remitente_destinatario || ub.nombre,
        FechaHoraSalidaLlegada: ub.fecha_hora_salida_llegada || ub.fecha_llegada_salida || new Date().toISOString(),
        Domicilio: {
          Pais: domicilio?.pais || 'MEX',
          CodigoPostal: cp,
          Estado: domicilio?.estado || '',
          Municipio: domicilio?.municipio || ''
        }
      };

      // Distancia solo en destino
      if (tipoUb === 'Destino') {
        const distancia = ub.distancia_recorrida || (ub as any).distanciaRecorrida || 0;
        ubicacion.DistanciaRecorrida = distancia.toFixed(2);
      }

      // Campos opcionales del domicilio
      if (domicilio?.colonia) {
        ubicacion.Domicilio.Colonia = domicilio.colonia;
      }
      if (domicilio?.calle) {
        ubicacion.Domicilio.Calle = domicilio.calle;
      }
      if (domicilio?.numero_exterior) {
        ubicacion.Domicilio.NumeroExterior = domicilio.numero_exterior;
      }

      return ubicacion;
    });
  }

  /**
   * Construir mercancías para Carta Porte
   */
  private static buildMercancias(data: CartaPorteData): SwMercancia[] {
    return (data.mercancias || []).map(m => {
      const mercancia: SwMercancia = {
        BienesTransp: m.bienes_transp || '78101800',
        Descripcion: m.descripcion || '',
        Cantidad: String(m.cantidad || 1),
        ClaveUnidad: m.clave_unidad || 'KGM',
        PesoEnKg: (m.peso_kg || 0).toFixed(3)
      };

      if (m.valor_mercancia && m.valor_mercancia > 0) {
        mercancia.ValorMercancia = m.valor_mercancia.toFixed(2);
        mercancia.Moneda = m.moneda || 'MXN';
      }

      if (m.material_peligroso) {
        mercancia.MaterialPeligroso = 'Sí';
      }

      if (m.fraccion_arancelaria) {
        mercancia.FraccionArancelaria = m.fraccion_arancelaria;
      }

      return mercancia;
    });
  }

  /**
   * Construir autotransporte para Carta Porte
   */
  private static buildAutotransporte(data: CartaPorteData): SwAutotransporte {
    const auto = data.autotransporte;
    
    if (!auto) {
      return {
        PermSCT: 'TPAF01',
        NumPermisoSCT: '',
        IdentificacionVehicular: {
          ConfigVehicular: 'C2',
          PesoBrutoVehicular: '0',
          PlacaVM: '',
          AnioModeloVM: String(new Date().getFullYear())
        },
        Seguros: {
          AseguraRespCivil: '',
          PolizaRespCivil: ''
        }
      };
    }

    const autotransporte: SwAutotransporte = {
      PermSCT: auto.perm_sct || 'TPAF01',
      NumPermisoSCT: auto.num_permiso_sct || '',
      IdentificacionVehicular: {
        ConfigVehicular: auto.config_vehicular || 'C2',
        PesoBrutoVehicular: String(auto.peso_bruto_vehicular || 0),
        PlacaVM: auto.placa_vm || '',
        AnioModeloVM: String(auto.anio_modelo_vm || new Date().getFullYear())
      },
      Seguros: {
        AseguraRespCivil: auto.asegura_resp_civil || '',
        PolizaRespCivil: auto.poliza_resp_civil || ''
      }
    };

    // Seguros adicionales
    if (auto.asegura_med_ambiente) {
      autotransporte.Seguros.AseguraMedAmbiente = auto.asegura_med_ambiente;
      autotransporte.Seguros.PolizaMedAmbiente = auto.poliza_med_ambiente || '';
    }

    // Remolques
    if (auto.remolques && auto.remolques.length > 0) {
      autotransporte.Remolques = auto.remolques.map(r => ({
        SubTipoRem: r.subtipo_rem || 'CTR001',
        Placa: r.placa || ''
      }));
    }

    return autotransporte;
  }

  /**
   * Construir figuras de transporte
   */
  private static buildFiguras(data: CartaPorteData): SwFigura[] {
    return (data.figuras || []).map(f => {
      const figura: SwFigura = {
        TipoFigura: f.tipo_figura || '01',
        RFCFigura: f.rfc_figura || '',
        NombreFigura: f.nombre_figura || ''
      };

      // Licencia para operadores
      if (f.tipo_figura === '01' && f.num_licencia) {
        figura.NumLicencia = f.num_licencia;
      }

      // Domicilio
      if (f.domicilio?.codigo_postal) {
        figura.Domicilio = {
          Pais: f.domicilio.pais || 'MEX',
          CodigoPostal: f.domicilio.codigo_postal,
          Estado: f.domicilio.estado,
          Municipio: f.domicilio.municipio
        };
      }

      return figura;
    });
  }

  /**
   * Validar payload construido
   */
  private static validateBuiltPayload(
    payload: SwCfdiPayload | null,
    errors: SwValidationError[],
    warnings: SwValidationWarning[]
  ): void {
    if (!payload) return;

    // Validar IdCCP
    const idCCP = payload.Complemento?.CartaPorte31?.IdCCP;
    if (!idCCP || idCCP.length !== 32) {
      errors.push({
        code: 'INVALID_ID_CCP',
        message: `IdCCP debe tener 32 caracteres (actual: ${idCCP?.length || 0})`,
        field: 'IdCCP',
        severity: 'error'
      });
    }

    // Validar distancia total
    const distancia = parseFloat(payload.Complemento?.CartaPorte31?.TotalDistRec || '0');
    if (distancia <= 0) {
      errors.push({
        code: 'INVALID_DISTANCE',
        message: 'La distancia total debe ser mayor a 0',
        field: 'TotalDistRec',
        severity: 'error'
      });
    }

    // Validar ubicaciones tienen CP
    const ubicaciones = payload.Complemento?.CartaPorte31?.Ubicaciones || [];
    ubicaciones.forEach((ub, i) => {
      if (!ub.Domicilio.CodigoPostal || ub.Domicilio.CodigoPostal.length !== 5) {
        errors.push({
          code: 'INVALID_CP',
          message: `Ubicación ${i + 1}: Código postal inválido`,
          field: `Ubicaciones[${i}].CodigoPostal`,
          severity: 'error'
        });
      }
    });

    // Validar mercancías
    const mercancias = payload.Complemento?.CartaPorte31?.Mercancias.Mercancia || [];
    mercancias.forEach((m, i) => {
      if (!m.BienesTransp) {
        errors.push({
          code: 'MISSING_BIENES_TRANSP',
          message: `Mercancía ${i + 1}: Clave SAT es obligatoria`,
          field: `Mercancia[${i}].BienesTransp`,
          severity: 'error'
        });
      }
    });
  }

  /**
   * Llamar al endpoint de validación de SmartWeb (opcional)
   */
  private static async callSwValidationEndpoint(
    payload: SwCfdiPayload | null,
    errors: SwValidationError[],
    warnings: SwValidationWarning[]
  ): Promise<void> {
    if (!payload) return;

    try {
      logger.info('sw-validator', 'Llamando a endpoint de validación SW');

      const { data, error } = await supabase.functions.invoke('validar-cfdi-sw', {
        body: { payload }
      });

      if (error) {
        warnings.push({
          code: 'SW_VALIDATION_UNAVAILABLE',
          message: 'No se pudo conectar con servicio de validación SW'
        });
        return;
      }

      if (data && !data.success) {
        // Agregar errores de SW
        (data.errors || []).forEach((err: any) => {
          errors.push({
            code: err.code || 'SW_ERROR',
            message: err.message || 'Error de validación SW',
            field: err.field,
            severity: 'error'
          });
        });
      }

    } catch (error: any) {
      logger.warn('sw-validator', 'Error llamando a SW', { error: error.message });
      warnings.push({
        code: 'SW_VALIDATION_ERROR',
        message: `Error en validación SW: ${error.message}`
      });
    }
  }

  /**
   * Obtener código postal del emisor
   */
  private static getCodigoPostalEmisor(data: CartaPorteData): string {
    // Buscar en ubicaciones de tipo Origen
    const origen = data.ubicaciones?.find(u => 
      u.tipo_ubicacion === 'Origen' || (u as any).tipoUbicacion === 'Origen'
    );
    
    if (origen) {
      const domicilio = origen.domicilio as any;
      return domicilio?.codigoPostal || domicilio?.codigo_postal || origen.codigo_postal || '01000';
    }

    return '01000';
  }

  /**
   * Obtener código postal del receptor
   */
  private static getCodigoPostalReceptor(data: CartaPorteData): string {
    // Buscar en ubicaciones de tipo Destino
    const destino = data.ubicaciones?.find(u => 
      u.tipo_ubicacion === 'Destino' || (u as any).tipoUbicacion === 'Destino'
    );
    
    if (destino) {
      const domicilio = destino.domicilio as any;
      return domicilio?.codigoPostal || domicilio?.codigo_postal || destino.codigo_postal || '01000';
    }

    return '01000';
  }

  /**
   * Obtener payload JSON como string formateado
   */
  static getPayloadString(payload: any): string {
    return JSON.stringify(payload, null, 2);
  }
}
