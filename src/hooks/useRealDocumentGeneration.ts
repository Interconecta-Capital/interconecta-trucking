
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ViajeCompleto } from '@/hooks/useViajesCompletos';
import { toast } from 'sonner';

export const useRealDocumentGeneration = () => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingXML, setIsGeneratingXML] = useState(false);
  const [isGeneratingHojaRuta, setIsGeneratingHojaRuta] = useState(false);

  const generarPDFReal = async (viaje: ViajeCompleto) => {
    setIsGeneratingPDF(true);
    
    try {
      console.log('📄 Generando PDF real para viaje:', viaje.id);
      
      // Llamar a edge function para generar PDF
      const { data, error } = await supabase.functions.invoke('generate-pdf-carta-porte', {
        body: {
          viajeId: viaje.id,
          cartaPorteId: viaje.carta_porte_id,
          tipo: 'carta-porte'
        }
      });

      if (error) {
        console.error('❌ Error generando PDF:', error);
        toast.error('Error al generar el PDF');
        return null;
      }

      if (data?.pdfUrl) {
        // Descargar PDF
        const link = document.createElement('a');
        link.href = data.pdfUrl;
        link.download = `CartaPorte_${viaje.carta_porte_id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('PDF generado y descargado exitosamente');
        return data.pdfUrl;
      }

      toast.error('No se pudo generar el PDF');
      return null;

    } catch (error) {
      console.error('❌ Error en generación de PDF:', error);
      toast.error('Error al generar el PDF');
      return null;
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generarXMLReal = async (viaje: ViajeCompleto) => {
    setIsGeneratingXML(true);
    
    try {
      console.log('📄 Generando XML SAT real para viaje:', viaje.id);
      
      // Llamar a edge function para generar XML
      const { data, error } = await supabase.functions.invoke('generate-xml-sat', {
        body: {
          viajeId: viaje.id,
          cartaPorteId: viaje.carta_porte_id,
          version: '3.1'
        }
      });

      if (error) {
        console.error('❌ Error generando XML:', error);
        toast.error('Error al generar el XML SAT');
        return null;
      }

      if (data?.xmlContent) {
        // Descargar XML
        const blob = new Blob([data.xmlContent], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `CartaPorte_${viaje.carta_porte_id}.xml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('XML SAT generado y descargado exitosamente');
        return data.xmlContent;
      }

      toast.error('No se pudo generar el XML SAT');
      return null;

    } catch (error) {
      console.error('❌ Error en generación de XML:', error);
      toast.error('Error al generar el XML SAT');
      return null;
    } finally {
      setIsGeneratingXML(false);
    }
  };

  const generarHojaRutaReal = async (viaje: ViajeCompleto) => {
    setIsGeneratingHojaRuta(true);
    
    try {
      console.log('📄 Generando Hoja de Ruta real para viaje:', viaje.id);
      
      // Llamar a edge function para generar Hoja de Ruta
      const { data, error } = await supabase.functions.invoke('generate-hoja-ruta', {
        body: {
          viajeId: viaje.id,
          incluirMapa: true,
          incluirInstrucciones: true
        }
      });

      if (error) {
        console.error('❌ Error generando Hoja de Ruta:', error);
        toast.error('Error al generar la Hoja de Ruta');
        return null;
      }

      if (data?.pdfUrl) {
        // Descargar Hoja de Ruta
        const link = document.createElement('a');
        link.href = data.pdfUrl;
        link.download = `HojaRuta_${viaje.carta_porte_id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Hoja de Ruta generada y descargada exitosamente');
        return data.pdfUrl;
      }

      toast.error('No se pudo generar la Hoja de Ruta');
      return null;

    } catch (error) {
      console.error('❌ Error en generación de Hoja de Ruta:', error);
      toast.error('Error al generar la Hoja de Ruta');
      return null;
    } finally {
      setIsGeneratingHojaRuta(false);
    }
  };

  const timbrarDocumentoReal = async (viaje: ViajeCompleto) => {
    try {
      console.log('🏛️ Timbrando documento real para viaje:', viaje.id);
      
      // Llamar a edge function de timbrado
      const { data, error } = await supabase.functions.invoke('timbrar-invoice', {
        body: {
          cartaPorteId: viaje.carta_porte_id,
          autoGenerate: true
        }
      });

      if (error) {
        console.error('❌ Error timbrando documento:', error);
        toast.error('Error al timbrar el documento');
        return null;
      }

      if (data?.success) {
        toast.success('Documento timbrado exitosamente');
        return data;
      }

      toast.error('No se pudo timbrar el documento');
      return null;

    } catch (error) {
      console.error('❌ Error en timbrado:', error);
      toast.error('Error al timbrar el documento');
      return null;
    }
  };

  return {
    generarPDFReal,
    generarXMLReal,
    generarHojaRutaReal,
    timbrarDocumentoReal,
    isGeneratingPDF,
    isGeneratingXML,
    isGeneratingHojaRuta
  };
};
