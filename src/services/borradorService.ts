
import { supabase } from '@/integrations/supabase/client';

interface BorradorData {
  datosFormulario: any;
  ultimaModificacion: string;
}

export class BorradorService {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isAutoSaving = false;

  // Guardar borrador en localStorage como respaldo
  static guardarEnLocalStorage(datos: any): void {
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

  // Guardar borrador automáticamente (sin usar Supabase por ahora)
  static async guardarBorradorAutomatico(datos: any): Promise<void> {
    try {
      this.guardarEnLocalStorage(datos);
      console.log('Borrador guardado automáticamente');
    } catch (error) {
      console.error('Error en guardado automático:', error);
    }
  }

  // Limpiar borrador
  static limpiarBorrador(): void {
    try {
      localStorage.removeItem('carta_porte_borrador');
      console.log('Borrador eliminado');
    } catch (error) {
      console.error('Error limpiando borrador:', error);
    }
  }

  // Iniciar guardado automático
  static iniciarGuardadoAutomatico(
    onSave: () => void, 
    getDatos: () => any, 
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
          await this.guardarBorradorAutomatico(datos);
          onSave();
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
