
import { supabase } from '@/integrations/supabase/client';
import { CartaPorteData } from '@/types/cartaPorte';

interface BorradorMetadata {
  lastModified: string;
  step: number;
  progress: number;
}

export class BorradorService {
  private static readonly STORAGE_KEY = 'carta_porte_borrador';
  private static readonly METADATA_KEY = 'carta_porte_metadata';

  static async guardarBorrador(data: CartaPorteData, step: number = 0): Promise<void> {
    try {
      // Save to localStorage as backup
      const borradorData = {
        ...data,
        version: data.version || '3.1' // Ensure version is set
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(borradorData));
      
      const metadata: BorradorMetadata = {
        lastModified: new Date().toISOString(),
        step,
        progress: this.calculateProgress(data)
      };
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));

      // Save to Supabase if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await this.guardarBorradorRemoto(borradorData, user.id);
      }
    } catch (error) {
      console.error('Error guardando borrador:', error);
      throw error;
    }
  }

  private static async guardarBorradorRemoto(data: CartaPorteData, userId: string): Promise<void> {
    try {
      const borradorData = {
        usuario_id: userId,
        rfc_emisor: data.rfcEmisor || '',
        rfc_receptor: data.rfcReceptor || '',
        nombre_emisor: data.nombreEmisor || '',
        nombre_receptor: data.nombreReceptor || '',
        tipo_cfdi: data.tipoCfdi || 'Traslado',
        transporte_internacional: Boolean(data.transporteInternacional),
        registro_istmo: Boolean(data.registroIstmo),
        status: 'borrador',
        version_carta_porte: data.version || '3.1',
        datos_formulario: JSON.parse(JSON.stringify(data))
      };

      const { error } = await supabase
        .from('cartas_porte')
        .upsert(borradorData, { 
          onConflict: 'usuario_id,status',
          ignoreDuplicates: false 
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error guardando borrador remoto:', error);
      throw error;
    }
  }

  static async cargarBorrador(): Promise<CartaPorteData | null> {
    try {
      // Try to load from Supabase first
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const remoteBorrador = await this.cargarBorradorRemoto(user.id);
        if (remoteBorrador) return remoteBorrador;
      }

      // Fallback to localStorage
      const localData = localStorage.getItem(this.STORAGE_KEY);
      if (localData) {
        const parsedData = JSON.parse(localData);
        return {
          ...parsedData,
          version: parsedData.version || '3.1' // Ensure version is set
        };
      }

      return null;
    } catch (error) {
      console.error('Error cargando borrador:', error);
      return null;
    }
  }

  private static async cargarBorradorRemoto(userId: string): Promise<CartaPorteData | null> {
    try {
      const { data, error } = await supabase
        .from('cartas_porte')
        .select('datos_formulario')
        .eq('usuario_id', userId)
        .eq('status', 'borrador')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data?.datos_formulario) return null;

      const cartaPorteData = data.datos_formulario as unknown as CartaPorteData;
      return {
        ...cartaPorteData,
        version: cartaPorteData.version || '3.1' // Ensure version is set
      };
    } catch (error) {
      console.error('Error cargando borrador remoto:', error);
      return null;
    }
  }

  static async limpiarBorrador(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.METADATA_KEY);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('cartas_porte')
          .delete()
          .eq('usuario_id', user.id)
          .eq('status', 'borrador');
      }
    } catch (error) {
      console.error('Error limpiando borrador:', error);
      throw error;
    }
  }

  static getBorradorMetadata(): BorradorMetadata | null {
    try {
      const metadata = localStorage.getItem(this.METADATA_KEY);
      return metadata ? JSON.parse(metadata) : null;
    } catch (error) {
      console.error('Error obteniendo metadata del borrador:', error);
      return null;
    }
  }

  private static calculateProgress(data: CartaPorteData): number {
    let progress = 0;
    const sections = 5;

    // Basic configuration
    if (data.rfcEmisor && data.rfcReceptor) progress += 20;
    
    // Ubicaciones
    if (data.ubicaciones && data.ubicaciones.length >= 2) progress += 20;
    
    // Mercancías
    if (data.mercancias && data.mercancias.length > 0) progress += 20;
    
    // Autotransporte
    if (data.autotransporte?.placa_vm) progress += 20;
    
    // Figuras
    if (data.figuras && data.figuras.length > 0) progress += 20;

    return progress;
  }
}
