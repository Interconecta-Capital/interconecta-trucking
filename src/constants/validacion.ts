/**
 * Constantes para validación de datos fiscales
 */

export const REGEX_PATTERNS = {
  RFC_PERSONA_FISICA: /^[A-Z&Ñ]{4}\d{6}[A-Z0-9]{3}$/,
  RFC_PERSONA_MORAL: /^[A-Z&Ñ]{3}\d{6}[A-Z0-9]{3}$/,
  CODIGO_POSTAL: /^\d{5}$/,
  CURP: /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/,
} as const;

export const LONGITUDES = {
  RFC_PERSONA_FISICA: 13,
  RFC_PERSONA_MORAL: 12,
  CURP: 18,
  CODIGO_POSTAL: 5,
} as const;

export const CAMPOS_REQUERIDOS_EMISOR = [
  'rfc',
  'nombre',
  'regimen_fiscal',
  'codigo_postal',
] as const;

export const CAMPOS_REQUERIDOS_RECEPTOR = [
  'rfc',
  'nombre',
  'regimen_fiscal',
  'domicilio_fiscal',
  'uso_cfdi',
] as const;

export const CAMPOS_REQUERIDOS_UBICACION = [
  'tipo_ubicacion',
  'fecha_hora_salida_llegada',
  'domicilio',
] as const;

export const CAMPOS_REQUERIDOS_MERCANCIA = [
  'bienes_transp',
  'descripcion',
  'cantidad',
  'clave_unidad',
  'peso_kg',
] as const;

export const CAMPOS_REQUERIDOS_AUTOTRANSPORTE = [
  'config_vehicular',
  'peso_bruto_vehicular',
  'placa_vm',
  'perm_sct',
] as const;

export const CAMPOS_REQUERIDOS_FIGURA = [
  'tipo_figura',
  'rfc_figura',
  'nombre_figura',
] as const;

export const VALORES_MINIMOS = {
  DISTANCIA_KM: 0.1,
  PESO_KG: 0.01,
  CANTIDAD: 0.01,
  VALOR_MERCANCIA: 0,
} as const;

export const CACHE_TTL = {
  RFC_VALIDATION: 7 * 24 * 60 * 60 * 1000, // 7 días
  CATALOGO_SAT: 30 * 24 * 60 * 60 * 1000, // 30 días
} as const;
