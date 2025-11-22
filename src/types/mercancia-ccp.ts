/**
 * ✅ ISO 27001: Tipos validados para Mercancías CCP 3.1
 * Validación con Zod para prevenir inyección y datos corruptos
 */

import { z } from 'zod';

// Schema de validación para mercancía extraída de documentos
export const MercanciaExtractedSchema = z.object({
  descripcion: z.string()
    .trim()
    .min(1, 'Descripción es requerida')
    .max(1000, 'Descripción debe ser menor a 1000 caracteres'),
  
  cantidad: z.number()
    .positive('Cantidad debe ser mayor a 0')
    .max(999999999, 'Cantidad excede el máximo permitido'),
  
  claveProdServ: z.string()
    .trim()
    .regex(/^\d{8}$/, 'Clave de producto/servicio debe ser de 8 dígitos')
    .optional()
    .nullable(),
  
  claveUnidad: z.string()
    .trim()
    .min(1, 'Clave de unidad es requerida')
    .max(10, 'Clave de unidad inválida'),
  
  peso_kg: z.number()
    .positive('Peso debe ser mayor a 0')
    .max(999999999, 'Peso excede el máximo permitido'),
  
  valor_mercancia: z.number()
    .nonnegative('Valor no puede ser negativo')
    .max(999999999999, 'Valor excede el máximo permitido'),
  
  moneda: z.string()
    .trim()
    .length(3, 'Código de moneda debe ser de 3 caracteres (ej: MXN, USD)')
    .default('MXN'),
  
  material_peligroso: z.string()
    .trim()
    .regex(/^UN\d{4}$/, 'Clave de material peligroso debe tener formato UN#### (ej: UN1203)')
    .optional()
    .nullable(),
  
  embalaje: z.string()
    .trim()
    .max(10, 'Código de embalaje inválido')
    .optional()
    .nullable(),
  
  fraccion_arancelaria: z.string()
    .trim()
    .regex(/^\d{8}$/, 'Fracción arancelaria debe ser de 8 dígitos')
    .optional()
    .nullable(),
  
  uuid_comercio_ext: z.string()
    .trim()
    .uuid('UUID de comercio exterior inválido')
    .optional()
    .nullable(),
  
  dimensiones_embalaje: z.string()
    .trim()
    .max(100, 'Dimensiones de embalaje inválidas')
    .optional()
    .nullable(),
  
  numero_piezas: z.number()
    .int('Número de piezas debe ser entero')
    .positive('Número de piezas debe ser mayor a 0')
    .optional()
    .nullable(),
});

export type MercanciaExtracted = z.infer<typeof MercanciaExtractedSchema>;

// Schema para el resultado completo del procesamiento
export const DocumentProcessingResultSchema = z.object({
  mercancias: z.array(MercanciaExtractedSchema),
  confidence: z.number().min(0).max(1),
  suggestions: z.array(z.string()).default([]),
});

export type DocumentProcessingResultData = z.infer<typeof DocumentProcessingResultSchema>;

// Función helper para validar y sanitizar datos extraídos
export function validateAndSanitizeMercancia(data: unknown): MercanciaExtracted {
  try {
    return MercanciaExtractedSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Validación de mercancía falló: ${errorMessages}`);
    }
    throw error;
  }
}

// Función helper para validar resultado completo
export function validateDocumentProcessingResult(data: unknown): DocumentProcessingResultData {
  try {
    return DocumentProcessingResultSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Validación de resultado falló: ${errorMessages}`);
    }
    throw error;
  }
}
