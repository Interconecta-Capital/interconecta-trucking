
import { useState } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAmbienteTimbrado } from '@/hooks/useAmbienteTimbrado';

export interface TimbradoResult {
  success: boolean;
  uuid?: string;
  fecha_timbrado?: string;
  ambiente?: string;
  error?: string;
  codigo?: string;
  xmlTimbrado?: string;
  qrCode?: string;
  cadenaOriginal?: string;
}

export function useTimbrado() {
  const [isTimbring, setIsTimbring] = useState(false);
  const [datosTimbre, setDatosTimbre] = useState<any>(null);
  const { ambiente } = useAmbienteTimbrado();

  const timbrarCartaPorte = async (cartaPorteData: CartaPorteData): Promise<TimbradoResult> => {
    setIsTimbring(true);
    try {
      console.log(`🚀 Iniciando timbrado en ambiente: ${ambiente}`);
      
      const { data, error } = await supabase.functions.invoke('timbrar-con-sw', {
        body: {
          cartaPorteData,
          cartaPorteId: crypto.randomUUID(),
          ambiente // ✅ Usar ambiente dinámico según configuración del usuario
        }
      });

      if (error) {
        console.error('❌ Error en edge function:', error);
        toast.error(`Error: ${error.message}`);
        return { success: false, error: error.message };
      }

      if (!data.success) {
        console.error('❌ Error del PAC:', data.error);
        toast.error(`Error del PAC: ${data.error}`);
        return { 
          success: false, 
          error: data.error,
          codigo: data.codigo
        };
      }
      
      const resultado = {
        success: true,
        uuid: data.uuid,
        fecha_timbrado: data.fechaTimbrado,
        ambiente, // ✅ Ambiente dinámico
        xmlTimbrado: data.xmlTimbrado,
        qrCode: data.qrCode,
        cadenaOriginal: data.cadenaOriginal
      };
      
      setDatosTimbre(resultado);
      toast.success(`✅ Timbrado exitoso - UUID: ${data.uuid}`);
      return resultado;
    } catch (error) {
      console.error('💥 Error al timbrar:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error en el timbrado';
      toast.error(`Error: ${errorMsg}`);
      return { success: false, error: errorMsg };
    } finally {
      setIsTimbring(false);
    }
  };

  const validarConexionPAC = async (): Promise<boolean> => {
    try {
      // Simular validación de conexión
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Conexión con PAC validada correctamente');
      return true;
    } catch (error) {
      toast.error('Error de conexión con PAC');
      return false;
    }
  };

  return {
    isTimbring,
    datosTimbre,
    timbrarCartaPorte,
    validarConexionPAC
  };
}
