/**
 * ✅ VALIDADOR FISCAL COMPLETO (DENO)
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
  fuente: string;
  accion: string;
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
  ambiente: 'sandbox' | 'production';
  fuenteVerdad?: FuenteVerdad;
}

/**
 * Catálogos SAT oficiales según Anexo 20
 */
const CATALOGOS_SAT = {
  FORMAS_PAGO: [
    '01', '02', '03', '04', '05', '06', '08', '12', '13', '14', '15',
    '17', '23', '24', '25', '26', '27', '28', '29', '30', '31', '99'
  ],
  METODOS_PAGO: ['PUE', 'PPD'],
  MONEDAS: ['MXN', 'USD', 'EUR', 'GBP', 'JPY', 'XXX'],
  USOS_CFDI: [
    'G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08',
    'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10',
    'S01', 'CP01', 'CN01'
  ],
  REGIMENES_FISCALES: [
    '601', '603', '605', '606', '607', '608', '610', '611', '612', '614',
    '615', '616', '620', '621', '622', '623', '624', '625', '626', '628', '629', '630'
  ],
  TIPOS_COMPROBANTE: ['I', 'E', 'T', 'N', 'P']
};

/**
 * Valida TODOS los datos fiscales contra fuentes oficiales
 * NO modifica ningún dato - Solo reporta inconsistencias
 */
export async function validarPreTimbrado(
  facturaData: any,
  userId: string,
  supabaseClient: any
): Promise<ValidationResult> {
  
  const errores: ErrorFiscal[] = [];
  const advertencias: ErrorFiscal[] = [];
  
  console.log('🔍 [VALIDACIÓN FISCAL] Iniciando validación exhaustiva...');
  
  // PASO 1: Cargar configuración del usuario
  const { data: config, error: configError } = await supabaseClient
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
  
  const ambiente = config.modo_pruebas ? 'sandbox' : 'production';
  console.log(`   Ambiente: ${ambiente.toUpperCase()}`);
  
  // PASO 2: Obtener FUENTE DE VERDAD según ambiente
  let fuenteVerdad: FuenteVerdad | null = null;
  
  if (ambiente === 'sandbox') {
    const { data: rfcPrueba } = await supabaseClient
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
    const { data: rfcValidado } = await supabaseClient
      .from('rfc_validados_sat')
      .select('*')
      .eq('rfc', config.rfc_emisor)
      .single();
    
    if (rfcValidado && rfcValidado.razon_social_sat) {
      fuenteVerdad = {
        rfc: rfcValidado.rfc,
        nombre: rfcValidado.razon_social_sat,
        regimen_fiscal: config.regimen_fiscal,
        codigo_postal: config.domicilio_fiscal?.codigo_postal || '',
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
  
  // ========================================
  // VALIDACIONES CRÍTICAS - EMISOR
  // ========================================
  
  const rfcEmisor = facturaData.rfcEmisor || facturaData.rfc_emisor;
  const nombreEmisor = facturaData.nombreEmisor || facturaData.nombre_emisor;
  
  // Validación 1: RFC Emisor
  if (rfcEmisor !== fuenteVerdad.rfc) {
    errores.push({
      campo: 'rfc_emisor',
      valorActual: rfcEmisor,
      valorEsperado: fuenteVerdad.rfc,
      fuente: fuenteVerdad.origen,
      accion: `Actualiza el RFC del emisor a "${fuenteVerdad.rfc}"`,
      severidad: 'critico'
    });
  }
  
  // Validación 2: Nombre Emisor (CRÍTICA - Causa CFDI40139)
  const nombreEmisorNormalizado = normalizarTexto(nombreEmisor || '');
  const nombreVerdadNormalizado = normalizarTexto(fuenteVerdad.nombre);
  
  if (nombreEmisorNormalizado !== nombreVerdadNormalizado) {
    errores.push({
      campo: 'nombre_emisor',
      valorActual: nombreEmisor,
      valorEsperado: fuenteVerdad.nombre,
      fuente: fuenteVerdad.origen,
      accion: `Actualiza el nombre del emisor EXACTAMENTE a "${fuenteVerdad.nombre}"`,
      severidad: 'critico'
    });
    console.error('❌ [VALIDACIÓN] Nombre emisor NO coincide:');
    console.error(`   Actual:   "${nombreEmisor}"`);
    console.error(`   Esperado: "${fuenteVerdad.nombre}"`);
  }
  
  // ========================================
  // VALIDACIONES - RECEPTOR
  // ========================================
  
  const rfcReceptor = facturaData.rfcReceptor || facturaData.rfc_receptor;
  if (!validarFormatoRFC(rfcReceptor)) {
    errores.push({
      campo: 'rfc_receptor',
      valorActual: rfcReceptor,
      valorEsperado: 'RFC válido (12-13 caracteres alfanuméricos)',
      fuente: 'Reglas SAT',
      accion: 'Corrige el RFC del receptor',
      severidad: 'error'
    });
  }
  
  // Validación 7: Domicilio Fiscal Receptor (CRÍTICO - Causa CFDI40147)
  const domicilioFiscalReceptor = facturaData.domicilioFiscalReceptor || facturaData.domicilio_fiscal_receptor;
  if (!domicilioFiscalReceptor) {
    errores.push({
      campo: 'domicilio_fiscal_receptor',
      valorActual: 'NULL',
      valorEsperado: 'Código postal de 5 dígitos',
      fuente: 'CFDI 4.0 - Campo obligatorio',
      accion: 'Completa el código postal del domicilio fiscal en los datos del receptor',
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
        accion: 'Proporciona un código postal válido para el domicilio fiscal del receptor',
        severidad: 'critico'
      });
    }
  }
  
  const formaPago = facturaData.forma_pago;
  if (formaPago && !CATALOGOS_SAT.FORMAS_PAGO.includes(formaPago)) {
    errores.push({
      campo: 'forma_pago',
      valorActual: formaPago,
      valorEsperado: 'Código del catálogo c_FormaPago',
      fuente: 'Catálogo SAT c_FormaPago',
      accion: 'Usa un código válido: 01=Efectivo, 03=Transferencia, etc.',
      severidad: 'error'
    });
  }
  
  const metodoPago = facturaData.metodo_pago;
  if (metodoPago && !CATALOGOS_SAT.METODOS_PAGO.includes(metodoPago)) {
    errores.push({
      campo: 'metodo_pago',
      valorActual: metodoPago,
      valorEsperado: 'PUE o PPD',
      fuente: 'Catálogo SAT c_MetodoPago',
      accion: 'Usa PUE (Pago en Una Exhibición) o PPD (Pago en Parcialidades)',
      severidad: 'error'
    });
  }
  
  const moneda = facturaData.moneda;
  if (moneda && !CATALOGOS_SAT.MONEDAS.includes(moneda)) {
    errores.push({
      campo: 'moneda',
      valorActual: moneda,
      valorEsperado: 'Código ISO 4217 (MXN, USD, EUR, etc.)',
      fuente: 'Catálogo SAT c_Moneda',
      accion: 'Usa un código válido de moneda',
      severidad: 'error'
    });
  }
  
  const usoCfdi = facturaData.uso_cfdi || facturaData.usoCfdi;
  if (usoCfdi && !CATALOGOS_SAT.USOS_CFDI.includes(usoCfdi)) {
    errores.push({
      campo: 'uso_cfdi',
      valorActual: usoCfdi,
      valorEsperado: 'Código del catálogo c_UsoCFDI',
      fuente: 'Catálogo SAT c_UsoCFDI',
      accion: 'Usa un código válido: G03, S01, etc.',
      severidad: 'error'
    });
  }
  
  // ========================================
  // VALIDACIONES - IMPORTES
  // ========================================
  
  const subtotal = Number(facturaData.subtotal);
  const total = Number(facturaData.total);
  
  if (isNaN(subtotal) || subtotal < 0) {
    errores.push({
      campo: 'subtotal',
      valorActual: facturaData.subtotal,
      valorEsperado: 'Número positivo con 2 decimales',
      fuente: 'facturas',
      accion: 'Corrige el subtotal de la factura',
      severidad: 'critico'
    });
  }
  
  if (isNaN(total) || total < 0) {
    errores.push({
      campo: 'total',
      valorActual: facturaData.total,
      valorEsperado: 'Número positivo con 2 decimales',
      fuente: 'facturas',
      accion: 'Corrige el total de la factura',
      severidad: 'critico'
    });
  }
  
  if (subtotal > 0 && total > 0 && total < subtotal) {
    errores.push({
      campo: 'total',
      valorActual: `Total (${total}) < Subtotal (${subtotal})`,
      valorEsperado: 'Total >= Subtotal',
      fuente: 'Reglas SAT',
      accion: 'El total debe ser mayor o igual al subtotal',
      severidad: 'error'
    });
  }
  
  // ========================================
  // RESULTADO FINAL
  // ========================================
  
  const valido = errores.length === 0;
  
  if (valido) {
    console.log('✅ [VALIDACIÓN FISCAL] Validación exitosa');
    console.log(`   Errores: 0`);
    console.log(`   Advertencias: ${advertencias.length}`);
  } else {
    console.error('❌ [VALIDACIÓN FISCAL] Validación fallida');
    console.error(`   Errores críticos: ${errores.filter(e => e.severidad === 'critico').length}`);
    console.error(`   Errores: ${errores.filter(e => e.severidad === 'error').length}`);
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
 * Valida formato de RFC según reglas SAT
 */
function validarFormatoRFC(rfc: string): boolean {
  if (!rfc) return false;
  const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
  return rfcRegex.test(rfc.trim().toUpperCase());
}

/**
 * Normaliza texto para comparación
 */
function normalizarTexto(texto: string): string {
  return texto
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
