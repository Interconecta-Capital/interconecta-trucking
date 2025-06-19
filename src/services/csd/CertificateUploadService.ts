
import { supabase } from '@/integrations/supabase/client';
import { CSDUploadData } from '@/types/certificados';

export class CertificateUploadService {
  
  /**
   * Sube archivos de certificado al storage
   */
  static async uploadCertificateFiles(
    uploadData: CSDUploadData,
    userId: string
  ): Promise<{ cerPath: string; keyPath: string }> {
    
    // Generar nombres únicos para los archivos
    const timestamp = Date.now();
    const cerFileName = `${userId}/${timestamp}_${uploadData.nombreCertificado}.cer`;
    const keyFileName = `${userId}/${timestamp}_${uploadData.nombreCertificado}.key`;

    try {
      // Subir archivo .cer
      const { error: cerError } = await supabase.storage
        .from('certificados')
        .upload(cerFileName, uploadData.archivoCer);

      if (cerError) {
        console.error('Error uploading .cer file:', cerError);
        throw new Error('Error al subir archivo .cer');
      }

      // Subir archivo .key
      const { error: keyError } = await supabase.storage
        .from('certificados')
        .upload(keyFileName, uploadData.archivoKey);

      if (keyError) {
        // Si falla el .key, limpiar el .cer
        await supabase.storage.from('certificados').remove([cerFileName]);
        console.error('Error uploading .key file:', keyError);
        throw new Error('Error al subir archivo .key');
      }

      return {
        cerPath: cerFileName,
        keyPath: keyFileName
      };

    } catch (error) {
      console.error('Error in certificate upload:', error);
      throw error;
    }
  }

  /**
   * Descarga un archivo de certificado
   */
  static async downloadCertificateFile(filePath: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from('certificados')
      .download(filePath);

    if (error) {
      console.error('Error downloading certificate file:', error);
      throw new Error('Error al descargar archivo de certificado');
    }

    return data;
  }

  /**
   * Elimina archivos de certificado del storage
   */
  static async deleteCertificateFiles(cerPath: string, keyPath: string): Promise<void> {
    const { error } = await supabase.storage
      .from('certificados')
      .remove([cerPath, keyPath]);

    if (error) {
      console.error('Error deleting certificate files:', error);
      throw new Error('Error al eliminar archivos de certificado');
    }
  }

  /**
   * Valida que los archivos tengan las extensiones correctas
   */
  static validateFileExtensions(cerFile: File, keyFile: File): string[] {
    const errors: string[] = [];

    if (!cerFile.name.toLowerCase().endsWith('.cer')) {
      errors.push('El archivo de certificado debe tener extensión .cer');
    }

    if (!keyFile.name.toLowerCase().endsWith('.key')) {
      errors.push('El archivo de llave privada debe tener extensión .key');
    }

    return errors;
  }

  /**
   * Valida el tamaño de los archivos
   */
  static validateFileSizes(cerFile: File, keyFile: File): string[] {
    const errors: string[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (cerFile.size > maxSize) {
      errors.push('El archivo .cer no debe exceder 5MB');
    }

    if (keyFile.size > maxSize) {
      errors.push('El archivo .key no debe exceder 5MB');
    }

    return errors;
  }
}
