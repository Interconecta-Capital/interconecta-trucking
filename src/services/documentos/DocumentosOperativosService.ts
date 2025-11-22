// ============================================
// Servicio de Generación de Documentos Operativos
// ISO 27001 A.12.3.1 - Copias de seguridad
// ============================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export class DocumentosOperativosService {
  /**
   * Generar Hoja de Ruta para el viaje
   * ISO 27001 A.12.1.1 - Procedimientos operativos documentados
   */
  static async generarHojaDeRuta(viajeCompleto: any): Promise<Blob> {
    const doc = new jsPDF();
    const viaje = viajeCompleto.viaje;
    const conductor = viajeCompleto.conductor;
    const vehiculo = viajeCompleto.vehiculo;
    const remolque = viajeCompleto.remolque;
    const mercancias = viajeCompleto.mercancias || [];

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('HOJA DE RUTA', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Folio: ${viaje.id?.substring(0, 8).toUpperCase() || 'N/A'}`, 105, 28, { align: 'center' });
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 105, 33, { align: 'center' });

    let yPos = 45;

    // Sección de Información del Viaje
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL VIAJE', 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const infoViaje = [
      ['Estado:', viaje.estado || 'N/A'],
      ['Origen:', viaje.origen || 'N/A'],
      ['Destino:', viaje.destino || 'N/A'],
      ['Distancia:', `${viaje.distancia_km || 0} km`],
      ['Fecha Inicio:', viaje.fecha_inicio_programada ? new Date(viaje.fecha_inicio_programada).toLocaleString('es-MX') : 'No definida'],
      ['Fecha Fin:', viaje.fecha_fin_programada ? new Date(viaje.fecha_fin_programada).toLocaleString('es-MX') : 'No definida'],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: infoViaje,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 'auto' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Sección de Conductor
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CONDUCTOR ASIGNADO', 14, yPos);
    yPos += 8;

    const infoConductor = conductor ? [
      ['Nombre:', conductor.nombre || 'No asignado'],
      ['Teléfono:', conductor.telefono || 'N/A'],
      ['Licencia:', `${conductor.tipo_licencia || 'N/A'} - ${conductor.num_licencia || 'N/A'}`],
      ['Vigencia Licencia:', conductor.vigencia_licencia ? new Date(conductor.vigencia_licencia).toLocaleDateString('es-MX') : 'N/A'],
    ] : [['Conductor:', 'No asignado']];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: infoConductor,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 'auto' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Sección de Vehículo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('UNIDAD ASIGNADA', 14, yPos);
    yPos += 8;

    const infoVehiculo = vehiculo ? [
      ['Placa:', vehiculo.placa || 'N/A'],
      ['Marca/Modelo:', `${vehiculo.marca || ''} ${vehiculo.modelo || ''}`.trim() || 'N/A'],
      ['Año:', vehiculo.anio?.toString() || 'N/A'],
      ['Tipo:', vehiculo.tipo_carroceria || 'N/A'],
      ['Capacidad:', `${vehiculo.capacidad_carga || 0} kg`],
    ] : [['Vehículo:', 'No asignado']];

    if (remolque) {
      infoVehiculo.push(['Remolque:', `${remolque.placa} - ${remolque.tipo_remolque}`]);
    }

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: infoVehiculo,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 'auto' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Sección de Mercancías
    if (mercancias.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('MERCANCÍAS A TRANSPORTAR', 14, yPos);
      yPos += 8;

      const mercanciaRows = mercancias.map((m: any, index: number) => [
        (index + 1).toString(),
        m.descripcion || 'Sin descripción',
        `${m.cantidad || 0} ${m.unidad || 'pzas'}`,
        `${m.peso_kg || 0} kg`,
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Descripción', 'Cantidad', 'Peso']],
        body: mercanciaRows,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Instrucciones especiales
    if (viaje.observaciones) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('INSTRUCCIONES ESPECIALES', 14, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const splitText = doc.splitTextToSize(viaje.observaciones, 180);
      doc.text(splitText, 14, yPos);
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount} | Generado: ${new Date().toLocaleString('es-MX')}`,
        105,
        287,
        { align: 'center' }
      );
    }

    return doc.output('blob');
  }

  /**
   * Generar Checklist Pre-Viaje
   * ISO 27001 A.12.1.1 - Procedimientos operativos documentados
   */
  static async generarChecklistPreViaje(viajeCompleto: any): Promise<Blob> {
    const doc = new jsPDF();
    const viaje = viajeCompleto.viaje;
    const conductor = viajeCompleto.conductor;
    const vehiculo = viajeCompleto.vehiculo;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('CHECKLIST PRE-VIAJE', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Viaje: ${viaje.origen} → ${viaje.destino}`, 105, 28, { align: 'center' });
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 105, 33, { align: 'center' });

    let yPos = 45;

    // Información del responsable
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESPONSABLE DE LA VERIFICACIÓN', 14, yPos);
    yPos += 8;

    const infoResponsable = [
      ['Conductor:', conductor?.nombre || 'No asignado'],
      ['Vehículo:', vehiculo?.placa || 'No asignado'],
      ['Fecha verificación:', '____________________'],
      ['Hora verificación:', '____________________'],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: infoResponsable,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Checklist de verificación
    const checklistItems = [
      // Documentación
      { categoria: 'DOCUMENTACIÓN', items: [
        'Licencia de conducir vigente',
        'Tarjeta de circulación',
        'Póliza de seguro vigente',
        'Permisos SCT',
        'Documentos de carga',
      ]},
      // Estado del vehículo
      { categoria: 'ESTADO DEL VEHÍCULO', items: [
        'Niveles de aceite',
        'Nivel de líquido de frenos',
        'Nivel de refrigerante',
        'Presión de neumáticos',
        'Estado de llantas (desgaste)',
        'Funcionamiento de luces',
        'Funcionamiento de frenos',
        'Limpieza de parabrisas',
      ]},
      // Seguridad
      { categoria: 'SEGURIDAD', items: [
        'Extintores cargados y vigentes',
        'Triángulos de seguridad',
        'Botiquín de primeros auxilios',
        'Herramientas básicas',
        'Chaleco reflejante',
        'Señalamientos de seguridad',
      ]},
      // Carga
      { categoria: 'VERIFICACIÓN DE CARGA', items: [
        'Peso dentro de límites',
        'Carga bien distribuida',
        'Carga asegurada correctamente',
        'Documentación de mercancías',
        'Sellos de seguridad (si aplica)',
      ]},
    ];

    checklistItems.forEach(section => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(230, 230, 230);
      doc.rect(14, yPos - 5, 182, 8, 'F');
      doc.text(section.categoria, 16, yPos);
      yPos += 10;

      const rows = section.items.map(item => [
        '☐ Sí    ☐ No    ☐ N/A',
        item,
        '________________________'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [],
        body: rows,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 90 },
          2: { cellWidth: 52, halign: 'right', textColor: [150, 150, 150] }
        }
      });

      yPos = (doc as any).lastAutoTable.finalY + 8;
    });

    // Sección de observaciones
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVACIONES', 14, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.line(14, yPos, 196, yPos);
    yPos += 8;
    doc.line(14, yPos, 196, yPos);
    yPos += 8;
    doc.line(14, yPos, 196, yPos);
    yPos += 8;
    doc.line(14, yPos, 196, yPos);

    // Firma
    yPos += 15;
    doc.line(14, yPos, 90, yPos);
    doc.text('Firma del Conductor', 52, yPos + 5, { align: 'center' });

    doc.line(106, yPos, 196, yPos);
    doc.text('Firma del Supervisor', 151, yPos + 5, { align: 'center' });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount} | Checklist Pre-Viaje | ${new Date().toLocaleString('es-MX')}`,
        105,
        287,
        { align: 'center' }
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
