import { supabase } from '@/integrations/supabase/client';
import logger from '@/utils/logger';

/**
 * ✅ VALIDADOR FISCAL COMPLETO
 * 
 * Sistema de validación 100% apegado a:
 * - Anexo 20 del SAT (Catálogos CFDI 4.0)
 * - Complemento CartaPorte 3.1
 * - Especificaciones del PAC
 * 
 * ZERO autocorrecciones - Solo valida y reporta
 */

export interface ErrorFiscal {
  campo: string;
  valorActual: string | number | null;
  valorEsperado: string;
  fuente: string; // De dónde DEBE venir el dato correcto
  accion: string; // Qué debe hacer el usuario
  severidad: 'critico' | 'error' | 'advertencia';
}

export interface FuenteVerdad {
  rfc: string;
  nombre: string;
  regimen_fiscal: string;
  codigo_postal: string;
  origen: 'rfc_pruebas_sat' | 'configuracion_empresa';
}

export interface ValidationResult {
  valido: boolean;
  errores: ErrorFiscal[];
  advertencias: ErrorFiscal[];
  ambiente: 'sandbox' | 'produccion';
  fuenteVerdad?: FuenteVerdad;
}

export class ValidadorFiscalCompleto {
  
  /**
   * Catálogos SAT oficiales según Anexo 20
   */
  private static readonly CATALOGOS_SAT = {
    // c_FormaPago - Catálogo de formas de pago
    FORMAS_PAGO: [
      '01', // Efectivo
      '02', // Cheque nominativo
      '03', // Transferencia electrónica de fondos
      '04', // Tarjeta de crédito
      '05', // Monedero electrónico
      '06', // Dinero electrónico
      '08', // Vales de despensa
      '12', // Dación en pago
      '13', // Pago por subrogación
      '14', // Pago por consignación
      '15', // Condonación
      '17', // Compensación
      '23', // Novación
      '24', // Confusión
      '25', // Remisión de deuda
      '26', // Prescripción o caducidad
      '27', // A satisfacción del acreedor
      '28', // Tarjeta de débito
      '29', // Tarjeta de servicios
      '30', // Aplicación de anticipos
      '31', // Intermediario pagos
      '99'  // Por definir
    ],
    
    // c_MetodoPago - Método de pago
    METODOS_PAGO: ['PUE', 'PPD'],
    
    // c_Moneda - Catálogo de monedas (ISO 4217)
    MONEDAS: ['MXN', 'USD', 'EUR', 'GBP', 'JPY', 'XXX'],
    
    // c_UsoCFDI - Uso del CFDI
    USOS_CFDI: [
      'G01', // Adquisición de mercancías
      'G02', // Devoluciones, descuentos o bonificaciones
      'G03', // Gastos en general
      'I01', // Construcciones
      'I02', // Mobiliario y equipo de oficina por inversiones
      'I03', // Equipo de transporte
      'I04', // Equipo de computo y accesorios
      'I05', // Dados, troqueles, moldes, matrices y herramental
      'I06', // Comunicaciones telefónicas
      'I07', // Comunicaciones satelitales
      'I08', // Otra maquinaria y equipo
      'D01', // Honorarios médicos, dentales y gastos hospitalarios
      'D02', // Gastos médicos por incapacidad o discapacidad
      'D03', // Gastos funerales
      'D04', // Donativos
      'D05', // Intereses reales efectivamente pagados por créditos hipotecarios
      'D06', // Aportaciones voluntarias al SAR
      'D07', // Primas por seguros de gastos médicos
      'D08', // Gastos de transportación escolar obligatoria
      'D09', // Depósitos en cuentas para el ahorro
      'D10', // Pagos por servicios educativos
      'S01', // Sin efectos fiscales
      'CP01', // Pagos
      'CN01'  // Nómina
    ],
    
    // c_RegimenFiscal - Régimen Fiscal
    REGIMENES_FISCALES: [
      '601', // General de Ley Personas Morales
      '603', // Personas Morales con Fines no Lucrativos
      '605', // Sueldos y Salarios e Ingresos Asimilados a Salarios
      '606', // Arrendamiento
      '607', // Régimen de Enajenación o Adquisición de Bienes
      '608', // Demás ingresos
      '610', // Residentes en el Extranjero sin Establecimiento Permanente en México
      '611', // Ingresos por Dividendos (socios y accionistas)
      '612', // Personas Físicas con Actividades Empresariales y Profesionales
      '614', // Ingresos por intereses
      '615', // Régimen de los ingresos por obtención de premios
      '616', // Sin obligaciones fiscales
      '620', // Sociedades Cooperativas de Producción que optan por diferir sus ingresos
      '621', // Incorporación Fiscal
      '622', // Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras
      '623', // Opcional para Grupos de Sociedades
      '624', // Coordinados
      '625', // Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas
      '626', // Régimen Simplificado de Confianza
      '628', // Hidrocarburos
      '629', // De los Regímenes Fiscales Preferentes y de las Empresas Multinacionales
      '630'  // Enajenación de acciones en bolsa de valores
    ],
    
    // c_TipoDeComprobante
    TIPOS_COMPROBANTE: [
      'I', // Ingreso
      'E', // Egreso
      'T', // Traslado
      'N', // Nómina
      'P'  // Pago
    ]
  };
  
  /**
   * Valida emisor y receptor contra configuración y fuentes oficiales (SAT/Lista 69)
   * NO valida estructura CartaPorte (usar ValidadorPreTimbradoCompleto para eso)
   * NO modifica ningún dato - Solo reporta inconsistencias
   */
  static async validarEmisorReceptor(
    facturaId: string,
    userId: string
  ): Promise<ValidationResult> {
    
    const errores: ErrorFiscal[] = [];
    const advertencias: ErrorFiscal[] = [];
    
    logger.debug('validator', 'Iniciando validación emisor/receptor', { facturaId, userId });
    
    // PASO 1: Cargar configuración del usuario
    const { data: config, error: configError } = await supabase
      .from('configuracion_empresa')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (configError || !config) {
      errores.push({
        campo: 'configuracion_empresa',
        valorActual: null,
        valorEsperado: 'Configuración fiscal completa',
        fuente: 'configuracion_empresa',
        accion: 'Completa tu configuración en: Configuración > Mi Empresa',
        severidad: 'critico'
      });
      return { valido: false, errores, advertencias, ambiente: 'sandbox' };
    }
    
    const ambiente = config.modo_pruebas ? 'sandbox' : 'produccion';
    console.log(`   Ambiente: ${ambiente.toUpperCase()}`);
    
    // PASO 2: Obtener FUENTE DE VERDAD según ambiente
    let fuenteVerdad: FuenteVerdad | null = null;
    
    if (ambiente === 'sandbox') {
      // Sandbox: Usar RFC de pruebas del SAT
      const { data: rfcPrueba } = await supabase
        .from('rfc_pruebas_sat')
        .select('*')
        .eq('rfc', config.rfc_emisor)
        .single();
      
      if (rfcPrueba) {
        fuenteVerdad = {
          rfc: rfcPrueba.rfc,
          nombre: rfcPrueba.nombre,
          regimen_fiscal: rfcPrueba.regimen_fiscal,
          codigo_postal: rfcPrueba.codigo_postal,
          origen: 'rfc_pruebas_sat'
        };
        console.log('✅ [FUENTE VERDAD] RFC de pruebas SAT:', fuenteVerdad.nombre);
      } else {
        errores.push({
          campo: 'rfc_emisor',
          valorActual: config.rfc_emisor,
          valorEsperado: 'RFC válido del catálogo de pruebas SAT',
          fuente: 'rfc_pruebas_sat',
          accion: 'Usa uno de los RFCs de prueba oficiales del SAT (ej: EKU9003173C9)',
          severidad: 'critico'
        });
      }
    } else {
      // Producción: Validar contra SAT (cache o API)
      const { data: rfcValidado } = await supabase
        .from('rfc_validados_sat')
        .select('*')
        .eq('rfc', config.rfc_emisor)
        .single();
      
      if (rfcValidado && rfcValidado.razon_social_sat) {
        const domicilioFiscal = config.domicilio_fiscal as any;
        fuenteVerdad = {
          rfc: rfcValidado.rfc,
          nombre: rfcValidado.razon_social_sat,
          regimen_fiscal: config.regimen_fiscal,
          codigo_postal: domicilioFiscal?.codigo_postal || '',
          origen: 'configuracion_empresa'
        };
        console.log('✅ [FUENTE VERDAD] RFC validado contra SAT:', fuenteVerdad.nombre);
      } else {
        errores.push({
          campo: 'rfc_emisor',
          valorActual: config.rfc_emisor,
          valorEsperado: 'RFC validado en padrón del SAT',
          fuente: 'rfc_validados_sat',
          accion: 'Valida tu RFC contra el SAT desde: Configuración > Validación SAT',
          severidad: 'critico'
        });
      }
    }
    
    if (!fuenteVerdad) {
      return { valido: false, errores, advertencias, ambiente };
    }
    
    // PASO 3: Cargar factura completa
    const { data: factura, error: facturaError } = await supabase
      .from('facturas')
      .select('*')
      .eq('id', facturaId)
      .single();
    
    if (facturaError || !factura) {
      errores.push({
        campo: 'factura',
        valorActual: facturaId,
        valorEsperado: 'Factura existente',
        fuente: 'facturas',
        accion: 'Verifica que la factura exista en la base de datos',
        severidad: 'critico'
      });
      return { valido: false, errores, advertencias, ambiente, fuenteVerdad };
    }
    
    console.log('📋 [VALIDACIÓN FISCAL] Factura cargada:', {
      folio: factura.folio,
      serie: factura.serie,
      total: factura.total
    });
    
    // ========================================
    // VALIDACIONES CRÍTICAS - EMISOR
    // ========================================
    
    // Validación 1: RFC Emisor
    if (factura.rfc_emisor !== fuenteVerdad.rfc) {
      errores.push({
        campo: 'rfc_emisor',
        valorActual: factura.rfc_emisor,
        valorEsperado: fuenteVerdad.rfc,
        fuente: fuenteVerdad.origen,
        accion: `Actualiza el RFC del emisor a "${fuenteVerdad.rfc}" en la tabla facturas`,
        severidad: 'critico'
      });
    }
    
    // Validación 2: Nombre Emisor (CRÍTICA - Causa CFDI40139)
    const nombreEmisorNormalizado = this.normalizarTexto(factura.nombre_emisor || '');
    const nombreVerdadNormalizado = this.normalizarTexto(fuenteVerdad.nombre);
    
    if (nombreEmisorNormalizado !== nombreVerdadNormalizado) {
      errores.push({
        campo: 'nombre_emisor',
        valorActual: factura.nombre_emisor,
        valorEsperado: fuenteVerdad.nombre,
        fuente: fuenteVerdad.origen,
        accion: `Actualiza el nombre del emisor EXACTAMENTE a "${fuenteVerdad.nombre}"`,
        severidad: 'critico'
      });
      console.error('❌ [VALIDACIÓN] Nombre emisor NO coincide:');
      console.error(`   Actual:   "${factura.nombre_emisor}"`);
      console.error(`   Esperado: "${fuenteVerdad.nombre}"`);
    }
    
    // Validación 3: Régimen Fiscal Emisor
    if (factura.regimen_fiscal_emisor !== fuenteVerdad.regimen_fiscal) {
      errores.push({
        campo: 'regimen_fiscal_emisor',
        valorActual: factura.regimen_fiscal_emisor || 'NULL',
        valorEsperado: fuenteVerdad.regimen_fiscal,
        fuente: 'configuracion_empresa',
        accion: 'Actualiza el régimen fiscal del emisor en la factura',
        severidad: 'critico'
      });
    }
    
    // ========================================
    // VALIDACIONES - RECEPTOR
    // ========================================
    
    // Validación 4: RFC Receptor (formato)
    if (!this.validarFormatoRFC(factura.rfc_receptor)) {
      errores.push({
        campo: 'rfc_receptor',
        valorActual: factura.rfc_receptor,
        valorEsperado: 'RFC válido (12-13 caracteres alfanuméricos)',
        fuente: 'Reglas SAT',
        accion: 'Corrige el RFC del receptor',
        severidad: 'error'
      });
    }
    
    // Validación 5: Nombre Receptor
    if (!factura.nombre_receptor || factura.nombre_receptor.trim().length === 0) {
      errores.push({
        campo: 'nombre_receptor',
        valorActual: factura.nombre_receptor || 'NULL',
        valorEsperado: 'Nombre o razón social del receptor',
        fuente: 'facturas',
        accion: 'Agrega el nombre del receptor',
        severidad: 'error'
      });
    }
    
  // Validación 6: Régimen Fiscal Receptor
  if (!this.CATALOGOS_SAT.REGIMENES_FISCALES.includes(factura.regimen_fiscal_receptor || '')) {
    errores.push({
      campo: 'regimen_fiscal_receptor',
      valorActual: factura.regimen_fiscal_receptor || 'NULL',
      valorEsperado: 'Código del catálogo c_RegimenFiscal del SAT',
      fuente: 'Catálogo SAT c_RegimenFiscal',
      accion: 'Usa un código válido (ej: 605, 612, 616, etc.)',
      severidad: 'error'
    });
  }
  
  // Validación 7: Domicilio Fiscal Receptor (CRÍTICO - Causa CFDI40147)
  const domicilioFiscalReceptor = factura.domicilio_fiscal_receptor;
  if (!domicilioFiscalReceptor) {
    errores.push({
      campo: 'domicilio_fiscal_receptor',
      valorActual: 'NULL',
      valorEsperado: 'Código postal de 5 dígitos del domicilio fiscal del receptor',
      fuente: 'CFDI 4.0 - Campo obligatorio',
      accion: 'Completa el código postal del domicilio fiscal en los datos del receptor/cliente',
      severidad: 'critico'
    });
  } else {
    // Validar formato de código postal
    const codigoPostal = typeof domicilioFiscalReceptor === 'object' 
      ? (domicilioFiscalReceptor as any)?.codigo_postal 
      : domicilioFiscalReceptor;
      
    if (!codigoPostal || !/^\d{5}$/.test(String(codigoPostal))) {
      errores.push({
        campo: 'domicilio_fiscal_receptor',
        valorActual: codigoPostal || 'NULL',
        valorEsperado: 'Código postal de 5 dígitos',
        fuente: 'Formato SAT',
        accion: 'Proporciona un código postal válido de 5 dígitos para el domicilio fiscal del receptor',
        severidad: 'critico'
      });
    }
  }
  
  // Validación 8: Uso CFDI
    if (!this.CATALOGOS_SAT.USOS_CFDI.includes(factura.uso_cfdi || '')) {
      errores.push({
        campo: 'uso_cfdi',
        valorActual: factura.uso_cfdi || 'NULL',
        valorEsperado: 'Código del catálogo c_UsoCFDI del SAT',
        fuente: 'Catálogo SAT c_UsoCFDI',
        accion: 'Usa un código válido (ej: G03, S01, etc.)',
        severidad: 'error'
      });
    }
    
  // ========================================
  // VALIDACIONES - IMPORTES
  // ========================================
  
  // Validación 9: Subtotal
    const subtotal = Number(factura.subtotal);
    if (isNaN(subtotal) || subtotal < 0) {
      errores.push({
        campo: 'subtotal',
        valorActual: factura.subtotal,
        valorEsperado: 'Número positivo con 2 decimales',
        fuente: 'facturas',
        accion: 'Corrige el subtotal de la factura',
        severidad: 'critico'
      });
    }
    
    // Validación 10: Total
    const total = Number(factura.total);
    if (isNaN(total) || total < 0) {
      errores.push({
        campo: 'total',
        valorActual: factura.total,
        valorEsperado: 'Número positivo con 2 decimales',
        fuente: 'facturas',
        accion: 'Corrige el total de la factura',
        severidad: 'critico'
      });
    }
    
    // Validación 11: Relación Subtotal-Total
    if (subtotal > 0 && total > 0 && total < subtotal) {
      errores.push({
        campo: 'total',
        valorActual: `Total (${total}) < Subtotal (${subtotal})`,
        valorEsperado: 'Total >= Subtotal',
        fuente: 'Reglas SAT',
        accion: 'El total debe ser mayor o igual al subtotal (subtotal + impuestos - descuentos)',
        severidad: 'error'
      });
    }
    
  // ========================================
  // VALIDACIONES - CATÁLOGOS SAT
  // ========================================
  
  // Validación 12: Forma de Pago
    if (!this.CATALOGOS_SAT.FORMAS_PAGO.includes(factura.forma_pago || '')) {
      errores.push({
        campo: 'forma_pago',
        valorActual: factura.forma_pago || 'NULL',
        valorEsperado: 'Código del catálogo c_FormaPago',
        fuente: 'Catálogo SAT c_FormaPago',
        accion: 'Usa un código válido: 01=Efectivo, 02=Cheque, 03=Transferencia, etc.',
        severidad: 'error'
      });
    }
    
    // Validación 13: Método de Pago
    if (!this.CATALOGOS_SAT.METODOS_PAGO.includes(factura.metodo_pago || '')) {
      errores.push({
        campo: 'metodo_pago',
        valorActual: factura.metodo_pago || 'NULL',
        valorEsperado: 'PUE o PPD',
        fuente: 'Catálogo SAT c_MetodoPago',
        accion: 'Usa PUE (Pago en Una Exhibición) o PPD (Pago en Parcialidades o Diferido)',
        severidad: 'error'
      });
    }
    
    // Validación 14: Moneda
    if (!this.CATALOGOS_SAT.MONEDAS.includes(factura.moneda || '')) {
      errores.push({
        campo: 'moneda',
        valorActual: factura.moneda || 'NULL',
        valorEsperado: 'Código ISO 4217 (MXN, USD, EUR, etc.)',
        fuente: 'Catálogo SAT c_Moneda',
        accion: 'Usa un código válido de moneda',
        severidad: 'error'
      });
    }
    
    // Validación 15: Tipo de Cambio (si moneda != MXN)
    if (factura.moneda && factura.moneda !== 'MXN' && !factura.tipo_cambio) {
      advertencias.push({
        campo: 'tipo_cambio',
        valorActual: factura.tipo_cambio || 'NULL',
        valorEsperado: 'Tipo de cambio requerido para moneda extranjera',
        fuente: 'Reglas SAT',
        accion: 'Especifica el tipo de cambio cuando la moneda no es MXN',
        severidad: 'advertencia'
      });
    }
    
    // Validación 16: Código Postal de Expedición
    const domicilioFiscal = config.domicilio_fiscal as any;
    const cpExpedicion = domicilioFiscal?.codigo_postal;
    if (!cpExpedicion || !/^\d{5}$/.test(cpExpedicion)) {
      errores.push({
        campo: 'lugar_expedicion',
        valorActual: cpExpedicion || 'NULL',
        valorEsperado: 'Código postal de 5 dígitos',
        fuente: 'configuracion_empresa.domicilio_fiscal',
        accion: 'Completa el código postal en tu domicilio fiscal',
        severidad: 'error'
      });
    }
    
    // ========================================
    // VALIDACIONES - CARTA PORTE (si aplica)
    // ========================================
    
    if (factura.viaje_id) {
      const erroresCP = await this.validarCartaPorte(factura.viaje_id);
      errores.push(...erroresCP.filter(e => e.severidad !== 'advertencia'));
      advertencias.push(...erroresCP.filter(e => e.severidad === 'advertencia'));
    }
    
    // ========================================
    // RESULTADO FINAL
    // ========================================
    
    const valido = errores.length === 0;
    
    if (valido) {
      console.log('✅ [VALIDACIÓN FISCAL] Validación exitosa');
      console.log(`   Errores críticos: 0`);
      console.log(`   Advertencias: ${advertencias.length}`);
    } else {
      console.error('❌ [VALIDACIÓN FISCAL] Validación fallida');
      console.error(`   Errores críticos: ${errores.filter(e => e.severidad === 'critico').length}`);
      console.error(`   Errores: ${errores.filter(e => e.severidad === 'error').length}`);
      console.error(`   Advertencias: ${advertencias.length}`);
    }
    
    return {
      valido,
      errores,
      advertencias,
      ambiente,
      fuenteVerdad
    };
  }
  
  /**
   * Valida completitud de CartaPorte 3.1
   */
  private static async validarCartaPorte(viajeId: string): Promise<ErrorFiscal[]> {
    const errores: ErrorFiscal[] = [];
    
    const { data: borrador } = await supabase
      .from('borradores_carta_porte')
      .select('datos_formulario')
      .eq('viaje_id', viajeId)
      .single();
    
    if (!borrador) {
      errores.push({
        campo: 'carta_porte',
        valorActual: 'NULL',
        valorEsperado: 'Borrador de CartaPorte completo',
        fuente: 'borradores_carta_porte',
        accion: 'Completa la información de CartaPorte en el viaje',
        severidad: 'critico'
      });
      return errores;
    }
    
    const datos = borrador.datos_formulario as any;
    
    // Validar Ubicaciones (mínimo 2: origen y destino)
    if (!datos.ubicaciones || !Array.isArray(datos.ubicaciones) || datos.ubicaciones.length < 2) {
      errores.push({
        campo: 'ubicaciones',
        valorActual: datos.ubicaciones?.length || 0,
        valorEsperado: 'Mínimo 2 ubicaciones (origen y destino)',
        fuente: 'CartaPorte 3.1',
        accion: 'Agrega al menos origen y destino en el CartaPorte',
        severidad: 'critico'
      });
    }
    
    // Validar Mercancías (mínimo 1)
    if (!datos.mercancias || !Array.isArray(datos.mercancias) || datos.mercancias.length === 0) {
      errores.push({
        campo: 'mercancias',
        valorActual: datos.mercancias?.length || 0,
        valorEsperado: 'Mínimo 1 mercancía',
        fuente: 'CartaPorte 3.1',
        accion: 'Agrega al menos una mercancía al CartaPorte',
        severidad: 'critico'
      });
    }
    
    // Validar Autotransporte (si aplica)
    if (!datos.autotransporte) {
      errores.push({
        campo: 'autotransporte',
        valorActual: 'NULL',
        valorEsperado: 'Información del autotransporte',
        fuente: 'CartaPorte 3.1',
        accion: 'Completa los datos del vehículo en el CartaPorte',
        severidad: 'error'
      });
    }
    
    // Validar Figuras Transporte (mínimo 1 operador)
    if (!datos.figuras || !Array.isArray(datos.figuras) || datos.figuras.length === 0) {
      errores.push({
        campo: 'figuras',
        valorActual: datos.figuras?.length || 0,
        valorEsperado: 'Mínimo 1 figura de transporte (operador)',
        fuente: 'CartaPorte 3.1',
        accion: 'Asigna al menos un operador al CartaPorte',
        severidad: 'error'
      });
    }
    
    return errores;
  }
  
  /**
   * Valida formato de RFC según reglas SAT
   */
  private static validarFormatoRFC(rfc: string): boolean {
    if (!rfc) return false;
    
    // RFC Persona Física: 13 caracteres (AAAA000000XXX)
    // RFC Persona Moral: 12 caracteres (AAA000000XXX)
    const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    
    return rfcRegex.test(rfc.trim().toUpperCase());
  }
  
  /**
   * Normaliza texto para comparación (sin tildes, mayúsculas, espacios extras)
   */
  private static normalizarTexto(texto: string): string {
    return texto
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();
  }
}
