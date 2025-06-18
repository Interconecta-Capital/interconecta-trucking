
import { useState, useCallback } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';
import { CartaPortePDFAdvanced } from '@/services/pdfGenerator/CartaPortePDFAdvanced';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PDFPersistenceData {
  url: string | null;
  blob: Blob | null;
  pages: number;
  generatedAt: string | null;
}

export function useEnhancedPDFPersistence(cartaPorteId?: string) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfData, setPdfData] = useState<PDFPersistenceData>({
    url: null,
    blob: null,
    pages: 0,
    generatedAt: null
  });

  const generateAndPersistPDF = useCallback(async (
    cartaPorteData: CartaPorteData,
    datosRuta?: { distanciaTotal?: number; tiempoEstimado?: number }
  ) => {
    if (isGenerating || !cartaPorteId) return null;
    
    setIsGenerating(true);
    try {
      console.log('📄 Generando PDF avanzado...');
      
      const resultado = await CartaPortePDFAdvanced.generarPDF(cartaPorteData);
      
      if (!resultado.success || !resultado.pdfBlob || !resultado.pdfUrl) {
        throw new Error(resultado.error || 'Error generando PDF');
      }

      // Convertir blob a base64 para almacenar en DB
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(resultado.pdfBlob!);
      });

      // Preparar datos para serialización JSON segura
      const pdfInfo = {
        url: resultado.pdfUrl,
        base64Data,
        pages: 1,
        generatedAt: new Date().toISOString(),
        routeData: datosRuta || {}
      };

      // Obtener datos actuales y actualizar solo el campo pdfPersistido
      const { data: currentData, error: fetchError } = await supabase
        .from('cartas_porte')
        .select('datos_formulario')
        .eq('id', cartaPorteId)
        .single();

      if (fetchError) throw fetchError;

      // Parsear datos actuales de forma segura
      let currentFormData: any = {};
      try {
        if (currentData?.datos_formulario) {
          if (typeof currentData.datos_formulario === 'string') {
            currentFormData = JSON.parse(currentData.datos_formulario);
          } else {
            currentFormData = currentData.datos_formulario as any;
          }
        }
      } catch (parseError) {
        console.warn('Error parsing current form data:', parseError);
      }

      // Combinar datos actuales con nueva información de PDF
      const updatedFormData = {
        ...currentFormData,
        pdfPersistido: pdfInfo
      };

      // Guardar en la base de datos como string JSON
      const { error } = await supabase
        .from('cartas_porte')
        .update({
          datos_formulario: JSON.stringify(updatedFormData)
        })
        .eq('id', cartaPorteId);

      if (error) throw error;

      setPdfData({
        url: resultado.pdfUrl,
        blob: resultado.pdfBlob,
        pages: 1,
        generatedAt: new Date().toISOString()
      });

      toast.success('PDF generado y guardado correctamente');
      
      return {
        url: resultado.pdfUrl,
        blob: resultado.pdfBlob,
        pages: 1
      };
      
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      toast.error('Error al generar el PDF');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, cartaPorteId]);

  const restorePDFFromDB = useCallback(async () => {
    if (!cartaPorteId) return;

    try {
      const { data, error } = await supabase
        .from('cartas_porte')
        .select('datos_formulario')
        .eq('id', cartaPorteId)
        .single();

      if (error || !data?.datos_formulario) return;

      // Parsear datos de forma segura
      let formData: any = {};
      try {
        if (typeof data.datos_formulario === 'string') {
          formData = JSON.parse(data.datos_formulario);
        } else {
          formData = data.datos_formulario as any;
        }
      } catch (parseError) {
        console.error('Error parsing form data:', parseError);
        return;
      }

      // Verificar si existe pdfPersistido de forma segura
      const pdfPersistido = formData?.pdfPersistido;
      if (!pdfPersistido || typeof pdfPersistido !== 'object') {
        return;
      }
      
      // Recrear blob desde base64
      const response = await fetch(pdfPersistido.base64Data);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setPdfData({
        url,
        blob,
        pages: pdfPersistido.pages || 1,
        generatedAt: pdfPersistido.generatedAt
      });

      console.log('✅ PDF restaurado desde base de datos');
    } catch (error) {
      console.error('❌ Error restaurando PDF:', error);
    }
  }, [cartaPorteId]);

  const clearPDF = useCallback(() => {
    if (pdfData.url) {
      URL.revokeObjectURL(pdfData.url);
    }
    setPdfData({
      url: null,
      blob: null,
      pages: 0,
      generatedAt: null
    });
  }, [pdfData.url]);

  return {
    isGenerating,
    pdfData,
    generateAndPersistPDF,
    restorePDFFromDB,
    clearPDF
  };
}
