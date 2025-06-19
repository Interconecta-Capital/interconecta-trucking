
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { XMLCartaPorteGenerator, XMLGenerationResult } from '@/services/xml/xmlGenerator';
import { CartaPorteData, UbicacionCompleta } from '@/types/cartaPorte';
import { Ubicacion } from '@/types/ubicaciones';
import { mapUbicacionToCompleta } from '@/hooks/carta-porte/mapUbicacionToCompleta';
import { supabase } from '@/integrations/supabase/client';

export const useXMLGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [xmlGenerado, setXmlGenerado] = useState<string | null>(null);
  const { toast } = useToast();

  const generarXML = async (cartaPorteData: CartaPorteData): Promise<XMLGenerationResult> => {
    setIsGenerating(true);
    try {
      console.log('Iniciando generación de XML para Carta Porte');

      const ubicaciones: UbicacionCompleta[] = (cartaPorteData.ubicaciones || []).map(ub =>
        (ub as any).tipo_ubicacion ? (ub as UbicacionCompleta) : mapUbicacionToCompleta(ub as Ubicacion)
      );

      const data = { ...cartaPorteData, ubicaciones };

      const resultado = await XMLCartaPorteGenerator.generarXML(data);
      
      if (resultado.success && resultado.xml) {
        setXmlGenerado(resultado.xml);
        
        // Guardar XML en base de datos si hay un ID de carta porte
        if (data.cartaPorteId) {
          await guardarXMLEnBaseDatos(data.cartaPorteId, resultado.xml);
        }
        
        toast({
          title: "XML generado correctamente",
          description: "El XML de la Carta Porte ha sido generado según especificaciones SAT 3.1",
        });
        
        if (resultado.warnings && resultado.warnings.length > 0) {
          toast({
            title: "Advertencias encontradas",
            description: resultado.warnings.join(', '),
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error en generación XML",
          description: resultado.errors?.join(', ') || 'Error desconocido',
          variant: "destructive",
        });
      }
      
      return resultado;
    } catch (error) {
      console.error('Error generando XML:', error);
      toast({
        title: "Error crítico",
        description: "No se pudo generar el XML",
        variant: "destructive",
      });
      return {
        success: false,
        errors: ['Error crítico en la generación']
      };
    } finally {
      setIsGenerating(false);
    }
  };

  const descargarXML = () => {
    if (!xmlGenerado) {
      toast({
        title: "Error",
        description: "No hay XML generado disponible para descargar",
        variant: "destructive",
      });
      return;
    }

    try {
      const blob = new Blob([xmlGenerado], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carta-porte-generado-${Date.now()}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Descarga iniciada",
        description: "XML generado descargado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error en descarga",
        description: "No se pudo descargar el archivo XML",
        variant: "destructive",
      });
    }
  };

  const limpiarXML = () => {
    setXmlGenerado(null);
  };

  const guardarXMLEnBaseDatos = async (cartaPorteId: string, xml: string) => {
    try {
      const { error } = await supabase
        .from('cartas_porte')
        .update({
          xml_generado: xml,
          status: 'xml_generado',
          updated_at: new Date().toISOString()
        })
        .eq('id', cartaPorteId);

      if (error) {
        console.error('Error guardando XML en base de datos:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error en guardarXMLEnBaseDatos:', error);
      // No lanzar error para no interrumpir el flujo principal
    }
  };

  return {
    // Estados
    isGenerating,
    xmlGenerado,
    
    // Funciones
    generarXML,
    descargarXML,
    limpiarXML
  };
};
