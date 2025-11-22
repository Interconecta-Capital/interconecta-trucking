interface ValidationError {
  field: string;
  message: string;
  required?: boolean;
}

interface FacturaData {
  rfc_emisor: string;
  nombre_emisor: string;
  regimen_fiscal_emisor: string | null;
  rfc_receptor: string;
  nombre_receptor: string;
  regimen_fiscal_receptor: string | null;
  uso_cfdi: string | null;
  tipo_comprobante: string;
  subtotal: number;
  total: number;
}

// Catálogo c_RegimenFiscal del SAT
const REGIMENES_FISCALES_VALIDOS = [
  '601', '603', '605', '606', '607', '608', '609', '610', '611', '612',
  '614', '615', '616', '620', '621', '622', '623', '624', '625', '626'
];

// Catálogo c_UsoCFDI del SAT
const USOS_CFDI_VALIDOS = [
  'G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08',
  'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10',
  'P01', 'S01', 'CP01', 'CN01'
];

export function validateFacturaForTimbrado(facturaData: FacturaData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validar RFC Emisor
  if (!facturaData.rfc_emisor || facturaData.rfc_emisor.trim() === '') {
    errors.push({
      field: 'RFC Emisor',
      message: 'El RFC del emisor es requerido',
      required: true
    });
  } else if (!/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(facturaData.rfc_emisor)) {
    errors.push({
      field: 'RFC Emisor',
      message: 'El RFC del emisor no tiene un formato válido'
    });
  }

  // Validar Nombre Emisor
  if (!facturaData.nombre_emisor || facturaData.nombre_emisor.trim() === '') {
    errors.push({
      field: 'Nombre Emisor',
      message: 'El nombre o razón social del emisor es requerido',
      required: true
    });
  }

  // Validar Régimen Fiscal Emisor
  if (!facturaData.regimen_fiscal_emisor || facturaData.regimen_fiscal_emisor === 'N/A') {
    errors.push({
      field: 'Régimen Fiscal Emisor',
      message: 'El régimen fiscal del emisor es requerido',
      required: true
    });
  } else if (!REGIMENES_FISCALES_VALIDOS.includes(facturaData.regimen_fiscal_emisor)) {
    errors.push({
      field: 'Régimen Fiscal Emisor',
      message: `El régimen fiscal "${facturaData.regimen_fiscal_emisor}" no es válido según el catálogo del SAT`
    });
  }

  // Validar RFC Receptor
  if (!facturaData.rfc_receptor || facturaData.rfc_receptor.trim() === '') {
    errors.push({
      field: 'RFC Receptor',
      message: 'El RFC del receptor es requerido',
      required: true
    });
  } else if (!/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(facturaData.rfc_receptor)) {
    errors.push({
      field: 'RFC Receptor',
      message: 'El RFC del receptor no tiene un formato válido'
    });
  }

  // Validar Nombre Receptor
  if (!facturaData.nombre_receptor || facturaData.nombre_receptor.trim() === '') {
    errors.push({
      field: 'Nombre Receptor',
      message: 'El nombre o razón social del receptor es requerido',
      required: true
    });
  }

  // Validar Régimen Fiscal Receptor
  if (!facturaData.regimen_fiscal_receptor || facturaData.regimen_fiscal_receptor === 'N/A') {
    errors.push({
      field: 'Régimen Fiscal Receptor',
      message: 'El régimen fiscal del receptor es requerido. Por favor, completa la información del cliente.',
      required: true
    });
  } else if (!REGIMENES_FISCALES_VALIDOS.includes(facturaData.regimen_fiscal_receptor)) {
    errors.push({
      field: 'Régimen Fiscal Receptor',
      message: `El régimen fiscal "${facturaData.regimen_fiscal_receptor}" no es válido según el catálogo del SAT`
    });
  }

  // Validar Uso CFDI
  if (!facturaData.uso_cfdi || facturaData.uso_cfdi === 'N/A') {
    errors.push({
      field: 'Uso CFDI',
      message: 'El uso de CFDI es requerido',
      required: true
    });
  } else if (!USOS_CFDI_VALIDOS.includes(facturaData.uso_cfdi)) {
    errors.push({
      field: 'Uso CFDI',
      message: `El uso de CFDI "${facturaData.uso_cfdi}" no es válido según el catálogo del SAT`
    });
  }

  // Validar montos
  if (facturaData.subtotal <= 0) {
    errors.push({
      field: 'Subtotal',
      message: 'El subtotal debe ser mayor a cero',
      required: true
    });
  }

  if (facturaData.total <= 0) {
    errors.push({
      field: 'Total',
      message: 'El total debe ser mayor a cero',
      required: true
    });
  }

  return errors;
}

export function parseSatError(errorResponse: any): {
  codigo?: string;
  message?: string;
  messageDetail?: string;
} {
  if (typeof errorResponse === 'string') {
    return { message: errorResponse };
  }

  if (errorResponse?.details) {
    return {
      codigo: errorResponse.codigo || errorResponse.details.codigo,
      message: errorResponse.error || errorResponse.details.message,
      messageDetail: errorResponse.details.messageDetail
    };
  }

  return {
    message: errorResponse?.error || errorResponse?.message || 'Error desconocido'
  };
}
