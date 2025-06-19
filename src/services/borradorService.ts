
import { supabase } from '@/integrations/supabase/client';

interface BorradorData {
  datosFormulario: any;
  ultimaModificacion: string;
  cartaPorteId?: string;
}

export class BorradorService {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isAutoSaving = false;

  // Guardar borrador en Supabase y localStorage como respaldo
  static async guardarBorrador(datos: any, cartaPorteId?: string): Promise<string | null> {
    try {
      const now = new Date().toISOString();
      
      // Si tenemos un ID, actualizar; si no, crear nuevo
      if (cartaPorteId) {
        const { error } = await supabase
          .from('cartas_porte')
          .update({
            datos_formulario: datos,
            status: 'borrador',
            updated_at: now,
            // Extraer campos principales para búsqueda
            rfc_emisor: datos.rfcEmisor || datos.configuracion?.emisor?.rfc || '',
            nombre_emisor: datos.nombreEmisor || datos.configuracion?.emisor?.nombre || '',
            rfc_receptor: datos.rfcReceptor || datos.configuracion?.receptor?.rfc || '',
            nombre_receptor: datos.nombreReceptor || datos.configuracion?.receptor?.nombre || '',
            transporte_internacional: datos.transporteInternacional || false,
            registro_istmo: datos.registroIstmo || false,
            tipo_cfdi: datos.tipoCfdi || 'Traslado'
          })
          .eq('id', cartaPorteId);

        if (error) throw error;
      } else {
        // Crear nueva carta porte
        const { data: newCarta, error } = await supabase
          .from('cartas_porte')
          .insert({
            datos_formulario: datos,
            status: 'borrador',
            created_at: now,
            updated_at: now,
            rfc_emisor: datos.rfcEmisor || datos.configuracion?.emisor?.rfc || '',
            nombre_emisor: datos.nombreEmisor || datos.configuracion?.emisor?.nombre || '',
            rfc_receptor: datos.rfcReceptor || datos.configuracion?.receptor?.rfc || '',
            nombre_receptor: datos.nombreReceptor || datos.configuracion?.receptor?.nombre || '',
            transporte_internacional: datos.transporteInternacional || false,
            registro_istmo: datos.registroIstmo || false,
            tipo_cfdi: datos.tipoCfdi || 'Traslado'
          })
          .select('id')
          .single();

        if (error) throw error;
        cartaPorteId = newCarta.id;
      }

      // Guardar también en localStorage como respaldo
      this.guardarEnLocalStorage(datos, cartaPorteId);
      
      console.log('Borrador guardado exitosamente en Supabase:', cartaPorteId);
      return cartaPorteId;
    } catch (error) {
      console.error('Error guardando en Supabase, usando localStorage:', error);
      // Si falla Supabase, al menos guardamos en localStorage
      this.guardarEnLocalStorage(datos, cartaPorteId);
      return cartaPorteId || null;
    }
  }

  // Cargar borrador desde Supabase o localStorage
  static async cargarBorrador(cartaPorteId: string): Promise<BorradorData | null> {
    try {
      const { data, error } = await supabase
        .from('cartas_porte')
        .select('datos_formulario, updated_at')
        .eq('id', cartaPorteId)
        .single();

      if (error) throw error;

      if (data) {
        return {
          datosFormulario: data.datos_formulario,
          ultimaModificacion: data.updated_at,
          cartaPorteId
        };
      }
    } catch (error) {
      console.error('Error cargando desde Supabase, intentando localStorage:', error);
    }

    // Fallback a localStorage
    return this.cargarUltimoBorrador();
  }

  // Cargar último borrador desde localStorage (respaldo)
  static cargarUltimoBorrador(): BorradorData | null {
    try {
      const borradorStr = localStorage.getItem('carta_porte_borrador');
      if (borradorStr) {
        return JSON.parse(borradorStr);
      }
    } catch (error) {
      console.error('Error cargando borrador desde localStorage:', error);
    }
    return null;
  }

  // Guardar en localStorage como respaldo
  private static guardarEnLocalStorage(datos: any, cartaPorteId?: string): void {
    try {
      const borrador = {
        datosFormulario: datos,
        ultimaModificacion: new Date().toISOString(),
        cartaPorteId
      };
      localStorage.setItem('carta_porte_borrador', JSON.stringify(borrador));
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
    }
  }

  // Guardado automático mejorado
  static async guardarBorradorAutomatico(datos: any, cartaPorteId?: string): Promise<string | null> {
    if (this.isAutoSaving) return cartaPorteId || null;
    
    this.isAutoSaving = true;
    try {
      const nuevoId = await this.guardarBorrador(datos, cartaPorteId);
      console.log('Auto-guardado completado');
      return nuevoId;
    } catch (error) {
      console.error('Error en guardado automático:', error);
      return cartaPorteId || null;
    } finally {
      this.isAutoSaving = false;
    }
  }

  // Limpiar borrador tanto de Supabase como localStorage
  static async limpiarBorrador(cartaPorteId?: string): Promise<void> {
    try {
      if (cartaPorteId) {
        const { error } = await supabase
          .from('cartas_porte')
          .delete()
          .eq('id', cartaPorteId);
        
        if (error) {
          console.error('Error eliminando de Supabase:', error);
        }
      }
    } catch (error) {
      console.error('Error limpiando borrador de Supabase:', error);
    }

    // Limpiar localStorage también
    try {
      localStorage.removeItem('carta_porte_borrador');
      console.log('Borrador eliminado');
    } catch (error) {
      console.error('Error limpiando localStorage:', error);
    }
  }

  // Iniciar guardado automático con mejor control
  static iniciarGuardadoAutomatico(
    onSave: (cartaPorteId?: string) => void, 
    getDatos: () => any, 
    getCartaPorteId: () => string | undefined,
    intervalMs: number = 30000
  ): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(async () => {
      if (!this.isAutoSaving) {
        try {
          const datos = getDatos();
          const cartaPorteId = getCartaPorteId();
          
          // Solo auto-guardar si hay datos significativos
          if (this.tieneDatosSignificativos(datos)) {
            const nuevoId = await this.guardarBorradorAutomatico(datos, cartaPorteId);
            onSave(nuevoId || cartaPorteId);
          }
        } catch (error) {
          console.error('Error en guardado automático:', error);
        }
      }
    }, intervalMs);
  }

  // Verificar si hay datos significativos para guardar
  private static tieneDatosSignificativos(datos: any): boolean {
    return !!(
      datos.rfcEmisor || 
      datos.rfcReceptor || 
      (datos.ubicaciones && datos.ubicaciones.length > 0) ||
      (datos.mercancias && datos.mercancias.length > 0) ||
      datos.autotransporte?.placa_vm ||
      (datos.figuras && datos.figuras.length > 0)
    );
  }

  // Detener guardado automático
  static detenerGuardadoAutomatico(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Obtener lista de borradores del usuario
  static async obtenerBorradoresUsuario(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('cartas_porte')
        .select('id, rfc_emisor, nombre_emisor, rfc_receptor, nombre_receptor, created_at, updated_at')
        .eq('status', 'borrador')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo borradores:', error);
      return [];
    }
  }
}
