
import { supabase } from '@/integrations/supabase/client';
import { 
  BorradorCartaPorte, 
  CartaPorteCompleta,
  CreateBorradorRequest,
  UpdateBorradorRequest,
  ConvertirBorradorRequest
} from '@/types/cartaPorteLifecycle';
import { UUIDService } from '@/services/uuid/UUIDService';

export class CartaPorteLifecycleManager {
  
  /**
   * Crear un nuevo borrador
   */
  static async crearBorrador(request: CreateBorradorRequest = {}): Promise<BorradorCartaPorte> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('borradores_carta_porte')
        .insert({
          user_id: user.id,
          nombre_borrador: request.nombre_borrador || `Borrador ${new Date().toLocaleDateString()}`,
          datos_formulario: request.datos_formulario || {
            configuracion: {
              version: '3.1',
              tipoComprobante: 'T',
              emisor: { rfc: '', nombre: '', regimenFiscal: '' },
              receptor: { rfc: '', nombre: '' }
            },
            ubicaciones: [],
            mercancias: [],
            autotransporte: {},
            figuras: []
          },
          version_formulario: request.version_formulario || '3.1'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creando borrador:', error);
        throw new Error(`Error creando borrador: ${error.message}`);
      }

      console.log('Borrador creado exitosamente:', data.id);
      return data;
    } catch (error) {
      console.error('Error en crearBorrador:', error);
      throw error;
    }
  }

  /**
   * Guardar cambios en un borrador existente
   */
  static async guardarBorrador(
    borradorId: string, 
    request: UpdateBorradorRequest
  ): Promise<BorradorCartaPorte> {
    try {
      const { data, error } = await supabase
        .from('borradores_carta_porte')
        .update({
          ...request,
          // ultima_edicion se actualiza automáticamente por el trigger
        })
        .eq('id', borradorId)
        .select()
        .single();

      if (error) {
        console.error('Error guardando borrador:', error);
        throw new Error(`Error guardando borrador: ${error.message}`);
      }

      console.log('Borrador guardado exitosamente:', borradorId);
      return data;
    } catch (error) {
      console.error('Error en guardarBorrador:', error);
      throw error;
    }
  }

  /**
   * Cargar un borrador específico
   */
  static async cargarBorrador(borradorId: string): Promise<BorradorCartaPorte | null> {
    try {
      const { data, error } = await supabase
        .from('borradores_carta_porte')
        .select('*')
        .eq('id', borradorId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error cargando borrador:', error);
        throw new Error(`Error cargando borrador: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error en cargarBorrador:', error);
      throw error;
    }
  }

  /**
   * Listar borradores del usuario
   */
  static async listarBorradores(): Promise<BorradorCartaPorte[]> {
    try {
      const { data, error } = await supabase
        .from('borradores_carta_porte')
        .select('*')
        .order('ultima_edicion', { ascending: false });

      if (error) {
        console.error('Error listando borradores:', error);
        throw new Error(`Error listando borradores: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error en listarBorradores:', error);
      throw error;
    }
  }

  /**
   * Eliminar un borrador
   */
  static async eliminarBorrador(borradorId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('borradores_carta_porte')
        .delete()
        .eq('id', borradorId);

      if (error) {
        console.error('Error eliminando borrador:', error);
        throw new Error(`Error eliminando borrador: ${error.message}`);
      }

      console.log('Borrador eliminado exitosamente:', borradorId);
    } catch (error) {
      console.error('Error en eliminarBorrador:', error);
      throw error;
    }
  }

  /**
   * Convertir borrador a carta porte final
   */
  static async convertirBorradorACartaPorte(
    request: ConvertirBorradorRequest
  ): Promise<CartaPorteCompleta> {
    try {
      // 1. Cargar el borrador
      const borrador = await this.cargarBorrador(request.borradorId);
      if (!borrador) {
        throw new Error('Borrador no encontrado');
      }

      // 2. Validar datos si se solicita
      if (request.validarDatos) {
        const validacion = await this.validarDatosParaConversion(borrador.datos_formulario);
        if (!validacion.valido) {
          throw new Error(`Datos inválidos: ${validacion.errores.join(', ')}`);
        }
      }

      // 3. Generar IdCCP único
      const idCCP = await this.generarIdCCPUnico();

      // 4. Extraer datos principales del formulario
      const datosFormulario = borrador.datos_formulario;
      const configuracion = datosFormulario.configuracion || {};
      const emisor = configuracion.emisor || {};
      const receptor = configuracion.receptor || {};

      // 5. Crear la carta porte
      const { data, error } = await supabase
        .from('cartas_porte')
        .insert({
          id_ccp: idCCP,
          nombre_documento: request.nombre_documento || borrador.nombre_borrador,
          borrador_origen_id: request.borradorId,
          status: 'active' as const,
          version_documento: 'v1.0',
          datos_formulario: datosFormulario,
          
          // Campos sincronizados para búsqueda
          rfc_emisor: emisor.rfc || '',
          nombre_emisor: emisor.nombre || '',
          rfc_receptor: receptor.rfc || '',
          nombre_receptor: receptor.nombre || '',
          tipo_cfdi: datosFormulario.tipoCfdi || 'Traslado',
          transporte_internacional: datosFormulario.transporteInternacional || false,
          registro_istmo: datosFormulario.registroIstmo || false,
          version_carta_porte: '3.1'
        })
        .select()
        .single();

      if (error) {
        console.error('Error convirtiendo borrador:', error);
        throw new Error(`Error convirtiendo borrador: ${error.message}`);
      }

      console.log('Borrador convertido exitosamente:', data.id, 'IdCCP:', idCCP);
      return data as CartaPorteCompleta;
    } catch (error) {
      console.error('Error en convertirBorradorACartaPorte:', error);
      throw error;
    }
  }

  /**
   * Generar IdCCP único usando la función de la BD
   */
  static async generarIdCCPUnico(): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('generar_id_ccp_unico');
      
      if (error) {
        console.error('Error generando IdCCP:', error);
        // Fallback a generación local
        return UUIDService.generateValidIdCCP();
      }
      
      return data;
    } catch (error) {
      console.error('Error en generarIdCCPUnico:', error);
      // Fallback a generación local
      return UUIDService.generateValidIdCCP();
    }
  }

  /**
   * Validar que un IdCCP sea único
   */
  static async validarIdCCPUnico(idCCP: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('cartas_porte')
        .select('id')
        .eq('id_ccp', idCCP)
        .limit(1);

      if (error) {
        console.error('Error validando IdCCP único:', error);
        return false;
      }

      return data.length === 0;
    } catch (error) {
      console.error('Error en validarIdCCPUnico:', error);
      return false;
    }
  }

  /**
   * Validar datos del formulario para conversión
   */
  static async validarDatosParaConversion(datosFormulario: any): Promise<{
    valido: boolean;
    errores: string[];
  }> {
    const errores: string[] = [];

    try {
      // Validaciones básicas requeridas
      const configuracion = datosFormulario.configuracion || {};
      const emisor = configuracion.emisor || {};
      const receptor = configuracion.receptor || {};

      if (!emisor.rfc) {
        errores.push('RFC del emisor es requerido');
      }

      if (!emisor.nombre) {
        errores.push('Nombre del emisor es requerido');
      }

      if (!receptor.rfc) {
        errores.push('RFC del receptor es requerido');
      }

      if (!receptor.nombre) {
        errores.push('Nombre del receptor es requerido');
      }

      const ubicaciones = datosFormulario.ubicaciones || [];
      if (ubicaciones.length < 2) {
        errores.push('Se requieren al menos 2 ubicaciones (origen y destino)');
      }

      const mercancias = datosFormulario.mercancias || [];
      if (mercancias.length === 0) {
        errores.push('Se requiere al menos una mercancía');
      }

      const figuras = datosFormulario.figuras || [];
      if (figuras.length === 0) {
        errores.push('Se requiere al menos una figura de transporte');
      }

      return {
        valido: errores.length === 0,
        errores
      };
    } catch (error) {
      console.error('Error validando datos:', error);
      return {
        valido: false,
        errores: ['Error interno en validación']
      };
    }
  }

  /**
   * Listar cartas porte del usuario
   */
  static async listarCartasPorte(): Promise<CartaPorteCompleta[]> {
    try {
      const { data, error } = await supabase
        .from('cartas_porte')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error listando cartas porte:', error);
        throw new Error(`Error listando cartas porte: ${error.message}`);
      }

      return (data || []) as CartaPorteCompleta[];
    } catch (error) {
      console.error('Error en listarCartasPorte:', error);
      throw error;
    }
  }

  /**
   * Obtener carta porte por ID
   */
  static async obtenerCartaPorte(cartaPorteId: string): Promise<CartaPorteCompleta | null> {
    try {
      const { data, error } = await supabase
        .from('cartas_porte')
        .select(`
          *,
          documentos:carta_porte_documentos(*)
        `)
        .eq('id', cartaPorteId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error obteniendo carta porte:', error);
        throw new Error(`Error obteniendo carta porte: ${error.message}`);
      }

      return data as CartaPorteCompleta;
    } catch (error) {
      console.error('Error en obtenerCartaPorte:', error);
      throw error;
    }
  }
}
