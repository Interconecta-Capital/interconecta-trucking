
import { supabase } from '@/integrations/supabase/client';
import { CartaPorteData } from '@/types/cartaPorte';

export interface BorradorData {
  id: string;
  datosFormulario: CartaPorteData;
  ultimaModificacion: string;
  version: string;
}

class BorradorServiceClass {
  private autoSaveInterval: NodeJS.Timeout | null = null;

  async guardarBorrador(data: CartaPorteData, cartaPorteId?: string): Promise<string | null> {
    try {
      console.log('[BorradorService] Guardando borrador...', { cartaPorteId, hasData: !!data });

      const usuario = await supabase.auth.getUser();
      if (!usuario.data.user) {
        throw new Error('Usuario no autenticado');
      }

      const borradorData = {
        id: cartaPorteId || crypto.randomUUID(),
        usuario_id: usuario.data.user.id,
        datos_formulario: data,
        estado: 'borrador',
        version_carta_porte: data.cartaPorteVersion || '3.1',
        rfc_emisor: data.rfcEmisor,
        rfc_receptor: data.rfcReceptor,
        nombre_emisor: data.nombreEmisor,
        nombre_receptor: data.nombreReceptor,
        updated_at: new Date().toISOString()
      };

      // Si ya existe el ID, hacer UPDATE, si no, INSERT
      if (cartaPorteId) {
        const { data: result, error } = await supabase
          .from('cartas_porte')
          .update(borradorData)
          .eq('id', cartaPorteId)
          .eq('usuario_id', usuario.data.user.id)
          .select('id')
          .single();

        if (error) {
          console.error('Error actualizando borrador:', error);
          // Si no existe, crear nuevo
          if (error.code === 'PGRST116') {
            const { data: newResult, error: insertError } = await supabase
              .from('cartas_porte')
              .insert(borradorData)
              .select('id')
              .single();

            if (insertError) {
              throw insertError;
            }
            return newResult?.id || null;
          }
          throw error;
        }
        return result?.id || null;
      } else {
        const { data: result, error } = await supabase
          .from('cartas_porte')
          .insert(borradorData)
          .select('id')
          .single();

        if (error) {
          throw error;
        }
        return result?.id || null;
      }
    } catch (error) {
      console.error('[BorradorService] Error guardando borrador:', error);
      
      // Fallback a localStorage
      try {
        const fallbackData = {
          id: cartaPorteId || crypto.randomUUID(),
          datosFormulario: data,
          ultimaModificacion: new Date().toISOString(),
          version: '3.1'
        };
        localStorage.setItem(`carta-porte-borrador-${fallbackData.id}`, JSON.stringify(fallbackData));
        console.log('✅ Borrador guardado en localStorage como fallback');
        return fallbackData.id;
      } catch (storageError) {
        console.error('Error guardando en localStorage:', storageError);
        throw error;
      }
    }
  }

  async cargarBorrador(cartaPorteId: string): Promise<BorradorData | null> {
    try {
      console.log('[BorradorService] Cargando borrador:', cartaPorteId);

      const usuario = await supabase.auth.getUser();
      if (!usuario.data.user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('cartas_porte')
        .select('*')
        .eq('id', cartaPorteId)
        .eq('usuario_id', usuario.data.user.id)
        .single();

      if (error) {
        console.error('Error cargando de Supabase:', error);
        
        // Fallback a localStorage
        const fallbackData = localStorage.getItem(`carta-porte-borrador-${cartaPorteId}`);
        if (fallbackData) {
          const parsed = JSON.parse(fallbackData);
          console.log('✅ Borrador cargado desde localStorage');
          return parsed;
        }
        
        return null;
      }

      return {
        id: data.id,
        datosFormulario: data.datos_formulario as CartaPorteData,
        ultimaModificacion: data.updated_at,
        version: data.version_carta_porte || '3.1'
      };
    } catch (error) {
      console.error('[BorradorService] Error cargando borrador:', error);
      return null;
    }
  }

  async limpiarBorrador(cartaPorteId: string): Promise<void> {
    try {
      const usuario = await supabase.auth.getUser();
      if (!usuario.data.user) {
        throw new Error('Usuario no autenticado');
      }

      const { error } = await supabase
        .from('cartas_porte')
        .delete()
        .eq('id', cartaPorteId)
        .eq('usuario_id', usuario.data.user.id);

      if (error) {
        console.error('Error eliminando de Supabase:', error);
      }

      // También limpiar localStorage
      localStorage.removeItem(`carta-porte-borrador-${cartaPorteId}`);
      
      console.log('✅ Borrador eliminado');
    } catch (error) {
      console.error('[BorradorService] Error limpiando borrador:', error);
      throw error;
    }
  }

  iniciarGuardadoAutomatico(
    onSaved: (cartaPorteId: string | null) => void,
    getData: () => CartaPorteData,
    getCartaPorteId: () => string | undefined,
    intervalMs: number = 30000
  ): NodeJS.Timeout {
    console.log('[BorradorService] Iniciando auto-guardado cada', intervalMs, 'ms');
    
    this.autoSaveInterval = setInterval(async () => {
      try {
        const data = getData();
        const cartaPorteId = getCartaPorteId();
        
        if (data && cartaPorteId) {
          const savedId = await this.guardarBorrador(data, cartaPorteId);
          onSaved(savedId);
          console.log('🔄 Auto-guardado completado:', savedId);
        }
      } catch (error) {
        console.error('❌ Error en auto-guardado:', error);
      }
    }, intervalMs);

    return this.autoSaveInterval;
  }

  detenerGuardadoAutomatico(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('⏹️ Auto-guardado detenido');
    }
  }
}

export const BorradorService = new BorradorServiceClass();
