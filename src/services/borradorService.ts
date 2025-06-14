
import { supabase } from '@/integrations/supabase/client';

export interface BorradorCartaPorte {
  id?: string;
  userId: string;
  datosFormulario: any;
  ultimaModificacion: string;
  nombre?: string;
}

export class BorradorService {
  private static STORAGE_KEY = 'carta_porte_borrador';
  private static AUTO_SAVE_INTERVAL = 30000; // 30 segundos
  private static autoSaveTimer: NodeJS.Timeout | null = null;

  // Guardar borrador automáticamente
  static async guardarBorradorAutomatico(datos: any): Promise<void> {
    try {
      const borrador: BorradorCartaPorte = {
        userId: 'current_user', // Se reemplazará con auth.uid()
        datosFormulario: datos,
        ultimaModificacion: new Date().toISOString(),
        nombre: `Borrador ${new Date().toLocaleString()}`
      };

      // Guardar en localStorage primero para respuesta inmediata
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(borrador));

      // Intentar guardar en base de datos
      const { error } = await supabase
        .from('cartas_porte')
        .upsert({
          status: 'borrador',
          datos_formulario: datos,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error guardando borrador en BD:', error);
      }
    } catch (error) {
      console.error('Error en guardarBorradorAutomatico:', error);
    }
  }

  // Iniciar guardado automático
  static iniciarGuardadoAutomatico(onSave: (datos: any) => void, getDatos: () => any): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(() => {
      const datos = getDatos();
      if (datos && Object.keys(datos).length > 0) {
        this.guardarBorradorAutomatico(datos);
        onSave(datos);
      }
    }, this.AUTO_SAVE_INTERVAL);
  }

  // Detener guardado automático
  static detenerGuardadoAutomatico(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  // Cargar último borrador
  static cargarUltimoBorrador(): BorradorCartaPorte | null {
    try {
      const borradorLocal = localStorage.getItem(this.STORAGE_KEY);
      if (borradorLocal) {
        return JSON.parse(borradorLocal);
      }
      return null;
    } catch (error) {
      console.error('Error cargando borrador:', error);
      return null;
    }
  }

  // Limpiar borrador
  static limpiarBorrador(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.detenerGuardadoAutomatico();
  }

  // Obtener borradores de la base de datos
  static async obtenerBorradores(): Promise<BorradorCartaPorte[]> {
    try {
      const { data, error } = await supabase
        .from('cartas_porte')
        .select('id, datos_formulario, updated_at, folio')
        .eq('status', 'borrador')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error obteniendo borradores:', error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        userId: 'current_user',
        datosFormulario: item.datos_formulario || {},
        ultimaModificacion: item.updated_at,
        nombre: item.folio || `Borrador ${new Date(item.updated_at).toLocaleString()}`
      }));
    } catch (error) {
      console.error('Error en obtenerBorradores:', error);
      return [];
    }
  }

  // Eliminar borrador
  static async eliminarBorrador(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cartas_porte')
        .delete()
        .eq('id', id)
        .eq('status', 'borrador');

      if (error) {
        console.error('Error eliminando borrador:', error);
      }
    } catch (error) {
      console.error('Error en eliminarBorrador:', error);
    }
  }
}
