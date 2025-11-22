// ============================================
// Servicio de Generación de Documentos Operativos - VERSIÓN MEJORADA
// ISO 27001 A.12.3.1 - Copias de seguridad
// ============================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export class DocumentosOperativosService {
  /**
   * Generar Hoja de Ruta PROFESIONAL para el viaje
   * ISO 27001 A.12.1.1 - Procedimientos operativos documentados
   */
  static async generarHojaDeRuta(viajeCompleto: any): Promise<Blob> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const viaje = viajeCompleto.viaje;
    const conductor = viajeCompleto.conductor;
    const vehiculo = viajeCompleto.vehiculo;
    const remolque = viajeCompleto.remolque;
    const mercancias = viajeCompleto.mercancias || [];
    const trackingData = viaje.tracking_data || {};
    const ubicaciones = trackingData.ubicaciones || {};

    // ========== HEADER CON GRADIENTE ==========
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('HOJA DE RUTA', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Folio: ${viaje.id?.substring(0, 8).toUpperCase() || 'N/A'}`, pageWidth / 2, 30, { align: 'center' });
    doc.text(`Generado: ${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageWidth / 2, 37, { align: 'center' });

    let yPos = 55;

    // ========== INFORMACIÓN DEL VIAJE ==========
    doc.setFillColor(241, 245, 249); // Slate-100
    doc.roundedRect(10, yPos - 5, pageWidth - 20, 10, 2, 2, 'F');
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL VIAJE', 15, yPos);
    yPos += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105); // Slate-600

    // Origen con dirección completa responsive
    const origenDomicilio = ubicaciones.origen?.domicilio || {};
    const origenCompleto = `${origenDomicilio.calle || viaje.origen || 'N/A'}`;
    const origenDetalle = `${origenDomicilio.colonia || ''}, ${origenDomicilio.municipio || ''}, ${origenDomicilio.estado || ''}, CP ${origenDomicilio.codigo_postal || origenDomicilio.codigoPostal || 'N/A'}`;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Origen:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    const origenLines = doc.splitTextToSize(origenCompleto, pageWidth - 50);
    doc.text(origenLines, 40, yPos);
    yPos += origenLines.length * 5;
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const origenDetalleLines = doc.splitTextToSize(origenDetalle, pageWidth - 50);
    doc.text(origenDetalleLines, 40, yPos);
    yPos += origenDetalleLines.length * 5 + 3;

    // Destino con dirección completa responsive
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    const destinoDomicilio = ubicaciones.destino?.domicilio || {};
    const destinoCompleto = `${destinoDomicilio.calle || viaje.destino || 'N/A'}`;
    const destinoDetalle = `${destinoDomicilio.colonia || ''}, ${destinoDomicilio.municipio || ''}, ${destinoDomicilio.estado || ''}, CP ${destinoDomicilio.codigo_postal || destinoDomicilio.codigoPostal || 'N/A'}`;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Destino:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    const destinoLines = doc.splitTextToSize(destinoCompleto, pageWidth - 50);
    doc.text(destinoLines, 40, yPos);
    yPos += destinoLines.length * 5;
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const destinoDetalleLines = doc.splitTextToSize(destinoDetalle, pageWidth - 50);
    doc.text(destinoDetalleLines, 40, yPos);
    yPos += destinoDetalleLines.length * 5 + 5;

    // Fechas y distancia
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    autoTable(doc, {
      startY: yPos,
      head: [],
      body: [
        ['Salida Programada:', viaje.fecha_inicio_programada ? new Date(viaje.fecha_inicio_programada).toLocaleString('es-MX') : 'No definida'],
        ['Llegada Estimada:', viaje.fecha_fin_programada ? new Date(viaje.fecha_fin_programada).toLocaleString('es-MX') : 'No definida'],
        ['Distancia Estimada:', `${viaje.distancia_km || trackingData.distanciaRecorrida || 0} km`],
      ],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50, textColor: [30, 41, 59] },
        1: { cellWidth: 'auto', textColor: [71, 85, 105] }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // ========== RECURSOS ASIGNADOS ==========
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(10, yPos - 5, pageWidth - 20, 10, 2, 2, 'F');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('RECURSOS ASIGNADOS', 15, yPos);
    yPos += 12;

    const recursosData = [];
    
    if (conductor) {
      recursosData.push(['Conductor', conductor.nombre || 'No asignado', conductor.num_licencia || '-', conductor.telefono || '-']);
    } else {
      recursosData.push(['Conductor', 'No asignado', '-', '-']);
    }
    
    if (vehiculo) {
      recursosData.push(['Vehículo', `${vehiculo.placa || 'N/A'}`, `${vehiculo.marca || ''} ${vehiculo.modelo || ''}`.trim() || '-', vehiculo.config_vehicular || '-']);
    } else {
      recursosData.push(['Vehículo', 'No asignado', '-', '-']);
    }

    if (remolque) {
      recursosData.push(['Remolque', remolque.placa || 'N/A', remolque.tipo_remolque || '-', '-']);
    }

    autoTable(doc, {
      startY: yPos,
      head: [['Recurso', 'Identificación', 'Detalle 1', 'Detalle 2']],
      body: recursosData,
      theme: 'striped',
      headStyles: { 
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      styles: { 
        fontSize: 9,
        cellPadding: 4
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // ========== MERCANCÍAS ==========
    if (mercancias.length > 0 || trackingData.descripcionMercancia) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(241, 245, 249);
      doc.roundedRect(10, yPos - 5, pageWidth - 20, 10, 2, 2, 'F');
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('MERCANCÍAS A TRANSPORTAR', 15, yPos);
      yPos += 12;

      if (mercancias.length > 0) {
        const mercanciaRows = mercancias.map((m: any, index: number) => [
          (index + 1).toString(),
          m.descripcion || 'Sin descripción',
          `${m.cantidad || 0} ${m.unidad || 'pzas'}`,
          `${m.peso_kg || 0} kg`,
          m.valor_mercancia ? `$${m.valor_mercancia.toLocaleString('es-MX')}` : '-'
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Descripción', 'Cantidad', 'Peso', 'Valor']],
          body: mercanciaRows,
          theme: 'striped',
          headStyles: { 
            fillColor: [37, 99, 235],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 10
          },
          styles: { fontSize: 9, cellPadding: 3 },
          alternateRowStyles: {
            fillColor: [248, 250, 252]
          }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
      } else if (trackingData.descripcionMercancia) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        const descripcionLines = doc.splitTextToSize(trackingData.descripcionMercancia, pageWidth - 30);
        doc.text(descripcionLines, 15, yPos);
        yPos += descripcionLines.length * 6 + 10;
      }
    }

    // ========== INSTRUCCIONES ESPECIALES ==========
    if (viaje.observaciones) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(254, 243, 199); // Yellow-100
      doc.roundedRect(10, yPos - 5, pageWidth - 20, 10, 2, 2, 'F');
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('⚠ INSTRUCCIONES ESPECIALES', 15, yPos);
      yPos += 12;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const splitText = doc.splitTextToSize(viaje.observaciones, pageWidth - 30);
      doc.text(splitText, 15, yPos);
      yPos += splitText.length * 6;
    }

    // ========== FOOTER ==========
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${i} de ${pageCount}`,
        15,
        285
      );
      doc.text(
        `Hoja de Ruta | ${new Date().toLocaleDateString('es-MX')}`,
        pageWidth - 15,
        285,
        { align: 'right' }
      );
    }

    return doc.output('blob');
  }

  /**
   * Generar Checklist Pre-Viaje PROFESIONAL
   * ISO 27001 A.12.1.1 - Procedimientos operativos documentados
   */
  static async generarChecklistPreViaje(viajeCompleto: any): Promise<Blob> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const viaje = viajeCompleto.viaje;
    const conductor = viajeCompleto.conductor;
    const vehiculo = viajeCompleto.vehiculo;

    // ========== HEADER CON GRADIENTE ==========
    doc.setFillColor(16, 185, 129); // Green-500
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('CHECKLIST PRE-VIAJE', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Viaje: ${viaje.origen} → ${viaje.destino}`, pageWidth / 2, 28, { align: 'center' });
    doc.text(`Fecha de Verificación: ${new Date().toLocaleDateString('es-MX')}`, pageWidth / 2, 36, { align: 'center' });

    let yPos = 55;

    // ========== INFORMACIÓN DEL RESPONSABLE ==========
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(10, yPos - 5, pageWidth - 20, 8, 2, 2, 'F');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESPONSABLE DE LA VERIFICACIÓN', 15, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: [
        ['Conductor:', conductor?.nombre || 'No asignado', 'Teléfono:', conductor?.telefono || 'N/A'],
        ['Vehículo:', vehiculo?.placa || 'No asignado', 'Marca/Modelo:', `${vehiculo?.marca || ''} ${vehiculo?.modelo || ''}`.trim() || 'N/A'],
        ['Fecha Verificación:', '_____________________', 'Hora Verificación:', '_____________________'],
      ],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35, textColor: [30, 41, 59] },
        1: { cellWidth: 55, textColor: [71, 85, 105] },
        2: { fontStyle: 'bold', cellWidth: 30, textColor: [30, 41, 59] },
        3: { cellWidth: 'auto', textColor: [71, 85, 105] }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // ========== CHECKLIST DE VERIFICACIÓN ==========
    const checklistItems = [
      {
        categoria: '📄 DOCUMENTACIÓN',
        color: [59, 130, 246], // Blue-500
        items: [
          'Licencia de conducir vigente y en buen estado',
          'Tarjeta de circulación del vehículo',
          'Póliza de seguro vigente (Responsabilidad Civil)',
          'Permisos SCT vigentes',
          'Documentos de carga y guías',
        ]
      },
      {
        categoria: '🔧 ESTADO DEL VEHÍCULO',
        color: [234, 179, 8], // Yellow-500
        items: [
          'Nivel de aceite del motor',
          'Nivel de líquido de frenos',
          'Nivel de líquido refrigerante',
          'Presión de neumáticos (incluir refacción)',
          'Estado de llantas (desgaste, fisuras)',
          'Funcionamiento de todas las luces',
          'Funcionamiento del sistema de frenos',
          'Limpieza de parabrisas y espejos',
          'Nivel de combustible suficiente',
        ]
      },
      {
        categoria: '🛡️ SEGURIDAD',
        color: [239, 68, 68], // Red-500
        items: [
          'Extintores cargados y con vigencia actualizada',
          'Triángulos de seguridad (mínimo 2)',
          'Botiquín de primeros auxilios completo',
          'Herramientas básicas (gato, llave de cruz)',
          'Chaleco reflejante',
          'Señalamientos de seguridad',
          'Equipo de emergencia (linterna, cables)',
        ]
      },
      {
        categoria: '📦 VERIFICACIÓN DE CARGA',
        color: [249, 115, 22], // Orange-500
        items: [
          'Peso total dentro de los límites legales',
          'Carga distribuida uniformemente',
          'Carga asegurada con amarres/cinchos',
          'Documentación completa de mercancías',
          'Sellos de seguridad colocados (si aplica)',
          'Mercancía peligrosa identificada (si aplica)',
        ]
      },
    ];

    checklistItems.forEach((section, sectionIndex) => {
      if (yPos > 240) {
        doc.addPage();
        yPos = 25;
      }

      // Header de sección con color
      const [r, g, b] = section.color;
      doc.setFillColor(r, g, b);
      doc.roundedRect(10, yPos - 5, pageWidth - 20, 10, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(section.categoria, 15, yPos);
      yPos += 12;

      // Items del checklist con checkboxes
      section.items.forEach((item, itemIndex) => {
        if (yPos > 275) {
          doc.addPage();
          yPos = 25;
        }

        // Checkbox
        doc.setDrawColor(203, 213, 225); // Slate-300
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(15, yPos - 4, 5, 5, 0.5, 0.5, 'FD');
        
        // Texto del item
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const itemLines = doc.splitTextToSize(item, pageWidth - 75);
        doc.text(itemLines, 23, yPos);
        
        // Línea para observaciones
        const observacionesY = yPos - 1;
        doc.setDrawColor(226, 232, 240);
        doc.line(pageWidth - 50, observacionesY, pageWidth - 15, observacionesY);
        
        yPos += Math.max(itemLines.length * 5, 7);
      });

      yPos += 8;
    });

    // ========== OBSERVACIONES FINALES ==========
    if (yPos > 230) {
      doc.addPage();
      yPos = 25;
    }

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(10, yPos - 5, pageWidth - 20, 8, 2, 2, 'F');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVACIONES', 15, yPos);
    yPos += 10;

    doc.setDrawColor(203, 213, 225);
    for (let i = 0; i < 4; i++) {
      doc.line(15, yPos, pageWidth - 15, yPos);
      yPos += 7;
    }

    yPos += 10;

    // ========== FIRMAS ==========
    const firmaY = yPos;
    
    // Firma del conductor
    doc.setDrawColor(203, 213, 225);
    doc.line(20, firmaY, 90, firmaY);
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Firma del Conductor', 55, firmaY + 6, { align: 'center' });
    doc.text(conductor?.nombre || 'No asignado', 55, firmaY + 12, { align: 'center' });

    // Firma del supervisor
    doc.line(pageWidth - 90, firmaY, pageWidth - 20, firmaY);
    doc.text('Firma del Supervisor', pageWidth - 55, firmaY + 6, { align: 'center' });
    doc.text('_____________________', pageWidth - 55, firmaY + 12, { align: 'center' });

    // ========== FOOTER ==========
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Página ${i} de ${pageCount}`, 15, 285);
      doc.text(
        `Checklist Pre-Viaje | ${new Date().toLocaleString('es-MX')}`,
        pageWidth - 15,
        285,
        { align: 'right' }
      );
    }

    return doc.output('blob');
  }

  /**
   * Descargar documento generado
   */
  static descargarDocumento(blob: Blob, nombreArchivo: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Imprimir documento
   */
  static imprimirDocumento(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 100);
    };
  }
}
