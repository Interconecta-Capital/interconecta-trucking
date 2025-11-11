import { supabase } from '@/integrations/supabase/client';
import { DocumentValidationService } from './DocumentValidationService';

export interface MigrationResult {
  success: boolean;
  recordId: string;
  columnName: string;
  error?: string;
  checksum?: string;
}

export interface MigrationSummary {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ recordId: string; error: string }>;
}

export interface MigrationStats {
  conductores: { total: number; encrypted: number };
  vehiculos: { total: number; encrypted: number };
  remolques: { total: number; encrypted: number };
  socios: { total: number; encrypted: number };
}

export interface VerificationResult {
  isValid: boolean;
  canDecrypt: boolean;
  error?: string;
}

export class DocumentMigrationService {
  /**
   * Migra un documento individual desde URL/File a storage cifrado
   */
  static async migrateDocument(params: {
    tableName: string;
    recordId: string;
    columnName: string;
    sourceUrl?: string;
    sourceFile?: File;
  }): Promise<MigrationResult> {
    const { tableName, recordId, columnName, sourceUrl, sourceFile } = params;

    try {
      let file: File;

      // Obtener el archivo desde URL o usar el File proporcionado
      if (sourceFile) {
        file = sourceFile;
      } else if (sourceUrl) {
        // Descargar desde URL
        const response = await fetch(sourceUrl);
        const blob = await response.blob();
        const filename = sourceUrl.split('/').pop() || 'document';
        file = new File([blob], filename, { type: blob.type });
      } else {
        return {
          success: false,
          recordId,
          columnName,
          error: 'No se proporcionó sourceUrl ni sourceFile'
        };
      }

      // Validar el archivo según el tipo de documento
      const documentType = this.getDocumentTypeFromColumn(columnName);
      const validation = DocumentValidationService.validateFile(file, documentType);

      if (!validation.valid) {
        return {
          success: false,
          recordId,
          columnName,
          error: validation.errors.join(', ')
        };
      }

      // Determinar el bucket según la tabla
      const bucket = this.getBucketName(tableName);
      if (!bucket) {
        return {
          success: false,
          recordId,
          columnName,
          error: `Bucket no encontrado para tabla ${tableName}`
        };
      }

      // Generar path único para el archivo
      const timestamp = Date.now();
      const sanitizedFilename = DocumentValidationService.sanitizeFilename(file.name);
      const filePath = `${recordId}/${columnName}_${timestamp}_${sanitizedFilename}`;

      // Subir a Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        return {
          success: false,
          recordId,
          columnName,
          error: `Error al subir: ${uploadError.message}`
        };
      }

      // Leer el contenido del archivo para cifrarlo
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      // Cifrar el documento usando la función de DB
      const { data: encryptData, error: encryptError } = await supabase.rpc('encrypt_document', {
        table_name: tableName,
        record_id: recordId,
        column_name: columnName,
        document_data: base64Data
      }) as { data: any; error: any };

      if (encryptError) {
        // Limpiar archivo subido si falla el cifrado
        await supabase.storage.from(bucket).remove([filePath]);
        return {
          success: false,
          recordId,
          columnName,
          error: `Error al cifrar: ${encryptError.message}`
        };
      }

      // Registrar en audit log
      await supabase.from('security_audit_log').insert({
        event_type: 'document_migrated',
        event_data: {
          table_name: tableName,
          record_id: recordId,
          column_name: columnName,
          file_size: file.size,
          file_type: file.type,
          storage_path: filePath
        }
      });

      return {
        success: true,
        recordId,
        columnName,
        checksum: encryptData?.checksum || 'unknown'
      };
    } catch (error) {
      console.error('Error en migración:', error);
      return {
        success: false,
        recordId,
        columnName,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Migra todos los documentos de una tabla
   */
  static async migrateTableDocuments(
    tableName: string,
    onProgress?: (progress: number, current: number, total: number) => void
  ): Promise<MigrationSummary> {
    try {
      // Obtener lista de documentos pendientes de migración
      const { data: documents, error } = await supabase.rpc('get_documents_for_migration', {
        p_table_name: tableName
      }) as { data: any[] | null; error: any };

      if (error || !documents || !Array.isArray(documents)) {
        return {
          total: 0,
          successful: 0,
          failed: 0,
          errors: [{ recordId: 'N/A', error: error?.message || 'No se encontraron documentos' }]
        };
      }

      const total = documents.length;
      let successful = 0;
      let failed = 0;
      const errors: Array<{ recordId: string; error: string }> = [];

      // Migrar en lotes de 5 para no saturar
      const batchSize = 5;
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        
        const results = await Promise.all(
          batch.map(doc =>
            this.migrateDocument({
              tableName,
              recordId: doc.record_id,
              columnName: doc.column_name,
              sourceUrl: doc.url_value
            })
          )
        );

        results.forEach(result => {
          if (result.success) {
            successful++;
          } else {
            failed++;
            errors.push({
              recordId: result.recordId,
              error: result.error || 'Error desconocido'
            });
          }
        });

        // Reportar progreso
        const current = Math.min(i + batchSize, total);
        const progress = Math.round((current / total) * 100);
        onProgress?.(progress, current, total);

        // Pequeña pausa entre lotes
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      return { total, successful, failed, errors };
    } catch (error) {
      console.error('Error en migración masiva:', error);
      return {
        total: 0,
        successful: 0,
        failed: 0,
        errors: [{ recordId: 'N/A', error: error instanceof Error ? error.message : 'Error crítico' }]
      };
    }
  }

  /**
   * Verifica la integridad de un documento migrado
   */
  static async verifyMigration(
    tableName: string,
    recordId: string,
    columnName: string
  ): Promise<VerificationResult> {
    try {
      const { data, error } = await supabase.rpc('verify_document_integrity', {
        p_table_name: tableName,
        p_record_id: recordId,
        p_column_name: columnName
      }) as { data: any; error: any };

      if (error) {
        return {
          isValid: false,
          canDecrypt: false,
          error: error.message
        };
      }

      const result = data as { valid?: boolean; can_decrypt?: boolean } | null;
      return {
        isValid: result?.valid || false,
        canDecrypt: result?.can_decrypt || false
      };
    } catch (error) {
      return {
        isValid: false,
        canDecrypt: false,
        error: error instanceof Error ? error.message : 'Error al verificar'
      };
    }
  }

  /**
   * Obtiene estadísticas de migración
   */
  static async getMigrationStats(): Promise<MigrationStats> {
    try {
      const { data, error } = await supabase.rpc('get_encryption_stats') as { data: any; error: any };

      if (error || !data) {
        return {
          conductores: { total: 0, encrypted: 0 },
          vehiculos: { total: 0, encrypted: 0 },
          remolques: { total: 0, encrypted: 0 },
          socios: { total: 0, encrypted: 0 }
        };
      }

      // Parsear el resultado JSONB
      const stats = typeof data === 'string' ? JSON.parse(data) : data;
      return {
        conductores: stats.conductores || { total: 0, encrypted: 0 },
        vehiculos: stats.vehiculos || { total: 0, encrypted: 0 },
        remolques: stats.remolques || { total: 0, encrypted: 0 },
        socios: stats.socios || { total: 0, encrypted: 0 }
      };
    } catch (error) {
      console.error('Error obteniendo stats:', error);
      return {
        conductores: { total: 0, encrypted: 0 },
        vehiculos: { total: 0, encrypted: 0 },
        remolques: { total: 0, encrypted: 0 },
        socios: { total: 0, encrypted: 0 }
      };
    }
  }

  // Helper methods
  private static getDocumentTypeFromColumn(columnName: string): string {
    if (columnName.includes('licencia')) return 'licencia';
    if (columnName.includes('identificacion')) return 'identificacion';
    if (columnName.includes('tarjeta_circulacion')) return 'tarjeta_circulacion';
    if (columnName.includes('poliza')) return 'poliza_seguro';
    if (columnName.includes('permiso')) return 'permiso_sct';
    if (columnName.includes('fiscal')) return 'documento_fiscal';
    return 'documento_general';
  }

  private static getBucketName(tableName: string): string | null {
    const bucketMap: Record<string, string> = {
      'conductores': 'conductores-docs',
      'vehiculos': 'vehiculos-docs',
      'remolques': 'remolques-docs',
      'socios': 'socios-docs'
    };
    return bucketMap[tableName] || null;
  }
}
