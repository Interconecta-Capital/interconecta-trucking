
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { CartaPorteData } from '@/types/cartaPorte';

export interface ProfessionalPDFOptions {
  xmlTimbrado?: string;
  datosTimbre?: {
    uuid?: string;
    selloDigital?: string;
    selloSAT?: string;
    cadenaOriginal?: string;
    fechaTimbrado?: string;
    idCCP?: string;
    noCertificadoSAT?: string;
    noCertificadoEmisor?: string;
  };
}

export interface ProfessionalPDFResult {
  success: boolean;
  pdfBlob?: Blob;
  pdfUrl?: string;
  pages?: number;
  error?: string;
}

export class CartaPorteProfessionalPDF {
  private static readonly COLORS = {
    primary: '#1a365d',     // Azul corporativo
    secondary: '#2d5a87',   // Azul secundario
    accent: '#4a90a4',      // Azul accent
    text: '#1a202c',        // Texto principal
    lightText: '#4a5568',   // Texto secundario
    border: '#e2e8f0',     // Bordes
    background: '#f7fafc',  // Fondo
    success: '#38a169',     // Verde para elementos válidos
    white: '#ffffff'
  };

  private static readonly LOGO_URL = '/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png';

  private static readonly LAYOUT = {
    margin: 20,
    headerHeight: 60,
    footerHeight: 40,
    sectionSpacing: 15,
    tableRowHeight: 8,
    qrSize: 76 // 2.7cm aprox
  };

  private static async fetchAsDataURL(url: string): Promise<string> {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Error leyendo archivo'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error cargando recurso como DataURL:', error);
      return '';
    }
  }

  private static async loadLogo(): Promise<string> {
    return this.fetchAsDataURL(this.LOGO_URL);
  }

  static async generateProfessionalPDF(
    cartaPorteData: CartaPorteData,
    options: ProfessionalPDFOptions = {}
  ): Promise<ProfessionalPDFResult> {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      let yPosition = this.LAYOUT.margin;
      let currentPage = 1;

      // Cargar logo de la empresa
      const logoData = await this.loadLogo();

      // Generar código QR si tenemos los datos necesarios
      let qrCodeDataURL = '';
      if (options.datosTimbre?.idCCP) {
        qrCodeDataURL = await this.generateQRCode(cartaPorteData, options.datosTimbre);
      }

      // 1. ENCABEZADO PRINCIPAL
      yPosition = this.addDocumentHeader(
        doc,
        pageWidth,
        yPosition,
        cartaPorteData,
        options.datosTimbre,
        qrCodeDataURL,
        logoData
      );

      // 2. INFORMACIÓN GENERAL DEL CFDI
      yPosition = this.addGeneralInfo(doc, pageWidth, yPosition, cartaPorteData, options.datosTimbre);

      // 3. EMISOR Y RECEPTOR
      yPosition = this.addEmisorReceptor(doc, pageWidth, yPosition, cartaPorteData);

      // 4. UBICACIONES (ORIGEN Y DESTINO)
      yPosition = this.addUbicaciones(doc, pageWidth, pageHeight, yPosition, cartaPorteData);

      // 5. MERCANCÍAS
      yPosition = this.addMercancias(doc, pageWidth, pageHeight, yPosition, cartaPorteData);

      // 6. AUTOTRANSPORTE
      yPosition = this.addAutotransporte(doc, pageWidth, pageHeight, yPosition, cartaPorteData);

      // 7. FIGURAS DE TRANSPORTE
      yPosition = this.addFigurasTransporte(doc, pageWidth, pageHeight, yPosition, cartaPorteData);

      // 8. PIE DE PÁGINA CON SELLOS DIGITALES
      this.addFooterWithSeals(doc, pageWidth, pageHeight, options.datosTimbre);

      // Numerar páginas
      this.addPageNumbers(doc);

      const pages = typeof (doc as any).getNumberOfPages === 'function'
        ? (doc as any).getNumberOfPages()
        : ((doc as any).internal?.pages?.length || 1);

      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      return {
        success: true,
        pdfBlob,
        pdfUrl,
        pages
      };
    } catch (error) {
      console.error('❌ Error generando PDF profesional:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  private static async generateQRCode(cartaPorteData: CartaPorteData, datosTimbre: any): Promise<string> {
    try {
      // Obtener fecha de origen (primera ubicación tipo Origen)
      const fechaOrigen = cartaPorteData.ubicaciones?.find(u => u.tipo_ubicacion === 'Origen')?.fecha_hora_salida_llegada;
      const fechaOrigFormatted = fechaOrigen ? new Date(fechaOrigen).toISOString().slice(0, 19) : '';
      
      // Fecha de timbrado
      const fechaTimbFormatted = datosTimbre.fechaTimbrado ? 
        new Date(datosTimbre.fechaTimbrado).toISOString().slice(0, 19) : '';

      // URL del SAT para verificación
      const qrUrl = `https://verificacfdi.facturaelectronica.sat.gob.mx/verificaccp/default.aspx?&IdCCP=${datosTimbre.idCCP}&FechaOrig=${fechaOrigFormatted}&FechaTimb=${fechaTimbFormatted}`;
      
      return await QRCode.toDataURL(qrUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    } catch (error) {
      console.error('Error generando QR:', error);
      return '';
    }
  }

  private static addDocumentHeader(
    doc: jsPDF,
    pageWidth: number,
    yPosition: number,
    cartaPorteData: CartaPorteData,
    datosTimbre?: any,
    qrCode?: string,
    logo?: string
  ): number {
    // Fondo del header
    doc.setFillColor(247, 250, 252); // background
    doc.rect(this.LAYOUT.margin, yPosition - 5, pageWidth - (this.LAYOUT.margin * 2), this.LAYOUT.headerHeight, 'F');
    
    // Borde del header
    doc.setDrawColor(226, 232, 240); // border
    doc.setLineWidth(0.5);
    doc.rect(this.LAYOUT.margin, yPosition - 5, pageWidth - (this.LAYOUT.margin * 2), this.LAYOUT.headerHeight, 'S');

    // Logo
    if (logo) {
      try {
        doc.addImage(logo, 'PNG', this.LAYOUT.margin + 2, yPosition, 30, 15);
      } catch (error) {
        console.error('Error agregando logo al PDF:', error);
      }
    }

    // Título principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(26, 54, 93); // primary
    doc.text('REPRESENTACIÓN IMPRESA DE CFDI DE TRASLADO', pageWidth / 2, yPosition + 10, { align: 'center' });
    doc.text('CON COMPLEMENTO CARTA PORTE 3.1', pageWidth / 2, yPosition + 20, { align: 'center' });

    // Datos fiscales clave
    const fechaEmision = cartaPorteData.ubicaciones?.find(u => u.tipo_ubicacion === 'Origen')?.fecha_hora_salida_llegada;
    if (datosTimbre) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(26, 32, 44); // text

      let infoY = yPosition + 35;
      if (datosTimbre.uuid) {
        doc.text(`UUID (Folio Fiscal): ${datosTimbre.uuid}`, this.LAYOUT.margin + 5, infoY);
        infoY += 5;
      }
      if (datosTimbre.idCCP) {
        doc.text(`IdCCP: ${datosTimbre.idCCP}`, this.LAYOUT.margin + 5, infoY);
        infoY += 5;
      }
      if (cartaPorteData.folio) {
        doc.text(`Folio Interno: ${cartaPorteData.folio}`, this.LAYOUT.margin + 5, infoY);
        infoY += 5;
      }
      if (datosTimbre.noCertificadoSAT) {
        doc.text(`No. Certificado SAT: ${datosTimbre.noCertificadoSAT}`, this.LAYOUT.margin + 5, infoY);
        infoY += 5;
      }
      if (datosTimbre.noCertificadoEmisor) {
        doc.text(`No. Certificado Emisor: ${datosTimbre.noCertificadoEmisor}`, this.LAYOUT.margin + 5, infoY);
        infoY += 5;
      }
      if (fechaEmision) {
        doc.text(`Fecha Emisión: ${new Date(fechaEmision).toLocaleString('es-MX')}`, this.LAYOUT.margin + 5, infoY);
        infoY += 5;
      }
      if (datosTimbre.fechaTimbrado) {
        doc.text(`Fecha de Timbrado: ${new Date(datosTimbre.fechaTimbrado).toLocaleString('es-MX')}`, this.LAYOUT.margin + 5, infoY);
      }
    } else if (cartaPorteData.folio || fechaEmision) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(26, 32, 44);
      let infoY = yPosition + 35;
      if (cartaPorteData.folio) {
        doc.text(`Folio Interno: ${cartaPorteData.folio}`, this.LAYOUT.margin + 5, infoY);
        infoY += 5;
      }
      if (fechaEmision) {
        doc.text(`Fecha Emisión: ${new Date(fechaEmision).toLocaleString('es-MX')}`, this.LAYOUT.margin + 5, infoY);
      }
    }

    // Código QR en la esquina superior derecha
    if (qrCode) {
      try {
        doc.addImage(qrCode, 'PNG', pageWidth - this.LAYOUT.margin - this.LAYOUT.qrSize, yPosition, this.LAYOUT.qrSize, this.LAYOUT.qrSize);
      } catch (error) {
        console.error('Error agregando QR al PDF:', error);
      }
    }

    return yPosition + this.LAYOUT.headerHeight + this.LAYOUT.sectionSpacing;
  }

  private static addGeneralInfo(doc: jsPDF, pageWidth: number, yPosition: number, cartaPorteData: CartaPorteData, datosTimbre?: any): number {
    this.addSectionTitle(doc, 'INFORMACIÓN GENERAL DEL CFDI', yPosition);
    yPosition += 12;

    // Calcular totales
    const totalDistancia = cartaPorteData.ubicaciones?.reduce((sum, ub) => sum + (ub.distancia_recorrida || 0), 0) || 0;
    const totalMercancias = cartaPorteData.mercancias?.length || 0;
    const pesoTotal = cartaPorteData.mercancias?.reduce((sum, m) => sum + (m.peso_kg || 0), 0) || 0;

    const infoData = [
      ['Tipo de Comprobante:', 'T - Traslado'],
      ['Folio Interno:', cartaPorteData.folio || 'N/A'],
      ['Total Distancia Recorrida:', `${totalDistancia} km`],
      ['Número Total de Mercancías:', totalMercancias.toString()],
      ['Peso Bruto Total:', `${pesoTotal} kg`],
      ['Versión Carta Porte:', cartaPorteData.cartaPorteVersion || '3.1']
    ];

    yPosition = this.addInfoTable(doc, pageWidth, yPosition, infoData);
    return yPosition + this.LAYOUT.sectionSpacing;
  }

  private static addEmisorReceptor(doc: jsPDF, pageWidth: number, yPosition: number, cartaPorteData: CartaPorteData): number {
    this.addSectionTitle(doc, 'EMISOR Y RECEPTOR', yPosition);
    yPosition += 12;

    const tableData = [
      ['CONCEPTO', 'EMISOR', 'RECEPTOR'],
      ['Razón Social', cartaPorteData.nombreEmisor || 'N/A', cartaPorteData.nombreReceptor || 'N/A'],
      ['RFC', cartaPorteData.rfcEmisor || 'N/A', cartaPorteData.rfcReceptor || 'N/A']
    ];

    yPosition = this.addTable(doc, pageWidth, yPosition, tableData, true);
    return yPosition + this.LAYOUT.sectionSpacing;
  }

  private static addUbicaciones(doc: jsPDF, pageWidth: number, pageHeight: number, yPosition: number, cartaPorteData: CartaPorteData): number {
    yPosition = this.checkPageBreak(doc, yPosition, pageHeight, 60);
    
    this.addSectionTitle(doc, 'UBICACIONES (ORIGEN Y DESTINO)', yPosition);
    yPosition += 12;

    if (!cartaPorteData.ubicaciones || cartaPorteData.ubicaciones.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('No hay ubicaciones registradas', this.LAYOUT.margin + 5, yPosition);
      return yPosition + 15;
    }

    const headers = ['Tipo', 'ID Ubicación', 'Nombre/RFC', 'Domicilio', 'Fecha/Hora', 'Distancia'];
    const tableData = [headers];

    cartaPorteData.ubicaciones.forEach(ubicacion => {
      const domicilio = ubicacion.domicilio ? 
        `${ubicacion.domicilio.calle} ${ubicacion.domicilio.numero_exterior}, ${ubicacion.domicilio.colonia}, ${ubicacion.domicilio.municipio}, ${ubicacion.domicilio.estado}, CP ${ubicacion.domicilio.codigo_postal}` : 
        'N/A';
      
      const nombreRFC = ubicacion.nombre_remitente_destinatario ? 
        `${ubicacion.nombre_remitente_destinatario}\nRFC: ${ubicacion.rfc_remitente_destinatario || 'N/A'}` : 
        'N/A';

      const fechaHora = ubicacion.fecha_hora_salida_llegada ? 
        new Date(ubicacion.fecha_hora_salida_llegada).toLocaleString('es-MX') : 
        'N/A';

      const distancia = ubicacion.distancia_recorrida ? `${ubicacion.distancia_recorrida} km` : 'N/A';

      tableData.push([
        ubicacion.tipo_ubicacion || 'N/A',
        ubicacion.id_ubicacion || 'N/A',
        nombreRFC,
        domicilio,
        fechaHora,
        distancia
      ]);
    });

    yPosition = this.addTable(doc, pageWidth, yPosition, tableData, true, 8);
    return yPosition + this.LAYOUT.sectionSpacing;
  }

  private static addMercancias(doc: jsPDF, pageWidth: number, pageHeight: number, yPosition: number, cartaPorteData: CartaPorteData): number {
    yPosition = this.checkPageBreak(doc, yPosition, pageHeight, 60);
    
    this.addSectionTitle(doc, 'MERCANCÍAS TRANSPORTADAS', yPosition);
    yPosition += 12;

    if (!cartaPorteData.mercancias || cartaPorteData.mercancias.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('No hay mercancías registradas', this.LAYOUT.margin + 5, yPosition);
      return yPosition + 15;
    }

    const headers = ['BienesTransp', 'Descripción Completa', 'Cantidad', 'Unidad', 'Peso (Kg)', 'Valor'];
    const tableData = [headers];

    cartaPorteData.mercancias.forEach(mercancia => {
      tableData.push([
        mercancia.bienes_transp || 'N/A',
        mercancia.descripcion || 'N/A',
        mercancia.cantidad?.toString() || '0',
        mercancia.clave_unidad || 'N/A',
        mercancia.peso_kg?.toString() || '0',
        `$${mercancia.valor_mercancia || 0} ${mercancia.moneda || 'MXN'}`
      ]);
    });

    yPosition = this.addTable(doc, pageWidth, yPosition, tableData, true, 8);
    return yPosition + this.LAYOUT.sectionSpacing;
  }

  private static addAutotransporte(doc: jsPDF, pageWidth: number, pageHeight: number, yPosition: number, cartaPorteData: CartaPorteData): number {
    yPosition = this.checkPageBreak(doc, yPosition, pageHeight, 40);
    
    this.addSectionTitle(doc, 'AUTOTRANSPORTE', yPosition);
    yPosition += 12;

    if (!cartaPorteData.autotransporte) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('No hay datos de autotransporte registrados', this.LAYOUT.margin + 5, yPosition);
      return yPosition + 15;
    }

    const auto = cartaPorteData.autotransporte;
    const autoData = [
      ['Tipo de Permiso SCT:', auto.perm_sct || 'N/A'],
      ['Número de Permiso SCT:', auto.num_permiso_sct || 'N/A'],
      ['Configuración Vehicular:', auto.config_vehicular || 'N/A'],
      ['Placa del Vehículo:', auto.placa_vm || 'N/A'],
      ['Año del Modelo:', auto.anio_modelo_vm?.toString() || 'N/A'],
      ['Peso Bruto Vehicular:', `${auto.peso_bruto_vehicular || 0} toneladas`],
      ['Aseguradora:', auto.asegura_resp_civil || 'N/A'],
      ['Número de Póliza:', auto.poliza_resp_civil || 'N/A']
    ];

    yPosition = this.addInfoTable(doc, pageWidth, yPosition, autoData);
    return yPosition + this.LAYOUT.sectionSpacing;
  }

  private static addFigurasTransporte(doc: jsPDF, pageWidth: number, pageHeight: number, yPosition: number, cartaPorteData: CartaPorteData): number {
    yPosition = this.checkPageBreak(doc, yPosition, pageHeight, 40);
    
    this.addSectionTitle(doc, 'FIGURAS DE TRANSPORTE', yPosition);
    yPosition += 12;

    if (!cartaPorteData.figuras || cartaPorteData.figuras.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('No hay figuras de transporte registradas', this.LAYOUT.margin + 5, yPosition);
      return yPosition + 15;
    }

    const headers = ['Tipo de Figura', 'Nombre', 'RFC', 'Número de Licencia'];
    const tableData = [headers];

    cartaPorteData.figuras.forEach(figura => {
      tableData.push([
        figura.tipo_figura || 'N/A',
        figura.nombre_figura || 'N/A',
        figura.rfc_figura || 'N/A',
        figura.num_licencia || 'N/A'
      ]);
    });

    yPosition = this.addTable(doc, pageWidth, yPosition, tableData, true);
    return yPosition + this.LAYOUT.sectionSpacing;
  }

  private static addFooterWithSeals(doc: jsPDF, pageWidth: number, pageHeight: number, datosTimbre?: any): void {
    const footerY = pageHeight - this.LAYOUT.footerHeight - 10;
    
    // Línea separadora
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(this.LAYOUT.margin, footerY - 5, pageWidth - this.LAYOUT.margin, footerY - 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(26, 54, 93);
    doc.text('SELLOS DIGITALES Y VALIDACIÓN FISCAL', this.LAYOUT.margin, footerY);

    if (datosTimbre) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(26, 32, 44);
      
      let sealY = footerY + 8;
      
      if (datosTimbre.selloDigital) {
        doc.text('Sello Digital del CFDI:', this.LAYOUT.margin, sealY);
        const sello = doc.splitTextToSize(datosTimbre.selloDigital, pageWidth - this.LAYOUT.margin * 2);
        doc.text(sello, this.LAYOUT.margin, sealY + 3);
        sealY += 8;
      }
      
      if (datosTimbre.selloSAT) {
        doc.text('Sello Digital del SAT:', this.LAYOUT.margin, sealY);
        const selloSAT = doc.splitTextToSize(datosTimbre.selloSAT, pageWidth - this.LAYOUT.margin * 2);
        doc.text(selloSAT, this.LAYOUT.margin, sealY + 3);
        sealY += 8;
      }
      
      if (datosTimbre.cadenaOriginal) {
        doc.text('Cadena Original del Complemento:', this.LAYOUT.margin, sealY);
        const cadena = doc.splitTextToSize(datosTimbre.cadenaOriginal, pageWidth - this.LAYOUT.margin * 2);
        doc.text(cadena, this.LAYOUT.margin, sealY + 3);
      }
    }

    // Leyenda fiscal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(56, 161, 105); // success
    doc.text('Este documento es una representación impresa de un CFDI', pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  private static addSectionTitle(doc: jsPDF, title: string, yPosition: number): void {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(26, 54, 93); // primary
    doc.text(title, this.LAYOUT.margin, yPosition);
    
    // Línea decorativa
    doc.setDrawColor(74, 144, 164); // accent
    doc.setLineWidth(1);
    doc.line(this.LAYOUT.margin, yPosition + 2, this.LAYOUT.margin + doc.getTextWidth(title), yPosition + 2);
  }

  private static addInfoTable(doc: jsPDF, pageWidth: number, yPosition: number, data: string[][]): number {
    const columnWidth = (pageWidth - (this.LAYOUT.margin * 2)) / 2;
    
    data.forEach((row, index) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(74, 85, 104); // lightText
      doc.text(row[0], this.LAYOUT.margin + 5, yPosition);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(26, 32, 44); // text
      doc.text(row[1], this.LAYOUT.margin + columnWidth, yPosition);
      
      yPosition += 5;
    });
    
    return yPosition;
  }

  private static addTable(doc: jsPDF, pageWidth: number, yPosition: number, data: string[][], hasHeader: boolean = false, fontSize: number = 9): number {
    const tableWidth = pageWidth - (this.LAYOUT.margin * 2);
    const columnWidth = tableWidth / data[0].length;
    const rowHeight = this.LAYOUT.tableRowHeight;
    
    data.forEach((row, rowIndex) => {
      const isHeader = hasHeader && rowIndex === 0;
      
      if (isHeader) {
        // Fondo del header
        doc.setFillColor(26, 54, 93); // primary
        doc.rect(this.LAYOUT.margin, yPosition - rowHeight + 2, tableWidth, rowHeight, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(fontSize);
        doc.setTextColor(255, 255, 255); // white
      } else {
        // Fila alternada
        if (rowIndex % 2 === 0) {
          doc.setFillColor(247, 250, 252); // background
          doc.rect(this.LAYOUT.margin, yPosition - rowHeight + 2, tableWidth, rowHeight, 'F');
        }
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fontSize - 1);
        doc.setTextColor(26, 32, 44); // text
      }
      
      // Bordes
      doc.setDrawColor(226, 232, 240); // border
      doc.setLineWidth(0.3);
      doc.rect(this.LAYOUT.margin, yPosition - rowHeight + 2, tableWidth, rowHeight, 'S');
      
      // Contenido de las celdas
      row.forEach((cell, colIndex) => {
        const cellX = this.LAYOUT.margin + (colIndex * columnWidth) + 2;
        const cellText = cell.length > 30 ? cell.substring(0, 27) + '...' : cell;
        doc.text(cellText, cellX, yPosition - 2);
        
        // Líneas verticales
        if (colIndex < row.length - 1) {
          doc.line(this.LAYOUT.margin + ((colIndex + 1) * columnWidth), yPosition - rowHeight + 2, 
                  this.LAYOUT.margin + ((colIndex + 1) * columnWidth), yPosition + 2);
        }
      });
      
      yPosition += rowHeight;
    });
    
    return yPosition;
  }

  private static addPageNumbers(doc: jsPDF): void {
    const totalPages = (doc as any).getNumberOfPages ? (doc as any).getNumberOfPages() : (doc.internal.pages?.length || 1);
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(74, 85, 104);
      const text = `Página ${i} de ${totalPages}`;
      doc.text(text, doc.internal.pageSize.width - this.LAYOUT.margin, doc.internal.pageSize.height - 5, { align: 'right' });
    }
  }

  private static checkPageBreak(doc: jsPDF, yPosition: number, pageHeight: number, requiredSpace: number): number {
    if (yPosition + requiredSpace > pageHeight - this.LAYOUT.footerHeight - 20) {
      doc.addPage();
      return this.LAYOUT.margin + 10;
    }
    return yPosition;
  }

  static downloadPDF(blob: Blob, filename?: string): void {
    const defaultFilename = `carta-porte-profesional-${new Date().toISOString().slice(0, 10)}.pdf`;
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
