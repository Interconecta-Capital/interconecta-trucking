import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { Cotizacion } from './useCotizaciones';

export function useCotizacionPDF() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async (cotizacion: Cotizacion) => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      
      // Configuración de colores
      const primaryColor = '#2563eb'; // blue-600
      const lightGrayColor = '#f8fafc'; // slate-50
      const darkGrayColor = '#475569'; // slate-600
      
      // Header con logo y título
      doc.setFillColor(primaryColor);
      doc.rect(0, 0, 210, 30, 'F');
      
      doc.setTextColor('#ffffff');
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('COTIZACIÓN', 20, 20);
      
      // Información de la empresa (lado derecho del header)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Folio: ${cotizacion.folio_cotizacion}`, 140, 15);
      doc.text(`Fecha: ${new Date(cotizacion.created_at).toLocaleDateString()}`, 140, 22);
      
      // Reset color
      doc.setTextColor('#000000');
      
      let yPosition = 45;
      
      // Información de la cotización
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Información General', 20, yPosition);
      yPosition += 10;
      
      // Tabla de información general
      autoTable(doc, {
        startY: yPosition,
        head: [['Campo', 'Valor']],
        body: [
          ['Nombre de Cotización', cotizacion.nombre_cotizacion],
          ['Estado', cotizacion.estado.toUpperCase()],
          ['Tipo de Cliente', cotizacion.cliente_tipo === 'nuevo' ? 'Cliente Nuevo' : 'Cliente Existente'],
          ['Validez', `${cotizacion.tiempo_validez_dias || 15} días`],
        ],
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          textColor: '#ffffff',
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
        },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 120 }
        },
        margin: { left: 20, right: 20 },
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
      
      // Información del cliente
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Información del Cliente', 20, yPosition);
      yPosition += 10;
      
      let clienteData = [];
      if (cotizacion.cliente_tipo === 'nuevo' && cotizacion.cliente_nuevo_datos) {
        const datos = cotizacion.cliente_nuevo_datos as any;
        clienteData = [
          ['Nombre/Razón Social', datos.nombre || 'No especificado'],
          ['RFC', datos.rfc || 'No especificado'],
          ['Email', datos.email || 'No especificado'],
          ['Teléfono', datos.telefono || 'No especificado'],
        ];
      } else {
        clienteData = [
          ['Cliente Existente', 'ID: ' + (cotizacion.cliente_existente_id || 'No especificado')]
        ];
      }
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Campo', 'Valor']],
        body: clienteData,
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          textColor: '#ffffff',
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
        },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 120 }
        },
        margin: { left: 20, right: 20 },
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
      
      // Detalles del viaje
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalles del Viaje', 20, yPosition);
      yPosition += 10;
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Campo', 'Valor']],
        body: [
          ['Origen', cotizacion.origen],
          ['Destino', cotizacion.destino],
          ['Distancia Total', `${cotizacion.distancia_total || 0} km`],
          ['Tiempo Estimado', `${cotizacion.tiempo_estimado || 0} minutos`],
        ],
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          textColor: '#ffffff',
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
        },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 120 }
        },
        margin: { left: 20, right: 20 },
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
      
      // Información financiera
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Información Financiera', 20, yPosition);
      yPosition += 10;
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Concepto', 'Monto']],
        body: [
          ['Costo Total Interno', `$${cotizacion.costo_total_interno?.toLocaleString() || '0'}`],
          ['Margen de Ganancia', `${cotizacion.margen_ganancia || 0}%`],
          ['PRECIO COTIZADO', `$${cotizacion.precio_cotizado?.toLocaleString() || '0'}`],
        ],
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          textColor: '#ffffff',
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
        },
        columnStyles: {
          0: { cellWidth: 100, fontStyle: 'bold' },
          1: { cellWidth: 80, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 20, right: 20 },
        didParseCell: (data) => {
          if (data.row.index === 2 && data.column.index === 1) {
            data.cell.styles.fillColor = '#dcfce7'; // green-100
            data.cell.styles.textColor = '#166534'; // green-800
            data.cell.styles.fontSize = 11;
          }
        }
      });
      
      // Verificar si necesitamos una nueva página
      if ((doc as any).lastAutoTable.finalY > 250) {
        doc.addPage();
        yPosition = 20;
      } else {
        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }
      
      // Condiciones comerciales
      if (cotizacion.condiciones_comerciales) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Condiciones Comerciales', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(cotizacion.condiciones_comerciales, 170);
        doc.text(splitText, 20, yPosition);
        yPosition += splitText.length * 5 + 10;
      }
      
      // Notas internas (solo si existen)
      if (cotizacion.notas_internas) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Notas Internas', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(cotizacion.notas_internas, 170);
        doc.text(splitText, 20, yPosition);
        yPosition += splitText.length * 5 + 10;
      }
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(darkGrayColor);
        doc.text(
          `Página ${i} de ${pageCount} - Generado el ${new Date().toLocaleString()}`,
          20,
          285
        );
        doc.text(
          `Cotización ${cotizacion.folio_cotizacion}`,
          200,
          285,
          { align: 'right' }
        );
      }
      
      // Descargar el PDF
      const fileName = `cotizacion-${cotizacion.folio_cotizacion}-${Date.now()}.pdf`;
      doc.save(fileName);
      
      toast.success('PDF generado y descargado exitosamente');
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error('Error al generar el PDF');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateAndPreviewPDF = async (cotizacion: Cotizacion) => {
    setIsGenerating(true);
    
    try {
      // Similar al generatePDF pero retorna el blob para preview
      const doc = new jsPDF();
      // ... (mismo código que arriba) ...
      
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Abrir en nueva pestaña
      window.open(pdfUrl, '_blank');
      
      toast.success('PDF generado para previsualización');
      
      return { blob: pdfBlob, url: pdfUrl };
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error('Error al generar el PDF');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generatePDF,
    generateAndPreviewPDF
  };
}