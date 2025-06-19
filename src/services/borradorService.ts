
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
    nombreBorrador?: string,
    descripcion?: string
  ): Promise<{ success: boolean; borrador?: BorradorCartaPorte; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data: borrador, error } = await supabase
        .from('cartas_porte')
        .insert({
          user_id: user.id,
          datos_formulario: data,
          status: 'borrador',
          nombre_borrador: nombreBorrador || `Borrador ${new Date().toLocaleDateString()}`,
          descripcion: descripcion || 'Borrador guardado automáticamente'
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, borrador };
    } catch (error) {
      console.error('Error guardando borrador:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
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
        .select('*')
        .eq('user_id', user.id)
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
        datos_formulario: data,
        updated_at: new Date().toISOString()
      };

      if (nombreBorrador) updateData.nombre_borrador = nombreBorrador;
      if (descripcion) updateData.descripcion = descripcion;

      const { data: borrador, error } = await supabase
        .from('cartas_porte')
        .update(updateData)
        .eq('id', borradorId)
        .eq('status', 'borrador')
        .select()
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
}
