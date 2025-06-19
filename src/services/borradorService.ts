
import { supabase } from '@/integrations/supabase/client';
import { CartaPorteData } from '@/types/cartaPorte';

export interface BorradorCartaPorte {
  id: string;
  user_id: string;
  datos_formulario: any;
  status: string;
  nombre_borrador?: string;
  descripcion?: string;
  created_at: string;
  updated_at: string;
}

export class BorradorService {
  static async guardarBorrador(
    data: CartaPorteData,
    currentCartaPorteId?: string,
    nombreBorrador?: string,
    descripcion?: string
  ): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      if (currentCartaPorteId) {
        // Update existing
        const { data: updated, error } = await supabase
          .from('cartas_porte')
          .update({
            datos_formulario: data as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentCartaPorteId)
          .eq('usuario_id', user.id)
          .select('id')
          .single();

        if (error) throw error;
        return updated?.id || currentCartaPorteId;
      } else {
        // Create new
        const { data: created, error } = await supabase
          .from('cartas_porte')
          .insert({
            usuario_id: user.id,
            datos_formulario: data as any,
            status: 'borrador',
            rfc_emisor: data.rfcEmisor || '',
            rfc_receptor: data.rfcReceptor || '',
            nombre_emisor: nombreBorrador || `Borrador ${new Date().toLocaleDateString()}`,
            nombre_receptor: descripcion || 'Borrador guardado automáticamente'
          })
          .select('id')
          .single();

        if (error) throw error;
        return created?.id || null;
      }
    } catch (error) {
      console.error('Error guardando borrador:', error);
      return null;
    }
  }

  static async cargarBorrador(borradorId: string): Promise<{ success: boolean; data?: CartaPorteData; error?: string }> {
    try {
      const { data: borrador, error } = await supabase
        .from('cartas_porte')
        .select('datos_formulario')
        .eq('id', borradorId)
        .eq('status', 'borrador')
        .single();

      if (error) throw error;
      if (!borrador) throw new Error('Borrador no encontrado');

      // Safely parse the datos_formulario with type assertion
      let cartaPorteData: CartaPorteData;
      
      if (typeof borrador.datos_formulario === 'string') {
        cartaPorteData = JSON.parse(borrador.datos_formulario);
      } else if (borrador.datos_formulario && typeof borrador.datos_formulario === 'object') {
        cartaPorteData = {
          version: '3.1',
          ...borrador.datos_formulario
        } as CartaPorteData;
      } else {
        throw new Error('Formato de datos inválido en el borrador');
      }

      // Ensure required fields are present
      if (!cartaPorteData.version) {
        cartaPorteData.version = '3.1';
      }

      return { success: true, data: cartaPorteData };
    } catch (error) {
      console.error('Error cargando borrador:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  static async listarBorradores(): Promise<{ success: boolean; borradores?: BorradorCartaPorte[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data: borradores, error } = await supabase
        .from('cartas_porte')
        .select('id, usuario_id as user_id, datos_formulario, status, nombre_emisor as nombre_borrador, nombre_receptor as descripcion, created_at, updated_at')
        .eq('usuario_id', user.id)
        .eq('status', 'borrador')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return { success: true, borradores: borradores || [] };
    } catch (error) {
      console.error('Error listando borradores:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  static async eliminarBorrador(borradorId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('cartas_porte')
        .delete()
        .eq('id', borradorId)
        .eq('status', 'borrador');

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error eliminando borrador:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  static async actualizarBorrador(
    borradorId: string,
    data: CartaPorteData,
    nombreBorrador?: string,
    descripcion?: string
  ): Promise<{ success: boolean; borrador?: BorradorCartaPorte; error?: string }> {
    try {
      const updateData: any = {
        datos_formulario: data as any,
        updated_at: new Date().toISOString()
      };

      if (nombreBorrador) updateData.nombre_emisor = nombreBorrador;
      if (descripcion) updateData.nombre_receptor = descripcion;

      const { data: borrador, error } = await supabase
        .from('cartas_porte')
        .update(updateData)
        .eq('id', borradorId)
        .eq('status', 'borrador')
        .select('id, usuario_id as user_id, datos_formulario, status, nombre_emisor as nombre_borrador, nombre_receptor as descripcion, created_at, updated_at')
        .single();

      if (error) throw error;

      return { success: true, borrador };
    } catch (error) {
      console.error('Error actualizando borrador:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  // Local storage methods for fallback
  static cargarUltimoBorrador(): { datosFormulario: CartaPorteData; cartaPorteId?: string } | null {
    try {
      const saved = localStorage.getItem('carta_porte_borrador');
      if (saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch {
      return null;
    }
  }

  static guardarBorradorAutomatico(data: CartaPorteData, cartaPorteId?: string): void {
    try {
      localStorage.setItem('carta_porte_borrador', JSON.stringify({
        datosFormulario: data,
        cartaPorteId,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
    }
  }

  static limpiarBorrador(cartaPorteId?: string): void {
    try {
      if (cartaPorteId) {
        // If we have an ID, we could mark it as cleaned in the database
        // For now, just clear localStorage
      }
      localStorage.removeItem('carta_porte_borrador');
    } catch (error) {
      console.error('Error limpiando borrador:', error);
    }
  }
}
