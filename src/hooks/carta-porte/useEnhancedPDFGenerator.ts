
import { useState, useCallback } from 'react';
import { CartaPorteData, UbicacionCompleta } from '@/types/cartaPorte';
import { Ubicacion } from '@/types/ubicaciones';
import { mapUbicacionToCompleta } from './mapUbicacionToCompleta';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

export function useEnhancedPDFGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfData, setPdfData] = useState<{
    url: string | null;
    blob: Blob | null;
    pages: number;
  }>({
    url: null,
    blob: null,
    pages: 0
  });

  const generateCompletePDF = useCallback(async (
    cartaPorteData: CartaPorteData,
    datosRuta?: { distanciaTotal?: number; tiempoEstimado?: number }
  ) => {
    if (isGenerating) return null;
    
    setIsGenerating(true);
    try {
      console.log('📄 Generando PDF completo de carta porte...');

      const ubicaciones: UbicacionCompleta[] = (cartaPorteData.ubicaciones || []).map(ub =>
        (ub as any).tipo_ubicacion ? (ub as UbicacionCompleta) : mapUbicacionToCompleta(ub as Ubicacion)
      );

      const data = { ...cartaPorteData, ubicaciones };
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      let yPosition = 30;
      let currentPage = 1;

      // Helper para agregar nueva página si es necesario
      const checkPageBreak = (requiredSpace: number = 20) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          currentPage++;
          yPosition = 30;
          return true;
        }
        return false;
      };

      // Helper para agregar texto con manejo de páginas
      const addText = (text: string, x: number = margin, fontSize: number = 12, style: 'normal' | 'bold' = 'normal') => {
        checkPageBreak(fontSize + 5);
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', style);
        pdf.text(text, x, yPosition);
        yPosition += fontSize * 0.5 + 3;
      };

      // Helper para agregar separador
      const addSeparator = () => {
        checkPageBreak(15);
        yPosition += 5;
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
      };

      // Header en cada página
      const addHeader = () => {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CARTA PORTE - COMPLEMENTO CFDI', margin, 20);
      };

      // Página 1: Información General
      addHeader();
      addText(`Folio: CP-${Date.now().toString().slice(-8)}`, margin, 12);
      addText(`Fecha de Generación: ${new Date().toLocaleDateString('es-MX')}`, margin, 12);
      addText(`Página ${currentPage}`, pageWidth - 40, 12);
      addSeparator();

      // Información del CFDI
      addText('INFORMACIÓN DEL CFDI', margin, 14, 'bold');
      addText(`Tipo de CFDI: ${data.tipoCfdi || 'Traslado'}`, margin + 5, 11);
      addText(`Versión Carta Porte: ${data.cartaPorteVersion || '3.1'}`, margin + 5, 11);
      addText(`Transporte Internacional: ${data.transporteInternacional === true || data.transporteInternacional === 'Sí' ? 'Sí' : 'No'}`, margin + 5, 11);
      if (data.registroIstmo) {
        addText(`Registro ISTMO: Sí`, margin + 5, 11);
      }
      addSeparator();

      // Emisor y Receptor
      addText('DATOS DEL EMISOR', margin, 14, 'bold');
      addText(`RFC: ${data.rfcEmisor || 'No especificado'}`, margin + 5, 11);
      addText(`Nombre/Razón Social: ${data.nombreEmisor || 'No especificado'}`, margin + 5, 11);
      yPosition += 5;

      addText('DATOS DEL RECEPTOR', margin, 14, 'bold');
      addText(`RFC: ${data.rfcReceptor || 'No especificado'}`, margin + 5, 11);
      addText(`Nombre/Razón Social: ${data.nombreReceptor || 'No especificado'}`, margin + 5, 11);
      addSeparator();

      // Información de Ruta (si está disponible)
      if (datosRuta?.distanciaTotal || datosRuta?.tiempoEstimado) {
        addText('INFORMACIÓN DE RUTA', margin, 14, 'bold');
        if (datosRuta.distanciaTotal) {
          addText(`Distancia Total: ${datosRuta.distanciaTotal} km`, margin + 5, 11);
        }
        if (datosRuta.tiempoEstimado) {
          const horas = Math.floor(datosRuta.tiempoEstimado / 60);
          const minutos = datosRuta.tiempoEstimado % 60;
          addText(`Tiempo Estimado: ${horas}h ${minutos}m`, margin + 5, 11);
        }
        addSeparator();
      }

      // Página 2: Ubicaciones
      if (data.ubicaciones && data.ubicaciones.length > 0) {
        checkPageBreak(40);
        addText('UBICACIONES DEL TRAYECTO', margin, 14, 'bold');

        data.ubicaciones.forEach((ubicacion, index) => {
          checkPageBreak(35);
          addText(`${index + 1}. ${ubicacion.tipo_ubicacion}: ${ubicacion.id_ubicacion}`, margin + 5, 12, 'bold');
          
          if (ubicacion.rfc_remitente_destinatario) {
            addText(`RFC: ${ubicacion.rfc_remitente_destinatario}`, margin + 10, 10);
          }
          if (ubicacion.nombre_remitente_destinatario) {
            addText(`Nombre: ${ubicacion.nombre_remitente_destinatario}`, margin + 10, 10);
          }
          
          if (ubicacion.domicilio) {
            const domicilio = ubicacion.domicilio;
            addText(`Dirección: ${domicilio.calle} ${domicilio.numero_exterior}`, margin + 10, 10);
            addText(`Colonia: ${domicilio.colonia}`, margin + 10, 10);
            addText(`Municipio: ${domicilio.municipio}, ${domicilio.estado}`, margin + 10, 10);
            addText(`Código Postal: ${domicilio.codigo_postal}`, margin + 10, 10);
          }
          
          if (ubicacion.fecha_hora_salida_llegada) {
            addText(`Fecha/Hora: ${new Date(ubicacion.fecha_hora_salida_llegada).toLocaleString('es-MX')}`, margin + 10, 10);
          }
          
          if (ubicacion.distancia_recorrida) {
            addText(`Distancia Recorrida: ${ubicacion.distancia_recorrida} km`, margin + 10, 10);
          }
          
          yPosition += 5;
        });
        addSeparator();
      }

      // Página 3: Mercancías
      if (data.mercancias && data.mercancias.length > 0) {
        checkPageBreak(40);
        addText('MERCANCÍAS TRANSPORTADAS', margin, 14, 'bold');
        
        data.mercancias.forEach((mercancia, index) => {
          checkPageBreak(25);
          addText(`${index + 1}. ${mercancia.bienes_transp}`, margin + 5, 12, 'bold');
          
          if (mercancia.descripcion) {
            addText(`Descripción: ${mercancia.descripcion}`, margin + 10, 10);
          }
          if (mercancia.cantidad && mercancia.clave_unidad) {
            addText(`Cantidad: ${mercancia.cantidad} ${mercancia.clave_unidad}`, margin + 10, 10);
          }
          if (mercancia.peso_kg) {
            addText(`Peso: ${mercancia.peso_kg} kg`, margin + 10, 10);
          }
          if (mercancia.valor_mercancia && mercancia.moneda) {
            addText(`Valor: $${mercancia.valor_mercancia} ${mercancia.moneda}`, margin + 10, 10);
          }
          if (mercancia.material_peligroso) {
            addText(`⚠️ Material Peligroso: Sí`, margin + 10, 10);
            if (mercancia.cve_material_peligroso) {
              addText(`Clave: ${mercancia.cve_material_peligroso}`, margin + 15, 9);
            }
          }
          yPosition += 3;
        });
        addSeparator();
      }

      // Página 4: Autotransporte
      if (data.autotransporte && data.autotransporte.placa_vm) {
        checkPageBreak(40);
        addText('INFORMACIÓN DEL AUTOTRANSPORTE', margin, 14, 'bold');
        const auto = data.autotransporte;
        
        addText(`Placa del Vehículo: ${auto.placa_vm}`, margin + 5, 11);
        addText(`Configuración Vehicular: ${auto.config_vehicular}`, margin + 5, 11);
        addText(`Año del Modelo: ${auto.anio_modelo_vm}`, margin + 5, 11);
        
        if (auto.perm_sct && auto.num_permiso_sct) {
          addText(`Permiso SCT: ${auto.perm_sct} - ${auto.num_permiso_sct}`, margin + 5, 11);
        }
        
        if (auto.asegura_resp_civil && auto.poliza_resp_civil) {
          addText(`Seguro: ${auto.asegura_resp_civil}`, margin + 5, 11);
          addText(`Póliza: ${auto.poliza_resp_civil}`, margin + 5, 11);
        }
        
        // Remolques si existen
        if (auto.remolques && auto.remolques.length > 0) {
          yPosition += 5;
          addText('Remolques:', margin + 5, 12, 'bold');
          auto.remolques.forEach((remolque: any, index: number) => {
            addText(`${index + 1}. Placa: ${remolque.placa_vm || 'N/A'}`, margin + 10, 10);
          });
        }
        addSeparator();
      }

      // Página 5: Figuras de Transporte
      if (data.figuras && data.figuras.length > 0) {
        checkPageBreak(40);
        addText('FIGURAS DE TRANSPORTE', margin, 14, 'bold');
        
        data.figuras.forEach((figura, index) => {
          checkPageBreak(20);
          addText(`${index + 1}. ${figura.tipo_figura}`, margin + 5, 12, 'bold');
          addText(`RFC: ${figura.rfc_figura}`, margin + 10, 10);
          addText(`Nombre: ${figura.nombre_figura}`, margin + 10, 10);
          
          if (figura.num_licencia) {
            addText(`Licencia: ${figura.num_licencia}`, margin + 10, 10);
            if (figura.tipo_licencia) {
              addText(`Tipo: ${figura.tipo_licencia}`, margin + 15, 9);
            }
          }
          
          if (figura.domicilio) {
            const dom = figura.domicilio;
            addText(`Domicilio: ${dom.calle} ${dom.numero_exterior}, ${dom.colonia}`, margin + 10, 9);
            addText(`${dom.municipio}, ${dom.estado} - CP ${dom.codigo_postal}`, margin + 10, 9);
          }
          yPosition += 3;
        });
        addSeparator();
      }

      // Footer final
      checkPageBreak(30);
      yPosition += 10;
      addText('─'.repeat(50), margin, 10);
      addText(`Documento generado el ${new Date().toLocaleString('es-MX')}`, margin, 9);
      addText(`Total de páginas: ${currentPage}`, margin, 9);
      addText('Este documento es una representación impresa de la Carta Porte electrónica.', margin, 9);

      // Generar PDF
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      const result = {
        url: pdfUrl,
        blob: pdfBlob,
        pages: currentPage
      };
      
      setPdfData(result);
      
      console.log(`✅ PDF completo generado: ${currentPage} páginas`);
      toast.success(`PDF generado correctamente (${currentPage} páginas)`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      toast.error('Error al generar el PDF');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating]);

  const clearPDF = useCallback(() => {
    if (pdfData.url) {
      URL.revokeObjectURL(pdfData.url);
    }
    setPdfData({ url: null, blob: null, pages: 0 });
  }, [pdfData.url]);

  return {
    isGenerating,
    pdfData,
    generateCompletePDF,
    clearPDF
  };
}
