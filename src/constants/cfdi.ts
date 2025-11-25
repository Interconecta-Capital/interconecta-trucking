/**
 * Constantes CFDI 4.0 y CartaPorte 3.1
 * Centralizadas para evitar hardcodes
 */

export const CFDI_VERSIONS = {
  CFDI: '4.0',
  CARTA_PORTE: '3.1',
} as const;

export const TIPO_COMPROBANTE = {
  INGRESO: 'I',
  EGRESO: 'E',
  TRASLADO: 'T',
  NOMINA: 'N',
  PAGO: 'P',
} as const;

export const REGIMEN_FISCAL_DEFAULT = '601'; // General de Ley Personas Morales

export const USO_CFDI_DEFAULT = 'G03'; // Gastos en general

export const TIPO_FIGURA_OPERADOR = '01'; // Operador

export const MONEDA_DEFAULT = 'MXN';
export const MONEDA_SIN_VALOR = 'XXX'; // Para traslados sin valor

export const VIA_TRANSPORTE = {
  AUTOTRANSPORTE: '01',
  MARITIMO: '02',
  AEREO: '03',
  FERROVIARIO: '04',
  DUCTO: '05',
} as const;

export const TIPO_UBICACION = {
  ORIGEN: 'Origen',
  DESTINO: 'Destino',
} as const;

export const PERMISO_SCT_DEFAULT = 'TPAF01'; // Transporte privado de carga

export const CONFIG_VEHICULAR_DEFAULT = 'C2'; // Camión unitario 2 ejes

export const TIPO_CARROCERIA_DEFAULT = '01'; // No aplica

export const CLAVE_UNIDAD_DEFAULT = 'KGM'; // Kilogramo

export const BIENES_TRANSP_DEFAULT = '78101800'; // Servicio de transporte de carga

export const RFC_GENERICO_EXTRANJERO = 'XEXX010101000';

export const CODIGO_POSTAL_DEFAULT = '01000'; // CDMX Centro

export const TASA_IVA = 0.16; // 16%

export const ID_UBICACION_PREFIXES = {
  ORIGEN: 'OR',
  DESTINO: 'DE',
  INTERMEDIO: 'UB',
} as const;
