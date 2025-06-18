
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CartaPorteData } from '@/types/cartaPorte';

// Extender el tipo jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

export interface AdvancedPDFGenerationResult {
  success: boolean;
  pdfBlob?: Blob;
  pdfUrl?: string;
  error?: string;
}

export class CartaPortePDFAdvanced {
  private static readonly COLORS = {
    primary: '#007AFF',
    secondary: '#5856D6', 
    success: '#34C759',
    text: '#1D1D1F',
    lightText: '#6D6D70',
    background: '#F2F2F7',
    white: '#FFFFFF',
    border: '#E5E5EA'
  };

  private static readonly FONTS = {
    title: { size: 24, weight: 'bold' },
    subtitle: { size: 18, weight: 'bold' },
    heading: { size: 14, weight: 'bold' },
    body: { size: 11, weight: 'normal' },
    small: { size: 9, weight: 'normal' }
  };

  static async generarPDF(cartaPorteData: CartaPorteData): Promise<AdvancedPDFGenerationResult> {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = 20;

      // Header con diseño moderno
      this.addHeader(doc, pageWidth, yPosition);
      yPosition += 40;

      // Información General
      yPosition = this.addGeneralInfo(doc, cartaPorteData, yPosition, pageWidth);
      yPosition += 15;

      // Configuración
      yPosition = this.addConfigurationSection(doc, cartaPorteData, yPosition, pageWidth);
      yPosition += 10;

      // Ubicaciones
      yPosition = this.addUbicacionesSection(doc, cartaPorteData, yPosition, pageWidth, pageHeight);

      // Mercancías
      yPosition = this.addMercanciasSection(doc, cartaPorteData, yPosition, pageWidth, pageHeight);

      // Autotransporte
      yPosition = this.addAutotransporteSection(doc, cartaPorteData, yPosition, pageWidth, pageHeight);

      // Figuras
      yPosition = this.addFigurasSection(doc, cartaPorteData, yPosition, pageWidth, pageHeight);

      // Footer
      this.addFooter(doc, pageHeight);

      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      return {
        success: true,
        pdfBlob,
        pdfUrl
      };
    } catch (error) {
      console.error('Error generando PDF avanzado:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  private static addHeader(doc: jsPDF, pageWidth: number, yPosition: number) {
    // Fondo del header
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, yPosition - 10, pageWidth - 30, 35, 8, 8, 'F');
    
    // Borde sutil
    doc.setDrawColor(229, 229, 234);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, yPosition - 10, pageWidth - 30, 35, 8, 8, 'S');

    // Título principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(this.FONTS.title.size);
    doc.setTextColor(29, 29, 31);
    doc.text('Carta Porte', pageWidth / 2, yPosition + 5, { align: 'center' });

    // Subtítulo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(this.FONTS.body.size);
    doc.setTextColor(109, 109, 112);
    doc.text('Representación Impresa del Complemento', pageWidth / 2, yPosition + 15, { align: 'center' });

    // Fecha de generación
    const fechaGeneracion = new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generado: ${fechaGeneracion}`, pageWidth / 2, yPosition + 22, { align: 'center' });
  }

  private static addGeneralInfo(doc: jsPDF, data: CartaPorteData, yPosition: number, pageWidth: number): number {
    const folio = data.folio || `CP-${Date.now().toString().slice(-8)}`;
    
    this.addSectionTitle(doc, 'Información General', yPosition);
    yPosition += 10;

    const infoData = [
      ['Folio:', folio],
      ['Tipo CFDI:', data.tipoCfdi || 'Traslado'],
      ['Versión:', data.cartaPorteVersion || '3.1'],
      ['Transporte Internacional:', data.transporteInternacional ? 'Sí' : 'No'],
      ['Registro ISTMO:', data.registroIstmo ? 'Sí' : 'No']
    ];

    yPosition = this.addInfoGrid(doc, infoData, yPosition, pageWidth);
    return yPosition;
  }

  private static addConfigurationSection(doc: jsPDF, data: CartaPorteData, yPosition: number, pageWidth: number): number {
    this.addSectionTitle(doc, 'Emisor y Receptor', yPosition);
    yPosition += 10;

    const configData = [
      ['RFC Emisor:', data.rfcEmisor || 'No especificado'],
      ['Nombre Emisor:', data.nombreEmisor || 'No especificado'],
      ['RFC Receptor:', data.rfcReceptor || 'No especificado'],
      ['Nombre Receptor:', data.nombreReceptor || 'No especificado']
    ];

    yPosition = this.addInfoGrid(doc, configData, yPosition, pageWidth);
    return yPosition;
  }

  private static addUbicacionesSection(doc: jsPDF, data: CartaPorteData, yPosition: number, pageWidth: number, pageHeight: number): number {
    if (!data.ubicaciones || data.ubicaciones.length === 0) return yPosition;

    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    this.addSectionTitle(doc, 'Ubicaciones', yPosition);
    yPosition += 10;

    const ubicacionesData = data.ubicaciones.map((ubicacion, index) => [
      `${index + 1}`,
      ubicacion.tipo_ubicacion || 'N/A',
      ubicacion.nombre_remitente_destinatario || 'N/A',
      ubicacion.rfc_remitente_destinatario || 'N/A',
      `${ubicacion.domicilio?.estado || ''}, ${ubicacion.domicilio?.municipio || ''}`,
      ubicacion.domicilio?.codigo_postal || 'N/A'
    ]);

    // Usar autoTable correctamente
    const finalY = autoTable(doc, {
      head: [['#', 'Tipo', 'Nombre', 'RFC', 'Ubicación', 'CP']],
      body: ubicacionesData,
      startY: yPosition,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 122, 255],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [29, 29, 31]
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248]
      },
      margin: { left: 15, right: 15 }
    });

    return (finalY as any).finalY + 10;
  }

  private static addMercanciasSection(doc: jsPDF, data: CartaPorteData, yPosition: number, pageWidth: number, pageHeight: number): number {
    if (!data.mercancias || data.mercancias.length === 0) return yPosition;

    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    this.addSectionTitle(doc, 'Mercancías', yPosition);
    yPosition += 10;

    const mercanciasData = data.mercancias.map((mercancia, index) => [
      `${index + 1}`,
      mercancia.descripcion || 'N/A',
      mercancia.cantidad?.toString() || '0',
      mercancia.clave_unidad || 'N/A',
      mercancia.peso_kg?.toString() || '0',
      mercancia.valor_mercancia?.toString() || '0'
    ]);

    const finalY = autoTable(doc, {
      head: [['#', 'Descripción', 'Cantidad', 'Unidad', 'Peso (Kg)', 'Valor']],
      body: mercanciasData,
      startY: yPosition,
      theme: 'grid',
      headStyles: {
        fillColor: [52, 199, 89],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [29, 29, 31]
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248]
      },
      margin: { left: 15, right: 15 }
    });

    return (finalY as any).finalY + 10;
  }

  private static addAutotransporteSection(doc: jsPDF, data: CartaPorteData, yPosition: number, pageWidth: number, pageHeight: number): number {
    if (!data.autotransporte) return yPosition;

    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    this.addSectionTitle(doc, 'Autotransporte', yPosition);
    yPosition += 10;

    const autoData = [
      ['Placa Vehículo:', data.autotransporte.placa_vm || 'No especificado'],
      ['Año Modelo:', data.autotransporte.anio_modelo_vm?.toString() || 'No especificado'],
      ['Configuración:', data.autotransporte.config_vehicular || 'No especificado'],
      ['Permiso SCT:', data.autotransporte.num_permiso_sct || 'No especificado'],
      ['Aseguradora:', data.autotransporte.asegura_resp_civil || 'No especificado'],
      ['Póliza:', data.autotransporte.poliza_resp_civil || 'No especificado']
    ];

    yPosition = this.addInfoGrid(doc, autoData, yPosition, pageWidth);

    // Remolques si existen
    if (data.autotransporte.remolques && data.autotransporte.remolques.length > 0) {
      yPosition += 5;
      this.addSubsectionTitle(doc, 'Remolques/Semirremolques', yPosition);
      yPosition += 8;

      const remolquesData = data.autotransporte.remolques.map((remolque, index) => [
        `${index + 1}`,
        remolque.placa || 'N/A',
        remolque.subtipo_rem || 'N/A'
      ]);

      const finalY = autoTable(doc, {
        head: [['#', 'Placa', 'Subtipo']],
        body: remolquesData,
        startY: yPosition,
        theme: 'grid',
        headStyles: {
          fillColor: [88, 86, 214],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [29, 29, 31]
        },
        margin: { left: 15, right: 15 }
      });

      yPosition = (finalY as any).finalY + 10;
    }

    return yPosition;
  }

  private static addFigurasSection(doc: jsPDF, data: CartaPorteData, yPosition: number, pageWidth: number, pageHeight: number): number {
    if (!data.figuras || data.figuras.length === 0) return yPosition;

    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    this.addSectionTitle(doc, 'Figuras del Transporte', yPosition);
    yPosition += 10;

    const figurasData = data.figuras.map((figura, index) => [
      `${index + 1}`,
      figura.tipo_figura || 'N/A',
      figura.nombre_figura || 'N/A',
      figura.rfc_figura || 'N/A',
      figura.num_licencia || 'N/A'
    ]);

    const finalY = autoTable(doc, {
      head: [['#', 'Tipo', 'Nombre', 'RFC', 'Núm. Licencia']],
      body: figurasData,
      startY: yPosition,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 149, 0],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [29, 29, 31]
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248]
      },
      margin: { left: 15, right: 15 }
    });

    return (finalY as any).finalY + 10;
  }

  private static addSectionTitle(doc: jsPDF, title: string, yPosition: number) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(this.FONTS.subtitle.size);
    doc.setTextColor(29, 29, 31);
    doc.text(title, 15, yPosition);
    
    // Línea decorativa
    doc.setDrawColor(0, 122, 255);
    doc.setLineWidth(2);
    doc.line(15, yPosition + 2, 15 + doc.getTextWidth(title), yPosition + 2);
  }

  private static addSubsectionTitle(doc: jsPDF, title: string, yPosition: number) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(this.FONTS.heading.size);
    doc.setTextColor(109, 109, 112);
    doc.text(title, 15, yPosition);
  }

  private static addInfoGrid(doc: jsPDF, data: string[][], yPosition: number, pageWidth: number): number {
    const startY = yPosition;
    const itemHeight = 6;
    const leftColumn = 15;
    const rightColumn = pageWidth / 2 + 10;

    data.forEach((item, index) => {
      const column = index % 2 === 0 ? leftColumn : rightColumn;
      const adjustedY = Math.floor(index / 2) * itemHeight + startY;

      // Label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(this.FONTS.small.size);
      doc.setTextColor(109, 109, 112);
      doc.text(item[0], column, adjustedY);

      // Value
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(29, 29, 31);
      doc.text(item[1], column, adjustedY + 3);
    });

    return startY + Math.ceil(data.length / 2) * itemHeight + 5;
  }

  private static addFooter(doc: jsPDF, pageHeight: number) {
    const footerY = pageHeight - 15;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(this.FONTS.small.size);
    doc.setTextColor(109, 109, 112);
    
    // Línea separadora
    doc.setDrawColor(229, 229, 234);
    doc.setLineWidth(0.5);
    doc.line(15, footerY - 5, doc.internal.pageSize.width - 15, footerY - 5);
    
    doc.text('Documento generado automáticamente', 15, footerY);
    doc.text('Página 1', doc.internal.pageSize.width - 15, footerY, { align: 'right' });
  }

  static descargarPDF(blob: Blob, filename?: string) {
    const defaultFilename = `carta-porte-${new Date().toISOString().slice(0, 10)}.pdf`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || defaultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
