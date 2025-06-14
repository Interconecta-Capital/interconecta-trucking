
import { supabase } from '@/integrations/supabase/client';
import { CartaPorteData } from '@/types/cartaPorte';

interface BorradorData {
  datosFormulario: CartaPorteData;
  ultimaModificacion: string;
  id?: string;
}

export class BorradorServiceExtendido {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isAutoSaving = false;

  // Guardar borrador en localStorage como respaldo
  static guardarEnLocalStorage(datos: CartaPorteData): void {
    try {
      const borrador = {
        datosFormulario: datos,
        ultimaModificacion: new Date().toISOString()
      };
      localStorage.setItem('carta_porte_borrador', JSON.stringify(borrador));
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
    }
  }

  // Cargar último borrador desde localStorage
  static cargarUltimoBorrador(): BorradorData | null {
    try {
      const borradorStr = localStorage.getItem('carta_porte_borrador');
      if (borradorStr) {
        return JSON.parse(borradorStr);
      }
    } catch (error) {
      console.error('Error cargando borrador:', error);
    }
    return null;
  }

  // Guardar borrador en Supabase
  static async guardarBorradorSupabase(datos: CartaPorteData, cartaPorteId?: string): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const borradorData = {
        datos_formulario: datos,
        rfc_emisor: datos.rfcEmisor || 'TEMP',
        nombre_emisor: datos.nombreEmisor || '',
        rfc_receptor: datos.rfcReceptor || 'TEMP',
        nombre_receptor: datos.nombreReceptor || '',
        tipo_cfdi: datos.tipoCfdi || 'Traslado',
        transporte_internacional: Boolean(datos.transporteInternacional),
        registro_istmo: Boolean(datos.registroIstmo),
        status: 'borrador',
        updated_at: new Date().toISOString()
      };

      if (cartaPorteId) {
        // Actualizar borrador existente
        const { data, error } = await supabase
          .from('cartas_porte')
          .update(borradorData)
          .eq('id', cartaPorteId)
          .eq('usuario_id', user.id)
          .select('id')
          .single();

        if (error) throw error;
        return data.id;
      } else {
        // Crear nuevo borrador
        const { data, error } = await supabase
          .from('cartas_porte')
          .insert({
            ...borradorData,
            usuario_id: user.id,
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (error) throw error;
        return data.id;
      }
    } catch (error) {
      console.error('Error guardando borrador en Supabase:', error);
      // Fallback a localStorage
      this.guardarEnLocalStorage(datos);
      throw error;
    }
  }

  // Cargar borrador desde Supabase
  static async cargarBorradorSupabase(cartaPorteId: string): Promise<CartaPorteData | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('cartas_porte')
        .select('datos_formulario')
        .eq('id', cartaPorteId)
        .eq('usuario_id', user.id)
        .eq('status', 'borrador')
        .single();

      if (error) throw error;
      return data.datos_formulario as CartaPorteData;
    } catch (error) {
      console.error('Error cargando borrador desde Supabase:', error);
      return null;
    }
  }

  // Listar borradores del usuario
  static async listarBorradores(): Promise<Array<{ id: string; nombre: string; ultimaModificacion: string; datosFormulario: CartaPorteData }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('cartas_porte')
        .select('id, datos_formulario, updated_at, nombre_emisor, nombre_receptor')
        .eq('usuario_id', user.id)
        .eq('status', 'borrador')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        nombre: `${item.nombre_emisor || 'Sin emisor'} → ${item.nombre_receptor || 'Sin receptor'}`,
        ultimaModificacion: item.updated_at,
        datosFormulario: item.datos_formulario as CartaPorteData
      }));
    } catch (error) {
      console.error('Error listando borradores:', error);
      return [];
    }
  }

  // Eliminar borrador
  static async eliminarBorrador(cartaPorteId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('cartas_porte')
        .delete()
        .eq('id', cartaPorteId)
        .eq('usuario_id', user.id)
        .eq('status', 'borrador');

      if (error) throw error;
    } catch (error) {
      console.error('Error eliminando borrador:', error);
      throw error;
    }
  }

  // Limpiar borrador (localStorage y Supabase si está especificado)
  static async limpiarBorrador(cartaPorteId?: string): Promise<void> {
    try {
      localStorage.removeItem('carta_porte_borrador');
      
      if (cartaPorteId) {
        await this.eliminarBorrador(cartaPorteId);
      }
      
      console.log('Borrador eliminado');
    } catch (error) {
      console.error('Error limpiando borrador:', error);
    }
  }

  // Guardar borrador automáticamente (híbrido)
  static async guardarBorradorAutomatico(datos: CartaPorteData, cartaPorteId?: string): Promise<string | null> {
    try {
      // Siempre guardar en localStorage como respaldo
      this.guardarEnLocalStorage(datos);
      
      // Intentar guardar en Supabase
      const id = await this.guardarBorradorSupabase(datos, cartaPorteId);
      console.log('Borrador guardado automáticamente:', id);
      return id;
    } catch (error) {
      console.error('Error en guardado automático:', error);
      return null;
    }
  }

  // Iniciar guardado automático mejorado
  static iniciarGuardadoAutomatico(
    onSave: (id?: string) => void, 
    getDatos: () => CartaPorteData,
    getCurrentId: () => string | undefined,
    intervalMs: number = 30000
  ): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(async () => {
      if (!this.isAutoSaving) {
        this.isAutoSaving = true;
        try {
          const datos = getDatos();
          const currentId = getCurrentId();
          const id = await this.guardarBorradorAutomatico(datos, currentId);
          onSave(id || undefined);
        } catch (error) {
          console.error('Error en guardado automático:', error);
        } finally {
          this.isAutoSaving = false;
        }
      }
    }, intervalMs);
  }

  // Detener guardado automático
  static detenerGuardadoAutomatico(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
