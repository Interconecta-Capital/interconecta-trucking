
import { supabase } from '@/integrations/supabase/client';
import { CertificadoDigital, CertificadoActivo } from '@/types/certificados';

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
      console.error('Error fetching certificates:', error);
      throw new Error('Error al obtener certificados');
    }

    return data || [];
  }

  /**
   * Obtiene el certificado activo del usuario
   */
  static async getActiveCertificate(): Promise<CertificadoDigital | null> {
    const { data, error } = await supabase
      .rpc('get_active_certificate');

    if (error) {
      console.error('Error fetching active certificate:', error);
      return null;
    }

    return data?.[0] || null;
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
      console.error('Error creating certificate:', error);
      throw new Error('Error al crear certificado');
    }

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
      console.error('Error activating certificate:', error);
      throw new Error('Error al activar certificado');
    }
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
      console.error('Error deleting certificate:', error);
      throw new Error('Error al eliminar certificado');
    }
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
      console.error('Error validating certificate:', error);
      throw new Error('Error al validar certificado');
    }
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
