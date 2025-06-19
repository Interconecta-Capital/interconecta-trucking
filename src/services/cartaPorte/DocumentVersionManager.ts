
import { supabase } from '@/integrations/supabase/client';
import { 
  CartaPorteDocumento,
  GenerarDocumentoRequest
} from '@/types/cartaPorteLifecycle';

export class DocumentVersionManager {
  
  /**
   * Generar y guardar un nuevo documento
   */
  static async generarDocumento(request: GenerarDocumentoRequest): Promise<CartaPorteDocumento> {
    try {
      // Obtener la siguiente versión
      const siguienteVersion = await this.obtenerSiguienteVersion(
        request.cartaPorteId, 
        request.tipoDocumento
      );

      const { data, error } = await supabase
        .from('carta_porte_documentos')
        .insert({
          carta_porte_id: request.cartaPorteId,
          tipo_documento: request.tipoDocumento,
          version_documento: request.version || siguienteVersion,
          contenido_blob: request.contenido,
          metadatos: request.metadatos || {},
        })
        .select()
        .single();

      if (error) {
        console.error('Error generando documento:', error);
        throw new Error(`Error generando documento: ${error.message}`);
      }

      console.log('Documento generado exitosamente:', data.id, data.tipo_documento, data.version_documento);
      return data;
    } catch (error) {
      console.error('Error en generarDocumento:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las versiones de un tipo de documento
   */
  static async obtenerVersiones(
    cartaPorteId: string, 
    tipoDocumento: string
  ): Promise<CartaPorteDocumento[]> {
    try {
      const { data, error } = await supabase
        .from('carta_porte_documentos')
        .select('*')
        .eq('carta_porte_id', cartaPorteId)
        .eq('tipo_documento', tipoDocumento)
        .eq('activo', true)
        .order('fecha_generacion', { ascending: false });

      if (error) {
        console.error('Error obteniendo versiones:', error);
        throw new Error(`Error obteniendo versiones: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error en obtenerVersiones:', error);
      throw error;
    }
  }

  /**
   * Obtener la última versión de un tipo de documento
   */
  static async obtenerUltimaVersion(
    cartaPorteId: string, 
    tipoDocumento: string
  ): Promise<CartaPorteDocumento | null> {
    try {
      const versiones = await this.obtenerVersiones(cartaPorteId, tipoDocumento);
      return versiones.length > 0 ? versiones[0] : null;
    } catch (error) {
      console.error('Error en obtenerUltimaVersion:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los documentos de una carta porte
   */
  static async obtenerTodosLosDocumentos(cartaPorteId: string): Promise<CartaPorteDocumento[]> {
    try {
      const { data, error } = await supabase
        .from('carta_porte_documentos')
        .select('*')
        .eq('carta_porte_id', cartaPorteId)
        .eq('activo', true)
        .order('fecha_generacion', { ascending: false });

      if (error) {
        console.error('Error obteniendo documentos:', error);
        throw new Error(`Error obteniendo documentos: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error en obtenerTodosLosDocumentos:', error);
      throw error;
    }
  }

  /**
   * Archivar una versión específica
   */
  static async archivarVersion(
    cartaPorteId: string, 
    tipoDocumento: string, 
    version: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('carta_porte_documentos')
        .update({ activo: false })
        .eq('carta_porte_id', cartaPorteId)
        .eq('tipo_documento', tipoDocumento)
        .eq('version_documento', version);

      if (error) {
        console.error('Error archivando versión:', error);
        throw new Error(`Error archivando versión: ${error.message}`);
      }

      console.log('Versión archivada exitosamente:', tipoDocumento, version);
    } catch (error) {
      console.error('Error en archivarVersion:', error);
      throw error;
    }
  }

  /**
   * Obtener la siguiente versión para un tipo de documento
   */
  private static async obtenerSiguienteVersion(
    cartaPorteId: string, 
    tipoDocumento: string
  ): Promise<string> {
    try {
      const versiones = await this.obtenerVersiones(cartaPorteId, tipoDocumento);
      
      if (versiones.length === 0) {
        return 'v1.0';
      }

      // Obtener el número más alto de versión
      const numerosMayores = versiones
        .map(v => {
          const match = v.version_documento.match(/v(\d+)\.(\d+)/);
          if (match) {
            return {
              major: parseInt(match[1]),
              minor: parseInt(match[2])
            };
          }
          return { major: 1, minor: 0 };
        })
        .sort((a, b) => {
          if (a.major !== b.major) return b.major - a.major;
          return b.minor - a.minor;
        });

      const ultimaVersion = numerosMayores[0];
      
      // Para documentos derivados (firmado, timbrado), incrementar minor
      if (tipoDocumento.includes('firmado') || tipoDocumento.includes('timbrado')) {
        return `v${ultimaVersion.major}.${ultimaVersion.minor + 1}`;
      }
      
      // Para documentos base (xml, pdf), incrementar major
      return `v${ultimaVersion.major + 1}.0`;
    } catch (error) {
      console.error('Error obteniendo siguiente versión:', error);
      return 'v1.0';
    }
  }

  /**
   * Buscar documento por tipo y versión específica
   */
  static async buscarDocumento(
    cartaPorteId: string,
    tipoDocumento: string,
    version?: string
  ): Promise<CartaPorteDocumento | null> {
    try {
      let query = supabase
        .from('carta_porte_documentos')
        .select('*')
        .eq('carta_porte_id', cartaPorteId)
        .eq('tipo_documento', tipoDocumento)
        .eq('activo', true);

      if (version) {
        query = query.eq('version_documento', version);
      }

      const { data, error } = await query
        .order('fecha_generacion', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error buscando documento:', error);
        throw new Error(`Error buscando documento: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error en buscarDocumento:', error);
      throw error;
    }
  }

  /**
   * Actualizar metadatos de un documento
   */
  static async actualizarMetadatos(
    documentoId: string,
    metadatos: any
  ): Promise<CartaPorteDocumento> {
    try {
      const { data, error } = await supabase
        .from('carta_porte_documentos')
        .update({ metadatos })
        .eq('id', documentoId)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando metadatos:', error);
        throw new Error(`Error actualizando metadatos: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error en actualizarMetadatos:', error);
      throw error;
    }
  }
}
