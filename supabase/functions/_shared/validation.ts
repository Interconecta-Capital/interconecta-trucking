// ============================================
// VALIDACIONES ZOD COMPARTIDAS
// ============================================
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// ============================================
// VALIDACIONES BÁSICAS
// ============================================

// RFC mexicano válido (12-13 caracteres)
const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;

// UUID válido
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const RFCSchema = z.string()
  .min(12, "RFC debe tener mínimo 12 caracteres")
  .max(13, "RFC debe tener máximo 13 caracteres")
  .regex(rfcRegex, "RFC inválido");

export const UUIDSchema = z.string()
  .regex(uuidRegex, "UUID inválido");

export const AmbienteSchema = z.enum(['sandbox', 'production']).default('sandbox');

// ============================================
// VALIDACIÓN: TIMBRAR CARTA PORTE
// ============================================

const UbicacionSchema = z.object({
  tipo_ubicacion: z.enum(['Origen', 'Destino', 'Paso Intermedio']).optional(),
  tipo: z.enum(['Origen', 'Destino', 'Paso Intermedio']).optional(),
  rfc_remitente_destinatario: RFCSchema.optional(),
  nombre_remitente_destinatario: z.string().min(1).max(254).optional(),
  fecha_hora_salida_llegada: z.string().optional(),
  distancia_recorrida: z.number().positive().optional(),
  id_ubicacion: z.string().optional(),
  domicilio: z.object({
    calle: z.string().min(1).max(100).optional(),
    numero_exterior: z.string().max(55).optional(),
    numero_interior: z.string().max(55).optional(),
    colonia: z.string().max(120).optional(),
    localidad: z.string().max(120).optional(),
    referencia: z.string().max(250).optional(),
    municipio: z.string().max(120).optional(),
    estado: z.string().length(3).optional(),
    pais: z.string().length(3).optional(),
    codigo_postal: z.string().regex(/^\d{5}$/).optional(),
  }).optional(),
}).passthrough(); // 🔐 Permitir campos adicionales del sistema

// 🔐 Schema flexible: Acepta array O objeto {origen, destino}
// Usa z.custom() para validación totalmente personalizada
const UbicacionesFlexibleSchema = z.custom<any>((val) => {
  // Validar que existe
  if (!val) return false;

  // Formato array: validar que tenga al menos 2 elementos
  if (Array.isArray(val)) {
    return val.length >= 2;
  }

  // Formato objeto: validar que tenga origen Y destino
  if (typeof val === 'object' && val !== null) {
    return !!(val.origen && val.destino);
  }

  return false;
}, {
  message: "Ubicaciones debe ser: array con 2+ elementos O objeto con {origen, destino}"
});

const MercanciaSchema = z.object({
  bienes_transp: z.string().min(1).max(1000),
  clave_prod_serv: z.string().regex(/^\d{8}$/),
  cantidad: z.number().positive(),
  clave_unidad: z.string().min(2).max(3),
  unidad: z.string().max(20).optional(),
  dimensiones: z.string().max(500).optional(),
  material_peligroso: z.enum(['Sí', 'No']).optional(),
  cve_material_peligroso: z.string().optional(),
  embalaje: z.string().optional(),
  descripcion_embalaje: z.string().max(500).optional(),
  peso_en_kg: z.number().positive(),
  valor_mercancia: z.number().positive().optional(),
  moneda: z.string().length(3).default('MXN'),
  fraccion_arancelaria: z.string().optional(),
  uuid_comercio_ext: z.string().optional(),
});

const FiguraTransporteSchema = z.object({
  tipo_figura: z.string().min(2).max(2),
  rfc_figura: RFCSchema.optional(),
  num_licencia: z.string().max(16).optional(),
  nombre_figura: z.string().min(1).max(254).optional(),
  num_reg_id_trib_figura: z.string().max(40).optional(),
  residencia_fiscal_figura: z.string().length(3).optional(),
  domicilio_fiscal: z.object({
    calle: z.string().max(100).optional(),
    numero_exterior: z.string().max(55).optional(),
    numero_interior: z.string().max(55).optional(),
    colonia: z.string().max(120).optional(),
    localidad: z.string().max(120).optional(),
    municipio: z.string().max(120).optional(),
    estado: z.string().length(3).optional(),
    pais: z.string().length(3).optional(),
    codigo_postal: z.string().regex(/^\d{5}$/).optional(),
  }).optional(),
});

const AutotransporteSchema = z.object({
  perm_sct: z.string().min(6).max(7),
  num_permiso_sct: z.string().max(50),
  config_vehicular: z.string().min(2).max(7),
  placa_vm: z.string().max(10),
  anio_modelo_vm: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  peso_bruto_vehicular: z.number().positive(),
  asegura_resp_civil: z.string().max(50),
  poliza_resp_civil: z.string().max(30),
});

export const TimbrarCartaPorteSchema = z.object({
  cartaPorteData: z.object({
    rfcEmisor: RFCSchema,
    nombreEmisor: z.string().min(1).max(254),
    rfcReceptor: RFCSchema,
    nombreReceptor: z.string().min(1).max(254),
    ubicaciones: UbicacionesFlexibleSchema,
    mercancias: z.array(MercanciaSchema).min(1, "Se requiere al menos 1 mercancía"),
    figuras_transporte: z.array(FiguraTransporteSchema).optional(),
    autotransporte: AutotransporteSchema.optional(),
    transporte_internacional: z.boolean().optional(),
    entrada_salida_merc: z.enum(['Entrada', 'Salida']).optional(),
    pais_origen_destino: z.string().length(3).optional(),
    via_entrada_salida: z.string().length(2).optional(),
    peso_bruto_total: z.number().positive(),
    distancia_total: z.number().positive().optional(),
  }).passthrough().optional(), // 🔐 Permitir campos adicionales del sistema
  cartaPorteId: UUIDSchema.optional(),
  facturaData: z.object({
    rfcEmisor: RFCSchema,
    rfcReceptor: RFCSchema,
    total: z.number().positive(),
    subtotal: z.number().positive(),
    conceptos: z.array(z.object({
      clave_prod_serv: z.string().regex(/^\d{8}$/),
      cantidad: z.number().positive(),
      clave_unidad: z.string().min(2).max(3),
      descripcion: z.string().min(1).max(1000),
      valor_unitario: z.number().positive(),
      importe: z.number().positive(),
    })).min(1),
    // 🔐 Ubicaciones flexibles: array OR objeto {origen, destino}
    ubicaciones: UbicacionesFlexibleSchema.optional(),
    tracking_data: z.object({
      ubicaciones: UbicacionesFlexibleSchema.optional()
    }).passthrough().optional(), // 🔐 Permitir otros campos de tracking
  }).passthrough().optional(), // 🔐 Permitir campos adicionales del sistema
  facturaId: UUIDSchema.optional(),
  ambiente: AmbienteSchema,
}).refine(
  data => data.cartaPorteData || data.facturaData,
  { message: "Debe proporcionar cartaPorteData o facturaData" }
).refine(
  // 🔐 ISO 27001 A.14.2.1 - Validación de integridad con formato flexible
  data => {
    const ubicaciones = data.facturaData?.ubicaciones || data.facturaData?.tracking_data?.ubicaciones;
    
    if (!ubicaciones) return true; // Sin ubicaciones = factura simple (válido)
    
    // Formato array: requiere mínimo 2
    if (Array.isArray(ubicaciones)) {
      return ubicaciones.length >= 2;
    }
    
    // Formato objeto: requiere origen Y destino
    if (typeof ubicaciones === 'object' && ubicaciones !== null) {
      return !!(ubicaciones.origen && ubicaciones.destino);
    }
    
    return false; // Formato inválido
  },
  { 
    message: "Ubicaciones deben ser: array con 2+ elementos O objeto con {origen, destino}",
    path: ["facturaData", "ubicaciones"]
  }
);

// ============================================
// VALIDACIÓN: GENERAR PDF FACTURA
// ============================================

export const GenerarPDFFacturaSchema = z.object({
  facturaId: UUIDSchema,
});

// ============================================
// VALIDACIÓN: CONSULTAR RFC SAT
// ============================================

export const ConsultarRFCSATSchema = z.object({
  rfc: RFCSchema,
});

// ============================================
// VALIDACIÓN: CANCELAR CFDI
// ============================================

export const CancelarCFDISchema = z.object({
  uuid: UUIDSchema,
  rfc: RFCSchema,
  motivo: z.enum(['01', '02', '03', '04'], {
    errorMap: () => ({ message: "Motivo inválido. Debe ser 01, 02, 03 o 04" })
  }),
  folioSustitucion: UUIDSchema.optional(),
  ambiente: AmbienteSchema,
});

// ============================================
// VALIDACIÓN: PROCESAR CERTIFICADO
// ============================================

export const ProcesarCertificadoSchema = z.object({
  nombreCertificado: z.string().min(1).max(255),
  archivoCerBase64: z.string().min(100), // Base64 del archivo .cer
  archivoKeyBase64: z.string().min(100), // Base64 del archivo .key
  password: z.string().min(4).max(50),
});

// ============================================
// UTILIDADES DE VALIDACIÓN
// ============================================

export interface ValidationError {
  field: string;
  message: string;
}

export function formatZodErrors(error: z.ZodError): ValidationError[] {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}

export function createValidationErrorResponse(error: z.ZodError, corsHeaders: Record<string, string>): Response {
  console.error('❌ Validación fallida:', JSON.stringify(error.format(), null, 2));
  
  return new Response(JSON.stringify({ 
    success: false, 
    error: 'Datos inválidos',
    validationErrors: formatZodErrors(error),
  }), { 
    status: 400, 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  });
}
