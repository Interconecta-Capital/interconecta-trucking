
import { supabase } from '@/integrations/supabase/client';
import { CartaPorteData } from '@/types/cartaPorte';
import { toast } from 'sonner';

interface BorradorData {
  datosFormulario: CartaPorteData;
  ultimaModificacion: string;
  id?: string;
}

export class BorradorServiceCorregido {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isAutoSaving = false;

  static guardarEnLocalStorage(datos: CartaPorteData): void {
    try {
      const borrador = {
        datosFormulario: datos,
        ultimaModificacion: new Date().toISOString()
      };
      localStorage.setItem('carta_porte_borrador', JSON.stringify(borrador));
      console.log('✅ Borrador guardado en localStorage');
    } catch (error) {
      console.error('❌ Error guardando en localStorage:', error);
    }
  }

  static cargarUltimoBorrador(): BorradorData | null {
    try {
      const borradorStr = localStorage.getItem('carta_porte_borrador');
      if (borradorStr) {
        const borrador = JSON.parse(borradorStr);
        console.log('✅ Borrador cargado desde localStorage');
        return borrador;
      }
    } catch (error) {
      console.error('❌ Error cargando borrador desde localStorage:', error);
    }
    return null;
  }

  static async guardarBorradorSupabase(datos: CartaPorteData, cartaPorteId?: string): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      console.log('🔄 Guardando borrador en Supabase...', { cartaPorteId, hasData: !!datos });

      const borradorData = {
        datos_formulario: datos as any,
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
        console.log('🔄 Actualizando borrador existente:', cartaPorteId);
        const { data, error } = await supabase
          .from('cartas_porte')
          .update(borradorData)
          .eq('id', cartaPorteId)
          .eq('usuario_id', user.id)
          .select('id')
          .single();

        if (error) {
          console.error('❌ Error actualizando borrador:', error);
          throw error;
        }
        
        console.log('✅ Borrador actualizado exitosamente');
        return data.id;
      } else {
        console.log('🔄 Creando nuevo borrador...');
        const { data, error } = await supabase
          .from('cartas_porte')
          .insert({
            ...borradorData,
            usuario_id: user.id,
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (error) {
          console.error('❌ Error creando borrador:', error);
          throw error;
        }
        
        console.log('✅ Nuevo borrador creado:', data.id);
        return data.id;
      }
    } catch (error) {
      console.error('❌ Error en guardarBorradorSupabase:', error);
      // Fallback a localStorage solo en caso de error de red
      this.guardarEnLocalStorage(datos);
      throw error;
    }
  }

  static async cargarBorradorSupabase(cartaPorteId: string): Promise<CartaPorteData | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      console.log('🔄 Cargando borrador desde Supabase:', cartaPorteId);

      const { data, error } = await supabase
        .from('cartas_porte')
        .select('datos_formulario')
        .eq('id', cartaPorteId)
        .eq('usuario_id', user.id)
        .eq('status', 'borrador')
        .single();

      if (error) {
        console.error('❌ Error cargando borrador:', error);
        throw error;
      }
      
      console.log('✅ Borrador cargado desde Supabase');
      return data.datos_formulario as CartaPorteData;
    } catch (error) {
      console.error('❌ Error en cargarBorradorSupabase:', error);
      return null;
    }
  }

  static async listarBorradores(): Promise<Array<{ id: string; nombre: string; ultimaModificacion: string; datosFormulario: CartaPorteData }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      console.log('🔄 Listando borradores...');

      const { data, error } = await supabase
        .from('cartas_porte')
        .select('id, datos_formulario, updated_at, nombre_emisor, nombre_receptor')
        .eq('usuario_id', user.id)
        .eq('status', 'borrador')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Error listando borradores:', error);
        throw error;
      }

      console.log('✅ Borradores listados:', data?.length || 0);

      return data.map(item => ({
        id: item.id,
        nombre: `${item.nombre_emisor || 'Sin emisor'} → ${item.nombre_receptor || 'Sin receptor'}`,
        ultimaModificacion: item.updated_at,
        datosFormulario: item.datos_formulario as CartaPorteData
      }));
    } catch (error) {
      console.error('❌ Error en listarBorradores:', error);
      return [];
    }
  }

  static async eliminarBorrador(cartaPorteId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      console.log('🔄 Eliminando borrador:', cartaPorteId);

      const { error } = await supabase
        .from('cartas_porte')
        .delete()
        .eq('id', cartaPorteId)
        .eq('usuario_id', user.id)
        .eq('status', 'borrador');

      if (error) {
        console.error('❌ Error eliminando borrador:', error);
        throw error;
      }
      
      console.log('✅ Borrador eliminado exitosamente');
    } catch (error) {
      console.error('❌ Error en eliminarBorrador:', error);
      throw error;
    }
  }

  static async limpiarBorrador(cartaPorteId?: string): Promise<void> {
    try {
      localStorage.removeItem('carta_porte_borrador');
      console.log('✅ Borrador eliminado de localStorage');
      
      if (cartaPorteId) {
        await this.eliminarBorrador(cartaPorteId);
      }
    } catch (error) {
      console.error('❌ Error limpiando borrador:', error);
    }
  }

  static async guardarBorradorAutomatico(datos: CartaPorteData, cartaPorteId?: string): Promise<string | null> {
    try {
      this.guardarEnLocalStorage(datos);
      const id = await this.guardarBorradorSupabase(datos, cartaPorteId);
      console.log('✅ Borrador guardado automáticamente:', id);
      return id;
    } catch (error) {
      console.error('❌ Error en guardado automático:', error);
      toast.error('Error guardando borrador automáticamente');
      return null;
    }
  }

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
          console.error('❌ Error en guardado automático:', error);
        } finally {
          this.isAutoSaving = false;
        }
      }
    }, intervalMs);
  }

  static detenerGuardadoAutomatico(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('✅ Guardado automático detenido');
    }
  }
}
