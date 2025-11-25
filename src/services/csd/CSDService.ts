/**
 * CSD Service - Servicio de Certificados Digitales
 * @version 2.0.0 - Migrado a logger sanitizado
 */

import { supabase } from '@/integrations/supabase/client';
import { CertificadoDigital, CertificadoActivo } from '@/types/certificados';
import logger from '@/utils/logger';

export class CSDService {
  
  /**
   * Obtiene todos los certificados del usuario actual
   */
  static async getUserCertificates(): Promise<CertificadoDigital[]> {
    const { data, error } = await supabase
      .from('certificados_digitales')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('csd', 'Error al obtener certificados', error);
      throw new Error('Error al obtener certificados');
    }

    logger.debug('csd', `${data?.length || 0} certificados encontrados`);
    return data || [];
  }

  /**
   * Obtiene el certificado activo del usuario
   */
  static async getActiveCertificate(): Promise<CertificadoDigital | null> {
    const { data, error } = await supabase
      .from('certificados_digitales')
      .select('*')
      .eq('activo', true)
      .eq('validado', true)
      .single();

    if (error) {
      logger.warn('csd', 'No se encontró certificado activo');
      return null;
    }

    logger.debug('csd', 'Certificado activo obtenido');
    return data || null;
  }

  /**
   * Crea un nuevo certificado digital
   */
  static async createCertificate(certificateData: Omit<CertificadoDigital, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<CertificadoDigital> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('certificados_digitales')
      .insert({
        ...certificateData,
        user_id: user.user.id
      })
      .select()
      .single();

    if (error) {
      logger.error('csd', 'Error al crear certificado', error);
      throw new Error('Error al crear certificado');
    }

    logger.info('csd', 'Certificado creado exitosamente', { 
      id: data.id,
      nombre: data.nombre_certificado 
    });
    return data;
  }

  /**
   * Activa un certificado específico
   */
  static async activateCertificate(certificateId: string): Promise<void> {
    const { error } = await supabase
      .from('certificados_digitales')
      .update({ activo: true, updated_at: new Date().toISOString() })
      .eq('id', certificateId);

    if (error) {
      logger.error('csd', 'Error al activar certificado', error);
      throw new Error('Error al activar certificado');
    }

    logger.info('csd', 'Certificado activado', { certificateId });
  }

  /**
   * Actualiza un certificado existente
   */
  static async updateCertificate(
    certificateId: string,
    updateData: {
      nombreCertificado?: string;
      nuevoArchivoCer?: File;
      nuevoArchivoKey?: File;
      nuevaPassword?: string;
    }
  ): Promise<CertificadoDigital> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuario no autenticado');

    // Obtener certificado actual
    const { data: certActual } = await supabase
      .from('certificados_digitales')
      .select('*')
      .eq('id', certificateId)
      .single();

    if (!certActual) throw new Error('Certificado no encontrado');

    let cerPath = certActual.archivo_cer_path;
    let keyPath = certActual.archivo_key_path;

    // Si hay archivos nuevos, subirlos y eliminar antiguos
    if (updateData.nuevoArchivoCer && updateData.nuevoArchivoKey) {
      const timestamp = Date.now();
      const newCerName = `${user.user.id}/${timestamp}_${updateData.nuevoArchivoCer.name}`;
      const newKeyName = `${user.user.id}/${timestamp}_${updateData.nuevoArchivoKey.name}`;

      logger.debug('csd', 'Subiendo nuevos archivos de certificado');

      // Subir nuevos archivos
      const { error: cerError } = await supabase.storage
        .from('certificados')
        .upload(newCerName, updateData.nuevoArchivoCer, {
          contentType: 'application/x-x509-ca-cert',
          upsert: false
        });

      if (cerError) {
        logger.error('csd', 'Error al subir archivo .cer', cerError);
        throw new Error('Error al subir archivo .cer: ' + cerError.message);
      }

      const { error: keyError } = await supabase.storage
        .from('certificados')
        .upload(newKeyName, updateData.nuevoArchivoKey, {
          contentType: 'application/octet-stream',
          upsert: false
        });

      if (keyError) {
        // Rollback: eliminar .cer si .key falló
        await supabase.storage.from('certificados').remove([newCerName]);
        logger.error('csd', 'Error al subir archivo .key', keyError);
        throw new Error('Error al subir archivo .key: ' + keyError.message);
      }

      // Eliminar archivos antiguos
      await supabase.storage
        .from('certificados')
        .remove([certActual.archivo_cer_path, certActual.archivo_key_path]);

      cerPath = newCerName;
      keyPath = newKeyName;
    }

    // Actualizar registro en base de datos
    const { data, error } = await supabase
      .from('certificados_digitales')
      .update({
        nombre_certificado: updateData.nombreCertificado || certActual.nombre_certificado,
        archivo_cer_path: cerPath,
        archivo_key_path: keyPath,
        updated_at: new Date().toISOString()
      })
      .eq('id', certificateId)
      .select()
      .single();

    if (error) {
      logger.error('csd', 'Error al actualizar certificado', error);
      throw new Error('Error al actualizar certificado');
    }

    logger.info('csd', 'Certificado actualizado exitosamente', { certificateId });
    return data;
  }

  /**
   * Elimina un certificado
   */
  static async deleteCertificate(certificateId: string): Promise<void> {
    // Primero obtener las rutas de archivos para eliminarlos
    const { data: certificate } = await supabase
      .from('certificados_digitales')
      .select('archivo_cer_path, archivo_key_path')
      .eq('id', certificateId)
      .single();

    if (certificate) {
      // Eliminar archivos del storage
      await supabase.storage
        .from('certificados')
        .remove([certificate.archivo_cer_path, certificate.archivo_key_path]);
    }

    // Eliminar registro de la base de datos
    const { error } = await supabase
      .from('certificados_digitales')
      .delete()
      .eq('id', certificateId);

    if (error) {
      logger.error('csd', 'Error al eliminar certificado', error);
      throw new Error('Error al eliminar certificado');
    }

    logger.info('csd', 'Certificado eliminado', { certificateId });
  }

  /**
   * Valida un certificado marcándolo como validado
   */
  static async validateCertificate(certificateId: string): Promise<void> {
    const { error } = await supabase
      .from('certificados_digitales')
      .update({ validado: true, updated_at: new Date().toISOString() })
      .eq('id', certificateId);

    if (error) {
      logger.error('csd', 'Error al validar certificado', error);
      throw new Error('Error al validar certificado');
    }

    logger.info('csd', 'Certificado validado', { certificateId });
  }

  /**
   * Verifica si un certificado está vigente
   */
  static isCertificateValid(certificate: CertificadoDigital): boolean {
    const now = new Date();
    const startDate = new Date(certificate.fecha_inicio_vigencia);
    const endDate = new Date(certificate.fecha_fin_vigencia);
    
    return now >= startDate && now <= endDate && certificate.validado;
  }

  /**
   * Obtiene los días restantes de vigencia
   */
  static getDaysUntilExpiration(certificate: CertificadoDigital): number {
    const now = new Date();
    const endDate = new Date(certificate.fecha_fin_vigencia);
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
